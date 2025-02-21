package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.ChatMessage;
import com.example.homecleanapi.models.MessageBatch;
import com.example.homecleanapi.repositories.MessageBatchRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class MessageBatchService {
    @Autowired
    private ChatMessageBuffer chatMessageBuffer;
    @Autowired
    private MessageBatchRepository messageBatchRepository;
    @Autowired
    private ObjectMapper objectMapper;

    @Scheduled(fixedRate = 3600000) // Mỗi 1 giờ
    public void saveMessagesToDatabase() {
        Map<Long, List<ChatMessage>> messages = chatMessageBuffer.getAndClearBuffer();

        for (Map.Entry<Long, List<ChatMessage>> entry : messages.entrySet()) {
            try {
                String json = objectMapper.writeValueAsString(entry.getValue());

                MessageBatch batch = new MessageBatch();
                batch.setConversationId(entry.getKey());
                batch.setMeassge_content(json);
                messageBatchRepository.save(batch);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
