package com.example.homecleanapi.repositories;



import com.example.homecleanapi.models.Customers;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Customers, Long> {
    Customers findByPhone(String phone);
    boolean existsByPhone(String phone);
}
