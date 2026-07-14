package com.lastmile.deliverytracker.tracking.controller;

import com.lastmile.deliverytracker.tracking.dto.request.UpdateTrackingRequest;
import com.lastmile.deliverytracker.tracking.dto.response.TrackingHistoryResponse;
import com.lastmile.deliverytracker.tracking.dto.response.TrackingTimelineResponse;
import com.lastmile.deliverytracker.tracking.service.TrackingService;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tracking")
@RequiredArgsConstructor
@Tag(
        name = "Tracking",
        description = "Real-time shipment tracking endpoints. " +
                      "GET endpoints are accessible to CUSTOMER, ADMIN, and AGENT. " +
                      "POST (status update) is restricted to ADMIN and AGENT only."
)
@SecurityRequirement(name = "bearerAuth")
public class TrackingController {

    private final TrackingService trackingService;

    @Operation(
            summary = "Get full tracking timeline",
            description = "Returns the complete, chronological status history of a shipment " +
                          "ordered by event time ascending. " +
                          "Accessible to roles: CUSTOMER, ADMIN, AGENT."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Timeline retrieved successfully",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = TrackingTimelineResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorised",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "Forbidden — insufficient role",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "404", description = "Shipment not found",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @GetMapping("/{trackingNumber}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'AGENT')")
    public ResponseEntity<TrackingTimelineResponse> getTimeline(
            @Parameter(description = "Unique shipment tracking number", example = "TRK-2024-00001", required = true)
            @PathVariable String trackingNumber) {
        return ResponseEntity.ok(trackingService.getTimeline(trackingNumber));
    }

    @Operation(
            summary = "Get latest tracking status",
            description = "Returns only the most recent tracking event for a shipment — " +
                          "useful for displaying the current status badge without the full history. " +
                          "Accessible to roles: CUSTOMER, ADMIN, AGENT."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Latest status retrieved",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = TrackingHistoryResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "401", description = "Unauthorised",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "Forbidden — insufficient role",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "404", description = "Shipment or tracking history not found",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @GetMapping("/{trackingNumber}/latest")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN', 'AGENT')")
    public ResponseEntity<TrackingHistoryResponse> getLatestStatus(
            @Parameter(description = "Unique shipment tracking number", example = "TRK-2024-00001", required = true)
            @PathVariable String trackingNumber) {
        return ResponseEntity.ok(trackingService.getLatestStatus(trackingNumber));
    }

    @Operation(
            summary = "Update tracking status",
            description = "Appends a new tracking event to the shipment history (immutable audit log). " +
                          "Also updates the Shipment's current status field. " +
                          "Restricted to roles: ADMIN, AGENT."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Tracking status updated successfully",
                    content = @Content(
                            mediaType = MediaType.APPLICATION_JSON_VALUE,
                            schema = @Schema(implementation = TrackingHistoryResponse.class)
                    )
            ),
            @ApiResponse(responseCode = "400", description = "Validation failed — invalid status or fields",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "401", description = "Unauthorised",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "403", description = "Forbidden — ADMIN or AGENT role required",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE)),
            @ApiResponse(responseCode = "404", description = "Shipment not found",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE))
    })
    @PostMapping("/{trackingNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT')")
    public ResponseEntity<TrackingHistoryResponse> updateTracking(
            @Parameter(description = "Unique shipment tracking number", example = "TRK-2024-00001", required = true)
            @PathVariable String trackingNumber,
            @Valid @RequestBody UpdateTrackingRequest request) {
        return ResponseEntity.ok(trackingService.updateTracking(trackingNumber, request));
    }
}
