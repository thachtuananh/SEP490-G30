package com.example.homecleanapi.models;


import jakarta.persistence.*;
import org.hibernate.annotations.Type;
import org.springframework.core.io.ClassPathResource;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Entity
@Table(name="cleaners")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "password_hash")
    private String password;
    @Column(name = "full_name")
    private String name;
    @Column(name = "phone_number")
    private String phone;
    private String email;
    private Integer age;
    private String address;
    private String identity_number;
    @Column(name = "identity_verified")
    private Boolean is_verified;
    private String experience;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;
    @Column(name = "profile_image", columnDefinition = "BYTEA")
    private byte[] profile_image;


    @PrePersist
    protected void onCreate() {
        this.is_verified = Boolean.FALSE;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
        byte[] image = getRandomProfileImage();

        if (image == null || image.length == 0) {
            System.out.println("Không có ảnh, gán null cho profile_image");
            this.profile_image = null;
        } else {
            System.out.println("Lưu ảnh có kích thước: " + image.length + " bytes");
            this.profile_image = image;
        }
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public byte[] getProfile_image() {
        return profile_image;
    }

    public void setProfile_image(byte[] profile_image) {
        this.profile_image = profile_image;
    }

    public String getIdentity_number() {
        return identity_number;
    }

    public void setIdentity_number(String identity_number) {
        this.identity_number = identity_number;
    }

    public Boolean getIs_verified() {
        return is_verified;
    }

    public void setIs_verified(Boolean is_verified) {
        this.is_verified = is_verified;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public LocalDateTime getCreated_at() {
        return created_at;
    }

    public void setCreated_at(LocalDateTime created_at) {
        this.created_at = created_at;
    }

    public LocalDateTime getUpdated_at() {
        return updated_at;
    }

    public void setUpdated_at(LocalDateTime updated_at) {
        this.updated_at = updated_at;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Employee() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    private byte[] getRandomProfileImage() {
        try {
            Path folder = Paths.get("src/main/resources/static/images/profiles");
            List<Path> imagePaths = Files.list(folder)
                    .filter(Files::isRegularFile)
                    .collect(Collectors.toList());

            if (imagePaths.isEmpty()) {
                return null;
            }

            Path randomImagePath = imagePaths.get(new Random().nextInt(imagePaths.size()));
            return Files.readAllBytes(randomImagePath);

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
