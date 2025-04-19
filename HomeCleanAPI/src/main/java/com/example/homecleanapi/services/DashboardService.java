package com.example.homecleanapi.services;

import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.repositories.JobGroupedStatusCount;
import com.example.homecleanapi.repositories.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {
    @Autowired
    private final JobRepository jobRepository;

    public DashboardService(JobRepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public ResponseEntity<?> countJobByStatus() {
        try {
            List<JobGroupedStatusCount> groupedCounts = jobRepository.countJobByStatus();

            // Chuyển sang dạng JSON-friendly Map
            Map<String, Long> response = new HashMap<>();
            for (JobGroupedStatusCount item : groupedCounts) {
                response.put(item.getGroupStatus(), item.getCount());
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi đếm job theo trạng thái"));
        }
    }
}
