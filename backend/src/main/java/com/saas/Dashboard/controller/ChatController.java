package com.saas.Dashboard.controller;

import com.saas.Dashboard.dto.ChatMessageRequest;
import com.saas.Dashboard.entity.ChatMessage;
import com.saas.Dashboard.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessageRequest request) {
        ChatMessage saved = chatService.saveMessage(request);
        messagingTemplate.convertAndSend(
            "/topic/chat." + saved.getTenantId(), saved);
    }

    @GetMapping("/api/chat/messages")
    @ResponseBody
    public ResponseEntity<List<ChatMessage>> getMessages() {
        return ResponseEntity.ok(chatService.getLast50Messages());
    }
}
