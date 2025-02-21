package com.example.homecleanapi.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtils {
    private final String SECRET_KEY = "4b4a5e888ae16a09f0ba97fc4ed5396121292015cb53db43adc0c9f88d5a9f24"; // Đổi thành khóa bảo mật mạnh hơn

    public String generateToken(String phone, String name, String id) {
        return Jwts.builder()
                .setSubject(phone)
                .setSubject(name)
                .setSubject(id)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 ngày
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(SECRET_KEY).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // Lấy thông tin từ các claims khác trong token (name, id, phone)
    public String getClaimFromToken(String token, String claimKey) {
        Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get(claimKey, String.class);
    }
}