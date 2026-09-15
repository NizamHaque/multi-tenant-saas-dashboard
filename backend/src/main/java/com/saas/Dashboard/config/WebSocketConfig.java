package com.saas.Dashboard.config;

import com.saas.Dashboard.security.JwtUtil;
import com.saas.Dashboard.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtUtil jwtUtil;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                    MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String auth = accessor.getFirstNativeHeader("Authorization");
                    if (auth != null && auth.startsWith("Bearer ")) {
                        String token = auth.substring(7);
                        if (jwtUtil.isTokenValid(token)) {
                            TenantContext.setTenantId(jwtUtil.extractTenantId(token));
                            TenantContext.setRole(jwtUtil.extractRole(token));
                            TenantContext.setEmail(jwtUtil.extractEmail(token));
                        }
                    }
                }

                if (accessor != null && StompCommand.DISCONNECT.equals(accessor.getCommand())) {
                    TenantContext.clear();
                }

                return message;
            }

            @Override
            public void afterSendCompletion(
                    Message<?> message, MessageChannel channel,
                    boolean sent, Exception ex) {
                StompHeaderAccessor accessor =
                    MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor != null
                        && (StompCommand.SEND.equals(accessor.getCommand())
                            || StompCommand.MESSAGE.equals(accessor.getCommand()))) {
                    TenantContext.clear();
                }
            }
        });
    }
}
