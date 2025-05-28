package com.example.homecleanapi.dtos;

public class CleanerOnlineMessage {
    private String cleanerId;
    private String cleanerName;
    private String profileImage;
    private String token;
	public String getCleanerId() {
		return cleanerId;
	}
	public void setCleanerId(String cleanerId) {
		this.cleanerId = cleanerId;
	}
	public String getCleanerName() {
		return cleanerName;
	}
	public void setCleanerName(String cleanerName) {
		this.cleanerName = cleanerName;
	}
	public String getProfileImage() {
		return profileImage;
	}
	public void setProfileImage(String profileImage) {
		this.profileImage = profileImage;
	}
	public String getToken() {
		return token;
	}
	public void setToken(String token) {
		this.token = token;
	}

    
}
