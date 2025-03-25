package com.example.homecleanapi.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homecleanapi.models.Wallet;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByCleanerId(Integer cleanerId);
    
    Optional<Wallet> findByCleanerId(Long cleanerId);
    
    Optional<Wallet> findByTxnRef(String txnRef);
}
