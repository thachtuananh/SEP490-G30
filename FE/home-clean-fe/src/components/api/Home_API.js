import profileImg from '../../assets/imgProfile/imgProfile.svg';
export async function fetchServices() {
    try {
        const token = localStorage.getItem("token"); // Lấy token từ localStorage
        const response = await fetch('http://localhost:8080/api/customer/cleaners/online', {
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
        console.error('Error fetching services:', error);
        return [];
    }
}
