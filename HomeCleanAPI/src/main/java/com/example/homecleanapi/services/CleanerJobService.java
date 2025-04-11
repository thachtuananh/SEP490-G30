package com.example.homecleanapi.services;

import com.example.homecleanapi.dtos.BookJobRequest;
import com.example.homecleanapi.dtos.BookJobRequest.ServiceRequest;
import com.example.homecleanapi.dtos.JobSummaryDTO;
import com.example.homecleanapi.enums.JobStatus;
import com.example.homecleanapi.models.*;
import com.example.homecleanapi.repositories.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.text.DecimalFormat;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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
	
	@Autowired
    private WalletRepository walletRepository;

	@Autowired
	private EmployeeAddressRepository employeeAddressRepository;





	// Lấy danh sách các công việc đang mở
//	public List<JobSummaryDTO> getOpenJobs(Long cleanerId) {
//		// Lấy tất cả các Job có trạng thái OPEN
//		List<Job> openJobs = jobRepository.findByStatus(JobStatus.OPEN);
//
//		// Lấy tất cả các jobId đã có ứng viên (cleaner) cho cleanerId
//		List<Long> appliedJobIds = jobApplicationRepository.findByCleanerIdAndStatus(cleanerId, "Pending").stream()
//				.map(jobApplication -> jobApplication.getJob().getId()).collect(Collectors.toList());
//
//		// Lọc ra các công việc mà cleaner này chưa ứng tuyển
//		List<Job> jobsWithoutCleaner = openJobs.stream().filter(job -> !appliedJobIds.contains(job.getId()))
//				.collect(Collectors.toList());
//
//		List<JobServiceDetail> jobServiceDetails = jobServiceDetailRepository
//				.findByJobIdIn(jobsWithoutCleaner.stream().map(Job::getId).collect(Collectors.toList()));
//
//		return jobsWithoutCleaner.stream().map(job -> {
//			List<String> serviceNames = jobServiceDetails.stream()
//					.filter(jobServiceDetail -> jobServiceDetail.getJob().getId().equals(job.getId()))
//					.map(jobServiceDetail -> jobServiceDetail.getService().getName()).collect(Collectors.toList());
//
//			String serviceName = serviceNames.isEmpty() ? "N/A" : String.join(", ", serviceNames);
//
//			return new JobSummaryDTO(job.getId(), serviceName, job.getTotalPrice(), job.getScheduledTime());
//		}).collect(Collectors.toList());
//	}

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

			// Thêm thông tin orderCode của job
			if (job.getOrderCode() != null) {
				jobDetails.put("orderCode", job.getOrderCode());
			}

			if (job.getReminder() != null) {
				jobDetails.put("reminder", job.getReminder());
			}

			List<JobServiceDetail> jobServiceDetails = jobServiceDetailRepository.findByJobId(jobId);
			if (jobServiceDetails != null && !jobServiceDetails.isEmpty()) {
				List<Map<String, Object>> serviceList = new ArrayList<>();

				for (JobServiceDetail jobServiceDetail : jobServiceDetails) {
					Services service = jobServiceDetail.getService();
					if (service != null) {
						Map<String, Object> serviceInfo = new HashMap<>();
						serviceInfo.put("serviceName", service.getName());
						serviceInfo.put("serviceDescription", service.getDescription());

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

		// Kiểm tra phương thức thanh toán của job
//		if (job.getPaymentMethod().trim().equalsIgnoreCase("Cash")) {
//			// Kiểm tra ví của cleaner để kiểm tra số dư trước khi ứng tuyển
//			Optional<Wallet> walletOpt = walletRepository.findByCleanerId(cleaner.getId());
//			if (!walletOpt.isPresent()) {
//				response.put("message", "Cleaner wallet not found");
//				return response;
//			}
//			Wallet wallet = walletOpt.get();
//
//			// Tính hoa hồng (20% của tổng giá trị đơn hàng)
//			double commission = 0.2 * job.getTotalPrice();
//
//			// Kiểm tra số dư ví của cleaner có đủ để trừ hoa hồng không
//			if (wallet.getBalance() - commission < -200000) {
//				response.put("message", "Your balance is not sufficient. You can only owe up to 200,000 VND.");
//				return response;  // Return immediately to prevent job application creation
//			}
//		}

		// Tạo job application và lưu vào database
		JobApplication jobApplication = new JobApplication();
		jobApplication.setJob(job);
		jobApplication.setCleaner(cleaner);
		jobApplication.setStatus("Pending");

		jobApplicationRepository.save(jobApplication);

		// Thêm thông báo thành công khi không có lỗi
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
		if (!job.getStatus().equals(JobStatus.ARRIVED)) {
			response.put("message", "Job is not in 'IN_PROGRESS' state");
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

			// Thêm các thông tin chi tiết của job vào jobInfo
			jobInfo.put("jobId", job.getId());
			jobInfo.put("status", job.getStatus());
			jobInfo.put("scheduledTime", job.getScheduledTime());
			jobInfo.put("totalPrice", job.getTotalPrice());


			// Thêm thông tin về customer đã book job
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
			System.out.println("JobServiceDetails for jobId " + job.getId() + ": " + jobServiceDetails);

			if (jobServiceDetails != null && !jobServiceDetails.isEmpty()) {
				List<Map<String, Object>> serviceList = new ArrayList<>();

				// Duyệt qua tất cả các dịch vụ trong bảng job_service_detail
				for (JobServiceDetail jobServiceDetail : jobServiceDetails) {
					Services service = jobServiceDetail.getService();
					if (service != null) {
						Map<String, Object> serviceInfo = new HashMap<>();
						serviceInfo.put("serviceName", service.getName()); // Lấy tên dịch vụ
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
			} else {
				jobInfo.put("services", "No services found for this job");
			}

			appliedJobs.add(jobInfo);
		}

		return appliedJobs;
	}

	// lọc lấy job đã làm xong
	public List<Map<String, Object>> getCompletedJobs(Long cleanerId) {
		List<Map<String, Object>> completedJobs = new ArrayList<>();

		// Lấy danh sách các JobApplication của cleaner có trạng thái 'ACCEPTED'
		List<JobApplication> jobApplications = jobApplicationRepository.findByCleanerIdAndStatus(cleanerId, "Accepted");

		// Kiểm tra nếu không có công việc nào đã được chấp nhận
		if (jobApplications.isEmpty()) {
			return completedJobs; // Trả về danh sách trống nếu không có công việc
		}

		// Duyệt qua từng JobApplication và lấy các Job có status là DONE
		for (JobApplication jobApplication : jobApplications) {
			Job job = jobApplication.getJob(); // Lấy Job từ JobApplication

			if (job.getStatus() == JobStatus.DONE) { // Kiểm tra nếu công việc có trạng thái DONE
				Map<String, Object> jobInfo = new HashMap<>();
				jobInfo.put("jobId", job.getId());
				jobInfo.put("scheduledTime", job.getScheduledTime());
				jobInfo.put("status", job.getStatus());
				jobInfo.put("totalPrice", job.getTotalPrice());

				// Thêm thông tin mã đơn hàng
				if (job.getOrderCode() != null) {
					jobInfo.put("orderCode", job.getOrderCode());
				}

				// Thêm thông tin về customer đã book job
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
				System.out.println("JobServiceDetails for jobId " + job.getId() + ": " + jobServiceDetails);

				// Nếu có dịch vụ, thêm vào jobInfo
				if (jobServiceDetails != null && !jobServiceDetails.isEmpty()) {
					List<Map<String, Object>> serviceList = new ArrayList<>();

					// Duyệt qua tất cả các dịch vụ trong bảng job_service_detail
					for (JobServiceDetail jobServiceDetail : jobServiceDetails) {
						Services service = jobServiceDetail.getService();
						if (service != null) {
							Map<String, Object> serviceInfo = new HashMap<>();
							serviceInfo.put("serviceName", service.getName()); // Lấy tên dịch vụ
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
				} else {
					// Nếu không có dịch vụ nào, thông báo không có dịch vụ
					jobInfo.put("services", "No services found for this job");
				}

				completedJobs.add(jobInfo); // Thêm thông tin job vào danh sách
			}
		}

		return completedJobs; // Trả về danh sách công việc đã hoàn thành
	}


	// ds job đang làm
	public List<Map<String, Object>> getInProgressJobs(Long cleanerId) {
		List<Map<String, Object>> inProgressJobs = new ArrayList<>();

		// Lấy danh sách các JobApplication của cleaner có trạng thái 'ACCEPTED'
		List<JobApplication> jobApplications = jobApplicationRepository.findByCleanerIdAndStatus(cleanerId, "Accepted");

		// Kiểm tra nếu không có công việc nào đã được chấp nhận
		if (jobApplications.isEmpty()) {
			return inProgressJobs; // Trả về danh sách trống nếu không có công việc
		}

		// Duyệt qua từng JobApplication và lấy các Job có trạng thái là IN_PROGRESS,
		// ARRIVED, STARTED, COMPLETED, BOOKED
		for (JobApplication jobApplication : jobApplications) {
			Job job = jobApplication.getJob(); // Lấy Job từ JobApplication

			// Kiểm tra nếu job có trạng thái là một trong các trạng thái cần thiết
			if (job.getStatus() == JobStatus.IN_PROGRESS || job.getStatus() == JobStatus.ARRIVED
					|| job.getStatus() == JobStatus.STARTED || job.getStatus() == JobStatus.COMPLETED
					|| job.getStatus() == JobStatus.BOOKED) {
				Map<String, Object> jobInfo = new HashMap<>();
				jobInfo.put("jobId", job.getId());
				jobInfo.put("scheduledTime", job.getScheduledTime());
				jobInfo.put("status", job.getStatus());
				jobInfo.put("totalPrice", job.getTotalPrice());

				// Thêm thông tin mã đơn hàng
				if (job.getOrderCode() != null) {
					jobInfo.put("orderCode", job.getOrderCode());
				}

				// Thêm thông tin về customer đã book job
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

				// Nếu có dịch vụ, thêm vào jobInfo
				if (jobServiceDetails != null && !jobServiceDetails.isEmpty()) {
					List<Map<String, Object>> serviceList = new ArrayList<>();

					// Duyệt qua tất cả các dịch vụ trong bảng job_service_detail
					for (JobServiceDetail jobServiceDetail : jobServiceDetails) {
						Services service = jobServiceDetail.getService();
						if (service != null) {
							Map<String, Object> serviceInfo = new HashMap<>();
							serviceInfo.put("serviceName", service.getName()); // Lấy tên dịch vụ
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
				} else {
					// Nếu không có dịch vụ nào, thông báo không có dịch vụ
					jobInfo.put("services", "No services found for this job");
				}

				inProgressJobs.add(jobInfo); // Thêm thông tin job vào danh sách
			}
		}

		return inProgressJobs; // Trả về danh sách các công việc đang làm
	}


	// ds job mà cleaner đã apply
	public List<Map<String, Object>> getAppliedJobsForCleaner2(Long cleanerId) {
	    List<Map<String, Object>> appliedJobs = new ArrayList<>();

	    // Lấy danh sách tất cả các JobApplication mà cleaner đã ứng tuyển và có trạng thái "PENDING"
	    List<JobApplication> jobApplications = jobApplicationRepository.findByCleanerIdAndStatus(cleanerId, "Pending");

	    // Kiểm tra nếu không có công việc nào đã ứng tuyển
	    if (jobApplications.isEmpty()) {
	        return appliedJobs; // Trả về danh sách trống nếu không có công việc
	    }

	    // Duyệt qua từng JobApplication và lấy thông tin chi tiết của Job
	    for (JobApplication jobApplication : jobApplications) {
	        Job job = jobApplication.getJob(); // Lấy Job từ JobApplication

	        // Chỉ lấy các job có trạng thái "OPEN"
	        if (!job.getStatus().equals(JobStatus.OPEN)) {
	            continue; // Bỏ qua job không có trạng thái "OPEN"
	        }

	        Map<String, Object> jobInfo = new HashMap<>();
	        jobInfo.put("jobId", job.getId());
	        jobInfo.put("status", job.getStatus());
	        jobInfo.put("scheduledTime", job.getScheduledTime());
	        jobInfo.put("totalPrice", job.getTotalPrice());


	        // Thêm thông tin về customer đã book job
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

	        // Nếu có dịch vụ, thêm vào jobInfo
	        if (jobServiceDetails != null && !jobServiceDetails.isEmpty()) {
	            List<Map<String, Object>> serviceList = new ArrayList<>();

	            // Duyệt qua tất cả các dịch vụ trong bảng job_service_detail
	            for (JobServiceDetail jobServiceDetail : jobServiceDetails) {
	                Services service = jobServiceDetail.getService();
	                if (service != null) {
	                    Map<String, Object> serviceInfo = new HashMap<>();
	                    serviceInfo.put("serviceName", service.getName()); // Lấy tên dịch vụ
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
	        } else {
	            // Nếu không có dịch vụ nào, thông báo không có dịch vụ
	            jobInfo.put("services", "No services found for this job");
	        }

	        appliedJobs.add(jobInfo); // Thêm thông tin job vào danh sách
	    }

	    return appliedJobs; // Trả về danh sách các công việc đã ứng tuyển
	}


	// list job theo service và số lượng
	public Map<String, Object> getJobsByService() {
		Map<String, Object> jobsByService = new HashMap<>();
		Map<String, Object> comboJobs = new HashMap<>(); // Dành cho các công việc combo (chỉ đếm số lượng)
		String comboKey = "combo"; // Sử dụng một ID duy nhất cho combo

		List<Services> services = serviceRepository.findAll(); // Lấy tất cả các dịch vụ

		Set<Long> countedJobIds = new HashSet<Long>(); // Set để theo dõi các job_id đã đếm

		// Duyệt qua tất cả các dịch vụ
		for (Services service : services) {
			String serviceName = service.getName(); // Lấy tên dịch vụ
			Long serviceId = service.getId(); // Lấy ID dịch vụ

			// Nếu dịch vụ chưa tồn tại trong danh sách, tạo mới
			if (!jobsByService.containsKey(serviceName)) {
				Map<String, Object> serviceInfo = new HashMap<>();
				serviceInfo.put("serviceId", serviceId); // Thêm serviceId vào service info
				serviceInfo.put("serviceName", serviceName);
				serviceInfo.put("jobCount", 0); // Bắt đầu đếm số lượng công việc
				jobsByService.put(serviceName, serviceInfo);
			}

			// Lấy tất cả các JobServiceDetail cho dịch vụ này
			List<JobServiceDetail> jobServiceDetailsForService = jobServiceDetailRepository
					.findByServiceId(service.getId());

			// Duyệt qua các JobServiceDetail liên kết với dịch vụ này
			for (JobServiceDetail jobServiceDetail : jobServiceDetailsForService) {
				Job job = jobServiceDetail.getJob();

				if (job != null && job.getStatus() == JobStatus.OPEN) { // Kiểm tra job có trạng thái OPEN
					// Kiểm tra nếu job chưa được đếm
					if (!countedJobIds.contains(job.getId())) {
						// Lấy thông tin dịch vụ từ Map jobsByService
						Map<String, Object> serviceInfo = (Map<String, Object>) jobsByService.get(serviceName);
						if (serviceInfo != null) {
							int jobCount = (int) serviceInfo.get("jobCount");
							serviceInfo.put("jobCount", jobCount + 1);
						} else {

							System.err.println("serviceInfo is null for service: " + serviceName);
						}


						// Kiểm tra nếu job có nhiều dịch vụ (tức là combo)
						List<JobServiceDetail> jobServiceDetailsForJob = jobServiceDetailRepository
								.findByJobId(job.getId());

						// Nếu job có nhiều dịch vụ thì đếm là combo
						if (jobServiceDetailsForJob.size() > 1) {
							// Nếu combo chưa được đếm
							if (!comboJobs.containsKey(comboKey)) {
								Map<String, Object> comboInfo = new HashMap<>();
								comboInfo.put("jobCount", 0);
								comboInfo.put("id", comboKey); // Sử dụng một ID duy nhất cho combo
								comboJobs.put(comboKey, comboInfo);
							}

							// Lấy thông tin combo và tăng số lượng combo
							Map<String, Object> comboInfo = (Map<String, Object>) comboJobs.get(comboKey);
							int comboCount = (int) comboInfo.get("jobCount");
							comboInfo.put("jobCount", comboCount + 1);
						} else {
							// Nếu job chỉ có một dịch vụ thì đếm vào dịch vụ
							int jobCount = (int) serviceInfo.get("jobCount");
							serviceInfo.put("jobCount", jobCount + 1);
						}

						// Đánh dấu job này đã được đếm
						countedJobIds.add(job.getId());
					}
				}
			}
		}

		// Kết hợp kết quả của comboJobs với jobsByService
//		jobsByService.put("combo", comboJobs.get(comboKey));
		// Đảm bảo combo luôn tồn tại trong map comboJobs
		if (!comboJobs.containsKey(comboKey)) {
			Map<String, Object> comboInfo = new HashMap<>();
			comboInfo.put("jobCount", 0);
			comboInfo.put("id", comboKey);
			comboJobs.put(comboKey, comboInfo);
		}

		jobsByService.put("combo", comboJobs.get(comboKey));


		// Đảm bảo nếu dịch vụ không có công việc nào thì hiển thị jobCount là 0
		for (String serviceName : jobsByService.keySet()) {
			Map<String, Object> serviceInfo = (Map<String, Object>) jobsByService.get(serviceName);
			if (serviceInfo != null) {
				int jobCount = (int) serviceInfo.getOrDefault("jobCount", 0);
				serviceInfo.put("jobCount", jobCount + 1);
			} else {
				System.err.println("⚠️ serviceInfo is null for service: " + serviceName);
			}

		}

		return jobsByService; // Trả về danh sách các công việc phân loại theo dịch vụ, bao gồm cả combo
	}

	// xem các job thuộc phần filter service
	public List<Map<String, Object>> getJobsDetailsByService(Long serviceId) {
		List<Map<String, Object>> jobDetailsList = new ArrayList<>();

		// Lấy danh sách các JobServiceDetail liên quan đến serviceId
		List<JobServiceDetail> jobServiceDetails = jobServiceDetailRepository.findByServiceId(serviceId);

		// Duyệt qua các JobServiceDetail để lấy chi tiết job
		for (JobServiceDetail jobServiceDetail : jobServiceDetails) {
			Job job = jobServiceDetail.getJob();
			if (job != null && job.getStatus() == JobStatus.OPEN) {
				Map<String, Object> jobInfo = new HashMap<>();
				jobInfo.put("jobId", job.getId());
				jobInfo.put("serviceName", jobServiceDetail.getService().getName());
				jobInfo.put("status", job.getStatus());
				jobInfo.put("scheduledTime", job.getScheduledTime());
				jobInfo.put("totalPrice", job.getTotalPrice());


				// Thêm thông tin về customer đã book job
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
				List<JobServiceDetail> jobServiceDetailsForJob = jobServiceDetailRepository.findByJobId(job.getId());
				List<Map<String, String>> services = new ArrayList<>();
				for (JobServiceDetail jobServiceDetailForJob : jobServiceDetailsForJob) {
					Map<String, String> serviceInfo = new HashMap<>();
					Services service = jobServiceDetailForJob.getService();
					serviceInfo.put("serviceName", service.getName());
					serviceInfo.put("serviceDescription", service.getDescription());
					services.add(serviceInfo);
				}

				jobInfo.put("services", services);
				jobDetailsList.add(jobInfo);
			}
		}

		return jobDetailsList;
	}

	// lấy cac job đang là combo
	public List<Map<String, Object>> getComboJobs() {
		List<Map<String, Object>> comboJobs = new ArrayList<>();

		// Lấy tất cả các JobServiceDetail
		List<JobServiceDetail> jobServiceDetails = jobServiceDetailRepository.findAll();

		// Set để theo dõi các job_id đã đếm
		Set<Long> countedJobIds = new HashSet<>();

		// Duyệt qua các JobServiceDetail để xác định các job combo
		for (JobServiceDetail jobServiceDetail : jobServiceDetails) {
			Job job = jobServiceDetail.getJob();
			if (job != null && job.getStatus() == JobStatus.OPEN) { // Kiểm tra job có trạng thái OPEN
				// Kiểm tra nếu job chưa được đếm
				if (!countedJobIds.contains(job.getId())) {
					// Lấy tất cả các JobServiceDetail liên quan đến job này
					List<JobServiceDetail> jobServiceDetailsForJob = jobServiceDetailRepository
							.findByJobId(job.getId());

					// Nếu job có nhiều dịch vụ, tính là combo
					if (jobServiceDetailsForJob.size() > 1) {
						Map<String, Object> jobInfo = new HashMap<>();
						jobInfo.put("jobId", job.getId());
						jobInfo.put("status", job.getStatus());
						jobInfo.put("scheduledTime", job.getScheduledTime());
						jobInfo.put("totalPrice", job.getTotalPrice());


						// Thêm thông tin về customer đã book job
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

						// Lấy tất cả các dịch vụ liên quan đến job này
						List<JobServiceDetail> jobServiceDetailsForCombo = jobServiceDetailRepository
								.findByJobId(job.getId());
						List<Map<String, String>> services = new ArrayList<>();
						for (JobServiceDetail jobServiceDetailForCombo : jobServiceDetailsForCombo) {
							Map<String, String> serviceInfo = new HashMap<>();
							Services service = jobServiceDetailForCombo.getService();
							serviceInfo.put("serviceName", service.getName());
							serviceInfo.put("serviceDescription", service.getDescription());
							services.add(serviceInfo);
						}

						jobInfo.put("services", services);
						comboJobs.add(jobInfo);
					}

					countedJobIds.add(job.getId()); // Đánh dấu job này đã được đếm
				}
			}
		}

		return comboJobs;
	}

	public boolean setCurrentAddress(Integer cleanerId, Integer addressId) {
		// Lấy tất cả các địa chỉ của cleaner
		List<EmployeeLocations> addresses = employeeAddressRepository.findByEmployeeId(cleanerId);

		// Nếu không có địa chỉ nào
		if (addresses.isEmpty()) {
			return false;
		}

		// Cập nhật trạng thái is_current của tất cả các địa chỉ thành false
		for (EmployeeLocations address : addresses) {
			address.setIs_current(false);
			employeeAddressRepository.save(address);
		}

		// Lấy địa chỉ cần set làm hiện tại
		EmployeeLocations defaultAddress = employeeAddressRepository.findById(addressId).orElse(null);
		if (defaultAddress != null) {
			defaultAddress.setIs_current(true); // Set trạng thái là true
			employeeAddressRepository.save(defaultAddress);  // Lưu thay đổi
			return true;  // Trả về true nếu cập nhật thành công
		}

		return false;  // Trả về false nếu không tìm thấy địa chỉ
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

//	public List<Map<String, Object>> getOnlineCleaners() {
//	    // Ghi log kiểm tra trạng thái onlineCleaners
//	    System.out.println("Online Cleaners Map: " + .getOnlineCleaners());
//
//	    return UserStatusWebSocketHandler.getOnlineCleaners().values().stream().map(cleanerSessionInfo -> {
//	        Map<String, Object> cleanerInfo = new HashMap<>();
//	        cleanerInfo.put("cleanerId", cleanerSessionInfo.getCleanerId());
//	        cleanerInfo.put("cleanerName", cleanerSessionInfo.getCleanerName());
//	        cleanerInfo.put("profileImage", cleanerSessionInfo.getProfileImage());
//	        cleanerInfo.put("status", true);
//
//	        return cleanerInfo;
//	    }).collect(Collectors.toList());
//	}



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
	        cleanerInfo.put("averageRating", 0); // Nếu không có công việc nào, trả về trung bình rating là 0
	        return cleanerInfo;
	    }

	    // Tính toán trung bình rating từ các feedbacks của các job mà cleaner đã làm
	    int totalRating = 0;
	    int feedbackCount = 0;

	    for (JobApplication jobApplication : jobApplications) {
	        Job job = jobApplication.getJob(); // Lấy Job từ JobApplication

	        // Lấy feedbacks cho Job này
	        List<Feedback> feedbacks = feedbackRepository.findByJobId(job.getId());
	        for (Feedback feedback : feedbacks) {
	            totalRating += feedback.getRating(); // Cộng dồn rating
	            feedbackCount++;
	        }
	    }

	    // Tính trung bình rating nếu có feedback
	    double averageRating = feedbackCount > 0 ? (double) totalRating / feedbackCount : 0;

	    // Định dạng trung bình rating chỉ với 1 chữ số sau dấu phẩy
	    DecimalFormat df = new DecimalFormat("#.#");
	    String formattedAverageRating = df.format(averageRating);

	    // Thêm thông tin vào map cleanerInfo
	    cleanerInfo.put("averageRating", formattedAverageRating); // Thêm trung bình rating vào thông tin cleaner

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
	public Map<String, Object> bookJobForCleaner(@RequestParam Long customerId, Long cleanerId, BookJobRequest request) {
	    Map<String, Object> response = new HashMap<>();

	    // Lấy customer thông qua customerId
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

	    // Chuyển jobTime từ String sang LocalDateTime
	    LocalDateTime jobTime = null;
	    try {
	        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
	        jobTime = LocalDateTime.parse(request.getJobTime(), formatter);
	    } catch (Exception e) {
	        response.put("message", "Invalid job time format");
	        return response;
	    }

	    // Tạo mới job
	    Job job = new Job();
	    job.setCustomer(customer);
	    job.setCustomerAddress(customerAddress);
	    job.setScheduledTime(jobTime);
	    job.setStatus(JobStatus.BOOKED); // Đặt trạng thái job là BOOKED
	    job.setPaymentMethod(request.getPaymentMethod()); // Lưu phương thức thanh toán vào job ngay khi tạo job

	    // Kiểm tra cleaner
	    Optional<Employee> cleanerOpt = cleanerRepository.findById(cleanerId);
	    if (!cleanerOpt.isPresent()) {
	        response.put("message", "Cleaner not found with cleanerId: " + cleanerId);
	        return response;
	    }
	    Employee cleaner = cleanerOpt.get();
	    job.setCleaner(cleaner);

	    // Kiểm tra trùng lịch của cleaner
	    List<Job> existingJobs = jobRepository.findByCleanerIdAndScheduledTimeBetween(cleanerId, jobTime.minusHours(2), jobTime.plusHours(2));
	    if (!existingJobs.isEmpty()) {
	        response.put("message", "Cleaner has overlapping schedule or the time gap between jobs is less than 2 hours");
	        return response;
	    }

	    // Lưu Job vào cơ sở dữ liệu trước
	    job = jobRepository.save(job);

	    // Tạo JobApplication cho cleaner và job
	    JobApplication jobApplication = new JobApplication();
	    jobApplication.setJob(job);
	    jobApplication.setCleaner(cleaner);
	    jobApplication.setStatus("Pending");  // Đặt trạng thái là "Pending"
	    jobApplication.setAppliedAt(LocalDateTime.now());  // Gán thời gian ứng tuyển

	    // Lưu JobApplication vào cơ sở dữ liệu
	    jobApplicationRepository.save(jobApplication);

	    // Tính toán giá cho tất cả các dịch vụ
	    double totalPrice = 0;
	    List<JobServiceDetail> jobServiceDetails = new ArrayList<>();

	    for (ServiceRequest serviceRequest : request.getServices()) {
	        // Kiểm tra dịch vụ
	        Optional<Services> serviceOpt = serviceRepository.findById(serviceRequest.getServiceId());
	        if (!serviceOpt.isPresent()) {
	            response.put("message", "Service not found with serviceId: " + serviceRequest.getServiceId());
	            return response;
	        }
	        Services service = serviceOpt.get();

	        // Kiểm tra chi tiết dịch vụ
	        Optional<ServiceDetail> serviceDetailOpt = serviceDetailRepository.findById(serviceRequest.getServiceDetailId());
	        if (!serviceDetailOpt.isPresent()) {
	            response.put("message", "Service Detail not found for serviceId: " + serviceRequest.getServiceDetailId());
	            return response;
	        }
	        ServiceDetail serviceDetail = serviceDetailOpt.get();

	        // Tính giá dịch vụ
	        double serviceDetailPrice = serviceDetail.getPrice();
	        double additionalPrice = serviceDetail.getAdditionalPrice();
	        double finalPrice = serviceDetailPrice + additionalPrice;

	        // Kiểm tra giờ cao điểm và phụ phí
	        double peakTimeFee = 0;
	        if (job.getScheduledTime().getDayOfWeek() == DayOfWeek.SATURDAY || job.getScheduledTime().getDayOfWeek() == DayOfWeek.SUNDAY) {
	            peakTimeFee = 0.1 * finalPrice;
	        }
	        if (job.getScheduledTime().getHour() >= 18 && job.getScheduledTime().getHour() <= 22) {
	            peakTimeFee += 0.2 * finalPrice;
	        }
	        finalPrice += peakTimeFee;

	        // Cộng tổng giá cho tất cả các dịch vụ
	        totalPrice += finalPrice;

	        // Tạo JobServiceDetail và lưu vào cơ sở dữ liệu
	        JobServiceDetail jobServiceDetail = new JobServiceDetail();
	        jobServiceDetail.setJob(job); // Gắn job vào JobServiceDetail
	        jobServiceDetail.setService(service); // Gắn service vào JobServiceDetail
	        jobServiceDetail.setServiceDetail(serviceDetail); // Gắn serviceDetail vào JobServiceDetail

	        // Thêm JobServiceDetail vào danh sách
	        jobServiceDetails.add(jobServiceDetail);
	    }

	    // Lưu JobServiceDetails vào cơ sở dữ liệu
	    jobServiceDetailRepository.saveAll(jobServiceDetails);

	    // Cập nhật tổng giá và lưu Job
	    job.setTotalPrice(totalPrice);
	    jobRepository.save(job);

	    // Trả về thông tin công việc đã tạo
	    response.put("message", "Job booked successfully");
	    response.put("jobId", job.getId());
	    response.put("status", job.getStatus());
	    response.put("totalPrice", totalPrice);
	    response.put("paymentMethod", job.getPaymentMethod());  // Trả về phương thức thanh toán

	    return response;
	}






	public List<Map<String, Object>> getJobsBookedForCleaner(@PathVariable Long cleanerId) {
	    List<Map<String, Object>> responseList = new ArrayList<>();

	    // Tìm cleaner theo cleanerId
	    Optional<Employee> cleanerOpt = cleanerRepository.findById(cleanerId);
	    if (!cleanerOpt.isPresent()) {
	        responseList.add(Map.of("message", "Cleaner not found with cleanerId: " + cleanerId));
	        return responseList;
	    }

	    Employee cleaner = cleanerOpt.get();

	    // Tìm tất cả các job mà cleaner đã được gán với trạng thái "BOOKED"
	    List<Job> jobs = jobRepository.findByCleanerIdAndStatus(cleanerId, JobStatus.BOOKED);
	

	    // Lấy thông tin các job mà cleaner được book
	    for (Job job : jobs) {
	        Map<String, Object> jobInfo = new HashMap<>();

	        // Thêm thông tin về job
	        jobInfo.put("jobId", job.getId());
	        jobInfo.put("status", job.getStatus());
	        jobInfo.put("scheduledTime", job.getScheduledTime());
	        jobInfo.put("totalPrice", job.getTotalPrice());


	        // Thêm thông tin về customer
	        Customers customer = job.getCustomer();
	        if (customer != null) {
	            jobInfo.put("customerId", customer.getId());
	            jobInfo.put("customerName", customer.getFull_name());
	            jobInfo.put("customerPhone", customer.getPhone());
	        }

	        // Lấy thông tin về địa chỉ của customer
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

	                    // Lấy thông tin chi tiết dịch vụ
	                    ServiceDetail serviceDetail = jobServiceDetail.getServiceDetail();
	                    if (serviceDetail != null) {
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
	        } else {
	            // Nếu không có dịch vụ nào, thông báo không có dịch vụ
	            jobInfo.put("services", "No services found for this job");
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

	    // Kiểm tra số dư trong ví của cleaner nếu action là accept
	    if ("accept".equalsIgnoreCase(action)) {
	        // Kiểm tra ví của cleaner
	        Optional<Wallet> walletOpt = walletRepository.findByCleanerId(cleaner.getId());
	        if (!walletOpt.isPresent()) {
	            response.put("message", "Cleaner wallet not found");
	            return response;
	        }
	        Wallet wallet = walletOpt.get();

	        // Tính hoa hồng (20% của tổng giá trị đơn hàng)
	        double commission = 0.2 * job.getTotalPrice();

	        // Kiểm tra số dư ví của cleaner có đủ để trừ hoa hồng không
	        if (wallet.getBalance() < commission) {
	            response.put("message", "Insufficient balance in cleaner's wallet");
	            return response;
	        }

	        // Nếu số dư đủ, cho phép accept
	        // Từ chối tất cả các ứng viên khác
	        List<JobApplication> otherApplications = jobApplicationRepository.findByJob(job);
	        for (JobApplication app : otherApplications) {
	            if (!app.getCleaner().getId().equals(cleaner.getId())) {
	                app.setStatus("Rejected");
	                jobApplicationRepository.save(app);
	            }
	        }
	        jobApplication.setStatus("Accepted");
	        job.setStatus(JobStatus.IN_PROGRESS);  // Đặt trạng thái công việc là IN_PROGRESS
	        response.put("message", "Job has been accepted");
	    } else if ("reject".equalsIgnoreCase(action)) {
	        // Khi job bị reject, cập nhật trạng thái job về CANCELLED
	        jobApplication.setStatus("Rejected");
	        job.setStatus(JobStatus.CANCELLED);  // Đặt trạng thái công việc là CANCELLED
	        response.put("message", "Job has been rejected and cancelled");
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
