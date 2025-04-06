package com.example.homecleanapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HomeCleanApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(HomeCleanApiApplication.class, args);
    }

}
