package com.lastmile.deliverytracker.common.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Standard error envelope returned by GlobalExceptionHandler for all error responses.
 *
 * Schema:
 * {
 *   "timestamp": "2024-01-15T10:30:00",
 *   "status": 404,
 *   "error": "Not Found",
 *   "message": "Shipment not found with tracking number: TRK-001",
 *   "path": "/api/v1/tracking/TRK-001",
 *   "fieldErrors": []     ← only present on validation failures
 * }
 */
@Getter
@Builder
public class ErrorResponse {

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime timestamp;

    private final int status;

    private final String error;

    private final String message;

    private final String path;

    /**
     * Present only on MethodArgumentNotValidException / ConstraintViolationException.
     * Null for all other error types (omitted from JSON via @JsonInclude).
     */
    private final List<ApiError> fieldErrors;
}
