package com.example.homecleanapi.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.homecleanapi.models.JobServiceDetail;

public interface JobServiceDetailRepository extends JpaRepository<JobServiceDetail, Long> {
	List<JobServiceDetail> findByJobId(Long jobId);
	
	List<JobServiceDetail> findByJobIdIn(List<Long> jobIds);
	
	List<JobServiceDetail> findByServiceId(Long serviceId);
}
