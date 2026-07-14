package com.lastmile.deliverytracker.admin.dto.response;

import com.lastmile.deliverytracker.auth.enums.Role;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAdminResponse {

    private Long userId;
    private String fullName;
    private String email;
    private Role role;
    private Boolean active;
}
