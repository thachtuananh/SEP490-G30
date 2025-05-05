package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.CustomerWallet;
import com.example.homecleanapi.models.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerWalletRepository extends JpaRepository<CustomerWallet, Long> {
    Optional<CustomerWallet> findByCustomerId(Long customerId); // Phương thức tìm ví của customer theo customerId

}
