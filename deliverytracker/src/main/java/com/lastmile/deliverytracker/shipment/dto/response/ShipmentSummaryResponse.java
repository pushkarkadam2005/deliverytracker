package com.lastmile.deliverytracker.shipment.dto.response;

import com.lastmile.deliverytracker.shipment.enums.OrderType;
import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentSummaryResponse {

    private String trackingNumber;
    private String receiverName;
    private ShipmentStatus shipmentStatus;
    private BigDecimal billableWeight;
    private LocalDateTime createdAt;
    private OrderType orderType;
}
