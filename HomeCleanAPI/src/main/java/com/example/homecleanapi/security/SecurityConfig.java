package com.example.homecleanapi.security;

import com.example.homecleanapi.repositories.AdministratorRepository;
import com.example.homecleanapi.repositories.CustomerRepository;
import com.example.homecleanapi.repositories.EmployeeRepository;
import com.example.homecleanapi.services.CustomAdminUserDetailsService;
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
    private final AdministratorRepository administratorRepository;

    public SecurityConfig(JwtUtils jwtUtils,
                          CustomerRepository customerRepository,
                          EmployeeRepository employeeRepository,
                          AdministratorRepository administratorRepository) {
        this.jwtUtils = jwtUtils;
        this.customerRepository = customerRepository;
        this.employeeRepository = employeeRepository;
        this.administratorRepository = administratorRepository;
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
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/customer/login").permitAll()
                        .requestMatchers("/api/customer/register").permitAll()
                        .requestMatchers("/api/customer/forgot-password").permitAll()
                        .requestMatchers("/api/employee/login").permitAll()
                        .requestMatchers("/api/employee/register").permitAll()
                        .requestMatchers("/api/employee/forgot-password").permitAll()
                        .requestMatchers("/api/services/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api-docs").permitAll()
                        .requestMatchers("/api/admin/customers/**").hasAnyRole("Admin", "Manager")
                        .requestMatchers("/**").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(customerAuthenticationProvider())
                .authenticationProvider(employeeAuthenticationProvider())
                .addFilterBefore(new JwtAuthenticationFilter(
                        jwtUtils,
                        customerUserDetailsService(),
                        employeeUserDetailsService(),
                        adminUserDetailsService()
                ), UsernamePasswordAuthenticationFilter.class);

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
    public UserDetailsService adminUserDetailsService() {
        return new CustomAdminUserDetailsService(administratorRepository);
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:8080",
                "http://localhost:3000",
                "https://house-clean-platform.web.app",
                "https://house-clean-platform.firebaseapp.com",
//                "https://costume-lithuania-parameter-bathrooms.trycloudflare.com",
//                "https://grass-finding-presentation-competitions.trycloudflare.com",
//                "https://turkish-content-correction-literally.trycloudflare.com",
                "https://bag-rocks-strings-admit.trycloudflare.com",
                "https://sandbox.vnpayment.vn",
                "http://localhost:6333"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}