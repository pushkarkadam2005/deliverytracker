package com.lastmile.deliverytracker.admin.service;

import com.lastmile.deliverytracker.admin.dto.response.AgentAdminResponse;
import com.lastmile.deliverytracker.admin.dto.response.RateCardAdminResponse;
import com.lastmile.deliverytracker.admin.dto.response.ShipmentAdminResponse;
import com.lastmile.deliverytracker.admin.dto.response.UserAdminResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminService {

    /**
     * Returns a paginated view of all shipments with their admin summary
     * (trackingNumber, customerName, status, totalCharge, createdAt).
     */
    Page<ShipmentAdminResponse> getShipments(Pageable pageable);

    /**
     * Returns a paginated view of all delivery agents with availability
     * status and active assignment count.
     */
    Page<AgentAdminResponse> getAgents(Pageable pageable);

    /**
     * Returns a paginated view of all platform users (all roles).
     */
    Page<UserAdminResponse> getUsers(Pageable pageable);

    /**
     * Returns a paginated view of all rate cards with zone names.
     */
    Page<RateCardAdminResponse> getRateCards(Pageable pageable);

    /**
     * Activates a user account by setting isActive = true.
     *
     * @throws com.lastmile.deliverytracker.admin.exception.AdminUserNotFoundException
     *         if no user with the given id exists
     */
    void activateUser(Long userId);

    /**
     * Deactivates a user account by setting isActive = false.
     *
     * @throws com.lastmile.deliverytracker.admin.exception.AdminUserNotFoundException
     *         if no user with the given id exists
     */
    void deactivateUser(Long userId);

    void manualAssignAgent(String trackingNumber, Long agentId);

    void overrideStatus(String trackingNumber, com.lastmile.deliverytracker.shipment.enums.ShipmentStatus status);

    com.lastmile.deliverytracker.pricing.entity.Zone createZone(com.lastmile.deliverytracker.pricing.entity.Zone zone);
    com.lastmile.deliverytracker.pricing.entity.Zone updateZone(Long zoneId, com.lastmile.deliverytracker.pricing.entity.Zone zone);
    void deleteZone(Long zoneId);

    com.lastmile.deliverytracker.pricing.entity.Area createArea(com.lastmile.deliverytracker.pricing.entity.Area area, Long zoneId);
    com.lastmile.deliverytracker.pricing.entity.Area updateArea(Long areaId, com.lastmile.deliverytracker.pricing.entity.Area area, Long zoneId);
    void deleteArea(Long areaId);

    com.lastmile.deliverytracker.pricing.entity.RateCard createRateCard(com.lastmile.deliverytracker.pricing.entity.RateCard rateCard, Long pickupZoneId, Long deliveryZoneId);
    com.lastmile.deliverytracker.pricing.entity.RateCard updateRateCard(Long rateCardId, com.lastmile.deliverytracker.pricing.entity.RateCard rateCard, Long pickupZoneId, Long deliveryZoneId);
    void deleteRateCard(Long rateCardId);
}
