import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import "../owner/profile.css";
import profileImg from "../../../assets/imgProfile/imgProfile.svg";
import { message, Modal } from "antd";
import { BASE_URL } from "../../../utils/config";

export const PersonaInformation = () => {
  const { cleaner, dispatch } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
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

  // Updated API call function - removed identity_number from the request body
  const updateProfileAPI = async () => {
    const token = localStorage.getItem("token");
    const cleanerId = localStorage.getItem("cleanerId");
    if (!cleanerId || !token) {
      message.error("Không tìm thấy thông tin người dùng!");
      return;
    }

    setIsLoading(true);
    try {
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
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <b>Số điện thoại</b>
        <input
          type="text"
          value={cleanerPhone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="form-group">
        <b>Email</b>
        <input
          type="email"
          value={cleanerEmail}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <b>Tuổi</b>
        <input
          type="text"
          value={cleanerAge}
          onChange={(e) => setAge(e.target.value)}
        />
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
          onChange={(e) => setExperience(e.target.value)}
        />
      </div>

      {/* Nút Lưu và Đăng xuất */}
      <div className="button-group">
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
