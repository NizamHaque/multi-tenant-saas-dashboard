package com.saas.Dashboard.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Document(collection = "tenants")
@Data
public class Tenant {

    @Id
    private String id;

    @Indexed(unique = true)
    private String name;

    @Indexed(unique = true)
    private String subdomain;

    private String plan = "FREE";
    private boolean isActive = true;
    private LocalDateTime createdAt = LocalDateTime.now();
}