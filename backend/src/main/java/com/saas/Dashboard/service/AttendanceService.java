package com.saas.Dashboard.service;

import com.saas.Dashboard.entity.AttendanceRecord;
import com.saas.Dashboard.repository.AttendanceRepository;
import com.saas.Dashboard.repository.UserRepository;
import com.saas.Dashboard.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public AttendanceRecord markPresent() {
        String tenantId = TenantContext.getTenantId();
        String email = TenantContext.getEmail();
        LocalDate today = LocalDate.now();

        if (attendanceRepository.existsByTenantIdAndUserEmailAndDate(
                tenantId, email, today)) {
            throw new RuntimeException("Attendance already marked for today");
        }

        AttendanceRecord record = new AttendanceRecord();
        record.setTenantId(tenantId);
        record.setUserEmail(email);
        record.setDate(today);
        record.setStatus("PRESENT");
        record.setMarkedAt(LocalDateTime.now());
        return attendanceRepository.save(record);
    }

    public Map<String, Object> getTodayStatus() {
        String tenantId = TenantContext.getTenantId();
        String email = TenantContext.getEmail();
        LocalDate today = LocalDate.now();

        boolean marked = attendanceRepository
            .existsByTenantIdAndUserEmailAndDate(tenantId, email, today);

        return Map.of(
            "date", today.toString(),
            "email", email,
            "marked", marked,
            "status", marked ? "PRESENT" : "NOT_MARKED"
        );
    }

    public List<Map<String, Object>> getTodayAttendance() {
        String tenantId = TenantContext.getTenantId();
        String role = TenantContext.getRole();

        if (!"ORG_ADMIN".equals(role) && !"MANAGER".equals(role)) {
            throw new RuntimeException("Access denied");
        }

        LocalDate today = LocalDate.now();
        List<AttendanceRecord> todayRecords = attendanceRepository
            .findAllByTenantIdAndDate(tenantId, today);

        List<String> allMembers = userRepository.findAllByTenantId(tenantId)
            .stream()
            .map(u -> u.getEmail())
            .collect(Collectors.toList());

        List<Map<String, Object>> result = new ArrayList<>();
        for (String memberEmail : allMembers) {
            boolean present = todayRecords.stream()
                .anyMatch(r -> r.getUserEmail().equals(memberEmail));
            Map<String, Object> entry = new HashMap<>();
            entry.put("email", memberEmail);
            entry.put("status", present ? "PRESENT" : "ABSENT");
            entry.put("date", today.toString());
            result.add(entry);
        }
        return result;
    }

    public List<AttendanceRecord> getFullHistory() {
        String tenantId = TenantContext.getTenantId();
        String role = TenantContext.getRole();

        if (!"ORG_ADMIN".equals(role) && !"MANAGER".equals(role)) {
            throw new RuntimeException("Access denied");
        }

        return attendanceRepository.findAllByTenantId(tenantId);
    }

    public Map<String, Object> getAttendanceAnalytics() {
        String tenantId = TenantContext.getTenantId();
        String role = TenantContext.getRole();

        if (!"ORG_ADMIN".equals(role) && !"MANAGER".equals(role)) {
            throw new RuntimeException("Access denied");
        }

        List<AttendanceRecord> allRecords =
            attendanceRepository.findAllByTenantId(tenantId);

        int totalMembers = userRepository.findAllByTenantId(tenantId).size();
        int totalPresent = allRecords.size();

        Map<String, Long> byDate = allRecords.stream()
            .collect(Collectors.groupingBy(
                r -> r.getDate().toString(),
                Collectors.counting()
            ));

        Map<String, Long> byMember = allRecords.stream()
            .collect(Collectors.groupingBy(
                AttendanceRecord::getUserEmail,
                Collectors.counting()
            ));

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalMembers", totalMembers);
        analytics.put("totalPresentToday",
            attendanceRepository.findAllByTenantIdAndDate(
                tenantId, LocalDate.now()).size());
        analytics.put("attendanceByDate", byDate);
        analytics.put("attendanceByMember", byMember);
        analytics.put("totalRecords", totalPresent);

        return analytics;
    }
}
