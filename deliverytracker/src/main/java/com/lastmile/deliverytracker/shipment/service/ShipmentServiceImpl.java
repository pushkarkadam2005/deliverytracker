package com.lastmile.deliverytracker.shipment.service;

import com.lastmile.deliverytracker.assignment.service.AssignmentService;
import com.lastmile.deliverytracker.auth.entity.CustomerProfile;
import com.lastmile.deliverytracker.auth.entity.User;
import com.lastmile.deliverytracker.auth.repository.CustomerProfileRepository;
import com.lastmile.deliverytracker.auth.repository.UserRepository;
import com.lastmile.deliverytracker.notification.event.PriceCalculatedEvent;
import com.lastmile.deliverytracker.notification.event.ShipmentCreatedEvent;
import com.lastmile.deliverytracker.pricing.entity.Area;
import com.lastmile.deliverytracker.pricing.entity.RateCard;
import com.lastmile.deliverytracker.pricing.repository.AreaRepository;
import com.lastmile.deliverytracker.pricing.repository.RateCardRepository;
import com.lastmile.deliverytracker.pricing.calculator.PricingCalculator;
import com.lastmile.deliverytracker.pricing.entity.Zone;
import com.lastmile.deliverytracker.pricing.service.PricingService;
import com.lastmile.deliverytracker.pricing.exception.AreaNotFoundException;
import com.lastmile.deliverytracker.pricing.exception.RateCardNotFoundException;
import com.lastmile.deliverytracker.auth.exception.CustomerNotFoundException;
import com.lastmile.deliverytracker.shipment.enums.OrderType;
import java.math.BigDecimal;
import java.math.RoundingMode;
import com.lastmile.deliverytracker.shipment.dto.request.CreateShipmentRequest;
import com.lastmile.deliverytracker.shipment.dto.response.ShipmentResponse;
import com.lastmile.deliverytracker.shipment.dto.response.ShipmentSummaryResponse;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import com.lastmile.deliverytracker.shipment.exception.ShipmentNotFoundException;
import com.lastmile.deliverytracker.shipment.mapper.ShipmentMapper;
import com.lastmile.deliverytracker.shipment.repository.ShipmentRepository;
import com.lastmile.deliverytracker.tracking.entity.TrackingHistory;
import com.lastmile.deliverytracker.tracking.repository.TrackingHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.UUID;

