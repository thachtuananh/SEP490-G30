package com.example.homecleanapi.dtos;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Setter
@Getter
public class ChatMessage {
    private Long conversationId;
    private Integer senderId;
	private SenderRole senderRole;
    private String content;
    private LocalTime sent_at = LocalTime.now();

	public enum SenderRole {
		CUSTOMER,
		CLEANER
	}
}
