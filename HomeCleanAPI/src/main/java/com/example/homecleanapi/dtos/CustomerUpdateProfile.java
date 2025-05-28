package com.example.homecleanapi.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomerUpdateProfile {
    private String fullName;
    private String email;
    private String profile_image;
}
