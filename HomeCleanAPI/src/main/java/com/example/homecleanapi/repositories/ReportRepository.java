package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<Report, Long> {
    Report findReportById(Long id);
    Page<Report> findByJob_Customer_Id(Long customerId, Pageable pageable);
    Page<Report> findReportsByCleanerId(Long cleanerId, Pageable pageable);
    Page<Report> findReportsByCustomerId(Long customerId, Pageable pageable);
    Report findReportsByCustomerIdAndJob_Id(Long customerId, Long jobId);
    Report findReportsByJob_Id(Long jobId);
}
