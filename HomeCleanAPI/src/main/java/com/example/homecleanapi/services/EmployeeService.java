package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.CleanerRegisterRequest;
import com.example.homecleanapi.dtos.CleanerUpdateProfile;
import com.example.homecleanapi.dtos.EmployeeLocationsDTO;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.models.EmployeeLocations;
import com.example.homecleanapi.repositories.EmployeeAddressRepository;
import com.example.homecleanapi.repositories.EmployeeRepository;
import com.example.homecleanapi.utils.ConvertAddressToLatLong;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;


import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private EmployeeAddressRepository employeeAddressRepository;

    private EmployeeRepository employeeRepository;

    private ConvertAddressToLatLong  convertAddressToLatLong;

    public EmployeeService(EmployeeAddressRepository employeeAddressRepository, EmployeeRepository employeeRepository, ConvertAddressToLatLong convertAddressToLatLong) {
        this.employeeAddressRepository = employeeAddressRepository;
        this.employeeRepository = employeeRepository;
        this.convertAddressToLatLong = convertAddressToLatLong;
    }

    public ResponseEntity<Map<String, Object>> employeeCreateAddress(EmployeeLocationsDTO request, @PathVariable int employeeId) throws IOException {
        Map<String, Object> response = new HashMap<>();

        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new RuntimeException("Employee not found"));

        List<EmployeeLocations> employeeLocations = employeeAddressRepository.findEmployeeLocationsByEmployee_Id(employee.getId());

        // Kiểm tra xem có địa chỉ nào có is_current = true không
        boolean hasCurrentAddress = employeeLocations.stream().anyMatch(EmployeeLocations::isIs_current);

        // Tạo địa chỉ mới
        EmployeeLocations newLocation = new EmployeeLocations();
        newLocation.setEmployee(employee);
        newLocation.setAddress(request.getAddress());
        String data = convertAddressToLatLong.convertAddressToLatLong(request.getAddress());
        JSONObject jsonObject = new JSONObject(data);

        JSONArray resultsArray = jsonObject.getJSONArray("results");
        if (!resultsArray.isEmpty()) {
            JSONObject firstResult = resultsArray.getJSONObject(0);
            JSONObject geometry = firstResult.getJSONObject("geometry");
            JSONObject location = geometry.getJSONObject("location");
            double lat = location.getDouble("lat");
            double lng = location.getDouble("lng");
            newLocation.setLatitude(lat);
            newLocation.setLongitude(lng);
        } else {
            System.out.println("Không tìm thấy kết quả trong JSON!");
        }
        // Nếu chưa có địa chỉ nào, set is_current = true, ngược lại set false
        newLocation.setIs_current(employeeLocations.isEmpty());

        employeeAddressRepository.save(newLocation);
        response.put("information", newLocation);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    public ResponseEntity<Map<String, Object>> updateEmployeeAddress(
            EmployeeLocationsDTO request,
            @PathVariable int employeeId,
            @PathVariable int addressId) throws IOException {

        Map<String, Object> response = new HashMap<>();

        // Tìm employee từ database theo ID
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Tìm địa chỉ của employee theo addressId
        EmployeeLocations existingLocation = employeeAddressRepository.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found for this employee"));

        // Kiểm tra xem địa chỉ có thuộc về employee không
        if (existingLocation.getEmployee().getId() != employeeId) {
            throw new RuntimeException("Address does not belong to the specified employee");
        }

        // Cập nhật các trường thông tin theo input từ request (JSON)
        existingLocation.setAddress(request.getAddress());

        // Chuyển đổi địa chỉ thành tọa độ lat-long
        String data = convertAddressToLatLong.convertAddressToLatLong(request.getAddress());
        JSONObject jsonObject = new JSONObject(data);
        JSONArray resultsArray = jsonObject.getJSONArray("results");

        if (!resultsArray.isEmpty()) {
            JSONObject firstResult = resultsArray.getJSONObject(0);
            JSONObject geometry = firstResult.getJSONObject("geometry");
            JSONObject location = geometry.getJSONObject("location");
            double lat = location.getDouble("lat");
            double lng = location.getDouble("lng");
            existingLocation.setLatitude(lat);
            existingLocation.setLongitude(lng);
        } else {
            System.out.println("Không tìm thấy kết quả trong JSON!");
        }

        // Đánh dấu địa chỉ này là hiện tại
        existingLocation.setIs_current(false);

        // Lưu địa chỉ đã được cập nhật
        employeeAddressRepository.save(existingLocation);

        response.put("status", "success");
        response.put("message", "Employee address successfully updated");
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    // Xóa địa chỉ của employee theo locationId
    public ResponseEntity<Map<String, Object>> deleteEmployeeAddress(int locationId) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra xem địa chỉ có tồn tại không
        EmployeeLocations existingLocation = employeeAddressRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        // Nếu địa chỉ là is_current = true, không cho phép xóa
        if (existingLocation.isIs_current()) {
            response.put("status", "error");
            response.put("message", "Cannot delete current address");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Xóa địa chỉ
        employeeAddressRepository.delete(existingLocation);

        response.put("status", "success");
        response.put("message", "Employee address successfully deleted");
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // Lấy tất cả địa chỉ của employee theo employeeId
    public ResponseEntity<Map<String, Object>> getAllEmployeeAddresses(@PathVariable int employeeId) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra xem employee có tồn tại không
        if (!employeeRepository.existsById(employeeId)) {
            response.put("message", "Employee not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        // Lấy danh sách địa chỉ của employee
        List<Map<String, Object>> addresses = employeeAddressRepository.findEmployeeLocationsByEmployee_Id(employeeId)
                .stream()
                .map(location -> {
                    Map<String, Object> addressMap = new HashMap<>();
                    addressMap.put("id", location.getId());
                    addressMap.put("address", location.getAddress());
                    addressMap.put("is_current", location.isIs_current());
                    return addressMap;
                })
                .collect(Collectors.toList());

        response.put("data", addresses);
        return ResponseEntity.ok(response);
    }

    // Lấy profile của employee employeeID
    public ResponseEntity<Map<String, Object>> getEmployeeInformation(@PathVariable int employeeId) {
        Map<String, Object> response = new HashMap<>();

        // Tìm employee theo ID
        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);

        if (employeeOpt.isEmpty()) {
            response.put("message", "Employee not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.put("data", employeeOpt.get());
        return ResponseEntity.ok(response);
    }

    // Update Employee Profile
    public ResponseEntity<Map<String, Object>> updateEmployeeInformation(CleanerUpdateProfile request, Integer employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Cập nhật thông tin employee
        employee.updateProfile(request);
        employeeRepository.save(employee);

        return ResponseEntity.ok(Collections.singletonMap("status", "Update success"));
    }

    // Delete Employee
    public ResponseEntity<Map<String, Object>> deleteEmployeeAccount(@PathVariable int employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setStatus(true);
        employeeRepository.save(employee);

        return ResponseEntity.ok(Collections.singletonMap("status", "Delete success"));
    }
}