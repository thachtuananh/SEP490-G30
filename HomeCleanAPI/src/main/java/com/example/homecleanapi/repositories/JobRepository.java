package com.example.homecleanapi.repositories;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.CustomerAddresses;
import com.example.homecleanapi.models.Job;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    // Lấy tất cả các job có trạng thái "Open"
    List<Job> findByStatus(JobStatus status);
    
    Optional<Job> findById(Long jobId);
   
    List<Job> findByCleanerIdAndScheduledTimeBetween(Long cleanerId, LocalDateTime startTime, LocalDateTime endTime);
    
    List<Job> findByCleanerId(Long cleanerId);
    
    List<Job> findByCustomerId(Long customerId);

    public List<Job> findByScheduledTimeAndCustomerAddress(LocalDateTime scheduledTime, CustomerAddresses customerAddress);
    
    List<Job> findByCleanerIdAndStatus(Long cleanerId, JobStatus status);


    List<Job> findByCleanerIdAndStatusIn(Long cleanerId, List<String> statuses);
    
    Optional<Job> findByTxnRef(String txnRef); 



}

