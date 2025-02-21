package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Conversation findByCustomerIdAndCleanerId(Integer customer_id, Integer cleaner_id);
}
