package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.TransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionHistoryRepository extends JpaRepository<TransactionHistory, Long> {

    Optional<TransactionHistory> findByTxnRef(String txnRef);

    List<TransactionHistory> findByCleanerId(Long cleanerId);

    List<TransactionHistory> findByCustomerId(Long customerId);
}
