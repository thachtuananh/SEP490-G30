package com.example.homecleanapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homecleanapi.models.Customers;

@Repository
public interface ProfileRepository extends JpaRepository<Customers, Long> {
	Customers findByPhone(String phone);
    boolean existsByPhone(String phone);

}
