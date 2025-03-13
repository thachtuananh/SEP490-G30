package com.example.homecleanapi.services;



import com.example.homecleanapi.dtos.BookJobRequest;
import com.example.homecleanapi.dtos.BookJobRequest.ServiceRequest;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.*;
import com.example.homecleanapi.repositories.*;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;
    
    @Autowired
    private CustomerRepo customerRepo;
    
    @Autowired
    private CustomerAddressRepository customerAddressRepository; 
    
    @Autowired
    private ServiceRepository serviceRepository;
    
    @Autowired
    private ServiceDetailRepository serviceDetailRepository;
    
    @Autowired 
    private JobDetailsRepository jobDetailsRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private JobServiceDetailRepository jobServiceDetailRepository; 
    

    
    

    // Tạo job mới cho customer
//    public Map<String, Object> bookJob(@PathVariable Long customerId, BookJobRequest request) {
//        Map<String, Object> response = new HashMap<>();
//
//        System.out.println("customerId = " + customerId);
//
//        Optional<Customers> customerOpt = customerRepo.findById(customerId);
//        if (!customerOpt.isPresent()) {
//            response.put("message", "Customer not found with customerId: " + customerId);
//            return response;
//        }
//
//        Customers customer = customerOpt.get();
//
//        // Tìm địa chỉ của customer
//        Optional<CustomerAddresses> customerAddressOpt = customerAddressRepository.findById(request.getCustomerAddressId());
//        if (!customerAddressOpt.isPresent()) {
//            response.put("message", "Customer address not found");
//            return response;
//        }
//        CustomerAddresses customerAddress = customerAddressOpt.get();
//
//        Job job = new Job();
//
//        // Kiểm tra Service
//        Optional<Services> serviceOpt = serviceRepository.findById(request.getServiceId());
//        if (!serviceOpt.isPresent()) {
//            response.put("message", "Service not found");
//            return response;
//        }
//        Services service = serviceOpt.get();
//
//        // Kiểm tra Service Detail
//        Optional<ServiceDetail> serviceDetailOpt = serviceDetailRepository.findById(request.getServiceDetailId());
//        if (!serviceDetailOpt.isPresent()) {
//            response.put("message", "Service Detail not found");
//            return response;
//        }
//        ServiceDetail serviceDetail = serviceDetailOpt.get();
//
//        // Gán thông tin cho Job
//        job.setService(service);
//        job.setServiceDetail(serviceDetail);
//
//        // Chuyển jobTime từ String sang LocalDateTime
//        try {
//            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
//            LocalDateTime jobTime = LocalDateTime.parse(request.getJobTime(), formatter);
//            job.setScheduledTime(jobTime);
//        } catch (Exception e) {
//            response.put("message", "Invalid job time format");
//            return response;
//        }
//
//        job.setCustomerAddress(customerAddress);
//        job.setStatus(JobStatus.OPEN);
//        job.setCustomer(customer);
//
//        // Tính toán giá dịch vụ dựa trên giá trong service_detail
//        double serviceDetailPrice = serviceDetail.getPrice();  // Sử dụng giá dịch vụ từ service_detail
//        double additionalPrice = serviceDetail.getAdditionalPrice();
//        double finalPrice = serviceDetailPrice + additionalPrice;  // Bắt đầu với giá dịch vụ từ service_detail và phụ phí
//
//        // Kiểm tra xem job có thuộc giờ cao điểm hoặc ngày lễ/cuối tuần không
//        double peakTimeFee = 0;
//        double discount = 0;
//
//        // Kiểm tra ngày lễ và cuối tuần
//        DayOfWeek dayOfWeek = job.getScheduledTime().getDayOfWeek();
//        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
//            // Thêm phụ phí cho cuối tuần
//            peakTimeFee = 0.1 * finalPrice;  // 10% phụ phí cho cuối tuần
//        }
//
//        // Kiểm tra xem job có vào khung giờ cao điểm hay không
//        if (job.getScheduledTime().getHour() >= 18 && job.getScheduledTime().getHour() <= 22) {
//            // Thêm phụ phí giờ cao điểm
//            peakTimeFee += 0.2 * finalPrice; // 20% phụ phí giờ cao điểm
//        }
//
//        // Cộng phụ phí vào giá cuối cùng
//        finalPrice += peakTimeFee;
//
//        // Kiểm tra chiết khấu từ dịch vụ (nếu có)
//        if (serviceDetail.getDiscounts() != null && !serviceDetail.getDiscounts().isEmpty()) {
//            discount = 0.05 * finalPrice;  // Giảm giá 5% nếu có chiết khấu
//            finalPrice -= discount;
//        }
//
//        // Gán giá cuối cùng cho Job
//        job.setTotalPrice(finalPrice);
//
//        // Tạo JobDetails mới và liên kết với Job
//        JobDetails jobDetails = new JobDetails();
//        jobDetails.setImageUrl(request.getImageUrl());
//
//        // Gán Job cho JobDetails trước khi lưu
//        jobDetails.setJob(job); // Liên kết Job với JobDetails
//
//        // Lưu Job vào cơ sở dữ liệu trước
//        jobRepository.save(job);
//
//        // Lưu JobDetails vào cơ sở dữ liệu
//        jobDetailsRepository.save(jobDetails);
//
//        response.put("message", "Job booked successfully");
//        response.put("jobId", job.getId());
//        response.put("status", job.getStatus());
//        response.put("finalPrice", finalPrice);  // Trả về giá cuối cùng
//
//        return response;
//    }
    
    
    public Map<String, Object> bookJob(@PathVariable Long customerId, @RequestBody BookJobRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra khách hàng có tồn tại không
        Optional<Customers> customerOpt = customerRepo.findById(customerId);
        if (!customerOpt.isPresent()) {
            response.put("message", "Customer not found with customerId: " + customerId);
            return response;
        }
        Customers customer = customerOpt.get();

        // Kiểm tra địa chỉ của customer
        Optional<CustomerAddresses> customerAddressOpt = customerAddressRepository.findById(request.getCustomerAddressId());
        if (!customerAddressOpt.isPresent()) {
            response.put("message", "Customer address not found");
            return response;
        }
        CustomerAddresses customerAddress = customerAddressOpt.get();

        // Chuyển jobTime từ String sang LocalDateTime
        LocalDateTime jobTime = null;
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            jobTime = LocalDateTime.parse(request.getJobTime(), formatter);
        } catch (Exception e) {
            response.put("message", "Invalid job time format");
            return response;
        }

        // Kiểm tra trùng lịch và địa chỉ
        List<Job> existingJobs = jobRepository.findByScheduledTimeAndCustomerAddress(jobTime, customerAddress);
        if (!existingJobs.isEmpty()) {
            // Kiểm tra trùng dịch vụ
            for (Job existingJob : existingJobs) {
                // Kiểm tra xem có dịch vụ và service detail trùng không
                for (JobServiceDetail jobServiceDetail : existingJob.getJobServiceDetails()) {
                    for (ServiceRequest serviceRequest : request.getServices()) {
                        if (jobServiceDetail.getService().getId().equals(serviceRequest.getServiceId()) &&
                                jobServiceDetail.getServiceDetail().getId().equals(serviceRequest.getServiceDetailId())) {
                            response.put("message", "There is already a job booked at this time, address, and service.");
                            return response;
                        }
                    }
                }
            }
        }

        // Tạo Job và gán các thuộc tính cần thiết
        Job job = new Job();
        job.setCustomer(customer);
        job.setCustomerAddress(customerAddress);
        job.setStatus(JobStatus.OPEN);
        job.setScheduledTime(jobTime);

        // Lưu Job vào cơ sở dữ liệu trước
        job = jobRepository.save(job);

        // Tính tổng giá cho tất cả các dịch vụ
        double totalPrice = 0;

        // Danh sách lưu các JobServiceDetail sẽ được tạo
        List<JobServiceDetail> jobServiceDetails = new ArrayList<>();

        // Duyệt qua các dịch vụ mà customer đã chọn
        for (ServiceRequest serviceRequest : request.getServices()) {

            // Kiểm tra dịch vụ có tồn tại không
            Optional<Services> serviceOpt = serviceRepository.findById(serviceRequest.getServiceId());
            if (!serviceOpt.isPresent()) {
                response.put("message", "Service not found with serviceId: " + serviceRequest.getServiceId());
                return response;
            }
            Services service = serviceOpt.get();

            // Kiểm tra chi tiết dịch vụ có tồn tại không
            Optional<ServiceDetail> serviceDetailOpt = serviceDetailRepository.findById(serviceRequest.getServiceDetailId());
            if (!serviceDetailOpt.isPresent()) {
                response.put("message", "Service Detail not found for serviceId: " + serviceRequest.getServiceDetailId());
                return response;
            }
            ServiceDetail serviceDetail = serviceDetailOpt.get();

            // Tính toán giá cho dịch vụ
            double serviceDetailPrice = serviceDetail.getPrice();
            double additionalPrice = serviceDetail.getAdditionalPrice();
            double finalPrice = serviceDetailPrice + additionalPrice;

            // Tính toán các phụ phí (giờ cao điểm, cuối tuần, chiết khấu...)
            double peakTimeFee = 0;
            if (job.getScheduledTime() != null) {
                if (job.getScheduledTime().getDayOfWeek() == DayOfWeek.SATURDAY || job.getScheduledTime().getDayOfWeek() == DayOfWeek.SUNDAY) {
                    peakTimeFee = 0.1 * finalPrice; // Phụ phí cuối tuần
                }
                if (job.getScheduledTime().getHour() >= 18 && job.getScheduledTime().getHour() <= 22) {
                    peakTimeFee += 0.2 * finalPrice; // Phụ phí giờ cao điểm
                }
            }

            finalPrice += peakTimeFee;

            // Cộng tổng giá dịch vụ
            totalPrice += finalPrice;

            // Tạo JobServiceDetail và lưu vào cơ sở dữ liệu
            JobServiceDetail jobServiceDetail = new JobServiceDetail();
            jobServiceDetail.setJob(job);
            jobServiceDetail.setService(service);
            jobServiceDetail.setServiceDetail(serviceDetail);

            // Thêm JobServiceDetail vào danh sách
            jobServiceDetails.add(jobServiceDetail);
        }

        // Lưu các JobServiceDetail vào cơ sở dữ liệu
        jobServiceDetailRepository.saveAll(jobServiceDetails);

        // Cập nhật tổng giá và lưu lại Job
        job.setTotalPrice(totalPrice);
        jobRepository.save(job);

        // Trả về thông tin công việc đã tạo
        response.put("message", "Job booked successfully");
        response.put("jobId", job.getId());
        response.put("status", job.getStatus());
        response.put("totalPrice", totalPrice);

        return response;
    }









    public Map<String, Object> updateJobStatusToStarted(Long jobId, @PathVariable Long customerId) { // Dùng @PathVariable cho customerId
        Map<String, Object> response = new HashMap<>();

        // Tìm công việc theo jobId
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            return response;
        }

        Job job = jobOpt.get();

        // Kiểm tra quyền của customer (sử dụng customerId từ @PathVariable)
        if (!customerId.equals(job.getCustomer().getId().longValue())) {
            response.put("message", "You are not authorized to start this job");
            return response;
        }


        // Kiểm tra trạng thái công việc và sự tồn tại của job application
        JobApplication jobApplication = jobApplicationRepository.findByJobIdAndStatus(jobId, "Accepted");
        if (jobApplication == null) {
            response.put("message", "No cleaner assigned or job application is not in 'Accepted' state");
            return response;
        }

        if (!job.getStatus().equals(JobStatus.ARRIVED)) {
            response.put("message", "Job is not in ARRIVED state");
            return response;
        }

        // Cập nhật trạng thái công việc thành 'STARTED'
        job.setStatus(JobStatus.STARTED);
        jobRepository.save(job);

        response.put("message", "Job status updated to STARTED");
        return response;
    }

    
    public List<CustomerAddresses> getAddressesByCustomerId(Integer customerId) {
        return customerAddressRepository.findByCustomerId(customerId);
    }
    
    
    public boolean setDefaultAddressForCustomer(Integer customerId, Integer addressId) {
        // Lấy tất cả các địa chỉ của customer
        List<CustomerAddresses> addresses = customerAddressRepository.findByCustomerId(customerId);

        if (addresses.isEmpty()) {
            return false; // Nếu không có địa chỉ nào
        }

        // Cập nhật trạng thái is_default của tất cả các địa chỉ của customer thành false
        for (CustomerAddresses address : addresses) {
            address.setIs_current(false); // Hoặc nếu bạn dùng "is_default", hãy đổi theo thuộc tính đó
            customerAddressRepository.save(address);
        }

        // Cập nhật địa chỉ được chọn thành mặc định
        CustomerAddresses defaultAddress = customerAddressRepository.findById(addressId).orElse(null);
        if (defaultAddress != null) {
            defaultAddress.setIs_current(true); // Hoặc nếu bạn dùng "is_default", hãy đổi theo thuộc tính đó
            customerAddressRepository.save(defaultAddress);
            return true;
        }

        return false;
    }
    
    public Map<String, Object> updateJobStatusToDone(Long jobId) {
        Map<String, Object> response = new HashMap<>();

        // Lấy thông tin job từ jobId
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            return response;
        }

        Job job = jobOpt.get();

        // Kiểm tra nếu job đã có trạng thái "COMPLETED"
        if (!job.getStatus().equals(JobStatus.COMPLETED)) {
            response.put("message", "Job must be in 'COMPLETED' state before marking as DONE");
            return response;
        }

        // Chuyển trạng thái công việc sang "DONE"
        job.setStatus(JobStatus.DONE);
        jobRepository.save(job);

        response.put("message", "Job status updated to DONE");
        return response;
    }
    
    // list tất cả job đã book
    public List<Map<String, Object>> getBookedJobsForCustomer(Long customerId) {
        List<Map<String, Object>> bookedJobs = new ArrayList<Map<String,Object>>();

        // Lấy tất cả các job mà customer đã đặt
        List<Job> jobs = jobRepository.findByCustomerId(customerId);

        for (Job job : jobs) {
            Map<String, Object> jobInfo = new HashMap<>();

            // Thêm các thông tin chi tiết của job vào jobInfo
            jobInfo.put("jobId", job.getId());
            jobInfo.put("scheduledTime", job.getScheduledTime());  // Thời gian
            jobInfo.put("customerAddress", job.getCustomerAddress().getAddress());  // Địa chỉ
            jobInfo.put("status", job.getStatus());  // Trạng thái
            jobInfo.put("totalPrice", job.getTotalPrice());  // Giá
            jobInfo.put("createdAt", job.getCreatedAt());  // Thời gian tạo

            // Thêm thông tin về customer đã đặt job
            Customers customer = job.getCustomer();
            if (customer != null) {
                jobInfo.put("customerId", customer.getId());
                jobInfo.put("customerName", customer.getFull_name());
                jobInfo.put("customerPhone", customer.getPhone());
            }

            // Thêm thông tin về địa chỉ của customer
            CustomerAddresses customerAddress = job.getCustomerAddress();
            if (customerAddress != null) {
                jobInfo.put("customerAddressId", customerAddress.getId());
                jobInfo.put("customerAddress", customerAddress.getAddress());
                jobInfo.put("latitude", customerAddress.getLatitude());
                jobInfo.put("longitude", customerAddress.getLongitude());
            }

            // Lấy tất cả các JobServiceDetail cho job này
            List<JobServiceDetail> jobServiceDetails = jobServiceDetailRepository.findByJobId(job.getId());
            if (jobServiceDetails != null && !jobServiceDetails.isEmpty()) {
                List<Map<String, Object>> serviceList = new ArrayList<>();

                // Duyệt qua tất cả các dịch vụ trong bảng job_service_detail
                for (JobServiceDetail jobServiceDetail : jobServiceDetails) {
                    Services service = jobServiceDetail.getService();
                    if (service != null) {
                        Map<String, Object> serviceInfo = new HashMap<>();
                        serviceInfo.put("serviceName", service.getName());
                        serviceInfo.put("serviceDescription", service.getDescription());

                        // Lấy các chi tiết dịch vụ
                        ServiceDetail serviceDetail = jobServiceDetail.getServiceDetail();
                        if (serviceDetail != null) {
                            serviceInfo.put("serviceDetailId", serviceDetail.getId());
                            serviceInfo.put("serviceDetailName", serviceDetail.getName());
                            serviceInfo.put("serviceDetailPrice", serviceDetail.getPrice());
                            serviceInfo.put("serviceDetailAdditionalPrice", serviceDetail.getAdditionalPrice());
                            serviceInfo.put("serviceDetailAreaRange", serviceDetail.getAreaRange());
                            serviceInfo.put("serviceDetailDescription", serviceDetail.getDescription());
                            serviceInfo.put("serviceDetailDiscounts", serviceDetail.getDiscounts());
                        }

                        serviceList.add(serviceInfo);
                    }
                }

                // Thêm thông tin dịch vụ vào jobInfo
                jobInfo.put("services", serviceList);
            } else {
                jobInfo.put("services", "No services found for this job");
            }

            bookedJobs.add(jobInfo);
        }

        return bookedJobs;
    }


    
    // huy job ddax book
    public Map<String, Object> cancelJobForCustomer(Long customerId, Long jobId) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra xem customer có tồn tại không
        Optional<Customers> customerOpt = customerRepository.findById(customerId);
        if (!customerOpt.isPresent()) {
            response.put("message", "Customer not found");
            return response;
        }
        Customers customer = customerOpt.get();

        // Tìm job theo jobId
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            return response;
        }
        Job job = jobOpt.get();

        // Kiểm tra xem customer có phải là người tạo job này không
        if (job.getCustomer().getId().longValue() != customerId) {
            response.put("message", "You are not authorized to cancel this job");
            return response;
        }


        // Kiểm tra trạng thái của job
        if (job.getStatus().equals(JobStatus.STARTED) || job.getStatus().equals(JobStatus.COMPLETED) || job.getStatus().equals(JobStatus.DONE) ) {
            response.put("message", "You cannot cancel a job that has already started");
            return response;
        }

        // Cập nhật trạng thái công việc thành "CANCELLED"
        job.setStatus(JobStatus.CANCELLED);
        jobRepository.save(job);

        response.put("message", "Job has been cancelled successfully");
        response.put("jobId", jobId);
        response.put("status", job.getStatus());
        return response;
    }
    
    // LU
    



}

