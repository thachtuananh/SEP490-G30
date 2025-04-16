package com.example.homecleanapi.GPT;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class QdrantService {

    @Value("${qdrant.url}")
    private String qdrantUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // Tạo collection nếu chưa tồn tại
    public String createCollection(String collectionName) {
        String url = qdrantUrl + "/collections/" + collectionName;

        Map<String, Object> vectorsConfig = new HashMap<>();
        vectorsConfig.put("size", 1536); // đúng với OpenAI Embedding
        vectorsConfig.put("distance", "Cosine");


        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("vectors", vectorsConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
        return response.getBody();
    }


    // Lưu trữ vector vào Qdrant
    public String storeVector(String collectionName, List<Float> vector, String documentId, Map<String, Object> metadata) {

        String url = qdrantUrl + "/collections/" + collectionName + "/points";

        // Tạo point đúng định dạng
        Map<String, Object> point = new HashMap<>();
        point.put("id", documentId);
        point.put("vector", vector);
        point.put("payload", metadata);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("points", Collections.singletonList(point));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.PUT, entity, String.class);
            return response.getBody();
        } catch (Exception e) {
            return "Exception occurred: " + e.getMessage();
        }
    }



    // Tìm kiếm vector tương đồng trong Qdrant
    public String searchVector(String collectionName, List<Float> queryVector) {
        String url = qdrantUrl + "/collections/" + collectionName + "/points/search";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("vector", queryVector);
        requestBody.put("top", 5);
        requestBody.put("with_payload", true);


        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return response.getBody();
            } else {
                return "Error: " + response.getStatusCode() + " - " + response.getBody();
            }
        } catch (Exception e) {
            return "Exception occurred: " + e.getMessage();
        }
    }

    // Thêm phương thức tạo collection trong QdrantService
    public String createCollectionIfNotExist(String collectionName) {
        String url = qdrantUrl + "/collections/" + collectionName;

        try {
            restTemplate.exchange(url, HttpMethod.GET, null, String.class);
            return "Collection already exists.";
        } catch (HttpClientErrorException.NotFound e) {
            return createCollection(collectionName);
        } catch (Exception e) {
            return "Error checking collection existence: " + e.getMessage();
        }
    }

    public String extractTopPayloadTexts(String qdrantRawResponse, int topN) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(qdrantRawResponse);
            JsonNode resultArray = root.path("result");

            StringBuilder sb = new StringBuilder();
            int count = 0;

            for (JsonNode item : resultArray) {
                if (count++ >= topN) break;
                String content = item.path("payload").path("documentText").asText();
                sb.append("- ").append(content).append("\n\n");
            }

            return sb.toString();
        } catch (Exception e) {
            return "Lỗi khi trích nội dung từ kết quả Qdrant: " + e.getMessage();
        }
    }

    // Xóa collection (nếu muốn khởi tạo lại collection với vector size khác)
    public String deleteCollection(String collectionName) {
        String url = qdrantUrl + "/collections/" + collectionName;
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.DELETE, null, String.class);
        return response.getBody();
    }




}

