package com.saas.Dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MemberResponse {
    private String id;
    private String email;
    private String role;
    private String tenantId;
    private String tenantName;
}