package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.EmployeeLocations;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeAddressRepository extends JpaRepository<EmployeeLocations, Integer> {
    List<EmployeeLocations> findEmployeeLocationsByEmployee_Id(int employeeId);
}
