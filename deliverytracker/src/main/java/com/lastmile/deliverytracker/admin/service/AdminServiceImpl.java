package com.lastmile.deliverytracker.admin.service;

import com.lastmile.deliverytracker.admin.dto.response.AgentAdminResponse;
import com.lastmile.deliverytracker.admin.dto.response.RateCardAdminResponse;
import com.lastmile.deliverytracker.admin.dto.response.ShipmentAdminResponse;
import com.lastmile.deliverytracker.admin.dto.response.UserAdminResponse;
import com.lastmile.deliverytracker.admin.exception.AdminUserNotFoundException;
import com.lastmile.deliverytracker.admin.mapper.AdminMapper;
import com.lastmile.deliverytracker.assignment.entity.AssignmentStatus;
import com.lastmile.deliverytracker.assignment.repository.OrderAssignmentRepository;
import com.lastmile.deliverytracker.auth.entity.User;
import com.lastmile.deliverytracker.auth.repository.DeliveryAgentRepository;
import com.lastmile.deliverytracker.auth.repository.UserRepository;
import com.lastmile.deliverytracker.pricing.repository.RateCardRepository;
import com.lastmile.deliverytracker.pricing.repository.ShipmentChargeRepository;
import com.lastmile.deliverytracker.shipment.repository.ShipmentRepository;
import com.lastmile.deliverytracker.pricing.entity.Zone;
import com.lastmile.deliverytracker.pricing.entity.Area;
import com.lastmile.deliverytracker.pricing.entity.RateCard;
import com.lastmile.deliverytracker.pricing.repository.ZoneRepository;
import com.lastmile.deliverytracker.pricing.repository.AreaRepository;
import com.lastmile.deliverytracker.tracking.entity.TrackingHistory;
import com.lastmile.deliverytracker.tracking.repository.TrackingHistoryRepository;
import com.lastmile.deliverytracker.assignment.entity.OrderAssignment;
import com.lastmile.deliverytracker.auth.entity.DeliveryAgent;
import com.lastmile.deliverytracker.auth.enums.AvailabilityStatus;
import com.lastmile.deliverytracker.auth.exception.DeliveryAgentNotFoundException;
import com.lastmile.deliverytracker.pricing.exception.ZoneNotFoundException;
import com.lastmile.deliverytracker.pricing.exception.AreaNotFoundException;
import com.lastmile.deliverytracker.pricing.exception.RateCardNotFoundException;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import com.lastmile.deliverytracker.shipment.exception.ShipmentNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminServiceImpl.class);

    private final ShipmentRepository shipmentRepository;
    private final ShipmentChargeRepository shipmentChargeRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final OrderAssignmentRepository orderAssignmentRepository;
    private final UserRepository userRepository;
    private final RateCardRepository rateCardRepository;
    private final ZoneRepository zoneRepository;
    private final AreaRepository areaRepository;
    private final TrackingHistoryRepository trackingHistoryRepository;
    private final AdminMapper adminMapper;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    // ──────────────────────────────────────────────────────────────
    // getShipments()
    // Projects Shipment into ShipmentAdminResponse.
    // totalCharge is fetched per-shipment from ShipmentCharge (1:1).
    // customerName is derived from shipment.customer.user.fullName.
    // Projection is built manually — cross-entity JOIN prevents a
    // clean MapStruct mapping here.
    // ──────────────────────────────────────────────────────────────
    @Override
    public Page<ShipmentAdminResponse> getShipments(Pageable pageable) {
        log.debug("Fetching admin shipment list, page {}", pageable.getPageNumber());

        return shipmentRepository.findAllForAdmin(pageable).map(shipment -> {
            // Resolve pre-fetched charge (eliminated N+1 query)
            BigDecimal totalCharge = (shipment.getShipmentCharge() != null)
                    ? shipment.getShipmentCharge().getTotalCharge()
                    : BigDecimal.ZERO;

            // Customer name: pre-fetched path (eliminated N+1 query)
            String customerName = (shipment.getCustomer() != null
                    && shipment.getCustomer().getUser() != null)
                    ? shipment.getCustomer().getUser().getFullName()
                    : "Unknown";

            return ShipmentAdminResponse.builder()
                    .shipmentId(shipment.getId())
                    .trackingNumber(shipment.getTrackingNumber())
                    .customerName(customerName)
                    .shipmentStatus(shipment.getShipmentStatus())
                    .totalCharge(totalCharge)
                    .createdAt(shipment.getCreatedAt())
                    .build();
        });
    }

    // ──────────────────────────────────────────────────────────────
    // getAgents()
    // Uses AdminMapper.toAgentAdminResponse() for base fields,
    // then enriches with activeAssignments count from the
    // OrderAssignment table using ASSIGNED status.
    // Optimized with a single bulk count query to avoid N+1 queries.
    // ──────────────────────────────────────────────────────────────
    @Override
    public Page<AgentAdminResponse> getAgents(Pageable pageable) {
        log.debug("Fetching admin agent list, page {}", pageable.getPageNumber());

        Page<com.lastmile.deliverytracker.auth.entity.DeliveryAgent> agentsPage = deliveryAgentRepository.findAll(pageable);
        java.util.List<com.lastmile.deliverytracker.auth.entity.DeliveryAgent> agentsList = agentsPage.getContent();

        java.util.Map<Long, Long> agentCounts = new java.util.HashMap<>();
        if (!agentsList.isEmpty()) {
            java.util.List<Object[]> counts = orderAssignmentRepository
                    .countActiveAssignmentsForAgents(agentsList, AssignmentStatus.ASSIGNED);
            for (Object[] row : counts) {
                agentCounts.put((Long) row[0], (Long) row[1]);
            }
        }

        return agentsPage.map(agent -> {
            AgentAdminResponse response = adminMapper.toAgentAdminResponse(agent);
            long activeAssignments = agentCounts.getOrDefault(agent.getId(), 0L);
            response.setActiveAssignments(activeAssignments);
            return response;
        });
    }

    // ──────────────────────────────────────────────────────────────
    // getUsers()
    // Maps User entities to UserAdminResponse via AdminMapper.
    // ──────────────────────────────────────────────────────────────
    @Override
    public Page<UserAdminResponse> getUsers(Pageable pageable) {
        log.debug("Fetching admin user list, page {}", pageable.getPageNumber());

        return userRepository.findAll(pageable)
                .map(adminMapper::toUserAdminResponse);
    }

    // ──────────────────────────────────────────────────────────────
    // getRateCards()
    // Maps RateCard entities to RateCardAdminResponse via AdminMapper.
    // Zone names are flattened by the mapper's @Mapping annotations.
    // ──────────────────────────────────────────────────────────────
    @Override
    public Page<RateCardAdminResponse> getRateCards(Pageable pageable) {
        log.debug("Fetching admin rate card list, page {}", pageable.getPageNumber());

        return rateCardRepository.findAll(pageable)
                .map(adminMapper::toRateCardAdminResponse);
    }

    // ──────────────────────────────────────────────────────────────
    // activateUser() / deactivateUser()
    // These are the only two WRITE operations in the admin module.
    // @Transactional override removes readOnly for these methods.
    // ──────────────────────────────────────────────────────────────
    @Override
    @Transactional
    public void activateUser(Long userId) {
        log.info("Admin activating user with id: {}", userId);
        User user = findUserOrThrow(userId);
        user.setIsActive(true);
        userRepository.save(user);
        log.info("User [{}] activated successfully", userId);
    }

    @Override
    @Transactional
    public void deactivateUser(Long userId) {
        log.info("Admin deactivating user with id: {}", userId);
        User user = findUserOrThrow(userId);
        user.setIsActive(false);
        userRepository.save(user);
        log.info("User [{}] deactivated successfully", userId);
    }

    // ──────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────
    private User findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new AdminUserNotFoundException(
                        "User not found with id: " + userId));
    }

    @Override
    @Transactional
    public void manualAssignAgent(String trackingNumber, Long agentId) {
        log.info("Admin manually assigning agent {} to shipment {}", agentId, trackingNumber);
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ShipmentNotFoundException("Shipment not found: " + trackingNumber));
        DeliveryAgent agent = deliveryAgentRepository.findById(agentId)
                .orElseThrow(() -> new DeliveryAgentNotFoundException("Agent not found: " + agentId));

        if (agent.getAvailabilityStatus() != AvailabilityStatus.AVAILABLE) {
            throw new IllegalStateException("Agent is not available for assignment.");
        }

        // Close any active assignments
        orderAssignmentRepository.findByShipmentAndAssignmentStatus(shipment, AssignmentStatus.ASSIGNED)
                .ifPresent(oldAssignment -> {
                    oldAssignment.setAssignmentStatus(AssignmentStatus.REASSIGNED);
                    orderAssignmentRepository.save(oldAssignment);
                    DeliveryAgent oldAgent = oldAssignment.getDeliveryAgent();
                    if (oldAgent != null) {
                        oldAgent.setAvailabilityStatus(AvailabilityStatus.AVAILABLE);
                        deliveryAgentRepository.save(oldAgent);
                    }
                });

        // Set new agent status to BUSY
        agent.setAvailabilityStatus(AvailabilityStatus.BUSY);
        deliveryAgentRepository.save(agent);

        // Build new assignment
        OrderAssignment assignment = OrderAssignment.builder()
                .shipment(shipment)
                .deliveryAgent(agent)
                .assignmentStatus(AssignmentStatus.ASSIGNED)
                .assignedAt(java.time.LocalDateTime.now())
                .build();
        orderAssignmentRepository.save(assignment);

        // Update shipment status
        shipment.setShipmentStatus(ShipmentStatus.ASSIGNED);
        shipmentRepository.save(shipment);

        // Log tracking history
        TrackingHistory history = TrackingHistory.builder()
                .shipment(shipment)
                .shipmentStatus(ShipmentStatus.ASSIGNED)
                .location((shipment.getPickupArea() != null) ? shipment.getPickupArea().getAreaName() : "Warehouse")
                .remarks("Delivery agent [" + agent.getUser().getFullName() + "] manually assigned by administrator")
                .actor("ADMIN")
                .build();
        trackingHistoryRepository.save(history);
        eventPublisher.publishEvent(new com.lastmile.deliverytracker.notification.event.AssignmentCreatedEvent(this, shipment, agent));
    }

    @Override
    @Transactional
    public void overrideStatus(String trackingNumber, ShipmentStatus status) {
        log.info("Admin overriding status for shipment {} to {}", trackingNumber, status);
        Shipment shipment = shipmentRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ShipmentNotFoundException("Shipment not found: " + trackingNumber));

        shipment.setShipmentStatus(status);
        shipmentRepository.save(shipment);

        // If terminal state or CREATED, release the agent
        if (status == ShipmentStatus.DELIVERED || status == ShipmentStatus.FAILED || status == ShipmentStatus.CANCELLED || status == ShipmentStatus.CREATED) {
            orderAssignmentRepository.findByShipmentAndAssignmentStatus(shipment, AssignmentStatus.ASSIGNED)
                    .ifPresent(assignment -> {
                        if (status == ShipmentStatus.DELIVERED) {
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

        // Log tracking history
        TrackingHistory history = TrackingHistory.builder()
                .shipment(shipment)
                .shipmentStatus(status)
                .location((shipment.getPickupArea() != null) ? shipment.getPickupArea().getAreaName() : "Warehouse")
                .remarks("Shipment status manually overridden to " + status + " by administrator")
                .actor("ADMIN")
                .build();
        trackingHistoryRepository.save(history);
    }

    @Override
    @Transactional
    public Zone createZone(Zone zone) {
        return zoneRepository.save(zone);
    }

    @Override
    @Transactional
    public Zone updateZone(Long zoneId, Zone zoneDetails) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new ZoneNotFoundException("Zone not found: " + zoneId));
        zone.setZoneName(zoneDetails.getZoneName());
        zone.setDescription(zoneDetails.getDescription());
        zone.setIsActive(zoneDetails.getIsActive());
        return zoneRepository.save(zone);
    }

    @Override
    @Transactional
    public void deleteZone(Long zoneId) {
        zoneRepository.deleteById(zoneId);
    }

    @Override
    @Transactional
    public Area createArea(Area area, Long zoneId) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new ZoneNotFoundException("Zone not found: " + zoneId));
        area.setZone(zone);
        return areaRepository.save(area);
    }

    @Override
    @Transactional
    public Area updateArea(Long areaId, Area areaDetails, Long zoneId) {
        Area area = areaRepository.findById(areaId)
                .orElseThrow(() -> new AreaNotFoundException("Area not found: " + areaId));
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new ZoneNotFoundException("Zone not found: " + zoneId));
        area.setAreaName(areaDetails.getAreaName());
        area.setPincode(areaDetails.getPincode());
        area.setCity(areaDetails.getCity());
        area.setState(areaDetails.getState());
        area.setLatitude(areaDetails.getLatitude());
        area.setLongitude(areaDetails.getLongitude());
        area.setIsActive(areaDetails.getIsActive());
        area.setZone(zone);
        return areaRepository.save(area);
    }

    @Override
    @Transactional
    public void deleteArea(Long areaId) {
        areaRepository.deleteById(areaId);
    }

    @Override
    @Transactional
    public RateCard createRateCard(RateCard rateCard, Long pickupZoneId, Long deliveryZoneId) {
        Zone pickupZone = zoneRepository.findById(pickupZoneId)
                .orElseThrow(() -> new ZoneNotFoundException("Pickup Zone not found: " + pickupZoneId));
        Zone deliveryZone = zoneRepository.findById(deliveryZoneId)
                .orElseThrow(() -> new ZoneNotFoundException("Delivery Zone not found: " + deliveryZoneId));
        rateCard.setPickupZone(pickupZone);
        rateCard.setDeliveryZone(deliveryZone);
        return rateCardRepository.save(rateCard);
    }

    @Override
    @Transactional
    public RateCard updateRateCard(Long rateCardId, RateCard rateCardDetails, Long pickupZoneId, Long deliveryZoneId) {
        RateCard rateCard = rateCardRepository.findById(rateCardId)
                .orElseThrow(() -> new RateCardNotFoundException("Rate card not found: " + rateCardId));
        Zone pickupZone = zoneRepository.findById(pickupZoneId)
                .orElseThrow(() -> new ZoneNotFoundException("Pickup Zone not found: " + pickupZoneId));
        Zone deliveryZone = zoneRepository.findById(deliveryZoneId)
                .orElseThrow(() -> new ZoneNotFoundException("Delivery Zone not found: " + deliveryZoneId));
        rateCard.setPickupZone(pickupZone);
        rateCard.setDeliveryZone(deliveryZone);
        rateCard.setMinimumWeight(rateCardDetails.getMinimumWeight());
        rateCard.setMaximumWeight(rateCardDetails.getMaximumWeight());
        rateCard.setBaseCharge(rateCardDetails.getBaseCharge());
        rateCard.setPricePerKg(rateCardDetails.getPricePerKg());
        rateCard.setCodCharge(rateCardDetails.getCodCharge());
        rateCard.setFuelSurcharge(rateCardDetails.getFuelSurcharge());
        rateCard.setActive(rateCardDetails.getActive());
        rateCard.setOrderType(rateCardDetails.getOrderType());
        return rateCardRepository.save(rateCard);
    }

    @Override
    @Transactional
    public void deleteRateCard(Long rateCardId) {
        rateCardRepository.deleteById(rateCardId);
    }
}
