package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.BookJobRequest;
import com.example.homecleanapi.dtos.JobSummaryDTO;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.CustomerAddresses;
import com.example.homecleanapi.models.Customers;
import com.example.homecleanapi.models.Employee;
import com.example.homecleanapi.models.Feedback;
import com.example.homecleanapi.models.Job;
import com.example.homecleanapi.models.JobApplication;
import com.example.homecleanapi.models.JobDetails;
import com.example.homecleanapi.models.JobServiceDetail;
import com.example.homecleanapi.models.ServiceDetail;
import com.example.homecleanapi.models.Services;
import com.example.homecleanapi.repositories.CleanerRepository;
import com.example.homecleanapi.repositories.CustomerAddressRepository;
import com.example.homecleanapi.repositories.CustomerRepo;

import com.example.homecleanapi.repositories.FeedbackRepository;
import com.example.homecleanapi.repositories.JobApplicationRepository;
import com.example.homecleanapi.repositories.JobDetailsRepository;
import com.example.homecleanapi.repositories.JobRepository;
import com.example.homecleanapi.repositories.JobServiceDetailRepository;
import com.example.homecleanapi.repositories.ServiceDetailRepository;
import com.example.homecleanapi.repositories.ServiceRepository;
import com.example.homecleanapi.utils.UserStatusWebSocketHandler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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

	@Autowired
	private FeedbackRepository feedbackRepository;

	@Autowired
	private CustomerAddressRepository customerAddressRepository;

	@Autowired
	private ServiceRepository serviceRepository;

	@Autowired
	private JobDetailsRepository jobDetailsRepository;
	
	@Autowired
	private JobServiceDetailRepository jobServiceDetailRepository;
	
	
	

	// Lấy danh sách các công việc đang mở
	public List<JobSummaryDTO> getOpenJobs() {
	    // Lấy tất cả các Job có trạng thái OPEN
	    List<Job> openJobs = jobRepository.findByStatus(JobStatus.OPEN);

	    // Lấy các JobServiceDetail cho các Job này
	    List<JobServiceDetail> jobServiceDetails = jobServiceDetailRepository.findByJobIdIn(openJobs.stream()
	            .map(Job::getId)
	            .collect(Collectors.toList()));

	    // Tạo danh sách JobSummaryDTO từ thông tin đã lấy
	    return openJobs.stream()
	            .map(job -> {
	                // Lấy tên dịch vụ cho từng công việc từ bảng job_service_detail
	                List<String> serviceNames = jobServiceDetails.stream()
	                        .filter(jobServiceDetail -> jobServiceDetail.getJob().getId().equals(job.getId()))
	                        .map(jobServiceDetail -> jobServiceDetail.getService().getName())
	                        .collect(Collectors.toList());

	                // Nếu không có dịch vụ thì trả về "N/A"
	                String serviceName = serviceNames.isEmpty() ? "N/A" : String.join(", ", serviceNames);

	                // Trả về đối tượng JobSummaryDTO
	                return new JobSummaryDTO(
	                        job.getId(),
	                        serviceName,
	                        job.getTotalPrice(),
	                        job.getScheduledTime()
	                );
	            })
	            .collect(Collectors.toList());
	}


	// Lấy chi tiết công việc
	public Map<String, Object> getJobDetails(Long jobId) {
	    Map<String, Object> jobDetails = new HashMap<>();

	    // Tìm job theo jobId
	    Job job = jobRepository.findById(jobId).orElse(null);
	    if (job != null) {
	        // Thêm thông tin về job
	        jobDetails.put("jobId", job.getId());
	        jobDetails.put("status", job.getStatus());
	        jobDetails.put("totalPrice", job.getTotalPrice());
	        jobDetails.put("scheduledTime", job.getScheduledTime());

	        // Lấy tất cả các JobServiceDetail cho job này
	        List<JobServiceDetail> jobServiceDetails = jobServiceDetailRepository.findByJobId(jobId);
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
	                        serviceInfo.put("price", serviceDetail.getPrice());
	                        serviceInfo.put("additionalPrice", serviceDetail.getAdditionalPrice());
	                        serviceInfo.put("areaRange", serviceDetail.getAreaRange());
	                        serviceInfo.put("description", serviceDetail.getDescription());
	                        serviceInfo.put("discounts", serviceDetail.getDiscounts());
	                    }
	                    
	                    serviceList.add(serviceInfo);
	                }
	            }

	            // Thêm thông tin dịch vụ vào jobDetails
	            jobDetails.put("services", serviceList);
	        }

	        // Thêm thông tin về customer đã book job
	        Customers customer = job.getCustomer();
	        if (customer != null) {
	            jobDetails.put("customerId", customer.getId());
	            jobDetails.put("customerName", customer.getFull_name());
	            jobDetails.put("customerPhone", customer.getPhone());
	        }

	        // Thêm thông tin về địa chỉ của customer
	        CustomerAddresses customerAddress = job.getCustomerAddress();
	        if (customerAddress != null) {
	            jobDetails.put("customerAddressId", customerAddress.getId());
	            jobDetails.put("customerAddress", customerAddress.getAddress());
	            jobDetails.put("latitude", customerAddress.getLatitude());
	            jobDetails.put("longitude", customerAddress.getLongitude());
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
	public List<Map<String, Object>> getApplicationsForJob(Long jobId, Long customerId) {
	    Map<String, Object> response = new HashMap<>();
	    
	    // Tìm customer theo customerId
	    Optional<Customers> customerOpt = customerRepo.findById(customerId);
	    if (!customerOpt.isPresent()) {
	        response.put("message", "Customer not found with customerId: " + customerId);
	        return List.of(response);
	    }

	    Customers customer = customerOpt.get();

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
		String phoneNumber = SecurityContextHolder.getContext().getAuthentication().getName(); 
																								
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
		String phoneNumber = SecurityContextHolder.getContext().getAuthentication().getName(); // Lấy phone number từ
																								// SecurityContext
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

	public List<Map<String, Object>> getAppliedJobsForCleaner(Long cleanerId) {
	    List<Map<String, Object>> appliedJobs = new ArrayList<>();

	    // Lấy tất cả các JobApplication mà cleaner đã ứng tuyển
	    List<JobApplication> jobApplications = jobApplicationRepository.findByCleanerId(cleanerId);

	    for (JobApplication jobApplication : jobApplications) {
	        Job job = jobApplication.getJob();
	        Map<String, Object> jobInfo = new HashMap<>();

	        jobInfo.put("jobId", job.getId());
	        jobInfo.put("status", job.getStatus());
	        jobInfo.put("scheduledTime", job.getScheduledTime());
	        jobInfo.put("totalPrice", job.getTotalPrice());

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
	                        serviceInfo.put("price", serviceDetail.getPrice());
	                        serviceInfo.put("additionalPrice", serviceDetail.getAdditionalPrice());
	                        serviceInfo.put("areaRange", serviceDetail.getAreaRange());
	                        serviceInfo.put("description", serviceDetail.getDescription());
	                        serviceInfo.put("discounts", serviceDetail.getDiscounts());
	                    }
	                    
	                    serviceList.add(serviceInfo);
	                }
	            }

	            // Thêm thông tin dịch vụ vào jobInfo
	            jobInfo.put("services", serviceList);
	        }

	        appliedJobs.add(jobInfo);
	    }

	    return appliedJobs;
	}


	// LUỒNG CODE 2

