package com.example.homecleanapi.controllers;
import com.example.homecleanapi.services.AdminCleanerService;
import com.example.homecleanapi.dtos.CleanerProfileRequest;
import com.example.homecleanapi.dtos.*;
import com.example.homecleanapi.utils.JwtUtils;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/admin/cleaners")
public class AdminCleanerController {

    private final AdminCleanerService cleanerService;
    private final JwtUtils jwtUtils;

    public AdminCleanerController(AdminCleanerService cleanerService, JwtUtils jwtUtils) {
        this.cleanerService = cleanerService;
        this.jwtUtils = jwtUtils;
    }

    private boolean isAuthorizedRole(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return false;
        String token = authHeader.substring(7);
        String role = jwtUtils.getClaimFromToken(token, "role");
        return "Admin".equals(role) || "Manager".equals(role);
    }

    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addCleaner(@RequestBody CleanerRegisterRequest request,
                                                          HttpServletRequest requestHttp) {
        if (isAuthorizedRole(requestHttp)) {
            return cleanerService.addCleaner(request);
        }
        return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
    }

    @PatchMapping("/{cleaner_id}/update")
    public ResponseEntity<Map<String, Object>> updateCleaner(@PathVariable("cleaner_id") Long cleanerId,
                                                             @RequestBody CleanerProfileRequest request,
                                                             HttpServletRequest requestHttp) {
        if (isAuthorizedRole(requestHttp)) {
            return cleanerService.updateCleaner(cleanerId, request);
        }
        return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
    }

    @DeleteMapping("/{cleaner_id}/delete")
    public ResponseEntity<Map<String, Object>> deleteCleaner(@PathVariable("cleaner_id") Long cleanerId,
                                                             HttpServletRequest requestHttp) {
        if (isAuthorizedRole(requestHttp)) {
            return cleanerService.softDeleteCleaner(cleanerId);
        }
        return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
    }

    @GetMapping("/{cleaner_id}")
    public ResponseEntity<Map<String, Object>> getCleanerInfo(@PathVariable("cleaner_id") Long cleanerId,
                                                              HttpServletRequest requestHttp) {
        if (isAuthorizedRole(requestHttp)) {
            return cleanerService.getCleanerInfo(cleanerId);
        }
        return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllCleaners(HttpServletRequest requestHttp) {
        if (isAuthorizedRole(requestHttp)) {
            return cleanerService.getAllCleaners();
        }
        return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
    }

    @GetMapping("/{cleaner_id}/jobbookedhistory")
    public ResponseEntity<?> getJobHistory(@PathVariable("cleaner_id") Long cleanerId,
                                           HttpServletRequest requestHttp) {
        if (isAuthorizedRole(requestHttp)) {
            return cleanerService.getJobHistoryByCleanerId(cleanerId);
        }
        return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
    }

    @GetMapping("/{cleaner_id}/jobhistory")
    public ResponseEntity<?> getJobHistoryByCustomer(@PathVariable("cleaner_id") Long cleanerId,
                                                     HttpServletRequest requestHttp) {
        if (isAuthorizedRole(requestHttp)) {
            return cleanerService.getJobHistoryByCleanerIdnull(cleanerId);
        }
        return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
    }

    @GetMapping("/unverified")
    public ResponseEntity<?> getUnverifiedCleaners(HttpServletRequest requestHttp) {
        if (isAuthorizedRole(requestHttp)) {
            return cleanerService.getUnverifiedCleaners();
        }
        return ResponseEntity.status(403).body(Map.of("message", "Access denied"));
    }

    @PatchMapping("/{id}/identity-verified")
    public ResponseEntity<String> updateCleanerIdentityVerifiedAndDeleted(
            @PathVariable Integer id,
            @RequestParam(required = false, defaultValue = "false") Boolean status,
            @RequestParam(required = false, defaultValue = "false") Boolean isDeleted) {
        boolean safeStatus = status != null && status;
        boolean safeIsDeleted = isDeleted != null && isDeleted;

        cleanerService.updateIdentityVerifiedAndDeletedStatus(id, safeStatus, safeIsDeleted);
        return ResponseEntity.ok("Identity verified and deleted status updated successfully.");
    }




}

