package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.Customers;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customers, Long> {
    Customers findByPhone(String phone);
    boolean existsByPhone(String phone);


    Customers findCustomersById(Integer id);

    @Query("SELECT COUNT(c) FROM Customers c WHERE c.isDeleted = :isDeleted")
    long countByIsDeleted(@Param("isDeleted") Boolean isDeleted);

    Customers findCustomersByEmail(String email);

    Optional<Customers> findByEmail(String email);
}