package com.example.homecleanapi.controllers;

import com.example.homecleanapi.dtos.LoginRequest;
import com.example.homecleanapi.services.AdminAuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Admin API")
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminAuthService adminAuthService;

    public AdminController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> adminLogin(@RequestBody LoginRequest request) {
        return adminAuthService.adminLogin(request);
    }
}
