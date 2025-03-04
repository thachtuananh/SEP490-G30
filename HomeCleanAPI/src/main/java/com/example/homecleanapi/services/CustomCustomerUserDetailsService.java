package com.example.homecleanapi.services;

import com.example.homecleanapi.models.CustomUserDetails;
import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.repositories.CustomerRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomCustomerUserDetailsService implements UserDetailsService {

    private final CustomerRepository customerRepository;

    public CustomCustomerUserDetailsService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String phone) throws UsernameNotFoundException {
        Customers customer = customerRepository.findByPhone(phone);
        if (customer == null) {
            throw new UsernameNotFoundException("User not found with phone number: " + phone);
        }
        return new CustomUserDetails(customer);
    }
}