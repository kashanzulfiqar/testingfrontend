import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Input,
  Space,
  Tag,
  Empty,
  message,
  Select,
  Button,
  Modal,
  Form,
  Tooltip,
  Row,
  Col,
  DatePicker,
  Pagination,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { apiServices } from "../../Services/apiServices";
import { useSelector } from "react-redux";
import moment from "moment";
import calander from "../../assets/iconsRecruitment/calander.svg";
import circle from "../../assets/iconsRecruitment/circle.svg";
import { useTranslation } from "react-i18next";
import leftPageIcon from "../../assets/iconsRecruitment/fi_chevrons-left.svg";
import rightPageIcon from "../../assets/iconsRecruitment/fi_chevrons-right.svg";
import { Helmet } from "react-helmet";

const { Option } = Select;
const { TextArea } = Input;

const HiredCandidates = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isReasonModalVisible, setIsReasonModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [form] = Form.useForm();
  const [reasonForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [paginationDetail, setPaginationDetail] = useState();
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const loginState = useSelector((state) => state.user.loginvalue);

  const fetchHiredCandidates = async (page = 1, limit = 10, filters = {}) => {
    try {
      setLoading(true);
      const token =
        loginState?.access_token?.accessToken || localStorage.getItem("token");

      if (!token) {
        message.error("Authentication required");
        navigate("/login");
        return;
      }

      const queryParams = {
        status: "HIRED",
        page: currentPage,
        limit: pageSize,
        ...(filters.fullName && { fullName: filters.fullName }),
        ...(filters.email && { email: filters.email }),
        ...(filters.appliedFor && { appliedFor: filters.appliedFor }),
      };

      const response = await apiServices(
        "GET",
        `candidate/list?${new URLSearchParams(queryParams).toString()}`,
        null,
        {
          access_token: {
            accessToken: token,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.status) {
        const candidatesList = response.data.data.docs || [];
        setCandidates(candidatesList);
        setPaginationDetail(response.data.data.totalDocs || 0);
      }
    } catch (error) {
      console.error("Error fetching hired candidates:", error);
      message.error("Failed to fetch hired candidates");
      setCandidates([]);
      setPaginationDetail(0);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (candidateId, newStatus) => {
    if (newStatus === "DID_NOT_JOIN" || newStatus === "BLACKLISTED") {
      setSelectedCandidate(candidateId);
      setSelectedStatus(newStatus);
      setIsReasonModalVisible(true);
      return;
    }

    await updateCandidateStatus(candidateId, newStatus);
  };

  const updateCandidateStatus = async (
    candidateId,
    newStatus,
    formData = {}
  ) => {
    try {
      setUpdatingStatus(true);
      const token =
        loginState?.access_token?.accessToken || localStorage.getItem("token");

      if (!token) {
        message.error("Authentication required");
        return;
      }

      const response = await apiServices(
        "PATCH",
        `candidate/${candidateId}/status`,
        formData,
        {
          access_token: {
            accessToken: token,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.status) {
        message.success("Status updated successfully");
        fetchHiredCandidates(currentPage, pageSize);
      } else {
        throw new Error(response?.data?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error(error.message || "Error updating status");
    } finally {
      setUpdatingStatus(false);
      setIsReasonModalVisible(false);
      reasonForm.resetFields();
    }
  };

  const handleReasonSubmit = async (values) => {
    // Construct the payload based on the selected status
    const formData = {
      status: selectedStatus,
      ...(selectedStatus === "OFFER_REJECTED" && {
        offerRejectionReason: values.specificReason,
      }),
      ...(selectedStatus === "DID_NOT_JOIN" && {
        didNotJoinReason: values.specificReason,
      }),
      ...(selectedStatus === "BLACKLISTED" && {
        blacklistReason: values.specificReason,
      }),
      ...(values.reason && { reason: values.reason }), // Include general reason if provided
    };

    await updateCandidateStatus(selectedCandidate, selectedStatus, formData);
  };

  useEffect(() => {
    const token =
      loginState?.access_token?.accessToken || localStorage.getItem("token");

    if (!token) {
      message.error("Please login again to continue");
      navigate("/login");
      return;
    }

    fetchHiredCandidates();
  }, [currentPage, pageSize]);

  // const handleTableChange = (newPagination) => {
  //   fetchHiredCandidates(newPagination.current, newPagination.pageSize);
  // };

  const handleSearch = (values) => {
    console.log("Search Values:", values);
    setFilters(values);
    setPagination({
      ...pagination,
      current: 1,
    });
    fetchHiredCandidates(1, pageSize, values);
  };

  const columns = [
    {
      title: "Candidate Name",
      key: "CandidateName",
      width: 150,
      render: (_, record) => {
        const initials = `${record.firstName
          .charAt(0)
          .toUpperCase()}${record.lastName.charAt(0).toUpperCase()}`;
        const candidateName = `${
          record.firstName.charAt(0).toUpperCase() +
          record.firstName.slice(1).toLowerCase()
        } ${
          record.lastName.charAt(0).toUpperCase() +
          record.lastName.slice(1).toLowerCase()
        }`;
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                minHeight: "40px",
                minWidth: "40px",
                border: "1px solid transparent",
                borderRadius: "50%",
                background: "#f5f1fd",
                color: "#9368e9",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginRight: "10px",
              }}
            >
              {initials}
            </div>
            <Link
              to={`/recruitment/candidates/${record._id}`}
              style={{
                color: "#212529",
                fontSize: "14px",
                fontWight: "500",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100%",
              }}
            >
              {candidateName}
            </Link>
          </div>
        );
      },
    },
    {
      title: "Position",
      key: "position",
      width: 150,
      render: (_, record) => record.appliedFor?.title || "N/A",
    },
    {
      title: "Applied Date",
      dataIndex: "appliedDate",
      key: "appliedDate",
      width: 150,
      render: (date) => moment(date).format("DD MMM YYYY"),
    },
    {
      title: "Department",
      key: "department",
      width: 150,
      render: (_, record) => record.appliedFor?.department || "N/A",
    },
    {
      title: "Contract",
      key: "contract",
      width: 150,
      render: (_, record) => {
        if (record.offer?.contract) {
          return (
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => window.open(record.offer.contract, "_blank")}
            >
              Download
            </Button>
          );
        }
        return <span style={{ color: "#999" }}>No contract</span>;
      },
    },
    {
      title: "Status",
      key: "status",
      width: 200,
      render: (_, record) => (
        <Select
          value={record.status}
          className="customized"
          style={{
            color: "HIRED"
              ? "green"
              : "JOINED"
              ? "blue"
              : "DID_NOT_JOIN"
              ? "red"
              : "BLACKLISTED"
              ? "black"
              : "default",
          }}
          onChange={(value) => handleStatusChange(record._id, value)}
          loading={updatingStatus && selectedCandidate === record._id}
        >
          <Option value="HIRED" style={{ color: "green" }}>
            HIRED
          </Option>
          {/* <Option value="JOINED" style={{color:"blue"}}>JOINED</Option> */}
          <Option value="DID_NOT_JOIN" style={{ color: "red" }}>
            DID NOT JOIN
          </Option>
          <Option value="BLACKLISTED" style={{ color: "black" }}>
            BLACKLISTED
          </Option>
        </Select>
      ),
    },
    {
      title: "Reason",
      key: "reason",
      width: 300,
      render: (_, record) => {
        let reasonText = "";
        let tooltipTitle = "";

        if (record.status === "OFFER_REJECTED") {
          reasonText = record.offerRejectionReason || record.reason; // Fallback for backward compatibility
          tooltipTitle = "Offer Rejection Reason";
        } else if (record.status === "DID_NOT_JOIN") {
          reasonText = record.didNotJoinReason || record.reason;
          tooltipTitle = "Did Not Join Reason";
        } else if (record.status === "BLACKLISTED") {
          reasonText = record.blacklistReason || record.reason;
          tooltipTitle = "Blacklist Reason";
        }

        if (reasonText) {
          return (
            <Tooltip title={`${tooltipTitle}: ${reasonText}`}>
              <div
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 280,
                  cursor: "pointer",
                }}
              >
                {reasonText}
              </div>
            </Tooltip>
          );
        }
        return "-";
      },
    },
  ];

  return (
    <>
      <Helmet>
        <title>Hired Candidates</title>
        <meta name="description" content="Login page" />
      </Helmet>
      <div className="content container-fluid">
        {/* <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Hired Candidates</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item">Recruitment</li>
              <li className="breadcrumb-item active">Hired Candidates</li>
            </ul>
          </div>
        </div>
      </div> */}
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Hired</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/recruitment/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active">Hired</li>
              </ul>
            </div>
          </div>
        </div>

        {/* <Card>
        <div className="row filter-row">
          <div className="col-sm-6 col-md-3">
            <Input
              placeholder="Search Candidates"
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        <Table
          className="mt-4"
          columns={columns}
          dataSource={candidates}
          rowKey={(record) => record._id}
          loading={loading}
          scroll={{ x: 1330 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} candidates`,
          }}
          onChange={handleTableChange}
          locale={{
            emptyText: <Empty description="No hired candidates found" />
          }}
        />
      </Card> */}
        <Form
          form={form}
          onFinish={handleSearch}
          onValuesChange={(changedValues, allValues) => {
            const clearedField = Object.keys(changedValues).find(
              (key) =>
                changedValues[key] === "" || changedValues[key] === undefined
            );
            if (clearedField) {
              handleSearch(allValues);
            }
          }}
          className="search-form"
          initialValues={filters}
        >
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={12} md={7}>
              <Form.Item name="fullName" className="mb-0">
                <Input
                  style={{ borderRadius: "8px", height: "40px" }}
                  placeholder="Name"
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={7}>
              <Form.Item name="email" className="mb-0">
                <Input
                  style={{ borderRadius: "8px", height: "40px" }}
                  placeholder="Email"
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="appliedFor" className="mb-0">
                <Input
                  style={{ borderRadius: "8px", height: "40px" }}
                  placeholder="Position"
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="search-btn"
                  block
                >
                  Search
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <>
          {candidates?.length > 0 && (
            <Row justify="space-between" style={{ marginTop: 16 }}>
              <Col>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <div style={{ fontSize: "14px" }}>Show</div>
                  <Select
                    className="customized"
                    value={pageSize}
                    onChange={(size) => {
                      setPageSize(size);
                      setCurrentPage(1);
                    }}
                    style={{ width: 60 }}
                  >
                    {["20", "30", "40", "50"].map((size) => (
                      <Option key={size} value={parseInt(size, 10)}>
                        {size}
                      </Option>
                    ))}
                  </Select>
                  <div style={{ fontSize: "14px" }}>entries</div>
                </div>
              </Col>
            </Row>
          )}
          <Table
            className="mt-4"
            columns={columns}
            dataSource={candidates}
            rowKey={(record) => record._id}
            loading={loading}
            pagination={false}
            locale={{
              emptyText: <Empty description="No hired candidates found" />,
            }}
          />
          {candidates?.length > 0 && (
            <Row
              justify="space-between"
              align="middle"
              style={{ marginTop: 16 }}
            >
              <Col>
                <span style={{ fontSize: "14px" }}>
                  {t("paginationShow", {
                    range1: (currentPage - 1) * pageSize + 1,
                    range2: Math.min(currentPage * pageSize, paginationDetail),
                    total: paginationDetail,
                  })}
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
                  pageSizeOptions={["20", "30", "40", "50"]}
                  itemRender={(current, type, originalElement) => {
                    if (type === "prev") {
                      return (
                        <img
                          src={leftPageIcon}
                          style={{ height: "24px", width: "24px" }}
                        />
                      );
                    }
                    if (type === "next") {
                      return (
                        <img
                          src={rightPageIcon}
                          style={{ height: "24px", width: "24px" }}
                        />
                      );
                    }
                    return originalElement;
                  }}
                />
              </Col>
            </Row>
          )}
        </>

        <Modal
          title={`Update Status ${selectedStatus?.replace(/_/g, " ")}`}
          visible={isReasonModalVisible}
          onCancel={() => {
            setIsReasonModalVisible(false);
            reasonForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={reasonForm}
            onFinish={handleReasonSubmit}
            layout="vertical"
          >
            <Form.Item
              name="reason"
              label="General Note"
              rules={[{ required: false }]}
            >
              <TextArea
                rows={2}
                placeholder="Add a note about this status change (optional)"
              />
            </Form.Item>

            <Form.Item
              name="specificReason"
              label={
                selectedStatus === "OFFER_REJECTED"
                  ? "Offer Rejection Reason"
                  : selectedStatus === "DID_NOT_JOIN"
                  ? "Did Not Join Reason"
                  : selectedStatus === "BLACKLISTED"
                  ? "Blacklist Reason"
                  : "Reason"
              }
              rules={[
                {
                  required: true,
                  message: `Please provide ${
                    selectedStatus === "OFFER_REJECTED"
                      ? "the reason for offer rejection"
                      : selectedStatus === "DID_NOT_JOIN"
                      ? "the reason for not joining"
                      : selectedStatus === "BLACKLISTED"
                      ? "the reason for blacklisting"
                      : "a reason"
                  }`,
                },
              ]}
            >
              <TextArea
                rows={3}
                placeholder={
                  selectedStatus === "OFFER_REJECTED"
                    ? "Please provide the reason for offer rejection"
                    : selectedStatus === "DID_NOT_JOIN"
                    ? "Please provide the reason for not joining"
                    : selectedStatus === "BLACKLISTED"
                    ? "Please provide the reason for blacklisting"
                    : "Please provide a reason"
                }
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item className="text-end mt-3">
              <Button
                onClick={() => {
                  setIsReasonModalVisible(false);
                  reasonForm.resetFields();
                }}
                style={{
                  marginRight: 12,
                  padding: "6px 24px",
                  height: "50px",
                  borderRadius: "32px",
                  background: "#F7F7F8",
                  border: "none",
                }}
              >
                Cancel
              </Button>
              <Button
                Button
                type="primary"
                htmlType="submit"
                loading={updatingStatus}
                style={{
                  fontSize: "16px",
                  padding: "6px 24px",
                  height: "50px",
                  borderRadius: "32px",
                  background: "#FF9244",
                  border: "none",
                }}
              >
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <style jsx>{`
          .add-candidate-btn {
            border-radius: 40px !important;
            height: 44px !important;
            background-color: #ff9244 !important;
            color: white !important;
            font-weight: 500 !important;
            font-size: 16px !important;
            border: 2px solid #ff9244 !important;
            width: 185px !important;
          }

          .btn-content {
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .search-btn {
            background: #1f1f1f;
            border: 1px solid #1f1f1f;
            height: 40px;
            border-radius: 8px;
            width: 80% !important;
            font-weight: 500;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            justify-self: end;
          }
          .search-btn:hover {
            background: #333 !important;
            border: none;
          }

          .custom .ant-select-selector {
            height: 40px !important;
            border-radius: 8px !important;
            display: flex;
            align-items: center;
            padding-left: 10px;
          }

          .customized .ant-select-selector {
            height: 30px !important;
            border-radius: 8px !important;
            display: flex;
            align-items: center;
            padding-left: 10px;
          }

          .custom .ant-select-placeholder {
            color: white !important;
          }

          .ant-modal-content {
            border: 1px solid transparent;
            border-radius: 10px;
          }
          .ant-modal-header {
            border-bottom: none;
            padding: 24px 24px 0px 24px;
            border-radius: 10px;
          }
          .ant-modal-title {
            font-size: 24px;
            font-weight: 600;
          }

          .ant-modal-close {
            background-color: #f8f9fa;
            border-radius: 50%;
            border: "1px solid #F8F9FA";
            margin: 16px 16px 0 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .custom-input .ant-form-item-label > label {
            color: #212529 !important;
            font-size: 12px;
            font-weight: 500;
          }

          .custom-input .ant-input {
            height: 55px !important;
            border-radius: 4px !important;
            border: 1px solid #cfd4d8;
            font-size: 16px !important;
            font-weight: 450;
            color: #212529 !important;
            padding: 15px !important;
          }

          .input-details .ant-form-item-label > label {
            color: #212529 !important;
            font-size: 12px;
            font-weight: 500;
            margin-left: 13px;
          }
          .input-details .ant-input {
            border-radius: 4px !important;
            border: 1px solid #cfd4d8;
            font-size: 16px !important;
            font-weight: 450;
            color: #212529 !important;
            padding: 15px !important;
          }

          .ant-picker {
            height: 40px !important;
            border-radius: 8px !important;
            display: flex;
            align-items: center;
            padding-left: 10px;
          }

          .custom-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }

          .custom-table th {
            width: 300px !important;
            background-color: #ffffff;
            color: #212529;
            font-size: 14px;
            font-weight: 450;
          }

          .custom-table td {
            width: 300px !;
            background-color: #f7f7f8;
            color: #181d27;
            font-size: 14px;
            font-weight: 450;
          }

          .custom-table tr:nth-child(even) {
            background-color: #eef0f1;
          }

          .custom-table tr:hover {
            background-color: #f1f1f1;
          }
        `}</style>
      </div>
    </>
  );
};

export default HiredCandidates;
