import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Tag, Button, Dropdown, Menu, Table, Modal, message} from 'antd';
import { Link ,useNavigate  } from 'react-router-dom';
import { 
  MoreOutlined, 
  UserOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TrophyOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import orangeFile from '../../assets/iconsRecruitment/orangeFile.svg';
import fileCheck from '../../assets/iconsRecruitment/fileCheck.svg';
import handShakeIcon from '../../assets/iconsRecruitment/handShakeIcon.svg';
import fileCrossed from '../../assets/iconsRecruitment/fileCrossed.svg';
import list from '../../assets/iconsRecruitment/list.svg';
import grid from '../../assets/iconsRecruitment/grid.svg';
import indeed from '../../assets/iconsRecruitment/indeed.svg';
import linkedin from '../../assets/iconsRecruitment/linkedin-icon.svg';
import instagram from '../../assets/iconsRecruitment/insta.svg';
import facebook from '../../assets/iconsRecruitment/Facebook.svg';
import more from '../../assets/iconsRecruitment/vertical.svg';
import departmentIcon from '../../assets/iconsRecruitment/department.svg';
import calander from '../../assets/iconsRecruitment/calander.svg';







const { Title, Text } = Typography;

const COLORS = ['#1890FF', '#52C41A', '#FAAD14', '#722ED1', '#F5222D'];

// const DashboardCard = ({ title, value, icon, color }) => (
//   <Card>
//     <div style={{ display: 'flex', alignItems: 'center' }}>
//       <div style={{ 
//         width: 48, 
//         height: 48, 
//         borderRadius: 8,
//         background: color?.bg || '#e3f2fd',
//         color: color?.text || '#1976d2',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         fontSize: 24,
//         marginRight: 16
//       }}>
//         {icon}
//       </div>
//       <div>
//         <Title level={3} style={{ margin: 0 }}>{value}</Title>
//         <Text>{title}</Text>
//       </div>
//     </div>
//   </Card>
// );

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    shortlisted: 0,
    hired: 0,
    rejected: 0,
    statusBreakdown: {},
    sourceBreakdown: {},
    departmentBreakdown: {},
    monthlyBreakdown: []
  });
  const [viewType , setViewType] = useState('grid');
  const [openPositions, setOpenPositions] = useState([]);
  const [TotalPositions, setTotalPositions] = useState([]);
  const authState = useSelector((state) => state.user.loginvalue);
  const [pagination , setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  useEffect(() => {
    fetchDashboardData();
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    try {
      setLoading(true);

      // Fetch latest jobs
      const jobsResponse = await apiServices(
        "GET",
        'job/list?limit=3&sort=-createdAt',
        null,
        {
          access_token: {
            accessToken: token
          }
        }
      );

      if (jobsResponse?.data?.status) {
        setOpenPositions(jobsResponse.data.data.docs || []);
        setTotalPositions(jobsResponse.data.data.totalDocs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    try {
      setLoading(true);

      // Fetch candidate statistics
      const statsResponse = await apiServices(
        "GET",
        'candidate/stats',
        null,
        {
          access_token: {
            accessToken: token
          }
        }
      );

      if (statsResponse?.data?.status) {
        setStats(statsResponse.data.data);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Process source data for pie chart
  const sourceChartData = Object.entries(stats.sourceBreakdown || {})
    .map(([name, value]) => ({
      name: name === 'jobPortal' ? 'Job Portal' : name.charAt(0).toUpperCase() + name.slice(1),
      value,
      percentage: ((value / (stats.total || 1)) * 100).toFixed(1)
    }))
    .filter(item => item.value > 0);

  // Process department data for pie chart
  const departmentChartData = Object.entries(stats.departmentBreakdown || {})
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      percentage: ((value / (stats.total || 1)) * 100).toFixed(1)
    }))
    .filter(item => item.value > 0);

  // Get last 6 months of data
  const last6MonthsData = stats.monthlyBreakdown
    ? stats.monthlyBreakdown.slice(-6)
    : [];

    const columns = [
      {
        title: 'Position',
        dataIndex: 'title',
        key: 'title',
        render: (text, record) => (
          <Link to={`/recruitment/jobs/${record._id}`} className="text-primary">
            {text}
          </Link>
        ),
        sorter: true,
      },
      {
        title: 'Position Open',
        dataIndex: 'positions',
        key: 'positions',
        sorter: true,
      },
      {
        title: 'Department',
        dataIndex: 'department',
        key: 'department',
        sorter: true,
      },
      {
        title: 'Resume',
        dataIndex: 'applicationCount',
        key: 'applicationCount',
        render: (count, record) => (
          <div className="text-primary">
            {count || 0}
          </div>
        ),
        sorter: true,
      },
      {
        title: 'Post Date',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date) => new Date(date).toLocaleDateString(),
        sorter: true,
      },
      {
        title: 'Posted On',
        key: 'postedOn',
        render:(text,record)=>(
          <div className= 'social-icons'>
          <img className="social-icon-one" src={indeed}></img>
          <img className="social-icon-two" src={linkedin}></img>
          <img className="social-icon-three" src={instagram}></img> 
          <img className="social-icon-four" src={facebook}></img> 
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
          }}>Delete</Menu.Item>
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

    const handleTableChange = (newPagination, filters, sorter) => {
      setPagination({
        ...pagination,
        current: newPagination.current,
        pageSize: newPagination.pageSize
      });
    };

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
          await fetchJobs();
          return Promise.resolve();
        } else {
          message.error(response?.data?.message || 'Failed to delete job');
          return Promise.reject();
        }
      } catch (error) {
        console.error('Delete job error:', error.response?.data || error.message);
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="content container-fluid">
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">Dashboard</h3>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {/* <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard
            title="Applications"
            value={stats.total}
            icon={<UserOutlined />}
            color={{ bg: '#e3f2fd', text: '#1976d2' }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard
            title="Shortlisted"
            value={stats.shortlisted}
            icon={<CheckCircleOutlined />}
            color={{ bg: '#fff3e0', text: '#f57c00' }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard
            title="Hired"
            value={stats.hired}
            icon={<TrophyOutlined />}
            color={{ bg: '#e8f5e9', text: '#2e7d32' }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <DashboardCard
            title="Rejected"
            value={stats.rejected}
            icon={<CloseCircleOutlined />}
            color={{ bg: '#ffebee', text: '#c62828' }}
          />
        </Col>
      </Row> */}

        <div style={{width:"100%"}}>
          <div className='dashboard-cards'>
            <div className='information-card'>
              <div className='image-direction'>
                <div className='card-image'><img src={orangeFile}></img></div>
              </div>
              <div className='info-direction'>
                <p className='info-numbers'>{stats?.total}</p>
                <p className='info-detail'>Applications</p>
              </div>
            </div>

            <div className='information-card'>
              <div className='image-direction'>
                <div className='card-image'><img src={fileCheck}></img></div>
              </div>
              <div className='info-direction'>
                <p className='info-numbers'>{stats?.shortlisted}</p>
                <p className='info-detail'>Shortlisted</p>
              </div>
            </div>

            <div className='information-card'>
              <div className='image-direction'>
                <div className='card-image'><img src={handShakeIcon}></img></div>
              </div>
              <div className='info-direction'>
                <p className='info-numbers'>{stats?.hired}</p>
                <p className='info-detail'>Hired</p>
              </div>
            </div>

            <div className='information-card'>
              <div className='image-direction'>
                <div className='card-image'><img src={fileCrossed}></img></div>
              </div>
              <div className='info-direction'>
                <p className='info-numbers'>{stats?.rejected}</p>
                <p className='info-detail'>Rejected</p>
              </div>
            </div>

          </div>
        </div>

      {/* Monthly Trend Chart */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card 
            title="Candidates Added (Last 6 Months)" 
            className="dashboard-card"
          >
            <div style={{ height: 280 }}>
              {last6MonthsData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart
                    data={last6MonthsData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 25,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 14 }}
                      tickFormatter={(value, index) => {
                        const item = last6MonthsData[index];
                        return `${value} ${item.year}`;
                      }}
                      angle={-15}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      tick={{ fontSize: 14 }}
                      label={{ 
                        value: 'Number of Candidates', 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { fontSize: 14 }
                      }}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} candidates`, 'Total']}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          const item = payload[0].payload;
                          return `${item.month} ${item.year}`;
                        }
                        return label;
                      }}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#1890FF"
                      radius={[4, 4, 0, 0]}
                      name="Candidates"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#999' 
                }}>
                  No monthly data available
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            title="Applications by Source" 
            className="dashboard-card"
          >
            <div style={{ height: 280 }}>
              {sourceChartData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        fill: '#333'
                      }}
                    >
                      {stats.total}
                    </text>
                    <text
                      x="50%"
                      y="58%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{
                        fontSize: '14px',
                        fill: '#666'
                      }}
                    >
                      Total Applications
                    </text>
                    <Pie
                      data={sourceChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={{
                        stroke: "#999",
                        strokeWidth: 1,
                        strokeDasharray: "2 2",
                        offsetRadius: 10
                      }}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {sourceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} applications (${props.payload.percentage}%)`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                        maxWidth: "200px"
                      }}
                    />
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      wrapperStyle={{
                        paddingLeft: "20px",
                        fontSize: "13px",
                        maxHeight: "300px",
                        overflowY: "auto",
                        width: "180px"
                      }}
                      formatter={(value, entry) => (
                        <span style={{ 
                          display: "inline-block", 
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                          lineHeight: "1.2em"
                        }}>
                          {value}: {entry.payload.value} applications
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#999' 
                }}>
                  No source data available
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title="Applications by Department" 
            className="dashboard-card"
          >
            <div style={{ height: 280 }}>
              {departmentChartData.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        fill: '#333'
                      }}
                    >
                      {stats.total}
                    </text>
                    <text
                      x="50%"
                      y="58%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{
                        fontSize: '14px',
                        fill: '#666'
                      }}
                    >
                      Total Applications
                    </text>
                    <Pie
                      data={departmentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      labelLine={{
                        stroke: "#999",
                        strokeWidth: 1,
                        strokeDasharray: "2 2",
                        offsetRadius: 10
                      }}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {departmentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name, props) => [
                        `${value} applications (${props.payload.percentage}%)`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        whiteSpace: "normal",
                        wordWrap: "break-word",
                        maxWidth: "200px"
                      }}
                    />
                    <Legend
                      verticalAlign="middle"
                      align="right"
                      layout="vertical"
                      wrapperStyle={{
                        paddingLeft: "20px",
                        fontSize: "13px",
                        maxHeight: "300px",
                        overflowY: "auto",
                        width: "180px"
                      }}
                      formatter={(value, entry) => (
                        <span style={{ 
                          display: "inline-block", 
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                          lineHeight: "1.2em"
                        }}>
                          {value}: {entry.payload.value} applications
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#999' 
                }}>
                  No department data available
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Open Positions */}
      <div style={{ marginTop: 24 }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 16 
        }}>
          <Title level={5} style={{display:'flex' , alignItems:"center",fontSize:"24px" , fontWeight:"500"}}>Open Positions <Tag style={{height:"20px" ,width:"20px" ,borderRadius:"50%" ,color:"#ff9244" ,background:"#fff1e5" ,display:"flex", justifyContent:"center" ,alignItems:"center" , border:"1px solid transparent", margin:"0px 0px 0px 7px" ,paddingBottom:"0px"}}>{TotalPositions}</Tag></Title>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{height:"40px" , width:"40px" , border:'1px solid #EEF0F1' , borderRadius:"8px", display:'flex' ,justifyContent:"center" , alignItems:'center' , cursor:"pointer" }} onClick={()=>{setViewType('grid')}}>
              <img src={grid}></img>
            </div>
            <div style={{height:"40px" , width:"40px" , border:'1px solid #EEF0F1' , borderRadius:"8px", display:'flex' ,justifyContent:"center" , alignItems:'center' , cursor:"pointer"}} onClick={()=>{setViewType('list')}}>
              <img src={list}></img>
            </div>
            <Link to="/recruitment/jobs">
              <Button type="link" style={{color:"#56616B"}}>View all</Button>
            </Link>
          </div>
        </div>
        {viewType === 'grid' ? (
          <div>
            <Row gutter={[24, 24]}>
              {openPositions.map(position => (
                <Col xs={24} sm={12} md={8} key={position._id}>
                  <Card
                    className="job-card"
                  >
                  <div className="job-card-content">
                    <div style={{display:'flex', justifyContent:'space-between', width:"98%"}}>
                      <div>
                        <h3 className="job-title">
                          <Link to={`/recruitment/jobs/${position._id}`}>{position.title.split(' ').map(word=>word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</Link>
                        </h3>
                        <p className="positions-count">{position.positions} open positions</p>
                      </div>
                      <Dropdown
                        overlay={<Menu>
                          <Menu.Item key="edit" icon={<EditOutlined />}onClick={() => navigate(`/recruitment/jobs/${position._id}/edit`)}>Edit</Menu.Item>
                          <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => {
                            Modal.confirm({
                            title: 'Delete Job',
                            content: 'Are you sure you want to delete this job?',
                            okText: 'Yes, Delete',
                            okType: 'danger',
                            cancelText: 'No',
                            onOk: () => handleDeleteJob(position._id)
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
                        <div className = 'icons'><img src={departmentIcon}></img></div>
                        <div className = 'detail-text'>{position.department}</div>
                      </div>
                      <div className="detail-items">
                        <div className = 'icons'><img src={calander}></img></div>
                        <div className = 'detail-text'>{new Date(position.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="card-foot">
                      <div style={{width:'60%'}}>
                        <div className='post-on'><span>Posted on:</span></div>
                        <div className= 'social-icons'>
                          <img className="social-icon-one" src={indeed}></img>
                          <img className="social-icon-two" src={linkedin}></img>
                          <img className="social-icon-three" src={instagram}></img> 
                          <img className="social-icon-four" src={facebook}></img>
                        </div>
                      </div>
                      <div className="applications-count">
                        <div className= 'applications-count-number'>{position.applicationCount || 0}</div>
                        <div className='applications-count-text'>Applications</div>
                      </div> 
                    </div>
                  </div>
                </Card>
                </Col>
              ))}
            </Row>
          </div>  
        ) : (
          <Table 
          className="table-striped"
          columns={columns}
          dataSource={openPositions}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
            pageSizeOptions: ['10', '20', '50']
          }}
          onChange={handleTableChange}
          />
        )}
      </div>
      <style jsx>{`
        .job-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
          border: 1px solid #e0e3e6;
          height: 100%;
        }
        .job-card .ant-card-body {
          padding: 16px;
        }
        .job-card-content {
          padding: 0;
          min-height: 230px;
        }
        .job-title {
          font-size: 20px;
          font-weight: 500;
          margin-bottom: 4px;
          height: 48px;
          overflow: hidden;
          text-overflow: ellipsis;

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

        .dashboard-cards{
          display: flex;
          gap: 25px;
        }

        .information-card{
          display: flex;
          height: 102px;
          width: 24%;
          justify-content: space-between;
          padding: 0px 15px 0px 15px;
          border-radius: 6px ;
          box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.2);
        }


        .image-direction{
          display: flex; 
          align-items: center;
        }

        .card-image{
          height: 40px;
          width: 40px;
          background: #fff1e5;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .info-direction{
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .info-numbers{
          marginBottom: 0;
          font-size: 24px;
          font-weight: 500;
          text-align: end;
        }

        .info-detail{
          marginBottom: 0;
          font-size: 14px;
          font-weight: 450;
          color: #56616b;
        }

        @media (min-width: 300px) and (max-width: 736px) {
          .dashboard-cards{
            flex-wrap : wrap;
          };

        }
        @media (min-width: 400px) and (max-width: 736px) {
          .information-card{
            width : 45%;
          };
        }

        @media (min-width: 300px) and (max-width: 399px) {
          .information-card{
            width : 98%;
          };
        }
      `}</style>
    </div>
  );
};

export default Dashboard; 