import React, { useState } from "react";
import {
  message,
  Input,
  Form,
  Button,
  InputNumber,
  DatePicker,
  Radio,
  Modal,
  Typography,
  Checkbox,
} from "antd";
import Footer from "../../components/Home/Owner/Footer";
import logo from "../../assets/HouseClean_logo.png";
import { Link, useNavigate } from "react-router-dom";
import ImgLeft from "../../assets/image-left.png";
import { BASE_URL } from "../../utils/config";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import {
  validatePhone,
  validateName,
  validatePassword,
  validateConfirmPassword,
  validateEmail,
  validateAge,
  validateIdentityNumber,
} from "../../utils/validate";
import TermsModalContent from "../../components/TermContent/TermsModalContent"; // Import the new component
const { Text } = Typography;

function RegisterCleaner() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    password: "",
    confirmPassword: "",
    email: "",
    age: "",
    identity_number: "",
    experience: "",
  });

  const [ageInputType, setAgeInputType] = useState("number"); // "number" hoặc "date"
  const [registrationData, setRegistrationData] = useState(null);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationModalVisible, setVerificationModalVisible] =
    useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  // Tính tuổi từ ngày sinh sử dụng JavaScript tích hợp sẵn
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Xử lý khi thay đổi ngày sinh
  const handleDateChange = (date) => {
    if (date) {
      const dateObj = date.toDate(); // Chuyển đổi từ moment object sang Date object
      const age = calculateAge(dateObj);
      setFormData({ ...formData, age: age.toString() });
    } else {
      setFormData({ ...formData, age: "" });
    }
  };

  // Kiểm tra xem một ngày có phải là trong tương lai không
  const isFutureDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  // Kiểm tra xem một ngày có tạo ra tuổi nhỏ hơn 18 không
  const isUnder18 = (date) => {
    return calculateAge(date) < 18;
  };

  const validateEmpty = (value, fieldName) => {
    if (!value || !value.trim()) {
      return `Vui lòng nhập ${fieldName}!`;
    }
    return "";
  };

  // Step 1: Submit registration info and send OTP
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const {
      phone,
      name,
      password,
      confirmPassword,
      email,
      age,
      identity_number,
      experience,
    } = formData;

    console.log("👉 Dữ liệu form trước khi validate:", formData);

    // Kiểm tra trường rỗng sau khi trim cho tất cả các trường
    const emptyErrors = {
      phone: validateEmpty(phone, "số điện thoại"),
      name: validateEmpty(name, "họ và tên"),
      password: validateEmpty(password, "mật khẩu"),
      confirmPassword: validateEmpty(confirmPassword, "xác nhận mật khẩu"),
      email: validateEmpty(email, "email"),
      age: validateEmpty(age, "tuổi"),
      identity_number: validateEmpty(identity_number, "số CMND/CCCD"),
      experience: validateEmpty(experience, "kinh nghiệm"),
    };

    // Kiểm tra nếu có bất kỳ lỗi trống nào
    const hasEmptyErrors = Object.values(emptyErrors).some(
      (error) => error !== ""
    );

    if (hasEmptyErrors) {
      // Tìm lỗi đầu tiên để hiển thị
      for (const field in emptyErrors) {
        if (emptyErrors[field]) {
          message.error(emptyErrors[field]);
          return;
        }
      }
    }

    // Nếu không có lỗi trống, tiếp tục với các validate khác
    const newErrors = {
      phone: validatePhone(phone),
      name: validateName(name),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
      email: validateEmail(email),
      age: validateAge(age),
      identity_number: validateIdentityNumber(identity_number),
      experience: !experience.trim() ? "Vui lòng nhập kinh nghiệm!" : "",
    };

    // Kiểm tra nếu có bất kỳ lỗi nào
    const hasErrors = Object.values(newErrors).some((error) => error !== "");

    if (hasErrors) {
      // Tìm lỗi đầu tiên để hiển thị
      for (const field in newErrors) {
        if (newErrors[field]) {
          message.error(newErrors[field]);
          return; // Dừng lại sau khi hiển thị lỗi đầu tiên
        }
      }
      return;
    }

    console.log("🔍 Không có lỗi, tiếp tục gửi dữ liệu");

    // Store the registration data for later submission
    setRegistrationData({
      phone,
      password,
      name,
      email,
      age,
      address: "",
      identity_number,
      experience,
    });

    // Send OTP to the phone number
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/otp/cleaner/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const result = await response.json();

      if (response.ok) {
        message.success("Mã OTP đã được gửi đến số điện thoại của bạn!");
        setOtpModalVisible(true);
      } else {
        message.error(
          result.message || "Không thể gửi mã OTP. Vui lòng thử lại!"
        );
      }
    } catch (error) {
      message.error("Lỗi kết nối đến server khi gửi OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim() === "") {
      message.error("Vui lòng nhập mã OTP!");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/otp/cleaner/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: registrationData.phone,
          otpCode: otpCode,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // message.success("Xác thực OTP thành công!");
        await registerCleaner();
      } else {
        message.error(
          result.message || "Mã OTP không chính xác. Vui lòng thử lại!"
        );
      }
    } catch (error) {
      message.error("Lỗi kết nối đến server khi xác thực OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Submit registration after OTP verification
  const registerCleaner = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${BASE_URL}/employee/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (response.ok) {
        message.success(result.message || "Đăng ký thành công!");
        setOtpModalVisible(false);
        // Hiển thị modal thông báo xác minh công ty thay vì chuyển hướng ngay
        setVerificationModalVisible(true);
      } else {
        message.error(result.message || "Đăng ký thất bại!");
      }
    } catch (error) {
      message.error("Lỗi kết nối đến server!");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý đóng modal xác minh và chuyển hướng đến trang đăng nhập
  const handleCloseVerificationModal = () => {
    setVerificationModalVisible(false);
    navigate("/homeclean/login/cleaner");
  };

  // Resend OTP if needed
  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/otp/cleaner/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: registrationData.phone }),
      });

      const result = await response.json();

      if (response.ok) {
        message.success("Mã OTP mới đã được gửi đến số điện thoại của bạn!");
      } else {
        message.error(
          result.message || "Không thể gửi lại mã OTP. Vui lòng thử lại!"
        );
      }
    } catch (error) {
      message.error("Lỗi kết nối đến server khi gửi lại OTP!");
    } finally {
      setIsLoading(false);
    }
  };

  // CSS cho label và form
  const formItemLayout = {
    labelCol: {
      span: 24,
    },
    wrapperCol: {
      span: 24,
    },
  };

  const labelStyle = {
    color: "#333",
    fontSize: "14px",
    fontWeight: "normal",
    marginBottom: "8px",
    display: "block",
  };

  // CSS for required field label
  const requiredLabel = {
    color: "#333",
    fontSize: "14px",
    fontWeight: "normal",
    marginBottom: "8px",
    display: "block",
  };

  const requiredStar = {
    color: "red",
    marginLeft: "3px",
  };

  const inputStyle = {
    height: "40px",
    borderRadius: "8px",
    fontSize: "14px",
  };

  // Hàm helper để kiểm tra ngày hợp lệ cho DatePicker
  const disabledDate = (current) => {
    if (!current) return false;

    // Không cho phép chọn ngày trong tương lai
    // và đảm bảo người dùng ít nhất 18 tuổi
    const date = current.toDate();
    const today = new Date();

    // Kiểm tra nếu ngày là trong tương lai
    if (date > today) return true;

    // Kiểm tra nếu người dùng dưới 18 tuổi
    const age = calculateAge(date);
    return age < 18;
  };

  return (
    <div className="app">
      <main className="main-content">
        <div className="main-image">
          <img src={ImgLeft} alt="Interior" />
        </div>

        <div className="login-container login-container-right">
          <div className="logo login-logo">
            <Link to="/homeclean">
              <img
                src={logo}
                alt="House Clean Logo"
                className="logo-img login-logo-img"
              />
            </Link>
          </div>
          <div className="login-box">
            <h2>Đăng ký</h2>

            <Form
              className="login-form"
              onSubmit={handleSubmit}
              {...formItemLayout}
            >
              <Form.Item
                label={
                  <span style={requiredLabel}>
                    Số điện thoại
                    <span style={requiredStar}>*</span>
                  </span>
                }
                style={{ marginBottom: "16px" }}
              >
                <Input
                  style={inputStyle}
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  name="phone"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={requiredLabel}>
                    Mật khẩu
                    <span style={requiredStar}>*</span>
                  </span>
                }
                style={{ marginBottom: "16px" }}
              >
                <Input.Password
                  style={inputStyle}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  iconRender={(visible) =>
                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                  }
                  name="password"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={requiredLabel}>
                    Nhập lại mật khẩu
                    <span style={requiredStar}>*</span>
                  </span>
                }
                style={{ marginBottom: "16px" }}
              >
                <Input.Password
                  style={inputStyle}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  iconRender={(visible) =>
                    visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                  }
                  name="confirmPassword"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={requiredLabel}>
                    Họ và tên
                    <span style={requiredStar}>*</span>
                  </span>
                }
                style={{ marginBottom: "16px" }}
              >
                <Input
                  style={inputStyle}
                  placeholder="Nhập họ và tên"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  name="name"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={requiredLabel}>
                    Email
                    <span style={requiredStar}>*</span>
                  </span>
                }
                style={{ marginBottom: "16px" }}
              >
                <Input
                  style={inputStyle}
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  name="email"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={requiredLabel}>
                    Ngày sinh
                    <span style={requiredStar}>*</span>
                  </span>
                }
                style={{ marginBottom: "16px" }}
              >
                {/* <Radio.Group
                  value={ageInputType}
                  onChange={(e) => setAgeInputType(e.target.value)}
                  style={{ marginBottom: "8px" }}
                >
                  <Radio value="number">Nhập tuổi</Radio>
                  <Radio value="date">Chọn ngày sinh</Radio>
                </Radio.Group>

                {ageInputType === "number" ? (
                  <InputNumber
                    style={{ ...inputStyle, width: "100%" }}
                    placeholder="Nhập tuổi"
                    value={formData.age ? parseInt(formData.age) : null}
                    onChange={(value) =>
                      handleInputChange("age", value ? value.toString() : "")
                    }
                    min={18}
                    max={100}
                  />
                ) : (
                  <DatePicker
                    style={{ ...inputStyle, width: "100%" }}
                    placeholder="Chọn ngày sinh"
                    onChange={handleDateChange}
                    format="DD/MM/YYYY"
                    disabledDate={disabledDate}
                  />
                )} */}

                <DatePicker
                  style={{ ...inputStyle, width: "100%" }}
                  placeholder="Chọn ngày sinh"
                  onChange={handleDateChange}
                  format="DD/MM/YYYY"
                  disabledDate={disabledDate}
                />
                {ageInputType === "date" && formData.age && (
                  <div style={{ marginTop: "4px", fontSize: "12px" }}>
                    Tuổi của bạn: {formData.age}
                  </div>
                )}
              </Form.Item>

              <Form.Item
                label={
                  <span style={requiredLabel}>
                    Số CMND/CCCD
                    <span style={requiredStar}>*</span>
                  </span>
                }
                style={{ marginBottom: "16px" }}
              >
                <Input
                  style={inputStyle}
                  placeholder="Nhập số CMND/CCCD"
                  value={formData.identity_number}
                  onChange={(e) =>
                    handleInputChange("identity_number", e.target.value)
                  }
                  name="identity_number"
                />
              </Form.Item>

              <Form.Item
                label={
                  <span style={requiredLabel}>
                    Kinh nghiệm
                    <span style={requiredStar}>*</span>
                  </span>
                }
                style={{ marginBottom: "24px" }}
              >
                <Input.TextArea
                  placeholder="Mô tả kinh nghiệm làm việc của bạn"
                  value={formData.experience}
                  onChange={(e) =>
                    handleInputChange("experience", e.target.value)
                  }
                  rows={4}
                  name="experience"
                />
              </Form.Item>
              <div style={{ margin: "16px 0px" }}>
                <Checkbox
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={
                    !formData.phone ||
                    !formData.name ||
                    !formData.password ||
                    !formData.confirmPassword ||
                    !formData.email ||
                    !formData.age ||
                    !formData.identity_number ||
                    !formData.experience
                  }
                >
                  <Text style={{ fontSize: "14px" }}>
                    Tôi đồng ý với{" "}
                    <Text
                      strong
                      style={{
                        cursor: "pointer",
                        color: "#039855",
                        fontWeight: "bold",
                      }}
                      onClick={() => setTermsModalVisible(true)}
                    >
                      Điều khoản và dịch vụ
                    </Text>{" "}
                    của HouseClean
                  </Text>
                </Checkbox>
              </div>
              <Button
                type="primary"
                htmlType="submit"
                className="login-button"
                onClick={() => {
                  setOtpCode("");
                  handleSubmit();
                }}
                loading={isLoading}
                style={{
                  width: "100%",
                  height: "40px",
                  marginTop: "16px",
                  marginBottom: "16px",
                }}
              >
                Đăng Ký
              </Button>
            </Form>

            <p className="signup-link">
              Đã có tài khoản?{" "}
              <Link to="/homeclean/login/cleaner">Đăng nhập ngay</Link>
            </p>
          </div>
        </div>
      </main>

      {/* OTP Verification Modal */}
      <Modal
        title="Xác thực OTP"
        visible={otpModalVisible}
        onCancel={() => setOtpModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setOtpModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="resend"
            onClick={() => {
              // Reset input OTP ngay trong Modal khi click nút gửi lại
              setOtpCode("");
              // Sau đó gọi hàm xử lý gửi lại OTP
              handleResendOtp();
            }}
            disabled={isLoading}
          >
            Gửi lại OTP
          </Button>,
          <Button
            key="submit"
            type="primary"
            disabled={isLoading}
            onClick={handleVerifyOtp}
          >
            Xác nhận
          </Button>,
        ]}
      >
        <p>Mã OTP đã được gửi đến số điện thoại {registrationData?.phone}.</p>
        <p>Vui lòng nhập mã OTP:</p>
        <Input
          placeholder="Nhập mã OTP"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          style={{ marginTop: "10px" }}
        />
      </Modal>

      {/* Verification Modal */}
      <Modal
        title="Thông báo xác minh"
        visible={verificationModalVisible}
        onCancel={handleCloseVerificationModal}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={handleCloseVerificationModal}
          >
            Đóng
          </Button>,
        ]}
        centered
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <p style={{ fontSize: "16px", fontWeight: "500" }}>
            Bạn cần phải đến công ty để xác minh thông tin cá nhân
          </p>
        </div>
      </Modal>

      {/* Terms and Services Modal */}
      <Modal
        title="Điều khoản và Dịch vụ"
        visible={termsModalVisible}
        onCancel={() => setTermsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setTermsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        <TermsModalContent />
      </Modal>
    </div>
  );
}

export default RegisterCleaner;
