package com.example.homecleanapi.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homecleanapi.models.Employee;

@Repository
public interface CleanerRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByPhone(String phone); 

    Employee findByEmail(String email); 
    
    List<Employee> findByStatus(Boolean status);
    
}


