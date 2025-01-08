import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Tag, Button, Dropdown, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { 
  MoreOutlined, 
  UserOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';

const { Title, Text } = Typography;

const COLORS = ['#1890FF', '#52C41A', '#FAAD14', '#722ED1', '#F5222D'];

const DashboardCard = ({ title, value, icon, color }) => (
  <Card>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ 
        width: 48, 
        height: 48, 
        borderRadius: 8,
        background: color?.bg || '#e3f2fd',
        color: color?.text || '#1976d2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        marginRight: 16
      }}>
        {icon}
      </div>
      <div>
        <Title level={3} style={{ margin: 0 }}>{value}</Title>
        <Text>{title}</Text>
      </div>
    </div>
  </Card>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
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
  const [openPositions, setOpenPositions] = useState([]);
  const authState = useSelector((state) => state.user.loginvalue);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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
      }

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
      <Row gutter={[16, 16]}>
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
      </Row>

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
          <Title level={5} style={{ margin: 0 }}>Latest Open Positions <Tag>{openPositions.length}</Tag></Title>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/recruitment/jobs">
              <Button type="link">View all</Button>
            </Link>
          </div>
        </div>
        <Row gutter={[16, 16]}>
          {openPositions.map(position => (
            <Col xs={24} sm={12} lg={8} key={position._id}>
              <Card>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: 12 
                }}>
                  <Title level={5} style={{ margin: 0, flex: 1 }}>
                    <Link to={`/recruitment/jobs/${position._id}`}>{position.title}</Link>
                  </Title>
                  <Dropdown 
                    overlay={
                      <Menu>
                        <Menu.Item key="edit">
                          <Link to={`/recruitment/jobs/${position._id}/edit`}>Edit</Link>
                        </Menu.Item>
                      </Menu>
                    }
                    trigger={['click']}
                  >
                    <Button type="text" icon={<MoreOutlined />} />
                  </Dropdown>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    color: '#666',
                    marginBottom: 8 
                  }}>
                    <EnvironmentOutlined />
                    <Text>{position.department}</Text>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 8,
                    color: '#666',
                    marginBottom: 8 
                  }}>
                    <CalendarOutlined />
                    <Text>{new Date(position.createdAt).toLocaleDateString()}</Text>
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <Tag>{position.positions} open positions</Tag>
                  <Text>{position.applicationCount || 0} Applications</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Dashboard; 