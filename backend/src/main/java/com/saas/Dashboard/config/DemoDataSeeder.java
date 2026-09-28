package com.saas.Dashboard.config;

import com.saas.Dashboard.entity.*;
import com.saas.Dashboard.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder implements CommandLineRunner {

    public static final String DEMO_TENANT_SUBDOMAIN = "demo";
    public static final String DEMO_TENANT_NAME = "Acme Corp (Demo)";
    public static final String DEMO_USER_EMAIL = "recruiter.demo@demo.com";
    public static final String DEMO_ROLE = "DEMO";

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final MemberProfileRepository memberProfileRepository;
    private final AttendanceRepository attendanceRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final AnalyticsEventRepository analyticsEventRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedDemoDataIfMissing();
    }

    public synchronized void seedDemoDataIfMissing() {
        Tenant demoTenant = tenantRepository.findBySubdomain(DEMO_TENANT_SUBDOMAIN)
                .orElseGet(() -> {
                    log.info("Seeding Demo Tenant...");
                    Tenant tenant = new Tenant();
                    tenant.setName(DEMO_TENANT_NAME);
                    tenant.setSubdomain(DEMO_TENANT_SUBDOMAIN);
                    tenant.setPlan("ENTERPRISE_DEMO");
                    tenant.setActive(true);
                    return tenantRepository.save(tenant);
                });

        String tenantId = demoTenant.getId();

        // Seed Demo User
        userRepository.findByEmail(DEMO_USER_EMAIL)
                .orElseGet(() -> {
                    log.info("Seeding Demo User...");
                    User user = new User();
                    user.setTenantId(tenantId);
                    user.setTenantName(DEMO_TENANT_NAME);
                    user.setEmail(DEMO_USER_EMAIL);
                    user.setPasswordHash(passwordEncoder.encode("demoSecret123!"));
                    user.setRole(DEMO_ROLE);
                    return userRepository.save(user);
                });

        // Seed Demo Profile
        if (!memberProfileRepository.existsByTenantIdAndUserEmail(tenantId, DEMO_USER_EMAIL)) {
            MemberProfile profile = new MemberProfile();
            profile.setTenantId(tenantId);
            profile.setUserEmail(DEMO_USER_EMAIL);
            profile.setFullName("Recruiter Guest");
            profile.setDesignation("Talent Assessor");
            profile.setDepartment("Recruitment");
            profile.setPhone("+1 (555) 019-2831");
            profile.setAddress("San Francisco, CA");
            profile.setDateOfBirth("1995-08-15");
            profile.setEducation("B.S. Business Administration");
            memberProfileRepository.save(profile);
        }

        // Seed Sample Members
        seedSampleMember(tenantId, "alex.morgan@demo.com", "ORG_ADMIN", "Alex Morgan", "Chief Technology Officer", "Executive", "+1 (555) 012-3456", "San Francisco, CA");
        seedSampleMember(tenantId, "sarah.connor@demo.com", "MANAGER", "Sarah Connor", "Engineering Manager", "Engineering", "+1 (555) 014-7890", "Austin, TX");
        seedSampleMember(tenantId, "john.smith@demo.com", "MEMBER", "John Smith", "Senior Full-Stack Engineer", "Engineering", "+1 (555) 016-2345", "Seattle, WA");
        seedSampleMember(tenantId, "emily.watson@demo.com", "MEMBER", "Emily Watson", "Lead UI/UX Designer", "Design", "+1 (555) 018-6789", "New York, NY");

        // Seed Attendance Records for past 5 days
        LocalDate today = LocalDate.now();
        List<String> demoEmails = List.of(DEMO_USER_EMAIL, "alex.morgan@demo.com", "sarah.connor@demo.com", "john.smith@demo.com", "emily.watson@demo.com");
        for (int i = 0; i < 5; i++) {
            LocalDate date = today.minusDays(i);
            for (String email : demoEmails) {
                if (!attendanceRepository.existsByTenantIdAndUserEmailAndDate(tenantId, email, date)) {
                    AttendanceRecord record = new AttendanceRecord();
                    record.setTenantId(tenantId);
                    record.setUserEmail(email);
                    record.setDate(date);
                    record.setStatus("PRESENT");
                    record.setMarkedAt(LocalDateTime.now().minusDays(i));
                    attendanceRepository.save(record);
                }
            }
        }

        // Seed Chat Messages if none exist for tenant
        if (chatMessageRepository.findAllByTenantIdOrderBySentAtAsc(tenantId).isEmpty()) {
            createChatMessage(tenantId, "alex.morgan@demo.com", "ORG_ADMIN", "Welcome to the Acme Demo Organization workspace!", LocalDateTime.now().minusHours(24));
            createChatMessage(tenantId, "sarah.connor@demo.com", "MANAGER", "Thanks Alex! All engineering metrics are synced for Q3.", LocalDateTime.now().minusHours(18));
            createChatMessage(tenantId, "john.smith@demo.com", "MEMBER", "Frontend component library migration is complete.", LocalDateTime.now().minusHours(12));
            createChatMessage(tenantId, "emily.watson@demo.com", "MEMBER", "Design system documentation has been uploaded to team resources.", LocalDateTime.now().minusHours(6));
            createChatMessage(tenantId, DEMO_USER_EMAIL, DEMO_ROLE, "Recruiter demo access initialized. Exploring dashboard metrics...", LocalDateTime.now().minusHours(1));
        }

        // Seed Analytics Events if none exist for tenant
        if (analyticsEventRepository.findAllByTenantId(tenantId).isEmpty()) {
            createAnalyticsEvent(tenantId, "system", "SYSTEM_INIT", "Demo organization environment initialized", LocalDateTime.now().minusDays(6));
            createAnalyticsEvent(tenantId, "alex.morgan@demo.com", "USER_SIGNUP", "Organization account created", LocalDateTime.now().minusDays(5));
            createAnalyticsEvent(tenantId, "alex.morgan@demo.com", "MEMBER_INVITED", "Invited Sarah Connor as MANAGER", LocalDateTime.now().minusDays(4));
            createAnalyticsEvent(tenantId, "sarah.connor@demo.com", "MEMBER_INVITED", "Invited John Smith as MEMBER", LocalDateTime.now().minusDays(3));
            createAnalyticsEvent(tenantId, "john.smith@demo.com", "PROFILE_UPDATED", "Updated developer profile information", LocalDateTime.now().minusDays(2));
            createAnalyticsEvent(tenantId, DEMO_USER_EMAIL, "DEMO_SESSION_START", "Recruiter guest demo session started", LocalDateTime.now().minusHours(2));
        }
    }

    private void seedSampleMember(String tenantId, String email, String role, String fullName, String designation, String department, String phone, String address) {
        if (!userRepository.existsByEmail(email)) {
            User user = new User();
            user.setTenantId(tenantId);
            user.setTenantName(DEMO_TENANT_NAME);
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode("samplePass123!"));
            user.setRole(role);
            userRepository.save(user);
        }

        if (!memberProfileRepository.existsByTenantIdAndUserEmail(tenantId, email)) {
            MemberProfile profile = new MemberProfile();
            profile.setTenantId(tenantId);
            profile.setUserEmail(email);
            profile.setFullName(fullName);
            profile.setDesignation(designation);
            profile.setDepartment(department);
            profile.setPhone(phone);
            profile.setAddress(address);
            memberProfileRepository.save(profile);
        }
    }

    private void createChatMessage(String tenantId, String senderEmail, String senderRole, String content, LocalDateTime sentAt) {
        ChatMessage msg = new ChatMessage();
        msg.setTenantId(tenantId);
        msg.setSenderEmail(senderEmail);
        msg.setSenderRole(senderRole);
        msg.setContent(content);
        msg.setMessageType("TEXT");
        msg.setSentAt(sentAt);
        chatMessageRepository.save(msg);
    }

    private void createAnalyticsEvent(String tenantId, String performedBy, String eventType, String description, LocalDateTime occurredAt) {
        AnalyticsEvent event = new AnalyticsEvent();
        event.setTenantId(tenantId);
        event.setPerformedBy(performedBy);
        event.setEventType(eventType);
        event.setDescription(description);
        event.setOccurredAt(occurredAt);
        analyticsEventRepository.save(event);
    }
}
