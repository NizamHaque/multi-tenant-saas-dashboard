package com.saas.Dashboard.service;

import com.saas.Dashboard.dto.InviteMemberRequest;
import com.saas.Dashboard.dto.MemberResponse;
import com.saas.Dashboard.entity.User;
import com.saas.Dashboard.repository.UserRepository;
import com.saas.Dashboard.repository.TenantRepository;
import com.saas.Dashboard.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final EventLogger eventLogger;

    public MemberResponse inviteMember(InviteMemberRequest request) {

        String tenantId = TenantContext.getTenantId();
        String role = TenantContext.getRole();

        if (!"ORG_ADMIN".equals(role)) {
            throw new RuntimeException("Only ORG_ADMIN can invite members");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        var tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        User user = new User();
        user.setTenantId(tenantId);
        user.setTenantName(tenant.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole().toUpperCase());
        userRepository.save(user);

        eventLogger.log(
                tenantId,
                TenantContext.getEmail(),
                "MEMBER_INVITED",
                TenantContext.getEmail() + " invited " + request.getEmail()
                        + " as " + request.getRole()
        );

        return new MemberResponse(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                tenantId,
                tenant.getName()
        );
    }

    public List<MemberResponse> getAllMembers() {

        String tenantId = TenantContext.getTenantId();

        return userRepository.findAllByTenantId(tenantId)
                .stream()
                .map(u -> new MemberResponse(
                        u.getId(),
                        u.getEmail(),
                        u.getRole(),
                        u.getTenantId(),
                        u.getTenantName()
                ))
                .collect(Collectors.toList());
    }
}