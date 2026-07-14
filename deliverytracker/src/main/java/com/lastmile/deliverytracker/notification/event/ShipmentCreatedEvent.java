package com.lastmile.deliverytracker.notification.event;

import com.lastmile.deliverytracker.auth.entity.User;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when a new shipment is registered in the system.
 */
@Getter
public class ShipmentCreatedEvent extends ApplicationEvent {

    private final Shipment shipment;
    private final User user;

    public ShipmentCreatedEvent(Object source, Shipment shipment, User user) {
        super(source);
        this.shipment = shipment;
        this.user = user;
    }
}