//	public List<Map<String, Object>> getOnlineCleaners() {
//		List<Employee> onlineCleaners = cleanerRepository.findByStatus(true);
//
//		List<Map<String, Object>> cleanerList = new ArrayList<>();
//
//		for (Employee cleaner : onlineCleaners) {
//			Map<String, Object> cleanerInfo = new HashMap<>();
//			cleanerInfo.put("cleanerId", cleaner.getId());
//			cleanerInfo.put("cleanerName", cleaner.getName());
//			cleanerInfo.put("profileImage", cleaner.getProfile_image());
//			cleanerList.add(cleanerInfo);
//		}
//
//		return cleanerList;
//	}
	
	public List<Map<String, Object>> getOnlineCleaners() {
	    return UserStatusWebSocketHandler.getOnlineCleaners().values().stream()
	            .map(cleanerSessionInfo -> {
	                Map<String, Object> cleanerInfo = Map.of(
	                        "cleanerId", cleanerSessionInfo.getCleanerId(),
	                        "cleanerName", cleanerSessionInfo.getCleanerName(),
	                        "profileImage", cleanerSessionInfo.getProfileImage()
	                );
	                return cleanerInfo;
	            })
	            .collect(Collectors.toList());
	}

	
	// xem detail cleaner không cần đk 
	public Map<String, Object> getCleanerDetailnone(Long cleanerId) {
	    // Tìm cleaner theo cleanerId
	    Optional<Employee> cleanerOpt = cleanerRepository.findById(cleanerId);
	    if (!cleanerOpt.isPresent()) {
	        return Map.of("message", "Cleaner not found");
	    }

	    Employee cleaner = cleanerOpt.get();

	    // Tạo map chứa thông tin của cleaner
	    Map<String, Object> cleanerInfo = new HashMap<>();
	    cleanerInfo.put("cleanerId", cleaner.getId());
	    cleanerInfo.put("cleanerName", cleaner.getName());
	    cleanerInfo.put("profileImage", cleaner.getProfile_image());

	    // Lấy tất cả các Job mà cleaner đã làm từ JobApplication
	    List<JobApplication> jobApplications = jobApplicationRepository.findByCleanerId(cleanerId);
	    if (jobApplications.isEmpty()) {
	        cleanerInfo.put("feedbacks", "No feedback yet");
	        cleanerInfo.put("averageRating", 0);
	        return cleanerInfo;
	    }

	    // Lấy tất cả feedbacks từ các job mà cleaner đã làm
	    List<Map<String, Object>> feedbackList = new ArrayList<>();
	    int totalRating = 0;
	    int feedbackCount = 0;

	    for (JobApplication jobApplication : jobApplications) {
	        Job job = jobApplication.getJob();  // Lấy Job từ JobApplication

	        // Lấy feedbacks cho Job này
	        List<Feedback> feedbacks = feedbackRepository.findByJobId(job.getId());
	        for (Feedback feedback : feedbacks) {
	            Map<String, Object> feedbackInfo = new HashMap<>();
	            feedbackInfo.put("rating", feedback.getRating());
	            feedbackInfo.put("comment", feedback.getComment());
	            feedbackList.add(feedbackInfo);

	            totalRating += feedback.getRating();  // Cộng dồn rating
	            feedbackCount++;
	        }
	    }

	    // Tính trung bình rating nếu có feedback
	    double averageRating = feedbackCount > 0 ? (double) totalRating / feedbackCount : 0;

	    cleanerInfo.put("averageRating", averageRating);  // Thêm trung bình rating vào thông tin cleaner
	    cleanerInfo.put("feedbacks", feedbackList);  // Thêm danh sách feedbacks vào thông tin cleaner

	    return cleanerInfo;
	}




	public Map<String, Object> getCleanerDetails(Long cleanerId) {
		// Tìm cleaner theo cleanerId
		Optional<Employee> cleanerOpt = cleanerRepository.findById(cleanerId);
		if (!cleanerOpt.isPresent()) {
			return Map.of("message", "Cleaner not found");
		}

		Employee cleaner = cleanerOpt.get();

		// Kiểm tra nếu cleaner đang online
		if (!cleaner.getStatus()) {
			return Map.of("message", "Cleaner is not online");
		}

		Map<String, Object> cleanerInfo = new HashMap<>();
		cleanerInfo.put("cleanerId", cleaner.getId());
		cleanerInfo.put("cleanerName", cleaner.getName());
		cleanerInfo.put("profileImage", cleaner.getProfile_image());

		// Lấy feedback cho cleaner
		List<Feedback> feedbacks = feedbackRepository.findByJobId(cleaner.getId());
		if (!feedbacks.isEmpty()) {
			List<Map<String, Object>> feedbackList = new ArrayList<>();
			for (Feedback feedback : feedbacks) {
				Map<String, Object> feedbackInfo = new HashMap<>();
				feedbackInfo.put("rating", feedback.getRating());
				feedbackInfo.put("comment", feedback.getComment());
				feedbackList.add(feedbackInfo);
			}
			cleanerInfo.put("feedbacks", feedbackList);
		} else {
			cleanerInfo.put("feedbacks", "No feedback yet");
		}

		return cleanerInfo;
	}

	// customer book job cleaner online
