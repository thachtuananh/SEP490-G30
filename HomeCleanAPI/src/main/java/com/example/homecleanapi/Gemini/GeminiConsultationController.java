package com.example.homecleanapi.Gemini;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.*;

@RestController
@Tag(name = "GEMINI")
@RequestMapping("/consultation")
public class GeminiConsultationController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private PdfExtractorService pdfExtractorService;

    private final Map<String, String> uploadedDocs = new HashMap<>();

    @PostMapping(value = "/uploadDocument", consumes = "multipart/form-data")
    public String uploadDocument(@RequestPart("file") MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            return "Lỗi: Vui lòng tải lên file PDF.";
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.toLowerCase().endsWith(".pdf")) {
            return "Lỗi: File tải lên không phải là file PDF.";
        }

        File tempFile = File.createTempFile("upload-", ".pdf");
        file.transferTo(tempFile);

        String content = pdfExtractorService.extractTextFromPdf(tempFile);

        uploadedDocs.put(fileName, content);

        return "Tải lên file PDF thành công!";
    }

    @PostMapping("/ask")
    public String askConsultation(@RequestBody Map<String, String> request) {
        String question = request.get("question");

        if (uploadedDocs.isEmpty()) {
            return "Hiện tại chưa có tài liệu nào được tải lên để tham khảo.";
        }

        // Gộp toàn bộ nội dung các file PDF đã upload
        StringBuilder allContent = new StringBuilder();
        for (Map.Entry<String, String> entry : uploadedDocs.entrySet()) {
            allContent.append("📄 File: ").append(entry.getKey()).append("\n");
            allContent.append(entry.getValue()).append("\n\n");
        }

        String prompt = String.format("""
Bạn là một trợ lý AI hữu ích và thông minh. Dưới đây là các đoạn nội dung về hệ thống houseclean. Hãy sử dụng **chính xác những thông tin trong tài liệu này** để trả lời câu hỏi của người dùng một cách tự nhiên, rõ ràng, ngắn gọn, giống như nhân viên tư vấn.

Nếu không tìm thấy thông tin cần thiết trong tài liệu, hãy trả lời: **"Xin lỗi, vấn đề này nằm ngoài phạm vi của tôi. Hãy liên hệ với admin để biết thêm thông tin chi tiết."**

---

📄 Nội dung tài liệu:
%s

Câu hỏi: %s
""", allContent, question);

        return geminiService.askGemini(prompt);
    }



    @PostMapping("/deleteCollection")
    public String clearCache() {
        uploadedDocs.clear();
        return "Đã xóa tất cả tài liệu đã tải lên.";
    }
}
