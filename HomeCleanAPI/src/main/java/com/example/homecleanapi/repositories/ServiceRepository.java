package com.example.homecleanapi.repositories;


import com.example.homecleanapi.models.Services;


import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<Services, Long> {
    List<Services> findAll();
}



