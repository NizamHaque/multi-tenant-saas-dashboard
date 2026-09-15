package com.saas.Dashboard.controller;

import com.saas.Dashboard.security.TenantContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tenant")
public class TenantController {

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        return ResponseEntity.ok(Map.of(
                "email", TenantContext.getEmail(),
                "tenantId", TenantContext.getTenantId(),
                "role", TenantContext.getRole()
        ));
    }
}