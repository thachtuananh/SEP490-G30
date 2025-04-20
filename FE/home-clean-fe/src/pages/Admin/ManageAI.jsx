import React, { useState } from "react";
import {
  Layout,
  Typography,
  Button,
  Upload,
  message,
  Card,
  Breadcrumb,
  Space,
  Row,
  Col,
  Modal,
  Empty,
  List,
  Divider,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  FileOutlined,
  FilePdfOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import AppSidebar from "../../components/Admin/AppSidebar";
import AppHeader from "../../components/Admin/AppHeader";
import axios from "axios";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Dragger } = Upload;
const { confirm } = Modal;

const ManageAI = () => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [collapsed, setCollapsed] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Determine responsive settings based on window width
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 992;

  // Track window resize
  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Auto-collapse sidebar on smaller screens
      if (window.innerWidth < 768) {
        setCollapsed(true);
      } else if (window.innerWidth >= 992) {
        setCollapsed(false);
      }
    };

    // Set initial state based on screen size
    if (window.innerWidth < 768) {
      setCollapsed(true);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    // Create FormData
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      // Make API call
      const response = await axios.post(
        "http://localhost:8080/consultation/uploadDocument",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            accept: "application/json",
          },
        }
      );

      // Handle success
      setLoading(false);
      onSuccess(response, file);
      message.success(`${file.name} đã được tải lên thành công`);

      // Update uploadedFiles list
      setUploadedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          uploadTime: new Date().toLocaleString(),
          size: (file.size / 1024).toFixed(2) + " KB",
        },
      ]);
    } catch (error) {
      setLoading(false);
      onError(error);
      message.error(`Tải lên thất bại: ${error.message}`);
    }
  };

  const deleteAllData = () => {
    confirm({
      title: "Xóa tất cả dữ liệu",
      icon: <ExclamationCircleOutlined />,
      content:
        "Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        setDeleteLoading(true);
        try {
          await axios.post(
            "http://localhost:8080/consultation/deleteCollection",
            {},
            {
              headers: {
                accept: "application/json",
              },
            }
          );
          setDeleteLoading(false);
          message.success("Đã xóa tất cả dữ liệu thành công");
          setUploadedFiles([]);
        } catch (error) {
          setDeleteLoading(false);
          message.error(`Xóa thất bại: ${error.message}`);
        }
      },
    });
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    fileList,
    accept: ".pdf",
    customRequest: handleUpload,
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        setFileList(info.fileList);
      }
      if (status === "done") {
        setFileList([]);
      } else if (status === "error") {
        setFileList([]);
      }
    },
    beforeUpload: (file) => {
      const isPDF = file.type === "application/pdf";
      if (!isPDF) {
        message.error("Chỉ chấp nhận tệp PDF!");
      }
      return isPDF || Upload.LIST_IGNORE;
    },
    onRemove: (file) => {
      setFileList((prev) => {
        const index = prev.indexOf(file);
        const newFileList = prev.slice();
        newFileList.splice(index, 1);
        return newFileList;
      });
    },
  };

  // Updated breadcrumb items
  const breadcrumbItems = [
    {
      title: <HomeOutlined />,
    },
    {
      title: (
        <>
          <FileOutlined />
          <span>Quản lý tài liệu</span>
        </>
      ),
    },
  ];

  // Update margin for layout
  const sidebarWidth = collapsed ? 80 : windowWidth < 1200 ? 180 : 220;

  const contentStyle = {
    margin: isMobile ? "8px 8px 8px 4px" : isTablet ? "16px 8px" : "24px 16px",
    padding: isMobile ? 8 : isTablet ? 16 : 24,
    background: "#fff",
    minHeight: 280,
    transition: "all 0.2s",
  };

  const layoutStyle = {
    marginLeft: isMobile ? "60px" : `${sidebarWidth}px`,
    transition: "all 0.2s",
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppSidebar />
      <Layout style={layoutStyle}>
        <AppHeader collapsed={collapsed} onToggle={toggleSidebar} />
        <Content style={contentStyle}>
          <Row gutter={[24, 24]} style={{ marginBottom: 16 }}>
            <Col xs={24}>
              <Breadcrumb
                items={breadcrumbItems}
                style={{ marginBottom: 16 }}
              />

              <Card>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <Title level={3} style={{ margin: 0 }}>
                    Quản lý tài liệu
                  </Title>
                </div>

                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Card
                      title="Tải lên tài liệu PDF"
                      bordered={false}
                      style={{ height: "100%" }}
                    >
                      <Dragger
                        {...uploadProps}
                        disabled={loading}
                        style={{ padding: "20px 0" }}
                      >
                        <p className="ant-upload-drag-icon">
                          {loading ? <LoadingOutlined /> : <UploadOutlined />}
                        </p>
                        <p className="ant-upload-text">
                          Nhấn hoặc kéo thả tệp PDF vào khu vực này
                        </p>
                        <p className="ant-upload-hint">
                          Chỉ hỗ trợ tải lên tệp PDF. Tệp sẽ được xử lý để trích
                          xuất dữ liệu.
                        </p>
                      </Dragger>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card
                      title="Quản lý dữ liệu"
                      bordered={false}
                      style={{ height: "100%" }}
                      extra={
                        <Button
                          type="primary"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={deleteAllData}
                          loading={deleteLoading}
                          //   disabled={uploadedFiles.length === 0}
                        >
                          Xóa tất cả dữ liệu
                        </Button>
                      }
                    >
                      {uploadedFiles.length > 0 ? (
                        <List
                          itemLayout="horizontal"
                          dataSource={uploadedFiles}
                          renderItem={(item) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={
                                  <FilePdfOutlined
                                    style={{ fontSize: 24, color: "#ff4d4f" }}
                                  />
                                }
                                title={item.name}
                                description={
                                  <>
                                    <Text type="secondary">
                                      Kích thước: {item.size}
                                    </Text>
                                    <br />
                                    <Text type="secondary">
                                      Tải lên: {item.uploadTime}
                                    </Text>
                                  </>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Empty description="Chưa có tài liệu nào được tải lên" />
                      )}
                    </Card>
                  </Col>
                </Row>

                <Divider />

                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">
                    Hệ thống quản lý tài liệu cho phép bạn tải lên các tài liệu
                    PDF và xử lý chúng để trích xuất thông tin. Bạn có thể xóa
                    tất cả dữ liệu đã xử lý bằng cách nhấn nút "Xóa tất cả dữ
                    liệu".
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManageAI;
