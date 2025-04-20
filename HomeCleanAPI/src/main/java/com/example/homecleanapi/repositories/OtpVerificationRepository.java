package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpVerificationRepository  extends JpaRepository<OtpVerification, Long> {
    Optional<OtpVerification> findTopByPhoneAndOtpCodeOrderByCreatedAtDesc(String phone, String otpCode);

    Optional<OtpVerification> findTopByPhoneOrderByCreatedAtDesc(String phone);
}
