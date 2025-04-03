package com.example.homecleanapi.services;

import com.example.homecleanapi.models.Administrator;
import com.example.homecleanapi.repositories.AdministratorRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

public class CustomAdminUserDetailsService implements UserDetailsService {

    private final AdministratorRepository administratorRepository;

    public CustomAdminUserDetailsService(AdministratorRepository administratorRepository) {
        this.administratorRepository = administratorRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String emailOrPhone) throws UsernameNotFoundException {
        Administrator admin = administratorRepository.findByEmail(emailOrPhone);
        if (admin == null) {
            throw new UsernameNotFoundException("Admin not found");
        }

        return User.builder()
                .username(admin.getEmail())
                .password(admin.getPasswordHash())
                .roles(admin.getRole().getRoleName()) // ex: "Admin"
                .build();
    }
}
