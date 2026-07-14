package com.lastmile.deliverytracker.auth.dto;

import com.lastmile.deliverytracker.auth.enums.Role;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {
    private String token;
    private Long id;
    private String fullName;
    private String email;
    private Role role;
}
