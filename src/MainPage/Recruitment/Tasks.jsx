import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Table, Button, Select, Input, Modal, Form, message, Spin, Tag, Row, Col, Card, Dropdown, Menu } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import moment from 'moment';
import list from '../../assets/iconsRecruitment/list.svg';
import grid from '../../assets/iconsRecruitment/grid.svg';
import circle from '../../assets/iconsRecruitment/circle.svg';
import CreateTaskModal from './CreateTaskModal';
import more from '../../assets/iconsRecruitment/vertical.svg';
import description from '../../assets/iconsRecruitment/description.svg';
import clock from '../../assets/iconsRecruitment/clock.svg';
import calander from '../../assets/iconsRecruitment/calander.svg';


const Tasks = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({});
  const [form] = Form.useForm();
  const authState = useSelector((state) => state.user.loginvalue);
  const [viewType, setViewType] = useState('list');
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Please login again to continue');
      navigate('/login');
      return;
    }
    
    fetchTasks();
  }, [filters, pagination.current, pagination.pageSize]);

  const fetchTasks = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Authentication required');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching tasks with filters:', filters);
      
      const queryParams = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...(filters.candidateName && { candidateName: filters.candidateName }),
        ...(filters.status && { status: filters.status }),
      };

      console.log('API request params:', queryParams);

      const response = await apiServices(
        "GET", 
        `task/list?${new URLSearchParams(queryParams).toString()}`, 
        null, 
        {
          access_token: {
            accessToken: token
          }
        }
      );
      
      console.log('API response:', response);
      
      if (response?.data?.status) {
        const tasksData = response.data.data;
        console.log('Tasks data:', tasksData);
        setTasks(tasksData.docs || []);
        setPagination(prev => ({
          ...prev,
          total: tasksData.totalDocs || 0
        }));
      } else {
        console.error('Failed to fetch tasks:', response?.data);
        message.error(response?.data?.message || 'Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      message.error('Error fetching tasks. Please try again');
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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // const columns = [
  //   {
  //     title: 'Candidate Name',
  //     key: 'candidateName',
  //     render: (_, record) => (
  //       <Link to={`/recruitment/candidates/${record.candidateId._id}`}>
  //         {record.candidateId.firstName} {record.candidateId.lastName}
  //       </Link>
  //     ),
  //     sorter: true,
  //   },
  //   {
  //     title: 'Task Name',
  //     dataIndex: 'taskName',
  //     key: 'taskName',
  //     render: (_, record) => (
  //       <Link to={`/recruitment/tasks/${record._id}`}>
  //         {record.taskName}
  //       </Link>
  //     ),
  //     sorter: true,
  //   },
  //   {
  //     title: 'Reviewer',
  //     key: 'reviewer',
  //     render: (_, record) => {
  //       const reviewers = record.taskReviewers || [];
  //       return reviewers.map(reviewer => reviewer.fullName).join(', ') || 'N/A';
  //     },
  //   },
  //   {
  //     title: 'Due Date',
  //     key: 'dueDate',
  //     render: (_, record) => (
  //       <span>
  //         {moment(record.lastDateOfSubmission).format('DD MMM YYYY')}
  //       </span>
  //     ),
  //     sorter: true,
  //   },
  //   {
  //     title: 'Duration',
  //     key: 'duration',
  //     render: (_, record) => `${record.taskDuration} days`,
  //   },
  //   {
  //     title: 'Status',
  //     dataIndex: 'status',
  //     key: 'status',
  //     render: (status) => (
  //       <Tag color={
  //         status === 'PENDING' ? 'orange' :
  //         status === 'SUBMITTED' ? 'blue' :
  //         status === 'COMPLETED' ? 'green' :
  //         status === 'OVERDUE' ? 'red' :
  //         'default'
  //       }>
  //         {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase()}
  //       </Tag>
  //     ),
  //   },
  //   {
  //     title: 'Score',
  //     key: 'score',
  //     render: (_, record) => {
  //       if (!record.feedback || record.feedback.length === 0) {
  //         return '-';
  //       }
  //       const latestFeedback = record.feedback[0];
  //       return (
  //         <div className="d-flex align-items-center">
  //           <CheckCircleFilled style={{ color: '#52c41a', marginRight: 4 }} />
  //           <span>{latestFeedback.rating || '-'}/5</span>
  //         </div>
  //       );
  //     }
  //   },
  //   {
  //     title: 'Decision',
  //     key: 'decision',
  //     render: (_, record) => {
  //       if (!record.feedback || record.feedback.length === 0) {
  //         return '-';
  //       }
  //       const latestFeedback = record.feedback[0];
  //       return (
  //         <Tag color={latestFeedback.decision === 'PASS' ? 'success' : 'error'}>
  //           {latestFeedback.decision}
  //         </Tag>
  //       );
  //     }
  //   }
  // ];


  const handleSubmit = async (values) => {
    try {
      const response = await apiServices("POST", "task/create", values, {
        headers: {
          Authorization: `Bearer ${authState.access_token}`,
        },
      });

      if (response?.data?.success) {
        setTasks((prevTasks) => [...prevTasks, response.data.data]);
        setIsModalVisible(false);
        message.success("Task created successfully!");
      } else {
        message.error(response?.data?.message || "Failed to create task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      message.error("Error creating task. Please try again");
    }
  };


  const columns = [
    {
      title: 'Candidate Name',
      key: 'candidateName',
      dataIndex: 'candidateName',
      render: (_, record) => (
        <div style={{display:"flex", alignItems:'center'}}>
          <div style={{height:'40px' ,width:"40px", border:"1px solid transparent" , borderRadius:"50%", background:'#f5f1fd', color:'#9368e9', display:"flex", justifyContent:"center", alignItems:'center', marginLeft:"10px", marginRight:"10px"}}>{record.candidateId.firstName[0].toUpperCase() + record.candidateId.lastName[0].toUpperCase()}</div>
            <Link to={`/recruitment/tasks/${record._id}`}>
              {record.candidateId.firstName} {record.candidateId.lastName}
            </Link>
        </div>

      ),
      sorter: true,
    },
    {
       title: 'Task Name',
      dataIndex: 'taskName',
      key: 'taskName',
      render: (_, record) => (
        <Link>
          {record.taskName}
        </Link>
      ),
      sorter: true,
    },
    {
      title: 'Reviewers',
      key: 'Reviewers',
      render:(_,record)=>{
        const Reviewers = record.taskReviewers;
        return(
          <div className='social-icons'>
            {Reviewers.map((reviewer, index) => (
              <Link key={index} to="#" className="social-icon-two">
                <img src={reviewer?.imageUrl} style={{ height: "40px", width: "40px", borderRadius: "50%", border: '2px solid white' }} />
              </Link>
            ))}
          </div>
        )
      },
      sorter: true,
    },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => (
      <Tag color={
        status === 'PENDING' ? 'orange' :
        status === 'SUBMITTED' ? 'blue' :
        status === 'COMPLETED' ? 'green' :
        status === 'OVERDUE' ? 'red' :
        'default'
      }>
        {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase()}
      </Tag>
    ),
  },
  {
    title: 'Due Date',
    key: 'dueDate',
    render: (_, record) => (
      <span>
        {moment(record.lastDateOfSubmission).format('DD MMM YYYY')}
      </span>
    ),
    sorter: true,
  },
  {
    title: 'Duration',
    key: 'duration',
    render: (_, record) => `${record.taskDuration} days`,
  },
  {
    title: 'Decision',
    key: 'decision',
    render: (_, record) => {
      if (!record.feedback || record.feedback.length === 0) {
        return '-';
      }
      const latestFeedback = record.feedback[0];
      return (
        <Tag color={latestFeedback.decision === 'PASS' ? 'success' : 'error'}>
          {latestFeedback.decision}
        </Tag>
      );
    }
  }
  ];

  // Render Grid View

  const renderGridView = () => {
    return (
      <Row gutter={[24, 24]}>
        {tasks.map(task => {
          const FirstName = task?.candidateId.firstName;
          const LastName = task?.candidateId.lastName;
          const fullName = FirstName + " "  + LastName;
          const initials = FirstName[0].toUpperCase() + LastName[0].toUpperCase();
          return(
          <Col xs={24} sm={12} md={8}>
            <Card className="job-card">
              <div>
                <div style={{display:'flex', justifyContent:'space-between', width:"98%"}} >
                  <div style={{display:"flex"}}>
                    <div style={{height:'50px' ,width:'50px', border:'1px solid transparent', borderRadius:'50%', background:"#f3eaff", color:'#8326ff', display:"flex", justifyContent:"center", alignItems:'center'}}>{initials}</div>
                    <div style={{marginLeft:"12px"}}>
                      <div style={{fontSize:"18px" ,fontWeight:"500", color:'#212529', paddingTop:"3px"}}>
                      <Link to={`/recruitment/tasks/${task._id}`}>
                        {fullName}
                      </Link>
                      </div>
                      <div style={{color:'#56616b', fontSize:'12px', fontWeight:"450"}}>Hello</div>
                    </div>
                  </div>
                  <Dropdown 
                    overlay={<Menu>
                      <Menu.Item key="edit" icon={<EditOutlined />}onClick={() => navigate(`/recruitment/tasks/${task._id}/edit`)}>Edit</Menu.Item>
                      <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => {
                        Modal.confirm({
                          title: 'Delete Job',
                          content: 'Are you sure you want to delete this task?',
                          okText: 'Yes, Delete',
                          okType: 'danger',
                          cancelText: 'No',
                          onOk: () => handleDeleteTask(task._id)
                        });
                      }}>Delete</Menu.Item>
                    </Menu>}
                    trigger={['click']}
                    placement="bottomRight">
                    <div style={{ cursor: 'pointer',height:'25px', marginTop:"5px" }}>
                      <img src={more} alt="More Options" />
                    </div>
                  </Dropdown>
                </div>
                <div style={{marginTop:"12px"}}>
                  <div style={{display:"flex", marginTop:'7px'}}>
                    <div><img src={description}></img></div>
                    <div style={{paddingTop:"3px", marginLeft:"12px" ,color:"#56616b"}}>
                      {task?.taskName}
                    </div>
                  </div>
                  <div style={{display:"flex", marginTop:'7px'}}>
                    <div><img src={clock}></img></div>
                    <div  style={{paddingTop:"3px", marginLeft:"12px", color:"#56616b"}}>{moment(task?.lastDateOfSubmission, 'Hh:mm').format('hh:mm A')}</div>
                  </div>
                  <div  style={{display:"flex" , marginTop:"7px"}}>
                    <div><img src={calander}></img></div>
                    <div  style={{paddingTop:"3px", marginLeft:"12px",color:"#56616b"}}>{task.taskDuration} Days</div>
                  </div>
                  <Tag color={
                    task?.status === 'PENDING' ? 'orange' :
                    task?.status === 'SUBMITTED' ? 'blue' :
                    task?.status === 'COMPLETED' ? 'green' :
                    task?.status === 'OVERDUE' ? 'red' :
                    'default'
                      } style={{borderRadius:'70px', marginTop:"13px"}}
                    >
                      {task?.status?.charAt(0).toUpperCase() + task?.status?.slice(1).toLowerCase()}
                    </Tag>
                </div>
                <div style={{marginTop:"12px"}}>
                  <h3>Reviewers:</h3>
                  <div>
                    {task?.taskReviewers.map((Reviewer, index)=>(
                      <Link>
                        <img src={Reviewer?.imageUrl} style={{ height: "30px", width: "30px", borderRadius: "50%", border:'2px solid white'}}/>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          )
        })}
      </Row>
    );
  };

  // return (
  //   <div className="content container-fluid">
  //     {/* Page Header */}
  //     <div className="page-header">
  //       <div className="row align-items-center">
  //         <div className="col">
  //           <h3 className="page-title">Tasks</h3>
  //           <ul className="breadcrumb">
  //             <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
  //             <li className="breadcrumb-item active">Tasks</li>
  //           </ul>
  //         </div>
  //         <div className="col-auto float-end ms-auto d-flex align-items-center">
  //           <div className="view-icons me-2">
  //             <Button
  //               type={viewType === 'list' ? 'primary' : 'default'}
  //               icon={<UnorderedListOutlined />}
  //               onClick={() => setViewType('list')}
  //               className="me-1"
  //             />
  //             <Button
  //               type={viewType === 'grid' ? 'primary' : 'default'}
  //               icon={<AppstoreOutlined />}
  //               onClick={() => setViewType('grid')}
  //             />
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  return (

    <div className="content container-fluid">
    {/* Page Header */}
    <div className="page-header">
      <div className="row align-items-center">
        <div className="col">
          <h3 className="page-title">Tasks</h3>
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
            <li className="breadcrumb-item active">Tasks</li>
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
            onClick={showModal}
          >
            <div className='btn-content'>
              <img src={circle} style={{marginRight:'8px', marginBottom:'20px'}}></img>
              <p>Create Task</p>  
            </div>
          </Button>
        </div>
      </div>
    </div>


      {/* <Form 
        form={form}
        onFinish={handleSearch} 
        className="search-form"
        initialValues={filters}
      >
        <div className="col-sm-6 col-md-3">
          <Form.Item name="candidateName">
            <Input placeholder="Candidate Name" allowClear />
          </Form.Item>
        </div>
        <div className="col-sm-6 col-md-3">
          <Form.Item name="status">
            <Select
              placeholder="Status"
              allowClear
              options={[
                { value: 'PENDING', label: 'Pending' },
                { value: 'SUBMITTED', label: 'Submitted' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'OVERDUE', label: 'Overdue' }
              ]}
            />
          </Form.Item>
        </div>
        <div className="col-sm-6 col-md-3">
          <Form.Item>
            <div className="d-flex gap-2">
              <Button type="primary" htmlType="submit" className="btn btn-success flex-grow-1">
                Search
              </Button>
              <Button onClick={handleReset} className="flex-grow-1">
                Reset
              </Button>
            </div>
          </Form.Item>
        </div>
      </Form> */}


    {/* Search Filters */}
    <Form 
      form={form}
      onFinish={handleSearch} 
      className="search-form"
      initialValues={filters}
    >
  <Row gutter={[12, 12]} align="middle" justify="space-between">
    
    <Col xs={24} sm={18} md={18}>
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={5}>
          <Form.Item name="candidateName" className="mb-0">
            <Input 
              style={{ borderRadius: "8px", height: "40px" }} 
              placeholder="Candidate Name" 
              allowClear 
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Form.Item name="status" className="mb-0">
            <Select
              placeholder="Task Status"
              allowClear
              className='custom'
              options={[
                { value: 'PENDING', label: 'Pending' },
                { value: 'SUBMITTED', label: 'Submitted' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'OVERDUE', label: 'Overdue' }
              ]}
            />
          </Form.Item>
        </Col>
      </Row>
    </Col>

    <Col xs={24} sm={12} md={4} style={{ textAlign: "right" }}>
      <Form.Item className="mb-0">
        <Button type="primary" htmlType="submit" className="search-btn" block>
          Search
        </Button>
      </Form.Item>
    </Col>

  </Row>
    </Form>

    <CreateTaskModal
      isVisible={isModalVisible}
      onCancel={handleCancel}
      onSubmit = {handleSubmit}
    />

      {/* Tasks List */}
      {/* <div className="row">
        <div className="col-md-12">
          <Spin spinning={loading}>
            <div className="table-responsive">
              <Table 
                className="table-striped"
                columns={columns}
                dataSource={tasks}
                rowKey="_id"
                scroll={{ x: 1200 }}
                pagination={{
                  ...pagination,
                  showSizeChanger: true,
                  showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  pageSizeOptions: ['10', '20', '50']
                }}
                onChange={handleTableChange}
                onRow={(record) => ({
                  onClick: () => navigate(`/recruitment/tasks/${record._id}`),
                  style: { cursor: 'pointer' }
                })}
              />
            </div>
          </Spin>
        </div>
      </div> */}

    <div className="row">
      <div className="col-md-12">
        <Spin spinning={loading}>
          {viewType === 'list' ? (
            <div className="table-responsive">
              <Table 
                className="table-striped"
                columns={columns}
                dataSource={tasks}
                rowKey="_id"
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

      {/* <style jsx global>{`
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
        .ant-table-tbody > tr:hover {
          background-color: #f5f5f5;
        }
        .ant-table-tbody > tr > td {
          transition: background 0.3s;
        }
        .ant-table-row {
          cursor: pointer;
        }
        .ant-table-cell a {
          color: inherit;
          text-decoration: none;
        }
        .ant-table-cell a:hover {
          color: #1890ff;
        }
      `}</style> */}

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



      

    `}</style>
    </div>
  );
};

export default Tasks; 