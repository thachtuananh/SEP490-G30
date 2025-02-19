package com.example.homecleanapi.repositories;

<<<<<<< HEAD
<<<<<<< HEAD


import com.example.homecleanapi.models.Customers;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Customers, Long> {
    Customers findByPhone(String phone);
    boolean existsByPhone(String phone);
=======
=======
>>>>>>> 1751fa820f84132c0e8f88f2ccce12cc415882e1
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.homecleanapi.models.Customers;

@Repository
public interface ProfileRepository extends JpaRepository<Customers, Long> {
	Customers findByPhone(String phone);
    boolean existsByPhone(String phone);

<<<<<<< HEAD
>>>>>>> 9a0130a (new commit with new API)
=======
>>>>>>> 1751fa820f84132c0e8f88f2ccce12cc415882e1
}
