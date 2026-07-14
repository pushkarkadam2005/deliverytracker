package com.lastmile.deliverytracker.notification.service;

import com.lastmile.deliverytracker.auth.entity.User;
import com.lastmile.deliverytracker.notification.dto.response.NotificationResponse;
import com.lastmile.deliverytracker.notification.enums.NotificationType;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    /**
     * Creates and persists a new Notification for the given user and shipment.
     * Called internally by other services (Shipment, Tracking, etc.) when a
     * lifecycle event occurs. Future: will also publish email / SMS / push events.
     *
     * @param user     the recipient User entity
     * @param shipment the related Shipment entity (may be null for system notifications)
     * @param type     the notification type / lifecycle event
     * @param title    short summary shown in inbox headers
     * @param message  full notification body
     */
    void createNotification(User user,
                            Shipment shipment,
                            NotificationType type,
                            String title,
                            String message);

    /**
     * Returns a paginated inbox for the currently authenticated user,
     * ordered by createdAt DESC (newest first).
     */
    Page<NotificationResponse> getMyNotifications(Pageable pageable);

    /**
     * Marks the notification with the given id as read.
     * Validates that the notification belongs to the authenticated user.
     *
     * @throws com.lastmile.deliverytracker.notification.exception.NotificationNotFoundException
     *         if the notification does not exist or does not belong to the user
     */
    NotificationResponse markAsRead(Long notificationId);

    /**
     * Returns the count of unread notifications for the currently authenticated user.
     * Intended for notification badge rendering on the frontend.
     */
    long getUnreadCount();
}
