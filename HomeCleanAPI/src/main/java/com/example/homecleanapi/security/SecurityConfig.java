package com.example.homecleanapi.security;

import com.example.homecleanapi.repositories.CustomerRepository;
import com.example.homecleanapi.repositories.EmployeeRepository;
import com.example.homecleanapi.services.CustomCustomerUserDetailsService;
import com.example.homecleanapi.services.CustomEmployeeUserDetailsService;
import com.example.homecleanapi.utils.JwtUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtUtils jwtUtils;
    private CustomerRepository customerRepository; // Inject CustomerRepository
    private EmployeeRepository employeeRepository; // Inject EmployeeRepository

    public SecurityConfig(JwtUtils jwtUtils, CustomerRepository customerRepository, EmployeeRepository employeeRepository) {
        this.jwtUtils = jwtUtils;
        this.customerRepository = customerRepository;
        this.employeeRepository = employeeRepository;
    }

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
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // 🔥 Sửa lỗi cú pháp CORS
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/customer/login").permitAll()
                        .requestMatchers("/api/customer/register").permitAll()
                        .requestMatchers("/api/customer/forgot-password").permitAll()
                        .requestMatchers("/api/employee/login").permitAll()
                        .requestMatchers("/api/employee/register").permitAll()
                        .requestMatchers("/api/employee/forgot-password").permitAll()
                        .requestMatchers("/api/services/**").permitAll()
                        .requestMatchers("/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api-docs").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(customerAuthenticationProvider())
                .authenticationProvider(employeeAuthenticationProvider())
                .addFilterBefore(new JwtAuthenticationFilter(jwtUtils, customerUserDetailsService(), employeeUserDetailsService()),
                        UsernamePasswordAuthenticationFilter.class);
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
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:8080",
                "http://localhost:3000",
                "http://34.121.192.129:8080",
                "https://house-clean-platform.web.app",
                "https://house-clean-platform.firebaseapp.com",
                "https://costume-lithuania-parameter-bathrooms.trycloudflare.com",
                "https://during-scripting-assessments-fare.trycloudflare.com")); // 🔥 Thêm domain frontend của bạn
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}