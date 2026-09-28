package com.saas.Dashboard;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.saas.Dashboard.dto.*;
import com.saas.Dashboard.entity.ChatMessage;
import com.saas.Dashboard.service.ChatService;
import com.saas.Dashboard.security.TenantContext;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class DemoAuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ChatService chatService;

    @Test
    public void test1_DemoLoginEndpointAndIdentity() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/demo-login"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.role").value("DEMO"))
                .andExpect(jsonPath("$.tenantName").value("Acme Corp (Demo)"))
                .andExpect(jsonPath("$.tenantId").exists())
                .andReturn();

        String responseJson = result.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(responseJson, AuthResponse.class);
        assertNotNull(authResponse.getToken());
        assertFalse(authResponse.getToken().isBlank());
        assertEquals("DEMO", authResponse.getRole());
        assertEquals("Acme Corp (Demo)", authResponse.getTenantName());
        assertNotNull(authResponse.getTenantId());
    }

    @Test
    public void test2_DemoAuthenticatedGETAPIsAndDataLoading() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/auth/demo-login"))
                .andExpect(status().isOk())
                .andReturn();

        AuthResponse auth = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthResponse.class);
        String demoToken = auth.getToken();

        // Tenant Me
        mockMvc.perform(get("/api/tenant/me")
                        .header("Authorization", "Bearer " + demoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("recruiter.demo@demo.com"))
                .andExpect(jsonPath("$.role").value("DEMO"))
                .andExpect(jsonPath("$.tenantId").value(auth.getTenantId()));

        // Dashboard Analytics Stats
        mockMvc.perform(get("/api/analytics/stats")
                        .header("Authorization", "Bearer " + demoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalMembers").exists())
                .andExpect(jsonPath("$.totalEvents").exists())
                .andExpect(jsonPath("$.eventsByType").exists())
                .andExpect(jsonPath("$.activityByDay").exists());

        // Members List
        mockMvc.perform(get("/api/members")
                        .header("Authorization", "Bearer " + demoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Attendance Status & History
        mockMvc.perform(get("/api/attendance/today/status")
                        .header("Authorization", "Bearer " + demoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("recruiter.demo@demo.com"));

        mockMvc.perform(get("/api/attendance/history")
                        .header("Authorization", "Bearer " + demoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/attendance/analytics")
                        .header("Authorization", "Bearer " + demoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalMembers").exists());

        // Chat Messages
        mockMvc.perform(get("/api/chat/messages")
                        .header("Authorization", "Bearer " + demoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // Profile Me
        mockMvc.perform(get("/api/profile/me")
                        .header("Authorization", "Bearer " + demoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userEmail").value("recruiter.demo@demo.com"));

        // All Member Profiles (Admin/Demo view)
        mockMvc.perform(get("/api/profile/members")
                        .header("Authorization", "Bearer " + demoToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    public void test3_DemoRestrictedWriteOperationsRejection() throws Exception {
        MvcResult loginResult = mockMvc.perform(post("/api/auth/demo-login"))
                .andExpect(status().isOk())
                .andReturn();

        String demoToken = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // Attempt Member Invite
        InviteMemberRequest inviteReq = new InviteMemberRequest();
        inviteReq.setEmail("vandal@test.com");
        inviteReq.setPassword("password123");
        inviteReq.setRole("MEMBER");

        mockMvc.perform(post("/api/members/invite")
                        .header("Authorization", "Bearer " + demoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inviteReq)))
                .andExpect(status().isForbidden());

        // Attempt Profile Update
        ProfileUpdateRequest profileReq = new ProfileUpdateRequest();
        profileReq.setFullName("Unauthorized Name Change");

        mockMvc.perform(put("/api/profile/me")
                        .header("Authorization", "Bearer " + demoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(profileReq)))
                .andExpect(status().isForbidden());

        // Attempt Mark Attendance
        mockMvc.perform(post("/api/attendance/mark")
                        .header("Authorization", "Bearer " + demoToken))
                .andExpect(status().isForbidden());

        // Attempt Document Delete
        mockMvc.perform(delete("/api/profile/documents/doc-123")
                        .header("Authorization", "Bearer " + demoToken))
                .andExpect(status().isForbidden());
    }

    @Test
    public void test4_SuperAdminMethodSecurity() throws Exception {
        // Super Admin Login
        LoginRequest adminLoginReq = new LoginRequest();
        adminLoginReq.setEmail("admin@platform.com");
        adminLoginReq.setPassword("admin123");

        MvcResult adminLoginResult = mockMvc.perform(post("/api/auth/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLoginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("SUPER_ADMIN"))
                .andReturn();

        String superAdminToken = objectMapper.readValue(adminLoginResult.getResponse().getContentAsString(), AuthResponse.class).getToken();

        // SUPER_ADMIN accesses /api/admin/tenants -> 200 OK
        mockMvc.perform(get("/api/admin/tenants")
                        .header("Authorization", "Bearer " + superAdminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        // DEMO user accesses /api/admin/tenants -> 403 Forbidden
        MvcResult demoLoginResult = mockMvc.perform(post("/api/auth/demo-login"))
                .andExpect(status().isOk())
                .andReturn();
        String demoToken = objectMapper.readValue(demoLoginResult.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/admin/tenants")
                        .header("Authorization", "Bearer " + demoToken))
                .andExpect(status().isForbidden());
    }

    @Test
    public void test5_NormalSignupLoginAndTenantIsolation() throws Exception {
        SignupRequest signupReq = new SignupRequest();
        signupReq.setCompanyName("Testing Organization " + System.currentTimeMillis());
        signupReq.setSubdomain("testorg" + System.currentTimeMillis());
        signupReq.setEmail("admin" + System.currentTimeMillis() + "@testorg.com");
        signupReq.setPassword("SecurePassword123!");

        MvcResult signupResult = mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.role").value("ORG_ADMIN"))
                .andReturn();

        AuthResponse signupAuth = objectMapper.readValue(signupResult.getResponse().getContentAsString(), AuthResponse.class);
        String realUserToken = signupAuth.getToken();
        String realTenantId = signupAuth.getTenantId();

        assertNotNull(realUserToken);
        assertNotNull(realTenantId);

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail(signupReq.getEmail());
        loginReq.setPassword(signupReq.getPassword());

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.role").value("ORG_ADMIN"))
                .andReturn();

        String realLoginToken = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthResponse.class).getToken();

        mockMvc.perform(get("/api/tenant/me")
                        .header("Authorization", "Bearer " + realLoginToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(signupReq.getEmail()))
                .andExpect(jsonPath("$.role").value("ORG_ADMIN"))
                .andExpect(jsonPath("$.tenantId").value(realTenantId));

        // ORG_ADMIN accesses /api/admin/tenants -> 403 Forbidden
        mockMvc.perform(get("/api/admin/tenants")
                        .header("Authorization", "Bearer " + realLoginToken))
                .andExpect(status().isForbidden());

        // Tenant Isolation
        MvcResult realMembersResult = mockMvc.perform(get("/api/members")
                        .header("Authorization", "Bearer " + realLoginToken))
                .andExpect(status().isOk())
                .andReturn();

        String realMembersJson = realMembersResult.getResponse().getContentAsString();
        assertTrue(realMembersJson.contains(signupReq.getEmail()));
        assertFalse(realMembersJson.contains("recruiter.demo@demo.com"));

        MvcResult demoLoginResult = mockMvc.perform(post("/api/auth/demo-login"))
                .andExpect(status().isOk())
                .andReturn();

        String demoToken = objectMapper.readValue(demoLoginResult.getResponse().getContentAsString(), AuthResponse.class).getToken();

        MvcResult demoMembersResult = mockMvc.perform(get("/api/members")
                        .header("Authorization", "Bearer " + demoToken))
                .andExpect(status().isOk())
                .andReturn();

        String demoMembersJson = demoMembersResult.getResponse().getContentAsString();
        assertFalse(demoMembersJson.contains(signupReq.getEmail()));
        assertTrue(demoMembersJson.contains("recruiter.demo@demo.com"));
    }

    @Test
    public void test6_StompTenantSecurityInChatService() {
        try {
            TenantContext.clear();
            ChatMessageRequest req = new ChatMessageRequest();
            req.setContent("Test message without tenant context");
            req.setTenantId("fake-victim-tenant");

            // Rejects when TenantContext is missing
            ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> chatService.saveMessage(req));
            assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());

            // When TenantContext is set, forces tenantId from TenantContext and ignores payload tenantId
            TenantContext.setTenantId("real-authenticated-tenant");
            TenantContext.setRole("ORG_ADMIN");
            TenantContext.setEmail("test@authenticated.com");

            ChatMessage saved = chatService.saveMessage(req);
            assertEquals("real-authenticated-tenant", saved.getTenantId());
            assertNotEquals("fake-victim-tenant", saved.getTenantId());
        } finally {
            TenantContext.clear();
        }
    }
}
