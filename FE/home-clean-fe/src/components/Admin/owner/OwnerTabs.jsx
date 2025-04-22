import React, { useState } from "react";
import {
  Tabs,
  Descriptions,
  Badge,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import JobHistoryTable from "../owner/JobHistoryTable";
import axios from "axios";
import { BASE_URL } from "../../../utils/config";

const OwnerTabs = ({
  ownerData,
  createJobHistory,
  bookingHistory,
  isMobile,
  isTablet,
  navigate,
  handleDelete,
  refreshData,
}) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [accountActive, setAccountActive] = useState(!ownerData?.is_deleted);

  // Function to format date and time
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${formattedDate} ${formattedTime}`;
  };

  // Responsive settings for Descriptions component
  const getDescriptionsLayout = () => {
    return {
      bordered: true,
      column: isMobile ? 1 : { xxl: 1, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 },
      size: isMobile ? "small" : "middle",
    };
  };

  const showEditModal = () => {
    setAccountActive(!ownerData.is_deleted);
    form.setFieldsValue({
      fullName: ownerData.name,
      phone: ownerData.phone,
      email: ownerData.email,
    });
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
  };

  const handleAccountStatusChange = (isActive) => {
    setAccountActive(isActive);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const token = sessionStorage.getItem("token");
      const customerId = ownerData.id || ownerData.customerId;

      // The API expects false for active accounts and true for inactive accounts
      const accountStatus = !accountActive;

      const response = await fetch(
        `${BASE_URL}/admin/customers/${customerId}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
          body: JSON.stringify({
            phone: values.phone,
            fullName: values.fullName,
            email: values.email,
            accountStatus: accountStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update owner");
      }

      message.success("Cập nhật thông tin thành công");
      setIsEditModalVisible(false);

      // Refresh data after update
      if (refreshData) {
        refreshData();
      }
    } catch (error) {
      console.error("Error updating owner:", error);
      message.error("Không thể cập nhật thông tin. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Tab items configuration
  const tabItems = [
    {
      key: "basic",
      label: "Thông tin cơ bản",
      children: (
        <>
          <Descriptions {...getDescriptionsLayout()}>
            <Descriptions.Item label="Họ và tên">
              {ownerData?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {ownerData?.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {ownerData?.email || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {ownerData?.is_deleted === false ? (
                <Badge status="success" text="Đang hoạt động" />
              ) : (
                <Badge status="error" text="Không hoạt động" />
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {ownerData ? formatDateTime(ownerData.created_at) : ""}
            </Descriptions.Item>
          </Descriptions>

          <div
            style={{
              marginTop: 24,
              display: "flex",
              justifyContent: isMobile ? "center" : "flex-end",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <Space>
              {!ownerData.is_deleted && (
                <Button danger onClick={handleDelete}>
                  Xoá người dùng
                </Button>
              )}
              <Button type="primary" onClick={showEditModal}>
                Chỉnh sửa
              </Button>
            </Space>
          </div>
        </>
      ),
    },
    {
      key: "createJobHistory",
      label: "Lịch sử đăng việc",
      children: (
        <JobHistoryTable
          jobData={createJobHistory}
          isMobile={isMobile}
          isTablet={isTablet}
          navigate={navigate}
          title="Thống kê công việc đã đăng"
        />
      ),
    },
    {
      key: "bookingHistory",
      label: "Lịch sử đặt việc",
      children: (
        <JobHistoryTable
          jobData={bookingHistory}
          isMobile={isMobile}
          isTablet={isTablet}
          navigate={navigate}
          title="Thống kê công việc đã đặt"
        />
      ),
    },
  ];

  return (
    <>
      <Tabs
        defaultActiveKey="basic"
        items={tabItems}
        size={isMobile ? "small" : "middle"}
      />

      <Modal
        title="Chỉnh sửa thông tin Owner"
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={[
          <Button key="back" onClick={handleEditCancel}>
            Huỷ
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleEditSubmit}
          >
            Cập nhật
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            fullName: ownerData?.name,
            phone: ownerData?.phone,
            email: ownerData?.email,
          }}
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập họ và tên",
              },
            ]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số điện thoại",
              },
              {
                pattern: /^[0-9]+$/,
                message: "Số điện thoại chỉ được chứa số",
              },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập email",
              },
              {
                type: "email",
                message: "Email không đúng định dạng",
              },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item label="Trạng thái tài khoản">
            <Input.Group compact>
              <Button
                type={accountActive ? "primary" : "default"}
                onClick={() => handleAccountStatusChange(true)}
                style={{ width: "50%" }}
              >
                Đang hoạt động
              </Button>
              <Button
                type={!accountActive ? "primary" : "default"}
                onClick={() => handleAccountStatusChange(false)}
                style={{ width: "50%" }}
              >
                Không hoạt động
              </Button>
            </Input.Group>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default OwnerTabs;
