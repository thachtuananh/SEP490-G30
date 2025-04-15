package com.example.homecleanapi.GPT;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class QdrantService {

    @Value("${qdrant.url}")
    private String qdrantUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    // Tạo collection nếu chưa tồn tại
    public String createCollection(String collectionName) {
        String url = qdrantUrl + "/collections";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("name", collectionName);
        requestBody.put("vector_size", 768);
        requestBody.put("distance", "Cosine");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        return response.getBody();
    }

    // Lưu trữ vector vào Qdrant
    public String storeVector(String collectionName, List<Float> vector, String documentId, Map<String, Object> metadata) {
        String url = qdrantUrl + "/collections/" + collectionName + "/points";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("vector", vector);
        requestBody.put("id", documentId);
        requestBody.put("payload", metadata);  // Thêm thông tin metadata vào payload

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
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
        requestBody.put("top", 5);  // Lấy 5 kết quả tương đồng nhất

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
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, null, String.class);
            if (response.getStatusCode() == HttpStatus.NOT_FOUND) {
                // Nếu collection chưa tồn tại, tạo mới
                return createCollection(collectionName);
            }
        } catch (Exception e) {
            // Xử lý lỗi nếu cần thiết
        }
        return "Collection already exists.";
    }

}


