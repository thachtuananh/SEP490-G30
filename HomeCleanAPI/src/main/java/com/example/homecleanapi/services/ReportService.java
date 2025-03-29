package com.example.homecleanapi.services;

import com.example.homecleanapi.controllers.ReportUpdateDTO;
import com.example.homecleanapi.dtos.ReportRequestDTO;
import com.example.homecleanapi.models.Report;
import com.example.homecleanapi.repositories.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    @Autowired
    private final ReportRepository reportRepository;

    public ReportService(ReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public ResponseEntity<Map<String, Object>> createReport(ReportRequestDTO reportRequest, @PathVariable Long job_id) {
        Map<String, Object> response = new HashMap<>();

        Report report = new Report();
        report.setJob_id(job_id);
        report.setReportType(reportRequest.getReport_type());
        report.setDescription(reportRequest.getDescription());

        reportRepository.save(report);
        response.put("report", report);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    public ResponseEntity<Map<String, Object>> updateReport(ReportUpdateDTO reportUpdate, @PathVariable Long report_id) {
        Map<String, Object> response = new HashMap<>();

        Report report = reportRepository.findReportById(report_id);

        report.setReportType(reportUpdate.getStatus());
        report.setResolvedAt(LocalDate.now());
        report.setAdminResponse(reportUpdate.getAdminResponse());
        reportRepository.save(report);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    public ResponseEntity<Map<String, Object>> getAllReport() {
        Map<String, Object> response = new HashMap<>();
        List<Report> reports = reportRepository.findAll();

        response.put("reports", reports);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
