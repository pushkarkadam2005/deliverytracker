package com.lastmile.deliverytracker.common.constants;

/**
 * Centralised string constants for all error messages used across the platform.
 *
 * Design rationale:
 *  - Prevents magic strings scattered across handlers and services.
 *  - A single place to update / localise messages in future.
 *  - Constants are intentionally grouped by domain for readability.
 */
public final class ErrorMessages {

    private ErrorMessages() {
        // Utility class — no instantiation
    }

    // ── Validation ────────────────────────────────────────────────
    public static final String VALIDATION_FAILED        = "Validation failed. Please correct the request and try again.";
    public static final String CONSTRAINT_VIOLATED      = "Constraint violation. Please check the input values.";

    // ── Shipment ──────────────────────────────────────────────────
    public static final String SHIPMENT_NOT_FOUND       = "Shipment not found.";

    // ── Tracking ──────────────────────────────────────────────────
    public static final String TRACKING_NOT_FOUND       = "Tracking history not found.";

    // ── Assignment ────────────────────────────────────────────────
    public static final String ASSIGNMENT_NOT_FOUND     = "Assignment not found.";

    // ── Rate Card ─────────────────────────────────────────────────
    public static final String RATE_CARD_NOT_FOUND      = "Rate card not found.";

    // ── Notification ──────────────────────────────────────────────
    public static final String NOTIFICATION_NOT_FOUND   = "Notification not found.";

    // ── Auth / Security ───────────────────────────────────────────
    public static final String ACCESS_DENIED            = "You do not have permission to access this resource.";
    public static final String AUTHENTICATION_FAILED    = "Authentication failed. Please check your credentials.";

    // ── Generic ───────────────────────────────────────────────────
    public static final String RESOURCE_NOT_FOUND       = "The requested resource was not found.";
    public static final String BUSINESS_RULE_VIOLATION  = "A business rule violation occurred.";
    public static final String INTERNAL_SERVER_ERROR    = "An unexpected error occurred. Please try again later.";
}
