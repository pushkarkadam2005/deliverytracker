package com.lastmile.deliverytracker.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Base exception for domain business-rule violations that do not fit the
 * "resource not found" category — e.g. attempting to assign an already
 * assigned shipment, or processing a cancelled order.
 *
 * Maps to HTTP 422 Unprocessable Entity by default, indicating that the
 * request was well-formed but could not be processed due to business logic.
 *
 * Usage:
 *   throw new BusinessException("Shipment is already in DELIVERED state.");
 *   throw new BusinessException("No available agents in pickup zone.", HttpStatus.CONFLICT);
 */
public class BusinessException extends RuntimeException {

    private final HttpStatus status;

    public BusinessException(String message) {
        super(message);
        this.status = HttpStatus.UNPROCESSABLE_ENTITY;
    }

    public BusinessException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.status = HttpStatus.UNPROCESSABLE_ENTITY;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
