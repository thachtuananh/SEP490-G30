package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.ReportRequestDTO;
import com.example.homecleanapi.dtos.ReportUpdateDTO;
import com.example.homecleanapi.models.CleanerReport;
import com.example.homecleanapi.services.ReportService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Report API")
@RestController
@RequestMapping("/api/reports")
@SecurityRequirement(name = "BearerAuth")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping(value = "/{job_id}/create-report-customer",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createReportCustomer(ReportRequestDTO reportRequest, @PathVariable Long job_id) {
        return reportService.customerCreateReport(reportRequest, job_id);
    }

    @PutMapping(value = "/{report_id}/update_report-customer", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateReportCustomer(ReportUpdateDTO reportUpdate, @PathVariable Long report_id) {
        return reportService.updateCustomerReport(reportUpdate, report_id);
    }

    @PostMapping(value = "/{job_id}/create-report-cleaner",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createReportCleaner(ReportRequestDTO reportRequest, @PathVariable Long job_id) {
        return reportService.cleanerCreateReport(reportRequest, job_id);
    }

    @PutMapping(value = "/{report_id}/update_report-cleaner", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateReportCleaner(ReportUpdateDTO reportUpdate, @PathVariable Long report_id) {
        return reportService.updateCleanerReport(reportUpdate, report_id);
    }

    @GetMapping(value = "/get-all-report-customer", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAllReportCustomer(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "12") int limit
    ) {
        return reportService.getAllReportCustomer(offset, limit);
    }

    @GetMapping(value = "/get-all-report-customer", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAllReportCleaner(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "12") int limit
    ) {
        return reportService.getAllReportCleaner(offset, limit);
    }

    @GetMapping(value = "/{customerId}/get-report-customer", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getReportByCustomerId(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "12") int limit
            ) {
        return reportService.getReportByCustomerId(customerId, offset, limit);
    }

    @GetMapping(value = "/{cleanerId}/get-report-cleaner", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getReportByCleanerId(
            @PathVariable Integer cleanerId,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "12") int limit
    ) {
        return reportService.getReportByCleanerId(cleanerId, offset, limit);
    }

    @GetMapping(value = "/{customerId}/get-report-customer/{jobId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getReportByCustomerId(@PathVariable Long customerId, @PathVariable Long jobId) {
        return reportService.getReportByCustomerIdAndJobId(customerId, jobId);
    }

    @GetMapping(value = "/{cleanerId}/get-report-cleaner/{jobId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getReportByCleanerId(@PathVariable Integer cleanerId, @PathVariable Long jobId) {
        return reportService.getReportByCleanerIdAndJobId(cleanerId, jobId);
    }
}
