import { useNavigate } from "react-router-dom";
import { Card, Typography, message } from "antd";
import { BASE_URL } from "../../../utils/config";

const { Title, Paragraph, Text } = Typography;

function JobCard({ image, title, description, count, id }) {
    const navigate = useNavigate();

    const handleCardClick = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.warning("Bạn cần đăng nhập để xem chi tiết công việc.");
                return;
            }

            let url = `${BASE_URL}/cleaner/jobs/details/by-service/${id}`;
            let isCombo = false;

            // Sử dụng API riêng cho dịch vụ combo
            if (title === "Dọn dẹp theo Combo") {
                url = `${BASE_URL}/cleaner/jobs/combo`;
                isCombo = true;
            }

            message.loading({ content: "Đang tải thông tin công việc...", key: "jobLoading" });

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Không thể lấy thông tin công việc');
            }

            const data = await response.json();
            message.destroy("jobLoading");

            // Xử lý dữ liệu cho combo service
            if (isCombo) {
                // Đảm bảo mỗi job trong combo có thuộc tính serviceName
                const processedData = data.map(job => {
                    // Nếu job có services array, lấy tên dịch vụ từ đó
                    if (job.services && job.services.length > 0) {
                        // Tạo tên dịch vụ từ danh sách services
                        const serviceNames = job.services.map(service => service.serviceName).join(", ");
                        return {
                            ...job,
                            serviceName: serviceNames || "Combo dịch vụ"
                        };
                    }
                    return {
                        ...job,
                        serviceName: job.serviceName || "Combo dịch vụ"
                    };
                });

                // Chuyển hướng với dữ liệu đã xử lý
                navigate('/job-list', { state: { jobs: processedData, serviceTitle: title } });
            } else {
                // Chuyển hướng với dữ liệu gốc cho các dịch vụ không phải combo
                navigate('/job-list', { state: { jobs: data, serviceTitle: title } });
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin công việc:", error);
            message.error("Đã xảy ra lỗi khi lấy thông tin công việc. Vui lòng thử lại sau.");
        }
    };

    return (
        <Card
            hoverable
            style={{
                height: '100%',
                background: '#f5f5f5',
                display: 'flex',
                flexDirection: 'column'
            }}
            bodyStyle={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                padding: '0 16px 16px 16px'
            }}
            onClick={handleCardClick}
            cover={
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '16px 16px 0 16px',
                    height: '120px'
                }}>
                    <img
                        src={image}
                        alt={title}
                        style={{
                            width: '60px',
                            height: '60px',
                            maxHeight: '80px',
                            maxWidth: '80px',
                            objectFit: 'contain'
                        }}
                    />
                </div>
            }
        >
            <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Title level={4} style={{ margin: 0 }}>{title}</Title>
                <Paragraph style={{ margin: '8px 0', flex: 1 }}>{description}</Paragraph>
                <div style={{ marginTop: 'auto' }}>
                    <Text strong style={{ color: '#039855', fontSize: '16px' }}>{count}</Text>
                </div>
            </div>
        </Card>
    );
}

export default JobCard;