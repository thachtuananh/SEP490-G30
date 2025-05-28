package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.Administrator;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdministratorRepository extends JpaRepository<Administrator, Long> {
    Administrator findByEmail(String email);
}
