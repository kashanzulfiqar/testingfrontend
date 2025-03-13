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
  DatePicker,
  Upload,
  InputNumber,
  Dropdown,
  Menu,
  Card,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { apiServices } from "../../Services/apiServices";
import { useSelector } from "react-redux";
import { getCurrentStage } from "./CandidateList";
import more from '../../assets/iconsRecruitment/vertical.svg';
import circle from '../../assets/iconsRecruitment/circle.svg';
import grid from '../../assets/iconsRecruitment/grid.svg';
import list from '../../assets/iconsRecruitment/list.svg';
import CreateCandidateModal from "./CreateCandidateModal";
import mail from '../../assets/iconsRecruitment/mail.svg';
import phone from '../../assets/iconsRecruitment/phone.svg';
import calander from '../../assets/iconsRecruitment/calander.svg';


// const { TextArea } = Input;

const Candidates = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const [form] = Form.useForm();
  const authState = useSelector((state) => state.user.loginvalue);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [viewType, setViewType] = useState('list');
  const [activeJobs, setActiveJobs] = useState([]);

    useEffect(() => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error("Please login again to continue");
      navigate("/login");
      return;
    }
    
    fetchCandidates();
    // Fetch active jobs initially
    fetchActiveJobs();
  }, [filters, pagination.current, pagination.pageSize]);

  // Separate useEffect for fetching active jobs when modal opens
  useEffect(() => {
    if (isModalVisible) {
      fetchActiveJobs();
    }
  }, [isModalVisible]);

  const fetchCandidates = async () => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error("Authentication required");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...(filters.name && { name: filters.name }),
        ...(filters.appliedFor && { appliedFor: filters.appliedFor }),
        ...(filters.status && { status: filters.status }),
        includeInterviews: true,
        includeTasks: true,
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
        const candidateData = response.data.data;
        console.log("Candidates Response:", response.data);
        
        if (Array.isArray(candidateData.docs)) {
          setCandidates(candidateData.docs);
          setPagination((prev) => ({
            ...prev,
            total: candidateData.totalDocs || 0,
          }));
        } else {
          message.error("Invalid data format received from server");
          setCandidates([]);
        }
      } else {
        if (response?.data?.message === "Invalid token") {
          message.error("Session expired. Please login again");
          navigate("/login");
        } else {
          message.error(
            response?.data?.message || "Failed to fetch candidates"
          );
          setCandidates([]);
        }
      }
    } catch (error) {
      console.error("Error fetching candidates:", error);
      if (error.response?.status === 401) {
        message.error("Session expired. Please login again");
        navigate("/login");
      } else {
        message.error("Error fetching candidates. Please try again");
        setCandidates([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({
        ...prev,
      name: value,
    }));
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const handleDeleteCandidate = async (candidateId) => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error("Authentication required");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await apiServices(
        "DELETE", 
        `candidate/${candidateId}`,
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
        message.success("Candidate deleted successfully");
        fetchCandidates();
      } else {
        message.error(response?.data?.message || "Failed to delete candidate");
      }
    } catch (error) {
      console.error("Error deleting candidate:", error);
      message.error("Error deleting candidate. Please try again");
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveJobs = async () => {
    const token =
      localStorage.getItem("token") || authState?.access_token?.accessToken;

    if (!token) return;

    try {
      const response = await apiServices("GET", "job/active", null, {
          access_token: {
          accessToken: token,
          },
          headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Active Jobs API Response:", response);

      if (response?.data?.status) {
        // Access the docs array from the response data
        const jobs = response.data.data.docs || [];
        console.log("Jobs data before setting:", jobs);

        if (Array.isArray(jobs)) {
          setActiveJobs(jobs);
          console.log("Active jobs set successfully:", jobs.length, "jobs");
      } else {
          console.error("Jobs data is not an array:", jobs);
          setActiveJobs([]);
        }
        } else {
        console.error("Failed to fetch active jobs:", response?.data);
        setActiveJobs([]);
      }
    } catch (error) {
      console.error("Error fetching active jobs:", error);
      setActiveJobs([]);
    }
  };

  const columns = [
      {
      title: "Candidate Name",
      key: "name",
      render: (_, record) => {
        const fullName = `${record.firstName} ${record.lastName}`;
        const initials = record.firstName[0].toUpperCase() + record.lastName[0].toUpperCase();
        return(
        <Link
          to={`/recruitment/candidates/${record._id}`}
          className="text-primary"
        >
          <div style={{display:'flex', alignItems:'center'}}>
            <span style={{height: '40px', width:'40px', border: '1px solid tranparent', borderRadius:'50%', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'16px', fontWeight:'500', color:'#8326ff', background: '#f3eaff'}}>{initials}</span>
            <span style={{marginLeft: '10px'}}>{fullName.split(' ').map(word=>word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</span>
          </div>
        </Link>
        )
      },
      sorter: true,
    },
    {
      title: "Candidate Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "ACCEPTED" ? "blue" : status === "SCREENING" ? "orange" : status === "SHORTLISTED"
           ? "green" : status === "OFFER_REJECTED" ? "red" : status === "BLACKLISTED" ? "purple" : "default"
          }
          style={{borderRadius:'70px'}}
        >
          {status?.charAt(0) + status?.slice(1).toLowerCase()}
        </Tag>
      ),
      sorter: true,
    },
    {
      title: "Applied Position",
      dataIndex: "appliedFor",
      key: "appliedFor",
      render: (appliedFor) => {
        if (appliedFor?.title) {
          return `${appliedFor.title}${
            appliedFor.department ? ` - ${appliedFor.department}` : ""
          }`;
        }
        return "N/A";
      },
      sorter: true,
    },
    {
      title: "Experience",
      dataIndex: "experience",
      key: "experience",
      render: (experience) => `${experience} years`,
      sorter: true,
    },
    {
      title: 'Rating',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: "Current Salary",
      dataIndex: "currentSalary",
      key: "currentSalary",
      sorter: true,
      },
    {
      title: "Expected Salary",
      dataIndex: "expectedSalary",
      key: "expectedSalary",
      sorter: true,
    },
    {
      title: "Contact",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      sorter: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: true,
    },
    {
      title: "Applied Date",
      dataIndex: "appliedDate",
      key: "appliedDate",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: true,
    },
    {
      title: "Notice Period",
      dataIndex: "noticePeriod",
      key: "noticePeriod",
      render: (noticePeriod)=>noticePeriod ? `${noticePeriod.replace('_', ' ').toLowerCase()}` : N/A,
      sorter: true,

      },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Dropdown
          overlay={<Menu>
        <Menu.Item key="edit" icon={<EditOutlined />}onClick={() =>navigate(`/recruitment/candidates/${record._id}/edit`)}>Edit</Menu.Item>
        <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => {
         Modal.confirm({
           title: "Delete Candidate",
           content:"Are you sure you want to delete this candidate? This action cannot be undone.",
           okText: "Yes, Delete",
           okType: "danger",
           cancelText: "No",
           onOk: () => handleDeleteCandidate(record._id),
           okButtonProps: {
                      loading: loading,
                    },
                  });
                }}
              >Delete</Menu.Item>
        </Menu>}
        trigger={['click']}
        placement="bottomRight">
        <div style={{ cursor: 'pointer',height:'25px' }}>
          <img src={more} alt="More Options" />
        </div>
        </Dropdown>
      ),
    },
  ];


  const renderGridView = () => {
    return (
      <Row gutter={[24, 24]}>
        {candidates.map(candidate => {
          const fullName = `${candidate.firstName} ${candidate.lastName}`;
          const initials = fullName.split(' ').map(name=>name.charAt(0).toUpperCase()).join('');
          return(
          <Col xs={24} sm={12} md={8} key={candidate._id}>
            <Card className="job-card">
              <div className="job-card-content">
                <div style={{display:'flex', justifyContent:'space-between', width:"98%"}}>
                  <div style={{display:'flex'}}>
                    <div style={{height:'50px' ,width:'50px', border:'1px solid transparent', borderRadius:'50%', background:"#f3eaff", color:'#8326ff', display:"flex", justifyContent:"center", alignItems:'center'}}>{initials}</div>
                    <div style={{marginLeft:"12px"}}>
                      <div><Link to={`/recruitment/candidates/${candidate._id}`}  style={{fontSize:"18px" ,fontWeight:"500", color:'#212529'}}>{fullName}</Link></div>
                      <div><Link to={`/recruitment/jobs/${candidate._id}`} style={{color:'#56616b', fontSize:'12px', fontWeight:"450"}}>{candidate?.appliedFor.title}</Link></div>
                    </div>
                  </div>
                  <Dropdown
                  overlay={<Menu>
                  <Menu.Item key="edit" icon={<EditOutlined />}onClick={() => navigate(`/recruitment/candidates/${candidate._id}/edit`)}>Edit</Menu.Item>
                  <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => {
                    Modal.confirm({
                      title: 'Delete Job',
                      content: 'Are you sure you want to delete this candidate?',
                      okText: 'Yes, Delete',
                      okType: 'danger',
                      cancelText: 'No',
                      onOk: () => handleDeleteCandidate(candidate._id)
                    });
                  }}>Delete</Menu.Item>
                  </Menu>}
                  trigger={['click']}
                  placement="bottomRight">
                  <div style={{ cursor: 'pointer',height:'25px' }}>
                    <img src={more} alt="More Options" />
                  </div>
                  </Dropdown>
                </div>
                
                <div className="job-details">
                  <div className="detail-item">
                    <div className = 'icons'><img src={mail}></img></div>
                    <div className = 'detail-text'>{candidate.email}</div>
                  </div>
                  <div className="detail-item">
                    <div className = 'icons'><img src={phone}></img></div>
                    <div className = 'detail-text'>{candidate.phoneNumber}</div>
                  </div>
                  <div className="detail-items">
                   <div className = 'icons'><img src={calander}></img></div>
                   <div className = 'detail-text'>{new Date(candidate.appliedDate).toLocaleDateString()}</div>
                  </div>
                  <Tag color={candidate.status === "ACCEPTED" ? "blue" : candidate.status === "SCREENING" ? "orange" : candidate.status === "SHORTLISTED"
                    ? "green" : candidate.status === "OFFER_REJECTED" ? "red" : candidate.status === "BLACKLISTED" ? "purple" : "default"}
                    style={{borderRadius:'70px', marginTop:"10px"}}>{candidate.status.charAt(0) + candidate.status.replace('_', ' ').slice(1).toLowerCase()}
                  </Tag>
                </div>
                <div className="card-foot">
                    <div style={{display:"flex",justifyContent:"space-between", marginBottom:'5px'}}><div style={{width:"40%", fontSize:"12px", fontWeight:"450", color:"#6f7d8a"}}>Experience:</div><div style={{width:"40%", textAlign:"end", fontSize:"14px", fontWeight:"450", color:"#6f7d8a"}}>{candidate.experience + ' Years '}</div></div>
                    <div style={{display:"flex",justifyContent:"space-between", marginBottom:"5px"}}><div style={{width:"40%", fontSize:"12px", fontWeight:"450", color:"#6f7d8a"}}>Notice Period:</div><div style={{width:"40%", textAlign:"end", fontSize:"14px", fontWeight:"450", color:"#6f7d8a"}}>{candidate.noticePeriod.charAt(0) + candidate.noticePeriod.charAt(1) + ' Days '}</div></div>
                    <div style={{display:"flex",justifyContent:"space-between", marginBottom:'5px'}}><div style={{width:"40%", fontSize:"12px", fontWeight:"450", color:"#6f7d8a"}}>Current Salary:</div><div style={{width:"40%", textAlign:"end", fontSize:"14px", fontWeight:"450", color:"#6f7d8a"}}>{" PKR " + candidate.currentSalary}</div></div>
                    <div style={{display:"flex",justifyContent:"space-between"}}><div style={{width:"40%", fontSize:"12px", fontWeight:"450", color:"#6f7d8a"}}>Expected Salary:</div><div style={{width:"40%", textAlign:"end", fontSize:"14px", fontWeight:"450", color:"#6f7d8a"}}>{" PKR " + candidate.expectedSalary}</div></div>
                </div>
              </div>
            </Card>
          </Col>
          )
        })}
      </Row>
    );
  };

    const handleAddCandidate = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    fetchCandidates();
  };


  return (
    <div className="content container-fluid">
      {/* Page Header */}
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Candidates</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Candidates</li>
            </ul>
          </div>
          <div className="col-auto float-end ms-auto d-flex align-items-center">
            <div className="view-icons me-3">
              <button type={viewType === 'list' ? 'primary' : 'default'}   onClick={() => setViewType('list')} style={{height:"40px", width:'40px', border:'1.5px solid #EEf0f1', borderRadius:'4px', background:'white'}} >
                <img src={list}></img>
              </button>
              <button  type={viewType === 'grid' ? 'primary' : 'default'} onClick={() => setViewType('grid')} style={{height:"40px", width:'40px', border:'1.5px solid #EEf0f1', borderRadius:'4px', background:'white'}}>
                <img src={grid}></img>
              </button>
            </div>
            <Button
              className="add-candidate-btn"
              onClick={handleAddCandidate}
            >
              <div className='btn-content'>
                <img src={circle} style={{marginRight:'8px', marginBottom:'20px'}}></img>
                <p>Add Candidate</p>  
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Search Filters */}
      <Form 
        form={form}
        onFinish={handleSearch} 
        className="search-form"
        initialValues={filters}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={4}>
            <Form.Item name="name" className="mb-0">
              <Input style={{borderRadius:"8px", height:"40px"}} placeholder="Candidate Name" allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Form.Item name="contact" className="mb-0">
              <Input style={{borderRadius:"8px", height:"40px"}} placeholder="Email" allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Form.Item name="position" className="mb-0">
              <Select placeholder="Position" allowClear
              className='custom'
                options={[
                  // { value: 'FULL_TIME', label: 'Full Time' },
                  // { value: 'PART_TIME', label: 'Part Time' },
                  // { value: 'CONTRACT', label: 'Contract' },
                  // { value: 'INTERNSHIP', label: 'Internship' },
                  // { value: 'FREELANCE', label: 'Freelance' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Form.Item name="status" className="mb-0">
              <Select placeholder="Candidate Status" allowClear
              className='custom'
                options={[
                  // { value: 'FULL_TIME', label: 'Full Time' },
                  // { value: 'PART_TIME', label: 'Part Time' },
                  // { value: 'CONTRACT', label: 'Contract' },
                  // { value: 'INTERNSHIP', label: 'Internship' },
                  // { value: 'FREELANCE', label: 'Freelance' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Form.Item name="rating" className="mb-0">
              <Select placeholder="Candidate Rating" allowClear
              className='custom'
                options={[
                  // { value: 'FULL_TIME', label: 'Full Time' },
                  // { value: 'PART_TIME', label: 'Part Time' },
                  // { value: 'CONTRACT', label: 'Contract' },
                  // { value: 'INTERNSHIP', label: 'Internship' },
                  // { value: 'FREELANCE', label: 'Freelance' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Form.Item className="mb-0">
              <Button type="primary" htmlType="submit" className="search-btn" block>
                Search
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <div className="row">
        <div className="col-md-12">
          <Spin spinning={loading}>
            {viewType === 'list' ? (
              <div className="table-responsive">
                <Table 
                  className="custom-table"
                  columns={columns}
                  dataSource={candidates}
                  rowKey="_id"
                  scroll={{ x: 1350 }}
                  pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                    pageSizeOptions: ['10', '20', '50']
                  }}
                  onChange={handleTableChange}
                />
              </div>
            ) : (
              renderGridView()
            )}
          </Spin>
        </div>
      </div>
      {/* Create Candidate Modal */}
      <CreateCandidateModal
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
        activeJobs={activeJobs}
      />

      {/* Add some global styles */}
      <style jsx global>{`
        .custom-modal .ant-modal-header {
          border-bottom: none;
          padding: 24px 24px 0;
        }
        .custom-modal .ant-modal-title {
          font-size: 24px;
          font-weight: 600;
        }
        .custom-modal .ant-modal-close {
          background-color: #F8F9FA;
          border-radius: 50%;
          border:"1px solid #F8F9FA";
          margin:16px 16px 0 0;
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
          color: #6C757D;
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
          background: #F4A261;
          border: none;
          color: white;
        }
        .view-icons .ant-btn:hover {
          background: #E76F51;
          color: white;
        }
        .view-icons .ant-btn.ant-btn-default {
          background: #F8F9FA;
          color: #4A5568;
        }
        .view-icons .ant-btn.ant-btn-default:hover {
          background: #E2E8F0;
          color: #2D3748;
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
          border: none
        }
        .job-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e0e3e6;
          box-sizing: border-box;
        }
        .job-card .ant-card-body {
          padding: 16px;
        }
        .job-card-content {
          padding: 0;
        }
        .job-details {
          width:98%;
          padding-top: 14px;
          padding-bottom: 14px;
        }
        .detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 6px;
          color: #4A5568;
          font-size: 13px;
          line-height: 1;
          height: 50%;
        }
        .detail-items{
          display: flex;
          align-items: flex-start;
          margin-bottom: 6px;
          color: #4A5568;
          font-size: 13px;
          line-height: 1;
          height: 40%;
        }
        .detail-item:last-child {
          margin-bottom: 0;
        }
        .detail-item .icons,
        .detail-items .icons{
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
        .detail-items .detail-text{
          line-height: 17px;
          font-size: 14px;
          font-weight: 450px;
          color: #56616B;
          display: flex;
          align-items: flex-end;
          margin-top: 5px;
        }

        .card-foot{
        width: 98%;
        }
        .ant-row {
          margin-right: -12px !important;
          margin-left: -12px !important;
        }
        .ant-col {
          padding-right: 12px !important;
          padding-left: 12px !important;
        }
        .custom  .ant-select-selector {
        height: 40px !important;
        border-radius: 8px !important;
        display: flex;
        align-items: center;
        padding-left: 10px;
        }

        .custom .ant-select-placeholder {
        color: white !important;
        }


        .add-candidate-btn{
          border-radius: 40px !important;
          height: 44px !important;
          background-color: #ff9244 !important;
          color: white !important;
          font-weight: 500 !important;
          font-size: 16px !important;
          border: 2px solid #ff9244 !important;
          width: 185px !important;
        }
        
        .btn-content{
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .checkbox-style{
          display: 'flex';
          gap: '24px' ;
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
        font-weight: 500;
        padding: 12px 15px;
        text-align: center !important;
      }

      .custom-table td {
        width: 300px !;
        padding: 12px 15px;
        background-color: #f7f7f8;
      }

      .custom-table tr:nth-child(even){
        background-color: #eef0f1;
      }

      .custom-table tr:hover {
        background-color: #f1f1f1;
      }



        @media (max-width: 768px) {
        .search-btn {
         justify-self: center;  
         width: 80% !important; }
        }

        @media (min-width: 350px) and (max-width: 390px) {
        .checkbox-style{
         gap: 10px;}
        }
        
        @media(min-width: 990px) and (max-width: 1200px){
        .applications-count{
          margin-right: 0;}
        }
        @media(min-width: 767px) and (max-width: 830px){
        .applications-count{
         margin-right: 0;}
        }   
      `}</style>
    </div>
  );
};

export default Candidates; 