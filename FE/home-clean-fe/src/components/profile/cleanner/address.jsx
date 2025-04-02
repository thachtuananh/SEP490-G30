import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { message, Modal, Input, Button } from "antd";
import { BASE_URL } from "../../../utils/config";
import "../owner/profile.css";

export const Address = () => {
  const { cleaner, dispatch } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [updateAddress, setUpdateAddress] = useState("");
  const [currentAddressId, setCurrentAddressId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAddresses = async () => {
    const token = localStorage.getItem("token");
    const cleanerId = localStorage.getItem("cleanerId");

    if (token && cleanerId) {
      try {
        const response = await fetch(
          `${BASE_URL}/employee/${cleanerId}/all-addresses`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (response.ok) {
          const responseData = await response.json();

          // Use the actual id and is_current from the API response
          const formattedAddresses = responseData.data.map((item) => ({
            id: item.id,
            address: item.address,
            isDefault: item.is_current,
            name: cleaner?.cleanerName || "",
            phone: cleaner?.cleanerPhone || "",
          }));

          setAddresses(formattedAddresses);
        } else {
          message.error("Không thể lấy danh sách địa chỉ.");
        }
      } catch (error) {
        message.error("Lỗi máy chủ, vui lòng thử lại sau.");
      }
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [dispatch]);

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleAddCancel = () => {
    setIsAddModalVisible(false);
    setNewAddress("");
  };

  const showUpdateModal = (addressId, currentAddress) => {
    setCurrentAddressId(addressId);
    setUpdateAddress(currentAddress);
    setIsUpdateModalVisible(true);
  };

  const handleUpdateCancel = () => {
    setIsUpdateModalVisible(false);
    setUpdateAddress("");
    setCurrentAddressId(null);
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim()) {
      message.error("Vui lòng nhập địa chỉ.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    const cleanerId = localStorage.getItem("cleanerId");

    try {
      const response = await fetch(
        `${BASE_URL}/employee/${cleanerId}/create_address`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ address: newAddress }),
        }
      );

      if (response.ok) {
        message.success("Thêm địa chỉ mới thành công!");
        setIsAddModalVisible(false);
        setNewAddress("");
        fetchAddresses(); // Refresh the addresses list
      } else {
        message.error("Không thể thêm địa chỉ mới.");
      }
    } catch (error) {
      message.error("Lỗi máy chủ, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddressSubmit = async () => {
    if (!updateAddress.trim()) {
      message.error("Vui lòng nhập địa chỉ.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    const cleanerId = localStorage.getItem("cleanerId");

    try {
      console.log("Updating address:", updateAddress); // Debug log

      const response = await fetch(
        `${BASE_URL}/employee/${cleanerId}/update_address/${currentAddressId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ address: updateAddress }),
        }
      );

      if (response.ok) {
        message.success("Cập nhật địa chỉ thành công!");
        setIsUpdateModalVisible(false);
        setUpdateAddress("");
        setCurrentAddressId(null);
        fetchAddresses(); // Refresh the addresses list
      } else {
        message.error("Không thể cập nhật địa chỉ.");
      }
    } catch (error) {
      message.error("Lỗi máy chủ, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa địa chỉ này không?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        const token = localStorage.getItem("token");
        try {
          const response = await fetch(
            `${BASE_URL}/employee/${addressId}/delete_address`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

          if (response.ok) {
            message.success("Xóa địa chỉ thành công!");
            fetchAddresses(); // Refresh the addresses list
          } else {
            message.error("Không thể xóa địa chỉ.");
          }
        } catch (error) {
          message.error("Lỗi máy chủ, vui lòng thử lại sau.");
        }
      },
    });
  };

  return (
    <div className="address-container">
      <div className="address-header">
        <div>
          <b>Địa chỉ của bạn</b>
          <p className="address-subtext">Quản lý thông tin địa chỉ của bạn</p>
        </div>
        <button className="add-address-button" onClick={showAddModal}>
          + Thêm địa chỉ mới
        </button>
      </div>

      <div
        className="address-list"
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        {addresses && addresses.length > 0 ? (
          addresses.map((address) => (
            <div
              key={address.id}
              className="address-item"
              style={{
                padding: "16px",
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                position: "relative",
              }}
            >
              <div
                className="address-info"
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <b style={{ fontSize: "16px", marginRight: "15px" }}>
                  {address.name || cleaner?.cleanerName || "Không có tên"}
                </b>
                <p style={{ color: "#666", margin: "0" }}>
                  {address.phone ||
                    cleaner?.cleanerPhone ||
                    "Không có số điện thoại"}
                </p>
                {address.isDefault && (
                  <div
                    className="default-badge"
                    style={{
                      backgroundColor: "#00a651",
                      color: "white",
                      borderRadius: "4px",
                      fontSize: "12px",
                      marginLeft: "10px",
                      padding: "2px 6px",
                    }}
                  >
                    <b>Mặc định</b>
                  </div>
                )}
              </div>
              <p
                className="address-text"
                style={{
                  margin: "0 0 15px",
                  fontSize: "15px",
                  lineHeight: "1.5",
                  width: "30%",
                }}
              >
                {address.address || "Chưa có địa chỉ"}
              </p>

              <div
                className="address-actions"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "1px solid #f0f0f0",
                  paddingTop: "10px",
                }}
              >
                <div style={{ display: "flex", gap: "15px" }}>
                  <b
                    className="update-button"
                    onClick={() => showUpdateModal(address.id, address.address)}
                    style={{
                      color: "#00a651",
                      cursor: "pointer",
                      transition: "color 0.3s",
                    }}
                  >
                    Cập nhật
                  </b>
                  <b
                    className="delete-button"
                    onClick={() => handleDeleteAddress(address.id)}
                    style={{
                      color: "#ff4d4f",
                      cursor: "pointer",
                      transition: "color 0.3s",
                    }}
                  >
                    Xóa
                  </b>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p
            style={{
              textAlign: "center",
              padding: "20px",
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
          >
            Không có địa chỉ nào.
          </p>
        )}
      </div>

      {/* Add Address Modal */}
      <Modal
        title="Thêm địa chỉ mới"
        visible={isAddModalVisible}
        onCancel={handleAddCancel}
        footer={[
          <Button key="back" onClick={handleAddCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleAddAddress}
          >
            Thêm
          </Button>,
        ]}
      >
        <Input.TextArea
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          placeholder="Nhập địa chỉ mới"
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
      </Modal>

      {/* Update Address Modal */}
      <Modal
        title="Cập nhật địa chỉ"
        visible={isUpdateModalVisible}
        onCancel={handleUpdateCancel}
        footer={[
          <Button key="back" onClick={handleUpdateCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleUpdateAddressSubmit}
          >
            Cập nhật
          </Button>,
        ]}
      >
        <Input.TextArea
          value={updateAddress}
          onChange={(e) => {
            console.log("New value:", e.target.value); // Debug log
            setUpdateAddress(e.target.value);
          }}
          placeholder="Nhập địa chỉ mới"
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
      </Modal>
    </div>
  );
};
