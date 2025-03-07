package com.example.homecleanapi.CustomerError;

public class CustomException extends RuntimeException {
    private String errorCode;
    private String detail;

    public CustomException(String message, String errorCode, String detail) {
        super(message);  // Thiết lập thông điệp lỗi
        this.errorCode = errorCode;
        this.detail = detail;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getDetail() {
        return detail;
    }
}

