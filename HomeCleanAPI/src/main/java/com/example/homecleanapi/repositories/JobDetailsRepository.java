package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.JobServiceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homecleanapi.models.JobDetails;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobDetailsRepository extends JpaRepository<JobServiceDetail, Long>{

    Optional<JobServiceDetail> findByJob_id(Long jobId);

    //Optional<JobDetails> findByJob_id(Long jobId);

}
