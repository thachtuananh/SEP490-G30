package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.Report;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    Report findReportById(Long id);
    Page<Report> findByJob_Customer_Id(Long customerId, Pageable pageable);

}
