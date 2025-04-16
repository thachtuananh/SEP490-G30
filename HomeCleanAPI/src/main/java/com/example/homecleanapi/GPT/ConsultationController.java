package com.example.homecleanapi.GPT;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;

@RestController
@RequestMapping("/consultation")
public class ConsultationController {

    @Autowired
    private QdrantService qdrantService;

    @Autowired
    private ChatGPTService chatGPTService;

    @Autowired
    private PdfExtractorService pdfExtractorService;

    @PostMapping("/uploadDocument")
    public String uploadDocument(@RequestParam("file") MultipartFile file) throws IOException {
        // Kiểm tra MIME type của file
        String contentType = file.getContentType();
        if (!contentType.equals("application/pdf")) {
            return "Lỗi: Vui lòng tải lên file PDF.";
        }

        // Kiểm tra phần mở rộng của file (optional)
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.toLowerCase().endsWith(".pdf")) {
            return "Lỗi: File tải lên không phải là file PDF.";
        }

        File tempFile = File.createTempFile("upload-", ".pdf");
        file.transferTo(tempFile);

        String content = pdfExtractorService.extractTextFromPdf(tempFile);

        storeDocument("documents", UUID.randomUUID().toString(), content);

        return "Tải lên file PDF thành công!";
    }


    @PostMapping("/ask")
    public String askConsultation(@RequestBody String question) {
        qdrantService.createCollectionIfNotExist("documents");

        List<Float> queryVector = convertTextToVector(question);

        String rawQdrant = qdrantService.searchVector("documents", queryVector);
        if (!rawQdrant.startsWith("{")) {
            return "Không truy xuất được dữ liệu từ Qdrant: " + rawQdrant;
        }
        String qdrantResponse = qdrantService.extractTopPayloadTexts(rawQdrant, 3);






        if (qdrantResponse == null || qdrantResponse.isEmpty()) {
            return "No relevant information found from the database.";
        }

        String prompt = """
Bạn là một trợ lý AI hữu ích và thông minh. Dưới đây là các đoạn nội dung về hệ thống houseclean. Hãy sử dụng **chính xác những thông tin trong tài liệu này** để trả lời câu hỏi của người dùng một cách tự nhiên, rõ ràng, ngắn gọn, giống như nhân viên tư vấn.

Nếu không tìm thấy thông tin cần thiết trong tài liệu, hãy trả lời: **"Xin lỗi, vấn đề này nằm ngoài phạm vi của tôi. Hãy liên hệ với admin để biết thêm thông tin chi tiết."**

---

📄 Nội dung tài liệu:
%s

Câu hỏi: %s
""".formatted(qdrantResponse, question);

        return chatGPTService.askChatGPT(prompt);
    }


    public List<Float> convertTextToVector(String text) {
        String prompt = "Convert the following text to a vector: " + text;
        String response = chatGPTService.askChatGPT(prompt);
        return chatGPTService.getEmbedding(text);

    }


    public String storeDocument(String collectionName, String documentId, String documentText) {
        qdrantService.createCollectionIfNotExist("documents");

        List<Float> vector = convertTextToVector(documentText);

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("documentText", documentText);

        System.out.println("Vector lưu document:\n" + vector);

        // Lưu vector vào Qdrant với metadata
        return qdrantService.storeVector(collectionName, vector, documentId, metadata);
    }

    @PostMapping("/deleteCollection")
    public String deleteCollection() {
        // Xóa collection "documents" trong Qdrant
        String response = qdrantService.deleteCollection("documents");
        if (response.contains("ok")) {
            return "Xóa collection 'documents' thành công!";
        } else {
            return "Lỗi khi xóa collection: " + response;
        }
    }






}
