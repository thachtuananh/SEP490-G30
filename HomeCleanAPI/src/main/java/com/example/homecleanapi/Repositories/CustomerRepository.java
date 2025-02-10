package com.example.homecleanapi.Repositories;

import com.example.homecleanapi.Models.Customers;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customers, Long> {
    Optional<Customers> findByPhone(String phone);
    boolean existsByPhone(String phone);
}
