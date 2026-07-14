package com.lastmile.deliverytracker.tracking.exception;

import com.lastmile.deliverytracker.common.exception.ResourceNotFoundException;

public class TrackingNotFoundException extends ResourceNotFoundException {

    public TrackingNotFoundException(String message) {
        super(message);
    }
}
