package com.example.homecleanapi.repositories;


import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import com.example.homecleanapi.models.CustomerAddresses;
import com.example.homecleanapi.models.Job;
import io.lettuce.core.dynamic.annotation.Param;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.example.homecleanapi.enums.JobStatus;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    // Lấy tất cả các job có trạng thái "Open"
    List<Job> findByStatus(JobStatus status);
    
    Optional<Job> findById(Long jobId);
   
    List<Job> findByCleanerIdAndScheduledTimeBetween(Long cleanerId, LocalDateTime startTime, LocalDateTime endTime);
    
    List<Job> findByCleanerId(Long cleanerId);
    
    List<Job> findByCustomerId(Long customerId);

    public List<Job> findByScheduledTimeAndCustomerAddress(LocalDateTime scheduledTime, CustomerAddresses customerAddress);
    
    List<Job> findByCleanerIdAndStatus(Long cleanerId, JobStatus status);


    List<Job> findByCleanerIdAndStatusIn(Long cleanerId, List<String> statuses);
    
    Optional<Job> findByTxnRef(String txnRef);

    @Query("SELECT EXTRACT(YEAR FROM j.updatedAt) AS year, " +
            "EXTRACT(MONTH FROM j.updatedAt) AS month, " +
            "SUM(j.totalPrice * 0.15) AS revenue " +  // Tính 15% của tổng giá trị cho mỗi công việc
            "FROM Job j WHERE j.status = 'DONE' " +
            "GROUP BY EXTRACT(YEAR FROM j.updatedAt), EXTRACT(MONTH FROM j.updatedAt)")
    List<Object[]> findRevenueByYearAndMonthNative();



    List<Job> getJobsByStatus(JobStatus status);
    List<Job> findAllByStatus(JobStatus status);

    public List<Job> findByCleanerIdAndBookingTypeAndStatusIn(Long cleanerId, String bookingType, List<JobStatus> statuses);

    @Query("""
    SELECT 
        CASE 
            WHEN j.status = 'DONE' THEN 'DONE'
            WHEN j.status IN ('OPEN', 'BOOKED') THEN 'OPEN'
            WHEN j.status IN ('CANCELLED', 'AUTO_CANCELLED') THEN 'CANCELLED'
            WHEN j.status = 'IN_PROGRESS' THEN 'IN_PROGRESS'
        END AS groupStatus,
        COUNT(j) AS count
    FROM Job j
    WHERE j.status IN ('DONE', 'OPEN', 'BOOKED', 'CANCELLED', 'AUTO_CANCELLED', 'IN_PROGRESS')
    GROUP BY 
        CASE 
            WHEN j.status = 'DONE' THEN 'DONE'
            WHEN j.status IN ('OPEN', 'BOOKED') THEN 'OPEN'
            WHEN j.status IN ('CANCELLED', 'AUTO_CANCELLED') THEN 'CANCELLED'
            WHEN j.status = 'IN_PROGRESS' THEN 'IN_PROGRESS'
        END
    """)
    List<JobGroupedStatusCount> countJobByStatus();


    List<Job> findAllByStatusIn(List<JobStatus> statuses);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT j FROM Job j WHERE j.id = :id")
    Optional<Job> findByIdWithLock(@Param("id") Long id);

    List<Job> findByJobGroupCode(String jobGroupCode);

    List<Job> findAllByTxnRef(String txnRef);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT j FROM Job j WHERE j.cleaner.id = :cleanerId " +
            "AND j.scheduledTime BETWEEN :start AND :end " +
            "AND j.status NOT IN :excludedStatuses " +
            "AND j.id <> :excludeJobId")
    List<Job> findByCleanerIdAndScheduledTimeBetweenAndStatusNotInAndIdNot(
            @Param("cleanerId") Long cleanerId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("excludedStatuses") List<JobStatus> excludedStatuses,
            @Param("excludeJobId") Long excludeJobId
    );

    @Query("SELECT j FROM Job j WHERE j.cleaner.id = :cleanerId " +
            "AND j.scheduledTime BETWEEN :startTime AND :endTime " +
            "AND j.id <> :jobId")
    List<Job> findByCleanerIdAndScheduledTimeBetweenAndIdNot(
            @Param("cleanerId") Long cleanerId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("jobId") Long jobId
    );




}

