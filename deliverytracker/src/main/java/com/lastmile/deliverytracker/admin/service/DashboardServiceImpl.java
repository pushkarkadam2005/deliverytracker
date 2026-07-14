package com.lastmile.deliverytracker.admin.service;

import com.lastmile.deliverytracker.admin.dto.response.DashboardResponse;
import com.lastmile.deliverytracker.auth.enums.AvailabilityStatus;
import com.lastmile.deliverytracker.auth.repository.CustomerProfileRepository;
import com.lastmile.deliverytracker.auth.repository.DeliveryAgentRepository;
import com.lastmile.deliverytracker.auth.repository.UserRepository;
import com.lastmile.deliverytracker.pricing.repository.ShipmentChargeRepository;
import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import com.lastmile.deliverytracker.shipment.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardServiceImpl.class);

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final ShipmentRepository shipmentRepository;
    private final ShipmentChargeRepository shipmentChargeRepository;

    @Override
    public DashboardResponse getDashboard() {
        log.debug("Aggregating dashboard metrics");

        // ── User metrics ─────────────────────────────────────────────────
        long totalUsers      = userRepository.count();
        long totalCustomers  = customerProfileRepository.count();
        long totalAgents     = deliveryAgentRepository.count();

        // ── Agent availability breakdown ──────────────────────────────────
        long availableAgents = deliveryAgentRepository
                .findByAvailabilityStatus(AvailabilityStatus.AVAILABLE).size();
        long busyAgents = deliveryAgentRepository
                .findByAvailabilityStatus(AvailabilityStatus.BUSY).size();

        // ── Shipment metrics ──────────────────────────────────────────────
        long totalShipments    = shipmentRepository.count();
        long createdShipments  = shipmentRepository.countByShipmentStatus(ShipmentStatus.CREATED);
        long assignedShipments = shipmentRepository.countByShipmentStatus(ShipmentStatus.ASSIGNED);
        long inTransit         = shipmentRepository.countByShipmentStatus(ShipmentStatus.IN_TRANSIT);
        long delivered         = shipmentRepository.countByShipmentStatus(ShipmentStatus.DELIVERED);
        long cancelled         = shipmentRepository.countByShipmentStatus(ShipmentStatus.CANCELLED);

        // ── Financial metrics ─────────────────────────────────────────────
        BigDecimal totalRevenue = shipmentChargeRepository.sumTotalRevenue();

        log.debug("Dashboard aggregation complete: {} users, {} shipments, {} revenue",
                totalUsers, totalShipments, totalRevenue);

        return DashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalCustomers(totalCustomers)
                .totalDeliveryAgents(totalAgents)
                .availableAgents(availableAgents)
                .busyAgents(busyAgents)
                .totalShipments(totalShipments)
                .createdShipments(createdShipments)
                .assignedShipments(assignedShipments)
                .inTransitShipments(inTransit)
                .deliveredShipments(delivered)
                .cancelledShipments(cancelled)
                .totalRevenue(totalRevenue)
                .build();
    }
}
