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
} from "recharts";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import { message, Spin } from "antd";
import moment from "moment";

const LeadReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [communicationData, setCommunicationData] = useState([]);
  const [monthlyLeadsData, setMonthlyLeadsData] = useState([]);
  const user_state = useSelector((state) => state.user.loginvalue);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  useEffect(() => {
    fetchLeadsData();
  }, []);

  const fetchLeadsData = () => {
    setIsLoading(true);
    apiServices("GET", "leads", null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const leads = res.data.Lead.docs;

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

          // Convert to format needed for pie chart
          const chartData = Object.entries(mediumCounts).map(
            ([name, value]) => ({
              name,
              value,
            })
          );
          setCommunicationData(chartData);

          // Process monthly leads data
          const monthlyData = {};
          leads.forEach((lead) => {
            const month = moment(lead.createdAt).format("MMM");
            monthlyData[month] = (monthlyData[month] || 0) + 1;
          });

          // Create array of all months
          const allMonths = moment
            .months()
            .map((m) => moment(m, "MMMM").format("MMM"));
          const monthlyChartData = allMonths.map((month) => ({
            name: month,
            value: monthlyData[month] || 0,
          }));

          setMonthlyLeadsData(monthlyChartData);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        message.error(
          err?.response?.data?.msg ||
            err?.response?.data?.validation?.body?.message ||
            "Error fetching leads data"
        );
        setIsLoading(false);
      });
  };

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Lead Reports</h3>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title">Leads by Communication Mediums</h4>
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
                          label={({ name, value, percent }) =>
                            `${name} (${value})`
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
                          formatter={(value, name) => [`${value} leads`, name]}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          formatter={(value, entry) =>
                            `${value} (${entry.payload.value} leads)`
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
                <h4 className="card-title">Monthly Lead Distribution</h4>
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
                      <BarChart data={monthlyLeadsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`${value} leads`, "Count"]}
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                          }}
                        />
                        <Bar dataKey="value" fill="#FF8042" name="Leads" />
                      </BarChart>
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
