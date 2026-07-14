package com.lastmile.deliverytracker.common.exception;

import lombok.Builder;
import lombok.Getter;

/**
 * Represents a single field-level validation error inside an ErrorResponse.
 *
 * Used to populate the {@code fieldErrors} list when a
 * {@link org.springframework.web.bind.MethodArgumentNotValidException}
 * or {@link jakarta.validation.ConstraintViolationException} is thrown.
 *
 * Example entry:
 * {
 *   "field":   "trackingNumber",
 *   "message": "must not be blank"
 * }
 */
@Getter
@Builder
public class ApiError {

    /** The name of the field that failed validation. */
    private final String field;

    /** The human-readable validation message for that field. */
    private final String message;

    /**
     * Convenience factory — keeps handler code concise.
     */
    public static ApiError of(String field, String message) {
        return ApiError.builder()
                .field(field)
                .message(message)
                .build();
    }
}
