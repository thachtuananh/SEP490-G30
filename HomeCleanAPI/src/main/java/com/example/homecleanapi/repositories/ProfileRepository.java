package com.example.homecleanapi.repositories;

<<<<<<< HEAD


import com.example.homecleanapi.models.Customers;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Customers, Long> {
    Customers findByPhone(String phone);
    boolean existsByPhone(String phone);
=======
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homecleanapi.models.Customers;

@Repository
public interface ProfileRepository extends JpaRepository<Customers, Long> {
	Customers findByPhone(String phone);
    boolean existsByPhone(String phone);

>>>>>>> 9a0130a (new commit with new API)
}
