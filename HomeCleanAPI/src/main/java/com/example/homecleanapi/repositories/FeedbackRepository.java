package com.example.homecleanapi.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.homecleanapi.models.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
	List<Feedback> findByJobId(Integer jobId); 
	Optional<Feedback> findByJob_Id(Long jobId);
	
}
