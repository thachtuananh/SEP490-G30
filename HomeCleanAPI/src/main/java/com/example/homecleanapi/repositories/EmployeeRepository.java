package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    Employee findByEmail(String email);
    Employee findByName(String name);
    Employee findByPhone(String phone);
    Employee findEmployeeById(Integer id);
    boolean existsByPhone(String phone);
    Optional<Employee> findById(Long cleanerId);
}