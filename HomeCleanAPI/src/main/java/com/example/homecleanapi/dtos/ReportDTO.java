package com.example.homecleanapi.dtos;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ReportDTO {
    private Long id;
    private Integer customerId;
    private Integer cleanerId;
    private Long jobId;
    private String reportType;
    private String description;
    private String status;
    private LocalDate createdAt;
    private LocalDate updatedAt;
    private LocalDate resolvedAt;
    private String adminResponse;
}
