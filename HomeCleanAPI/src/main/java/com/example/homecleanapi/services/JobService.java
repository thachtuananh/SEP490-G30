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

        // Kiểm tra nếu khách hàng không tồn tại
        Optional<Customers> customerOpt = customerRepo.findById(customerId);
        if (!customerOpt.isPresent()) {
            response.put("message", "Khách hàng không tồn tại với customerId: " + customerId);
            return response;
        }

        Customers customer = customerOpt.get();

        // Tìm địa chỉ của khách hàng
        Optional<CustomerAddresses> customerAddressOpt = customerAddressRepository.findById(request.getCustomerAddressId());
        if (!customerAddressOpt.isPresent()) {
            response.put("message", "Địa chỉ của khách hàng không tồn tại");
            return response;
        }
        CustomerAddresses customerAddress = customerAddressOpt.get();

        Job job = new Job();

        // Kiểm tra Service
        Optional<Services> serviceOpt = serviceRepository.findById(request.getServiceId());
        if (!serviceOpt.isPresent()) {
            response.put("message", "Dịch vụ không tồn tại");
            return response;
        }
        Services service = serviceOpt.get();

        // Kiểm tra Service Detail
        Optional<ServiceDetail> serviceDetailOpt = serviceDetailRepository.findById(request.getServiceDetailId());
        if (!serviceDetailOpt.isPresent()) {
            response.put("message", "Chi tiết dịch vụ không tồn tại");
            return response;
        }
        ServiceDetail serviceDetail = serviceDetailOpt.get();

        // Gán thông tin cho Job
        job.setService(service);
        job.setServiceDetail(serviceDetail);

        // Chuyển jobTime từ String sang LocalDateTime
        LocalDateTime jobTime;
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            jobTime = LocalDateTime.parse(request.getJobTime(), formatter);
            job.setScheduledTime(jobTime);
        } catch (Exception e) {
            response.put("message", "Định dạng thời gian công việc không hợp lệ");
            return response;
        }


        LocalDateTime now = LocalDateTime.now();
        if (jobTime.isBefore(now)) {
            response.put("message", "Không thể đặt công việc trong quá khứ");
            return response;
        }

        if (jobTime.isBefore(now.plusHours(2))) {
            response.put("message", "Công việc phải được đặt ít nhất 2 giờ sau thời gian hiện tại");
            return response;
        }

        // Kiểm tra trùng lịch công việc (job đã được đặt trong khoảng thời gian gần với jobTime)
        List<Job> existingJobs = jobRepository.findByCustomerIdAndScheduledTimeBetween(
                customerId, jobTime.minusHours(2), jobTime.plusHours(2));
        if (!existingJobs.isEmpty()) {
            response.put("message", "Công việc không thể đặt vì trùng lịch với công việc đã đặt trước đó");
            return response;
        }

        job.setCustomerAddress(customerAddress);
        job.setStatus(JobStatus.OPEN);
        job.setCustomer(customer);


        double serviceDetailPrice = serviceDetail.getPrice();  
        double additionalPrice = serviceDetail.getAdditionalPrice();
        double finalPrice = serviceDetailPrice + additionalPrice;  

        double peakTimeFee = 0;
        double discount = 0;

        DayOfWeek dayOfWeek = job.getScheduledTime().getDayOfWeek();
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            peakTimeFee = 0.1 * finalPrice;  
        }

        if (job.getScheduledTime().getHour() >= 18 && job.getScheduledTime().getHour() <= 22) {
            peakTimeFee += 0.2 * finalPrice; 
        }

        finalPrice += peakTimeFee;

        if (serviceDetail.getDiscounts() != null && !serviceDetail.getDiscounts().isEmpty()) {
            discount = 0.05 * finalPrice;  
            finalPrice -= discount;
        }

        job.setTotalPrice(finalPrice);

        JobDetails jobDetails = new JobDetails();
        jobDetails.setImageUrl(request.getImageUrl());

        jobDetails.setJob(job);

        // Lưu Job vào cơ sở dữ liệu trước
        jobRepository.save(job);

        // Lưu JobDetails vào cơ sở dữ liệu
        jobDetailsRepository.save(jobDetails);

        response.put("message", "Công việc đã được đặt thành công");
        response.put("jobId", job.getId());
        response.put("status", job.getStatus());
        response.put("finalPrice", finalPrice);  

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

