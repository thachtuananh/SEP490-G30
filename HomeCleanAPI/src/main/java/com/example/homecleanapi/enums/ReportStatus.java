package com.example.homecleanapi.enums;

public enum ReportStatus {
    PENDING,      // Báo cáo đang chờ xử lý
    REVIEWING,     // Đang xem xét
    RESOLVED,     // Đã giải quyết
    DISMISSED,     // Đã bác bỏ
    CANCEL,       // Đã hủy
    FAIL,         // Thất bại
}
