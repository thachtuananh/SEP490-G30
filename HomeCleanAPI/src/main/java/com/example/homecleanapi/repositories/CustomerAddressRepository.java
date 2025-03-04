package com.example.homecleanapi.repositories;

import com.example.homecleanapi.models.CustomerAddresses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddresses, Integer> {
    List<CustomerAddresses> findCustomerAddressesByCustomer_Id(Integer id);
    CustomerAddresses findCustomerAddressesById(Integer id);
}
