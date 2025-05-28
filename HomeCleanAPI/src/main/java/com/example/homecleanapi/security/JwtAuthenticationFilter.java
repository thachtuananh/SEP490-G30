package com.example.homecleanapi.security;

import com.example.homecleanapi.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtils jwtUtils;
    private final UserDetailsService customerUserDetailsService;
    private final UserDetailsService employeeUserDetailsService;
    private final UserDetailsService adminUserDetailsService;

    public JwtAuthenticationFilter(JwtUtils jwtUtils,
                                   UserDetailsService customerUserDetailsService,
                                   UserDetailsService employeeUserDetailsService,
                                   UserDetailsService adminUserDetailsService) {
        this.jwtUtils = jwtUtils;
        this.customerUserDetailsService = customerUserDetailsService;
        this.employeeUserDetailsService = employeeUserDetailsService;
        this.adminUserDetailsService = adminUserDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (!jwtUtils.validateToken(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        String phone = jwtUtils.getClaimFromToken(token, "phone");
        String role = jwtUtils.getClaimFromToken(token, "role");


        if (phone != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = null;

            try {
                switch (role) {
                    case "Customer":
                        userDetails = customerUserDetailsService.loadUserByUsername(phone);
                        break;
                    case "Cleaner":
                        userDetails = employeeUserDetailsService.loadUserByUsername(phone);
                        break;
                    case "Admin":
                    case "Manager":
                        userDetails = adminUserDetailsService.loadUserByUsername(phone);
                        break;
                }

                if (userDetails != null) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }

            } catch (Exception e) {
                System.out.println("JWT Filter Error: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
