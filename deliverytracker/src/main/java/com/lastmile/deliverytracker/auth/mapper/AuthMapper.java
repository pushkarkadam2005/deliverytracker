package com.lastmile.deliverytracker.auth.mapper;

import com.lastmile.deliverytracker.auth.dto.LoginResponse;
import com.lastmile.deliverytracker.auth.dto.RegisterRequest;
import com.lastmile.deliverytracker.auth.dto.RegisterResponse;
import com.lastmile.deliverytracker.auth.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface AuthMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true) // Ignored because password must be hashed before saving
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "customerProfile", ignore = true)
    @Mapping(target = "deliveryAgent", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toUser(RegisterRequest request);

    @Mapping(target = "message", ignore = true)
    RegisterResponse toRegisterResponse(User user);

    @Mapping(target = "token", source = "token")
    @Mapping(target = "id", source = "user.id")
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "email", source = "user.email")
    @Mapping(target = "role", source = "user.role")
    LoginResponse toLoginResponse(User user, String token);
}
