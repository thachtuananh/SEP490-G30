package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.ReportUpdateDTO;
import com.example.homecleanapi.dtos.ReportRequestDTO;
import com.example.homecleanapi.enums.ReportStatus;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.models.JobApplication;
import com.example.homecleanapi.models.Report;
import com.example.homecleanapi.repositories.JobApplicationRepository;
import com.example.homecleanapi.repositories.JobRepository;
import com.example.homecleanapi.repositories.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private final ReportRepository reportRepository;
    private final JobRepository jobRepository;
    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    public ReportService(ReportRepository reportRepository, JobRepository jobRepository) {

        this.reportRepository = reportRepository;
        this.jobRepository = jobRepository;
    }

    public ResponseEntity<Map<String, Object>> createReport(ReportRequestDTO reportRequest, @PathVariable Long job_id) {
        Map<String, Object> response = new HashMap<>();
        // Lấy job từ database bằng id (vì bạn chỉ truyền job_id)
        Optional<Job> optionalJob = jobRepository.findById(job_id);
        Optional<JobApplication> jobApplicationOptional = jobApplicationRepository.findJobApplicationByJob_IdAndStatus(job_id, "Accepted");
        if (optionalJob.isEmpty()) {
            response.put("error", "Job not found with id: " + job_id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Job job = optionalJob.get();
        JobApplication job_application = jobApplicationOptional.get();
        Report report = new Report();
        report.setJob(job);
        report.setCustomerId(job.getCustomer().getId());
        report.setCleanerId(job_application.getCleaner().getId());
        report.setStatus(ReportStatus.PENDING);
        report.setReportType(reportRequest.getReport_type());
        report.setDescription(reportRequest.getDescription());
        reportRepository.save(report);

        response.put("Message: ", "Report created successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    public ResponseEntity<Map<String, Object>> updateReport(ReportUpdateDTO reportUpdate, @PathVariable Long report_id) {
        Map<String, Object> response = new HashMap<>();

        Report report = reportRepository.findReportById(report_id);

        report.setReportType(reportUpdate.getStatus());
        report.setResolvedAt(ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDate());
        report.setAdminResponse(reportUpdate.getAdminResponse());
        reportRepository.save(report);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    public ResponseEntity<Map<String, Object>> getAllReport(int offset, int limit) {
        Map<String, Object> response = new HashMap<>();

        int page = offset / limit;
        Pageable pageable = PageRequest.of(page, limit);
        Page<Report> reports = reportRepository.findAll(pageable);

        List<Map<String, Object>> reportList = reports.getContent().stream().map(report -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", report.getId());
            dto.put("customerId", report.getCustomerId());
            dto.put("cleanerId", report.getCleanerId());
            dto.put("jobId", report.getJob() != null ? report.getJob().getId() : null);
            dto.put("reportType", report.getReportType());
            dto.put("description", report.getDescription());
            dto.put("status", report.getStatus().name());
            dto.put("createdAt", report.getCreatedAt());
            dto.put("updatedAt", report.getUpdatedAt());
            dto.put("resolvedAt", report.getResolvedAt());
            dto.put("adminResponse", report.getAdminResponse());
            return dto;
        }).collect(Collectors.toList());

        response.put("reports", reportList);
        response.put("totalItems", reports.getTotalElements());
        response.put("totalPages", reports.getTotalPages());
        response.put("currentPage", page * limit); // offset hiện tại

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Map<String, Object>> getReportByCustomerId(Long customerId, int offset, int limit) {
        Map<String, Object> response = new HashMap<>();

        int page = offset / limit;
        Pageable pageable = PageRequest.of(page, limit);

        Page<Report> reports = reportRepository.findReportsByCustomerId(customerId, pageable);

        List<Map<String, Object>> cusomterReportList = reports.getContent().stream().map(report -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", report.getId());
            dto.put("jobId", report.getJob() != null ? report.getJob().getId() : null);
            dto.put("reportType", report.getReportType());
            dto.put("description", report.getDescription());
            dto.put("status", report.getStatus().name());
            dto.put("resolvedAt", report.getResolvedAt());
            dto.put("adminResponse", report.getAdminResponse());
            return dto;
        }).collect(Collectors.toList());

        response.put("reports", cusomterReportList);
        response.put("totalItems", reports.getTotalElements());
        response.put("totalPages", reports.getTotalPages());
        response.put("currentPage", page * limit); // offset hiện tại

        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Map<String, Object>> getReportByCleanerId(Long cleanerId, int offset, int limit) {
        Map<String, Object> response = new HashMap<>();
        Pageable pageable = PageRequest.of(offset, limit);

        Page<Report> reports = reportRepository.findReportsByCleanerId(cleanerId, pageable);

        List<Map<String, Object>> cleanerReportList = reports.getContent().stream().map(report -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", report.getId());
            dto.put("jobId", report.getJob() != null ? report.getJob().getId() : null);
            dto.put("reportType", report.getReportType());
            dto.put("description", report.getDescription());
            dto.put("status", report.getStatus().name());
            dto.put("resolvedAt", report.getResolvedAt());
            dto.put("adminResponse", report.getAdminResponse());
            return dto;
        }).collect(Collectors.toList());

        response.put("reports", cleanerReportList);
        response.put("totalItems", reports.getTotalElements());
        response.put("totalPages", reports.getTotalPages());
        response.put("currentPage", reports.getNumber());

        return ResponseEntity.ok(response);
    }

}
