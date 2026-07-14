package com.lastmile.deliverytracker.admin.dto.response;

import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentAdminResponse {

    private Long shipmentId;
    private String trackingNumber;
    private String customerName;
    private ShipmentStatus shipmentStatus;
    private BigDecimal totalCharge;
    private LocalDateTime createdAt;
}
