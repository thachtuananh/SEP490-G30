package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.Profit;
import com.google.api.gax.paging.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import java.awt.print.Pageable;
import java.util.List;

public interface ProfitRepository extends JpaRepository<Profit, Long> {
}

