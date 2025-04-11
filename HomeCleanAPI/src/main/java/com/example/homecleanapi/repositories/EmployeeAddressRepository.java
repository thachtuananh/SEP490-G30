package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.EmployeeLocations;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeAddressRepository extends JpaRepository<EmployeeLocations, Integer> {
    List<EmployeeLocations> findEmployeeLocationsByEmployee_Id(int employeeId);

    @Query("SELECT e FROM EmployeeLocations e WHERE e.employee.id = :cleanerId AND e.is_current = true")
    EmployeeLocations findByEmployee_IdAndIs_currentTrue(@Param("cleanerId") Long cleanerId);

    List<EmployeeLocations> findByEmployeeId(Integer cleanerId);


}
