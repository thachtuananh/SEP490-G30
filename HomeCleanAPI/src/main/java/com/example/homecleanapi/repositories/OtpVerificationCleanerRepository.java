package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.OtpVerificationCleaner;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpVerificationCleanerRepository extends JpaRepository<OtpVerificationCleaner, Long> {
    Optional<OtpVerificationCleaner> findTopByPhoneAndOtpCodeOrderByCreatedAtDesc(String phone, String otpCode);

    Optional<OtpVerificationCleaner> findTopByPhoneOrderByCreatedAtDesc(String phone);
}
