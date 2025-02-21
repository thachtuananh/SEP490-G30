package com.example.homecleanapi.security;

import com.example.homecleanapi.repositories.CustomerRepository;
import com.example.homecleanapi.repositories.EmployeeRepository;
import com.example.homecleanapi.services.CustomCustomerUserDetailsService;
import com.example.homecleanapi.services.CustomEmployeeUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private CustomerRepository customerRepository; // Inject CustomerRepository
    private EmployeeRepository employeeRepository; // Inject EmployeeRepository

    @Bean
    public UserDetailsService customerUserDetailsService() {
        return new CustomCustomerUserDetailsService(customerRepository); // Custom UserDetailsService cho Customer
    }

    @Bean
    public UserDetailsService employeeUserDetailsService() {
        return new CustomEmployeeUserDetailsService(employeeRepository); // Custom UserDetailsService cho Employee
    }


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .authorizeHttpRequests(auth -> auth
                                .requestMatchers("/api/customer/login").permitAll() // Endpoint login cho Customer
                                .requestMatchers("/api/customer/register").permitAll()
                                .requestMatchers("/api/customer/forgot-password").permitAll()
                                .requestMatchers("/api/employee/login").permitAll()
                                .requestMatchers("/api/employee/register").permitAll()
                                .requestMatchers("/api/employee/forgot-password").permitAll()
                                .requestMatchers("/api/employee/**").permitAll() // Endpoint login cho Employee
                                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                                .requestMatchers("/api-docs").permitAll()
//                        .requestMatchers("/api/customer/**").hasRole("CUSTOMER") // Các API của Customer
//                        .requestMatchers("/api/employee/**").hasRole("EMPLOYEE") // Các API của Employee
                                .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(customerAuthenticationProvider())  // Sử dụng AuthenticationProvider riêng
                .authenticationProvider(employeeAuthenticationProvider()); // Sử dụng AuthenticationProvider riêng


        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CustomerAuthenticationProvider customerAuthenticationProvider() {
        return new CustomerAuthenticationProvider(customerRepository, passwordEncoder());
    }

    @Bean
    public EmployeeAuthenticationProvider employeeAuthenticationProvider() {
        return new EmployeeAuthenticationProvider(employeeRepository, passwordEncoder());
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*")); // Cho phép tất cả các origin
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")); // Cho phép các phương thức
        configuration.setAllowedHeaders(List.of("*")); // Cho phép tất cả các headers
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Áp dụng cho tất cả các đường dẫn
        return source;
    }
}