import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import "../owner/profile.css";
import profileImg from "../../../assets/imgProfile/imgProfile.svg";
import { message, Modal } from "antd";
import { BASE_URL } from "../../../utils/config";

export const PersonaInformation = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const navigate = useNavigate();

  // State for form fields
  const [customerName, setName] = useState(user?.customerName || "");
  const [customerPhone, setPhone] = useState(user?.customerPhone || "");

  // Make sure data is updated when the context changes
  useEffect(() => {
    if (user) {
      setName(user.customerName || "");
      setPhone(user.customerPhone || "");
    }
  }, [user]);

  // Hàm mở modal xác nhận xóa tài khoản
  const showDeleteConfirm = () => {
    setIsDeleteModalVisible(true);
  };

  // Function to call the API and update user profile
  const handleSave = async () => {
    try {
      setLoading(true);

      // Get customerId and token from localStorage
      const customerId = localStorage.getItem("customerId");
      const token = localStorage.getItem("token");

      if (!customerId || !token) {
        throw new Error("User information not found");
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
          body: JSON.stringify({
            fullName: customerName,
            phone: customerPhone,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedData = await response.json();

      // Update user in context
      dispatch({
        type: "UPDATE_USER",
        payload: {
          ...user,
          customerName: customerName,
          customerPhone: customerPhone,
        },
      });

      message.success("Thông tin cá nhân đã được cập nhật!");
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Không thể cập nhật thông tin. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const deleteAccountAPI = async () => {
    const token = localStorage.getItem("token");
    const customerId = localStorage.getItem("customerId");
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
      navigate("/login");
    } catch (error) {
      message.error("Xóa tài khoản thất bại!");
    } finally {
      setIsDeleteLoading(false);
      setIsDeleteModalVisible(false);
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
        <img className="avatar-image" src={profileImg} alt="icon" />
        <b>
          <u className="avatar-select">Chọn ảnh</u>
        </b>
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
          name="phone"
          value={customerPhone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {/* Save button */}
      <div className="button-group">
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
    </div>
  );
};
