package com.example.homecleanapi.Gemini;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            String url = GEMINI_API_URL + "?key=" + apiKey;
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            // In ra toàn bộ JSON để theo dõi
            String jsonBody = response.getBody();

            // Parse chuỗi JSON để lấy phần text
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(jsonBody);

            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            String text = textNode.isMissingNode() ? "Không có phản hồi từ Gemini." : textNode.asText();

            // Trả về cả JSON gốc và phần text trích ra (nếu muốn)
            return "{ \"text\": \"" + text + "\", \"raw\": " + jsonBody + " }";

        } catch (Exception e) {
            return "{\"error\": \"Gemini API lỗi: " + e.getMessage() + "\"}";
        }
    }
}
