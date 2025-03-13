import { BASE_URL } from "../../utils/config";

// Fetch cleaner applications for a job
export async function fetchCleanerApplications(customerId, jobId) {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${BASE_URL}/customer/applications/${customerId}/${jobId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cleaner applications');
        }

        const data = await response.json();

        // Check if the response contains an error message
        if (Array.isArray(data) && data.length === 1 && data[0].message && data[0].message.includes("No applications found")) {
            return [];
        } else if (Array.isArray(data)) {
            return data;
        } else {
            console.error("Unexpected response format:", data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching cleaner applications:', error);
        throw error;
    }
}

// Fetch cleaner details
export async function fetchCleanerDetail(cleanerId) {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${BASE_URL}/customer/viewdetailcleaner/${cleanerId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cleaner details');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching cleaner details:', error);
        throw error;
    }
}

// Hire a cleaner
export async function hireCleaner(jobId, cleanerId, customerId) {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${BASE_URL}/customer/accept-job/${jobId}/cleaner/${cleanerId}/customer/${customerId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error('Failed to hire cleaner');
        }

        return true;
    } catch (error) {
        console.error('Error hiring cleaner:', error);
        throw error;
    }
}

// Start a job
export async function startJob(jobId, customerId) {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${BASE_URL}/customer/job/start/${jobId}/${customerId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error('Failed to start job');
        }

        return true;
    } catch (error) {
        console.error('Error starting job:', error);
        throw error;
    }
}

// Complete a job
export async function completeJob(jobId) {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${BASE_URL}/customer/job/done/customer/${jobId}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error('Failed to complete job');
        }

        return true;
    } catch (error) {
        console.error('Error completing job:', error);
        throw error;
    }
}

// Delete a job posting
export async function deleteJobPosting(jobId) {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${BASE_URL}/customer/job/${jobId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete job posting');
        }

        return true;
    } catch (error) {
        console.error('Error deleting job posting:', error);
        throw error;
    }
}