//	public Map<String, Object> bookJobForCleaner(@RequestParam Long customerId, Long cleanerId,
//			BookJobRequest request) {
//		Map<String, Object> response = new HashMap<>();
//
//		// Lấy customer thông qua customerId
//		Optional<Customers> customerOpt = customerRepo.findById(customerId);
//		if (!customerOpt.isPresent()) {
//			response.put("message", "Customer not found with customerId: " + customerId);
//			return response;
//		}
//
//		Customers customer = customerOpt.get();
//
//		// Tìm địa chỉ của customer
//		Optional<CustomerAddresses> customerAddressOpt = customerAddressRepository
//				.findById(request.getCustomerAddressId());
//		if (!customerAddressOpt.isPresent()) {
//			response.put("message", "Customer address not found");
//			return response;
//		}
//		CustomerAddresses customerAddress = customerAddressOpt.get();
//
//		// Tạo mới job
//		Job job = new Job();
//
//		// Kiểm tra Service
//		Optional<Services> serviceOpt = serviceRepository.findById(request.getServiceId());
//		if (!serviceOpt.isPresent()) {
//			response.put("message", "Service not found");
//			return response;
//		}
//		Services service = serviceOpt.get();
//
//		// Kiểm tra Service Detail
//		Optional<ServiceDetail> serviceDetailOpt = serviceDetailRepository.findById(request.getServiceDetailId());
//		if (!serviceDetailOpt.isPresent()) {
//			response.put("message", "Service Detail not found");
//			return response;
//		}
//		ServiceDetail serviceDetail = serviceDetailOpt.get();
//
//		// Gán thông tin cho Job
//		job.setService(service);
//		job.setServiceDetail(serviceDetail);
//
//		// Chuyển jobTime từ String sang LocalDateTime
//		try {
//			DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
//			LocalDateTime jobTime = LocalDateTime.parse(request.getJobTime(), formatter);
//			job.setScheduledTime(jobTime);
//		} catch (Exception e) {
//			response.put("message", "Invalid job time format");
//			return response;
//		}
//
//		job.setCustomerAddress(customerAddress);
//		job.setStatus(JobStatus.BOOKED); // Đặt trạng thái job là BOOKED
//		job.setCustomer(customer);
//
//		// Gán cleaner cho job
//		Optional<Employee> cleanerOpt = cleanerRepository.findById(cleanerId);
//		if (!cleanerOpt.isPresent()) {
//			response.put("message", "Cleaner not found with cleanerId: " + cleanerId);
//			return response;
//		}
//		Employee cleaner = cleanerOpt.get();
//		job.setCleaner(cleaner);
//
//		// Kiểm tra xem cleaner đã có lịch trùng thời gian không
//		List<Job> existingJobs = jobRepository.findByCleanerIdAndScheduledTimeBetween(cleanerId,
//				job.getScheduledTime().minusHours(2), job.getScheduledTime().plusHours(2));
//
//		if (!existingJobs.isEmpty()) {
//			response.put("message", "Cleaner has overlapping schedule or time gap between jobs is less than 2 hours.");
//			return response;
//		}
//
//		// Tính toán giá dịch vụ
//		double serviceDetailPrice = serviceDetail.getPrice();
//		double additionalPrice = serviceDetail.getAdditionalPrice();
//		double finalPrice = serviceDetailPrice + additionalPrice;
//
//		// Kiểm tra giờ cao điểm và giảm giá
//		double peakTimeFee = 0;
//		double discount = 0;
//
//		DayOfWeek dayOfWeek = job.getScheduledTime().getDayOfWeek();
//		if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
//			peakTimeFee = 0.1 * finalPrice;
//		}
//
//		if (job.getScheduledTime().getHour() >= 18 && job.getScheduledTime().getHour() <= 22) {
//			peakTimeFee += 0.2 * finalPrice;
//		}
//
//		finalPrice += peakTimeFee;
//
//		if (serviceDetail.getDiscounts() != null && !serviceDetail.getDiscounts().isEmpty()) {
//			discount = 0.05 * finalPrice;
//			finalPrice -= discount;
//		}
//
//		job.setTotalPrice(finalPrice);
//
//		// Tạo JobDetails mới và liên kết với Job
//		JobDetails jobDetails = new JobDetails();
//		jobDetails.setImageUrl(request.getImageUrl());
//		jobDetails.setJob(job);
//
//		// Lưu Job vào cơ sở dữ liệu
//		jobRepository.save(job);
//		jobDetailsRepository.save(jobDetails);
//
//		// Tạo JobApplication để theo dõi status của job
//		JobApplication jobApplication = new JobApplication();
//		jobApplication.setJob(job);
//		jobApplication.setCleaner(cleaner);
//		jobApplication.setStatus("Pending"); // Trạng thái Pending khi job đã được đặt
//
//		// Lưu vào bảng JobApplication
//		jobApplicationRepository.save(jobApplication);
//
//		response.put("message", "Job booked successfully");
//		response.put("jobId", job.getId());
//		response.put("status", job.getStatus());
//		response.put("finalPrice", finalPrice);
//
//		return response;
//	}

	public List<Map<String, Object>> getJobsBookedForCleaner(@RequestParam Long cleanerId) {
	    List<Map<String, Object>> responseList = new ArrayList<>();

	    // Tìm cleaner theo cleanerId
	    Optional<Employee> cleanerOpt = cleanerRepository.findById(cleanerId);
	    if (!cleanerOpt.isPresent()) {
	        responseList.add(Map.of("message", "Cleaner not found with cleanerId: " + cleanerId));
	        return responseList;
	    }

	    Employee cleaner = cleanerOpt.get();

	    // Tìm tất cả các job mà cleaner đã được gán
	    List<Job> jobs = jobRepository.findByCleanerId(cleanerId);
	    if (jobs.isEmpty()) {
	        responseList.add(Map.of("message", "No jobs found for cleaner with cleanerId: " + cleanerId));
	        return responseList;
	    }

	    // Lấy thông tin các job mà cleaner được book
	    for (Job job : jobs) {
	        Map<String, Object> jobInfo = new HashMap<>();

	        // Thêm thông tin về job
	        jobInfo.put("jobId", job.getId());
	        jobInfo.put("status", job.getStatus());
	        jobInfo.put("scheduledTime", job.getScheduledTime());

	        // Thêm thông tin về customer
	        Customers customer = job.getCustomer();
	        jobInfo.put("customerId", customer.getId());
	        jobInfo.put("customerName", customer.getFull_name());
	        jobInfo.put("customerPhone", customer.getPhone());

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
	                    
	                    // Lấy thông tin chi tiết dịch vụ
	                    ServiceDetail serviceDetail = jobServiceDetail.getServiceDetail();
	                    if (serviceDetail != null) {
	                        serviceInfo.put("serviceDetailName", serviceDetail.getName());
	                    }
	                    
	                    serviceList.add(serviceInfo);
	                }
	            }

	            // Thêm thông tin dịch vụ vào jobInfo
	            jobInfo.put("services", serviceList);
	        }

	        responseList.add(jobInfo);
	    }

	    return responseList;
	}


	public Map<String, Object> acceptOrRejectJob(Long jobId, String action) {
		Map<String, Object> response = new HashMap<>();

		// Lấy thông tin cleaner từ SecurityContext
		String phoneNumber = SecurityContextHolder.getContext().getAuthentication().getName();
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

		// Kiểm tra nếu công việc đã được giao cho cleaner
		Optional<JobApplication> jobApplicationOpt = jobApplicationRepository.findByJobAndCleaner(job, cleaner);
		if (!jobApplicationOpt.isPresent()) {
			response.put("message", "This job has not been assigned to you");
			return response;
		}
		JobApplication jobApplication = jobApplicationOpt.get();

		// Kiểm tra trạng thái của job application trước khi chấp nhận hoặc từ chối
		if (jobApplication.getStatus().equals("Accepted") || jobApplication.getStatus().equals("Rejected")) {
			response.put("message", "You have already accepted or rejected this job");
			return response;
		}

		// Xử lý chấp nhận hoặc từ chối
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
			job.setStatus(JobStatus.IN_PROGRESS); // Đặt trạng thái công việc là "IN_PROGRESS"
			response.put("message", "Job has been accepted");
		} else if ("reject".equalsIgnoreCase(action)) {
			jobApplication.setStatus("Rejected");
			response.put("message", "Job has been rejected");
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

}
