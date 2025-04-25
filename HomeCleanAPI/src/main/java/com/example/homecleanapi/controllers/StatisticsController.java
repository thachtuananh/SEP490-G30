package com.example.homecleanapi.controllers;

import com.example.homecleanapi.services.StatisticsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "Statistical API")
@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/customer-cleaner-status")
    public ResponseEntity<StatisticsService.Statistics> getStatistics() {
        StatisticsService.Statistics stats = statisticsService.getStatistics();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/revenue-by-year-and-month")
    public ResponseEntity<Map<String, Map<String, Double>>> getRevenueByYearAndMonth() {
        Map<String, Map<String, Double>> revenueStats = statisticsService.getRevenueByYearAndMonth();
        return ResponseEntity.ok(revenueStats);
    }

}
