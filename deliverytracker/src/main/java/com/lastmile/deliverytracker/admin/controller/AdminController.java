package com.lastmile.deliverytracker.admin.controller;

import com.lastmile.deliverytracker.admin.dto.response.AgentAdminResponse;
import com.lastmile.deliverytracker.admin.dto.response.DashboardResponse;
import com.lastmile.deliverytracker.admin.dto.response.RateCardAdminResponse;
import com.lastmile.deliverytracker.admin.dto.response.ShipmentAdminResponse;
import com.lastmile.deliverytracker.admin.dto.response.UserAdminResponse;
import com.lastmile.deliverytracker.admin.service.AdminService;
import com.lastmile.deliverytracker.admin.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(
        name = "Admin",
        description = "Administrative operations exclusively for the ADMIN role. " +
                      "Provides platform-wide metrics, paginated resource lists, " +
                      "and user account management (activate/deactivate)."
)
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final DashboardService dashboardService;
    private final AdminService adminService;
    private final com.lastmile.deliverytracker.shipment.service.ShipmentService shipmentService;

    @Operation(
            summary = "Get platform dashboard",
            description = "Returns a real-time aggregate snapshot of platform-wide metrics: " +
                          "user counts, agent availability breakdown, shipment status counts, and total revenue."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Dashboard metrics returned",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = DashboardResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorised",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }

    @Operation(
            summary = "List all shipments",
            description = "Returns a paginated list of all shipments with admin-level detail " +
                          "(customer name, status, total charge, created at). " +
                          "Default: 20 per page, sorted by createdAt DESC."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paginated shipment list returned",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "401", description = "Unauthorised",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @GetMapping("/shipments")
    public ResponseEntity<Page<com.lastmile.deliverytracker.shipment.dto.response.ShipmentSummaryResponse>> getShipments(
            @RequestParam(required = false) com.lastmile.deliverytracker.shipment.enums.ShipmentStatus status,
            @RequestParam(required = false) String zone,
            @RequestParam(required = false) Long agentId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(shipmentService.getAllShipmentsFiltered(pageable, status, zone, agentId));
    }

    @Operation(
            summary = "List all delivery agents",
            description = "Returns a paginated list of all delivery agents with their " +
                          "availability status and active assignment count. " +
                          "Default: 20 per page, sorted by id ASC."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paginated agent list returned",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = AgentAdminResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorised",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @GetMapping("/agents")
    public ResponseEntity<Page<AgentAdminResponse>> getAgents(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.ASC)
            Pageable pageable) {
        return ResponseEntity.ok(adminService.getAgents(pageable));
    }

    @Operation(
            summary = "List all users",
            description = "Returns a paginated list of all platform users across all roles " +
                          "(ADMIN, CUSTOMER, AGENT). " +
                          "Default: 20 per page, sorted by createdAt DESC."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paginated user list returned",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = UserAdminResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorised",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @GetMapping("/users")
    public ResponseEntity<Page<UserAdminResponse>> getUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(adminService.getUsers(pageable));
    }

    @Operation(
            summary = "List all rate cards",
            description = "Returns a paginated list of all pricing rate cards with zone names flattened. " +
                          "Default: 20 per page, sorted by id ASC."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paginated rate card list returned",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = RateCardAdminResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorised",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @GetMapping("/rate-cards")
    public ResponseEntity<Page<RateCardAdminResponse>> getRateCards(
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.ASC)
            Pageable pageable) {
        return ResponseEntity.ok(adminService.getRateCards(pageable));
    }

    @Operation(
            summary = "Activate a user account",
            description = "Sets the `isActive` flag to `true` for the specified user. " +
                          "Returns 204 No Content on success. Returns 404 if the user is not found."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "User activated successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorised",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @PatchMapping("/users/{id}/activate")
    public ResponseEntity<Void> activateUser(
            @Parameter(description = "ID of the user to activate", example = "7", required = true)
            @PathVariable Long id) {
        adminService.activateUser(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Deactivate a user account",
            description = "Sets the `isActive` flag to `false` for the specified user, " +
                          "preventing them from logging in. " +
                          "Returns 204 No Content on success. Returns 404 if the user is not found."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "User deactivated successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorised",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "404", description = "User not found",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @PatchMapping("/users/{id}/deactivate")
    public ResponseEntity<Void> deactivateUser(
            @Parameter(description = "ID of the user to deactivate", example = "7", required = true)
            @PathVariable Long id) {
        adminService.deactivateUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/zones")
    public ResponseEntity<com.lastmile.deliverytracker.pricing.entity.Zone> createZone(
            @RequestBody com.lastmile.deliverytracker.pricing.entity.Zone zone) {
        return ResponseEntity.ok(adminService.createZone(zone));
    }

    @PutMapping("/zones/{id}")
    public ResponseEntity<com.lastmile.deliverytracker.pricing.entity.Zone> updateZone(
            @PathVariable Long id,
            @RequestBody com.lastmile.deliverytracker.pricing.entity.Zone zone) {
        return ResponseEntity.ok(adminService.updateZone(id, zone));
    }

    @DeleteMapping("/zones/{id}")
    public ResponseEntity<Void> deleteZone(@PathVariable Long id) {
        adminService.deleteZone(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/areas")
    public ResponseEntity<com.lastmile.deliverytracker.pricing.entity.Area> createArea(
            @RequestBody com.lastmile.deliverytracker.pricing.entity.Area area,
            @RequestParam Long zoneId) {
        return ResponseEntity.ok(adminService.createArea(area, zoneId));
    }

    @PutMapping("/areas/{id}")
    public ResponseEntity<com.lastmile.deliverytracker.pricing.entity.Area> updateArea(
            @PathVariable Long id,
            @RequestBody com.lastmile.deliverytracker.pricing.entity.Area area,
            @RequestParam Long zoneId) {
        return ResponseEntity.ok(adminService.updateArea(id, area, zoneId));
    }

    @DeleteMapping("/areas/{id}")
    public ResponseEntity<Void> deleteArea(@PathVariable Long id) {
        adminService.deleteArea(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/rate-cards")
    public ResponseEntity<com.lastmile.deliverytracker.pricing.entity.RateCard> createRateCard(
            @RequestBody com.lastmile.deliverytracker.pricing.entity.RateCard rateCard,
            @RequestParam Long pickupZoneId,
            @RequestParam Long deliveryZoneId) {
        return ResponseEntity.ok(adminService.createRateCard(rateCard, pickupZoneId, deliveryZoneId));
    }

    @PutMapping("/rate-cards/{id}")
    public ResponseEntity<com.lastmile.deliverytracker.pricing.entity.RateCard> updateRateCard(
            @PathVariable Long id,
            @RequestBody com.lastmile.deliverytracker.pricing.entity.RateCard rateCard,
            @RequestParam Long pickupZoneId,
            @RequestParam Long deliveryZoneId) {
        return ResponseEntity.ok(adminService.updateRateCard(id, rateCard, pickupZoneId, deliveryZoneId));
    }

    @DeleteMapping("/rate-cards/{id}")
    public ResponseEntity<Void> deleteRateCard(@PathVariable Long id) {
        adminService.deleteRateCard(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/shipments/{trackingNumber}/assign/{agentId}")
    public ResponseEntity<Void> manualAssignAgent(
            @PathVariable String trackingNumber,
            @PathVariable Long agentId) {
        adminService.manualAssignAgent(trackingNumber, agentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/shipments/{trackingNumber}/override-status")
    public ResponseEntity<Void> overrideStatus(
            @PathVariable String trackingNumber,
            @RequestParam com.lastmile.deliverytracker.shipment.enums.ShipmentStatus status) {
        adminService.overrideStatus(trackingNumber, status);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/shipments")
    public ResponseEntity<com.lastmile.deliverytracker.shipment.dto.response.ShipmentResponse> createShipmentForCustomer(
            @RequestParam Long customerId,
            @RequestBody com.lastmile.deliverytracker.shipment.dto.request.CreateShipmentRequest request) {
        return ResponseEntity.ok(shipmentService.createShipmentForCustomer(request, customerId));
    }
}
