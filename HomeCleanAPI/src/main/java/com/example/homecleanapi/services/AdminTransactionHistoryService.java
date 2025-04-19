package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.AdminTransactionHistoryDTO;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.AdminTransactionHistory;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.repositories.AdminTransactionHistoryRepository;
import com.example.homecleanapi.repositories.JobRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminTransactionHistoryService {

    @Autowired
    private AdminTransactionHistoryRepository adminTransactionHistoryRepository;
    @Autowired
    private JobRepository jobRepository;

    public double calculateTotalRevenue() {
        double totalRevenue = 0;

        // Lấy tất cả giao dịch từ AdminTransactionHistory
        List<AdminTransactionHistory> transactionHistoryList = adminTransactionHistoryRepository.findAll();

        // Log để kiểm tra các giao dịch
        System.out.println("Tổng số giao dịch: " + transactionHistoryList.size());

        // Duyệt qua các giao dịch để tính tổng doanh thu
        for (AdminTransactionHistory transaction : transactionHistoryList) {
            System.out.println("Transaction Type: " + transaction.getTransactionType());
            System.out.println("Transaction Amount: " + transaction.getAmount());

            // Nếu là giao dịch nạp tiền hoặc book job, cộng tiền vào tổng
            if ("DEPOSIT".equals(transaction.getTransactionType()) || "BOOKED".equals(transaction.getTransactionType())) {
                totalRevenue += transaction.getAmount();
            }
            // Nếu là giao dịch rút tiền (WITHDREW), trừ tiền khỏi tổng
            else if ("WITHDREW".equals(transaction.getTransactionType())) {
                totalRevenue -= transaction.getAmount();
            }
        }

        System.out.println("Tổng doanh thu: " + totalRevenue);
        return totalRevenue;
    }


    public List<AdminTransactionHistoryDTO> getAllTransactionHistory() {
        // Lấy tất cả giao dịch từ AdminTransactionHistory và chuyển đổi thành DTO chỉ bao gồm các trường cần thiết
        List<AdminTransactionHistory> transactionHistories = adminTransactionHistoryRepository.findAll();

        // Chuyển đổi dữ liệu thành DTO
        List<AdminTransactionHistoryDTO> result = new ArrayList<>();
        for (AdminTransactionHistory transactionHistory : transactionHistories) {
            AdminTransactionHistoryDTO dto = new AdminTransactionHistoryDTO();
            dto.setId(transactionHistory.getId());

            // Chỉ lấy ID của customer và cleaner
            dto.setCustomerId(transactionHistory.getCustomer() != null ? Long.valueOf(transactionHistory.getCustomer().getId()) : null);
            dto.setCleanerId(transactionHistory.getCleaner() != null ? Long.valueOf(transactionHistory.getCleaner().getId()) : null);


            dto.setTransactionType(transactionHistory.getTransactionType());
            dto.setAmount(transactionHistory.getAmount());
            dto.setTransactionDate(transactionHistory.getTransactionDate());
            dto.setPaymentMethod(transactionHistory.getPaymentMethod());
            dto.setStatus(transactionHistory.getStatus());
            dto.setDescription(transactionHistory.getDescription());

            result.add(dto);
        }

        return result;
    }

    @Transactional
    public Double calculateRealRevenue() {
        // Lấy tất cả các job có trạng thái "DONE"
        List<Job> completedJobs = jobRepository.findByStatus(JobStatus.DONE);

        // Tính tổng doanh thu (15% của tổng giá trị job)
        double totalRevenue = 0;
        for (Job job : completedJobs) {
            totalRevenue += job.getTotalPrice() * 0.15; // 15% tổng giá trị của mỗi job
        }

        return totalRevenue;
    }


}

