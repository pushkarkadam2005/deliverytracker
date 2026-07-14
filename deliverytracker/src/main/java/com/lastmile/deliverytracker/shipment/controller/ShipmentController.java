package com.lastmile.deliverytracker.shipment.controller;

import com.lastmile.deliverytracker.shipment.dto.request.CreateShipmentRequest;
import com.lastmile.deliverytracker.shipment.dto.response.ShipmentResponse;
import com.lastmile.deliverytracker.shipment.dto.response.ShipmentSummaryResponse;
import com.lastmile.deliverytracker.shipment.service.ShipmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/shipments")
@RequiredArgsConstructor
@Tag(
        name = "Shipments",
        description = "Manage the full shipment lifecycle — create, track, cancel, and list shipments. " +
                      "Requires JWT Bearer authentication."
)
@SecurityRequirement(name = "bearerAuth")
public class ShipmentController {

    private final ShipmentService shipmentService;

    /**
     * POST /api/v1/shipments
     */
    @Operation(
            summary = "Create a new shipment",
            description = "Creates a new shipment for the authenticated CUSTOMER. " +
                          "Pricing and agent assignment are triggered automatically by the platform workflow."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Shipment created successfully",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ShipmentResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "400", description = "Validation failed — invalid request fields",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "401", description = "Unauthorised — missing or invalid JWT token",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "Forbidden — only CUSTOMER role may create shipments",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @PostMapping
    public ResponseEntity<ShipmentResponse> createShipment(
            @Valid @RequestBody CreateShipmentRequest request) {
        return new ResponseEntity<>(shipmentService.createShipment(request), HttpStatus.CREATED);
    }

    @Operation(
            summary = "Estimate shipment charges",
            description = "Calculates volumetric/billable weight and returns estimated charges before order is created."
    )
    @PostMapping("/estimate")
    public ResponseEntity<com.lastmile.deliverytracker.pricing.entity.ShipmentCharge> estimateCharges(
            @Valid @RequestBody CreateShipmentRequest request) {
        return ResponseEntity.ok(shipmentService.estimateCharges(request));
    }

    /**
     * GET /api/v1/shipments/{trackingNumber}
     */
    @Operation(
            summary = "Get shipment by tracking number",
            description = "Retrieves the full details of a shipment using its unique tracking number. " +
                          "Accessible to CUSTOMER (own shipments), AGENT, and ADMIN."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Shipment found",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ShipmentResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorised",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "404", description = "Shipment not found",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @GetMapping("/{trackingNumber}")
    public ResponseEntity<ShipmentResponse> getShipmentByTrackingNumber(
            @Parameter(description = "Unique shipment tracking number", example = "TRK-2024-00001", required = true)
            @PathVariable String trackingNumber) {
        return ResponseEntity.ok(shipmentService.getShipmentByTrackingNumber(trackingNumber));
    }

    /**
     * GET /api/v1/shipments/my
     */
    @Operation(
            summary = "Get my shipments",
            description = "Returns a paginated list of shipments belonging to the authenticated CUSTOMER. " +
                          "Sorted by creation date descending by default."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paginated list of customer shipments",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "401", description = "Unauthorised",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @GetMapping("/my")
    public ResponseEntity<Page<ShipmentSummaryResponse>> getMyShipments(
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(shipmentService.getMyShipments(pageable));
    }

    /**
     * PATCH /api/v1/shipments/{trackingNumber}/cancel
     */
    @Operation(
            summary = "Cancel a shipment",
            description = "Cancels a shipment in CREATED or ASSIGNED status. " +
                          "Business rules prevent cancellation of shipments that are already PICKED_UP or further."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Shipment cancelled successfully",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = ShipmentResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorised",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "404", description = "Shipment not found",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "422", description = "Shipment cannot be cancelled in its current status",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @PatchMapping("/{trackingNumber}/cancel")
    public ResponseEntity<ShipmentResponse> cancelShipment(
            @Parameter(description = "Unique shipment tracking number", example = "TRK-2024-00001", required = true)
            @PathVariable String trackingNumber) {
        return ResponseEntity.ok(shipmentService.cancelShipment(trackingNumber));
    }

    /**
     * GET /api/v1/shipments
     */
    @Operation(
            summary = "Get all shipments (Admin)",
            description = "Returns a paginated list of ALL platform shipments. " +
                          "Restricted to ADMIN role. Supports sorting and filtering via Pageable query params."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Paginated list of all shipments",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "401", description = "Unauthorised",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN role required",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @GetMapping
    public ResponseEntity<Page<ShipmentSummaryResponse>> getAllShipments(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(shipmentService.getAllShipments(pageable));
    }

    @Operation(
            summary = "Reschedule a failed delivery",
            description = "Allows a customer to select a new delivery date for a FAILED shipment. Automatically triggers agent reassignment."
    )
    @PatchMapping("/{trackingNumber}/reschedule")
    public ResponseEntity<ShipmentResponse> rescheduleShipment(
            @PathVariable String trackingNumber,
            @Valid @RequestBody com.lastmile.deliverytracker.shipment.dto.request.RescheduleRequest request) {
        return ResponseEntity.ok(shipmentService.rescheduleShipment(trackingNumber, request.getRescheduledDate()));
    }
}
