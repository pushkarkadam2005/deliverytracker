package com.lastmile.deliverytracker.tracking.dto.response;

import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingTimelineResponse {
    private String trackingNumber;
    private ShipmentStatus currentStatus;
    private List<TrackingHistoryResponse> history;
}
