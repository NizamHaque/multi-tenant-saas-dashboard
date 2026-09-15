package com.saas.Dashboard.service;

import com.saas.Dashboard.dto.AuthResponse;
import com.saas.Dashboard.dto.LoginRequest;
import com.saas.Dashboard.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final JwtUtil jwtUtil;

    @Value("${superadmin.email}")
    private String superAdminEmail;

    @Value("${superadmin.password}")
    private String superAdminPassword;

    public AuthResponse login(LoginRequest request) {
        if (!superAdminEmail.equalsIgnoreCase(request.getEmail())
                || !superAdminPassword.equals(request.getPassword())) {
            throw new RuntimeException("Invalid super admin credentials");
        }

        String token = jwtUtil.generateToken(
                superAdminEmail.toLowerCase(),
                "SYSTEM",
                "SUPER_ADMIN"
        );

        return new AuthResponse(token, "SUPER_ADMIN", "Platform Admin", "SYSTEM");
    }
}
