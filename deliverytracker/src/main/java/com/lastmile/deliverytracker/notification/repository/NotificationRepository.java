package com.lastmile.deliverytracker.notification.repository;

import com.lastmile.deliverytracker.auth.entity.User;
import com.lastmile.deliverytracker.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Paginated notifications for a user — newest first
    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    // Ownership-safe lookup — prevents users from accessing others' notifications
    Optional<Notification> findByIdAndUser(Long id, User user);

    // Count badge: unread notifications for a user
    long countByUserAndIsReadFalse(User user);
}
