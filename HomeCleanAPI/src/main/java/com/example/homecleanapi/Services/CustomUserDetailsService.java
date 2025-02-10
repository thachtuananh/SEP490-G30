package com.example.homecleanapi.Services;

import com.example.homecleanapi.Models.CustomUserDetails;
import com.example.homecleanapi.Models.Customers;
import com.example.homecleanapi.Repositories.CustomerRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService  implements UserDetailsService {

    private final CustomerRepository customerRepository;

    public CustomUserDetailsService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String phone) throws UsernameNotFoundException {
        Customers customer = customerRepository.findByPhone(phone)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with phone number: " + phone));

        return new CustomUserDetails(customer);
    }
}
