package com.example.homecleanapi.dtos;

public class LoginRequest {
    private String phone;
    private String password;

    public String getPhone() {
        return phone;
    }

    public void setPhone(String username) {
        this.phone = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
