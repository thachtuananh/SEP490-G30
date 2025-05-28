package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.ChatMessage;
import com.example.homecleanapi.models.Conversation;
import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.repositories.ConversationRepository;
import com.example.homecleanapi.repositories.CustomerRepository;
import com.example.homecleanapi.repositories.EmployeeRepository;
import lombok.extern.log4j.Log4j2;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalTime;
import java.util.Optional;

@RestController
@Log4j2
public class ChatController {

    private final RabbitTemplate rabbitTemplate;

    private final SimpMessagingTemplate messagingTemplate;

    private final ConversationRepository conversationRepository;

    private final CustomerRepository customerRepository;
    private final EmployeeRepository cleanerRepository;

    public ChatController(RabbitTemplate rabbitTemplate, SimpMessagingTemplate messagingTemplate, ConversationRepository conversationRepository, CustomerRepository customerRepository, EmployeeRepository employeeRepository) {
        this.rabbitTemplate = rabbitTemplate;
        this.messagingTemplate = messagingTemplate;
        this.conversationRepository = conversationRepository;
        this.customerRepository = customerRepository;
        this.cleanerRepository = employeeRepository;
    }

    @MessageMapping("/chat")
    public void sendMessage(@Payload ChatMessage message,
                            @Header("customerId") Long customerId,
                            @Header("employeeId") Integer employeeId) {
        // Lấy hoặc tạo mới conversation
        Long conversationId = getOrCreateConversation(customerId, employeeId);
        message.setConversationId(conversationId);

        if (message.getSenderId() == null) {
            throw new IllegalArgumentException("SenderId is required");
        }

        message.setSent_at(LocalTime.now());

        // Đẩy tin nhắn vào RabbitMQ
        rabbitTemplate.convertAndSend("chat-messages", message);
//        log.info("Sending to RabbitMQ: ", message);

        // Gửi ngay lập tức qua WebSocket tới người nhận
        Integer receiverId = determineReceiverId(message.getConversationId(), message.getSenderId());
        messagingTemplate.convertAndSend("/queue/messages-" + receiverId, message);
//        log.info("Sending to WebSocket receiver: {}", receiverId);
    }

    private Long getOrCreateConversation(Long customerId, Integer employeeId) {
        Customers customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Employee cleaner = cleanerRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Cleaner not found"));

        Optional<Conversation> existingConversation = conversationRepository.findByCustomerAndCleaner(customer, cleaner);

        if (existingConversation.isPresent()) {
            return existingConversation.get().getId();
        }

        // Tạo mới conversation nếu chưa tồn tại
        Conversation newConversation = new Conversation();
        newConversation.setCustomer(customer);
        newConversation.setCleaner(cleaner);

        newConversation = conversationRepository.save(newConversation);
        return newConversation.getId();
    }



    private Integer determineReceiverId(Long conversationId, Integer senderId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        Integer customerId = conversation.getCustomer().getId();
        Integer cleanerId = conversation.getCleaner().getId();

        return senderId.equals(customerId) ? cleanerId : customerId;
    }

}
