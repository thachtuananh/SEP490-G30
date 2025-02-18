package com.example.homecleanapi.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homecleanapi.models.JobApplication;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    // Bạn có thể thêm các phương thức truy vấn tùy chỉnh nếu cần
}
