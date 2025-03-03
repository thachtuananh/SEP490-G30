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

    // customer xem tất cả dịch vụ, bao gồm cả ServiceDetails
    public List<ServiceDTO> getAllServices() {
        List<Services> homeCleanServices = serviceRepository.findAll();

        // Chuyển các HomeCleanService thành ServiceDTO, bao gồm cả ServiceDetail
        return homeCleanServices.stream()
                .map(this::convertToServiceDTO)
                .collect(Collectors.toList());
    }

    // Lấy chi tiết dịch vụ từ serviceDetailId, bao gồm cả description
    public ServiceDTO.ServiceDetailDTO getServiceDetailById(Long serviceDetailId) {
        ServiceDetail serviceDetail = serviceDetailRepository.findById(serviceDetailId).orElse(null);
        if (serviceDetail == null) {
            return null;  // Trả về null nếu không tìm thấy ServiceDetail
        }

        // Lấy Service tương ứng với ServiceDetail để lấy description
        Services service = serviceDetail.getService();
        ServiceDTO.ServiceDetailDTO serviceDetailDTO = convertToServiceDetailDTO(serviceDetail);
        serviceDetailDTO.setDescription(service.getDescription());  // Thêm description từ service

        return serviceDetailDTO;
    }

    private ServiceDTO convertToServiceDTO(Services homeCleanService) {
        ServiceDTO serviceDTO = new ServiceDTO();
        serviceDTO.setServiceId(homeCleanService.getId());
        serviceDTO.setServiceName(homeCleanService.getName());
        serviceDTO.setDescription(homeCleanService.getDescription()); // Thêm description
        serviceDTO.setBasePrice(homeCleanService.getBasePrice());


        // Lấy danh sách ServiceDetails cho dịch vụ này
        List<ServiceDTO.ServiceDetailDTO> serviceDetailDTOs = homeCleanService.getServiceDetails().stream()
                .map(this::convertToServiceDetailDTO)
                .collect(Collectors.toList());
        serviceDTO.setServiceDetails(serviceDetailDTOs);  // Đính kèm danh sách service details vào ServiceDTO

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

