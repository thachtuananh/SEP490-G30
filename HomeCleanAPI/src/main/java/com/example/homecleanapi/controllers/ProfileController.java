//package com.example.homecleanapi.controllers;
//
//import com.example.homecleanapi.dtos.CustomerProfileRequest;
//import com.example.homecleanapi.services.CustomerService;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.Map;
//
//@RestController
//@RequestMapping("/api/customer")
//public class ProfileController {
//    private final CustomerService customerService;
//
//    public ProfileController(CustomerService customerService) {
//        this.customerService = customerService;
//    }
//
//    //     API xem profile khách hàng
//    @GetMapping("/profile")
//    public ResponseEntity<Map<String, Object>> getProfile(@RequestParam Integer cusomter_id) {
//        return customerService.getProfile(cusomter_id);
//    }
//
////     API cập nhật profile khách hàng
//    @PutMapping("/profile")
//    public ResponseEntity<Map<String, Object>> updateProfile(@RequestBody CustomerProfileRequest request, @RequestParam Integer cusomter_id) {
//
//        return customerService.updateProfile(cusomter_id, request);
//    }
//
//}


