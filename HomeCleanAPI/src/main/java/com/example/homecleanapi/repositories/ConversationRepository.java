package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.Conversation;
import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.models.Employee;
import org.springframework.data.domain.Limit;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    Optional<Conversation> findByCustomerIdAndCleanerId(Integer customerId, Integer cleanerId);
    Optional<Conversation> findByCustomerAndCleaner(Customers customer, Employee cleaner);
    List<Conversation> findConversationByCustomerId(Integer customerId);

    List<Conversation> findConversationByCleanerId(Integer cleanerId);

}
