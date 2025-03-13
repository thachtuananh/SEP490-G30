import { BASE_URL } from "../../utils/config";
// Fetch customer addresses
export async function fetchCustomerAddresses(customerId) {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${BASE_URL}/customer/${customerId}/addresses`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch customer addresses');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching customer addresses:', error);
        throw error;
    }
}

// Set default address
export async function setDefaultAddress(customerId, addressId) {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("No authentication token found");
        }

        const response = await fetch(`${BASE_URL}/customer/${customerId}/addresses/${addressId}/set-default`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to set default address');
        }

        return true;
    } catch (error) {
        console.error('Error setting default address:', error);
        throw error;
    }
}