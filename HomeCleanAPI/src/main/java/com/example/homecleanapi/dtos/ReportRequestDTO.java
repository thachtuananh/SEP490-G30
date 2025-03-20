package com.example.homecleanapi.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReportRequestDTO {
    private String report_type;
    private String description;
    private String status;
}
