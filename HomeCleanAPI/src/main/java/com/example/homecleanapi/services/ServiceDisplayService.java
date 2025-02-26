package com.example.homecleanapi.services;
import com.example.homecleanapi.dtos.ServiceDTO;
import com.example.homecleanapi.models.ServiceDetail;
import com.example.homecleanapi.models.Services;
import com.example.homecleanapi.repositories.ServiceRepository;
import com.example.homecleanapi.repositories.ServiceDetailRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class ServiceDisplayService {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ServiceDetailRepository serviceDetailRepository;

    // customer xem tất cả dịch vụ
    public List<ServiceDTO> getAllServices() {
        List<Services> homeCleanServices = serviceRepository.findAll();

        // Chuyển các HomeCleanService thành ServiceDTO
        return homeCleanServices.stream()
                .map(this::convertToServiceDTO)
                .collect(Collectors.toList());
    }

    // Lấy chi tiết dịch vụ từ service_id
    public ServiceDTO.ServiceDetailDTO getServiceDetailById(Long serviceDetailId) {
        ServiceDetail serviceDetail = serviceDetailRepository.findById(serviceDetailId).orElse(null);
        if (serviceDetail == null) {
            return null;  // Trả về null nếu không tìm thấy ServiceDetail
        }

        return convertToServiceDetailDTO(serviceDetail);
    }


    private ServiceDTO convertToServiceDTO(Services homeCleanService) {
        ServiceDTO serviceDTO = new ServiceDTO();
        serviceDTO.setServiceId(homeCleanService.getId());
        serviceDTO.setServiceName(homeCleanService.getName());
        serviceDTO.setDescription(homeCleanService.getDescription());
        serviceDTO.setBasePrice(homeCleanService.getBasePrice());
        serviceDTO.setServiceType(homeCleanService.getServiceType().name());

        return serviceDTO;
    }

    private ServiceDTO.ServiceDetailDTO convertToServiceDetailDTO(ServiceDetail serviceDetail) {
        ServiceDTO.ServiceDetailDTO serviceDetailDTO = new ServiceDTO.ServiceDetailDTO();
        serviceDetailDTO.setServiceDetailId(serviceDetail.getId());
        serviceDetailDTO.setName(serviceDetail.getName());
        serviceDetailDTO.setAdditionalPrice(serviceDetail.getAdditionalPrice());
        return serviceDetailDTO;
    }

}

