package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.models.WorkHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkHistoryRepository extends JpaRepository<WorkHistory, Long> {

    Optional<WorkHistory> findByJobAndCleaner(Job job, Employee cleaner);
}
