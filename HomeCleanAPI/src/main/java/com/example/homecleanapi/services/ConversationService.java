package com.example.homecleanapi.services;


import com.example.homecleanapi.models.Conversation;
import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.repositories.ConversationRepository;
import com.example.homecleanapi.repositories.CustomerRepository;
import com.example.homecleanapi.repositories.EmployeeRepository;
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
    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;

    public Conversation getOrCreateConversation(Long customerId, Integer cleanerId) {
        Customers customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Employee cleaner = employeeRepository.findById(cleanerId)
                .orElseThrow(() -> new RuntimeException("Cleaner not found"));

        return conversationRepository.findByCustomerAndCleaner(customer, cleaner)
                .orElseGet(() -> {
                    Conversation conversation = new Conversation();
                    conversation.setCustomer(customer);
                    conversation.setCleaner(cleaner);
                    return conversationRepository.save(conversation);
                });
    }

    public ResponseEntity<Map<String, Object>> getConversationsByCustomerId(Integer customerId) {
        Map<String, Object> response = new HashMap<>();

        List<Map<String, Object>> list_conversation = conversationRepository.findConversationByCustomerId(customerId)
                .stream()
                .map(conversation -> {
                    Map<String, Object> allConversation = new HashMap<>();
                    allConversation.put("customer_id", conversation.getCustomer().getId());
                    allConversation.put("cleaner_id", conversation.getCleaner().getId());
                    allConversation.put("conversation_id", conversation.getId());
                    allConversation.put("customer_name", conversation.getCustomer().getFull_name());
                    allConversation.put("cleaner_name", conversation.getCleaner().getName());
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
                    allConversation.put("customer_id", conversation.getCustomer().getId());
                    allConversation.put("cleaner_id", conversation.getCleaner().getId());
                    allConversation.put("conversation_id", conversation.getId());
                    allConversation.put("customer_name", conversation.getCustomer().getFull_name());
                    allConversation.put("cleaner_name", conversation.getCleaner().getName());
                    return allConversation;
                })
                .toList();
        response.put("conversations", list_conversation);
        return ResponseEntity.ok(response);
    }
}
