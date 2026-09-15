package com.saas.Dashboard.service;

import com.saas.Dashboard.entity.AnalyticsEvent;
import com.saas.Dashboard.repository.AnalyticsEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EventLogger {

    private final AnalyticsEventRepository analyticsEventRepository;

    public void log(String tenantId, String performedBy,
                    String eventType, String description) {
        AnalyticsEvent event = new AnalyticsEvent();
        event.setTenantId(tenantId);
        event.setPerformedBy(performedBy);
        event.setEventType(eventType);
        event.setDescription(description);
        analyticsEventRepository.save(event);
    }
}