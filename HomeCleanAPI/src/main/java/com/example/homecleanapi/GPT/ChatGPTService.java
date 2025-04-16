package com.example.homecleanapi.GPT;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class ChatGPTService {

    @Value("${openai.api.key}")
    private String apiKey;

    private final String API_URL = "https://api.openai.com/v1/chat/completions";  // Cập nhật API endpoint mới cho chat

    private final RestTemplate restTemplate = new RestTemplate();

    // Gọi API ChatGPT
    public String askChatGPT(String prompt) {
        // Định dạng prompt mới để tương thích với API chat
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.put("messages", Arrays.asList(
                new HashMap<String, String>() {{
                    put("role", "user");
                    put("content", prompt);
                }}
        ));
        requestBody.put("max_tokens", 500);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(API_URL, HttpMethod.POST, entity, String.class);

        return response.getBody();
    }

    public List<Float> getEmbedding(String text) {
        String url = "https://api.openai.com/v1/embeddings";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "text-embedding-3-small");
        requestBody.put("input", text);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            List<Double> embedding = (List<Double>) ((Map) ((List) response.getBody().get("data")).get(0)).get("embedding");
            return embedding.stream().map(Double::floatValue).toList(); // Chuyển về float
        } catch (Exception e) {
            throw new RuntimeException("Embedding failed: " + e.getMessage());
        }
    }

}

