package com.example.homecleanapi.vnPay;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.example.homecleanapi.models.AdminTransactionHistory;
import com.example.homecleanapi.repositories.AdminTransactionHistoryRepository;
import com.example.homecleanapi.services.JobService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
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

    @Autowired
    private JobService jobService;
    @Autowired
    private AdminTransactionHistoryRepository adminTransactionHistoryRepository;

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
        try {
            if ("00".equals(responseCode)) {
                List<Job> jobs = jobRepository.findAllByTxnRef(txnRef);

                if (!jobs.isEmpty()) {
                    for (Job job : jobs) {
                        job.setStatus(JobStatus.OPEN);
                    }
                    jobRepository.saveAll(jobs);

                    // Tính tổng tiền từ tất cả các Job
                    double totalAmount = jobs.stream().mapToDouble(Job::getTotalPrice).sum();

                    // Lưu thông tin vào AdminTransactionHistory sau khi thanh toán thành công
                    AdminTransactionHistory transactionHistory = new AdminTransactionHistory();
                    transactionHistory.setCustomer(jobs.get(0).getCustomer());
                    transactionHistory.setCleaner(jobs.get(0).getCleaner());
                    transactionHistory.setTransactionType("BOOKED");
                    transactionHistory.setAmount(totalAmount);
                    transactionHistory.setTransactionDate(LocalDateTime.now());
                    transactionHistory.setPaymentMethod("VNPay");
                    transactionHistory.setStatus("SUCCESS");
                    transactionHistory.setDescription("Thanh toán thành công qua vnpay");

                    // Lưu vào bảng AdminTransactionHistory
                    adminTransactionHistoryRepository.save(transactionHistory);

                    // Thành công thì redirect về URL frontend
                    String redirectUrl = "https://house-clean-plaform-backup.web.app/ordersuccess?status=success";
                    return ResponseEntity.status(HttpStatus.FOUND)
                            .header(HttpHeaders.LOCATION, redirectUrl)
                            .build();
                } else {
                    // Không tìm thấy Job nào
                    String redirectUrl = "https://house-clean-plaform-backup.web.app/orderfail?status=fail";
                    return ResponseEntity.status(HttpStatus.FOUND)
                            .header(HttpHeaders.LOCATION, redirectUrl)
                            .build();
                }
            } else {
                // Thanh toán thất bại (responseCode khác "00")
                String redirectUrl = "https://house-clean-plaform-backup.web.app/orderfail?status=fail";
                return ResponseEntity.status(HttpStatus.FOUND)
                        .header(HttpHeaders.LOCATION, redirectUrl)
                        .build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            String redirectUrl = "https://house-clean-plaform-backup.web.app/orderfail?status=fail";
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, redirectUrl)
                    .build();
        }
    }




    @PostMapping(value = "/retry-payment/{jobId}")
    public ResponseEntity<Map<String, Object>> retryPayment(@PathVariable Long jobId, HttpServletRequest requestIp) {
        Map<String, Object> response = jobService.retryPayment(jobId, requestIp); // Gọi service xử lý thanh toán lại

        if (response.containsKey("message") && response.get("message").equals("Job not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response); // Trả về lỗi nếu job không tồn tại
        }

        return ResponseEntity.ok(response); // Trả về kết quả thành công
    }





}


