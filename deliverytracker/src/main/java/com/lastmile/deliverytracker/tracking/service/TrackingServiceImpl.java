package com.lastmile.deliverytracker.tracking.service;

import com.lastmile.deliverytracker.notification.event.TrackingUpdatedEvent;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import com.lastmile.deliverytracker.shipment.exception.ShipmentNotFoundException;
import com.lastmile.deliverytracker.shipment.repository.ShipmentRepository;
import com.lastmile.deliverytracker.tracking.dto.request.UpdateTrackingRequest;
import com.lastmile.deliverytracker.tracking.dto.response.TrackingHistoryResponse;
import com.lastmile.deliverytracker.tracking.dto.response.TrackingTimelineResponse;
import com.lastmile.deliverytracker.tracking.entity.TrackingHistory;
import com.lastmile.deliverytracker.tracking.exception.TrackingNotFoundException;
import com.lastmile.deliverytracker.tracking.mapper.TrackingMapper;
import com.lastmile.deliverytracker.tracking.repository.TrackingHistoryRepository;
import com.lastmile.deliverytracker.assignment.entity.AssignmentStatus;
import com.lastmile.deliverytracker.assignment.repository.OrderAssignmentRepository;
import com.lastmile.deliverytracker.auth.entity.DeliveryAgent;
import com.lastmile.deliverytracker.auth.enums.AvailabilityStatus;
import com.lastmile.deliverytracker.auth.repository.DeliveryAgentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service implementation managing shipment status history logs.
 *
 * <p><strong>Design Constraint:</strong> This service ensures tracking histories are strictly
 * append-only. Existing logs are never modified, establishing a reliable logging system.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TrackingServiceImpl implements TrackingService {

    private static final Logger log = LoggerFactory.getLogger(TrackingServiceImpl.class);

    private final ShipmentRepository shipmentRepository;
    private final TrackingHistoryRepository trackingHistoryRepository;
    private final TrackingMapper trackingMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final OrderAssignmentRepository orderAssignmentRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;

    /**
     * Updates the status of a shipment by appending a new checkpoint tracking history record.
     * Implements write transactional boundaries.
     */
    @Override
    @Transactional
    public TrackingHistoryResponse updateTracking(String trackingNumber, UpdateTrackingRequest request) {
        log.info("Updating tracking status for shipment {} to {}", trackingNumber, request.getShipmentStatus());

        // 1. Fetch Shipment and Validate exists
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ShipmentNotFoundException("Shipment not found with tracking number: " + trackingNumber));

        String actor = "SYSTEM";
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                actor = auth.getName();
            }
        } catch (Exception e) {
            // ignore
        }

        // 2. Create new TrackingHistory record (never update existing history - append-only constraint)
        TrackingHistory trackingHistory = TrackingHistory.builder()
                .shipment(shipment)
                .shipmentStatus(request.getShipmentStatus())
                .location(request.getLocation())
                .remarks(request.getRemarks())
                .actor(actor)
                .build();

        // 3. Update Shipment status
        shipment.setShipmentStatus(request.getShipmentStatus());
        shipmentRepository.save(shipment);

        // 3b. Update Agent and Assignment statuses if terminal
        if (request.getShipmentStatus() == ShipmentStatus.DELIVERED
                || request.getShipmentStatus() == ShipmentStatus.FAILED
                || request.getShipmentStatus() == ShipmentStatus.CANCELLED) {
            orderAssignmentRepository.findByShipment(shipment).stream()
                    .filter(assignment -> assignment.getAssignmentStatus() == AssignmentStatus.ASSIGNED)
                    .forEach(assignment -> {
                        if (request.getShipmentStatus() == ShipmentStatus.DELIVERED) {
                            assignment.setAssignmentStatus(AssignmentStatus.DELIVERED);
                        } else {
                            assignment.setAssignmentStatus(AssignmentStatus.REASSIGNED);
                        }
                        orderAssignmentRepository.save(assignment);
                        DeliveryAgent agent = assignment.getDeliveryAgent();
                        if (agent != null) {
                            agent.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
                            deliveryAgentRepository.save(agent);
                        }
                    });
        }

        // 4. Save TrackingHistory
        TrackingHistory savedHistory = trackingHistoryRepository.save(trackingHistory);
        log.debug("Successfully saved append-only tracking history record for shipment: {}", trackingNumber);

        // 5. Publish TrackingUpdatedEvent to notify downstream systems asynchronously
        eventPublisher.publishEvent(new TrackingUpdatedEvent(this, shipment, savedHistory));

        // 6. Return response DTO
        return trackingMapper.toResponse(savedHistory);
    }

    /**
     * Retrieves the entire chronological timeline of a shipment's logistical lifecycle events.
     */
    @Override
    public TrackingTimelineResponse getTimeline(String trackingNumber) {
        log.debug("Retrieving tracking timeline for shipment: {}", trackingNumber);

        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ShipmentNotFoundException("Shipment not found with tracking number: " + trackingNumber));

        List<TrackingHistory> historyList = trackingHistoryRepository.findByShipmentOrderByUpdatedAtAsc(shipment);

        List<TrackingHistoryResponse> historyResponses = historyList.stream()
                .map(trackingMapper::toResponse)
                .toList();

        return trackingMapper.toTimelineResponse(shipment, historyResponses);
    }

    /**
     * Fetches the latest recorded status event for a specific shipment.
     */
    @Override
    public TrackingHistoryResponse getLatestStatus(String trackingNumber) {
        log.debug("Retrieving latest tracking status for shipment: {}", trackingNumber);

        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ShipmentNotFoundException("Shipment not found with tracking number: " + trackingNumber));

        TrackingHistory latestHistory = trackingHistoryRepository.findTopByShipmentOrderByUpdatedAtDesc(shipment)
                .orElseThrow(() -> new TrackingNotFoundException("No tracking history found for shipment: " + trackingNumber));

        return trackingMapper.toResponse(latestHistory);
    }
}

