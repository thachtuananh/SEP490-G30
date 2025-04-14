package com.example.homecleanapi.controllers;

import com.example.homecleanapi.services.SmsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@Tag(name = "SMS Service API")
@RestController
@RequestMapping("/api/sms")
public class SmsController {
    private final SmsService smsService;

    public SmsController(SmsService smsService) {
        this.smsService = smsService;
    }

    @PostMapping(value = "/send", produces = MediaType.APPLICATION_JSON_VALUE)
    public String sendSms(@RequestParam String to, @RequestBody String message) {
        return smsService.sendSms(to, message);
    }
}
