package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.JobSummaryDTO;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.models.JobApplication;
import com.example.homecleanapi.models.ServiceDetail;
import com.example.homecleanapi.models.Services;
import com.example.homecleanapi.repositories.CleanerRepository;
import com.example.homecleanapi.repositories.CustomerRepo;
import com.example.homecleanapi.repositories.CustomerRepository;
import com.example.homecleanapi.repositories.JobApplicationRepository;
import com.example.homecleanapi.repositories.JobRepository;
import com.example.homecleanapi.repositories.ServiceDetailRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CleanerJobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    @Autowired
    private CleanerRepository cleanerRepository;
    
    @Autowired
    private CustomerRepo customerRepo;
    
    @Autowired
    private ServiceDetailRepository serviceDetailRepository;

    // Lấy danh sách các công việc đang mở
    public List<JobSummaryDTO> getOpenJobs() {
        List<Job> openJobs = jobRepository.findByStatus(JobStatus.OPEN); 

        return openJobs.stream()
                .map(job -> new JobSummaryDTO(
                        job.getId(),
                        job.getService() != null ? job.getService().getName() : "N/A",
                        job.getTotalPrice(),
                        job.getScheduledTime()))
                .collect(Collectors.toList());
    }

    // Lấy chi tiết công việc
    public Map<String, Object> getJobDetails(Long jobId) {
        Map<String, Object> jobDetails = new HashMap<>();

        Job job = jobRepository.findById(jobId).orElse(null);
        if (job != null) {
            // Thêm thông tin về job
            jobDetails.put("jobId", job.getId());
            jobDetails.put("status", job.getStatus());
            jobDetails.put("totalPrice", job.getTotalPrice());
            jobDetails.put("scheduledTime", job.getScheduledTime());

            // Thêm thông tin về Service (name và description)
            Services service = job.getService();
            if (service != null) {
                jobDetails.put("serviceName", service.getName());
                jobDetails.put("serviceDescription", service.getDescription());
            }

            // Lấy tất cả ServiceDetails có service_id giống với service_id trong job
            List<ServiceDetail> serviceDetails = serviceDetailRepository.findByServiceId(job.getService().getId());
            if (serviceDetails != null && !serviceDetails.isEmpty()) {
                List<Map<String, Object>> serviceDetailList = new ArrayList<>();
                for (ServiceDetail detail : serviceDetails) {
                    Map<String, Object> detailInfo = new HashMap<>();
                    detailInfo.put("serviceDetailId", detail.getId());
                    detailInfo.put("name", detail.getName());
                    detailInfo.put("price", detail.getPrice());
                    detailInfo.put("additionalPrice", detail.getAdditionalPrice());
                    detailInfo.put("areaRange", detail.getAreaRange());
                    detailInfo.put("description", detail.getDescription());
                    detailInfo.put("discounts", detail.getDiscounts());
                    serviceDetailList.add(detailInfo);
                }
                jobDetails.put("serviceDetails", serviceDetailList);
            }
        }

        return jobDetails.isEmpty() ? null : jobDetails;
    }

    // Apply job
    public Map<String, Object> applyForJob(Long jobId) {
        Map<String, Object> response = new HashMap<>();

        
        String phoneNumber = SecurityContextHolder.getContext().getAuthentication().getName(); 
        System.out.println("phone = " + phoneNumber);


        Optional<Employee> cleanerOpt = cleanerRepository.findByPhone(phoneNumber);

        if (!cleanerOpt.isPresent()) {
            response.put("message", "Cleaner not found");
            return response;
        }

        Employee cleaner = cleanerOpt.get();

        // Tìm công việc theo jobId
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            return response;
        }

        Job job = jobOpt.get();

        // Kiểm tra trạng thái công việc
        if (!job.getStatus().equals(JobStatus.OPEN)) {
            response.put("message", "Job is no longer open or has been taken");
            return response;
        }

        // Tạo job application và lưu vào database
        JobApplication jobApplication = new JobApplication();
        jobApplication.setJob(job);
        jobApplication.setCleaner(cleaner);
        jobApplication.setStatus("Pending");

        jobApplicationRepository.save(jobApplication);

        response.put("message", "Cleaner has successfully applied for the job");
        response.put("jobId", jobId);
        response.put("cleanerId", cleaner.getId());
        response.put("status", "Pending");

        return response;
    }



    // Get applications for job
    public List<Map<String, Object>> getApplicationsForJob(Long jobId) {
        Map<String, Object> response = new HashMap<>();
        // Lấy phoneNumber của customer từ SecurityContext
        String phoneNumber = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("phone.. = " + phoneNumber);

        // Tìm customer theo phone number
        Optional<Customers> customerOpt = customerRepo.findByPhone(phoneNumber);
        if (!customerOpt.isPresent()) {
            response.put("message", "Customer not found with phone number: " + phoneNumber);
            return List.of(response); 
        }

        Customers customer = customerOpt.get();

        // Tìm công việc theo jobId
        Job job = jobRepository.findById(jobId).orElse(null);
        if (job == null) {
            response.put("message", "Job not found");
            return List.of(response);
        }

        // Kiểm tra xem customer có phải là người đã tạo job này hay không
        if (!job.getCustomer().getId().equals(customer.getId())) {
            response.put("message", "You are not authorized to view applications for this job");
            return List.of(response);
        }

        // Lấy danh sách các ứng viên có trạng thái "Pending"
        List<JobApplication> jobApplications = jobApplicationRepository.findByJobAndStatus(job, "Pending");
        if (jobApplications.isEmpty()) {
            response.put("message", "No applications found for this job");
            return List.of(response);
        }

        // Chuyển các ứng viên thành thông tin cần thiết
        return jobApplications.stream().map(application -> {
            Employee cleaner = application.getCleaner();
            Map<String, Object> cleanerInfo = new HashMap<>();
            cleanerInfo.put("cleanerId", cleaner.getId());
            cleanerInfo.put("cleanerName", cleaner.getName());
            cleanerInfo.put("profileImage", cleaner.getProfile_image());
            return cleanerInfo;
        }).collect(Collectors.toList());
    }




    // accept hoặc reject cleaner
    public Map<String, Object> acceptOrRejectApplication(Long jobId, Long cleanerId, Long customerId, String action) {
        Map<String, Object> response = new HashMap<>();

        // Tìm customer theo customerId để xác thực quyền của customer
        Optional<Customers> customerOpt = customerRepo.findById(customerId);
        if (!customerOpt.isPresent()) {
            response.put("message", "Customer not found with customerId: " + customerId);
            return response;
        }

        Customers customer = customerOpt.get();

        // Tìm công việc theo jobId
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            return response;
        }

        Job job = jobOpt.get();

        System.out.println(job.getCustomer().getId());
        System.out.println(job.getCustomer().getId());
        if (job.getCustomer().getId().longValue() != customer.getId().longValue()) {
            response.put("message", "You are not authorized to accept or reject this job");
            return response;
        }


        // Tìm cleaner theo cleanerId
        Optional<Employee> cleanerOpt = cleanerRepository.findById(cleanerId);
        if (!cleanerOpt.isPresent()) {
            response.put("message", "Cleaner not found with ID: " + cleanerId);
            return response;
        }

        Employee cleaner = cleanerOpt.get();

        // Tìm job application của cleaner cho job này
        Optional<JobApplication> jobApplicationOpt = jobApplicationRepository.findByJobAndCleaner(job, cleaner);
        if (!jobApplicationOpt.isPresent()) {
            response.put("message", "Application not found for this job and cleaner");
            return response;
        }

        JobApplication jobApplication = jobApplicationOpt.get();

        // Xử lý accept hoặc reject
        if ("accept".equalsIgnoreCase(action)) {
            // Nếu chọn accept, từ chối tất cả các ứng viên khác
            List<JobApplication> otherApplications = jobApplicationRepository.findByJob(job);
            for (JobApplication app : otherApplications) {
                if (!app.getCleaner().getId().equals(cleaner.getId())) {
                    app.setStatus("Rejected");
                    jobApplicationRepository.save(app);
                }
            }

            jobApplication.setStatus("Accepted");
            job.setStatus(JobStatus.IN_PROGRESS);
            response.put("message", "Cleaner has been accepted for the job");
        } else if ("reject".equalsIgnoreCase(action)) {
            jobApplication.setStatus("Rejected");
            response.put("message", "Cleaner has been rejected for the job");
        } else {
            response.put("message", "Invalid action. Use 'accept' or 'reject'");
            return response;
        }

        // Lưu các thay đổi vào cơ sở dữ liệu
        jobApplicationRepository.save(jobApplication);
        jobRepository.save(job);

        response.put("jobId", jobId);
        response.put("cleanerId", cleaner.getId());
        response.put("status", jobApplication.getStatus());

        return response;
    }





    
 // Cập nhật trạng thái công việc sang "ARRIVED"
    public Map<String, Object> updateJobStatusToArrived(Long jobId) {
        Map<String, Object> response = new HashMap<>();

        // Lấy phone từ JWT hoặc SecurityContext (sử dụng phone_number từ token)
        String phoneNumber = SecurityContextHolder.getContext().getAuthentication().getName(); // Lấy phone number từ SecurityContext
        System.out.println("phone = " + phoneNumber);

        // Tìm cleaner theo phone number
        Optional<Employee> cleanerOpt = cleanerRepository.findByPhone(phoneNumber);
        if (!cleanerOpt.isPresent()) {
            response.put("message", "Cleaner not found with phone number: " + phoneNumber);
            return response;
        }

        Employee cleaner = cleanerOpt.get();

        // Tìm công việc theo jobId
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            return response;
        }

        Job job = jobOpt.get();

        // Kiểm tra xem cleaner có quyền cập nhật trạng thái không
        JobApplication jobApplication = jobApplicationRepository.findByJobIdAndStatus(jobId, "Accepted");
        if (jobApplication == null || !jobApplication.getCleaner().getId().equals(cleaner.getId())) {
            response.put("message", "You are not authorized to update this job status");
            return response;
        }

        if (!job.getStatus().equals(JobStatus.IN_PROGRESS)) {
            response.put("message", "Job is not in progress");
            return response;
        }

        // Cập nhật trạng thái công việc sang "ARRIVED"
        job.setStatus(JobStatus.ARRIVED);
        jobRepository.save(job);

        response.put("message", "Job status updated to ARRIVED");
        return response;
    }



    // Cập nhật trạng thái công việc sang "COMPLETED"
    public Map<String, Object> updateJobStatusToCompleted(Long jobId) {
        Map<String, Object> response = new HashMap<>();

        // Lấy phone từ JWT hoặc SecurityContext (sử dụng phone_number từ token)
        String phoneNumber = SecurityContextHolder.getContext().getAuthentication().getName(); // Lấy phone number từ SecurityContext
        System.out.println("phone = " + phoneNumber);

        // Tìm cleaner theo phone number
        Optional<Employee> cleanerOpt = cleanerRepository.findByPhone(phoneNumber);
        if (!cleanerOpt.isPresent()) {
            response.put("message", "Cleaner not found with phone number: " + phoneNumber);
            return response;
        }

        Employee cleaner = cleanerOpt.get();

        // Tìm công việc theo jobId
        Optional<Job> jobOpt = jobRepository.findById(jobId);
        if (!jobOpt.isPresent()) {
            response.put("message", "Job not found");
            return response;
        }

        Job job = jobOpt.get();

        // Kiểm tra quyền của cleaner (sử dụng cleanerId từ SecurityContext)
        Optional<JobApplication> jobApplicationOpt = jobApplicationRepository.findByJobAndCleaner(job, cleaner);
        if (!jobApplicationOpt.isPresent() || !jobApplicationOpt.get().getStatus().equals("Accepted")) {
            response.put("message", "You are not authorized to update this job status");
            return response;
        }

        // Kiểm tra trạng thái của công việc
        if (!job.getStatus().equals(JobStatus.STARTED)) {
            response.put("message", "Job is not in 'STARTED' state");
            return response;
        }

        // Cập nhật trạng thái công việc sang "COMPLETED"
        job.setStatus(JobStatus.COMPLETED);
        jobRepository.save(job);

        response.put("message", "Job status updated to COMPLETED");
        return response;
    }



}



