package com.lastmile.deliverytracker.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Base exception for all "resource not found" scenarios across every domain module.
 *
 * All domain-specific not-found exceptions (ShipmentNotFoundException,
 * TrackingNotFoundException, etc.) can extend this class to be handled
 * by a single catch block in GlobalExceptionHandler → HTTP 404.
 *
 * Usage:
 *   throw new ResourceNotFoundException("Shipment not found with id: " + id);
 */
public class ResourceNotFoundException extends RuntimeException {

    private static final HttpStatus STATUS = HttpStatus.NOT_FOUND;

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }

    public HttpStatus getStatus() {
        return STATUS;
    }
}
