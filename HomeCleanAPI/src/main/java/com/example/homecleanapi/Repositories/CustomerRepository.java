package com.example.homecleanapi.Repositories;

import com.example.homecleanapi.Models.Customers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customers, Integer> {

}
