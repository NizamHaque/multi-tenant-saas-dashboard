package com.saas.Dashboard.service;

import com.saas.Dashboard.dto.ChatMessageRequest;
import com.saas.Dashboard.entity.ChatMessage;
import com.saas.Dashboard.repository.ChatMessageRepository;
import com.saas.Dashboard.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;

    public List<ChatMessage> getLast50Messages() {
        String tenantId = TenantContext.getTenantId();
        return chatMessageRepository
            .findTop50ByTenantIdOrderBySentAtAsc(tenantId);
    }

    public ChatMessage saveMessage(ChatMessageRequest request) {
        if ("DEMO".equals(TenantContext.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Demo account is read-only. Sending chat messages is disabled.");
        }

        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Tenant context missing or unauthenticated");
        }

        String email = TenantContext.getEmail();
        String role = TenantContext.getRole();

        ChatMessage message = new ChatMessage();
        message.setTenantId(tenantId);
        message.setSenderEmail(email != null ? email : request.getSenderEmail());
        message.setSenderRole(role != null ? role : request.getSenderRole());
        message.setContent(request.getContent());
        message.setMessageType(
            request.getMessageType() != null ? request.getMessageType() : "TEXT");
        return chatMessageRepository.save(message);
    }
}
