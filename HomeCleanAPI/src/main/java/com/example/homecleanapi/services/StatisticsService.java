package com.example.homecleanapi.services;

import com.example.homecleanapi.repositories.CustomerRepository;
import com.example.homecleanapi.repositories.CleanerRepository;
import com.example.homecleanapi.repositories.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StatisticsService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CleanerRepository cleanerRepository;

    @Autowired
    private JobRepository jobRepository;

    public Statistics getStatistics() {
        // Đếm khách hàng đang hoạt động và đã bị khóa
        long activeCustomers = customerRepository.countByIsDeleted(false);
        long lockedCustomers = customerRepository.countByIsDeleted(true);

        // Đếm cleaner đang hoạt động và đã bị khóa
        long activeCleaners = cleanerRepository.countByIsDeleted(false);
        long lockedCleaners = cleanerRepository.countByIsDeleted(true);

        // Đếm số lượng cleaner chưa xác thực
        long unverifiedCleaners = cleanerRepository.findCleanersNotVerified().size();

        return new Statistics(activeCustomers, lockedCustomers, activeCleaners, lockedCleaners, unverifiedCleaners);
    }

    public Map<String, Map<Integer, Double>> getRevenueByYearAndMonth() {
        List<Object[]> results = jobRepository.findRevenueByYearAndMonthNative();
        Map<String, Map<Integer, Double>> revenueMap = new HashMap<>();

        for (Object[] row : results) {
            // Giả sử cấu trúc row: [year, month, sum]
            Integer year = (Integer) row[0];
            Integer month = (Integer) row[1];
            Double sum   = (Double) row[2];

            // Chuyển year thành String để làm khóa ngoài
            String yearKey = year.toString();

            // Lấy (hoặc khởi tạo) Map tháng -> doanh thu cho năm hiện tại
            Map<Integer, Double> monthMap = revenueMap.computeIfAbsent(yearKey, y -> new HashMap<>());

            // Đưa tổng doanh thu vào Map tháng tương ứng
            monthMap.put(month, sum);
        }

        return revenueMap;
    }



    public static class Statistics {
        private long activeCustomers;
        private long lockedCustomers;
        private long activeCleaners;
        private long lockedCleaners;
        private long unverifiedCleaners;

        public Statistics(long activeCustomers, long lockedCustomers, long activeCleaners, long lockedCleaners, long unverifiedCleaners) {
            this.activeCustomers = activeCustomers;
            this.lockedCustomers = lockedCustomers;
            this.activeCleaners = activeCleaners;
            this.lockedCleaners = lockedCleaners;
            this.unverifiedCleaners = unverifiedCleaners;
        }

        // Getters and setters
        public long getActiveCustomers() {
            return activeCustomers;
        }

        public void setActiveCustomers(long activeCustomers) {
            this.activeCustomers = activeCustomers;
        }

        public long getLockedCustomers() {
            return lockedCustomers;
        }

        public void setLockedCustomers(long lockedCustomers) {
            this.lockedCustomers = lockedCustomers;
        }

        public long getActiveCleaners() {
            return activeCleaners;
        }

        public void setActiveCleaners(long activeCleaners) {
            this.activeCleaners = activeCleaners;
        }

        public long getLockedCleaners() {
            return lockedCleaners;
        }

        public void setLockedCleaners(long lockedCleaners) {
            this.lockedCleaners = lockedCleaners;
        }

        public long getUnverifiedCleaners() {
            return unverifiedCleaners;
        }

        public void setUnverifiedCleaners(long unverifiedCleaners) {
            this.unverifiedCleaners = unverifiedCleaners;
        }
    }
}
