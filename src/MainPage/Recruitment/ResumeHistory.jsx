import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Spin,
  Row,
  Col,
  Pagination,
  message,
  Dropdown,
  Menu,
  Form,
  Modal,
} from "antd";
import {
  MoreOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  UserOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { Helmet } from "react-helmet";
import { apiServices } from "../../Services/apiServices";
import { BASE_URL } from "../../config/apiConfig";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import leftPageIcon from "../../assets/iconsRecruitment/fi_chevrons-left.svg";
import rightPageIcon from "../../assets/iconsRecruitment/fi_chevrons-right.svg";
import more from "../../assets/iconsRecruitment/vertical.svg";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

const ResumeHistory = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const authState = useSelector((state) => state.user.loginvalue);
  const token =
    localStorage.getItem("token") || authState?.access_token?.accessToken;

  const [loading, setLoading] = useState(false);
  const [resumeHistory, setResumeHistory] = useState([]);
  const [filters, setFilters] = useState({});
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationDetail, setPaginationDetail] = useState(0);

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // ----------------------------
  // Fetch from Mongo
  // ----------------------------
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
        candidateName: filters.candidateName || "",
        appliedPosition: filters.title || "",
      }).toString();

      const res = await apiServices("GET", `resumes?${query}`);
      if (res?.data) {
        setResumeHistory(res.data.docs || res.data);
        setPaginationDetail(res.data.totalDocs || res.data.length);
      }
    } catch (err) {
      console.error("❌ Failed to fetch resumes:", err);
      message.error("Failed to fetch resumes from MongoDB.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filters, currentPage, pageSize]);

  // ----------------------------
  // Delete from Mongo
  // ----------------------------
  const handleDelete = async (id) => {
    try {
      await apiServices("DELETE", `resumes/${id}`);
      message.success("Deleted resume from MongoDB.");
      fetchHistory();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      message.error("Failed to delete resume.");
    }
  };

  // ----------------------------
  // Handle View (PDF Modal)
  // ----------------------------
  const handleView = async (record) => {
    setSelectedRecord(record);
    setPdfUrl(null);
    setIsModalVisible(true);
    setLoadingPdf(true);

    try {
      message.loading({ content: `Generating ${record.full_name || "resume"}...`, key: "preview" });

      // Step 1: Trigger backend PDF generation
      await apiServices(
        "POST",
        "resume/preview-from-json",
        { parsed: record },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Step 2: Get binary PDF
      const blobRes = await axiosInstance.post(
        "resume/preview-from-json",
        { parsed: record },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([blobRes.data], { type: "application/pdf" });
      const pdfBlobUrl = URL.createObjectURL(blob);
      setPdfUrl(pdfBlobUrl);
      message.success({ content: "PDF ready!", key: "preview", duration: 2 });
    } catch (err) {
      console.error("❌ PDF preview failed:", err);
      message.error("Failed to load PDF preview.");
      setIsModalVisible(false);
    } finally {
      setLoadingPdf(false);
    }
  };

  // ----------------------------
  // Download PDF
  // ----------------------------
  const handleDownload = async (record) => {
    try {
      const blobRes = await axiosInstance.post(
        "resume/preview-from-json",
        { parsed: record },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([blobRes.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${record.full_name || "resume"}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
      message.success("Download started!");
    } catch (err) {
      console.error("❌ Download failed:", err);
      message.error("Failed to download PDF.");
    }
  };

  // ----------------------------
  // Search / Filter
  // ----------------------------
  const handleSearch = (values) => {
    setFilters(values);
    setCurrentPage(1);
  };

  // ----------------------------
  // Table Columns
  // ----------------------------
  const columns = [
    {
      title: "Candidate Name",
      dataIndex: "full_name",
      key: "candidateName",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <UserOutlined style={{ color: "#722ed1", marginRight: 8 }} />
          <span style={{ fontWeight: 500 }}>
            {text || record.candidateName}
          </span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => (
        <a href={`mailto:${text}`} style={{ color: "#1890ff" }}>
          {text}
        </a>
      ),
    },
    {
      title: "Applied Position",
      dataIndex: "title",
      key: "appliedPosition",
      render: (text, record) => (
        <span style={{ fontSize: "14px" }}>
          {text || record.appliedPosition || "—"}
        </span>
      ),
    },
    {
      title: "Contact",
      dataIndex: "phone",
      key: "contact",
      render: (text, record) => <span>{text || record.contact || "—"}</span>,
    },
    {
      title: "Parsed Date",
      dataIndex: "createdAt",
      key: "parsedDate",
      render: (date) =>
        date ? moment(date).format("DD MMM YYYY, hh:mm A") : "—",
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => {
        const menu = (
          <Menu>
            <Menu.Item
              key="view"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            >
              View
            </Menu.Item>
            <Menu.Item
              key="download"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            >
              Download
            </Menu.Item>
            <Menu.Item
              key="delete"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: "Delete Resume",
                  content: "Are you sure you want to delete this resume?",
                  okText: "Yes, Delete",
                  okType: "danger",
                  cancelText: "No",
                  onOk: () => handleDelete(record._id),
                });
              }}
            >
              Delete
            </Menu.Item>
          </Menu>
        );
        return (
          <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
            <div style={{ cursor: "pointer", height: "24px", display: "inline-flex", alignItems: "center" }}>
              <img src={more} alt="More Options" style={{ height: "24px" }} />
            </div>
          </Dropdown>
        );
      },
    },
  ];

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);


// Inside component:
const navigate = useNavigate();

const handleRowClick = (record) => {
  // Serialize JSON to pass via route state
  navigate("/recruitment/resume-converter", {
    state: {
      parsedData: record,  // 👈 pass the JSON
      autoPreview: true,   // 👈 flag to auto-generate PDF
    },
  });
};


  // ----------------------------
  // Render
  // ----------------------------
  return (
    <>
      <Helmet>
        <title>Resume History</title>
      </Helmet>

      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Resume History</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <a href="/recruitment/dashboard">Dashboard</a>
                </li>
                <li className="breadcrumb-item active">Resume History</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <Form
          form={form}
          onFinish={handleSearch}
          className="search-form"
          onValuesChange={(changedValues, allValues) => {
            const clearedField = Object.keys(changedValues).find(
              (key) =>
                changedValues[key] === "" || changedValues[key] === undefined
            );
            if (clearedField) handleSearch(allValues);
          }}
          initialValues={filters}
        >
          <Row gutter={[12, 12]} align="middle" justify="space-between">
            <Col xs={24} sm={18} md={18}>
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="candidateName" className="mb-0">
                    <Input
                      style={{ borderRadius: "8px", height: "40px" }}
                      placeholder="Candidate Name"
                      allowClear
                    />
                  </Form.Item>
                </Col>
                {/* <Col xs={24} sm={12} md={8}>
                  <Form.Item name="appliedPosition" className="mb-0">
                    <Input
                      style={{ borderRadius: "8px", height: "40px" }}
                      placeholder="Applied Position"
                      allowClear
                    />
                  </Form.Item>
                </Col> */}
              </Row>
            </Col>

            <Col xs={24} sm={12} md={5} style={{ textAlign: "right" }}>
              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="search-btn"
                  block
                  style={{marginBottom: '2px', paddingBottom:'2px'}}
                >
                  Search
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>

        {/* Table Section */}
        <Spin spinning={loading}>
          <div className="table-container" style={{ marginTop: "10px" }}>
            <Table
              columns={columns}
              dataSource={resumeHistory}
              rowKey="_id"
              pagination={false}
              onRow={(record) => ({
                onDoubleClick: () => {
                  console.log(record)
                  handleRowClick(record)},
              })}
              locale={{
                emptyText: (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                    <h5>No Resume Records</h5>
                    <p className="text-muted">
                      No parsed resumes found in MongoDB.
                    </p>
                  </div>
                ),
              }}
            />

            {resumeHistory.length > 0 && (
              <Row
                justify="space-between"
                align="middle"
                style={{ marginTop: 16 }}
              >
                <Col>
                  <span style={{ fontSize: "14px" }}>
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, paginationDetail)} of{" "}
                    {paginationDetail} entries
                  </span>
                </Col>
                <Col>
                  <Pagination
                    total={paginationDetail}
                    pageSize={pageSize}
                    current={currentPage}
                    showSizeChanger={false}
                    onChange={(page, size) => {
                      setPageSize(size);
                      setCurrentPage(page);
                    }}
                    itemRender={(current, type, originalElement) => {
                      if (type === "prev") {
                        return (
                          <img
                            src={leftPageIcon}
                            style={{ height: "24px", width: "24px" }}
                            alt="prev"
                          />
                        );
                      }
                      if (type === "next") {
                        return (
                          <img
                            src={rightPageIcon}
                            style={{ height: "24px", width: "24px" }}
                            alt="next"
                          />
                        );
                      }
                      return originalElement;
                    }}
                  />
                </Col>
              </Row>
            )}
          </div>
        </Spin>

        {/* PDF Modal */}
        <Modal
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={1100}
          style={{ top: 24 }}
          bodyStyle={{ padding: 0, height: "85vh" }}
          centered
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FilePdfOutlined style={{ color: "#ff9244", fontSize: 20 }} />
              <span>
                {selectedRecord?.full_name || "Resume"} - PDF Preview
              </span>
            </div>
          }
        >
          {loadingPdf ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                color: "#555",
              }}
            >
              <div className="spinner-border mb-3" role="status" />
              <p>Loading PDF preview...</p>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              width="100%"
              height="100%"
              title="Resume Preview"
              style={{ border: "none", backgroundColor: "#FFF1E5" }}
            />
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#777",
              }}
            >
              <p>No PDF preview available.</p>
            </div>
          )}
        </Modal>

        <style jsx>{`
          .search-btn {
            background: #1f1f1f;
            border: 1px solid #1f1f1f;
            height: 40px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 16px;
          }
          .table-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            padding: 16px;
          }
        `}</style>
      </div>
    </>
  );
};

export default ResumeHistory;
