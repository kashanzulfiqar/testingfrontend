import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  ComposedChart,
} from "recharts";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import { message, Spin, Select, Card, Row, Col } from "antd";
import moment from "moment";

const LeadReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [communicationData, setCommunicationData] = useState([]);
  const [monthlyLeadsData, setMonthlyLeadsData] = useState([]);
  const [accountManagerData, setAccountManagerData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [projectTypeData, setProjectTypeData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [stats, setStats] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const user_state = useSelector((state) => state.user.loginvalue);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8884d8", "#83a6ed", "#8dd1e1"];

  useEffect(() => {
    // First fetch all leads to get available years
    apiServices("GET", "leads", null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const leads = res.data.Lead.docs;
          // Get unique years from leads
          const years = [
            ...new Set(leads.map((lead) => moment(lead.createdAt).year())),
          ].sort((a, b) => b - a); // Sort in descending order

          setAvailableYears(years);
          // Set selected year to most recent year with data
          if (years.length > 0) {
            setSelectedYear(years[0]);
          }
        }
      })
      .catch((err) => {
        message.error(
          err?.response?.data?.msg ||
            err?.response?.data?.validation?.body?.message ||
            "Error fetching leads data"
        );
      });
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchLeadsStats(selectedYear);
    }
  }, [selectedYear, selectedMonth]);

  const fetchLeadsStats = (year) => {
    setIsLoading(true);
    apiServices("GET", `leads?year=${year}`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const leads = res.data.Lead.docs;
          
          // Filter leads by selected month if any
          const filteredLeads = selectedMonth 
            ? leads.filter(lead => moment(lead.createdAt).format("MMM") === selectedMonth)
            : leads;

          // Calculate stats for the cards using filtered leads
          const totalLeads = filteredLeads.length;
          const ongoingLeads = filteredLeads.filter(
            (lead) => lead.status === "OnGoing"
          ).length;
          const onHoldLeads = filteredLeads.filter(
            (lead) => lead.status === "OnHold"
          ).length;
          const convertedLeads = filteredLeads.filter(
            (lead) => lead.status === "Converted"
          ).length;
          const lostLeads = filteredLeads.filter(
            (lead) => lead.status === "Lost"
          ).length;
          const activeLeads = ongoingLeads + onHoldLeads;

          const stats = {
            totalLeads,
            ongoingLeads,
            onHoldLeads,
            convertedLeads,
            lostLeads,
            activeLeads,
          };
          setStats(stats);

          // Process communication mediums data with filtered leads
          const mediumCounts = {};
          filteredLeads.forEach((lead) => {
            lead.reachOuts?.forEach((reachOut) => {
              const medium = reachOut.communicationMedium?.title;
              if (medium) {
                mediumCounts[medium] = (mediumCounts[medium] || 0) + 1;
              }
            });
          });

          // Calculate total reach outs for percentages
          const totalReachOuts = Object.values(mediumCounts).reduce(
            (a, b) => a + b,
            0
          );

          // Convert to format needed for pie chart
          const communicationChartData = Object.entries(mediumCounts).map(
            ([name, value]) => ({
              name,
              value,
              percentage: ((value / totalReachOuts) * 100).toFixed(1),
            })
          );

          // Process account manager data with filtered leads
          const accountManagerData = {};
          filteredLeads.forEach((lead) => {
            if (lead.accountManager?.fullName) {
              const fullName = lead.accountManager.fullName;
              const firstName = fullName.split(' ')[0];
              accountManagerData[fullName] = {
                count: (accountManagerData[fullName]?.count || 0) + 1,
                firstName
              };
            }
          });

          // Process source data with filtered leads
          const sourceData = {};
          filteredLeads.forEach((lead) => {
            if (lead.source?.title) {
              const sourceTitle = lead.source.title;
              sourceData[sourceTitle] = (sourceData[sourceTitle] || 0) + 1;
            }
          });

          // Process project type data with filtered leads
          const projectTypeData = {};
          filteredLeads.forEach((lead) => {
            if (lead.projectType) {
              const projectTitle = lead.projectType
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
              projectTypeData[projectTitle] = (projectTypeData[projectTitle] || 0) + 1;
            }
          });

          // Convert project type data to array format for pie chart
          const projectTypeChartData = Object.entries(projectTypeData)
            .map(([name, value]) => ({
              name,
              value,
              percentage: ((value / filteredLeads.length) * 100).toFixed(1)
            }))
            .sort((a, b) => b.value - a.value);

          // Convert source data to array format for pie chart
          const sourceChartData = Object.entries(sourceData)
            .map(([name, value]) => ({
              name,
              value,
              percentage: ((value / filteredLeads.length) * 100).toFixed(1)
            }))
            .sort((a, b) => b.value - a.value);

          // Convert account manager data to array format
          const accountManagerChartData = Object.entries(accountManagerData)
            .map(([fullName, data]) => ({
              name: fullName,
              firstName: data.firstName,
              value: data.count,
              percentage: ((data.count / filteredLeads.length) * 100).toFixed(1)
            }))
            .sort((a, b) => b.value - a.value);

          // Process monthly data
          const monthlyData = {};
          const monthlyConverted = {};
          const monthlyLost = {};

          // Initialize all months with 0
          moment.months().forEach((month) => {
            const monthKey = moment(month, "MMMM").format("MMM");
            monthlyData[monthKey] = 0;
            monthlyConverted[monthKey] = 0;
            monthlyLost[monthKey] = 0;
          });

          // Count leads for each month
          leads.forEach((lead) => {
            const month = moment(lead.createdAt).format("MMM");
            monthlyData[month] = (monthlyData[month] || 0) + 1;

            // Track converted and lost leads
            if (lead.status === "Converted") {
              monthlyConverted[month] = (monthlyConverted[month] || 0) + 1;
            } else if (lead.status === "Lost") {
              monthlyLost[month] = (monthlyLost[month] || 0) + 1;
            }
          });

          // Convert to array format for chart
          let monthlyChartData = moment.months().map((month) => {
            const monthKey = moment(month, "MMMM").format("MMM");
            const totalMonthLeads = monthlyData[monthKey] || 0;
            const convertedLeads = monthlyConverted[monthKey] || 0;
            const lostLeads = monthlyLost[monthKey] || 0;

            return {
              month: monthKey,
              count: selectedMonth && monthKey !== selectedMonth ? 0 : totalMonthLeads,
              converted:
                totalMonthLeads > 0 && (!selectedMonth || monthKey === selectedMonth)
                  ? (convertedLeads / totalMonthLeads) * 100
                  : 0,
              lost:
                totalMonthLeads > 0 && (!selectedMonth || monthKey === selectedMonth)
                  ? (lostLeads / totalMonthLeads) * 100
                  : 0,
              convertedCount: selectedMonth && monthKey !== selectedMonth ? 0 : convertedLeads,
              lostCount: selectedMonth && monthKey !== selectedMonth ? 0 : lostLeads,
            };
          });

          setMonthlyLeadsData(monthlyChartData);
          setCommunicationData(communicationChartData);
          setAccountManagerData(accountManagerChartData);
          setSourceData(sourceChartData);
          setProjectTypeData(projectTypeChartData);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        message.error(
          err?.response?.data?.msg ||
            err?.response?.data?.validation?.body?.message ||
            "Error fetching leads statistics"
        );
        setIsLoading(false);
      });
  };

  const StatCard = ({ title, value, color }) => (
    <Card style={{ borderTop: `2px solid ${color}` }}>
      <div style={{ textAlign: "center" }}>
        <h4 style={{ color: color, marginBottom: "8px" }}>{title}</h4>
        <h2 style={{ margin: 0 }}>{value}</h2>
      </div>
    </Card>
  );

  // Update handleMonthClick to trigger data refresh
  const handleMonthClick = (data) => {
    if (selectedMonth === data.month) {
      setSelectedMonth(null); // Remove filter if same month clicked
    } else {
      setSelectedMonth(data.month); // Set filter to clicked month
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <div className="d-flex align-items-center">
                <h3 className="page-title">Lead Reports</h3>
                {selectedMonth && (
                  <div className="alert alert-info mb-0 ml-4 py-1 px-2" style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '25px' }}>
                    Showing data for {selectedMonth} {selectedYear}
                    <button 
                      className="btn btn-link p-0 ml-2" 
                      onClick={() => setSelectedMonth(null)}
                      style={{ fontSize: '14px' }}
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="col-auto">
              <Select
                value={selectedYear}
                onChange={(value) => setSelectedYear(value)}
                style={{ width: 120 }}
                options={availableYears.map((year) => ({
                  value: year,
                  label: year,
                }))}
              />
            </div>
          </div>
        </div>

        {/* Stats Summary Cards */}
        {!isLoading && stats && (
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={24} sm={12} md={6}>
              <StatCard
                title="Total Leads"
                value={stats.totalLeads}
                color="#1890ff"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                title="Active Leads"
                value={stats.activeLeads}
                color="#52c41a"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                title="Converted"
                value={stats.convertedLeads}
                color="#52c41a"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <StatCard
                title="Lost"
                value={stats.lostLeads}
                color="#ff4d4f"
              />
            </Col>
          </Row>
        )}

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="card-title mb-0">Monthly Lead Distribution</h4>
                </div>
                {isLoading ? (
                  <div style={{ height: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Spin size="large" />
                  </div>
                ) : monthlyLeadsData.length > 0 ? (
                  <div style={{ width: "100%", height: 280 }}>
                    <ResponsiveContainer>
                      <ComposedChart data={monthlyLeadsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                          formatter={(value, name, props) => {
                            if (name === "count") {
                              return [`${value} leads`, "Total Leads"];
                            }
                            const count =
                              name === "converted"
                                ? props.payload.convertedCount
                                : props.payload.lostCount;
                            return [
                              `${value.toFixed(1)}% (${count} leads)`,
                              name === "converted"
                                ? "Converted"
                                : "Lost",
                            ];
                          }}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                          }}
                        />
                        <Legend
                          verticalAlign="top"
                          align="center"
                          layout="horizontal"
                          wrapperStyle={{
                            paddingBottom: "20px",
                            fontSize: "14px"
                          }}
                          formatter={(value) => {
                            switch(value) {
                              case "count":
                                return "Total Leads";
                              case "converted":
                                return "Converted Leads %";
                              case "lost":
                                return "Lost Leads %";
                              default:
                                return value;
                            }
                          }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="#1890ff" 
                          name="count"
                          onClick={(data) => handleMonthClick(data)}
                          style={{ cursor: 'pointer' }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="converted"
                          stroke="#52c41a"
                          strokeWidth={2}
                          dot={{ fill: "#52c41a" }}
                          name="converted"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="lost"
                          stroke="#ff4d4f"
                          strokeWidth={2}
                          dot={{ fill: "#ff4d4f" }}
                          name="lost"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ height: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    No leads data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="card-title mb-0">Leads by Communication Medium</h4>
                </div>
                {isLoading ? (
                  <div style={{ height: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Spin size="large" />
                  </div>
                ) : communicationData.length > 0 ? (
                  <div style={{ width: "100%", height: 400 }}>
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
                          {communicationData.reduce((sum, item) => sum + item.value, 0)}
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
                          Total Reach Outs
                        </text>
                        <Pie
                          data={communicationData}
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
                          {communicationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${value} reach outs (${props.payload.percentage}%)`,
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
                          formatter={(value, entry) => {
                            return (
                              <span style={{ 
                                display: "inline-block", 
                                wordWrap: "break-word",
                                whiteSpace: "normal",
                                lineHeight: "1.2em"
                              }}>
                                {value}: {entry.payload.value} reach outs
                              </span>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ height: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    No communication data available
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="card-title mb-0">Leads by Account Manager</h4>
                </div>
                {isLoading ? (
                  <div style={{ height: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Spin size="large" />
                  </div>
                ) : accountManagerData.length > 0 ? (
                  <div style={{ width: "100%", height: 400 }}>
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
                          {accountManagerData.reduce((sum, item) => sum + item.value, 0)}
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
                          Total Leads
                        </text>
                        <Pie
                          data={accountManagerData}
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
                          label={({ firstName, value }) => {
                            return `${firstName}: ${value}`;
                          }}
                        >
                          {accountManagerData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${value} leads (${props.payload.percentage}%)`,
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
                          formatter={(value, entry) => {
                            return (
                              <span style={{ 
                                display: "inline-block", 
                                wordWrap: "break-word",
                                whiteSpace: "normal",
                                lineHeight: "1.2em"
                              }}>
                                {entry.payload.firstName}: {entry.payload.value} leads
                              </span>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ height: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    No account manager data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="card-title mb-0">Leads by Source</h4>
                </div>
                {isLoading ? (
                  <div style={{ height: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Spin size="large" />
                  </div>
                ) : sourceData.length > 0 ? (
                  <div style={{ width: "100%", height: 400 }}>
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
                          {sourceData.reduce((sum, item) => sum + item.value, 0)}
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
                          Total Leads
                        </text>
                        <Pie
                          data={sourceData}
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
                          label={({ name, value }) => {
                            return `${name}: ${value}`;
                          }}
                        >
                          {sourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${value} leads (${props.payload.percentage}%)`,
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
                          formatter={(value, entry) => {
                            return (
                              <span style={{ 
                                display: "inline-block", 
                                wordWrap: "break-word",
                                whiteSpace: "normal",
                                lineHeight: "1.2em"
                              }}>
                                {value}: {entry.payload.value} leads
                              </span>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ height: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    No source data available
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="card-title mb-0">Leads by Project Type</h4>
                </div>
                {isLoading ? (
                  <div style={{ height: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Spin size="large" />
                  </div>
                ) : projectTypeData.length > 0 ? (
                  <div style={{ width: "100%", height: 400 }}>
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
                          {projectTypeData.reduce((sum, item) => sum + item.value, 0)}
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
                          Total Leads
                        </text>
                        <Pie
                          data={projectTypeData}
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
                          label={({ name, value }) => {
                            return `${name}: ${value}`;
                          }}
                        >
                          {projectTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => [
                            `${value} leads (${props.payload.percentage}%)`,
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
                          formatter={(value, entry) => {
                            return (
                              <span style={{ 
                                display: "inline-block", 
                                wordWrap: "break-word",
                                whiteSpace: "normal",
                                lineHeight: "1.2em"
                              }}>
                                {value}: {entry.payload.value} leads
                              </span>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ height: "400px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    No project type data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadReport;
