package com.lastmile.deliverytracker.assignment.service;

import com.lastmile.deliverytracker.assignment.entity.AssignmentStatus;
import com.lastmile.deliverytracker.assignment.entity.OrderAssignment;
import com.lastmile.deliverytracker.assignment.repository.OrderAssignmentRepository;
import com.lastmile.deliverytracker.assignment.strategy.AssignmentStrategy;
import com.lastmile.deliverytracker.auth.entity.DeliveryAgent;
import com.lastmile.deliverytracker.auth.enums.AvailabilityStatus;
import com.lastmile.deliverytracker.auth.repository.DeliveryAgentRepository;
import com.lastmile.deliverytracker.notification.event.AssignmentCreatedEvent;
import com.lastmile.deliverytracker.pricing.entity.Area;
import com.lastmile.deliverytracker.pricing.entity.Zone;
import com.lastmile.deliverytracker.pricing.repository.AreaRepository;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import com.lastmile.deliverytracker.tracking.entity.TrackingHistory;
import com.lastmile.deliverytracker.tracking.repository.TrackingHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service orchestrating delivery agent assignments.
 * Fetches candidate agents, applies the configured routing/assignment strategy,
 * and publishes assignment lifecycle events.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AssignmentServiceImpl implements AssignmentService {

    private static final Logger log = LoggerFactory.getLogger(AssignmentServiceImpl.class);

    private final AreaRepository areaRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final OrderAssignmentRepository orderAssignmentRepository;
    private final TrackingHistoryRepository trackingHistoryRepository;
    private final AssignmentStrategy assignmentStrategy;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public OrderAssignment assignShipment(Shipment shipment) {
        log.debug("Initiating assignment orchestration for shipment: {}", shipment.getTrackingNumber());

        String pickupPincode = shipment.getPickupPincode();

        // 1. Resolve pickup area constraints (re-uses pre-resolved references to prevent duplicate query scans)
        Area pickupArea = shipment.getPickupArea();
        if (pickupArea == null) {
            pickupArea = areaRepository.findByPincode(pickupPincode)
                    .orElseThrow(() -> new IllegalStateException("Pickup area not found for pincode: " + pickupPincode));
        }
        Zone pickupZone = pickupArea.getZone();

        // 2. Fetch active available delivery agents
        List<DeliveryAgent> availableAgents = deliveryAgentRepository.findByAvailabilityStatus(AvailabilityStatus.AVAILABLE);
        if (availableAgents.isEmpty()) {
            throw new IllegalStateException("No available delivery agents found for assignment.");
        }

        // 3. Filter candidates by zone (currently acts as a pass-through until Agent-Zone mappings are added)
        List<DeliveryAgent> zoneAgents = availableAgents;
        if (zoneAgents.isEmpty()) {
            throw new IllegalStateException("No available delivery agents found in pickup zone: " + pickupZone.getZoneName());
        }

        // 4. Delegate selection to pluggable assignment strategy
        DeliveryAgent nearestAgent = assignmentStrategy.selectAgent(shipment, zoneAgents)
                .orElseThrow(() -> new IllegalStateException("Unable to determine nearest delivery agent."));

        log.info("Delivery agent {} selected for shipment {}", nearestAgent.getUser().getId(), shipment.getTrackingNumber());

        // 5. Build order assignment record
        OrderAssignment assignment = OrderAssignment.builder()
                .shipment(shipment)
                .deliveryAgent(nearestAgent)
                .assignmentStatus(AssignmentStatus.ASSIGNED)
                .assignedAt(LocalDateTime.now())
                .build();

        // 6. Set agent availability state to BUSY
        nearestAgent.setAvailabilityStatus(AvailabilityStatus.BUSY);

        // 7. Update base shipment state to ASSIGNED
        shipment.setShipmentStatus(ShipmentStatus.ASSIGNED);

        // 8. Persist assignment details
        OrderAssignment savedAssignment = orderAssignmentRepository.save(assignment);
        log.debug("OrderAssignment saved successfully for shipment: {}", shipment.getTrackingNumber());

        // 9. Record tracking history transition checkpoint
        TrackingHistory trackingHistory = TrackingHistory.builder()
                .shipment(shipment)
                .shipmentStatus(ShipmentStatus.ASSIGNED)
                .location((shipment.getPickupArea() != null) ? shipment.getPickupArea().getAreaName() + ", " + shipment.getPickupArea().getCity() : "Warehouse")
                .remarks("Delivery agent [" + nearestAgent.getUser().getFullName() + "] assigned to shipment")
                .build();
        trackingHistoryRepository.save(trackingHistory);
        log.debug("TrackingHistory event ASSIGNED saved successfully for shipment: {}", shipment.getTrackingNumber());

        // 10. Publish event to decouple user/agent notifications from orchestration logic
        eventPublisher.publishEvent(new AssignmentCreatedEvent(this, shipment, nearestAgent));

        return savedAssignment;
    }
}

