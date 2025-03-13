package com.example.homecleanapi.utils;

import io.jsonwebtoken.*;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtils {
    private final String SECRET_KEY = "4b4a5e888ae16a09f0ba97fc4ed5396121292015cb53db43adc0c9f88d5a9f24"; // Đổi thành khóa bảo mật mạnh hơn

    public String generateToken(String phone, String name, String id, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("phone", phone);
        claims.put("name", name);
        claims.put("id", id);
        claims.put("role", role);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 ngày
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }



    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(SECRET_KEY).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("Token đã hết hạn: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.out.println("Token không được hỗ trợ: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.out.println("Token không hợp lệ: " + e.getMessage());
        } catch (SignatureException e) {
            System.out.println("Token có chữ ký không đúng: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.out.println("Token rỗng hoặc null: " + e.getMessage());
        }
        return false;
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