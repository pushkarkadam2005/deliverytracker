package com.lastmile.deliverytracker.auth.exception;

import com.lastmile.deliverytracker.common.exception.ResourceNotFoundException;

public class DeliveryAgentNotFoundException extends ResourceNotFoundException {
    public DeliveryAgentNotFoundException(String message) {
        super(message);
    }
}
