import { useContext, useEffect, useState } from "react";
import { WebSocketContext } from "../../../context/WebSocketContext";
import axios from "axios";
import CleanerCard from "./CleanerCard";
import AuthContext from "../../../context/AuthContext"
function CleanerSection() {
  const [cleaners, setCleaners] = useState([]); // Danh sách tất cả các cleaner
  const [onlineCleanerIds, setOnlineCleanerIds] = useState([]); // Danh sách các cleaner đang online
  const [isSub, setIsSub] = useState(false);
  const client = useContext(WebSocketContext);

  // Fetch danh sách cleaner từ API một lần khi component mount
  const fetchAllCleaners = async () => {
    try {
      // console.log("🔄 Calling API to fetch all cleaners...");
      const res = await axios.get("http://localhost:8080/api/customer/cleaners/online");

      setCleaners(res.data); // Cập nhật danh sách cleaners
      const ids = res.data.map((cleaner) => cleaner.cleanerId);
      setOnlineCleanerIds(ids); // Lưu lại danh sách cleaner đang online
      // console.log("Fetched cleaners:", res.data);
    } catch (error) {
      console.error("❌ Lỗi khi fetch cleaners:", error);
    }
  };

  // Đăng ký WebSocket khi WebSocket client sẵn sàng
  useEffect(() => {
    if (!client || isSub) return;

    const trySub = () => {
      console.log('connect');
      const subscription = client.subscribe("/topic/onlineCleaners", (message) => {
        try {
          const cleanerId = JSON.parse(message.body); // Nhận cleanerId từ thông báo
          console.log("🚀 ~ subscription ~ message.body:", message.body)
          setCleaners((prev) => {
            // Kiểm tra nếu cleanerId đã có trong mảng prev rồi thì không thêm vào
            if (prev.some((cleaner) => cleaner === cleanerId)) {
              return prev;  // Nếu đã có, giữ nguyên mảng cũ
            }
            // Nếu chưa có, thêm cleanerId vào mảng
            return [...prev, cleanerId];
          });

        } catch (error) {
          console.error("❌ Lỗi khi nhận thông tin cleaner online:", error);
        }
      });
      setIsSub(true);

      return subscription;
    };

    if (client.connected) {
      const sub = trySub();
      return () => sub?.unsubscribe();
    } else {
      client.onConnect = () => {
        const sub = trySub();
        client.cleanupSub = () => sub?.unsubscribe();
      };

      return () => {
        if (client.cleanupSub) {
          client.cleanupSub();
        }
      };
    }
  }, [client]); // Lắng nghe WebSocket thông báo khi client kết nối

  // Kiểm tra xem cleaner có đang online không
  const isOnline = (cleanerId) => onlineCleanerIds.includes(cleanerId);

  // Chạy fetchAllCleaners một lần khi component mount
  useEffect(() => {
    fetchAllCleaners(); // Chạy 1 lần khi component mount
  }, []); // Chạy 1 lần khi component mount

  useEffect(() => {
    console.log("🚀 ~ CleanersSection ~ cleaners:", cleaners)
  }, [cleaners]);


  return (
    <section className="service-section">
      <h2 className="section-title">Danh sách cleaner</h2>
      <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
        {cleaners.length > 0 ? (
          cleaners.map((cleaner) => (
            <CleanerCard
              key={cleaner.cleanerId}
              cleanerId={cleaner.cleanerId}
              cleanerImg={cleaner.profile_image}
              cleanerName={cleaner.name}
              rating={4.6}
              reviews={100}
              isOnline={isOnline(cleaner.cleanerId)} // Truyền trạng thái online vào CleanerCard
            />
          ))
        ) : (
          <p>Đang tải danh sách cleaner...</p>
        )}
      </div>
    </section>
  );
}

export default CleanerSection;