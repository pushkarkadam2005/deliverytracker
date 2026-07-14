package com.lastmile.deliverytracker.pricing.exception;

import com.lastmile.deliverytracker.common.exception.ResourceNotFoundException;

public class AreaNotFoundException extends ResourceNotFoundException {
    public AreaNotFoundException(String message) {
        super(message);
    }
}
