package com.saas.Dashboard.service;

import com.saas.Dashboard.dto.*;
import com.saas.Dashboard.entity.*;
import com.saas.Dashboard.repository.*;
import com.saas.Dashboard.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EventLogger eventLogger;

    public AuthResponse signup(SignupRequest request) {
        if (tenantRepository.existsByName(request.getCompanyName()))
            throw new RuntimeException("Company name already exists");
        if (tenantRepository.existsBySubdomain(request.getSubdomain()))
            throw new RuntimeException("Subdomain already taken");
        if (userRepository.existsByEmail(request.getEmail()))
            throw new RuntimeException("Email already registered");

        Tenant tenant = new Tenant();
        tenant.setName(request.getCompanyName());
        tenant.setSubdomain(request.getSubdomain().toLowerCase());
        tenant = tenantRepository.save(tenant);

        User user = new User();
        user.setTenantId(tenant.getId());
        user.setTenantName(tenant.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("ORG_ADMIN");
        userRepository.save(user);

        eventLogger.log(
                tenant.getId(),
                request.getEmail(),
                "USER_SIGNUP",
                request.getEmail() + " created the organisation"
        );

        String token = jwtUtil.generateToken(user.getEmail(), tenant.getId(), user.getRole());
        return new AuthResponse(token, user.getRole(), tenant.getName(), tenant.getId());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash()))
            throw new RuntimeException("Invalid email or password");

        eventLogger.log(
                user.getTenantId(),
                user.getEmail(),
                "USER_LOGIN",
                user.getEmail() + " logged in"
        );

        String token = jwtUtil.generateToken(user.getEmail(), user.getTenantId(), user.getRole());
        return new AuthResponse(token, user.getRole(), user.getTenantName(), user.getTenantId());
    }
}