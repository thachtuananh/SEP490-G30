package com.example.homecleanapi.services;


import com.example.homecleanapi.models.CustomEmployeeDetails;
import com.example.homecleanapi.models.CustomUserDetails;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.repositories.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

@Component
public class CustomEmployeeUserDetailsService implements UserDetailsService {
    private static final Logger log = LoggerFactory.getLogger(CustomEmployeeUserDetailsService.class);
    private final EmployeeRepository employeeRepository;

    public CustomEmployeeUserDetailsService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String phone) throws UsernameNotFoundException {
        Employee employee = employeeRepository.findByPhone(phone);
        if (employee == null) {
            throw new UsernameNotFoundException("Employee not found with username: " + phone);
        }
        // ... (Logic tạo UserDetails cho Employee, lấy role từ employee)
        return new CustomEmployeeDetails(employee);
    }
}
