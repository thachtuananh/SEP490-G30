package com.example.homecleanapi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.homecleanapi.models.JobServiceDetail;

public interface JobServiceDetailRepository extends JpaRepository<JobServiceDetail, Long> {
	
}
