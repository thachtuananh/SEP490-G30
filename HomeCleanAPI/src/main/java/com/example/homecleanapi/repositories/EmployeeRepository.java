package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Employee findByEmail(String email);
    Employee findByName(String name);
    Employee findByPhone(String phone);
    boolean existsByPhone(String phone);
}
