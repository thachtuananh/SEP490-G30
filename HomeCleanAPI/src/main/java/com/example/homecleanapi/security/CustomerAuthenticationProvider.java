package com.example.homecleanapi.security;

import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.repositories.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;


@Component
public class CustomerAuthenticationProvider implements AuthenticationProvider {

    @Autowired
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public CustomerAuthenticationProvider(CustomerRepository customerRepository,  PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String phone = authentication.getName();
        String password = authentication.getCredentials().toString();
        Customers customer = customerRepository.findByPhone(phone);
        if (customer == null || !password.equals(customer.getPassword_hash())) {
            throw new UsernameNotFoundException("Invalid username or password");
        }
        return new UsernamePasswordAuthenticationToken(phone, password, AuthorityUtils.NO_AUTHORITIES);
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }
}