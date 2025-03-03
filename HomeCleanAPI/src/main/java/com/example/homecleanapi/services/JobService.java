package com.example.homecleanapi.services;



import com.example.homecleanapi.dtos.BookJobRequest;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.*;
import com.example.homecleanapi.repositories.*;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

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
    

    
    

    // Tạo job mới cho customer
    public Map<String, Object> bookJob(@PathVariable Long customerId, BookJobRequest request) {
        Map<String, Object> response = new HashMap<>();

        System.out.println("customerId = " + customerId);

        Optional<Customers> customerOpt = customerRepo.findById(customerId);
        if (!customerOpt.isPresent()) {
            response.put("message", "Customer not found with customerId: " + customerId);
            return response;
        }

        Customers customer = customerOpt.get();

        // Tìm địa chỉ của customer
        Optional<CustomerAddresses> customerAddressOpt = customerAddressRepository.findById(request.getCustomerAddressId());
        if (!customerAddressOpt.isPresent()) {
            response.put("message", "Customer address not found");
            return response;
        }
        CustomerAddresses customerAddress = customerAddressOpt.get();

        Job job = new Job();

        // Kiểm tra Service
        Optional<Services> serviceOpt = serviceRepository.findById(request.getServiceId());
        if (!serviceOpt.isPresent()) {
            response.put("message", "Service not found");
            return response;
        }
        Services service = serviceOpt.get();

        // Kiểm tra Service Detail
        Optional<ServiceDetail> serviceDetailOpt = serviceDetailRepository.findById(request.getServiceDetailId());
        if (!serviceDetailOpt.isPresent()) {
            response.put("message", "Service Detail not found");
            return response;
        }
        ServiceDetail serviceDetail = serviceDetailOpt.get();

        // Gán thông tin cho Job
        job.setService(service);
        job.setServiceDetail(serviceDetail);

        // Chuyển jobTime từ String sang LocalDateTime
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            LocalDateTime jobTime = LocalDateTime.parse(request.getJobTime(), formatter);
            job.setScheduledTime(jobTime);
        } catch (Exception e) {
            response.put("message", "Invalid job time format");
            return response;
        }

        job.setCustomerAddress(customerAddress);
        job.setStatus(JobStatus.OPEN);
        job.setCustomer(customer);

        // Tính toán giá dịch vụ dựa trên giá trong service_detail
        double serviceDetailPrice = serviceDetail.getPrice();  // Sử dụng giá dịch vụ từ service_detail
        double additionalPrice = serviceDetail.getAdditionalPrice();
        double finalPrice = serviceDetailPrice + additionalPrice;  // Bắt đầu với giá dịch vụ từ service_detail và phụ phí

        // Kiểm tra xem job có thuộc giờ cao điểm hoặc ngày lễ/cuối tuần không
        double peakTimeFee = 0;
        double discount = 0;

        // Kiểm tra ngày lễ và cuối tuần
        DayOfWeek dayOfWeek = job.getScheduledTime().getDayOfWeek();
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            // Thêm phụ phí cho cuối tuần
            peakTimeFee = 0.1 * finalPrice;  // 10% phụ phí cho cuối tuần
        }

        // Kiểm tra xem job có vào khung giờ cao điểm hay không
        if (job.getScheduledTime().getHour() >= 18 && job.getScheduledTime().getHour() <= 22) {
            // Thêm phụ phí giờ cao điểm
            peakTimeFee += 0.2 * finalPrice; // 20% phụ phí giờ cao điểm
        }

        // Cộng phụ phí vào giá cuối cùng
        finalPrice += peakTimeFee;

        // Kiểm tra chiết khấu từ dịch vụ (nếu có)
        if (serviceDetail.getDiscounts() != null && !serviceDetail.getDiscounts().isEmpty()) {
            discount = 0.05 * finalPrice;  // Giảm giá 5% nếu có chiết khấu
            finalPrice -= discount;
        }

        // Gán giá cuối cùng cho Job
        job.setTotalPrice(finalPrice);

        // Tạo JobDetails mới và liên kết với Job
        JobDetails jobDetails = new JobDetails();
        jobDetails.setImageUrl(request.getImageUrl());

        // Gán Job cho JobDetails trước khi lưu
        jobDetails.setJob(job); // Liên kết Job với JobDetails

        // Lưu Job vào cơ sở dữ liệu trước
        jobRepository.save(job);

        // Lưu JobDetails vào cơ sở dữ liệu
        jobDetailsRepository.save(jobDetails);

        response.put("message", "Job booked successfully");
        response.put("jobId", job.getId());
        response.put("status", job.getStatus());
        response.put("finalPrice", finalPrice);  // Trả về giá cuối cùng

        return response;
    }




    public Map<String, Object> updateJobStatusToStarted(Long jobId, @PathVariable Long customerId) {
        Map<String, Object> response = new HashMap<>();

        // Tìm công việc theo jobId
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            return response;
        }

        Job job = jobOpt.get();

        // Kiểm tra quyền của customer (sử dụng customerId từ @RequestParam)
        if (!job.getCustomer().getId().equals(customerId)) {
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
            
            jobInfo.put("jobId", job.getId());
            jobInfo.put("serviceName", job.getService().getName());  // Tên dịch vụ
            jobInfo.put("scheduledTime", job.getScheduledTime());  // Thời gian
            jobInfo.put("customerAddress", job.getCustomerAddress().getAddress());  // Địa chỉ
            jobInfo.put("status", job.getStatus());  // Trạng thái
            jobInfo.put("totalPrice", job.getTotalPrice());  // Giá
            jobInfo.put("createdAt", job.getCreatedAt());  

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

