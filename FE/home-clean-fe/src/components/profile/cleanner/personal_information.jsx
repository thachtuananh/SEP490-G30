import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import "../owner/profile.css";
import profileImg from "../../../assets/imgProfile/imgProfile.svg";
import { message, Modal, Input } from "antd"; // Thêm Input từ antd
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons"; // Import icons
import { BASE_URL } from "../../../utils/config";
import {
  validatePhone,
  validateName,
  validatePassword,
  validateConfirmPassword,
  validateEmail,
  validateAge,
  validateIdentityNumber,
} from "../../../utils/validate";

export const PersonaInformation = () => {
  const { cleaner, dispatch } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const navigate = useNavigate();

  const [cleanerName, setName] = useState(cleaner?.cleanerName || "");
  const [cleanerPhone, setPhone] = useState(cleaner?.cleanerPhone || "");
  const [cleanerEmail, setEmail] = useState(cleaner?.cleanerEmail || "");
  const [cleanerAge, setAge] = useState(cleaner?.cleanerAge || "");
  const [cleanerAddress, setAddress] = useState(cleaner?.cleanerAddress || "");
  const [cleanerIDnum, setIdentityNumber] = useState(
    cleaner?.cleanerIDnum || ""
  );
  const [cleanerExp, setExperience] = useState(cleaner?.cleanerExp || "");
  const [cleanerImg, setImg] = useState(cleaner?.cleanerImg || "");

  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [ageError, setAgeError] = useState("");
  const [experienceError, setExperienceError] = useState("");

  // State for password change
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // Updated API call function - removed identity_number from the request body
  const updateProfileAPI = async () => {
    if (!validateFormFields()) {
      message.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const cleanerId = localStorage.getItem("cleanerId");
      if (!cleanerId || !token) {
        message.error("Không tìm thấy thông tin người dùng!");
        return;
      }

      setIsLoading(true);

      const response = await fetch(
        `${BASE_URL}/employee/${cleanerId}/update_profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: cleanerName,
            phone: cleanerPhone,
            email: cleanerEmail,
            age: parseInt(cleanerAge),
            experience: cleanerExp,
            identity_number: cleanerIDnum,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Update context with new data
      const updatedData = {
        ...cleaner,
        cleanerName: cleanerName,
        cleanerPhone: cleanerPhone,
        cleanerEmail: cleanerEmail,
        cleanerAge: cleanerAge,
        cleanerExp: cleanerExp,
        cleanerIDnum: cleanerIDnum,
      };

      dispatch({ type: "UPDATE_CLEANER", payload: updatedData });
      message.success("Cập nhật thông tin thành công!");
    } catch (error) {
      message.error("Cập nhật thông tin thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xóa tài khoản
  const deleteAccountAPI = async () => {
    const token = localStorage.getItem("token");
    const cleanerId = localStorage.getItem("cleanerId");
    if (!cleanerId || !token) {
      message.error("Không tìm thấy thông tin người dùng!");
      return;
    }

    setIsDeleteLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/employee/${cleanerId}/delete_account`,
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      message.success("Tài khoản đã được xóa thành công!");

      dispatch({ type: "LOGOUT" });

      // Redirect to login page
      navigate("/homeclean/login/cleaner");
    } catch (error) {
      message.error("Xóa tài khoản thất bại!");
    } finally {
      setIsDeleteLoading(false);
      setIsDeleteModalVisible(false);
    }
  };

  // Hàm xử lý lưu tất cả thông tin
  const handleSave = () => {
    updateProfileAPI();
  };

  // Hàm mở modal xác nhận xóa tài khoản
  const showDeleteConfirm = () => {
    setIsDeleteModalVisible(true);
  };

  // Hàm xử lý upload ảnh (cần bổ sung API upload ảnh)
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Here you would implement image upload API
      const reader = new FileReader();
      reader.onloadend = () => {
        setImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Hàm mở modal đổi mật khẩu
  const showPasswordModal = () => {
    setIsPasswordModalVisible(true);
    // Reset password fields and errors when opening modal
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setOldPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");
  };

  // Validate form fields
  const validateFormFields = () => {
    const nameValidation = validateName(cleanerName);
    const phoneValidation = validatePhone(cleanerPhone);
    const emailValidation = validateEmail(cleanerEmail);
    const ageValidation = validateAge(cleanerAge);

    setNameError(nameValidation);
    setPhoneError(phoneValidation);
    setEmailError(emailValidation);
    setAgeError(ageValidation);

    return (
      !nameValidation && !phoneValidation && !emailValidation && !ageValidation
    );
  };

  // Validate password fields
  const validatePasswordFields = () => {
    // For old password, just check if it's not empty
    const oldPasswordValidation = oldPassword
      ? ""
      : "Vui lòng nhập mật khẩu hiện tại!";
    const newPasswordValidation = validatePassword(newPassword);
    const confirmPasswordValidation = validateConfirmPassword(
      newPassword,
      confirmPassword
    );

    setOldPasswordError(oldPasswordValidation);
    setNewPasswordError(newPasswordValidation);
    setConfirmPasswordError(confirmPasswordValidation);

    return (
      !oldPasswordValidation &&
      !newPasswordValidation &&
      !confirmPasswordValidation
    );
  };

  // Function to handle password change API call
  const handleChangePassword = async () => {
    // Validate passwords using imported validation functions
    if (!validatePasswordFields()) {
      return;
    }

    setIsPasswordLoading(true);

    const token = localStorage.getItem("token");
    const cleanerId = localStorage.getItem("cleanerId");

    if (!cleanerId || !token) {
      message.error("Không tìm thấy thông tin người dùng!");
      setIsPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/employee/${cleanerId}/change_password`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: oldPassword,
            newPassword: newPassword,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }

      message.success("Mật khẩu đã được thay đổi thành công!");
      dispatch({ type: "LOGOUT" });
      message.info("Bạn sẽ được chuyển hướng đến trang đăng nhập sau 3 giây.");
      setTimeout(() => {
        navigate("/homeclean/login/cleaner");
      }, 3000);
      setIsPasswordModalVisible(false);
    } catch (error) {
      setOldPasswordError("Mật khẩu hiện tại không đúng");
      message.error("Thay đổi mật khẩu thất bại!");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  useEffect(() => {
    if (cleaner) {
      // Nếu có thông tin cleaner trong context, cập nhật các trường input
      setName(cleaner.cleanerName || "");
      setPhone(cleaner.cleanerPhone || "");
      setEmail(cleaner.cleanerEmail || "");
      setAge(cleaner.cleanerAge || "");
      setAddress(cleaner.cleanerAddress || "");
      setIdentityNumber(cleaner.cleanerIDnum || "");
      setExperience(cleaner.cleanerExp || "");
      if (cleaner.profile_image) {
        setImg(`data:image/png;base64,${cleaner.profile_image}`);
      } else {
        setImg(profileImg); // Ảnh mặc định nếu không có ảnh từ API
      }
    } else {
      // Nếu không có thông tin cleaner, reset các giá trị về mặc định
      setName("");
      setPhone("");
      setEmail("");
      setAge("");
      setAddress("");
      setIdentityNumber("");
      setExperience("");
      setImg(profileImg);
    }
  }, [cleaner]);

  return (
    <div className="persona-container">
      <div className="persona-header">
        <strong>Thông tin cá nhân</strong>
        <p className="persona-subtext">
          Quản lý thông tin cá nhân của tài khoản bạn
        </p>
      </div>

      <div className="avatar-section">
        <b>Ảnh đại diện</b>
        <img className="avatar-image" src={cleanerImg} alt="icon" />
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
        <label htmlFor="avatar-upload">
          <b>
            <u className="avatar-select">Chọn ảnh</u>
          </b>
        </label>
      </div>

      <div className="form-group">
        <b>Họ và tên</b>
        <input
          type="text"
          value={cleanerName}
          onChange={(e) => {
            setName(e.target.value);
            setNameError(""); // Clear error on change
          }}
        />
        {nameError && <div className="error-message">{nameError}</div>}
      </div>

      <div className="form-group">
        <b>Số điện thoại</b>
        <input
          type="text"
          value={cleanerPhone}
          onChange={(e) => {
            setPhone(e.target.value);
            setPhoneError(""); // Clear error on change
          }}
        />
        {phoneError && <div className="error-message">{phoneError}</div>}
      </div>

      <div className="form-group">
        <b>Email</b>
        <input
          type="email"
          value={cleanerEmail}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(""); // Clear error on change
          }}
        />
        {emailError && <div className="error-message">{emailError}</div>}
      </div>

      <div className="form-group">
        <b>Tuổi</b>
        <input
          type="text"
          value={cleanerAge}
          onChange={(e) => {
            setAge(e.target.value);
            setAgeError(""); // Clear error on change
          }}
        />
        {ageError && <div className="error-message">{ageError}</div>}
      </div>

      <div className="form-group">
        <b>Số CCCD</b>
        <input
          type="text"
          value={cleanerIDnum}
          readOnly
          style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
        />
      </div>

      <div className="form-group">
        <b>Kinh nghiệm</b>
        <input
          type="text"
          value={cleanerExp}
          onChange={(e) => {
            setExperience(e.target.value);
            setExperienceError(""); // Clear error on change
          }}
        />
        {experienceError && (
          <div className="error-message">{experienceError}</div>
        )}
      </div>

      {/* Nút Lưu và Đăng xuất */}
      <div className="button-group" style={{ width: "100%" }}>
        <button
          className="save-button"
          type="button"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Đang lưu..." : "Lưu"}
        </button>
        <button
          className="save-button"
          style={{ backgroundColor: "#f70003" }}
          type="button"
          onClick={showDeleteConfirm}
          disabled={isDeleteLoading}
        >
          {isDeleteLoading ? "Đang xóa..." : "Xoá tài khoản"}
        </button>
        <button
          className="save-button"
          style={{ backgroundColor: "#1890ff" }}
          type="button"
          onClick={showPasswordModal}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* Modal xác nhận xóa tài khoản */}
      <Modal
        title="Xác nhận xóa tài khoản"
        open={isDeleteModalVisible}
        onOk={deleteAccountAPI}
        onCancel={() => setIsDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{
          style: { backgroundColor: "#ff4d4f" },
          loading: isDeleteLoading,
        }}
      >
        <p>
          Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn
          tác.
        </p>
      </Modal>

      {/* Modal đổi mật khẩu */}
      <Modal
        title="Đổi mật khẩu"
        open={isPasswordModalVisible}
        onOk={handleChangePassword}
        onCancel={() => setIsPasswordModalVisible(false)}
        okText="Đổi mật khẩu"
        cancelText="Hủy"
        okButtonProps={{
          style: { backgroundColor: "#1890ff" },
          loading: isPasswordLoading,
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Mật khẩu hiện tại:
          </label>
          <Input.Password
            value={oldPassword}
            onChange={(e) => {
              setOldPassword(e.target.value);
              setOldPasswordError("");
            }}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
          {oldPasswordError && (
            <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {oldPasswordError}
            </div>
          )}
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Mật khẩu mới:
          </label>
          <Input.Password
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setNewPasswordError("");
            }}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
          {newPasswordError && (
            <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {newPasswordError}
            </div>
          )}
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Xác nhận mật khẩu mới:
          </label>
          <Input.Password
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setConfirmPasswordError("");
            }}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
          {confirmPasswordError && (
            <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
              {confirmPasswordError}
            </div>
          )}
        </div>
        <p style={{ marginTop: "8px", color: "#999" }}>
          Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất 1 ký tự đặc biệt.
        </p>
      </Modal>
    </div>
  );
};
