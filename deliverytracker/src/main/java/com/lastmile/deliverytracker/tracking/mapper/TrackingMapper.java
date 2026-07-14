package com.lastmile.deliverytracker.tracking.mapper;

import com.lastmile.deliverytracker.shipment.entity.Shipment;
import com.lastmile.deliverytracker.tracking.dto.response.TrackingHistoryResponse;
import com.lastmile.deliverytracker.tracking.dto.response.TrackingTimelineResponse;
import com.lastmile.deliverytracker.tracking.entity.TrackingHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface TrackingMapper {

    TrackingHistoryResponse toResponse(TrackingHistory entity);

    @Mapping(source = "shipment.trackingNumber", target = "trackingNumber")
    @Mapping(source = "shipment.shipmentStatus", target = "currentStatus")
    @Mapping(source = "history", target = "history")
    TrackingTimelineResponse toTimelineResponse(Shipment shipment, List<TrackingHistoryResponse> history);
}
