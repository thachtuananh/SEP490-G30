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
 // customer xem tất cả dịch vụ, bao gồm cả ServiceDetails
    public List<ServiceDTO> getAllServices() {
        List<Services> homeCleanServices = serviceRepository.findAll();

        // Chuyển các HomeCleanService thành ServiceDTO, bao gồm cả ServiceDetail
        return homeCleanServices.stream()
                .map(this::convertToServiceDTO)
                .collect(Collectors.toList());
    }

    private ServiceDTO convertToServiceDTO(Services service) {
        ServiceDTO serviceDTO = new ServiceDTO();
        serviceDTO.setServiceId(service.getId());
        serviceDTO.setServiceName(service.getName());
        serviceDTO.setDescription(service.getDescription());  // Thêm description
        serviceDTO.setBasePrice(service.getBasePrice());
        
        // Lấy danh sách ServiceDetails cho dịch vụ này
        List<ServiceDTO.ServiceDetailDTO> serviceDetailDTOs = service.getServiceDetails().stream()
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
        serviceDetailDTO.setPrice(serviceDetail.getPrice());          // Thêm giá
        serviceDetailDTO.setMinRoomSize(serviceDetail.getMinRoomSize());  // Thêm minRoomSize
        serviceDetailDTO.setMaxRoomSize(serviceDetail.getMaxRoomSize());  // Thêm maxRoomSize
        return serviceDetailDTO;
    }

    
 // Lấy chi tiết dịch vụ từ serviceDetailId, bao gồm cả description
 // Trong ServiceDisplayService
    public ServiceDTO getServiceDetailsByServiceId(Long serviceId) {
        // Lấy thông tin dịch vụ từ serviceId
        Services service = serviceRepository.findById(serviceId).orElse(null);
        
        if (service == null) {
            return null;  // Trả về null nếu không tìm thấy dịch vụ
        }

        // Chuyển đổi dịch vụ thành ServiceDTO
        ServiceDTO serviceDTO = convertToServiceDTO(service);

        // Lấy danh sách ServiceDetails cho dịch vụ này
        List<ServiceDTO.ServiceDetailDTO> serviceDetailDTOs = service.getServiceDetails().stream()
                .map(this::convertToServiceDetailDTO)
                .collect(Collectors.toList());

        // Đính kèm danh sách ServiceDetails vào ServiceDTO
        serviceDTO.setServiceDetails(serviceDetailDTOs);

        return serviceDTO;
    }





}

