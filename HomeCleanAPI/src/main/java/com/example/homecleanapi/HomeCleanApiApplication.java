package com.example.homecleanapi;

import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.repositories.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

@SpringBootApplication
public class HomeCleanApiApplication implements CommandLineRunner {

    @Autowired
    private CustomerRepository customerRepository;

    public static void main(String[] args) {
        SpringApplication.run(HomeCleanApiApplication.class, args);
    }

    @Override
    public void run(String... arg) throws Exception {
//        Customers data = customerRepository.findByPhone("0987654321");
        System.out.println(new BCryptPasswordEncoder().encode("password"));
//        System.out.println(data);
    }
}
