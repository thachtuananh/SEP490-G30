package com.example.homecleanapi.services;
import com.example.homecleanapi.dtos.ServiceDTO;
import com.example.homecleanapi.models.ServiceDetail;
import com.example.homecleanapi.models.Services;
import com.example.homecleanapi.repositories.ServiceRepository;
import com.example.homecleanapi.repositories.ServiceDetailRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class ServiceDisplayService {

    private ServiceRepository serviceRepository;

    private ServiceDetailRepository serviceDetailRepository;

    public List<ServiceDTO> getAllServices() {

    	List<Services> homeCleanServices = serviceRepository.findAllList();

        // Chuyển các HomeCleanService thành ServiceDTO
        return homeCleanServices.stream().map(this::convertToServiceDTO).collect(Collectors.toList());
    }


    private ServiceDTO convertToServiceDTO(Services homeCleanService) {

        // Chuyển đổi HomeCleanService thành ServiceDTO
        ServiceDTO serviceDTO = new ServiceDTO();
        serviceDTO.setServiceId(homeCleanService.getId());
        serviceDTO.setServiceName(homeCleanService.getName());
        serviceDTO.setDescription(homeCleanService.getDescription());
        serviceDTO.setBasePrice(homeCleanService.getBasePrice());
        serviceDTO.setServiceType(homeCleanService.getServiceType().name());

        // Lấy chi tiết dịch vụ liên quan
        List<ServiceDTO.ServiceDetailDTO> serviceDetailDTOs = serviceDetailRepository
                .findByServiceId(homeCleanService.getId()).stream()
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
