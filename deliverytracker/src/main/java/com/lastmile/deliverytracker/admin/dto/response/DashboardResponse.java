package com.lastmile.deliverytracker.admin.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    // ── User metrics ──────────────────────────────────────────────
    private long totalUsers;
    private long totalCustomers;
    private long totalDeliveryAgents;

    // ── Agent availability breakdown ──────────────────────────────
    private long availableAgents;
    private long busyAgents;

    // ── Shipment metrics ──────────────────────────────────────────
    private long totalShipments;
    private long createdShipments;
    private long assignedShipments;
    private long inTransitShipments;
    private long deliveredShipments;
    private long cancelledShipments;

    // ── Financial metrics ─────────────────────────────────────────
    private BigDecimal totalRevenue;
}
