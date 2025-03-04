package com.example.homecleanapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homecleanapi.models.JobDetails;

@Repository
public interface JobDetailsRepository extends JpaRepository<JobDetails, Long>{

}
