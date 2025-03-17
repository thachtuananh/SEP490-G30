package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.EmployeeDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FindCleanerService {

    @PersistenceContext
    private EntityManager entityManager;

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

    public List<EmployeeDTO> findNearbyEmployees(double latitude, double longitude, double radiusInMeters, int limit) {
        double[] radiusLevels = {15000, 30000, 60000}; // Các mức bán kính
        List<EmployeeDTO> employees = new ArrayList<>();

        for (double radius : radiusLevels) {
            employees = executeNearbyQuery(latitude, longitude, radius, limit);

            if (employees.size() >= limit) {
                break; // Nếu đã đủ số lượng nhân viên, dừng lại
            }
        }

        return employees; // Trả về danh sách nhân viên gần nhất
    }
}
