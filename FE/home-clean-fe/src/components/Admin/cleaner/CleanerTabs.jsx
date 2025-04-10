import React, { useState, useEffect } from "react";
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
import JobHistoryTable from "../cleaner/JobHistoryTable";
import { BASE_URL } from "../../../utils/config";

const CleanerTabs = ({
  cleanerData,
  jobHistory,
  jobHistoryBooked,
  isMobile,
  isTablet,
  navigate,
  handleDelete,
  refreshData,
}) => {
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isVerificationModalVisible, setIsVerificationModalVisible] =
    useState(false);
  const [profileForm] = Form.useForm();
  const [verificationForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Add state variables to track button selections
  const [identityVerified, setIdentityVerified] = useState(
    cleanerData?.identity_verified
  );
  const [accountActive, setAccountActive] = useState(!cleanerData?.is_deleted);

  // Format date and time function
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString("vi-VN");
    const formattedTime = date.toLocaleTimeString("vi-VN");
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

  const showEditModalProfile = () => {
    profileForm.setFieldsValue({
      name: cleanerData.name,
      phone: cleanerData.phone,
      email: cleanerData.email,
      age: cleanerData.age,
      experience: cleanerData.experience,
    });
    setIsProfileModalVisible(true);
  };

  const showEditModalVerification = () => {
    // Set state variables when opening the modal
    setIdentityVerified(cleanerData.identity_verified);
    setAccountActive(!cleanerData.is_deleted);

    verificationForm.setFieldsValue({
      identityNumber: cleanerData.identity_number,
      identityVerified: cleanerData.identity_verified,
      accountStatus: cleanerData.is_deleted,
    });
    setIsVerificationModalVisible(true);
  };

  const handleProfileCancel = () => {
    setIsProfileModalVisible(false);
  };

  const handleVerificationCancel = () => {
    setIsVerificationModalVisible(false);
  };

  const handleProfileSubmit = async () => {
    try {
      const values = await profileForm.validateFields();
      setLoading(true);

      const token = localStorage.getItem("token");
      const cleanerId = cleanerData.id || cleanerData.cleanerId;

      const response = await fetch(
        `${BASE_URL}/admin/cleaners/${cleanerId}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
          body: JSON.stringify({
            name: values.name,
            phone: values.phone,
            email: values.email,
            age: parseInt(values.age),
            experience: values.experience,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update cleaner");
      }

      message.success("Cập nhật thông tin cơ bản thành công");
      setIsProfileModalVisible(false);

      // Refresh data after update
      if (refreshData) {
        refreshData();
      }
    } catch (error) {
      message.error("Không thể cập nhật thông tin. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async () => {
    try {
      const values = await verificationForm.validateFields();
      setLoading(true);

      const token = localStorage.getItem("token");
      const cleanerId = cleanerData.id || cleanerData.cleanerId;

      // Lấy giá trị hiện tại từ state, không phụ thuộc vào validateFields()
      // Đây là trạng thái thực tế được theo dõi bởi các nút trong form
      const identityVerified =
        values.identityVerified !== undefined
          ? values.identityVerified
          : cleanerData.identity_verified;
      const isDeleted =
        values.accountStatus !== undefined
          ? values.accountStatus
          : cleanerData.is_deleted;

      // Using the updated API endpoint from the requirements
      const response = await fetch(
        `${BASE_URL}/admin/cleaners/${cleanerId}/identity-verified?identityVerified=${identityVerified}&isDeleted=${isDeleted}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update cleaner verification");
      }

      message.success("Cập nhật thông tin xác thực thành công");
      setIsVerificationModalVisible(false);

      // Refresh data after update
      if (refreshData) {
        refreshData();
      }
    } catch (error) {
      message.error("Không thể cập nhật thông tin. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Handle identity verification status change
  const handleIdentityVerifiedChange = (value) => {
    setIdentityVerified(value);
    verificationForm.setFieldsValue({ identityVerified: value });
  };

  // Handle account status change
  const handleAccountStatusChange = (isActive) => {
    setAccountActive(isActive);
    verificationForm.setFieldsValue({ accountStatus: !isActive });
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
              {cleanerData?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {cleanerData?.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {cleanerData?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Tuổi">
              {cleanerData?.age}
            </Descriptions.Item>
            <Descriptions.Item label="Kinh nghiệm">
              {cleanerData?.experience}
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
              {!cleanerData.is_deleted && (
                <Button danger onClick={handleDelete}>
                  Xoá người dùng
                </Button>
              )}
              <Button type="primary" onClick={showEditModalProfile}>
                Chỉnh sửa
              </Button>
            </Space>
          </div>
        </>
      ),
    },
    {
      key: "accountVerification",
      label: "Thông tin tài khoản & xác thực",
      children: (
        <>
          <Descriptions {...getDescriptionsLayout()}>
            <Descriptions.Item label="CMND/CCCD">
              {cleanerData?.identity_number}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái xác minh">
              {cleanerData?.identity_verified ? (
                <Badge status="success" text="Đã xác minh" />
              ) : (
                <Badge status="error" text="Chưa xác minh" />
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {cleanerData?.created_at &&
                formatDateTime(cleanerData.created_at)}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">
              {cleanerData?.updated_at &&
                formatDateTime(cleanerData.updated_at)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái tài khoản">
              <Badge
                status={cleanerData?.is_deleted ? "error" : "success"}
                text={
                  cleanerData?.is_deleted ? "Không hoạt động" : "Đang hoạt động"
                }
              />
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
              {!cleanerData.is_deleted && (
                <Button danger onClick={handleDelete}>
                  Xoá người dùng
                </Button>
              )}
              <Button type="primary" onClick={showEditModalVerification}>
                Chỉnh sửa
              </Button>
            </Space>
          </div>
        </>
      ),
    },
    {
      key: "jobHistory",
      label: "Lịch sử công việc",
      children: (
        <JobHistoryTable
          jobData={jobHistory}
          isMobile={isMobile}
          isTablet={isTablet}
          navigate={navigate}
          title="Thống kê lịch sử công việc"
        />
      ),
    },
    {
      key: "jobHistoryBooked",
      label: "Lịch công việc được đặt",
      children: (
        <JobHistoryTable
          jobData={jobHistoryBooked}
          isMobile={isMobile}
          isTablet={isTablet}
          navigate={navigate}
          title="Thống kê lịch đặt"
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

      {/* Modal cho thông tin cơ bản */}
      <Modal
        title="Chỉnh sửa thông tin cơ bản"
        open={isProfileModalVisible}
        onCancel={handleProfileCancel}
        footer={[
          <Button key="back" onClick={handleProfileCancel}>
            Huỷ
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleProfileSubmit}
          >
            Cập nhật
          </Button>,
        ]}
      >
        <Form
          form={profileForm}
          layout="vertical"
          initialValues={{
            name: cleanerData?.name,
            phone: cleanerData?.phone,
            email: cleanerData?.email,
            age: cleanerData?.age,
            experience: cleanerData?.experience,
          }}
        >
          <Form.Item
            name="name"
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
                message: "Vui lòng nhập đúng định dạng email",
              },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="age"
            label="Tuổi"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tuổi",
              },
              {
                pattern: /^[0-9]+$/,
                message: "Tuổi phải là số",
              },
            ]}
          >
            <Input placeholder="Nhập tuổi" />
          </Form.Item>

          <Form.Item name="experience" label="Kinh nghiệm">
            <Input placeholder="Nhập kinh nghiệm" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal cho thông tin xác thực */}
      <Modal
        title="Chỉnh sửa thông tin xác thực"
        open={isVerificationModalVisible}
        onCancel={handleVerificationCancel}
        footer={[
          <Button key="back" onClick={handleVerificationCancel}>
            Huỷ
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleVerificationSubmit}
          >
            Cập nhật
          </Button>,
        ]}
      >
        <Form
          form={verificationForm}
          layout="vertical"
          initialValues={{
            identityNumber: cleanerData?.identity_number,
            identityVerified: cleanerData?.identity_verified,
            accountStatus: cleanerData?.is_deleted,
          }}
        >
          <Form.Item name="identityNumber" label="CMND/CCCD">
            <Input placeholder="Số CMND/CCCD" disabled />
          </Form.Item>

          <Form.Item name="identityVerified" label="Trạng thái xác minh">
            <Input.Group compact>
              <Button
                type={identityVerified ? "primary" : "default"}
                onClick={() => handleIdentityVerifiedChange(true)}
                style={{ width: "50%" }}
              >
                Đã xác minh
              </Button>
              <Button
                type={!identityVerified ? "primary" : "default"}
                onClick={() => handleIdentityVerifiedChange(false)}
                style={{ width: "50%" }}
              >
                Chưa xác minh
              </Button>
            </Input.Group>
          </Form.Item>

          <Form.Item name="accountStatus" label="Trạng thái tài khoản">
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

export default CleanerTabs;
