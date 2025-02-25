package com.example.homecleanapi.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homecleanapi.models.Cleaner;

@Repository
public interface CleanerRepository extends JpaRepository<Cleaner, Long> {
	Optional<Cleaner> findByPhoneNumber(String phoneNumber); 
 

    Cleaner findByEmail(String email); 
    
    
}

