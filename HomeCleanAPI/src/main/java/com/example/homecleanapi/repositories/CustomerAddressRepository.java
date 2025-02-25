package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.CustomerAddress;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, Long> {
	Optional<CustomerAddress> findByCustomerIdAndIsDefaultTrue(Integer customerId);
}
