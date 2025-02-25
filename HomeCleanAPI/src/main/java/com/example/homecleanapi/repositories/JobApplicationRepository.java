package com.example.homecleanapi.repositories;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homecleanapi.models.Cleaner;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.models.JobApplication;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
	Optional<JobApplication> findByJobAndCleaner(Job job, Cleaner cleaner);
	
	List<JobApplication> findByJob(Job job);
	
	List<JobApplication> findByJobAndStatus(Job job, String status);
	
	JobApplication findByJobIdAndStatus(Long jobId, String status);
}
