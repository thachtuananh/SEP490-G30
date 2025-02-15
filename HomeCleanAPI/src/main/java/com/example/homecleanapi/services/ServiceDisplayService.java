package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.ServiceDTO;
import com.example.homecleanapi.models.Service;
import com.example.homecleanapi.models.ServiceDetail;
import com.example.homecleanapi.repositories.ServiceRepository;
import com.example.homecleanapi.repositories.ServiceDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;


import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class ServiceDisplayService {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ServiceDetailRepository serviceDetailRepository;

    public List<ServiceDTO> getAllServices() {
        // Lấy tất cả dịch vụ từ repository
        List<Service> services = serviceRepository.findAll();
        
        // Chuyển các Service thành ServiceDTO
        return services.stream().map(this::convertToServiceDTO).collect(Collectors.toList());
    }

    private ServiceDTO convertToServiceDTO(Service service) {
        // Chuyển đổi Service thành ServiceDTO
        ServiceDTO serviceDTO = new ServiceDTO();
        serviceDTO.setServiceId(service.getId());
        serviceDTO.setServiceName(service.getName());
        serviceDTO.setDescription(service.getDescription());
        serviceDTO.setBasePrice(service.getBasePrice());
        serviceDTO.setServiceType(service.getServiceType().name());

        // Lấy chi tiết dịch vụ liên quan
        List<ServiceDTO.ServiceDetailDTO> serviceDetailDTOs = serviceDetailRepository
                .findByServiceId(service.getId()).stream()
                .map(this::convertToServiceDetailDTO)
                .collect(Collectors.toList());

        serviceDTO.setServiceDetails(serviceDetailDTOs);
        return serviceDTO;
    }

    private ServiceDTO.ServiceDetailDTO convertToServiceDetailDTO(ServiceDetail serviceDetail) {
        // Chuyển đổi ServiceDetail thành ServiceDetailDTO
        ServiceDTO.ServiceDetailDTO serviceDetailDTO = new ServiceDTO.ServiceDetailDTO();
        serviceDetailDTO.setServiceDetailId(serviceDetail.getId());
        serviceDetailDTO.setName(serviceDetail.getName());
        serviceDetailDTO.setAdditionalPrice(serviceDetail.getAdditionalPrice());
        return serviceDetailDTO;
    }
}
