package com.example.homecleanapi.GPT;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-001:generateContent";



    private final RestTemplate restTemplate = new RestTemplate();

    public String askGemini(String prompt) {
        Map<String, Object> message = Map.of("parts", List.of(Map.of("text", prompt)), "role", "user");
        Map<String, Object> body = Map.of("contents", List.of(message));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // ❌ KHÔNG sử dụng setBearerAuth nữa

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            String url = GEMINI_API_URL + "?key=" + apiKey;
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            if (candidates == null || candidates.isEmpty()) return "Không có phản hồi từ Gemini.";

            Map<String, Object> first = candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) first.get("content");
            List<Map<String, String>> parts = (List<Map<String, String>>) content.get("parts");
            return parts.get(0).get("text");

        } catch (Exception e) {
            return "Gemini API lỗi: " + e.getMessage();
        }
    }
}
