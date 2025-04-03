package com.example.homecleanapi.PaymentForWallets;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.homecleanapi.Payment.VnpayRequest;



@Service
public class VnpayServiceWallet {

	public String createPayment(VnpayRequestWallet paymentRequest) throws UnsupportedEncodingException {
	    String vnp_Version = "2.1.0";
	    String vnp_Command = "pay";
	    String orderType = "other";
	    long amount = 0;
	    try {
	        amount = Long.parseLong(paymentRequest.getAmount()) * 100;
	    } catch (NumberFormatException e) {
	        throw new IllegalArgumentException("Số tiền không hợp lệ");
	    }

	    String bankCode = "NCB";
	    String vnp_TxnRef = VnpayConfigWallet.getRandomNumber(8);
	    String vnp_IpAddr = "127.0.0.1";
	    String vnp_TmnCode = VnpayConfigWallet.vnp_TmnCode;

	    Map<String, String> vnp_Params = new HashMap<>();
	    vnp_Params.put("vnp_Version", vnp_Version);
	    vnp_Params.put("vnp_Command", vnp_Command);
	    vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
	    vnp_Params.put("vnp_Amount", String.valueOf(amount));
	    vnp_Params.put("vnp_CurrCode", "VND");

	    vnp_Params.put("vnp_BankCode", bankCode);
	    vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
	    vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang:" + vnp_TxnRef);
	    vnp_Params.put("vnp_OrderType", orderType);
	    vnp_Params.put("vnp_Locale", "vn");
	    vnp_Params.put("vnp_ReturnUrl", VnpayConfigWallet.vnp_ReturnUrlForwallet);
	    vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

	    Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
	    SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
	    String vnp_CreateDate = formatter.format(cld.getTime());
	    vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

	    cld.add(Calendar.MINUTE, 15);
	    String vnp_ExpireDate = formatter.format(cld.getTime());
	    vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

	    List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
	    Collections.sort(fieldNames);
	    StringBuilder hashData = new StringBuilder();
	    StringBuilder query = new StringBuilder();
	    for (String fieldName : fieldNames) {
	        String fieldValue = vnp_Params.get(fieldName);
	        if ((fieldValue != null) && (fieldValue.length() > 0)) {
	            hashData.append(fieldName).append('=')
	                    .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
	            query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()))
	                    .append('=')
	                    .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
	            query.append('&');
	            hashData.append('&');
	        }
	    }

	    if (query.length() > 0)
	        query.setLength(query.length() - 1);
	    if (hashData.length() > 0)
	        hashData.setLength(hashData.length() - 1);

	    String vnp_SecureHash = VnpayConfigWallet.hmacSHA512(VnpayConfigWallet.secretKey, hashData.toString());
	    query.append("&vnp_SecureHash=").append(vnp_SecureHash);
	    return VnpayConfigWallet.vnp_PayUrl + "?" + query;
	}

}