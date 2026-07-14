package com.lastmile.deliverytracker.shipment.dto.request;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateShipmentRequest {

    @Size(max = 100)
    private String receiverName;

    @Size(max = 15)
    private String receiverPhone;

    @Size(max = 255)
    private String deliveryAddress;

    @Size(max = 10)
    private String deliveryPincode;
}
