package com.example.homecleanapi.models;

import com.example.homecleanapi.enums.ReportStatus;  // Import đúng enum ReportStatus
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Entity
@Table(name = "reports")
@Getter
@Setter
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reporter_id")
    private Integer customerId;

    @Column(name = "reported_user_id")
    private Integer cleanerId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", referencedColumnName = "id")
    private Job job;

    private String reportType;
    private String description;

    private String status = "PENDING";  // Default status

    private LocalDate createdAt = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDate();
    private LocalDate updatedAt = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDate();
    private LocalDate resolvedAt;
    private String adminResponse;
}

