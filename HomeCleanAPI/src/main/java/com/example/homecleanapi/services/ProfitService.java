package com.example.homecleanapi.services;

import com.example.homecleanapi.models.Profit;
import com.example.homecleanapi.repositories.ProfitRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ProfitService {
    private final ProfitRepository profitRepository;

    public ProfitService(ProfitRepository profitRepository) {
        this.profitRepository = profitRepository;
    }

    public ResponseEntity<Map<String, Object>> getProfile(int page, int size) {
        Map<String, Object> response = new HashMap<>();
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("execution_date").descending());
            Page<Profit> profitPage = profitRepository.findAll(pageable);

            response.put("profits", profitPage.getContent());
            response.put("currentPage", profitPage.getNumber());
            response.put("totalItems", profitPage.getTotalElements());
            response.put("totalPages", profitPage.getTotalPages());

            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            response.put("message", "Lỗi khi lấy dữ liệu profits");
            response.put("error", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
