package com.saas.Dashboard.service;

import com.saas.Dashboard.dto.ChatMessageRequest;
import com.saas.Dashboard.entity.ChatMessage;
import com.saas.Dashboard.repository.ChatMessageRepository;
import com.saas.Dashboard.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
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
        String tenantId = TenantContext.getTenantId();
        String email = TenantContext.getEmail();
        String role = TenantContext.getRole();

        ChatMessage message = new ChatMessage();
        message.setTenantId(tenantId != null ? tenantId : request.getTenantId());
        message.setSenderEmail(email != null ? email : request.getSenderEmail());
        message.setSenderRole(role != null ? role : request.getSenderRole());
        message.setContent(request.getContent());
        message.setMessageType(
            request.getMessageType() != null ? request.getMessageType() : "TEXT");
        return chatMessageRepository.save(message);
    }
}
