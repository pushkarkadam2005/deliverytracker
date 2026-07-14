package com.lastmile.deliverytracker.shipment.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RescheduleRequest {

    @NotNull
    private LocalDateTime rescheduledDate;
}
