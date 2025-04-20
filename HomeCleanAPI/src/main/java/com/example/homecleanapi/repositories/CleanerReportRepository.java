package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.CleanerReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CleanerReportRepository extends JpaRepository<CleanerReport, Long> {
    CleanerReport findCleanerReportByJob_Id(Long jobId);
    CleanerReport findCleanerReportById(Long id);
    CleanerReport findCleanerReportByCleanerIdAndJob_Id(Integer cleanerId, Long job_id);
    Page<CleanerReport> findReportsByCleanerId(Integer cleanerId, Pageable pageable);
}
