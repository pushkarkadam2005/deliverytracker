package com.lastmile.deliverytracker.tracking.dto.response;

import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingHistoryResponse {
    private ShipmentStatus shipmentStatus;
    private String location;
    private String remarks;
    private LocalDateTime updatedAt;
    private String actor;
}
