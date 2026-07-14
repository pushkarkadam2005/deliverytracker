package com.lastmile.deliverytracker.assignment.exception;

import com.lastmile.deliverytracker.common.exception.ResourceNotFoundException;

public class AssignmentNotFoundException extends ResourceNotFoundException {

    public AssignmentNotFoundException(String message) {
        super(message);
    }
}
