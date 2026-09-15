package com.saas.Dashboard.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "chat_messages")
@Data
public class ChatMessage {
    @Id
    private String id;
    private String tenantId;
    private String senderEmail;
    private String senderRole;
    private String content;
    private LocalDateTime sentAt = LocalDateTime.now();
    private String messageType; // "TEXT" or "SYSTEM"
}