/**
 * Service implementation orchestrating the Shipment lifecycle.
 * Manages registration, cancels orders, retrieves user-scoped orders,
 * and publishes lifecycle application events to decouple submodules.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ShipmentServiceImpl implements ShipmentService {

    private static final Logger log = LoggerFactory.getLogger(ShipmentServiceImpl.class);

    private final ShipmentRepository shipmentRepository;
    private final ShipmentMapper shipmentMapper;
    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final AreaRepository areaRepository;
    private final PricingService pricingService;
    private final AssignmentService assignmentService;
    private final TrackingHistoryRepository trackingHistoryRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final PricingCalculator pricingCalculator;
    private final RateCardRepository rateCardRepository;
    private final com.lastmile.deliverytracker.assignment.repository.OrderAssignmentRepository orderAssignmentRepository;

    /**
     * Creates a new shipment order, triggers pricing calculations, assigns the nearest available agent,
     * and publishes events to update notifications.
     */
    @Override
    @Transactional
    public ShipmentResponse createShipment(CreateShipmentRequest request) {
        log.debug("Received createShipment request for receiver: {}", request.getReceiverName());

        // 1. Resolve currently authenticated customer
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        log.debug("Creating shipment for authenticated user: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + email));

        CustomerProfile customer = customerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Customer profile not found for user: " + email));

        // 2. Validate region availability constraints
        Area pickupArea = areaRepository.findByPincode(request.getPickupPincode())
                .orElseThrow(() -> new AreaNotFoundException("Pickup area not found for pincode: " + request.getPickupPincode()));
        Area deliveryArea = areaRepository.findByPincode(request.getDeliveryPincode())
                .orElseThrow(() -> new AreaNotFoundException("Delivery area not found for pincode: " + request.getDeliveryPincode()));

        // 3. Map DTO to domain model
        Shipment shipment = shipmentMapper.toEntity(request);

        // 4. Initialize shipment tracking status metadata
        shipment.setShipmentStatus(ShipmentStatus.CREATED);
        String trackingNumber = generateTrackingNumber();
        log.debug("Generated tracking number: {}", trackingNumber);
        shipment.setTrackingNumber(trackingNumber);

        // 5. Link spatial areas and customer profiles
        shipment.setCustomer(customer);
        shipment.setPickupArea(pickupArea);
        shipment.setDeliveryArea(deliveryArea);

        // 7. Save initial state of the shipment
        Shipment savedShipment = shipmentRepository.save(shipment);
        log.info("Base shipment created with tracking number: {}", savedShipment.getTrackingNumber());

        // 8. Record audit log checklist
        TrackingHistory createdEvent = TrackingHistory.builder()
                .shipment(savedShipment)
                .shipmentStatus(ShipmentStatus.CREATED)
                .location(pickupArea.getAreaName() + ", " + pickupArea.getCity())
                .remarks("Shipment created successfully and registered on platform")
                .build();
        trackingHistoryRepository.save(createdEvent);
        log.debug("TrackingHistory event CREATED saved successfully for shipment: {}", savedShipment.getTrackingNumber());

        // 9. Emit registration notification event
        eventPublisher.publishEvent(new ShipmentCreatedEvent(this, savedShipment, user));

        // 10. Process pricing charges
        pricingService.calculateShipmentCharges(savedShipment);

        // 11. Emit price computation event
        eventPublisher.publishEvent(new PriceCalculatedEvent(this, savedShipment, user));

        // 12. Run routing allocation algorithms
        assignmentService.assignShipment(savedShipment);

        // 13. Save finalized assignment state changes
        Shipment finalShipment = shipmentRepository.save(savedShipment);
        log.info("Shipment workflow completed successfully for tracking: {}", finalShipment.getTrackingNumber());

        return shipmentMapper.toResponse(finalShipment);
    }

    /**
     * Resolves shipment information based on the unique tracking number.
     */
    @Override
    public ShipmentResponse getShipmentByTrackingNumber(String trackingNumber) {
        log.debug("Fetching shipment by tracking number: {}", trackingNumber);

        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ShipmentNotFoundException(
                        "Shipment not found with tracking number: " + trackingNumber));

        ShipmentResponse response = shipmentMapper.toResponse(shipment);

        orderAssignmentRepository.findByShipment(shipment).stream()
                .filter(assignment -> assignment.getAssignmentStatus() != com.lastmile.deliverytracker.assignment.entity.AssignmentStatus.REASSIGNED 
                        && assignment.getAssignmentStatus() != com.lastmile.deliverytracker.assignment.entity.AssignmentStatus.REJECTED)
                .max(java.util.Comparator.comparing(com.lastmile.deliverytracker.assignment.entity.OrderAssignment::getId))
                .ifPresent(assignment -> {
                    com.lastmile.deliverytracker.auth.entity.DeliveryAgent agent = assignment.getDeliveryAgent();
                    if (agent != null) {
                        response.setAgentDetails(ShipmentResponse.AgentDetailsResponse.builder()
                                .name(agent.getUser().getFullName())
                                .phone(agent.getPhone())
                                .vehicle(agent.getVehicleNumber())
                                .rating("4.8")
                                .build());
                    }
                });

        return response;
    }

    /**
     * Retrieves a paginated list of shipment orders created by the authenticated customer.
     */
    @Override
    public Page<ShipmentSummaryResponse> getMyShipments(Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        log.debug("Fetching shipments for authenticated user: {}, page: {}", email, pageable.getPageNumber());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + email));

        CustomerProfile customer = customerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("Customer profile not found for user: " + email));

        return shipmentRepository.findByCustomerOrderByCreatedAtDesc(customer, pageable)
                .map(shipmentMapper::toSummaryResponse);
    }

    /**
     * Cancels an existing shipment order if it has not yet departed.
     */
    @Override
    @Transactional
    public ShipmentResponse cancelShipment(String trackingNumber) {
        log.info("Cancelling shipment with tracking number: {}", trackingNumber);

        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ShipmentNotFoundException(
                        "Shipment not found with tracking number: " + trackingNumber));

        if (shipment.getShipmentStatus() == ShipmentStatus.IN_TRANSIT
                || shipment.getShipmentStatus() == ShipmentStatus.OUT_FOR_DELIVERY
                || shipment.getShipmentStatus() == ShipmentStatus.DELIVERED
                || shipment.getShipmentStatus() == ShipmentStatus.CANCELLED) {
            throw new IllegalStateException(
                    "Shipment in status [" + shipment.getShipmentStatus() + "] cannot be cancelled.");
        }

        shipment.setShipmentStatus(ShipmentStatus.CANCELLED);
        Shipment saved = shipmentRepository.save(shipment);
        log.info("Shipment [{}] cancelled successfully", trackingNumber);

        return shipmentMapper.toResponse(saved);
    }

    /**
     * Fetches all registered shipments across the entire platform. Admin authorization restricted.
     */
    @Override
    public Page<ShipmentSummaryResponse> getAllShipments(Pageable pageable) {
        log.debug("Admin fetching all shipments, page: {}", pageable.getPageNumber());
        return shipmentRepository.findAll(pageable)
                .map(shipmentMapper::toSummaryResponse);
    }

    /**
     * Generates a unique tracking prefix in the form: DLT-YYYY-XXXXXXXX
     */
    private String generateTrackingNumber() {
        int year = Year.now().getValue();
        String uniquePart = UUID.randomUUID().toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();
        return "DLT-" + year + "-" + uniquePart;
    }

    @Override
    @Transactional
    public ShipmentResponse rescheduleShipment(String trackingNumber, java.time.LocalDateTime rescheduledDate) {
        log.info("Rescheduling shipment {} to new date {}", trackingNumber, rescheduledDate);
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ShipmentNotFoundException("Shipment not found: " + trackingNumber));
        if (shipment.getShipmentStatus() != ShipmentStatus.FAILED) {
            throw new IllegalStateException("Only failed shipments can be rescheduled.");
        }

        shipment.setRescheduledDate(rescheduledDate);
        shipment.setShipmentStatus(ShipmentStatus.CREATED);
        shipmentRepository.save(shipment);

        // Record tracking history entry for reschedule
        TrackingHistory rescheduleEvent = TrackingHistory.builder()
                .shipment(shipment)
                .shipmentStatus(ShipmentStatus.CREATED)
                .location((shipment.getPickupArea() != null) ? shipment.getPickupArea().getAreaName() : "Warehouse")
                .remarks("Customer requested rescheduling to " + rescheduledDate)
                .actor("CUSTOMER")
                .build();
        trackingHistoryRepository.save(rescheduleEvent);

        // Assign a new delivery agent
        assignmentService.assignShipment(shipment);

        Shipment saved = shipmentRepository.save(shipment);
        return shipmentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ShipmentResponse createShipmentForCustomer(CreateShipmentRequest request, Long customerId) {
        log.info("Admin creating shipment for customer id: {}", customerId);

        CustomerProfile customer = customerProfileRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException("Customer profile not found with id: " + customerId));

        Area pickupArea = areaRepository.findByPincode(request.getPickupPincode())
                .orElseThrow(() -> new AreaNotFoundException("Pickup area not found for pincode: " + request.getPickupPincode()));
        Area deliveryArea = areaRepository.findByPincode(request.getDeliveryPincode())
                .orElseThrow(() -> new AreaNotFoundException("Delivery area not found for pincode: " + request.getDeliveryPincode()));

        Shipment shipment = shipmentMapper.toEntity(request);
        shipment.setShipmentStatus(ShipmentStatus.CREATED);
        String trackingNumber = generateTrackingNumber();
        shipment.setTrackingNumber(trackingNumber);

        shipment.setCustomer(customer);
        shipment.setPickupArea(pickupArea);
        shipment.setDeliveryArea(deliveryArea);

        Shipment savedShipment = shipmentRepository.save(shipment);
        log.info("Base shipment created by admin with tracking: {}", savedShipment.getTrackingNumber());

        TrackingHistory createdEvent = TrackingHistory.builder()
                .shipment(savedShipment)
                .shipmentStatus(ShipmentStatus.CREATED)
                .location(pickupArea.getAreaName() + ", " + pickupArea.getCity())
                .remarks("Shipment created by administrator")
                .actor("ADMIN")
                .build();
        trackingHistoryRepository.save(createdEvent);

        pricingService.calculateShipmentCharges(savedShipment);
        assignmentService.assignShipment(savedShipment);

        Shipment finalShipment = shipmentRepository.save(savedShipment);
        return shipmentMapper.toResponse(finalShipment);
    }

    @Override
    public Page<ShipmentSummaryResponse> getAllShipmentsFiltered(Pageable pageable, ShipmentStatus status, String zone, Long agentId) {
        log.debug("Fetching shipments filtered: status={}, zone={}, agentId={}", status, zone, agentId);
        return shipmentRepository.findAllFilteredForAdmin(status, zone, agentId, pageable)
                .map(shipmentMapper::toSummaryResponse);
    }

    @Override
    public com.lastmile.deliverytracker.pricing.entity.ShipmentCharge estimateCharges(CreateShipmentRequest request) {
        log.debug("Estimating charges for request: {}", request.getReceiverName());
        Area pickupArea = areaRepository.findByPincode(request.getPickupPincode())
                .orElseThrow(() -> new AreaNotFoundException("Pickup area not found for pincode: " + request.getPickupPincode()));
        Area deliveryArea = areaRepository.findByPincode(request.getDeliveryPincode())
                .orElseThrow(() -> new AreaNotFoundException("Delivery area not found for pincode: " + request.getDeliveryPincode()));

        Shipment shipment = shipmentMapper.toEntity(request);
        shipment.setPickupArea(pickupArea);
        shipment.setDeliveryArea(deliveryArea);

        BigDecimal volumetricWeight = pricingCalculator.calculateVolumetricWeight(shipment);
        shipment.setVolumetricWeight(volumetricWeight);

        BigDecimal billableWeight = pricingCalculator.calculateBillableWeight(shipment);
        shipment.setBillableWeight(billableWeight);

        OrderType orderType = shipment.getOrderType() != null ? shipment.getOrderType() : OrderType.B2C;
        Zone pickupZone = pickupArea.getZone();
        Zone deliveryZone = deliveryArea.getZone();

        RateCard rateCard = rateCardRepository.findRateCard(pickupZone, deliveryZone, orderType, billableWeight)
                .orElseThrow(() -> new RateCardNotFoundException(
                        "Active rate card not found between pickup zone " + pickupZone.getZoneName() +
                                " and delivery zone " + deliveryZone.getZoneName() +
                                " for order type " + orderType + " and weight " + billableWeight));

        return pricingCalculator.calculate(shipment, rateCard);
    }
}

