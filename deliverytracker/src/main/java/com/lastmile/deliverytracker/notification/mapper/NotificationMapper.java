package com.lastmile.deliverytracker.notification.mapper;

import com.lastmile.deliverytracker.notification.dto.response.NotificationResponse;
import com.lastmile.deliverytracker.notification.entity.Notification;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface NotificationMapper {

    /**
     * Maps a single Notification entity to its response DTO.
     * MapStruct auto-maps id, type, title, message, isRead, createdAt
     * by name — no explicit @Mapping annotations are required.
     */
    NotificationResponse toResponse(Notification entity);

    /**
     * Convenience method to map an entire list in one call.
     * MapStruct generates a loop that delegates to toResponse() per element.
     */
    List<NotificationResponse> toResponseList(List<Notification> entities);
}
