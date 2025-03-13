
package com.example.homecleanapi.services;

import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Random;

@Service
public class AvatarService {
    public byte[] generateIdenticon(String username) {
        try {
            // 1. Tạo Hash từ Username (MD5)
            byte[] hashBytes = MessageDigest.getInstance("MD5").digest(username.getBytes());
            Random random = new Random(new String(hashBytes).hashCode()); // Sử dụng hash làm seed cho Random

            // 2. Cấu hình Avatar
            int size = 128;           // Kích thước avatar (pixel)
            int gridSize = 5;        // Kích thước lưới (5x5)
            int cellSize = size / gridSize; // Kích thước mỗi ô vuông
            BufferedImage image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
            Graphics2D graphics = image.createGraphics();

            // 3. Bảng màu (có thể tùy chỉnh)
            Color[] colors = {
                    new Color(40, 39, 40),   // Màu xám đậm
                    new Color(39, 120, 240),  // Màu xanh dương
                    new Color(255, 102, 0),   // Màu cam
                    new Color(60, 179, 113),  // Màu xanh lá cây
                    new Color(255, 215, 0)    // Màu vàng
            };
            Color backgroundColor = new Color(240, 240, 240); // Màu nền nhạt
            graphics.setBackground(backgroundColor);
            graphics.clearRect(0, 0, size, size); // Vẽ nền

            // 4. Chọn màu chính dựa trên hash
            Color mainColor = colors[random.nextInt(colors.length)];

            // 5. Vẽ các ô vuông
            for (int x = 0; x < gridSize; x++) {
                for (int y = 0; y < gridSize; y++) {
                    if (random.nextBoolean()) { // Quyết định ô vuông có được tô màu hay không (dựa trên random và hash)
                        graphics.setColor(mainColor);
                        graphics.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                        // Tạo đối xứng ngang
                        int mirroredX = gridSize - 1 - x;
                        if (mirroredX != x) { // Tránh vẽ chồng lên ở cột giữa nếu lưới lẻ
                            graphics.fillRect(mirroredX * cellSize, y * cellSize, cellSize, cellSize);
                        }
                    }
                }
            }

            graphics.dispose();

            // 6. Chuyển BufferedImage thành byte array (PNG format)
            ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
            ImageIO.write(image, "png", byteArrayOutputStream);
            return byteArrayOutputStream.toByteArray();

        } catch (NoSuchAlgorithmException | IOException e) {
            e.printStackTrace(); // Xử lý exception (ghi log, thông báo lỗi, ...)
            return null;       // Hoặc throw exception tùy vào logic ứng dụng của bạn
        }
    }
}


