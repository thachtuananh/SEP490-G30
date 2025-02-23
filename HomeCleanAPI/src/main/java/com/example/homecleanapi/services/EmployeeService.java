package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.EmployeeLocationsDTO;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.models.EmployeeLocations;
import com.example.homecleanapi.repositories.EmployeeAddressRepository;
import com.example.homecleanapi.repositories.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    private EmployeeAddressRepository employeeAddressRepository;

    private EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeAddressRepository employeeAddressRepository, EmployeeRepository employeeRepository) {
        this.employeeAddressRepository = employeeAddressRepository;
        this.employeeRepository = employeeRepository;
    }

    public ResponseEntity<Map<String, Object>> employeeCreateAddress(EmployeeLocationsDTO request, @PathVariable int employeeId) {
        Map<String, Object> response = new HashMap<>();

        Employee employee = employeeRepository.findById(employeeId).orElseThrow(() -> new RuntimeException("Employee not found"));

        List<EmployeeLocations> employeeLocations = employeeAddressRepository.findEmployeeLocationsByEmployee_Id(employee.getId());

        // Kiểm tra xem có địa chỉ nào có is_current = true không
        boolean hasCurrentAddress = employeeLocations.stream().anyMatch(EmployeeLocations::isIs_current);

        // Tạo địa chỉ mới
        EmployeeLocations newLocation = new EmployeeLocations();
        newLocation.setEmployee(employee);
        newLocation.setAddress(request.getAddress());
        newLocation.setLatitude(request.getLatitude());
        newLocation.setLongitude(request.getLongitude());

        // Nếu chưa có địa chỉ nào, set is_current = true, ngược lại set false
        newLocation.setIs_current(employeeLocations.isEmpty());

        employeeAddressRepository.save(newLocation);

        response.put("information", newLocation);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    public ResponseEntity<Map<String, Object>> updateEmployeeAddress(EmployeeLocationsDTO request, @PathVariable int employeeId) {
        Map<String, Object> response = new HashMap<>();

        // Tìm employee từ database theo ID
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Tìm địa chỉ hiện tại của employee
        List<EmployeeLocations> employeeLocations = employeeAddressRepository.findEmployeeLocationsByEmployee_Id(employee.getId());

        // Nếu không có địa chỉ nào, trả về thông báo lỗi
        if (employeeLocations.isEmpty()) {
            throw new RuntimeException("No existing address found for this employee");
        }

        // Tìm địa chỉ đầu tiên của employee (giả sử chỉ có một địa chỉ hiện tại)
        EmployeeLocations existingLocation = employeeLocations.get(0);

        // Cập nhật các trường thông tin theo input từ request (JSON)
        existingLocation.setAddress(request.getAddress());
        existingLocation.setLatitude(request.getLatitude());
        existingLocation.setLongitude(request.getLongitude());
        existingLocation.setIs_current(false); // Đánh dấu địa chỉ này là hiện tại

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
//    public ResponseEntity<Map<String, Object>> updateEmployeeInfomation(@RequestBody ) {
//        Map<String, Object> response = new HashMap<>();
//
//
//        return ResponseEntity.status(HttpStatus.OK).body(response);
//    }
}
