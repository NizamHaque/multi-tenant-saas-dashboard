package com.saas.Dashboard.entity;


import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Document(collection = "users")
@Data
public class User {

    @Id
    private String id;

    private String tenantId;       // stores Tenant's MongoDB _id
    private String tenantName;     // stored directly to avoid extra lookups

    @Indexed(unique = true)
    private String email;

    private String passwordHash;
    private String role = "ORG_ADMIN";
    private LocalDateTime createdAt = LocalDateTime.now();
}