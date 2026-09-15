package com.saas.Dashboard.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "member_profiles")
@Data
public class MemberProfile {

    @Id
    private String id;

    @Indexed
    private String tenantId;

    @Indexed
    private String userEmail;

    private String fullName;
    private String phone;
    private String address;
    private String dateOfBirth;
    private String education;
    private String designation;
    private String department;

    private List<ProfileDocument> documents = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Data
    public static class ProfileDocument {
        private String id;
        private String originalName;
        private String storedName;
        private String documentType;
        private String contentType;
        private long fileSize;
        private String storedPath;
        private LocalDateTime uploadedAt = LocalDateTime.now();
    }
}
