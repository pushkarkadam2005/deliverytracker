package com.lastmile.deliverytracker.notification.event;

import com.lastmile.deliverytracker.shipment.entity.Shipment;
import com.lastmile.deliverytracker.tracking.entity.TrackingHistory;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when tracking status history is updated for a shipment.
 */
@Getter
public class TrackingUpdatedEvent extends ApplicationEvent {

    private final Shipment shipment;
    private final TrackingHistory trackingHistory;

    public TrackingUpdatedEvent(Object source, Shipment shipment, TrackingHistory trackingHistory) {
        super(source);
        this.shipment = shipment;
        this.trackingHistory = trackingHistory;
    }
}
