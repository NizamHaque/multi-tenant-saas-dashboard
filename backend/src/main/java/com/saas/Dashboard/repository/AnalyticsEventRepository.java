package com.saas.Dashboard.repository;

import com.saas.Dashboard.entity.AnalyticsEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface AnalyticsEventRepository extends MongoRepository<AnalyticsEvent, String> {

    List<AnalyticsEvent> findAllByTenantId(String tenantId);

    List<AnalyticsEvent> findAllByTenantIdAndOccurredAtAfter(
            String tenantId, LocalDateTime after);

    long countByTenantId(String tenantId);
}