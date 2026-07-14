package com.lastmile.deliverytracker.shipment.dto.request;

import com.lastmile.deliverytracker.shipment.enums.PaymentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import com.lastmile.deliverytracker.shipment.enums.OrderType;
import com.lastmile.deliverytracker.shipment.enums.PaymentType;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateShipmentRequest {

    @NotBlank
    @Size(max = 255)
    private String pickupAddress;

    @NotBlank
    @Size(max = 255)
    private String deliveryAddress;

    @NotBlank
    @Size(max = 10)
    private String pickupPincode;

    @NotBlank
    @Size(max = 10)
    private String deliveryPincode;

    @NotBlank
    @Size(max = 100)
    private String receiverName;

    @NotBlank
    @Size(max = 15)
    private String receiverPhone;

    @NotNull
    @Positive
    private BigDecimal actualWeight;

    @NotNull
    private PaymentType paymentType;

    @NotNull
    @Positive
    private BigDecimal length;

    @NotNull
    @Positive
    private BigDecimal width;

    @NotNull
    @Positive
    private BigDecimal height;

    @NotNull
    private OrderType orderType;
}
