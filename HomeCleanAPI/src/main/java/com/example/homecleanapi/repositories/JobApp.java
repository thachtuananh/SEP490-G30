package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApp extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByJobId(Long jobId);

    List<JobApplication> findByJobIdAndStatus(Long jobId, String status);

}
