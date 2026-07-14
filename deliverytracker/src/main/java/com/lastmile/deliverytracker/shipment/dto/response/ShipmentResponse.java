package com.lastmile.deliverytracker.shipment.dto.response;

import com.lastmile.deliverytracker.shipment.enums.OrderType;
import com.lastmile.deliverytracker.shipment.enums.PaymentType;
import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentResponse {

    private Long id;
    private String trackingNumber;
    private String pickupAddress;
    private String deliveryAddress;
    private String pickupPincode;
    private String deliveryPincode;
    private String receiverName;
    private String receiverPhone;
    private BigDecimal actualWeight;
    private BigDecimal volumetricWeight;
    private BigDecimal billableWeight;
    private PaymentType paymentType;
    private ShipmentStatus shipmentStatus;
    private LocalDateTime createdAt;

    private BigDecimal length;
    private BigDecimal width;
    private BigDecimal height;
    private OrderType orderType;
    private LocalDateTime rescheduledDate;

    private AgentDetailsResponse agentDetails;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgentDetailsResponse {
        private String name;
        private String phone;
        private String vehicle;
        private String rating;
    }
}
