//package com.example.homecleanapi.controllers;
//
//
//import com.example.homecleanapi.dtos.CustomerProfileRequest;
//import com.example.homecleanapi.services.CustomerProfileService;
//
//import com.example.homecleanapi.utils.JwtUtils;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/customer")
//public class ProfileController {
//
//
//    @Autowired
//    private CustomerProfileService customerProfileService;
//
//    @Autowired
//    private JwtUtils jwtUtils;
//
//    @GetMapping("/profile")
//    public ResponseEntity<Map<String, Object>> getProfile(@RequestHeader("Authorization") String authorizationHeader) {
//        String token = authorizationHeader.substring(7);
//
//        if (!jwtUtils.validateToken(token)) {
//            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
//        }
//
//        String userType = jwtUtils.getClaimFromToken(token, "userType");
//        if (!userType.equals("customer")) {
//            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
//        }
//
//        String phone = jwtUtils.getUsernameFromToken(token);
//
//        return customerProfileService.getProfile(phone);
//    }
//
//
//
//
//    @PutMapping("/profile")
//    public ResponseEntity<Map<String, Object>> updateProfile(@RequestHeader("Authorization") String authorizationHeader,
//                                                              @RequestBody CustomerProfileRequest request) {
//        String token = authorizationHeader.substring(7);
//
//        if (!jwtUtils.validateToken(token)) {
//            return ResponseEntity.status(403).body(Map.of("message", "Unauthorized"));
//        }
//
//        String phone = jwtUtils.getUsernameFromToken(token);
//        return customerProfileService.updateProfile(phone, request);
//    }
//
//
//
//
//
//}
//
//
//
