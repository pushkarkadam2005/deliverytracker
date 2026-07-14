package com.lastmile.deliverytracker.pricing.exception;

import com.lastmile.deliverytracker.common.exception.ResourceNotFoundException;

public class RateCardNotFoundException extends ResourceNotFoundException {

    public RateCardNotFoundException(String message) {
        super(message);
    }
}
