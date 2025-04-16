package com.example.homecleanapi.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyOtpRequest {
    private String phone;
    private String otpCode;
}
