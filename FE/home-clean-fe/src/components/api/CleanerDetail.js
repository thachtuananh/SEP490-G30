import { BASE_URL } from "../../utils/config";

export async function fetchCleanerDetails(cleanerId) {
    try {
        const token = localStorage.getItem("token");
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
            cleanerName: data.cleanerName,
            averageRating: data.averageRating,
            profileImage: data.profileImage
                ? `data:image/png;base64,${data.profileImage}`
                : null,
        };
    } catch (error) {
        console.error("Error fetching cleaner details:", error);
        return null;
    }
}
