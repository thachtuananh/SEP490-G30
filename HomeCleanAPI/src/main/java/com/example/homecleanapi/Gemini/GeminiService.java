package com.example.homecleanapi.Gemini;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
            String responseBody = response.getBody();

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root;

            try {
                root = mapper.readTree(responseBody);
            } catch (Exception e) {
                // Nếu không parse được JSON, trả về dưới dạng text thuần
                ObjectNode fallback = mapper.createObjectNode();
                fallback.put("text", responseBody);
                fallback.put("raw", "Không phải JSON hợp lệ");
                return mapper.writeValueAsString(fallback);
            }

            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            String text = textNode.isMissingNode() ? "Không có phản hồi từ Gemini." : textNode.asText();

            ObjectNode result = mapper.createObjectNode();
            result.put("text", text);
            result.set("raw", root);
            return mapper.writeValueAsString(result);

        } catch (Exception e) {
            return "{\"error\": \"Gemini API lỗi: " + e.getMessage() + "\"}";
        }
    }

}
