package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.AdminTransactionHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminTransactionHistoryRepository extends JpaRepository<AdminTransactionHistory, Long> {

    List<AdminTransactionHistory> findByCustomerId(Long customerId);
}

