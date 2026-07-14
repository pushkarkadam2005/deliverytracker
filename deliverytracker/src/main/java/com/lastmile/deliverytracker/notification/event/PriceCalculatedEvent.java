package com.lastmile.deliverytracker.notification.event;

import com.lastmile.deliverytracker.auth.entity.User;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when pricing charges have been calculated for a shipment.
 */
@Getter
public class PriceCalculatedEvent extends ApplicationEvent {

    private final Shipment shipment;
    private final User user;

    public PriceCalculatedEvent(Object source, Shipment shipment, User user) {
        super(source);
        this.shipment = shipment;
        this.user = user;
    }
}
