import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Select,
  Input,
  Modal,
  Form,
  message,
  Spin,
  Tag,
  Row,
  Col,
  Card,
  Dropdown,
  Menu,
  Pagination,
  Tooltip,
  Avatar,
} from "antd";
import {
  UnorderedListOutlined,
  AppstoreOutlined,
  StarFilled,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { apiServices } from "../../Services/apiServices";
import { useSelector } from "react-redux";
import moment from "moment";
import list from "../../assets/iconsRecruitment/list.svg";
import grid from "../../assets/iconsRecruitment/grid.svg";
import circle from "../../assets/iconsRecruitment/circle.svg";
import interviewIcon from "../../assets/iconsRecruitment/interview.svg";
import clock from "../../assets/iconsRecruitment/clock.svg";
import calander from "../../assets/iconsRecruitment/calander.svg";
import more from "../../assets/iconsRecruitment/vertical.svg";
import CreateInterviewModal from "./CreateInterviewModal";
import { useTranslation } from "react-i18next";
import leftPageIcon from "../../assets/iconsRecruitment/fi_chevrons-left.svg";
import rightPageIcon from "../../assets/iconsRecruitment/fi_chevrons-right.svg";
import { user_icon } from "../../Entryfile/imagepath";
import { Helmet } from "react-helmet";

const Interviews = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [form] = Form.useForm();
  const authState = useSelector((state) => state.user.loginvalue);
  const [viewType, setViewType] = useState("list");
  const [loading, setLoading] = useState();
  const [interviews, setInterviews] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [paginationDetail, setPaginationDetail] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user_state = useSelector((state) => state.user.loginvalue?.user);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    if (!token) {
      message.error("Please login again to continue");
      navigate("/login");
      return;
    }

    fetchInterviews();
  }, [filters, currentPage, pageSize]);

  const fetchInterviews = async () => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    if (!token) {
      message.error("Authentication required");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching interviews with filters:", filters);
      const queryParams = {
        page: currentPage,
        limit: pageSize,
        ...(filters.candidateName && { candidateName: filters.candidateName }),
        ...(filters.status && { status: filters.status }),
        ...(filters.appliedPosition && {
          appliedPosition: filters.appliedPosition,
        }),
      };

      console.log("Fetching interviews with params:", queryParams);

      // Use assigned interviews endpoint for non-admin users with assigned interviews
      const endpoint = 
        user_state?.role !== "admin" && user_state?.hasAssignedInterviews
          ? `interview/assigned/list?${new URLSearchParams(queryParams).toString()}`
          : `interview/list?${new URLSearchParams(queryParams).toString()}`;

      const response = await apiServices(
        "GET",
        endpoint,
        null,
        {
          access_token: {
            accessToken: token,
          },
        }
      );

      if (response?.data?.success) {
        const interviewsData = response.data.data;
        console.log("Interviews Data:", interviewsData);

        setInterviews(interviewsData.docs || []);
        setPaginationDetail(interviewsData.totalDocs || 0);

        setPagination((prev) => ({
          ...prev,
          total: interviewsData.totalDocs || 0,
        }));
      } else {
        message.error(response?.data?.message || "Failed to fetch interviews");
        setInterviews([]);
        setPaginationDetail(0);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
      message.error("Error fetching interviews. Please try again");
      setInterviews([]);
      setPaginationDetail(0);
    } finally {
      setLoading(false);
    }
  };

  // const handleTableChange = (newPagination, filters, sorter) => {
  //   setPagination({
  //     ...pagination,
  //     current: newPagination.current,
  //     pageSize: newPagination.pageSize
  //   });
  // };

  const handleSearch = (values) => {
    console.log("Search Values:", values);
    setPagination({
      ...pagination,
      current: 1,
    });
    setFilters(values);
  };

  // const handleReset = () => {
  //   form.resetFields();
  //   setFilters({});
  //   setPagination({
  //     ...pagination,
  //     current: 1
  //   });
  // };

  const getInitials = (title) => {
    if (!title) return "";
    return title
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  // const calculateAverageRating = (feedbackArray) => {
  //   if (!feedbackArray || feedbackArray.length === 0) {
  //     return 0;
  //   }

  //   const totalRatings = feedbackArray.reduce((sum, feedback) => {
  //     const ratings = feedback.ratings;
  //     const ratingSum = (
  //       ratings.technicalSkills1 +
  //       ratings.behavior +
  //       ratings.softSkills +
  //       ratings.technicalSkills2 +
  //       ratings.technicalSkills3
  //     );
  //     return sum + (ratingSum / 5); // Average of all skills for this feedback
  //   }, 0);

  //   return (totalRatings / feedbackArray.length).toFixed(1);
  // };

  // const getLatestDecision = (feedbackArray) => {
  //   if (!feedbackArray || feedbackArray.length === 0) return '-';
  //   return feedbackArray[feedbackArray.length - 1].recommendation || '-';
  // };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleDeleteInterview = async (interviewId) => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("token") || authState?.access_token?.accessToken;

      if (!token) {
        message.error("Authentication required");
        navigate("/login");
        return;
      }

      const response = await apiServices(
        "DELETE",
        `interview/${interviewId}`,
        null,
        {
          access_token: {
            accessToken: token,
          },
        }
      );

      if (response?.data?.success) {
        message.success("Interview deleted successfully");
        // Refresh the interviews list
        fetchInterviews();
      } else {
        message.error(response?.data?.message || "Failed to delete interview");
      }
    } catch (error) {
      console.error("Error deleting interview:", error);
      message.error("Error deleting interview. Please try again");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Candidate Name",
      key: "candidateName",
      dataIndex: "candidateName",
      render: (_, record) => (
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
              marginLeft: "10px",
              marginRight: "10px",
            }}
          >
            {getInitials(record.candidateName)}
          </div>
          <Link
            to={`/recruitment/interviews/${record._id}`}
            style={{ fontSize: "14px", color: "#212529" }}
          >
            {record.candidateName
              .split(" ")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(" ")}
          </Link>
        </div>
      ),
      // sorter: true,
    },
    // {
    //   title: 'Position',
    //   dataIndex: 'appliedFor',
    //   key: 'appliedFor',
    //   render: (appliedFor)=>{
    //     return appliedFor?.title || 'N/A';
    //   },
    // },

    {
      title: "Interviewers",
      key: "interviewers",
      render: (_, record) => {
        const OptionalInterviewer = record?.assignedTo || [];
        return (
          <div className="project-members" style={{ margin: "4px auto" }}>
            <ul className="team-members" style={{ minWidth: "max-content" }}>
            {OptionalInterviewer?.slice(0, 3).map((interviewer, index) => (
              <li key={index}>
                <Tooltip title={interviewer?.fullName}>
                  <Avatar
                    style={{ cursor: "pointer" }}
                    src={interviewer?.imageUrl || user_icon}
                  />
                </Tooltip>
              </li>
            ))}
            {OptionalInterviewer?.length > 3 && (
              <li className="dropdown avatar-dropdown">
                <Link
                  className="all-users dropdown-toggle projectTeamMember"
                  style={{
                    display: "inline-flex",
                    height: "33px",
                    width: "33px",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "50%",
                    textDecoration: "none",
                    color: "#333",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  +{OptionalInterviewer?.length - 3}
                </Link>
                {/* Dropdown menu for additional interviewers */}
                <div className="dropdown-menu dropdown-menu-right">
                  <div className="avatar-group">
                    {OptionalInterviewer?.slice(3).map((interviewer, index) => (
                      <li key={index}>
                        <Tooltip title={interviewer?.fullName}>
                          <Avatar
                            style={{ cursor: "pointer" }}
                            src={interviewer?.imageUrl || user_icon}
                          />
                        </Tooltip>
                      </li>
                    ))}
                  </div>
                </div>
              </li>
            )}
            </ul>
          </div>
        );
      },
      // sorter: true,
    },
    {
      title: "Interview Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status?.toLowerCase() === "scheduled"
              ? "blue"
              : status?.toLowerCase() === "completed"
              ? "green"
              : status?.toLowerCase() === "cancelled"
              ? "red"
              : "default"
          }
          style={{ borderRadius: "70px" }}
        >
          {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase()}
        </Tag>
      ),
    },
    {
      title: "Interview Name",
      dataIndex: "interviewTitle",
      key: "interviewTitle",
      render: (_, record) => <div>{record.interviewTitle}</div>,
      // sorter: true,
    },
    {
      title: "Interview Date",
      key: "date",
      render: (_, record) => (
        <span>{moment(record.interviewDate).format("DD MMM YYYY")}</span>
      ),
      // sorter: true,
    },
    // {
    //   title: "Actions",
    //   key: "actions",
    //   width: 80,
    //   render: (_, record) => (
    //     <Dropdown
    //       overlay={<Menu>
    //     <Menu.Item key="edit" icon={<EditOutlined />}onClick={() =>navigate(`/recruitment/Interviews/${record._id}/CreateInterviewModal`)}>Edit</Menu.Item>
    //     <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => {
    //      Modal.confirm({
    //        title: "Delete Interview",
    //        content:"Are you sure you want to delete this interview? This action cannot be undone.",
    //        okText: "Yes, Delete",
    //        okType: "danger",
    //        cancelText: "No",
    //        onOk: () => handleDeleteInterview(record._id),
    //        okButtonProps: {
    //                   loading: loading,
    //                 },
    //               });
    //             }}
    //           >Delete</Menu.Item>
    //     </Menu>}
    //     trigger={['click']}
    //     placement="bottomRight">
    //     <div style={{ cursor: 'pointer',height:'25px' }}>
    //       <img src={more} alt="More Options" />
    //     </div>
    //     </Dropdown>
    //   ),
    // },
    // {
    //   title: 'Decision',
    //   key: 'decision',
    //   render: (_, record) => {
    //     return record.latestFeedback?.recommendation || '-';
    //   }
    // },
    // {Rating if needed}
    // {
    //   title: 'Rating',
    //   key: 'rating',
    //   render: (_, record) => {
    //     if (!record.feedback || record.feedback.length === 0) {
    //       return (
    //         <div className="d-flex align-items-center">
    //           <StarFilled style={{ color: '#FFD700', marginRight: 4 }} />
    //           <span>0</span>
    //         </div>
    //       );
    //     }

    //     const totalRatings = record.feedback.reduce((sum, feedback) => {
    //       const ratings = feedback.ratings;
    //       const ratingSum = (
    //         ratings.technicalSkills1 +
    //         ratings.behavior +
    //         ratings.softSkills +
    //         ratings.technicalSkills2 +
    //         ratings.technicalSkills3
    //       );
    //       return sum + (ratingSum / 5);
    //     }, 0);

    //     const averageRating = (totalRatings / record.feedback.length).toFixed(1);

    //     return (
    //       <div className="d-flex align-items-center">
    //         <StarFilled style={{ color: '#FFD700', marginRight: 4 }} />
    //         <span>{averageRating}</span>
    //       </div>
    //     );
    //   }
    // },
  ];

  const renderGridView = () => {
    return (
      <Row gutter={[24, 24]} justify="start">
        {interviews.map((interview) => {
          const fullName = interview?.candidateName
            .split(" ")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ");
          const initials = fullName
            .split(" ")
            .map((name) => name.charAt(0).toUpperCase())
            .join("");
          const MainInterviewer = interview?.interviewerId?.imageUrl;
          const OptionalInterviewer = interview?.assignedTo || [];
          
          // Combine and dedupe interviewers to avoid duplicates
          const allInterviewersData = [
            interview?.interviewerId,
            ...OptionalInterviewer
          ].filter(Boolean);
          
          const seenIds = new Set();
          const uniqueInterviewers = allInterviewersData.filter((iv) => {
            const id = (iv && (iv._id || iv.id)) ? (iv._id || iv.id).toString() : null;
            if (!id) return false;
            if (seenIds.has(id)) return false;
            seenIds.add(id);
            return true;
          });
          return (
            <Col xs={24} sm={12} md={8}>
              <Card className="job-card">
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "98%",
                    }}
                  >
                    <div style={{ display: "flex" }}>
                      <div
                        style={{
                          height: "50px",
                          width: "50px",
                          border: "1px solid transparent",
                          borderRadius: "50%",
                          background: "#f3eaff",
                          color: "#8326ff",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {initials}
                      </div>
                      <div style={{ marginLeft: "12px" }}>
                        <div
                          className="job-title"
                          style={{
                            fontSize: "18px",
                            fontWeight: "500",
                            color: "#212529",
                            paddingTop: "3px",
                          }}
                        >
                          <Link to={`/recruitment/interviews/${interview._id}`}>
                            {fullName}
                          </Link>
                        </div>
                        {/* <div  style={{color:'#56616b', fontSize:'12px', fontWeight:"450"}}>{interview?.appliedFor?.title || 'N/A'}</div> */}
                      </div>
                    </div>
                    {/* <Dropdown 
                    overlay={<Menu>
                      <Menu.Item key="edit" icon={<EditOutlined />}onClick={() => navigate(`/recruitment/interviews/${candidate._id}/edit`)}>Edit</Menu.Item>
                      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => {
                        Modal.confirm({
                          title: 'Delete Job',
                          content: 'Are you sure you want to delete this candidate?',
                          okText: 'Yes, Delete',
                          okType: 'danger',
                          cancelText: 'No',
                          onOk: () => handleDeleteInterview(interview._id)
                        });
                      }}>Delete</Menu.Item>
                    </Menu>}
                    trigger={['click']}
                    placement="bottomRight">
                    <div style={{ cursor: 'pointer',height:'25px', marginTop:"5px" }}>
                      <img src={more} alt="More Options" />
                    </div>
                  </Dropdown> */}
                  </div>
                  <div style={{ marginTop: "12px" }}>
                    <div style={{ display: "flex", marginTop: "7px" }}>
                      <div>
                        <img src={interviewIcon}></img>
                      </div>
                      <div
                        style={{
                          paddingTop: "3px",
                          marginLeft: "12px",
                          color: "#56616b",
                        }}
                      >
                        {/* <Link to={`/recruitment/interviews/${interviewer._id}`}>  */}
                        {interview?.interviewTitle}
                        {/* </Link> */}
                      </div>
                    </div>
                    <div style={{ display: "flex", marginTop: "7px" }}>
                      <div>
                        <img src={clock}></img>
                      </div>
                      <div
                        style={{
                          paddingTop: "3px",
                          marginLeft: "12px",
                          color: "#56616b",
                        }}
                      >
                        {moment(interview?.interviewTime, "Hh:mm").format(
                          "hh:mm A"
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", marginTop: "7px" }}>
                      <div>
                        <img src={calander}></img>
                      </div>
                      <div
                        style={{
                          paddingTop: "3px",
                          marginLeft: "12px",
                          color: "#56616b",
                        }}
                      >
                        {moment(interview?.interviewDate).format("DD MMM YYYY")}
                      </div>
                    </div>
                    <Tag
                      color={
                        interview?.status?.toLowerCase() === "scheduled"
                          ? "blue"
                          : interview?.status?.toLowerCase() === "completed"
                          ? "green"
                          : interview?.status?.toLowerCase() === "cancelled"
                          ? "red"
                          : "default"
                      }
                      style={{ borderRadius: "70px", marginTop: "13px" }}
                    >
                      {interview?.status?.charAt(0).toUpperCase() +
                        interview?.status?.slice(1).toLowerCase()}
                    </Tag>
                  </div>
                  <div style={{ marginTop: "12px" }}>
                    <h3 style={{ fontSize: "15px" }}>Interviewers:</h3>
                    <div>
                      {uniqueInterviewers.map((interviewer, index) => (
                        <Link key={index}>
                          <img
                            src={interviewer?.imageUrl}
                            style={{
                              height: "30px",
                              width: "30px",
                              borderRadius: "50%",
                              border: "2px solid white",
                              marginLeft: index === 0 ? "0px" : "-10px",
                            }}
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    );
  };

  return (
    <>
      <Helmet>
        <title>Interviews</title>
        <meta name="description" content="Login page" />
      </Helmet>
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Interviews</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/recruitment/dashboard">Dashboard</Link>
                </li>
                <li className="breadcrumb-item active">Interviews</li>
              </ul>
            </div>
            <div className="col-auto float-end ms-auto d-flex align-items-center">
              <div className="view-icons me-3">
                <button
                  type={viewType === "list" ? "primary" : "default"}
                  onClick={() => setViewType("list")}
                  style={{
                    height: "40px",
                    width: "40px",
                    border: "1.5px solid #EEf0f1",
                    borderRadius: "4px",
                    background: "white",
                  }}
                >
                  <img src={list}></img>
                </button>
                <button
                  type={viewType === "grid" ? "primary" : "default"}
                  onClick={() => setViewType("grid")}
                  style={{
                    height: "40px",
                    width: "40px",
                    border: "1.5px solid #EEf0f1",
                    borderRadius: "4px",
                    background: "white",
                  }}
                >
                  <img src={grid}></img>
                </button>
              </div>
              {/* <Button
            className="add-candidate-btn"
            onClick={showModal}
          >
            <div className='btn-content'>
              <img src={circle} style={{marginRight:'8px', marginBottom:'20px'}}></img>
              <p>Create Interview</p>  
            </div>
          </Button> */}
            </div>
          </div>
        </div>

        {/* Search Filters */}
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
          <Row justify="space-between" align="middle" gutter={[12, 12]}>
            {/* Grouping all inputs into one Col */}
            <Col xs={24} md={18}>
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12} md={12}>
                  <Form.Item name="candidateName" className="mb-0">
                    <Input
                      style={{ borderRadius: "8px", height: "40px" }}
                      placeholder="Candidate Name"
                      allowClear
                    />
                  </Form.Item>
                </Col>
                {/* <Col xs={24} sm={12} md={7}>
          <Form.Item name="appliedPosition" className="mb-0">
            <Input style={{borderRadius:"8px", height:"40px"}} placeholder="Applied Position" allowClear />
          </Form.Item>
        </Col> */}
                {/* <Col xs={24} sm={12} md={5}>
          <Form.Item name="jobType" className="mb-0">
            <Select placeholder="Interview Rating" allowClear
            className='custom'
              options={[
                { value: '1', label: '1.0' },
                { value: '2', label: '2.0' },
                { value: '3', label: '3.0' },
                { value: '4', label: '4.0' },
                { value: '5', label: '5.0' }
              ]}
            />
          </Form.Item>
        </Col> */}
                <Col xs={24} sm={12} md={12}>
                  <Form.Item name="status" className="mb-0">
                    <Select
                      placeholder="Interview Status"
                      allowClear
                      className="custom"
                      options={[
                        { value: "scheduled", label: "Scheduled" },
                        { value: "completed", label: "Completed" },
                        { value: "cancelled", label: "Cancelled" },
                        { value: "rescheduled", label: "Rescheduled" },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Col>

            {/* Button on the right */}
            <Col
              xs={24}
              md={5}
              style={{ display: "flex", justifyContent: "flex-end" }}
            >
              <Form.Item className="mb-0" style={{ width: "100%" }}>
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

        {/* Render the CreateInterviewModal */}
        {/* <CreateInterviewModal
      isVisible={isModalVisible}
      onCancel={handleCancel}
      interview={interviews}
      authState={authState}
    /> */}

        {/* Jobs View */}
        <div className="row">
          <div className="col-md-12">
            <Spin spinning={loading}>
              {viewType === "list" ? (
                <>
                  {interviews?.length > 0 && (
                    <Row justify="space-between" style={{ marginBottom: 16 }}>
                      <Col>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <div style={{ fontSize: "14px" }}>Show</div>
                          <Select
                            className="new"
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
                  <div className="table-responsive">
                    <Table
                      className="table-striped"
                      columns={columns}
                      dataSource={interviews}
                      rowKey="_id"
                      // pagination={{
                      //   ...pagination,
                      //   showSizeChanger: true,
                      //   showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                      //   pageSizeOptions: ['10', '20', '50']
                      // }}
                      // onChange={handleTableChange}
                      pagination={false}
                    />
                  </div>
                  {interviews?.length > 0 && (
                    <Row
                      justify="space-between"
                      align="middle"
                      style={{ marginTop: 16 }}
                    >
                      <Col>
                        <span style={{ fontSize: "14px" }}>
                          {t("paginationShow", {
                            range1: (currentPage - 1) * pageSize + 1,
                            range2: Math.min(
                              currentPage * pageSize,
                              paginationDetail
                            ),
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
              ) : (
                renderGridView()
              )}
            </Spin>
          </div>
        </div>

        {/* Add some global styles */}
        <style jsx>{`
          .custom-modal .ant-modal-header {
            border-bottom: none;
            padding: 24px 24px 0;
          }
          .custom-modal .ant-modal-title {
            font-size: 24px;
            font-weight: 600;
          }
          .custom-modal .ant-modal-close {
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
          .custom-modal .ant-form-item-label > label {
            font-weight: 500;
          }
          .custom-modal .ant-input,
          .custom-modal .ant-select-selector,
          .custom-modal .ant-input-number {
            border-radius: 8px;
            padding: 8px 12px;
            height: 56px;
            font-size: 16px;
            font-weight: 450;
          }
          .custom-modal .ant-input-number-input {
            height: 24px;
            font-size: 16px;
            font-weight: 450;
          }
          .custom-modal .ant-select-selection-placeholder,
          .custom-modal .ant-input::placeholder {
            color: #6c757d;
          }
          .custom-modal textarea.ant-input {
            height: auto;
            min-height: 120px;
            height: 80px;
            border-radius: 8px;
          }
          .view-icons {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .view-icons .ant-btn {
            padding: 4px 8px;
            height: 32px;
            background: #f4a261;
            border: none;
            color: white;
          }
          .view-icons .ant-btn:hover {
            background: #e76f51;
            color: white;
          }
          .view-icons .ant-btn.ant-btn-default {
            background: #f8f9fa;
            color: #4a5568;
          }
          .view-icons .ant-btn.ant-btn-default:hover {
            background: #e2e8f0;
            color: #2d3748;
          }
          .search-form {
            background: transparent;
            margin-bottom: 16px;
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
          .job-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            border: 1px solid #e0e3e6;
            height: auto;
          }
          .job-card .ant-card-body {
            padding: 16px;
          }
          .job-card-content {
            padding: 0;
          }
          .job-title {
            font-size: 20px;
            font-weight: 500;
            margin-bottom: 4px;
          }
          .job-title a {
            color: #212529;
          }
          .positions-count {
            color: #56616b;
            font-size: 14px;
            margin-bottom: 9px;
            font-weight: 450px;
            margin-left: 2px;
          }
          .job-details {
            margin-bottom: 12px;
            height: 100px !important;
          }
          .detail-item {
            display: flex;
            align-items: center;
            margin-bottom: 6px;
            color: #4a5568;
            font-size: 13px;
            line-height: 1;
            height: 50%;
          }
          .detail-items {
            display: flex;
            align-items: flex-start;
            margin-bottom: 6px;
            color: #4a5568;
            font-size: 13px;
            line-height: 1;
            height: 40%;
          }
          .detail-item:last-child {
            margin-bottom: 0;
          }
          .detail-item .icons,
          .detail-items .icons {
            width: 20px;
            margin-right: 8px;
            display: flex;
            justify-content: center;
            flex-shrink: 0;
            height: 20px;
            margin-left: 3px;
          }
          .detail-item .icon svg {
            display: block;
          }
          .detail-item .detail-text,
          .detail-items .detail-text {
            line-height: 17px;
            font-size: 14px;
            font-weight: 450px;
            color: #56616b;
            display: flex;
            align-items: flex-end;
            margin-top: 5px;
          }

          .card-foot {
            display: flex;
            justify-content: space-between;
          }
          .post-on {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            color: #212529;
            font-size: 14px;
            font-weight: 450;
            width: 100%;
          }
          .social-icons {
            display: flex;
            position: absolute;
          }

          .social-icon-one {
            z-index: 0;
          }
          .social-icon-two {
            position: relative;
            z-index: 1;
            right: 5px;
          }
          .social-icon-three {
            position: relative;
            z-index: 2;
            right: 10px;
          }
          .social-icon-four {
            z-index: 3;
            position: relative;
            right: 15px;
          }

          .social-icon:hover {
            color: #f4a261;
          }
          .applications-count {
            text-align: start;
            margin-right: 15px;
          }
          .applications-count-number {
            color: #ff9244;
            font-weight: 500;
            font-size: 28px;
            height: 60%;
            margin-left: 3px;
          }
          .applications-count-text {
            color: #56616b;
            font-size: 14px;
            font-weight: 450;
            height: 40%;
          }
          .ant-row {
            margin-right: -12px !important;
            margin-left: -12px !important;
          }

          .ant-col {
            padding-right: 12px !important;
            padding-left: 12px !important;
          }
          .custom .ant-select-selector {
            height: 40px !important;
            border-radius: 8px !important;
            display: flex;
            align-items: center;
            padding-left: 10px;
          }

          .custom .ant-select-placeholder {
            color: white !important;
          }

          .new .ant-select-selector {
            height: 21px !important;
            display: flex;
            align-items: center;
            padding: 7px !important;
          }

          .new .ant-select-selection-item {
            padding: 0 !important;
            margin: 0;
          }

          .new .ant-select-arrow {
            transform: translateX(50%);
            transform: translateY(20%);
          }

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

          .checkbox-style {
            display: "flex";
            gap: "24px";
          }

          @media (max-width: 768px) {
            .search-btn {
              justify-self: center;
              width: 80% !important;
            }
          }

          @media (min-width: 350px) and (max-width: 390px) {
            .checkbox-style {
              gap: 10px;
            }
          }

          @media (min-width: 990px) and (max-width: 1200px) {
            .applications-count {
              margin-right: 0;
            }
          }
          @media (min-width: 767px) and (max-width: 830px) {
            .applications-count {
              margin-right: 0;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default Interviews;
