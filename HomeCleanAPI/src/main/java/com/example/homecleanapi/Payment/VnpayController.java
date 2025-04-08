package com.example.homecleanapi.Payment;

import java.util.Optional;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.repositories.JobRepository;



@RestController
@RequestMapping("/api/vnpayment")
public class VnpayController {

    @Autowired
    private JobRepository jobRepository;
    private final VnpayService vnpayService;

    public VnpayController(VnpayService vnpayService) {
        this.vnpayService = vnpayService;
    }

    @PostMapping
    public ResponseEntity<String> createPayment(@RequestBody VnpayRequest paymentRequest, HttpServletRequest request) {
        try {
            String paymentUrl = vnpayService.createPayment(paymentRequest, request);
            return ResponseEntity.ok(paymentUrl);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Đã xảy ra lỗi khi tạo thanh toán!");
        }
    }

    @GetMapping("/return")
    public ResponseEntity<String> returnPayment(@RequestParam("vnp_ResponseCode") String responseCode,
                                                @RequestParam("vnp_TxnRef") String txnRef) {
        if ("00".equals(responseCode)) {
            Optional<Job> jobOpt = jobRepository.findByTxnRef(txnRef);  

            if (jobOpt.isPresent()) {
                Job job = jobOpt.get();
                job.setStatus(JobStatus.OPEN);  
                jobRepository.save(job);  

                return ResponseEntity.ok("Thanh toán thành công! Job đã được xác nhận.");
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Job không tồn tại.");
            }
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Thanh toán thất bại! Mã lỗi: " + responseCode);
        }
    }





}



