package com.lastmile.deliverytracker.admin.exception;

import com.lastmile.deliverytracker.common.exception.ResourceNotFoundException;

public class AdminUserNotFoundException extends ResourceNotFoundException {

    public AdminUserNotFoundException(String message) {
        super(message);
    }
}
