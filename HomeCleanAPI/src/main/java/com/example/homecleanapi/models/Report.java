package com.example.homecleanapi.models;

import com.example.homecleanapi.enums.ReportStatus;  // Import đúng enum ReportStatus
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "reporter_id")
    private Customers reporter; 

    @ManyToOne
    @JoinColumn(name = "reported_user_id")
    private Employee reportedUser;  

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job; 

    private String reportType;  
    private String description; 

    @Enumerated(EnumType.STRING)
    private ReportStatus status;  
    private LocalDateTime createdAt = LocalDateTime.now();  
    private LocalDateTime updatedAt = LocalDateTime.now(); 
    private LocalDateTime resolvedAt;  
    private String adminResponse; 
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Customers getReporter() {
        return reporter;
    }

    public void setReporter(Customers reporter) {
        this.reporter = reporter;
    }

    public Employee getReportedUser() {
        return reportedUser;
    }

    public void setReportedUser(Employee reportedUser) {
        this.reportedUser = reportedUser;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ReportStatus getStatus() {
        return status;
    }

    public void setStatus(ReportStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getAdminResponse() {
        return adminResponse;
    }

    public void setAdminResponse(String adminResponse) {
        this.adminResponse = adminResponse;
    }
}
