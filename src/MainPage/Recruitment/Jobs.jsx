import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Select, Input, Modal, Form, message, Spin, Tag, InputNumber, Checkbox, Dropdown, Menu, Card, Row, Col, Pagination } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MoreOutlined, UnorderedListOutlined, AppstoreOutlined, UserAddOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import { isSessionExpired } from '../../utils/errorHandler';
import calander from '../../assets/iconsRecruitment/calander.svg';
import department from '../../assets/iconsRecruitment/department.svg';
import facebook from '../../assets/iconsRecruitment/Facebook.svg';
import indeed from '../../assets/iconsRecruitment/indeed.svg';
import linkdin from '../../assets/iconsRecruitment/linkedin-icon.svg';
import instagram from '../../assets/iconsRecruitment/insta.svg';
import more from '../../assets/iconsRecruitment/vertical.svg';
import circle from '../../assets/iconsRecruitment/circle.svg';
import grid from '../../assets/iconsRecruitment/grid.svg';
import list from '../../assets/iconsRecruitment/list.svg';
import { render } from '@fullcalendar/core/preact.js';
import { useTranslation } from "react-i18next";
import leftPageIcon from '../../assets/iconsRecruitment/fi_chevrons-left.svg';
import rightPageIcon from '../../assets/iconsRecruitment/fi_chevrons-right.svg';



// import { FaFacebook, FaLinkedin, FaInstagram } from 'react-icons/fa';

const { TextArea } = Input;

