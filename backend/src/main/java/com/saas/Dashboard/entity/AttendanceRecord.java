package com.saas.Dashboard.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "attendance_records")
@Data
public class AttendanceRecord {
    @Id
    private String id;

    @Indexed
    private String tenantId;

    private String userId;
    private String userEmail;
    private LocalDate date;
    private String status; // "PRESENT" or "ABSENT"
    private LocalDateTime markedAt;
}
