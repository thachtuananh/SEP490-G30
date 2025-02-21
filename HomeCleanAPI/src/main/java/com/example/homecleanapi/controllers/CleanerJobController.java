package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.JobSummaryDTO;
import com.example.homecleanapi.services.CleanerJobService;
import com.example.homecleanapi.services.JobService;
import com.example.homecleanapi.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cleaner")
public class CleanerJobController {

    @Autowired
    private CleanerJobService cleanerJobService;

    @Autowired
    private JwtUtils jwtUtils;

    // Xem danh sách các công việc "Open"
    @GetMapping("/jobs")
    public ResponseEntity<List<JobSummaryDTO>> getOpenJobs(@RequestHeader("Authorization") String authorizationHeader) {
        String token = authorizationHeader.substring(7);  

        if (!jwtUtils.validateToken(token)) {
            return ResponseEntity.status(403).body(null);
        }

        String userType = jwtUtils.getClaimFromToken(token, "userType");
        if (!userType.equals("cleaner")) {
            return ResponseEntity.status(403).body(null);
        }

        List<JobSummaryDTO> openJobs = cleanerJobService.getOpenJobs();
        return ResponseEntity.ok(openJobs);
    }
    
    
    @GetMapping("/job/{jobId}")
    public ResponseEntity<Map<String, Object>> getJobDetails(
            @RequestHeader("Authorization") String authorizationHeader, 
            @PathVariable("jobId") Long jobId) {

        String token = authorizationHeader.substring(7);  

        
        if (!jwtUtils.validateToken(token)) {
            return ResponseEntity.status(403).body(null); 
        }

        String userType = jwtUtils.getClaimFromToken(token, "userType");
        
        if (!userType.equals("cleaner")) {
            return ResponseEntity.status(403).body(null);
        }

        
        Map<String, Object> jobDetails = cleanerJobService.getJobDetails(jobId);
        if (jobDetails == null) {
            return ResponseEntity.status(404).body(null); 
        }

        
        return ResponseEntity.ok(jobDetails);
    }


    
    
    

    
    
    
    


}
