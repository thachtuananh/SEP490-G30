package com.example.homecleanapi.controllers;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportUpdateDTO {
    private String status;
    private LocalDate resolvedAt;
    private String adminResponse;
}
