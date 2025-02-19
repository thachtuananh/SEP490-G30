package com.example.homecleanapi.controllers;

<<<<<<< HEAD
import com.example.homecleanapi.dtos.ServiceDTO;
import com.example.homecleanapi.services.ServiceDisplayService;
=======
import java.util.List;

>>>>>>> 9a0130a (new commit with new API)
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

<<<<<<< HEAD
import java.util.List;
=======
import com.example.homecleanapi.dtos.ServiceDTO;
import com.example.homecleanapi.services.ServiceDisplayService;  

>>>>>>> 9a0130a (new commit with new API)

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServiceDisplayService serviceDisplayService;

<<<<<<< HEAD
    
    // api lấy ra hết dịch vụ ở trang homepage
=======
>>>>>>> 9a0130a (new commit with new API)
    @GetMapping("/all")
    public ResponseEntity<List<ServiceDTO>> getAllServices() {
        List<ServiceDTO> services = serviceDisplayService.getAllServices();
        return ResponseEntity.ok(services);
    }
<<<<<<< HEAD
    
    
=======
>>>>>>> 9a0130a (new commit with new API)
}
