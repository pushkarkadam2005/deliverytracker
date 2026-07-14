package com.lastmile.deliverytracker.admin.dto.response;

import com.lastmile.deliverytracker.auth.enums.AvailabilityStatus;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentAdminResponse {

    private Long agentId;
    private String name;
    private String email;
    private String phone;
    private Boolean active;
    private AvailabilityStatus availability;
    private long activeAssignments;
}
