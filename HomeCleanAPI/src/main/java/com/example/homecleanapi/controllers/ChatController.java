package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.ChatMessage;
import com.example.homecleanapi.services.ChatMessageBuffer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ChatController {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private ChatMessageBuffer chatMessageBuffer;

    @MessageMapping("/sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        chatMessageBuffer.addMessage(chatMessage.getConversation_id(), chatMessage);

        // Gửi tin nhắn real-time
        messagingTemplate.convertAndSend("/topic/conversation/" + chatMessage.getConversation_id(), chatMessage);

//        // Gửi thông báo (không lưu vào DB)
//        Long receiverId = getReceiverId(chatMessage.getConversation_id(), chatMessage.getSender_id());
//        messagingTemplate.convertAndSend("/topic/notifications/" + receiverId, "Bạn có tin nhắn mới!");
    }
}
