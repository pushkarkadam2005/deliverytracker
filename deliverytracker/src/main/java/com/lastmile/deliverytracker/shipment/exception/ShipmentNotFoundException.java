package com.lastmile.deliverytracker.shipment.exception;

import com.lastmile.deliverytracker.common.exception.ResourceNotFoundException;

public class ShipmentNotFoundException extends ResourceNotFoundException {

    public ShipmentNotFoundException(String message) {
        super(message);
    }
}
