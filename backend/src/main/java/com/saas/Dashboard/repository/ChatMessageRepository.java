package com.saas.Dashboard.repository;

import com.saas.Dashboard.entity.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findTop50ByTenantIdOrderBySentAtAsc(String tenantId);
    List<ChatMessage> findAllByTenantIdOrderBySentAtAsc(String tenantId);
}
