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
        Map<String, Object> message = Map.of(
                "parts", List.of(Map.of("text", prompt)),
                "role", "user"
        );
        Map<String, Object> body = Map.of("contents", List.of(message));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            String url = GEMINI_API_URL + "?key=" + apiKey;
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            String responseBody = response.getBody();

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(responseBody);

            // Trích xuất nội dung văn bản từ phần "candidates[0].content.parts[0].text"
            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            if (textNode.isMissingNode()) {
                return "Không có phản hồi từ chatbot.";
            }

            return textNode.asText();

        } catch (Exception e) {
            return "Chatbot API lỗi: " + e.getMessage();
        }
    }


}