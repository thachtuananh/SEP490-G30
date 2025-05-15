import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import "../owner/profile.css";
import profileImg from "../../../assets/imgProfile/imgProfile.svg";
import { message, Modal, Input } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons"; // Import icons
import { BASE_URL } from "../../../utils/config";
import {
  validatePhone,
  validateName,
  validatePassword,
  validateConfirmPassword,
  validateEmail,
} from "../../../utils/validate"; // Assuming this is the correct path

export const PersonaInformation = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const navigate = useNavigate();

  // State for form fields
  const [customerName, setName] = useState(user?.customerName || "");
  const [customerPhone, setPhone] = useState(user?.customerPhone || "");
  const [customerEmail, setEmail] = useState(user?.customerEmail || "");
  const [customerImg, setImg] = useState(user?.customerImg || "");
  const [profileImageBase64, setProfileImageBase64] = useState(""); // New state for base64 image

  // State for password change
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Convert image file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        // Remove the "data:image/jpeg;base64," part to get only the base64 string
        const base64String = fileReader.result.split(",")[1];
        resolve(base64String);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // Make sure data is updated when the context changes
  useEffect(() => {
    if (user) {
      setName(user.customerName || "");
      setPhone(user.customerPhone || "");
      setEmail(user.customerEmail || "");
      if (user.customerImg) {
        setImg(`data:image/png;base64,${user.customerImg}`);
      } else {
        setImg(profileImg); // Ảnh mặc định nếu không có ảnh từ API
      }
    } else {
      setName("");
      setPhone("");
      setEmail("");
      setImg(profileImg);
    }
  }, [user]);

  // Hàm mở modal xác nhận xóa tài khoản
  const showDeleteConfirm = () => {
    setIsDeleteModalVisible(true);
  };

  // Hàm mở modal đổi mật khẩu
  const showPasswordModal = () => {
    setIsPasswordModalVisible(true);
    // Reset password fields when opening modal
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => {
      // This ensures browsers don't auto-fill the password fields
      const passwordInputs = document.querySelectorAll(
        'input[type="password"]'
      );
      passwordInputs.forEach((input) => {
        input.value = "";
      });
    }, 50);
  };

  // Validate form fields
  const validateFormFields = () => {
    const nameValidation = validateName(customerName);
    const phoneValidation = validatePhone(customerPhone);
    const emailValidation = validateEmail(customerEmail);

    // Show error messages using Ant Design message
    if (nameValidation) {
      message.error(nameValidation);
      return false;
    }

    if (phoneValidation) {
      message.error(phoneValidation);
      return false;
    }

    if (emailValidation) {
      message.error(emailValidation);
      return false;
    }

    return true;
  };

  // Function to call the API and update user profile
  const handleSave = async () => {
    // Validate form fields before submitting
    if (!validateFormFields()) {
      return;
    }

    try {
      setLoading(true);

      // Get customerId and token from sessionStorage
      const customerId = sessionStorage.getItem("customerId");
      const token = sessionStorage.getItem("token");

      if (!customerId || !token) {
        throw new Error("User information not found");
      }

      const requestBody = {
        fullName: customerName,
        email: customerEmail,
      };
      if (profileImageBase64) {
        requestBody.profile_image = profileImageBase64;
      }
      // API call to update profile
      const response = await fetch(
        `${BASE_URL}/customer/${customerId}/profile`,
        {
          method: "PATCH",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const updatedData = await response.json();

      // Update user in context
      if (response.ok) {
        dispatch({
          type: "UPDATE_USER",
          payload: {
            ...user,
            customerName: customerName,
            customerEmail: customerEmail,
            profile_image: profileImageBase64 || user?.profile_image,
          },
        });
        message.success("Thông tin cá nhân đã được cập nhật!");
      } else {
        message.error(updatedData.message || "Cập nhật thông tin thất bại!");
        return;
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Không thể cập nhật thông tin. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const deleteAccountAPI = async () => {
    const token = sessionStorage.getItem("token");
    const customerId = sessionStorage.getItem("customerId");
    if (!customerId || !token) {
      message.error("Không tìm thấy thông tin người dùng!");
      return;
    }

    setIsDeleteLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/customer/${customerId}/delete_account`,
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
      navigate("/login/user");
    } catch (error) {
      message.error("Xóa tài khoản thất bại!");
    } finally {
      setIsDeleteLoading(false);
      setIsDeleteModalVisible(false);
    }
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

    if (oldPasswordValidation) {
      message.error(oldPasswordValidation);
      return false;
    }

    if (newPasswordValidation) {
      message.error(newPasswordValidation);
      return false;
    }

    if (confirmPasswordValidation) {
      message.error(confirmPasswordValidation);
      return false;
    }

    return true;
  };

  // Function to handle password change API call
  const handleChangePassword = async () => {
    // Validate passwords using imported validation functions
    if (!validatePasswordFields()) {
      return;
    }

    setIsPasswordLoading(true);

    const token = sessionStorage.getItem("token");
    const customerId = sessionStorage.getItem("customerId");

    if (!customerId || !token) {
      message.error("Không tìm thấy thông tin người dùng!");
      setIsPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/customer/${customerId}/change_password`,
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

      // message.success("Mật khẩu đã được thay đổi thành công!");
      dispatch({ type: "LOGOUT" });
      message.info("Bạn sẽ được chuyển hướng đến trang đăng nhập sau 3 giây.");
      setTimeout(() => {
        navigate("/login/user");
      }, 3000);
      setIsPasswordModalVisible(false);
    } catch (error) {
      message.error("Mật khẩu hiện tại không đúng");
      setIsPasswordLoading(false);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        // Display preview of the image
        const reader = new FileReader();
        reader.onloadend = () => {
          setImg(reader.result);
        };
        reader.readAsDataURL(file);

        // Convert image to base64 for API
        const base64 = await convertToBase64(file);
        setProfileImageBase64(base64);

        message.success(
          "Tải ảnh lên thành công. Hãy nhấn nút Lưu để cập nhật!"
        );
      } catch (error) {
        message.error("Lỗi khi xử lý ảnh!");
        console.error("Error processing image:", error);
      }
    }
  };

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
        <img className="avatar-image" src={customerImg} alt="icon" />
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
        <b className="input-label">Họ và tên</b>
        <input
          className="input-field"
          type="text"
          name="name"
          value={customerName}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <b>Số điện thoại</b>
        <input
          className="input-field"
          type="text"
          value={customerPhone}
          readOnly
          style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
        />
      </div>

      <div className="form-group">
        <b className="input-label">Email</b>
        <input
          className="input-field"
          type="email"
          name="email"
          value={customerEmail}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Save button */}
      <div className="button-group" style={{ width: "100%" }}>
        <button
          className="save-button"
          type="button"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Lưu"}
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
            onChange={(e) => setOldPassword(e.target.value)}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
            autoComplete="new-password"
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Mật khẩu mới:
          </label>
          <Input.Password
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Xác nhận mật khẩu mới:
          </label>
          <Input.Password
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </div>
        <p style={{ marginTop: "8px", color: "#999" }}>
          Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất 1 ký tự đặc biệt.
        </p>
      </Modal>
    </div>
  );
};
