import profileImg from '../../assets/imgProfile/imgProfile.svg';
import { BASE_URL } from '../../utils/config';

// Fetch online cleaners
export async function fetchCleaners() {
    try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/customer/cleaners/online`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        return data.map(cleaner => ({
            cleanerId: cleaner.cleanerId,
            cleanerName: cleaner.cleanerName,
            cleanerImg: cleaner.profileImage
                ? `data:image/png;base64,${cleaner.profileImage}`
                : profileImg // Nếu không có ảnh thì dùng ảnh mặc định
        }));
    } catch (error) {
        console.error('Error fetching cleaners:', error);
        return [];
    }
}

// Fetch service details
export async function fetchServiceDetails(serviceId) {
    try {
        const response = await fetch(`${BASE_URL}/services/details/${serviceId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch service details');
        }

        const data = await response.json();

        // Sort service details by minRoomSize
        const sortedDetails = Array.isArray(data?.serviceDetails)
            ? [...data.serviceDetails].sort((a, b) => (a.minRoomSize || 0) - (b.minRoomSize || 0))
            : [];

        return { ...data, serviceDetails: sortedDetails };
    } catch (error) {
        console.error('Error fetching service details:', error);
        throw error;
    }
}

// Create job
export async function createJob(customerId, jobData) {
    try {
        const token = sessionStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${BASE_URL}/customer/${customerId}/createjob`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(jobData),
        });

        return await response.json();
    } catch (error) {
        console.error('Error creating job:', error);
        throw error;
    }
}

// Create job
export async function createJobToCleaner(customerId, cleanerId, jobData) {
    try {
        const token = sessionStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }
        const response = await fetch(`${BASE_URL}/customer/${customerId}/bookjob/${cleanerId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(jobData),
        });

        return await response.json();
    } catch (error) {
        console.error('Error creating job:', error);
        throw error;
    }
}

export async function fetchCleanerDetails(cleanerId) {
    try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(`${BASE_URL}/customer/viewdetailcleaner/${cleanerId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch cleaner details");
        }

        const data = await response.json();

        return {
            cleanerId: data.cleanerId,
            cleanerName: data.cleanerName,
            phoneNumber: data.phoneNumber,
            address: data.address,
            averageRating: data.averageRating,
            profileImage: data.profileImage
                ? `data:image/png;base64,${data.profileImage}`
                : null,
            email: data.email,
            experience: data.experience,
            age: data.age,
            identityNumber: data.identityNumber,
            isVerified: data.isVerified,
            status: data.status
        };
    } catch (error) {
        console.error("Error fetching cleaner details:", error);
        return null;
    }
}
