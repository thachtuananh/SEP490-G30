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
import java.util.LinkedHashMap;
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
            Map<String, Long> statusCountMap = new HashMap<>();
            long total = 0;
            for (JobGroupedStatusCount item : groupedCounts) {
                String status = item.getGroupStatus();
                Long count = item.getCount();
                statusCountMap.put(status, count);
                total += count;
            }
            // Lấy số job DONE và CANCELLED (nếu không có thì gán 0)
            long done = statusCountMap.getOrDefault("DONE", 0L);
            long cancelled = statusCountMap.getOrDefault("CANCELLED", 0L);

            // Tính tỉ lệ
            double doneRate = total > 0 ? (done * 100.0) / total : 0.0;
            double cancelledRate = total > 0 ? (cancelled * 100.0) / total : 0.0;
            // Gộp kết quả vào 1 Map trả về
            Map<String, Object> response = new LinkedHashMap<>();
            response.putAll(statusCountMap); // DONE, OPEN, CANCELLED, IN_PROGRESS
            response.put("doneRate", roundToTwoDecimal(doneRate));
            response.put("cancelledRate", roundToTwoDecimal(cancelledRate));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi khi lấy dữ liệu của bảng Jobs"));
        }
    }

    // Làm tròn số thập phân 2 chữ số
    private double roundToTwoDecimal(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
