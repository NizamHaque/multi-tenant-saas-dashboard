package com.saas.Dashboard.dto;

import lombok.Data;

@Data
public class ChatMessageRequest {
    private String tenantId;
    private String senderEmail;
    private String senderRole;
    private String content;
    private String messageType;
}
