package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.CleanerFeedback;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.models.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CleanerFeedbackRepository extends JpaRepository<CleanerFeedback, Long> {
    Optional<CleanerFeedback> findByJobAndCleaner(Job job, Employee cleaner);

    Optional<CleanerFeedback> findByJob_IdAndCleaner_Id(Long jobId, Long cleanerId);

}
