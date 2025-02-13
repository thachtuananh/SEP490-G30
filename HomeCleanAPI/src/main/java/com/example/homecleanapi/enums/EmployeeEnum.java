package com.example.homecleanapi.enums;

public enum EmployeeEnum {
    ADMIN("admin"),
    MANAGER("manager"),
    CLEANER("cleaner"),
    EMPLOYEE("employee");

    private String role;

    EmployeeEnum(String role) {
        this.role = role;
    }

    public String getRole() {
        return role;
    }
}
