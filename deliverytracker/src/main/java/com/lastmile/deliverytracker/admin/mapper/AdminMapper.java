package com.lastmile.deliverytracker.admin.mapper;

import com.lastmile.deliverytracker.admin.dto.response.AgentAdminResponse;
import com.lastmile.deliverytracker.admin.dto.response.RateCardAdminResponse;
import com.lastmile.deliverytracker.admin.dto.response.UserAdminResponse;
import com.lastmile.deliverytracker.auth.entity.DeliveryAgent;
import com.lastmile.deliverytracker.auth.entity.User;
import com.lastmile.deliverytracker.pricing.entity.RateCard;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface AdminMapper {

    // ── User ──────────────────────────────────────────────────────

    /**
     * Maps User entity → UserAdminResponse.
     * User.id → userId, User.isActive → active (field name differs).
     */
    @Mapping(source = "id",       target = "userId")
    @Mapping(source = "isActive", target = "active")
    UserAdminResponse toUserAdminResponse(User user);

    // ── Delivery Agent ────────────────────────────────────────────

    /**
     * Maps DeliveryAgent entity → AgentAdminResponse.
     * Navigates the LAZY User association for name, email and isActive.
     * activeAssignments cannot be derived from the entity alone — it is
     * set manually in AdminServiceImpl after the mapping call.
     */
    @Mapping(source = "id",                      target = "agentId")
    @Mapping(source = "user.fullName",            target = "name")
    @Mapping(source = "user.email",               target = "email")
    @Mapping(source = "phone",                    target = "phone")
    @Mapping(source = "user.isActive",            target = "active")
    @Mapping(source = "availabilityStatus",       target = "availability")
    @Mapping(target = "activeAssignments",        ignore = true)
    AgentAdminResponse toAgentAdminResponse(DeliveryAgent agent);

    // ── Rate Card ─────────────────────────────────────────────────

    /**
     * Maps RateCard entity → RateCardAdminResponse.
     * Flattens nested Zone objects to their name strings.
     */
    @Mapping(source = "pickupZone.zoneName",   target = "pickupZone")
    @Mapping(source = "deliveryZone.zoneName", target = "deliveryZone")
    @Mapping(source = "active",                target = "active")
    RateCardAdminResponse toRateCardAdminResponse(RateCard rateCard);
}
