package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.EmployeeDTO;
import com.example.homecleanapi.dtos.JobSummaryDTO;
import com.example.homecleanapi.models.EmployeeLocations;
import com.example.homecleanapi.repositories.EmployeeAddressRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FindCleanerService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private EmployeeAddressRepository employeeAddressRepository;


    // Lấy list cleaner gần customer nhất
    private List<EmployeeDTO> executeNearbyQuery(double latitude, double longitude, double radiusInMeters, int limit) {
        String query = "SELECT c.id, c.full_name, c.email, c.experience, c.phone_number, c.profile_image, " +
                "       ca.latitude, ca.longitude, " +
                "       ST_Distance(" +
                "               ST_Transform(ST_SetSRID(ST_MakePoint(ca.longitude, ca.latitude), 4326), 3857), " +
                "               ST_Transform(ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326), 3857)" +
                "       ) AS distance_m " +
                "FROM cleaners c " +
                "JOIN cleaner_addresses ca ON c.id = ca.cleaner_id " +
                "WHERE ca.is_current = true " +
                "AND ST_DWithin(" +
                "        ca.geom, " +
                "        ST_Transform(ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326), 3857), " +
                "        :radius) " +
                "ORDER BY distance_m ASC " +
                "LIMIT :limit";

        Query nativeQuery = entityManager.createNativeQuery(query)
                .setParameter("latitude", latitude)
                .setParameter("longitude", longitude)
                .setParameter("radius", radiusInMeters)
                .setParameter("limit", limit);

        List<Object[]> results = nativeQuery.getResultList();

        List<EmployeeDTO> employees = new ArrayList<>();
        for (Object[] row : results) {
            EmployeeDTO dto = new EmployeeDTO();
            dto.setId(((Number) row[0]).longValue());  // Ép kiểu ID về Long
            dto.setFullName((String) row[1]);  // full_name
            dto.setEmail((String) row[2]);  // email
            dto.setExperience(row[3] != null ? row[3].toString() : null);  // experience (ép về String)
            dto.setPhoneNumber((String) row[4]);  // phone_number
            dto.setProfileImage((byte[]) row[5]);  // profile_image
            dto.setLatitude((Double) row[6]);  // latitude
            dto.setLongitude((Double) row[7]);  // longitude
            dto.setDistance((Double) row[8]);  // distance_m

            employees.add(dto);
        }

        return employees;
    }

    public List<EmployeeDTO> findNearbyEmployees(double latitude, double longitude, int limit) {
        double[] radiusLevels = {15000, 30000, 60000}; // Các mức bán kính
        List<EmployeeDTO> employees = new ArrayList<>();

        for (double radius : radiusLevels) {
            employees = executeNearbyQuery(latitude, longitude, radius, limit);

            if (employees.size() >= limit) {
                break;
            }
        }
        System.out.println(employees);
        return employees;
    }


    // -----------------------------------------------------------
    // phần lấy job đang open và gần nhất

    public List<JobSummaryDTO> getNearbyOpenJobs(Long cleanerId, int limit) {
        // Lấy thông tin địa chỉ của cleaner từ bảng cleaner_addresses
        EmployeeLocations cleanerAddress = employeeAddressRepository.findByEmployee_IdAndIs_currentTrue(cleanerId);
        if (cleanerAddress == null) {
            throw new RuntimeException("Cleaner address not found.");
        }

        // Lấy tọa độ của cleaner từ cleanerAddress
        double cleanerLatitude = cleanerAddress.getLatitude();
        double cleanerLongitude = cleanerAddress.getLongitude();

        // Các mức bán kính cần tìm kiếm (bạn có thể điều chỉnh bán kính này)
        double[] radiusLevels = {15000, 30000, 60000};

        // Sử dụng Map để đảm bảo không có trùng lặp jobId
        Map<Long, JobSummaryDTO> jobSummaryMap = new HashMap<>();

        // Lặp qua các mức bán kính để tìm kiếm job
        for (double radius : radiusLevels) {
            // Thực hiện truy vấn tìm các job gần cleaner
            List<Object[]> results = executeNearbyJobQuery(cleanerId, cleanerLatitude, cleanerLongitude, radius, limit);

            // Duyệt qua kết quả truy vấn
            for (Object[] row : results) {
                JobSummaryDTO dto = new JobSummaryDTO();
                dto.setJobId(((Number) row[0]).longValue());  // jobId
                dto.setServiceName((String) row[1]);  // serviceName
                dto.setPrice((Double) row[2]);  // total_price
                dto.setScheduledTime(((Timestamp) row[3]).toLocalDateTime());  // scheduled_time
                dto.setDistance((Double) row[4]);  // distance_km (khoảng cách tính bằng km)

                // Chỉ thêm job nếu chưa có trong Map (dựa trên jobId)
                jobSummaryMap.putIfAbsent(dto.getJobId(), dto);
            }

            // Nếu đã đủ số lượng job, thoát khỏi vòng lặp
            if (jobSummaryMap.size() >= limit) {
                break;
            }
        }

        // Chuyển Map thành List trước khi trả về
        return new ArrayList<>(jobSummaryMap.values());
    }





    private List<Object[]> executeNearbyJobQuery(Long cleanerId, double latitude, double longitude, double radiusInMeters, int limit) {
        String query = "SELECT j.id, " +
                "       (SELECT string_agg(s.name, ', ') FROM job_service_detail jsd " +
                "           JOIN services s ON jsd.service_id = s.id WHERE jsd.job_id = j.id) AS service_name, " +
                "       j.total_price, j.scheduled_time, " +
                "       ST_Distance(" +
                "               ST_Transform(ca.geom, 3857), " +
                "               ST_Transform(ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326), 3857)" +
                "       ) / 1000 AS distance_km " +
                "FROM jobs j " +
                "JOIN customer_addresses ca ON j.customer_address_id = ca.id " +
                "WHERE j.status = 'OPEN' " +
                "AND ST_DWithin(" +
                "        ca.geom, " +
                "        ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326), " +
                "        :radius) " +
                "AND j.id NOT IN (" +
                "    SELECT job_id FROM job_application WHERE cleaner_id = :cleanerId" +
                ") " +
                "ORDER BY distance_km ASC " +
                "LIMIT :limit";


        // Cập nhật cách gọi tham số
        Query nativeQuery = entityManager.createNativeQuery(query)
                .setParameter("latitude", latitude)
                .setParameter("longitude", longitude)
                .setParameter("radius", radiusInMeters)
                .setParameter("limit", limit)
                .setParameter("cleanerId", cleanerId);

        return nativeQuery.getResultList();
    }











}
