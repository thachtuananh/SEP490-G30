package com.example.homecleanapi.dtos;

import lombok.Data;

@Data
public class VnpayRequestWallet {
    private String amount;

	public String getAmount() {
		return amount;
	}

	public void setAmount(String amount) {
		this.amount = amount;
	}
    
    
}