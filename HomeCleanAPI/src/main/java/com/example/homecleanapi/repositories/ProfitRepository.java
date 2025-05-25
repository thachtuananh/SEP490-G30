package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.Profit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfitRepository extends JpaRepository<Profit, Long> {
}

