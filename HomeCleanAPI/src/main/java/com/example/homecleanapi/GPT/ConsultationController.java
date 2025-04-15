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
        File tempFile = File.createTempFile("upload-", ".pdf");
        file.transferTo(tempFile);

        // Trích nội dung văn bản từ PDF
        String content = pdfExtractorService.extractTextFromPdf(tempFile);

        // Lưu vào Qdrant
        return storeDocument("documents", UUID.randomUUID().toString(), content);
    }

    @PostMapping("/ask")
    public String askConsultation(@RequestBody String question) {
        // Tạo collection nếu chưa tồn tại
        qdrantService.createCollectionIfNotExist("documents");

        // Chuyển câu hỏi thành vector (bạn sẽ sử dụng một mô hình để thực hiện điều này)
        List<Float> queryVector = convertTextToVector(question);

        // Tìm kiếm trong Qdrant
        String rawQdrant = qdrantService.searchVector("documents", queryVector);
        if (!rawQdrant.startsWith("{")) {
            return "Không truy xuất được dữ liệu từ Qdrant: " + rawQdrant;
        }
        String qdrantResponse = qdrantService.extractTopPayloadTexts(rawQdrant, 3);


        System.out.println("Nội dung trích từ Qdrant gửi vào GPT:\n" + qdrantResponse);
        System.out.println("RAW QDRANT RESPONSE:\n" + rawQdrant);
        System.out.println("Vector truy vấn:\n" + queryVector);





        if (qdrantResponse == null || qdrantResponse.isEmpty()) {
            return "No relevant information found from the database.";
        }

        // Tạo prompt cho ChatGPT để trả lời câu hỏi
        String prompt = """
Bạn là một trợ lý AI hữu ích và thông minh. Dưới đây là các đoạn nội dung được trích xuất từ tài liệu nội bộ. Hãy sử dụng **chính xác những thông tin trong tài liệu này** để trả lời câu hỏi của người dùng một cách tự nhiên, rõ ràng, ngắn gọn.

Nếu không tìm thấy thông tin cần thiết trong tài liệu, hãy trả lời: **"Xin lỗi, tôi không tìm thấy thông tin này trong tài liệu."**

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
        // Chuyển văn bản thành vector
        qdrantService.createCollectionIfNotExist("documents");

        List<Float> vector = convertTextToVector(documentText);

        // Tạo metadata (ví dụ: thêm thông tin về tài liệu)
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("documentText", documentText);  // Lưu văn bản vào metadata

        System.out.println("Vector lưu document:\n" + vector);

        // Lưu vector vào Qdrant với metadata
        return qdrantService.storeVector(collectionName, vector, documentId, metadata);
    }

    @PostMapping("/deleteCollection")
    public String deleteCollection() {
        return qdrantService.deleteCollection("documents");
    }





}
