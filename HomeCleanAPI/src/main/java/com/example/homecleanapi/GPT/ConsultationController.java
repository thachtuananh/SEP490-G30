package com.example.homecleanapi.GPT;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/consultation")
public class ConsultationController {

    @Autowired
    private QdrantService qdrantService;

    @Autowired
    private ChatGPTService chatGPTService;

    @PostMapping("/ask")
    public String askConsultation(@RequestBody String question) {
        // Tạo collection nếu chưa tồn tại
        qdrantService.createCollectionIfNotExist("documents");

        // Chuyển câu hỏi thành vector (bạn sẽ sử dụng một mô hình để thực hiện điều này)
        List<Float> queryVector = convertTextToVector(question);

        // Tìm kiếm trong Qdrant
        String qdrantResponse = qdrantService.searchVector("documents", queryVector);

        if (qdrantResponse == null || qdrantResponse.isEmpty()) {
            return "No relevant information found from the database.";
        }

        // Tạo prompt cho ChatGPT để trả lời câu hỏi
        String prompt = "Tư vấn: " + qdrantResponse + "\nCâu hỏi: " + question;
        return chatGPTService.askChatGPT(prompt);
    }


    public List<Float> convertTextToVector(String text) {
        String prompt = "Convert the following text to a vector: " + text;
        String response = chatGPTService.askChatGPT(prompt);
        return Arrays.asList(0.1f, 0.2f, 0.3f);
    }


    public String storeDocument(String collectionName, String documentId, String documentText) {
        // Chuyển văn bản thành vector
        List<Float> vector = convertTextToVector(documentText);

        // Tạo metadata (ví dụ: thêm thông tin về tài liệu)
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("documentText", documentText);  // Lưu văn bản vào metadata

        // Lưu vector vào Qdrant với metadata
        return qdrantService.storeVector(collectionName, vector, documentId, metadata);
    }




}

