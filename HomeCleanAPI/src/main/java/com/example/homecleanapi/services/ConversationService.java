package com.example.homecleanapi.services;


import com.example.homecleanapi.models.Conversation;
import com.example.homecleanapi.repositories.ConversationRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ConversationService {
	
	@Autowired
    private ConversationRepository conversationRepository;

    public Conversation getOrCreateConversation(Integer customerId, Integer cleanerId) {
        return conversationRepository.findByCustomerIdAndCleanerId(customerId, cleanerId)
                .orElseGet(() -> {
                    Conversation conversation = new Conversation();
                    conversation.setCustomerId(customerId);
                    conversation.setCleanerId(cleanerId);
                    return conversationRepository.save(conversation);
                });
    }

    public ResponseEntity<Map<String, Object>> getConversationsByCustomerId(Integer customerId) {
        Map<String, Object> response = new HashMap<>();

        List<Map<String, Object>> list_conversation = conversationRepository.findConversationByCustomerId(customerId)
                .stream()
                .map(conversation -> {
                    Map<String, Object> allConversation = new HashMap<>();
                    allConversation.put("customer_id", conversation.getCustomerId());
                    allConversation.put("cleaner_id", conversation.getCleanerId());
                    allConversation.put("conversation_id", conversation.getId());
                    return allConversation;
                })
                .toList();
        response.put("conversations", list_conversation);
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Map<String, Object>> getConversationsByCleanerId(Integer cleanerId) {
        Map<String, Object> response = new HashMap<>();

        List<Map<String, Object>> list_conversation = conversationRepository.findConversationByCleanerId(cleanerId)
                .stream()
                .map(conversation -> {
                    Map<String, Object> allConversation = new HashMap<>();
                    allConversation.put("customer_id", conversation.getCustomerId());
                    allConversation.put("cleaner_id", conversation.getCleanerId());
                    allConversation.put("conversation_id", conversation.getId());
                    return allConversation;
                })
                .toList();
        response.put("conversations", list_conversation);
        return ResponseEntity.ok(response);
    }
}
