package com.example.homecleanapi.repositories;

import java.util.List;
import java.util.Optional;

import io.lettuce.core.dynamic.annotation.Param;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.homecleanapi.models.Employee;

@Repository
public interface CleanerRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByPhone(String phone); 

    Employee findByEmail(String email); 
    
    List<Employee> findByStatus(Boolean status);

    @Query("SELECT e FROM Employee e WHERE e.is_verified = false")
    List<Employee> findUnverifiedCleaners();

    @Modifying
    @Transactional
    @Query("UPDATE Employee e SET e.is_verified = :status, e.isDeleted = :isDeleted WHERE e.id = :id")
    void updateIdentityVerifiedAndDeletedStatus(@Param("id") Integer id, @Param("status") Boolean status, @Param("isDeleted") Boolean isDeleted);

    @Query("SELECT COUNT(c) FROM Customers c WHERE c.isDeleted = :isDeleted")
    long countByIsDeleted(@Param("isDeleted") Boolean isDeleted);

    @Query("SELECT c FROM Employee c WHERE c.is_verified = false")
    List<Employee> findCleanersNotVerified();

    @Query("SELECT e FROM Employee e WHERE e.is_verified = true")
    List<Employee> findVerifiedCleaners();


}


