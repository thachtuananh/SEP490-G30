import React from "react";
import { Typography } from "antd";
const { Title, Paragraph, Text } = Typography;

const TermsModalContent = () => {
  return (
    <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
      <Title level={3}>ĐIỀU KHOẢN VÀ DỊCH VỤ – HOUSECLEAN</Title>
      <Paragraph>
        <Text strong>Cập nhật lần cuối: 28/05/2025</Text>
      </Paragraph>

      <Title level={4}>1. Giới thiệu</Title>
      <Paragraph>
        Chào mừng bạn đến với HouseClean – nền tảng kết nối Chủ nhà cần dịch vụ
        dọn dẹp với Người dọn dẹp chuyên nghiệp. Bằng việc sử dụng nền tảng này,
        bạn đồng ý với các điều khoản dưới đây.
      </Paragraph>

      <Title level={4}>2. Định nghĩa</Title>
      <Paragraph>
        • “Người dùng” bao gồm cả Chủ nhà và Người dọn dẹp.
        <br />
        • “Dịch vụ” là tất cả tính năng mà HouseClean cung cấp, bao gồm tạo công
        việc, ứng tuyển, thanh toán, đánh giá, nhắn tin, v.v.
        <br />• “Nội dung người dùng” là thông tin, hình ảnh, đánh giá... do
        người dùng tạo ra.
      </Paragraph>

      <Title level={4}>3. Quy định dành cho Chủ nhà</Title>
      <Paragraph>
        • Cung cấp thông tin chính xác khi tạo công việc.
        <br />
        • Thanh toán trước toàn bộ phí dịch vụ qua ví HouseClean hoặc nền tảng
        VNPay.
        <br />
        • Xác nhận hoàn thành công việc trung thực và kịp thời.
        <br />• Không được phép hủy việc khi Người dọn dẹp đã gửi yêu cầu xác
        nhận hoàn thành công việc (Trong trường hợp xảy ra sự cố, vui lòng gửi
        báo cáo lên hệ thống).
      </Paragraph>

      <Title level={4}>4. Quy định dành cho Người dọn dẹp</Title>
      <Paragraph>
        • Chỉ nhận việc nếu có khả năng hoàn thành đúng giờ, đúng chất lượng.
        <br />
        • Đến đúng giờ, thông báo đã đến, và cập nhật tiến trình.
        <br />
        • Gửi yêu cầu xác nhận hoàn thành sau khi hoàn tất.
        <br />
        • Không được nhận tiền ngoài hệ thống HouseClean.
        <br />• Phải đến văn phòng đại diện của HouseClean để xác minh thông tin
        và kích hoạt tài khoản sau khi hoàn tất đăng ký trên hệ thống. Tài khoản
        sẽ không được phép nhận công việc cho đến khi hoàn tất bước này.
      </Paragraph>

      <Title level={4}>5. Quy định chung</Title>
      <Paragraph>
        • Người dùng không được sử dụng HouseClean cho mục đích vi phạm pháp
        luật, quấy rối, gian lận.
        <br />
        • Không được chia sẻ thông tin cá nhân nhạy cảm qua nền tảng.
        <br />• Không giả mạo danh tính hoặc tạo nhiều tài khoản.
      </Paragraph>

      <Title level={4}>6. Thanh toán và hoàn tiền</Title>
      <Paragraph>
        • Mọi thanh toán được thực hiện qua ví HouseClean hoặc nền tảng VNPay.
        <br />
        • Chủ nhà sẽ được hoàn tiền nếu công việc bị hủy đúng quy định.
        <br />• Người dọn dẹp chỉ rút được tiền sau khi hoàn thành job và được
        hệ thống xác nhận (chậm nhất 72 tiếng kể từ khi gửi yêu cầu rút tiền).
      </Paragraph>

      <Title level={4}>7. Đánh giá và phản hồi</Title>
      <Paragraph>
        • Mỗi job chỉ được đánh giá và chỉnh sửa 1 lần từ mỗi phía.
        <br />• Đánh giá phải trung thực, không lăng mạ, không xúc phạm.
      </Paragraph>

      <Title level={4}>8. Giới hạn trách nhiệm</Title>
      <Paragraph>
        HouseClean chỉ là nền tảng kết nối. Chúng tôi không chịu trách nhiệm nếu
        xảy ra tranh chấp ngoài ứng dụng, hoặc tổn thất không liên quan đến chức
        năng của hệ thống.
      </Paragraph>

      <Title level={4}>9. Xử lý vi phạm</Title>
      <Paragraph>
        • Người dùng vi phạm sẽ bị cảnh báo, khóa tài khoản tạm thời hoặc vĩnh
        viễn tùy mức độ.
        <br />• Trường hợp nghiêm trọng sẽ bị báo cáo cho cơ quan chức năng.
      </Paragraph>

      <Title level={4}>10. Thay đổi điều khoản</Title>
      <Paragraph>
        HouseClean có quyền thay đổi điều khoản này bất kỳ lúc nào. Người dùng
        có trách nhiệm cập nhật và đồng ý với các thay đổi mới.
      </Paragraph>
    </div>
  );
};

export default TermsModalContent;
