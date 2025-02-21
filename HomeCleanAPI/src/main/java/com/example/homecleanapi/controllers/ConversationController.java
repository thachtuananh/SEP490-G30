package com.example.homecleanapi.controllers;

import com.example.homecleanapi.models.Conversation;
import com.example.homecleanapi.repositories.ConversationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {
    @Autowired
    private ConversationRepository conversationRepository;

    @GetMapping("/api/{customer_id}")
    public ResponseEntity<Conversation> getUserConversation(@PathVariable("customer_id") Integer customer_id,
                                                            @RequestParam Integer cleaner_id) {
        Conversation conversation = conversationRepository.findByCustomerIdAndCleanerId(customer_id, cleaner_id);
        return ResponseEntity.ok(conversation);
    }
}
