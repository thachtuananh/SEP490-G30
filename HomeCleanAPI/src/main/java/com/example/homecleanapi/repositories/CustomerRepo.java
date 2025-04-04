package com.example.homecleanapi.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homecleanapi.models.Customers;


@Repository
public interface CustomerRepo extends JpaRepository<Customers, Long> {
    
    Optional<Customers> findByPhone(String phone);
    Optional<Customers> findById(Integer id);
    List<Customers> findAll();




}