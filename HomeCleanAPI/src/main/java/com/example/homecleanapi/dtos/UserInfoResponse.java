package com.example.homecleanapi.dtos;

public class UserInfoResponse {
    private Integer id;
    private String password;
    private String phone;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public UserInfoResponse(String password, String phone) {
        this.password = password;
        this.phone = phone;
    }
}
