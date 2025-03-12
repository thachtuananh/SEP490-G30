// export async function fetchServices() {
//     try {
//         const response = await fetch('http://localhost:8080/api/services/all');
//         if (!response.ok) {
//             throw new Error('Failed to fetch data');
//         }
//         const data = await response.json();

//         return data.map(service => ({
//             serviceId: service.serviceId,
//             serviceName: service.serviceName,
//             description: service.description,
//         }));
//     } catch (error) {
//         console.error('Error fetching services:', error);
//         return [];
//     }
// }
export async function fetchServices() {
    try {
        const response = await fetch('http://localhost:8080/api/services/all');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();

        return data.map(service => ({
            serviceId: service.serviceId,
            serviceName: service.serviceName,
            description: service.description
        }));
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}