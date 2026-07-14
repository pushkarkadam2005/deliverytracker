package com.lastmile.deliverytracker.admin.dto.response;

import lombok.*;

import com.lastmile.deliverytracker.shipment.enums.OrderType;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RateCardAdminResponse {

    private Long id;
    private String pickupZone;
    private String deliveryZone;
    private BigDecimal baseCharge;
    private BigDecimal pricePerKg;
    private Boolean active;
    private OrderType orderType;
}
