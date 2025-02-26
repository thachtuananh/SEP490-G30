package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.JobSummaryDTO;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.models.JobApplication;

import com.example.homecleanapi.repositories.CleanerRepository;
import com.example.homecleanapi.repositories.CustomerRepo;
import com.example.homecleanapi.repositories.CustomerRepository;
import com.example.homecleanapi.repositories.JobApplicationRepository;
import com.example.homecleanapi.repositories.JobRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


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
            jobDetails.put("jobId", job.getId());
            jobDetails.put("status", job.getStatus());
            jobDetails.put("totalPrice", job.getTotalPrice());
            jobDetails.put("scheduledTime", job.getScheduledTime());
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
        // Tìm công việc theo jobId
        Job job = jobRepository.findById(jobId).orElse(null);
        if (job == null) {
            return List.of(Map.of("message", "Job not found"));
        }
        

        // Kiểm tra xem customer có quyền xem danh sách ứng viên không
//        if (job.getCustomer().getId().longValue() != customerId.longValue()) {
//            return List.of(Map.of("message", "You are not authorized to view applications for this job"));
//        }


        // Lấy danh sách các ứng viên đã apply cho job này với trạng thái "Pending"
        List<JobApplication> jobApplications = jobApplicationRepository.findByJobAndStatus(job, "Pending");
        if (jobApplications.isEmpty()) {
            return List.of(Map.of("message", "No applications found for this job"));
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
    public Map<String, Object> acceptOrRejectApplication(Long jobId, Long cleanerId, String action) {
        Map<String, Object> response = new HashMap<>();


        String phoneNumber = SecurityContextHolder.getContext().getAuthentication().getName(); 
        System.out.println("phone = " + phoneNumber);

        // Tìm customer theo phone number để xác thực quyền của customer
        Optional<Customers> customerOpt = customerRepo.findByPhone(phoneNumber);

        if (!customerOpt.isPresent()) {
            response.put("message", "Customer not found with phone number: " + phoneNumber);
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

        // Kiểm tra quyền của customer (customer phải là người đã tạo job này)
        if (!job.getCustomer().getId().equals(customer.getId())) {
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



