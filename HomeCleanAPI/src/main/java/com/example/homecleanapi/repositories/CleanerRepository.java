package com.example.homecleanapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homecleanapi.models.Cleaner;

@Repository
public interface CleanerRepository extends JpaRepository<Cleaner, Long> {
    Cleaner findByPhoneNumber(String phoneNumber); 

    Cleaner findByEmail(String email); 
}

