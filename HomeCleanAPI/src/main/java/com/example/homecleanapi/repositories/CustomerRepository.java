package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.Customers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customers, Long> {
    Customers findByPhone(String phone);
    boolean existsByPhone(String phone);
}