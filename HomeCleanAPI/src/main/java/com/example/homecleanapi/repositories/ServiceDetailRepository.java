package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.ServiceDetail;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceDetailRepository extends JpaRepository<ServiceDetail, Long> {
    List<ServiceDetail> findByServiceId(Long serviceId);
}



