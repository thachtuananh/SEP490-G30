package com.example.homecleanapi.dtos;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Setter
@Getter
public class ChatMessage {
    private Long conversationId;
    private Integer senderId;
    private String content;
    private LocalTime sent_at = LocalTime.now();
	public Long getConversationId() {
		return conversationId;
	}
	public void setConversationId(Long conversationId) {
		this.conversationId = conversationId;
	}
	public Integer getSenderId() {
		return senderId;
	}
	public void setSenderId(Integer senderId) {
		this.senderId = senderId;
	}
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
	public LocalTime getSent_at() {
		return sent_at;
	}
	public void setSent_at(LocalTime sent_at) {
		this.sent_at = sent_at;
	}
    
    
}
