import { BASE_URL } from "../../utils/config";
// Get all reports
export async function getAllReports() {
    try {
        const token = sessionStorage.getItem("token");
        const customerId = sessionStorage.getItem("customerId");
        const response = await fetch(`${BASE_URL}/reports/${customerId}/get-report-customer`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch reports');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching reports:', error);
        throw error;
    }
}

// Create a new report
export async function createReport(jobId, reportData) {
    try {
        const token = sessionStorage.getItem("token");
        const { report_type, description } = reportData;
        
        const url = new URL(`${BASE_URL}/reports/${jobId}/create-report`);
        url.searchParams.append('report_type', report_type);
        url.searchParams.append('description', description);
        
        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error('Failed to create report');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating report:', error);
        throw error;
    }
}

// Update a report
export async function updateReport(reportId, updateData) {
    try {
        const token = sessionStorage.getItem("token");
        const { status, resolvedAt, adminResponse } = updateData;
        
        const url = new URL(`${BASE_URL}/reports/${reportId}/update_report`);
        url.searchParams.append('status', status);
        url.searchParams.append('resolvedAt', resolvedAt);
        url.searchParams.append('adminResponse', adminResponse);
        
        const response = await fetch(url.toString(), {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error('Failed to update report');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating report:', error);
        throw error;
    }
}

// Get report by job ID
export async function getReportByJobId(jobId) {
    try {
        // First fetch all reports
        const allReports = await getAllReports();
        
        // Filter reports by jobId
        return allReports.filter(report => report.jobId === jobId);
    } catch (error) {
        console.error('Error fetching report by job ID:', error);
        throw error;
    }
}