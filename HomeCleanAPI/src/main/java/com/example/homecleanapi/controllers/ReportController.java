package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.ReportRequestDTO;
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

    @PostMapping(value = "/{job_id}/create-report",  produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> createReport(ReportRequestDTO reportRequest, @PathVariable Long job_id) {
        return reportService.createReport(reportRequest, job_id);
    }

    @PutMapping(value = "/{report_id}/update_report", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> updateReport(ReportUpdateDTO reportUpdate, @PathVariable Long report_id) {
        return reportService.updateReport(reportUpdate, report_id);
    }

    @GetMapping(value = "/get-all-report", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getAllReport() {
        return reportService.getAllReport();
    }

}
