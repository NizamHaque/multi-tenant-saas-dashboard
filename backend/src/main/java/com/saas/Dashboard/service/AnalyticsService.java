package com.saas.Dashboard.service;

import com.saas.Dashboard.repository.AnalyticsEventRepository;
import com.saas.Dashboard.repository.UserRepository;
import com.saas.Dashboard.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AnalyticsEventRepository analyticsEventRepository;
    private final UserRepository userRepository;

    public Map<String, Object> getDashboardStats() {
        String tenantId = TenantContext.getTenantId();

        long totalMembers = userRepository.findAllByTenantId(tenantId).size();
        long totalEvents = analyticsEventRepository.countByTenantId(tenantId);

        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        var recentEvents = analyticsEventRepository
                .findAllByTenantIdAndOccurredAtAfter(tenantId, sevenDaysAgo);

        Map<String, Long> eventsByType = recentEvents.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getEventType(),
                        Collectors.counting()
                ));

        Map<String, Long> activityByDay = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            String day = LocalDateTime.now().minusDays(i)
                    .toLocalDate().toString();
            activityByDay.put(day, 0L);
        }
        recentEvents.forEach(e -> {
            String day = e.getOccurredAt().toLocalDate().toString();
            activityByDay.computeIfPresent(day, (k, v) -> v + 1);
        });

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMembers", totalMembers);
        stats.put("totalEvents", totalEvents);
        stats.put("eventsByType", eventsByType);
        stats.put("activityByDay", activityByDay);

        return stats;
    }
}