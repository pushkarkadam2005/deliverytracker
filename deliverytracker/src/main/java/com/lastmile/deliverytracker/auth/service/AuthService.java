package com.lastmile.deliverytracker.auth.service;

import com.lastmile.deliverytracker.auth.dto.LoginRequest;
import com.lastmile.deliverytracker.auth.dto.LoginResponse;
import com.lastmile.deliverytracker.auth.dto.RegisterRequest;
import com.lastmile.deliverytracker.auth.dto.RegisterResponse;

public interface AuthService {
    RegisterResponse register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
}
