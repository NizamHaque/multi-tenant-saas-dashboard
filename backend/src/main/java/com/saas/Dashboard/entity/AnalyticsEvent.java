package com.saas.Dashboard.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Document(collection = "analytics_events")
@Data
public class AnalyticsEvent {

    @Id
    private String id;

    @Indexed
    private String tenantId;

    private String performedBy;
    private String eventType;
    private String description;
    private LocalDateTime occurredAt = LocalDateTime.now();
}