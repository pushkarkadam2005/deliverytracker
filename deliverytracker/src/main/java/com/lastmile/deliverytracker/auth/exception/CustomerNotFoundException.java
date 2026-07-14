package com.lastmile.deliverytracker.auth.exception;

import com.lastmile.deliverytracker.common.exception.ResourceNotFoundException;

public class CustomerNotFoundException extends ResourceNotFoundException {
    public CustomerNotFoundException(String message) {
        super(message);
    }
}
