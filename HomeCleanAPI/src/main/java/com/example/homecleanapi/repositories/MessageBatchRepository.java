package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.MessageBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageBatchRepository extends JpaRepository<MessageBatch, Long> {
    List<MessageBatch> findMessageBatchByConversationId(Long conversationId);
}


