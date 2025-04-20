package com.example.homecleanapi.repositories;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.models.JobApplication;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
	Optional<JobApplication> findByJobAndCleaner(Job job, Employee cleaner);
	
	List<JobApplication> findByJob(Job job);
	
	List<JobApplication> findByJobAndStatus(Job job, String status);
	
	JobApplication findByJobIdAndStatus(Long jobId, String status);
	
	Optional<JobApplication> findByJobIdAndCleanerId(Long jobId, Long cleanerId);
	
	List<JobApplication> findByCleanerId(Long cleanerId);
	
	List<JobApplication> findByStatus(String status);
	
	public List<JobApplication> findByCleanerIdAndStatus(Long cleanerId, String status);
	
	List<JobApplication> findByJob_Customer_Id(Long customerId);
	
	Optional<JobApplication> findByJob_IdAndJob_Customer_Id(Long jobId, Long customerId);

	Optional<JobApplication> findByJobId(Long jobId);

	List<JobApplication> findByCleanerAndStatusIn(Employee cleaner, List<String> statuses);

	List<JobApplication> findByCleanerIdAndJobCustomerId(Long cleanerId, Long customerId);

	List<JobApplication> findJobApplicationById(Long id);

	Optional<JobApplication> findJobApplicationByJob_IdAndStatus(Long jobId, String status);

	List<JobApplication> findJobApplicationByJobIdAndStatus(Long jobId, String status);



}
