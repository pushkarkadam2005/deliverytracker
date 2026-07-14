package com.lastmile.deliverytracker.notification.event;

import com.lastmile.deliverytracker.auth.entity.DeliveryAgent;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when a delivery agent is assigned to a shipment.
 */
@Getter
public class AssignmentCreatedEvent extends ApplicationEvent {

    private final Shipment shipment;
    private final DeliveryAgent deliveryAgent;

    public AssignmentCreatedEvent(Object source, Shipment shipment, DeliveryAgent deliveryAgent) {
        super(source);
        this.shipment = shipment;
        this.deliveryAgent = deliveryAgent;
    }
}
