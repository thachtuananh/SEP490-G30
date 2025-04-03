package com.example.homecleanapi.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.homecleanapi.models.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
	List<Feedback> findByJobId(Integer jobId); 
	
	List<Feedback> findByJobId(Long jobId);
	
	Optional<Feedback> findByJob_IdAndJob_Customer_Id(Long jobId, Long customerId);

}
