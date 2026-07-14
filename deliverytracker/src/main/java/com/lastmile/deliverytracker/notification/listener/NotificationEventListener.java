package com.lastmile.deliverytracker.notification.listener;

import com.lastmile.deliverytracker.notification.enums.NotificationType;
import com.lastmile.deliverytracker.notification.event.AssignmentCreatedEvent;
import com.lastmile.deliverytracker.notification.event.PriceCalculatedEvent;
import com.lastmile.deliverytracker.notification.event.ShipmentCreatedEvent;
import com.lastmile.deliverytracker.notification.event.TrackingUpdatedEvent;
import com.lastmile.deliverytracker.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Event listener class in the notification module.
 * Listens to transactional business events and automatically generates user-facing alerts.
 */
@Component
@Async
@RequiredArgsConstructor
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);

    private final NotificationService notificationService;

    /**
     * Handles shipment creation events. Sends notification to customer.
     */
    @EventListener
    public void handleShipmentCreated(ShipmentCreatedEvent event) {
        log.debug("Received ShipmentCreatedEvent for shipment: {}", event.getShipment().getTrackingNumber());
        notificationService.createNotification(
                event.getUser(),
                event.getShipment(),
                NotificationType.SHIPMENT_CREATED,
                "Shipment Registered",
                "Your shipment [" + event.getShipment().getTrackingNumber() + "] has been successfully registered."
        );
    }

    /**
     * Handles pricing calculations events. Sends notification to customer.
     */
    @EventListener
    public void handlePriceCalculated(PriceCalculatedEvent event) {
        log.debug("Received PriceCalculatedEvent for shipment: {}", event.getShipment().getTrackingNumber());
        notificationService.createNotification(
                event.getUser(),
                event.getShipment(),
                NotificationType.PRICE_CALCULATED,
                "Shipment Charges Calculated",
                "Charges have been calculated for your shipment [" + event.getShipment().getTrackingNumber() + "]."
        );
    }

    /**
     * Handles agent assignment events. Sends notification to both customer and delivery agent.
     */
    @EventListener
    public void handleAssignmentCreated(AssignmentCreatedEvent event) {
        log.debug("Received AssignmentCreatedEvent for shipment: {}", event.getShipment().getTrackingNumber());

        // Notify customer
        if (event.getShipment().getCustomer() != null && event.getShipment().getCustomer().getUser() != null) {
            notificationService.createNotification(
                    event.getShipment().getCustomer().getUser(),
                    event.getShipment(),
                    NotificationType.AGENT_ASSIGNED,
                    "Delivery Agent Assigned",
                    "Delivery agent [" + event.getDeliveryAgent().getUser().getFullName() + "] has been assigned to your shipment."
            );
        }

        // Notify agent
        notificationService.createNotification(
                event.getDeliveryAgent().getUser(),
                event.getShipment(),
                NotificationType.AGENT_ASSIGNED,
                "New Shipment Assigned",
                "You have been assigned a new shipment [" + event.getShipment().getTrackingNumber() + "] for pickup."
        );
    }

    /**
     * Handles tracking updates events. Maps status and notifies the customer.
     */
    @EventListener
    public void handleTrackingUpdated(TrackingUpdatedEvent event) {
        log.debug("Received TrackingUpdatedEvent for shipment: {}", event.getShipment().getTrackingNumber());

        if (event.getShipment().getCustomer() != null && event.getShipment().getCustomer().getUser() != null) {
            NotificationType notifType;
            try {
                notifType = NotificationType.valueOf(event.getTrackingHistory().getShipmentStatus().name());
                if (notifType == NotificationType.FAILED) {
                    notifType = NotificationType.CANCELLED;
                }
            } catch (IllegalArgumentException e) {
                notifType = NotificationType.IN_TRANSIT;
            }

            notificationService.createNotification(
                    event.getShipment().getCustomer().getUser(),
                    event.getShipment(),
                    notifType,
                    "Shipment Update: " + event.getTrackingHistory().getShipmentStatus(),
                    "Your shipment [" + event.getShipment().getTrackingNumber() + "] is now " + event.getTrackingHistory().getShipmentStatus() + " at " + event.getTrackingHistory().getLocation() + "."
            );
        }
    }
}
