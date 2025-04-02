package com.example.homecleanapi.controllers;

import com.example.homecleanapi.models.Conversation;
import com.example.homecleanapi.services.ConversationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@Tag(name = "Conversation API")
@RequestMapping("/api/conversations")
@SecurityRequirement(name = "BearerAuth")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @PostMapping(name = "/createConversation")
    public Conversation createConversation(@RequestParam @Valid Long customerId, @RequestParam @Valid Integer cleanerId) {
        return conversationService.getOrCreateConversation(customerId, cleanerId);
    }

    @GetMapping("/{customer_id}/getConversationByCustomerId")
    public ResponseEntity<Map<String, Object>> getAllConversationsByCustomerId(@PathVariable Integer customer_id) {
        return conversationService.getConversationsByCustomerId(customer_id);
    }

    @GetMapping("/{cleaner_id}/getConversationByCleanerId")
    public ResponseEntity<Map<String, Object>> getConversationsByCleanerId(@PathVariable Integer cleaner_id) {
        return conversationService.getConversationsByCleanerId(cleaner_id);
    }

}
