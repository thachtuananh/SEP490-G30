package com.example.homecleanapi.models;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "cleaner_feedback")
public class CleanerFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "job_id", referencedColumnName = "id", nullable = false)
    private Job job;  // Liên kết với bảng job

    @ManyToOne
    @JoinColumn(name = "cleaner_id", referencedColumnName = "id", nullable = false)
    private Employee cleaner;  // Liên kết với bảng employee (cleaner)

    @Column(name = "rating")
    private Double rating;  // Đánh giá của cleaner (1-5)

    @Column(name = "comment")
    private String comment;  // Phản hồi của cleaner

    @Column(name = "created_at")
    @UpdateTimestamp
    private LocalDateTime createdAt; // Thời gian tạo feedback

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;  // Thời gian cập nhật feedback

    // Getter and Setter methods

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public Employee getCleaner() {
        return cleaner;
    }

    public void setCleaner(Employee cleaner) {
        this.cleaner = cleaner;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Optional: Method to update 'updatedAt' on update
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