const Jobs = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
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
  const [paginationDetail, setPaginationDetail] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const handleApiError = (error) => {
    console.error('API Error:', error);
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message.error('Session expired. Please login again.');
          navigate('/login');
          break;
        case 403:
          message.error('You do not have permission to access this resource.');
          break;
        case 500:
          message.error('Server error occurred. Please try again later.');
          break;
        default:
          message.error(error.response.data?.message || 'An error occurred. Please try again.');
      }
    } else if (error.request) {
      message.error('Network error. Please check your connection.');
    } else {
      message.error('An unexpected error occurred.');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      console.error('No authentication token found');
      message.error('Please login again to continue');
      navigate('/login');
      return;
    }
    
    fetchJobs();
  }, [filters, currentPage, pageSize]);

  const fetchJobs = async () => {
    console.log('filtered jobs', filters);
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      console.error('Attempted to fetch jobs without auth token');
      message.error('Authentication required');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const queryParams = {
        page: currentPage,
        limit: pageSize,
        title: filters.title,
        jobType: filters.jobType,
        workSetup: filters.workSetup,
        department: filters.department,
      };

      // Remove undefined or empty values
      Object.keys(queryParams).forEach(key => 
        !queryParams[key] && delete queryParams[key]
      );

      console.log('Fetching jobs with params:', queryParams);

      const response = await apiServices(
        "GET", 
        `job/list?${new URLSearchParams(queryParams).toString()}`, 
        null, 
        {
          access_token: {
            accessToken: token
          }
        }
      );
      
      if (response?.data?.status) {
        console.log('Jobs fetched successfully:', {
          totalJobs: response.data.data.total,
          jobsReceived: response.data.data.docs.length
        });
        setJobs(response.data.data.docs || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.data.totalDocs || 0
        }));
        setPaginationDetail(response.data.data.totalDocs || 0);
      } else {
        console.error('Failed to fetch jobs:', response?.data);
        message.error(response?.data?.message || 'Unable to load jobs at this time. Please try again later.');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 500) {
        message.error('The system is currently unavailable. Our team has been notified and is working on it.');
      } else {
        handleApiError(error);
      }
      
      setJobs([]);
      setPagination(prev => ({
        ...prev,
        total: 0
      }));
      setPaginationDetail(0);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    });
  };

  const handleSearch = (values) => {
    console.log('Searched Values' , values)
    setPagination({
      ...pagination,
      current: 1
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

  const handleDeleteJob = async (jobId) => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    try {
      setLoading(true);
      const response = await apiServices(
        "DELETE", 
        `job/${jobId}`,
        null, 
        {
          access_token: {
            accessToken: token
          }
        }
      );
      if (response?.data?.status) {
        message.success('Job deleted successfully');
        fetchJobs();
      } else {
        message.error(response?.data?.message || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Delete job error:', error.response?.data || error.message);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = () => {
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    modalForm.resetFields();
    setIsModalVisible(false);
  };

  const handleModalSubmit = async (values) => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Authentication required');
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      
      const jobData = {
        title: values.title,
        department: values.department,
        jobType: values.jobType,
        workSetup: values.workSetup,
        salaryRange: values.salaryRange,
        positions: values.positions,
        description: values.description,
        status: 'ACTIVE',
        postingPlatforms: values.postingPlatforms || ['WEBSITE'],
        company: authState?.user?.companyId
      };

      console.log('Creating job with data:', jobData);

      const response = await apiServices(
        "POST",
        'job/create',
        jobData,
        {
          access_token: {
            accessToken: token
          }
        }
      );

      if (response?.data?.status) {
        message.success('Job created successfully');
        modalForm.resetFields();
        setIsModalVisible(false);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        message.error(response?.data?.message || 'Failed to create job');
      }
    } catch (error) {
      console.error('Job creation error:', error.response?.data || error.message);
      handleApiError(error);
    } finally {
      setSubmitting(false);
    }
  };
  const columns = [
    {
      title: 'Position',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Link to={`/recruitment/jobs/${record._id}`} style={{color: '#212529'}}>
          {text.split(' ').map(word=>word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
        </Link>
      ),
      // sorter: true,
    },
    {
      title: 'Position Open',
      dataIndex: 'positions',
      key: 'positions',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      // sorter: true,
    },
    {
      title: 'Resume',
      dataIndex: 'applicationCount',
      key: 'applicationCount',
      render: (count, record) => (
        <Link to={`/recruitment/jobs/${record._id}/applications`} style={{color: '#212529'}}>
          {count || 0}
        </Link>
      ),
    },
    {
      title: 'Post Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      // sorter: true,
    },

    // {
    //   title: 'Job Type',
    //   dataIndex: 'jobType',
    //   key: 'jobType',
    //   render: (jobType) => (
    //     <Tag color={
    //       jobType === 'FULL_TIME' ? 'blue' :
    //       jobType === 'PART_TIME' ? 'green' :
    //       jobType === 'CONTRACT' ? 'orange' :
    //       jobType === 'INTERNSHIP' ? 'purple' :
    //       jobType === 'FREELANCE' ? 'cyan' : 'default'
    //     }>
    //       {jobType?.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
    //     </Tag>
    //   ),
    //   filters: [
    //     { text: 'Full Time', value: 'FULL_TIME' },
    //     { text: 'Part Time', value: 'PART_TIME' },
    //     { text: 'Contract', value: 'CONTRACT' },
    //     { text: 'Internship', value: 'INTERNSHIP' },
    //     { text: 'Freelance', value: 'FREELANCE' },
    //   ],
    // },
    // {
    //   title: 'Work Setup',
    //   dataIndex: 'workSetup',
    //   key: 'workSetup',
    //   render: (workSetup) => (
    //     <Tag color={
    //       workSetup === 'ONSITE' ? 'red' :
    //       workSetup === 'REMOTE' ? 'green' :
    //       workSetup === 'HYBRID' ? 'blue' : 'default'
    //     }>
    //       {workSetup?.charAt(0) + workSetup?.slice(1).toLowerCase()}
    //     </Tag>
    //   ),
    //   filters: [
    //     { text: 'On-Site', value: 'ONSITE' },
    //     { text: 'Remote', value: 'REMOTE' },
    //     { text: 'Hybrid', value: 'HYBRID' },
    //   ],
    // },
    // {
    //   title: 'Salary Range',
    //   dataIndex: 'salaryRange',
    //   key: 'salaryRange',
    //   render: (salaryRange) => (
    //     <span>{salaryRange}</span>
    //   ),
    //   sorter: true,
    // },
    {
      title: 'Posted On',
      key: 'postedOn',
      render:(text,record)=>(
        <div className= 'social-icons'>
        <Link to="#" className="social-icon-one"><img src={indeed}></img></Link>
        <Link to="#" className="social-icon-two"><img src={linkdin}></img></Link>
        <Link to="#" className="social-icon-three"><img src={instagram}></img></Link> 
        <Link to="#" className="social-icon-four"><img src={facebook}></img></Link> 
      </div>
      )
    },

    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Dropdown
        overlay={<Menu>
        <Menu.Item key="edit" icon={<EditOutlined />}onClick={() => navigate(`/recruitment/jobs/${record._id}/edit`)}>Edit</Menu.Item>
        <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => {
          Modal.confirm({
            title: 'Delete Job',
            content: 'Are you sure you want to delete this job?',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => handleDeleteJob(record._id)
          });
          }}>Delete
        </Menu.Item>
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
      <Row gutter={[24, 24]} justify='start'>
        {jobs.map(job => (
          <Col xs={24} sm={12} md={8} key={job._id}>
            <Card
              className="job-card"
            >
              <div className="job-card-content">
                <div style={{display:'flex', justifyContent:'space-between', width:"98%"}}>
                  <div>
                    <h3 className="job-title">
                      <Link to={`/recruitment/jobs/${job._id}`}>{job.title.split(' ').map(word=>word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</Link>
                    </h3>
                    <p className="positions-count">{job.positions} open positions</p>
                  </div>
                  <Dropdown
                  overlay={<Menu>
                  <Menu.Item key="edit" icon={<EditOutlined />}onClick={() => navigate(`/recruitment/jobs/${job._id}/edit`)}>Edit</Menu.Item>
                  <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => {
                    Modal.confirm({
                      title: 'Delete Job',
                      content: 'Are you sure you want to delete this job?',
                      okText: 'Yes, Delete',
                      okType: 'danger',
                      cancelText: 'No',
                      onOk: () => handleDeleteJob(job._id)
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
                    <div className = 'icons'><img src={department}></img></div>
                    <div className = 'detail-text'>{job.department}</div>
                    {/* <span className="icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#4A5568"/>
                        <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#4A5568"/>
                      </svg>
                    </span>
                    <span className="detail-text"></span> */}
                  </div>
                  <div className="detail-items">
                   <div className = 'icons'><img src={calander}></img></div>
                   <div className = 'detail-text'>{new Date(job.createdAt).toLocaleDateString()}</div>
                    {/* <span className="icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" fill="#4A5568"/>
                        <path d="M16 2V6M8 2V6M3 10H21M8 14H8.01M12 14H12.01M16 14H16.01M8 18H8.01M12 18H12.01M16 18H16.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <span className="detail-text"></span> */}
                  </div>
                </div>

                <div className="card-foot">
                  {/* <div className="posted-on">
                    <span>Posted on:</span> */}
                    {/* <div className="social-icons">
                      <Link to="#" className="social-icon"><FaLinkedin /></Link>
                      <Link to="#" className="social-icon"><FaInstagram /></Link>
                      <Link to="#" className="social-icon"><FaFacebook /></Link>
                    </div> */}
                  {/* </div>
                  <div className="applications-count">
                    <Link to={`/recruitment/jobs/${job._id}/applications`}>
                      {job.applicationCount || 0} Applications
                    </Link>
                  </div> */}
                  <div style={{width:'60%'}}>
                    <div className='post-on'><span>Posted on:</span></div>
                    <div className= 'social-icons'>
                      <Link to="#" className="social-icon-one"><img src={indeed}></img></Link>
                      <Link to="#" className="social-icon-two"><img src={linkdin}></img></Link>
                      <Link to="#" className="social-icon-three"><img src={instagram}></img></Link> 
                      <Link to="#" className="social-icon-four"><img src={facebook}></img></Link> 
                    </div>
                  </div>
                  <div className="applications-count">
                    <Link to={`/recruitment/jobs/${job._id}/applications`}>
                      <div className= 'applications-count-number'>{job.applicationCount || 0}</div>
                      <div className='applications-count-text'>Applications</div>
                    </Link>
                  </div> 
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="content container-fluid">
      {/* Page Header */}
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Jobs</h3>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
              <li className="breadcrumb-item active">Jobs</li>
            </ul>
          </div>
          <div className="col-auto float-end ms-auto d-flex align-items-center">
            <div className="view-icons me-3">
              {/* <Button
                type={viewType === 'grid' ? 'primary' : 'default'}
                // icon={<div style={{display: 'flex',  justifyContent: 'center'}}><i className="fa fa-th"/></div>}
                icon= {<img src={grid} style={{display:'flex', justifyContent:"center", width:'25px', height:'25px'}}></img>}
                onClick={() => setViewType('grid')}
              /> */}
              <button type={viewType === 'list' ? 'primary' : 'default'}   onClick={() => setViewType('list')} style={{height:"40px", width:'40px', border:'1.5px solid #EEf0f1', borderRadius:'4px', background:'white'}} >
                <img src={list}></img>
              </button>
              <button  type={viewType === 'grid' ? 'primary' : 'default'} onClick={() => setViewType('grid')} style={{height:"40px", width:'40px', border:'1.5px solid #EEf0f1', borderRadius:'4px', background:'white'}}>
                <img src={grid}></img>
              </button>
              {/* <Button
                type={viewType === 'list' ? 'primary' : 'default'}
                // icon={<div style={{display:'flex', justifyContent:'center'}}><img src={list}></img></div>}
                icon={<img src={list}></img>}
                onClick={() => setViewType('list')}
                className="me-1"
              /> */}
            </div>
            <Button
              className="add-candidate-btn"
              onClick={handleAddJob}
            >
              <div className='btn-content'>
                <img src={circle} style={{marginRight:'8px', marginBottom:'20px'}}></img>
                <p>Add New Job</p>  
              </div>
            </Button>
          </div>
        </div>
      </div>

      {/* Search Filters */}
      <Form 
        form={form}
        onFinish={handleSearch} 
        onValuesChange={(changedValues, allValues) => {
          const clearedField = Object.keys(changedValues).find(
            key => changedValues[key] === '' || changedValues[key] === undefined
          );
          if (clearedField) {
            handleSearch(allValues);        
          }
        }}
        className="search-form"
        initialValues={filters}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={5}>
            <Form.Item name="title" className="mb-0">
              <Input style={{borderRadius:"8px", height:"40px"}} placeholder="Job Name" allowClear />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Form.Item name="department" className="mb-0">
              <Select
                placeholder="Department"
                allowClear
                className='custom'
                options={[
                  { value: 'Engineering', label: 'Engineering' },
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Sales', label: 'Sales' },
                  { value: 'HR', label: 'HR' },
                  { value: 'Finance', label: 'Finance' },
                  { value: 'Operations', label: 'Operations' },
                  { value: 'Design', label: 'Design' },
                  { value: 'Product', label: 'Product' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Form.Item name="jobType" className="mb-0">
              <Select placeholder="Job Type" allowClear
              className='custom'
                options={[
                  { value: 'FULL_TIME', label: 'Full Time' },
                  { value: 'PART_TIME', label: 'Part Time' },
                  { value: 'CONTRACT', label: 'Contract' },
                  { value: 'INTERNSHIP', label: 'Internship' },
                  { value: 'FREELANCE', label: 'Freelance' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Form.Item name="workSetup" className="mb-0">
              <Select placeholder="Work Setup" allowClear
              className='custom'
                options={[
                  { text: 'On-Site', value: 'ONSITE' },
                  { text: 'Remote', value: 'REMOTE' },
                  { text: 'Hybrid', value: 'HYBRID' },
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

      {/* Add Job Modal */}
      <Modal
        title="Add New Job"
        visible={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={800}
        className="custom-modal"
        style={{ zIndex: 2000 }}
        maskStyle={{ zIndex: 1999, background: 'rgba(0, 0, 0, 0.5)' }}
      >
        <Form
          form={modalForm}
          layout="vertical"
          onFinish={handleModalSubmit}
          initialValues={{
            positions: 1,
            postingPlatforms: ['WEBSITE'],
            status: 'ACTIVE'
          }}
        >
          <div className="row">
            <div style={{height:"20px", width:"100%", display:"flex", justifyContent:"center", borderTop:"1px solid #E2E8F0"}}></div>
            <div className="col-md-6">
              <Form.Item
                name="department"
                label={<>Department</>}
                rules={[{ required: true, message: 'Please select department' }]}
              >
                <Select placeholder="Enter Department" className= 'customized'>
                  <Select.Option value="Engineering">Engineering</Select.Option>
                  <Select.Option value="Marketing">Marketing</Select.Option>
                  <Select.Option value="Sales">Sales</Select.Option>
                  <Select.Option value="HR">HR</Select.Option>
                  <Select.Option value="Finance">Finance</Select.Option>
                  <Select.Option value="Operations">Operations</Select.Option>
                  <Select.Option value="Design">Design</Select.Option>
                  <Select.Option value="Product">Product</Select.Option>
                </Select>
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="title"
                label={<>Job Title</>}
                rules={[{ required: true, message: 'Please enter job title' }]}
              >
                <Input placeholder="Enter Job" />
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="jobType"
                label={<>Job Type</>}
                rules={[{ required: true, message: 'Please select job type' }]}
              >
                <Select placeholder="Full Time" className= 'customized'>
                  <Select.Option value="FULL_TIME">Full Time</Select.Option>
                  <Select.Option value="PART_TIME">Part Time</Select.Option>
                  <Select.Option value="CONTRACT">Contract</Select.Option>
                  <Select.Option value="INTERNSHIP">Internship</Select.Option>
                  <Select.Option value="FREELANCE">Freelance</Select.Option>
                </Select>
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="workSetup"
                label={<>Work Setup</>}
                rules={[{ required: true, message: 'Please select work setup' }]}
              >
                <Select placeholder="Work Setup" className= 'customized'>
                  <Select.Option value="ONSITE">On-site</Select.Option>
                  <Select.Option value="REMOTE">Remote</Select.Option>
                  <Select.Option value="HYBRID">Hybrid</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Item
                name="salaryRange"
                label={<>Salary Range</>}
                rules={[{ required: true, message: 'Please enter salary range' }]}
              >
                <Input placeholder="100 - 200"/>
              </Form.Item>
            </div>
            <div className="col-md-6">
              <Form.Item
                name="positions"
                label={<>No of. Positions</>}
                rules={[
                  { required: true, message: 'Please enter number of positions' },
                  { type: 'number', min: 1, message: 'Must be at least 1 position' }
                ]}
              >
                <InputNumber min={1} style={{ width: '100%', display:"flex", alignItems:"center" }} placeholder="1" />
              </Form.Item>
            </div>
          </div>

          <Form.Item
            name="description"
            label={<>Job Description</>}
            rules={[{ required: true, message: 'Please enter job description' }]}
          >
            <TextArea rows={6} placeholder="Add Description" />
          </Form.Item>

          <Form.Item
            name="postingPlatforms"
            label="Post this Job on"
            initialValue={['WEBSITE']}
          >
            <Checkbox.Group>
              <div className= 'checkbox-style'>
                <Checkbox value="FACEBOOK">Facebook</Checkbox>
                <Checkbox value="LINKEDIN">LinkedIn</Checkbox>
                <Checkbox value="WEBSITE">Website</Checkbox>
              </div>
            </Checkbox.Group>
          </Form.Item>

          <Form.Item className="text-end mt-3" style={{backgroundColor:'transparent', height:"70px"}}>
            <Button 
              onClick={handleModalCancel} 
              style={{ 
                marginRight: 12,
                padding: '6px 24px',
                height: '40px',
                borderRadius: '40px',
                background: '#F8F9FA',
                border: 'none'
              }}
            >
              Reset
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              style={{ 
                padding: '6px 24px',
                height: '40px',
                borderRadius: '40px',
                background: '#ff9244',
                border: 'none',
                color:"white"
              }}
            >
              Create Job
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Jobs View */}
      <div className="row">
        <div className="col-md-12">
          <Spin spinning={loading}>
            {viewType === 'list' ? (
              <>
                {jobs?.length > 0 && (
                  <Row justify="space-between" style={{ marginBottom: 16 }}>
                    <Col>
                      <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                      <div style={{fontSize:'14px'}}>Show</div>
                      <Select
                        className='new'
                        value={pageSize}
                        onChange={(size) => {
                          setPageSize(size);
                          setCurrentPage(1);
                        }}
                        style={{width:60}}
                      >
                        {['20', '30', '40', '50'].map((size) => (
                          <Option key={size} value={parseInt(size, 10)}>
                            {size}
                          </Option>
                        ))}
                      </Select>
                      <div style={{fontSize:'14px'}}>entries</div>
                      </div>
                    </Col>
                  </Row>
                )}
                <div className="table-responsive">
                  <Table 
                  className="table-striped"
                  columns={columns}
                  dataSource={jobs}
                  rowKey="_id"
                  // pagination={{
                  //   ...pagination,
                  //   showSizeChanger: true,
                  //   showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  //   pageSizeOptions: ['10', '20', '50']
                  // }}
                  // onChange={handleTableChange}
                  pagination = {false}
                />
              </div>
              {jobs?.length > 0 && (
                  <Row justify="space-between" align="middle" style={{ marginTop: 16 }}>
                    <Col>
                      <span style={{fontSize:'14px'}}>
                        {t('paginationShow', {
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
                        pageSizeOptions={['20', '30', '40', '50']}
                        itemRender={(current, type, originalElement) =>{
                            if (type === 'prev') {
                              return <img src={leftPageIcon} style={{height:"24px" , width:"24px"}} />;
                            }
                            if (type === 'next') {
                              return <img src={rightPageIcon} style={{height:"24px" , width:"24px"}} />;
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
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'190px'
        }
        .job-title a {
          color: #212529;
        }
        .positions-count {
          color: #56616B;
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
          color: #F4A261;
        }
        .applications-count {
          text-align: start;
          margin-right: 15px;
        }
        .applications-count-number {
          color: #FF9244;
          font-weight: 500;
          font-size: 28px;
          height: 60%;
          margin-left: 3px;
        }
        .applications-count-text{
          color: #56616B;
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

        .new .ant-select-selector{
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

        .customized .ant-select-selector{
        height: 56px !important;
        border-radius: 8px !important;
        display: flex;
        align-items: center;
        padding-left: 10px;
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
        @media(min-width: 768px) and (max-width: 1300px){
          .job-card{
            height: 300px;
          }
          .job-title{
            font-size: 16px;
          }
        }
        @media(min-width: 576px) and (max-width: 3px){
          .job-card{
            height: 300px;
          }
          .job-title{
            font-size: 16px;
          }
        }

        .ant-modal-mask {
          z-index: 1999 !important;
        }
        .ant-modal, 
        .ant-modal-wrap,
        .ant-modal-mask {
          z-index: 2000 !important;
        }
        
        body.modal-open {
          overflow: hidden;
        }
      `}</style>
      


    </div>
  );
};

export default Jobs; 