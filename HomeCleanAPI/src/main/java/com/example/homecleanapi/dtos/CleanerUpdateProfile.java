package com.example.homecleanapi.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CleanerUpdateProfile {
    private String name;
    private String phone;
    private String email;
    private Integer age;
    private String identity_number;
    private String experience;
    private String profile_image;
}
