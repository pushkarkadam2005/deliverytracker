package com.lastmile.deliverytracker.notification.exception;

import com.lastmile.deliverytracker.common.exception.ResourceNotFoundException;

public class NotificationNotFoundException extends ResourceNotFoundException {

    public NotificationNotFoundException(String message) {
        super(message);
    }
}
