package com.lastmile.deliverytracker.notification.service;

import com.lastmile.deliverytracker.auth.entity.User;
import com.lastmile.deliverytracker.auth.repository.UserRepository;
import com.lastmile.deliverytracker.auth.repository.CustomerProfileRepository;
import com.lastmile.deliverytracker.auth.repository.DeliveryAgentRepository;
import com.lastmile.deliverytracker.notification.dto.response.NotificationResponse;
import com.lastmile.deliverytracker.notification.entity.Notification;
import com.lastmile.deliverytracker.notification.enums.NotificationType;
import com.lastmile.deliverytracker.notification.exception.NotificationNotFoundException;
import com.lastmile.deliverytracker.notification.mapper.NotificationMapper;
import com.lastmile.deliverytracker.notification.repository.NotificationRepository;
import com.lastmile.deliverytracker.shipment.entity.Shipment;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation managing user notifications.
 *
 * <p><strong>Transaction Strategy:</strong> Employs read-only transaction defaults at the class level
 * to maximize database read performance. Modifying write methods explicitly override this behavior.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    // ----------------------------------------------------------------
    // Internal helper — resolves the authenticated user from the
    // Spring Security context.  Shared by all methods that need
    // the calling user's identity.
    // ----------------------------------------------------------------
    private User resolveAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found: " + email));
    }

    /**
     * Creates a new user notification, typically triggered by log events, and saves it.
     */
    @Override
    @Transactional
    public void createNotification(User user,
                                   Shipment shipment,
                                   NotificationType type,
                                   String title,
                                   String message) {
        log.debug("Creating notification of type [{}] for user [{}]", type, user.getEmail());

        Notification notification = Notification.builder()
                .user(user)
                .shipment(shipment)
                .type(type)
                .title(title)
                .message(message)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        log.debug("Notification persisted successfully for user [{}], type [{}]", user.getEmail(), type);

        // Dispatch Email
        if (user.getEmail() != null) {
            emailService.sendEmail(user.getEmail(), title, message);
        }

        // Resolve phone number and Dispatch SMS
        String phone = null;
        if (user.getRole() == com.lastmile.deliverytracker.auth.enums.Role.CUSTOMER) {
            phone = customerProfileRepository.findByUserId(user.getId())
                    .map(com.lastmile.deliverytracker.auth.entity.CustomerProfile::getPhone)
                    .orElse(null);
        } else if (user.getRole() == com.lastmile.deliverytracker.auth.enums.Role.AGENT) {
            phone = deliveryAgentRepository.findByUserId(user.getId())
                    .map(com.lastmile.deliverytracker.auth.entity.DeliveryAgent::getPhone)
                    .orElse(null);
        }

        if (phone != null) {
            smsService.sendSms(phone, message);
        }
    }

    // ----------------------------------------------------------------
    // getMyNotifications()
    // Returns paginated inbox for the authenticated user, newest first.
    // ----------------------------------------------------------------
    @Override
    public Page<NotificationResponse> getMyNotifications(Pageable pageable) {
        User user = resolveAuthenticatedUser();
        log.debug("Fetching notifications for user [{}], page [{}]", user.getEmail(), pageable.getPageNumber());

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user, pageable)
                .map(notificationMapper::toResponse);
    }

    /**
     * Marks a specific user notification read. Validates user ownership.
     */
    @Override
    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        User user = resolveAuthenticatedUser();
        log.info("Marking notification [{}] as read for user [{}]", notificationId, user.getEmail());

        Notification notification = notificationRepository.findByIdAndUser(notificationId, user)
                .orElseThrow(() -> new NotificationNotFoundException(
                        "Notification not found with id: " + notificationId));

        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);

        log.debug("Notification [{}] marked as read", notificationId);
        return notificationMapper.toResponse(saved);
    }

    // ----------------------------------------------------------------
    // getUnreadCount()
    // Lightweight count query — no entity hydration needed.
    // ----------------------------------------------------------------
    @Override
    public long getUnreadCount() {
        User user = resolveAuthenticatedUser();
        long count = notificationRepository.countByUserAndIsReadFalse(user);
        log.debug("Unread notification count for user [{}]: {}", user.getEmail(), count);
        return count;
    }
}
