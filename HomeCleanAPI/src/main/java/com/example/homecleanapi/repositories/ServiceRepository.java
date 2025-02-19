package com.example.homecleanapi.repositories;

<<<<<<< HEAD
import com.example.homecleanapi.models.Services;
=======
import com.example.homecleanapi.models.Service;
>>>>>>> 9a0130a (new commit with new API)

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
<<<<<<< HEAD
public interface ServiceRepository extends JpaRepository<Services, Long> {
    List<Services> findAll();
}  
=======
public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findAll();
}
>>>>>>> 9a0130a (new commit with new API)
