package com.example.homecleanapi.controllers;

import com.example.homecleanapi.models.Conversation;
import com.example.homecleanapi.models.Message;
import com.example.homecleanapi.repositories.ConversationRepository;
import lombok.extern.log4j.Log4j2;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@Log4j2
public class ChatController {

    private final RabbitTemplate rabbitTemplate;

    private final SimpMessagingTemplate messagingTemplate;

    private final ConversationRepository conversationRepository;

    public ChatController(RabbitTemplate rabbitTemplate, SimpMessagingTemplate messagingTemplate, ConversationRepository conversationRepository) {
        this.rabbitTemplate = rabbitTemplate;
        this.messagingTemplate = messagingTemplate;
        this.conversationRepository = conversationRepository;
    }

    @MessageMapping("/chat")
    public void sendMessage(@Payload Message message,
                            @Header("customerId") Integer customerId,
                            @Header("employeeId") Integer employeeId) {
        // Lấy hoặc tạo mới conversation
        Long conversationId = getOrCreateConversation(customerId, employeeId);
        message.setConversationId(conversationId);

        if (message.getSenderId() == null) {
            throw new IllegalArgumentException("SenderId is required");
        }

        message.setSent_at(LocalDateTime.now());

        // Đẩy tin nhắn vào RabbitMQ
        rabbitTemplate.convertAndSend("chat-messages", message);
        log.info("Sending to RabbitMQ: ", message);

        // Gửi ngay lập tức qua WebSocket tới người nhận
        Integer receiverId = determineReceiverId(message.getConversationId(), message.getSenderId());
        messagingTemplate.convertAndSend("/queue/messages-" + receiverId, message);
        log.info("Sending to WebSocket receiver: {}", receiverId);
    }

    private Long getOrCreateConversation(Integer customerId, Integer employeeId) {
        Optional<Conversation> existingConversation = conversationRepository.findByCustomerIdAndCleanerId(customerId, employeeId);

        if (existingConversation.isPresent()) {
            return existingConversation.get().getId();
        }

        // Tạo mới conversation nếu chưa tồn tại
        Conversation newConversation = new Conversation();
        newConversation.setCustomerId(customerId);
        newConversation.setCleanerId(employeeId);
        newConversation = conversationRepository.save(newConversation);

        log.info("New conversation created with ID: {}", newConversation.getId());
        return newConversation.getId();
    }


    private Integer determineReceiverId(Long conversationId, Integer senderId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        return senderId.equals(conversation.getCustomerId()) ? conversation.getCleanerId() : conversation.getCustomerId();
    }

    // Gửi tin nhắn cá nhân
//    @MessageMapping("/chat")
//    public void sendPrivateMessage(@Payload Message message, SimpMessageHeaderAccessor headerAccessor) {
//        // Lưu tin nhắn vào database
//        message.setSent_at(LocalDateTime.now());
//        messageBatchRepository.save(message);
//
//        // Gửi tin nhắn tới người nhận qua /queue
//        String destination = "/queue/messages-" + message.getReceiverId();
//        messagingTemplate.convertAndSend(destination, message);
//    }

}
