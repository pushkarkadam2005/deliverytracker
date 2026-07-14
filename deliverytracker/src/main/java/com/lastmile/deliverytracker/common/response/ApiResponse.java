package com.lastmile.deliverytracker.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

/**
 * Generic success response wrapper used across all API endpoints.
 *
 * Type parameter {@code T} allows any payload to be wrapped without
 * creating bespoke wrapper classes per endpoint.
 *
 * Example (success):
 * {
 *   "success": true,
 *   "message": "Shipment created successfully.",
 *   "data": { ... }
 * }
 *
 * Example (no-data, e.g. 204 operations):
 * {
 *   "success": true,
 *   "message": "User deactivated successfully."
 * }
 *
 * Usage:
 *   return ResponseEntity.ok(ApiResponse.success("Shipment created.", shipmentResponse));
 *   return ResponseEntity.ok(ApiResponse.success("User deactivated."));
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;

    private final String message;

    /** Null for operations that return no body (e.g. activate/deactivate). */
    private final T data;

    // ── Static factory methods ────────────────────────────────────

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> failure(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }
}
