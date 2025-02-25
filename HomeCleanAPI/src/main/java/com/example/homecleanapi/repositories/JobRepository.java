package com.example.homecleanapi.repositories;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.Job;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    // Lấy tất cả các job có trạng thái "Open"
    List<Job> findByStatus(JobStatus status);
    
    Optional<Job> findById(Long jobId);
   

    

}

