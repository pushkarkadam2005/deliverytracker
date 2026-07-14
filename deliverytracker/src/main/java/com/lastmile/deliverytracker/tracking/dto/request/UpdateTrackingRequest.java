package com.lastmile.deliverytracker.tracking.dto.request;

import com.lastmile.deliverytracker.shipment.enums.ShipmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTrackingRequest {

    @NotNull
    private ShipmentStatus shipmentStatus;

    @Size(max = 150)
    private String location;

    @Size(max = 255)
    private String remarks;
}
