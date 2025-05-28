package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.Profit;
import com.google.api.gax.paging.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.awt.print.Pageable;
import java.util.List;

@Repository
public interface ProfitRepository extends JpaRepository<Profit, Long> {
}

