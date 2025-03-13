package com.example.homecleanapi.dtos;


public class CleanerSessionInfo {
    private String cleanerId;
    private String cleanerName;
    private String profileImage;

    public CleanerSessionInfo(String cleanerId, String cleanerName, String profileImage) {
        this.cleanerId = cleanerId;
        this.cleanerName = cleanerName;
        this.profileImage = profileImage;
    }

    public String getCleanerId() {
        return cleanerId;
    }

    public String getCleanerName() {
        return cleanerName;
    }

    public String getProfileImage() {
        return profileImage;
    }
}


