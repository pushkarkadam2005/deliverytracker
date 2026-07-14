package com.lastmile.deliverytracker.auth.service;

import com.lastmile.deliverytracker.auth.dto.LoginRequest;
import com.lastmile.deliverytracker.auth.dto.LoginResponse;
import com.lastmile.deliverytracker.auth.dto.RegisterRequest;
import com.lastmile.deliverytracker.auth.dto.RegisterResponse;
import com.lastmile.deliverytracker.auth.entity.CustomerProfile;
import com.lastmile.deliverytracker.auth.entity.DeliveryAgent;
import com.lastmile.deliverytracker.auth.entity.User;
import com.lastmile.deliverytracker.auth.enums.AvailabilityStatus;
import com.lastmile.deliverytracker.auth.enums.Role;
import com.lastmile.deliverytracker.auth.mapper.AuthMapper;
import com.lastmile.deliverytracker.auth.repository.CustomerProfileRepository;
import com.lastmile.deliverytracker.auth.repository.DeliveryAgentRepository;
import com.lastmile.deliverytracker.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation managing user registration and session login authentication.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final DeliveryAgentRepository deliveryAgentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthMapper authMapper;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    /**
     * Registers a new user (Customer, Agent, or Admin) and sets their password hash credentials.
     * Enforces write transaction scope.
     */
    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = authMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == Role.CUSTOMER) {
            CustomerProfile profile = CustomerProfile.builder()
                    .user(savedUser)
                    .phone(request.getPhone())
                    .defaultAddress(request.getDefaultAddress())
                    .build();
            customerProfileRepository.save(profile);
        } else if (savedUser.getRole() == Role.AGENT) {
            DeliveryAgent agent = DeliveryAgent.builder()
                    .user(savedUser)
                    .phone(request.getPhone())
                    .vehicleNumber(request.getVehicleNumber())
                    .availabilityStatus(AvailabilityStatus.AVAILABLE)
                    .build();
            deliveryAgentRepository.save(agent);
        }

        RegisterResponse response = authMapper.toRegisterResponse(savedUser);
        response.setMessage("User registered successfully");
        return response;
    }

    /**
     * Authenticates credentials and generates a secure bearer JWT token.
     */
    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (!user.getIsActive()) {
            throw new IllegalArgumentException("User account is inactive");
        }

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtService.generateToken(userDetails);

        return authMapper.toLoginResponse(user, token);
    }
}
