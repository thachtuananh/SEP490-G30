package com.example.homecleanapi.vnPay;

import lombok.Data;

@Data
public class VnpayRequest {
    private String amount;

	public String getAmount() {
		return amount;
	}

	public void setAmount(String amount) {
		this.amount = amount;
	}
    
    
}