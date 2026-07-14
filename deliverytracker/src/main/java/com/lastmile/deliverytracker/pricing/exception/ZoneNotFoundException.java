package com.lastmile.deliverytracker.pricing.exception;

import com.lastmile.deliverytracker.common.exception.ResourceNotFoundException;

public class ZoneNotFoundException extends ResourceNotFoundException {
    public ZoneNotFoundException(String message) {
        super(message);
    }
}
