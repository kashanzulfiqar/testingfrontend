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
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [stats, setStats] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const user_state = useSelector((state) => state.user.loginvalue);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

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
  }, [selectedYear]);

  const fetchLeadsStats = (year) => {
    setIsLoading(true);
    apiServices("GET", `leads?year=${year}`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const leads = res.data.Lead.docs;

          // Calculate stats for the cards
          const totalLeads = leads.length;
          const ongoingLeads = leads.filter(
            (lead) => lead.status === "OnGoing"
          ).length;
          const onHoldLeads = leads.filter(
            (lead) => lead.status === "OnHold"
          ).length;
          const convertedLeads = leads.filter(
            (lead) => lead.status === "Converted"
          ).length;
          const lostLeads = leads.filter(
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

          // Process communication mediums data
          const mediumCounts = {};
          leads.forEach((lead) => {
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

          setCommunicationData(communicationChartData);

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
          const monthlyChartData = moment.months().map((month) => {
            const monthKey = moment(month, "MMMM").format("MMM");
            const totalMonthLeads = monthlyData[monthKey] || 0;
            const convertedLeads = monthlyConverted[monthKey] || 0;
            const lostLeads = monthlyLost[monthKey] || 0;

            return {
              month: monthKey,
              count: totalMonthLeads,
              converted:
                totalMonthLeads > 0
                  ? (convertedLeads / totalMonthLeads) * 100
                  : 0,
              lost:
                totalMonthLeads > 0
                  ? (lostLeads / totalMonthLeads) * 100
                  : 0,
              convertedCount: convertedLeads,
              lostCount: lostLeads,
            };
          });

          setMonthlyLeadsData(monthlyChartData);
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

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Lead Reports</h3>
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
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4 className="card-title mb-0">
                    Leads by Communication Medium
                  </h4>
                </div>
                {isLoading ? (
                  <div
                    style={{
                      height: "400px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Spin size="large" />
                  </div>
                ) : communicationData.length > 0 ? (
                  <div style={{ width: "100%", height: 400 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={communicationData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percentage }) =>
                            `${name} (${percentage}%)`
                          }
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {communicationData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [
                            `${value} reach-outs (${
                              communicationData.find(
                                (item) => item.name === name
                              )?.percentage
                            }%)`,
                            name,
                          ]}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value, entry) =>
                            `${value} (${entry.payload.value} reach-outs)`
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div
                    style={{
                      height: "400px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
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
                  <h4 className="card-title mb-0">Monthly Lead Distribution</h4>
                </div>
                {isLoading ? (
                  <div
                    style={{
                      height: "400px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Spin size="large" />
                  </div>
                ) : monthlyLeadsData.length > 0 ? (
                  <div style={{ width: "100%", height: 400 }}>
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
                                : props.payload.notConvertedCount;
                            return [
                              `${value.toFixed(1)}% (${count} leads)`,
                              name === "converted"
                                ? "Converted"
                                : "Not Converted",
                            ];
                          }}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                          }}
                        />
                        <Legend
                          verticalAlign="middle"
                          align="right"
                          layout="vertical"
                          wrapperStyle={{
                            paddingLeft: "10px",
                          }}
                          formatter={(value) => {
                            return value === "count"
                              ? "Total Leads"
                              : value === "converted"
                              ? "Converted %"
                              : "Not Converted %";
                          }}
                        />
                        <Bar dataKey="count" fill="#1890ff" name="count" />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="converted"
                          stroke="#52c41a"
                          strokeWidth={2}
                          dot={{ fill: "#52c41a" }}
                          name="Converted"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="notConverted"
                          stroke="#ff4d4f"
                          strokeWidth={2}
                          dot={{ fill: "#ff4d4f" }}
                          name="Lost"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div
                    style={{
                      height: "400px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    No leads data available
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
