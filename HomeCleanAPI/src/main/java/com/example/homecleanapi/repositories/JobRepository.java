package com.example.homecleanapi.repositories;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homecleanapi.models.Job;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

}
