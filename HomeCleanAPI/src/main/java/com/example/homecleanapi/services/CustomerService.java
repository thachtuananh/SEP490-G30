package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.CustomerAddressesDTO;
import com.example.homecleanapi.dtos.CustomerProfileRequest;
import com.example.homecleanapi.dtos.EmployeeLocationsDTO;
import com.example.homecleanapi.models.CustomerAddresses;
import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.models.EmployeeLocations;
import com.example.homecleanapi.repositories.CustomerAddressRepository;
import com.example.homecleanapi.repositories.CustomerRepository;

import com.example.homecleanapi.utils.ConvertAddressToLatLong;
import org.hibernate.jdbc.Expectation;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final ConvertAddressToLatLong convertAddressToLatLong;
    private final CustomerAuthService customerAuthService;
    private CustomerRepository customerRepository;
    private CustomerAddressRepository customerAddressRepository;

    public CustomerService(CustomerRepository customerRepository, CustomerAddressRepository customerAddressRepository, ConvertAddressToLatLong convertAddressToLatLong, CustomerAuthService customerAuthService) {
        this.customerRepository = customerRepository;
        this.customerAddressRepository = customerAddressRepository;
        this.convertAddressToLatLong = convertAddressToLatLong;
        this.customerAuthService = customerAuthService;
    }

    // Xem thông tin profile của khách hàng
    public ResponseEntity<Map<String, Object>> getProfile(Long customer_id) {
        Map<String, Object> response = new HashMap<>();

        Customers customer = customerRepository.findById(customer_id).orElseThrow(() -> new RuntimeException("Customer not found"));
        if (customer == null) {
            response.put("message", "Khách hàng không tồn tại!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        response.put("phone", customer.getPhone());
        response.put("name", customer.getFull_name());
        response.put("created_at", customer.getCreated_at());
        return ResponseEntity.ok(response);
    }

    // Cập nhật thông tin profile của khách hàng
    public ResponseEntity<Map<String, Object>> updateProfile(Long customer_id, CustomerProfileRequest request) {
        Map<String, Object> response = new HashMap<>();

        
        if (request.getFullName() == null || request.getFullName().isEmpty()) {
            response.put("message", "Tên đầy đủ không được để trống!");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }


        Customers customer = customerRepository.findById(customer_id).orElseThrow(() -> new RuntimeException("Customer not found"));
        if (customer == null) {
            response.put("message", "Khách hàng không tồn tại!");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        
        customer.setFull_name(request.getFullName());

        customerRepository.save(customer);  

        response.put("message", "Cập nhật thông tin profile thành công!");
        response.put("phone", customer.getPhone());
        response.put("name", customer.getFull_name());
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<Map<String, Object>> addAddress(CustomerAddressesDTO request, @PathVariable Long customer_id) throws IOException {
        Map<String, Object> response = new HashMap<>();

        Customers customer = customerRepository.findById(customer_id).orElseThrow(() -> new RuntimeException("Customer not found"));
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        List<CustomerAddresses> customerAddresses = customerAddressRepository.findCustomerAddressesByCustomer_Id(customer.getId());

        // Kiểm tra xem có địa chỉ nào có is_current = true không
        boolean hasCurrentAddress = customerAddresses.stream().anyMatch(CustomerAddresses::isIs_current);

        // Tạo địa chỉ mới
        CustomerAddresses newAddress = new CustomerAddresses();
        newAddress.setCustomer(customer);
        newAddress.setAddress(request.getAddress());
        String data = convertAddressToLatLong.convertAddressToLatLong(request.getAddress());
        JSONObject jsonObject = new JSONObject(data);

        JSONArray resultsArray = jsonObject.getJSONArray("results");
        if (!resultsArray.isEmpty()) {
            JSONObject firstResult = resultsArray.getJSONObject(0);
            JSONObject geometry = firstResult.getJSONObject("geometry");
            JSONObject location = geometry.getJSONObject("location");
            double lat = location.getDouble("lat");
            double lng = location.getDouble("lng");
            newAddress.setLatitude(lat);
            newAddress.setLongitude(lng);
        } else {
            System.out.println("Không tìm thấy kết quả trong JSON!");
        }

        // Nếu chưa có địa chỉ nào, set is_current = true, ngược lại set false
        newAddress.setIs_current(customerAddresses.isEmpty());

        customerAddressRepository.save(newAddress);
        response.put("information", newAddress);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    public ResponseEntity<Map<String, Object>> updateCustomerAddress(CustomerAddressesDTO request, @PathVariable Long customerId) throws IOException {
        Map<String, Object> response = new HashMap<>();

        // Tìm employee từ database theo ID
        Customers customers = customerRepository.findById(customerId).orElseThrow(() -> new RuntimeException("Customer not found"));
//                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Tìm địa chỉ hiện tại của employee
        List<CustomerAddresses> customerAddresses = customerAddressRepository.findCustomerAddressesByCustomer_Id(customers.getId());

        // Nếu không có địa chỉ nào, trả về thông báo lỗi
        if (customerAddresses.isEmpty()) {
            throw new RuntimeException("No existing address found for this employee");
        }

        // Tìm địa chỉ đầu tiên của employee (giả sử chỉ có một địa chỉ hiện tại)
        CustomerAddresses existingLocation = customerAddresses.get(0);

        // Cập nhật các trường thông tin theo input từ request (JSON)
        existingLocation.setAddress(request.getAddress());
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
        existingLocation.setIs_current(false); // Đánh dấu địa chỉ này là hiện tại

        // Lưu địa chỉ đã được cập nhật
        customerAddressRepository.save(existingLocation);

        response.put("status", "success");
        response.put("message", "Employee address successfully updated");
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // Xóa địa chỉ của employee theo locationId
    public ResponseEntity<Map<String, Object>> deleteCustomerAddress(int locationId) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra xem địa chỉ có tồn tại không
        CustomerAddresses existingLocation = customerAddressRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location not found"));

        // Nếu địa chỉ là is_current = true, không cho phép xóa
        if (existingLocation.isIs_current()) {
            response.put("status", "error");
            response.put("message", "Cannot delete current address");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Xóa địa chỉ
        customerAddressRepository.delete(existingLocation);

        response.put("status", "success");
        response.put("message", "Employee address successfully deleted");
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // Lấy tất cả địa chỉ của employee theo employeeId
    public ResponseEntity<Map<String, Object>> getAllCusomterAddresses(@PathVariable int customer_id) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra xem employee có tồn tại không
        if (!customerAddressRepository.existsById(customer_id)) {
            response.put("message", "Employee not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        // Lấy danh sách địa chỉ của employee
        List<Map<String, Object>> addresses = customerAddressRepository.findCustomerAddressesByCustomer_Id(customer_id)
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

    // Delete account
    public ResponseEntity<Map<String, Object>> deleteCustomerAccount(@PathVariable Long customerId) {
        Map<String, Object> response = new HashMap<>();
        if (!customerAddressRepository.existsById(Math.toIntExact(customerId))) {
            response.put("message", "Employee not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        Customers customer = customerRepository.findById(customerId).orElseThrow(() -> new RuntimeException("Customer not found"));

        customer.setIs_deleted(true);
        customerRepository.save(customer);
        response.put("status", "Delete customer successfully");
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}