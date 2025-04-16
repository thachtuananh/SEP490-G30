package com.example.homecleanapi.services;

import com.example.homecleanapi.models.OtpVerification;
import com.example.homecleanapi.repositories.OtpVerificationRepository;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {
    private final OtpVerificationRepository otpVerificationRepository;
    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    private static final String twilioPhoneNumber = "+15392825449";
    public OtpService(OtpVerificationRepository otpVerificationRepository) {
        this.otpVerificationRepository = otpVerificationRepository;
    }

    public String generateOtp() {
        return String.valueOf(new Random().nextInt(899999) + 100000); // 6 digits
    }

    public void sendOtp(String phone) {
        String otp = generateOtp();

        Message.creator(
                new PhoneNumber(phone),
                new PhoneNumber(twilioPhoneNumber),
                "Mã OTP của bạn là: " + otp + ". Mã có hiệu lực trong 5 phút."
        ).create();

        OtpVerification entity = new OtpVerification();
        entity.setPhone(phone);
        entity.setOtpCode(otp);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        entity.setVerified(false);
        otpVerificationRepository.save(entity);
    }

    public boolean verifyOtp(String phone, String otpCode) {
        Optional<OtpVerification> otpOpt = otpVerificationRepository.findTopByPhoneAndOtpCodeOrderByCreatedAtDesc(phone, otpCode);

        if (otpOpt.isPresent()) {
            OtpVerification otp = otpOpt.get();
            if (!otp.getVerified() && otp.getExpiresAt().isAfter(LocalDateTime.now())) {
                otp.setVerified(true);
                otpVerificationRepository.save(otp);
                return true;
            }
        }

        return false;
    }
}
