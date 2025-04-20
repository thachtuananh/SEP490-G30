package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.WithdrawalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, Long> {
    List<WithdrawalRequest> findByStatusIn(List<String> statuses);
    List<WithdrawalRequest> findByStatus(String status);

    List<WithdrawalRequest> findByCustomerId(Long customerId);

    List<WithdrawalRequest> findByCleanerId(Long cleanerId);
}
