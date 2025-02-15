package com.example.homecleanapi.models;

import jakarta.persistence.*;

@Entity
@Table(name = "cleaner_rewards")
public class CleanerReward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cleaner_id", nullable = false)
    private Cleaner cleaner; // Liên kết với bảng cleaner

    private Integer jobsCompleted;
    private Double rewardAmount;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Cleaner getCleaner() {
        return cleaner;
    }

    public void setCleaner(Cleaner cleaner) {
        this.cleaner = cleaner;
    }

    public Integer getJobsCompleted() {
        return jobsCompleted;
    }

    public void setJobsCompleted(Integer jobsCompleted) {
        this.jobsCompleted = jobsCompleted;
    }

    public Double getRewardAmount() {
        return rewardAmount;
    }

    public void setRewardAmount(Double rewardAmount) {
        this.rewardAmount = rewardAmount;
    }
}
