package com.saas.Dashboard.controller;

import com.saas.Dashboard.entity.Tenant;
import com.saas.Dashboard.repository.TenantRepository;
import com.saas.Dashboard.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final TenantRepository tenantRepository;
    private final JwtUtil jwtUtil;

    @GetMapping("/tenants")
    public ResponseEntity<?> getAllTenants(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.isTokenValid(token) || !"SUPER_ADMIN".equals(jwtUtil.extractRole(token))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(tenantRepository.findAll());
    }
}
