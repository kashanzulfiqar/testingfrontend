/**
 * Signin Firebase
 */

import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
// import { Link, withRouter } from 'react-router-dom';
import {
  User,
  Avatar_19,
  Avatar_07,
  Avatar_06,
  Avatar_14,
  user_icon,
} from "../../../Entryfile/imagepath.jsx";
import {
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import "../../index.css";
import { useSelector } from "react-redux";
import { Button, Spin, message } from "antd";
import { apiServices } from "../../../Services/apiServices.js";
import { getAllISOCodes } from "iso-country-currency";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const amountFormatter = (value) => {
  // Handle zero separately
  if (value === 0) return "0";

  // Get absolute value for easier comparison
  const absValue = Math.abs(value);
  // Format with B/M/K based on magnitude
  let formattedValue;
  if (absValue >= 1e9) {
    formattedValue = `${(value / 1e9).toFixed(1)}B`;
  } else if (absValue >= 1e6) {
    formattedValue = `${(value / 1e6).toFixed(1)}M`;
  } else if (absValue >= 1e3) {
    formattedValue = `${(value / 1e3).toFixed(1)}K`;
  } else {
    formattedValue = value.toLocaleString();
  }
  return formattedValue;
};

const CustomLegend = () => (
  <div
    style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}
  >
    <div style={{ marginRight: "20px", display: "flex", alignItems: "center" }}>
      <div
        style={{
          width: "10px",
          height: "10px",
          backgroundColor: "#ff9b44",
          marginRight: "5px",
        }}
      ></div>
      <span>Total Revenue</span>
    </div>
    <div style={{ marginRight: "20px", display: "flex", alignItems: "center" }}>
      <div
        style={{
          width: "10px",
          height: "10px",
          backgroundColor: "#cc7a00",
          marginRight: "5px",
        }}
      ></div>
      <span>Growth Trend</span>
    </div>
    <div style={{ display: "flex", alignItems: "center" }}>
      <div
        style={{
          width: "10px",
          height: "10px",
          backgroundColor: "#82ca9d",
          marginRight: "5px",
        }}
      ></div>
      <span>Profit</span>
    </div>
  </div>
);

const getGrowthIndicator = (growthPercentage) => {
  if (growthPercentage > 100) return 3; // Strong Growth
  if (growthPercentage > 20) return 2; // Moderate Growth
  if (growthPercentage > 0) return 1; // Slight Growth
  if (growthPercentage > -20) return -1; // Slight Decline
  if (growthPercentage > -60) return -2; // Moderate Decline
  return -3; // Strong Decline
};

const getGrowthLabel = (indicator) => {
  switch (indicator) {
    case 3:
      return "Strong Growth";
    case 2:
      return "Moderate Growth";
    case 1:
      return "Slight Growth";
    case -1:
      return "Slight Decline";
    case -2:
      return "Moderate Decline";
    case -3:
      return "Strong Decline";
    default:
      return "No Change";
  }
};

const calculateGrowth = (data) => {
  return data.map((item, index, arr) => {
    if (index === 0) return { ...item, growth: 0, growthIndicator: 0 };
    const previousYearRevenue = arr[index - 1].totalRevenue;
    const growth = previousYearRevenue
      ? ((item.totalRevenue - previousYearRevenue) / previousYearRevenue) * 100
      : 0;
    return {
      ...item,
      growth, // Keep original growth for tooltip
      growthIndicator: getGrowthIndicator(growth), // Add normalized indicator
    };
  });
};

const getMonthName = (monthNumber) => {
  const monthNames = {
    1: "Jan",
    2: "Feb",
    3: "Mar",
    4: "Apr",
    5: "May",
    6: "Jun",
    7: "Jul",
    8: "Aug",
    9: "Sep",
    10: "Oct",
    11: "Nov",
    12: "Dec",
  };
  return monthNames[monthNumber] || "";
};

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const user_state = useSelector((state) => state.user.loginvalue);
  const role1 = user_state?.user?.role;
  const admin_name = user_state?.user?.fullName;

  const [menu, setMenu] = useState(false);
  const [allDomain, setAllDomain] = useState([]);
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [loader, setLoader] = useState(true);
  const [delLoader, setDelLoader] = useState(false);
  const [allData, setAllData] = useState({});
  const [tableYearData, setTableYearData] = useState([]);
  const [tableMonthData, setTableMonthData] = useState([]);
  const [year, setYear] = useState("");
  const [allInvoices, setAllInvoices] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [tableLoader, setTableLoader] = useState({
    invoice: true,
    payment: true,
    client: true,
    project: true,
    request: true,
  });
  const [perm, setPerm] = useState({
    invoice: false,
    payment: false,
    client: false,
    project: false,
    request: false,
  });
  const [open, setOpen] = useState({
    isAddOpen: false,
    data: "",
  });
  const [open2, setOpen2] = useState({
    editOpen: false,
    delOpen: false,
    data: "",
  });
  const [allCountries, setAllCountries] = useState([]);
  const [paginationDetail, setPaginationDetail] = useState();
  const [graphLoader, setGraphLoader] = useState(true);
  const [graphData, setGraphData] = useState([]);
  const [allGraphsData, setAllGraphsData] = useState([]);

  const getDahsboardData = () => {
    setLoader(true);
    return apiServices("GET", "user/admin-dashboard", null, user_state)
      .then((res) => {
        setAllData(res?.data);
        const d = res?.data?.revenue;

        // Get latest year data for other purposes
        const latestYearData = d?.reduce(
          (max, obj) => (obj?.year > max?.year ? obj : max),
          d[0]
        );

        const recentYear = Math.max(...d?.map((item) => item?.year));
        const sortedYears = d
          ?.filter((item) => item?.year >= recentYear - 9)
          ?.sort((a, b) => a?.year - b?.year);
        const yearsToInclude = Array.from(
          { length: 10 },
          (_, index) => recentYear - 9 + index
        );
        yearsToInclude?.forEach((year) => {
          if (!sortedYears?.some((item) => item?.year === year)) {
            sortedYears?.push({ year });
          }
        });
        const sortedYears1 = sortedYears
          ?.filter((item) => item?.year >= recentYear - 9)
          ?.sort((a, b) => a?.year - b?.year);
        setTableYearData(sortedYears1);
        setLoader(false);

        // Return success to indicate dashboard data is loaded
        return true;
      })
      .catch((err) => {
        setLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("aDash.errors.getDashboardDataError")
          }!`
        );
        // Return false to indicate dashboard data failed to load
        return false;
      });
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      if (role1 === "admin" || permissions?.companyManagement) {
        try {
          // Wait for dashboard data to load successfully before loading graph data
          const dashboardSuccess = await getDahsboardData();
          if (dashboardSuccess) {
            await getAllGraphData();
          }

          if (role1 === "admin" || permissions?.managePayrolls) {
            getAllInvoices();
            getAllPayments();
            setPerm((prev) => ({ ...prev, invoice: true, payment: true }));
          } else {
            setPerm((prev) => ({ ...prev, invoice: false, payment: false }));
            setTableLoader((prev) => ({
              ...prev,
              invoice: false,
              payment: false,
            }));
          }

          if (role1 === "admin" || permissions?.clientManagement) {
            getAllClients();
            setPerm((prev) => ({ ...prev, client: true }));
          } else {
            setPerm((prev) => ({ ...prev, client: false }));
            setTableLoader((prev) => ({ ...prev, client: false }));
          }

          if (role1 === "admin" || permissions?.projectManagement) {
            getAllProjects();
            setPerm((prev) => ({ ...prev, project: true }));
          } else {
            setPerm((prev) => ({ ...prev, project: false }));
            setTableLoader((prev) => ({ ...prev, project: false }));
          }

          if (role1 === "admin" || permissions?.viewAllRequest) {
            getAllRequests();
            setPerm((prev) => ({ ...prev, request: true }));
          } else {
            setPerm((prev) => ({ ...prev, request: false }));
            setTableLoader((prev) => ({ ...prev, request: false }));
          }
        } catch (error) {
          console.error("Error initializing dashboard:", error);
        }
      } else {
        nav(
          `${
            role1 === "client"
              ? "/client/client-profile"
              : role1 === "focalperson"
              ? `/client/focal-profile`
              : role1 === "admin"
              ? `/main/dashboard`
              : `/employee/dashboard`
          }`
        );
      }
    };

    initializeDashboard();
  }, []);

  const getAllInvoices = () => {
    apiServices("GET", `invoices?page=${1}&limit=${3}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setAllInvoices(res?.data?.Invoices?.docs);
          setTableLoader((prev) => {
            return { ...prev, invoice: false };
          });
        }
      })
      .catch((err) => {
        setTableLoader((prev) => {
          return { ...prev, invoice: false };
        });
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("aDash.errors.getAllInvoicesError")
          }!`
        );
      });
  };

  const getAllPayments = () => {
    apiServices(
      "GET",
      `invoices?status=${"Paid"}&page=${1}&limit=${3}`,
      null,
      user_state
    )
      .then((res) => {
        if (res?.data?.success === true) {
          setAllPayments(res?.data?.Invoices?.docs);
          setTableLoader((prev) => {
            return { ...prev, payment: false };
          });
        }
      })
      .catch((err) => {
        setTableLoader((prev) => {
          return { ...prev, payment: false };
        });
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("aDash.errors.getAllPaymentsError")
          }!`
        );
      });
  };

  const getAllClients = () => {
    setTableLoader((prev) => {
      return { ...prev, client: true };
    });
    apiServices(
      "GET",
      `client/view-client?deleted=false&page=${1}&limit=${5}`,
      null,
      user_state
    )
      .then((res) => {
        if (res?.data?.success === true) {
          setAllClients(res?.data?.clients?.docs);
          setTableLoader((prev) => {
            return { ...prev, client: false };
          });
        }
      })
      .catch((err) => {
        setTableLoader((prev) => {
          return { ...prev, client: false };
        });
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("aDash.errors.getAllClientsError")
          }!`
        );
      });
  };

  const getAllProjects = () => {
    setTableLoader((prev) => {
      return { ...prev, project: true };
    });
    apiServices(
      "GET",
      `project-management?page=${1}&limit=${5}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          setAllProjects(res?.data?.projects?.docs);
          setTableLoader((prev) => {
            return { ...prev, project: false };
          });
        }
      })
      .catch((err) => {
        setTableLoader((prev) => {
          return { ...prev, project: false };
        });
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("aDash.errors.getProjectError")
          }`
        );
      });
  };

  const getAllRequests = async () => {
    setTableLoader((prev) => {
      return { ...prev, request: true };
    });
    apiServices(
      "GET",
      `requests/view-all-request?page=${1}&limit=${2}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          setAllRequests(res?.data?.Requests?.docs);
          setTableLoader((prev) => {
            return { ...prev, request: false };
          });
        }
      })
      .catch((err) => {
        setTableLoader((prev) => {
          return { ...prev, request: false };
        });
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("aDash.errors.getAllRequestsError")
          }!`
        );
      });
  };

  const getAllGraphData = async () => {
    setGraphLoader(true);
    try {
      const res = await apiServices(
        "GET",
        "profit-loss/graph?rolling_months=6",
        null,
        user_state
      );

      if (res?.data?.success === true) {
        // Step 1: Flatten all year/month combos into a single array
        const allMonths = [];

        res.data.profitLoss.forEach((yearData) => {
          yearData.months.forEach((m) => {
            allMonths.push({
              ...m,
              month: getMonthName(parseInt(m.month)), // Convert month number to name
              year: yearData.year,
              totalRevenue: m.totalRevenue || 0,
            });
          });
        });

        // Step 2: Sort ascending by year, then ascending by month
        const monthToNumber = {
          Jan: 1,
          Feb: 2,
          Mar: 3,
          Apr: 4,
          May: 5,
          Jun: 6,
          Jul: 7,
          Aug: 8,
          Sep: 9,
          Oct: 10,
          Nov: 11,
          Dec: 12,
        };

        const sortedAsc = allMonths.sort((a, b) => {
          if (a.year !== b.year) {
            return a.year - b.year; // older year first
          }
          return monthToNumber[a.month] - monthToNumber[b.month]; // older month first
        });

        // Step 3: Extract ONLY the last 6 from that sorted array
        const last6Months = sortedAsc.slice(-6).map((item) => ({
          ...item,
          monthYear: `${item.month} ${item.year}`,
        }));

        // Step 4: Update state so the BarChart sees the months from earliest to latest
        setTableMonthData(last6Months);

        // Keep these for reference if you use monthHandler, etc.
        const rollingData = { year: "Last 6 Months", months: last6Months };
        setGraphData(rollingData);
        setYear("Last 6 Months");
        setAllGraphsData(res?.data?.profitLoss);
      }
    } catch (err) {
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : t("finance.Profit&loss.getProfitLossGraphDataError")
        }!`
      );
    } finally {
      setGraphLoader(false);
    }
  };

  const monthHandler = (data) => {
    if (!data?.months || !Array.isArray(data.months)) return;

    // Get current date
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-based month

    // Generate last 6 months structure
    const monthsStructure = [];
    for (let i = 5; i >= 0; i--) {
      let targetMonth = currentMonth - i;
      let targetYear = currentYear;

      while (targetMonth <= 0) {
        targetMonth = 12 + targetMonth;
        targetYear--;
      }

      const monthNames = {
        1: "Jan",
        2: "Feb",
        3: "Mar",
        4: "Apr",
        5: "May",
        6: "Jun",
        7: "Jul",
        8: "Aug",
        9: "Sep",
        10: "Oct",
        11: "Nov",
        12: "Dec",
      };

      // Find matching data from API response
      const monthData = data.months.find(
        (m) => m.month === monthNames[targetMonth] && m.year === targetYear
      );

      monthsStructure.push({
        month: monthNames[targetMonth],
        year: targetYear,
        totalRevenue: monthData?.totalRevenue || 0,
      });
    }

    setTableMonthData(monthsStructure);
    setYear("Last 6 Months");
  };

  const formatDate = (inputDate) => {
    if (inputDate) {
      const date = new Date(inputDate);
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    }
  };

  const getAllCountries = () => {
    const isoCodes = getAllISOCodes();
    const sorted_data = isoCodes.sort((a, b) =>
      a.countryName.localeCompare(b.countryName)
    );
    setAllCountries(sorted_data);
  };

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
        color: "#fff",
      }}
      spin
    />
  );

  const filteredYearData = tableYearData.filter(
    (item) => item.totalRevenue > 0
  );

  const enrichedData = calculateGrowth(filteredYearData);

  return (
    <>
      <div className={`main-wrapper ${menu ? "slide-nav" : ""}`}>
        <div className="page-wrapper">
          <Helmet>
            <title>{t("aDash.pageTitle")}</title>
            <meta name="description" content="Dashboard" />
          </Helmet>
          {/* Page Content */}
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <h3 className="page-title">
                    {t("aDash.welcome", { name: admin_name })}
                  </h3>
                </div>
              </div>
            </div>
            {/* /Page Header */}

            {/* TOP ROW OF 4 CARDS: Active Projects, Clients, Tasks, Employees (unchanged) */}
            {loader ? (
              <div className="row" style={{ marginInline: "0px" }}>
                <div
                  className="card dash-widget"
                  style={{ background: "#ededed", boxShadow: "none" }}
                >
                  <div
                    className="card-body"
                    style={{
                      height: "100px",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Spin />
                  </div>
                </div>
              </div>
            ) : (
              <div className="row">
                <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                  <div className="card dash-widget">
                    <div className="card-body">
                      <span className="dash-widget-icon">
                        <i className="fa fa-cubes" />
                      </span>
                      <div className="dash-widget-info">
                        <h3>{allData?.statistics?.onGoingProject}</h3>
                        <label>Active Projects</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                  <div className="card dash-widget">
                    <div className="card-body">
                      <span className="dash-widget-icon">
                        <i className="fa fa-usd" />
                      </span>
                      <div className="dash-widget-info">
                        <h3>{allData?.clientsCount}</h3>
                        <label>{t("aDash.clients")}</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                  <div className="card dash-widget">
                    <div className="card-body">
                      <span className="dash-widget-icon">
                        <i className="fa fa-bullseye" />
                      </span>
                      <div className="dash-widget-info">
                        <h3>{allData?.activeLeadsCount}</h3>
                        <label>{t("aDash.leads")}</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                  <div className="card dash-widget">
                    <div className="card-body">
                      <span className="dash-widget-icon">
                        <i className="fa fa-user" />
                      </span>
                      <div className="dash-widget-info">
                        <h3>{allData?.employeeCount}</h3>
                        <label>{t("aDash.employees")}</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* /TOP ROW OF 4 CARDS */}

            {/* ROW of TWO CHARTS: Total Revenue + Sales Overview */}
            <div className="row">
              <div className="col-md-6 text-center">
                <div className="card" dir="ltr" style={{ height: "400px" }}>
                  <div className="card-body">
                    <h3 className="card-title">{t("aDash.totalRevenue")}</h3>
                    {loader ? (
                      <div style={{ minHeight: "340px" }}>
                        <Spin
                          style={{
                            height: "300px",
                            display: "grid",
                            placeItems: "center",
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <div style={{ height: "270px" }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                              data={enrichedData}
                              margin={{
                                top: 20,
                                right: 50,
                                left: 30,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year" />
                              <YAxis
                                yAxisId="left"
                                tickFormatter={amountFormatter}
                                width={80}
                              />
                              <YAxis
                                yAxisId="right"
                                orientation="right"
                                tickFormatter={(value) => `${value}%`}
                                width={60}
                              />
                              <Tooltip
                                labelFormatter={(value) =>
                                  `${t("empProfile.year")} : ${value}`
                                }
                                formatter={(value, name) => {
                                  if (name === "Growth %") {
                                    return [`${value.toFixed(1)}%`, name];
                                  }
                                  return [amountFormatter(value), name];
                                }}
                                contentStyle={{ direction: i18n.dir() }}
                              />
                              <Bar
                                yAxisId="left"
                                dataKey="totalRevenue"
                                name="Total Revenue"
                                fill="#ff9b44"
                                barSize={40}
                              />
                              <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="growth"
                                name="Growth %"
                                stroke="#cc7a00"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 7 }}
                              />
                              <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="profit"
                                name="Profit"
                                stroke="#82ca9d"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                                activeDot={{ r: 7 }}
                              />
                              <ReferenceLine
                                yAxisId="right"
                                y={0}
                                stroke="#666"
                                strokeDasharray="3 3"
                              />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginTop: "10px",
                            paddingBottom: "10px",
                          }}
                        >
                          <div
                            style={{
                              marginRight: "20px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                backgroundColor: "#ff9b44",
                                marginRight: "5px",
                              }}
                            ></div>
                            <span>Total Revenue</span>
                          </div>
                          <div
                            style={{
                              marginRight: "20px",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                backgroundColor: "#cc7a00",
                                marginRight: "5px",
                              }}
                            ></div>
                            <span>Growth %</span>
                          </div>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                backgroundColor: "#82ca9d",
                                marginRight: "5px",
                              }}
                            ></div>
                            <span>Profit</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="card" dir="ltr" style={{ height: "400px" }}>
                  <div className="card-body">
                    <h3 className="card-title">Last 6 Months Revenue</h3>
                    {graphLoader ? (
                      <div style={{ minHeight: "340px" }}>
                        <Spin
                          style={{
                            height: "300px",
                            display: "grid",
                            placeItems: "center",
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ height: "340px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={tableMonthData}
                            margin={{
                              top: 20,
                              right: 30,
                              left: 30,
                              bottom: 20,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="monthYear" type="category" />
                            <YAxis tickFormatter={amountFormatter} width={80} />
                            <Tooltip
                              formatter={(value) => [
                                `${amountFormatter(value)}`,
                                "Revenue",
                              ]}
                              labelFormatter={(label) => label}
                              contentStyle={{ direction: i18n.dir() }}
                            />
                            <Bar
                              dataKey="totalRevenue"
                              fill="#ff9b44"
                              name="Revenue"
                              barSize={40}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* /ROW of TWO CHARTS */}

            {/* ===== HERE is the row with NEW EMPLOYEES, EARNINGS, EXPENSES, PROFIT. 
                We only change these columns from col-md-6 to col-xl-3 col-lg-3 col-md-6 col-sm-12 to line them in 1 row. ===== */}
            <div className="row">
              <div className="col-md-12">
                <div className="row">
                  {/* NEW EMPLOYEES */}
                  <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
                    <div
                      className="card"
                      dir="ltr"
                      style={{ minWidth: "250px", height: "180px" }}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-3">
                          <div>
                            <span
                              className="d-block"
                              style={{ fontWeight: "600" }}
                            >
                              {t("aDash.newEmployees")}
                            </span>
                          </div>
                          <div>
                            <span
                              className={
                                allData?.employeeIncreaseRate < 0
                                  ? "text-danger"
                                  : "text-success"
                              }
                              style={{ unicodeBidi: "plaintext" }}
                            >
                              {allData?.employeeIncreaseRate !== undefined &&
                                allData?.employeeIncreaseRate !== null &&
                                (allData?.employeeIncreaseRate > 0 ? "+" : "")}
                              {allData?.employeeIncreaseRate}%
                            </span>
                          </div>
                        </div>
                        <h3 className="mb-3">{allData?.employeesAdded}</h3>
                        <div
                          className="progress mb-2"
                          style={{ height: "5px" }}
                        >
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{
                              width: `${allData?.employeeIncreaseRate}%`,
                            }}
                            aria-valuenow={allData?.employeeIncreaseRate}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        <p className="mb-0 text-start">
                          <label
                            style={{
                              unicodeBidi: "plaintext",
                              color: "#1f1f1f",
                            }}
                          >
                            Overall Employees {allData?.employeeCount}
                          </label>
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* EARNINGS */}
                  <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
                    <div
                      className="card"
                      dir="ltr"
                      style={{ minWidth: "250px", height: "180px" }}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-3">
                          <div>
                            <span
                              className="d-block"
                              style={{ fontWeight: "600" }}
                            >
                              {t("aDash.earnings")}
                            </span>
                          </div>
                          <div>
                            <span
                              className={
                                allData?.earningPercentComparison < 0
                                  ? "text-danger"
                                  : "text-success"
                              }
                              style={{ unicodeBidi: "plaintext" }}
                            >
                              {allData?.earningPercentComparison !==
                                undefined &&
                                allData?.earningPercentComparison !== null &&
                                (allData?.earningPercentComparison > 0
                                  ? "+"
                                  : "")}
                              {allData?.earningPercentComparison}%
                            </span>
                          </div>
                        </div>
                        <h3 className="mb-3">
                          {allData?.currentMonthEarning
                            ?.toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                          {allData?.preferredCurrency}
                        </h3>
                        <div
                          className="progress mb-2"
                          style={{ height: "5px" }}
                        >
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{
                              width: `${allData?.earningPercentComparison}%`,
                            }}
                            aria-valuenow={allData?.earningPercentComparison}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        <p className="mb-0 text-start">
                          <label>{t("aDash.previousMonth")}</label>{" "}
                          <label
                            className="text-muted"
                            style={{ unicodeBidi: "plaintext" }}
                          >
                            {allData?.previousMonthEarning
                              ?.toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                            {allData?.preferredCurrency}
                          </label>
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* EXPENSES */}
                  <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
                    <div
                      className="card"
                      dir="ltr"
                      style={{ minWidth: "250px", height: "180px" }}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-3">
                          <div>
                            <span
                              className="d-block"
                              style={{ fontWeight: "600" }}
                            >
                              {t("aDash.expenses")}
                            </span>
                          </div>
                          <div>
                            <span
                              className={
                                allData?.expensePercentComparison < 0
                                  ? "text-success"
                                  : "text-danger"
                              }
                              style={{ unicodeBidi: "plaintext" }}
                            >
                              {allData?.expensePercentComparison !==
                                undefined &&
                                allData?.expensePercentComparison !== null &&
                                (allData?.expensePercentComparison > 0
                                  ? "+"
                                  : "")}
                              {allData?.expensePercentComparison}%
                            </span>
                          </div>
                        </div>
                        <h3 className="mb-3">
                          {allData?.currentMonthExpense
                            ?.toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                          {allData?.preferredCurrency}
                        </h3>
                        <div
                          className="progress mb-2"
                          style={{ height: "5px" }}
                        >
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{
                              width: `${allData?.expensePercentComparison}%`,
                            }}
                            aria-valuenow={allData?.expensePercentComparison}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        <p className="mb-0 text-start">
                          <label>{t("aDash.previousMonth")}</label>{" "}
                          <label
                            className="text-muted"
                            style={{ unicodeBidi: "plaintext" }}
                          >
                            {allData?.previousMonthExpense
                              ?.toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                            {allData?.preferredCurrency}
                          </label>
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* PROFIT */}
                  <div className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
                    <div
                      className="card"
                      dir="ltr"
                      style={{ minWidth: "250px", height: "180px" }}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-3">
                          <div>
                            <span
                              className="d-block"
                              style={{ fontWeight: "600" }}
                            >
                              {t("aDash.profit")}
                            </span>
                          </div>
                          <div>
                            <span
                              className={
                                allData?.profitLossPercentComparison < 0
                                  ? "text-danger"
                                  : "text-success"
                              }
                              style={{ unicodeBidi: "plaintext" }}
                            >
                              {allData?.profitLossPercentComparison !==
                                undefined &&
                                allData?.profitLossPercentComparison !== null &&
                                (allData?.profitLossPercentComparison > 0
                                  ? "+"
                                  : "")}
                              {allData?.profitLossPercentComparison}%
                            </span>
                          </div>
                        </div>
                        <h3 className="mb-3">
                          {allData?.currentMonthProfitLoss
                            ?.toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                          {allData?.preferredCurrency}
                        </h3>
                        <div
                          className="progress mb-2"
                          style={{ height: "5px" }}
                        >
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{
                              width: `${allData?.profitLossPercentComparison}%`,
                            }}
                            aria-valuenow={allData?.profitLossPercentComparison}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                        <p className="mb-0 text-start">
                          <label>{t("aDash.previousMonth")}</label>{" "}
                          <label
                            className="text-muted"
                            style={{ unicodeBidi: "plaintext" }}
                          >
                            {allData?.previousMonthProfitLoss
                              ?.toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                            {allData?.preferredCurrency}
                          </label>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /SECOND ROW of 4 STAT CARDS (now in one row) */}

            {/* The rest of the code (Statistics Widget, etc.) stays exactly as before */}
            <div className="row">
              <div className="col-md-12 col-lg-12 col-xl-4 d-flex">
                <div className="card flex-fill dash-statistics">
                  <div className="card-body">
                    <h5 className="card-title">{t("aDash.statistics")}</h5>
                    <div className="stats-list">
                      <div className="stats-info">
                        <p>
                          <label>{t("aDash.todayLeave")}</label>{" "}
                          <strong style={{ unicodeBidi: "plaintext" }}>
                            {allData?.statistics?.todayLeaves}{" "}
                            <small>/ {allData?.employeeCount}</small>
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{
                              width: `${
                                (allData?.statistics?.todayLeaves /
                                  allData?.employeeCount) *
                                100
                              }%`,
                            }}
                            aria-valuenow={
                              (allData?.statistics?.todayLeaves /
                                allData?.employeeCount) *
                              100
                            }
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>
                          <label>{t("aDash.pendingInvoice")}</label>{" "}
                          <strong style={{ unicodeBidi: "plaintext" }}>
                            {allData?.statistics?.pendingInvoices}{" "}
                            <small>
                              / {allData?.statistics?.totalInvoices}
                            </small>
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-warning"
                            role="progressbar"
                            style={{
                              width: `${
                                (allData?.statistics?.pendingInvoices /
                                  allData?.statistics?.totalInvoices) *
                                100
                              }%`,
                            }}
                            aria-valuenow={31}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>
                          <label>{t("aDash.completedProjects")}</label>{" "}
                          <strong style={{ unicodeBidi: "plaintext" }}>
                            {allData?.statistics?.completedProject}{" "}
                            <small>/ {allData?.projectsCount}</small>
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{
                              width: `${
                                (allData?.statistics?.completedProject /
                                  allData?.projectsCount) *
                                100
                              }%`,
                            }}
                            aria-valuenow={
                              (allData?.statistics?.completedProject /
                                allData?.projectsCount) *
                              100
                            }
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>
                          <label>Archived / Paused Projects</label>{" "}
                          <strong style={{ unicodeBidi: "plaintext" }}>
                            {allData?.statistics
                              ? allData?.statistics?.pausedProject +
                                allData?.statistics?.archivedProject
                              : ""}{" "}
                            <small>/ {allData?.projectsCount}</small>
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-danger"
                            role="progressbar"
                            style={{
                              width: `${
                                ((allData?.statistics?.pausedProject +
                                  allData?.statistics?.archivedProject) /
                                  allData?.projectsCount) *
                                100
                              }%`,
                            }}
                            aria-valuenow={
                              ((allData?.statistics?.pausedProject +
                                allData?.statistics?.archivedProject) /
                                allData?.projectsCount) *
                              100
                            }
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>
                          <label>Scheduled Projects</label>{" "}
                          <strong style={{ unicodeBidi: "plaintext" }}>
                            {allData?.statistics?.scheduledProject}{" "}
                            <small>/ {allData?.projectsCount}</small>
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-info"
                            role="progressbar"
                            style={{
                              width: `${
                                (allData?.statistics?.scheduledProject /
                                  allData?.projectsCount) *
                                100
                              }%`,
                            }}
                            aria-valuenow={
                              (allData?.statistics?.scheduledProject /
                                allData?.projectsCount) *
                              100
                            }
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Task Statistics */}
              <div className="col-md-12 col-lg-6 col-xl-4 d-flex">
                <div className="card flex-fill">
                  <div className="card-body">
                    <h4 className="card-title">{t("aDash.taskStatistics")}</h4>
                    <div className="statistics">
                      <div className="row">
                        <div className="col-md-6 col-6 text-center">
                          <div className="stats-box mb-4">
                            <p>
                              <label>{t("totalTasks")}</label>
                            </p>
                            <h3>{allData?.tasksCount}</h3>
                          </div>
                        </div>
                        <div className="col-md-6 col-6 text-center">
                          <div className="stats-box mb-4">
                            <p>Pending</p>
                            <h3>{allData?.statistics?.pendingTasks}</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                    {loader ? (
                      <Spin
                        style={{
                          height: "300px",
                          display: "grid",
                          placeItems: "center",
                        }}
                      />
                    ) : (
                      <>
                        <div className="progress mb-4">
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{
                              width: `${allData?.statistics?.percentCompletedTasks}%`,
                            }}
                            aria-valuenow={
                              allData?.statistics?.percentCompletedTasks
                            }
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            {allData?.statistics?.percentCompletedTasks}%
                          </div>
                          <div
                            className="progress-bar bg-warning"
                            role="progressbar"
                            style={{
                              width: `${allData?.statistics?.percentInProgressTasks}%`,
                            }}
                            aria-valuenow={
                              allData?.statistics?.percentInProgressTasks
                            }
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            {allData?.statistics?.percentInProgressTasks}%
                          </div>
                          <div
                            className="progress-bar bg-purple"
                            role="progressbar"
                            style={{
                              width: `${allData?.statistics?.percentToDoTasks}%`,
                            }}
                            aria-valuenow={
                              allData?.statistics?.percentToDoTasks
                            }
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            {allData?.statistics?.percentToDoTasks}%
                          </div>
                          <div
                            className="progress-bar bg-danger"
                            role="progressbar"
                            style={{
                              width: `${allData?.statistics?.percentBacklogTasks}%`,
                            }}
                            aria-valuenow={
                              allData?.statistics?.percentBacklogTasks
                            }
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            {allData?.statistics?.percentBacklogTasks}%
                          </div>
                        </div>
                        <div>
                          <p>
                            <i
                              className={`fa fa-dot-circle-o text-success ${
                                i18n.dir() === "rtl" ? "ms-2" : "me-2"
                              }`}
                            />
                            {t("aDash.completedTasks")}{" "}
                            <span
                              className={`${
                                i18n.dir() === "rtl"
                                  ? "float-start"
                                  : "float-end"
                              }`}
                            >
                              {allData?.statistics?.completedTasks}
                            </span>
                          </p>
                          <p>
                            <i
                              className={`fa fa-dot-circle-o text-warning ${
                                i18n.dir() === "rtl" ? "ms-2" : "me-2"
                              }`}
                            />
                            {t("aDash.inprogressTasks")}{" "}
                            <span
                              className={`${
                                i18n.dir() === "rtl"
                                  ? "float-start"
                                  : "float-end"
                              }`}
                            >
                              {allData?.statistics?.inProgressTasks}
                            </span>
                          </p>
                          <p>
                            <i
                              className={`fa fa-dot-circle-o text-purple ${
                                i18n.dir() === "rtl" ? "ms-2" : "me-2"
                              }`}
                            />
                            Todo
                            <span
                              className={`${
                                i18n.dir() === "rtl"
                                  ? "float-start"
                                  : "float-end"
                              }`}
                            >
                              {allData?.statistics?.toDoTasks}
                            </span>
                          </p>
                          <p>
                            <i
                              className={`fa fa-dot-circle-o text-danger ${
                                i18n.dir() === "rtl" ? "ms-2" : "me-2"
                              }`}
                            />
                            Backlog
                            <span
                              className={`${
                                i18n.dir() === "rtl"
                                  ? "float-start"
                                  : "float-end"
                              }`}
                            >
                              {allData?.statistics?.backlogTasks}
                            </span>
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Requests */}
              <div className="col-md-12 col-lg-6 col-xl-4 d-flex">
                <div className="card flex-fill">
                  <div className="card-body">
                    <h4 className="card-title">Recent Requests</h4>
                    {tableLoader?.request ? (
                      <Spin
                        style={{
                          display: "grid",
                          placeItems: "center",
                          height: "263px",
                        }}
                      />
                    ) : !perm?.request ? (
                      <label
                        style={{
                          display: "grid",
                          placeItems: "center",
                          color: "grey",
                          height: "285px",
                          textAlign: "center",
                        }}
                      >
                        {t("aDash.noPermissionToView")} <br />
                        {t("aDash.requests")}
                      </label>
                    ) : allRequests?.length > 0 ? (
                      allRequests?.map((req) => (
                        <div className="leave-info-box" key={req?._id}>
                          <div className="media d-flex align-items-center">
                            <img
                              className="avatar"
                              alt=""
                              src={req?.user?.imageUrl || user_icon}
                            />
                            <div className="media-body">
                              <div className="text-sm my-0">
                                {req?.user?.fullName}
                              </div>
                            </div>
                          </div>
                          <div className="row align-items-center mt-3">
                            <div className="col-6 d-grid">
                              <label
                                className="mb-0"
                                style={{ fontWeight: "500", fontSize: "12px" }}
                              >
                                {formatDate(req?.startDate || "")}
                              </label>
                              <label className="text-sm text-muted mt-1">
                                {t("aDash.leaveDate")}
                              </label>
                            </div>
                            <div
                              className={`col-6 ${
                                i18n.dir() === "rtl" ? "text-start" : "text-end"
                              }`}
                            >
                              <span
                                className={
                                  req?.status === "Approved"
                                    ? "badge bg-inverse-success"
                                    : req?.status === "Pending"
                                    ? "badge bg-inverse-warning"
                                    : req?.status === "Declined" ||
                                      req?.status === "Cancelled"
                                    ? "badge bg-inverse-danger"
                                    : ""
                                }
                              >
                                {req?.status === "Approved"
                                  ? t("aRequests.Approved")
                                  : req?.status === "Declined"
                                  ? t("aRequests.Declined")
                                  : req?.status === "Pending"
                                  ? t("aDash.pending")
                                  : req?.status === "Cancelled"
                                  ? t("aDash.cancelled")
                                  : req?.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <label
                        style={{
                          display: "grid",
                          placeItems: "center",
                          color: "grey",
                          height: "290px",
                        }}
                      >
                        {t("aRequests.errors.noRecordFound")}
                      </label>
                    )}
                    {allRequests?.length > 0 && perm?.request && (
                      <div className="load-more text-center">
                        <Link
                          to="/employee/request-admin"
                          className="text-dark"
                        >
                          {t("aDash.seeMore")}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* /Statistics Widget */}

            <div className="row">
              <div className="col-md-6 d-flex">
                <div className="card card-table flex-fill">
                  <div className="card-header">
                    <h3 className="card-title mb-0">{t("aDash.invoices")}</h3>
                  </div>
                  <div className="card-body">
                    <div
                      className="table-responsive"
                      style={{ minHeight: "203px" }}
                    >
                      {tableLoader?.invoice ? (
                        <Spin
                          style={{
                            display: "grid",
                            placeItems: "center",
                            height: "203px",
                          }}
                        />
                      ) : !perm?.invoice ? (
                        <label
                          style={{
                            display: "grid",
                            placeItems: "center",
                            color: "grey",
                            height: "241px",
                          }}
                        >
                          {t("aDash.noPermissionToViewInvoices")}
                        </label>
                      ) : allInvoices?.length > 0 ? (
                        <table className="table table-nowrap custom-table mb-0">
                          <thead>
                            <tr>
                              <th>{t("aDash.invoiceNumber")}</th>
                              <th>{t("aDash.client")}</th>
                              <th>{t("aDash.dueDate")}</th>
                              <th>{t("aDash.total")}</th>
                              <th>{t("status")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allInvoices?.map((invoice) => (
                              <tr key={invoice?._id}>
                                <td>
                                  <Link
                                    to="/invoices/view-invoice"
                                    state={{ invoice_data: invoice }}
                                  >
                                    {invoice?.invoiceNo}
                                  </Link>
                                </td>
                                <td>
                                  <h2>
                                    <a href="#!">
                                      {invoice?.client?.clientName}
                                    </a>
                                  </h2>
                                </td>
                                <td>{formatDate(invoice?.dueDate || "")}</td>
                                <td>
                                  {invoice?.totalAmount
                                    ?.toString()
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                                  {invoice?.currency}
                                </td>
                                <td>
                                  <label
                                    className={
                                      invoice?.status === "Paid"
                                        ? "badge bg-inverse-success"
                                        : invoice?.status === "Partially Paid"
                                        ? "badge bg-inverse-info"
                                        : invoice?.status === "Pending"
                                        ? "badge bg-inverse-warning"
                                        : invoice?.status === "Cancelled"
                                        ? "badge bg-inverse-danger"
                                        : ""
                                    }
                                  >
                                    {invoice?.status === "Paid"
                                      ? t("aDash.paid")
                                      : invoice?.status === "Partially Paid"
                                      ? t("aDash.partiallyPaid")
                                      : invoice?.status === "Pending"
                                      ? t("aDash.pending")
                                      : invoice?.status === "Cancelled"
                                      ? t("aDash.cancelled")
                                      : "-"}
                                  </label>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <label
                          style={{
                            display: "grid",
                            placeItems: "center",
                            color: "grey",
                            height: "241px",
                          }}
                        >
                          {t("aRequests.errors.noRecordFound")}
                        </label>
                      )}
                    </div>
                  </div>
                  {allInvoices?.length > 0 && perm?.invoice && (
                    <div className="card-footer">
                      <Link to="/invoices">{t("aDash.viewAllInvoices")}</Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-6 d-flex">
                <div className="card card-table flex-fill">
                  <div className="card-header">
                    <h3 className="card-title mb-0">{t("aDash.payments")}</h3>
                  </div>
                  <div className="card-body">
                    <div
                      className="table-responsive"
                      style={{ minHeight: "203px" }}
                    >
                      {tableLoader?.payment ? (
                        <Spin
                          style={{
                            display: "grid",
                            placeItems: "center",
                            height: "203px",
                          }}
                        />
                      ) : !perm?.payment ? (
                        <label
                          style={{
                            display: "grid",
                            placeItems: "center",
                            color: "grey",
                            height: "241px",
                          }}
                        >
                          {t("aDash.noPermissionToViewPayments")}
                        </label>
                      ) : allPayments?.length > 0 ? (
                        <table className="table custom-table table-nowrap mb-0">
                          <thead>
                            <tr>
                              <th>{t("aDash.invoiceNumber")}</th>
                              <th>{t("aDash.client")}</th>
                              <th>{t("aDash.paymentType")}</th>
                              <th>{t("aDash.dueDate")}</th>
                              <th>{t("aDash.paidAmount")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allPayments?.map((payment) => (
                              <tr key={payment?._id}>
                                <td>
                                  <Link
                                    to="/invoices/view-invoice"
                                    state={{ invoice_data: payment }}
                                  >
                                    {payment?.invoiceNo}
                                  </Link>
                                </td>
                                <td>
                                  <h2>
                                    <a href="#!">
                                      {payment?.client?.clientName}
                                    </a>
                                  </h2>
                                </td>
                                <td>
                                  {payment?.paymentType === "Cash"
                                    ? t("cash")
                                    : payment?.paymentType === "Cheque"
                                    ? t("cheque")
                                    : payment?.paymentType === "Bank Transfer"
                                    ? t("bankTransfer")
                                    : "-"}
                                </td>
                                <td>
                                  {formatDate(payment?.paymentDate || "")}
                                </td>
                                <td>
                                  {payment?.paidAmountInPreferredCurrency
                                    ?.toString()
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                                  {payment?.company?.preferredCurrency}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <label
                          style={{
                            display: "grid",
                            placeItems: "center",
                            color: "grey",
                            height: "241px",
                          }}
                        >
                          {t("aRequests.errors.noRecordFound")}
                        </label>
                      )}
                    </div>
                  </div>
                  {allPayments?.length > 0 && perm?.payment && (
                    <div className="card-footer">
                      <Link to="/payments">{t("aDash.viewAllPayments")}</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 d-flex">
                <div className="card card-table flex-fill">
                  <div className="card-header">
                    <h3 className="card-title mb-0">{t("aDash.clients")}</h3>
                  </div>
                  <div className="card-body">
                    <div
                      className="table-responsive"
                      style={{ minHeight: "385px" }}
                    >
                      {tableLoader?.client ? (
                        <Spin
                          style={{
                            display: "grid",
                            placeItems: "center",
                            height: "402px",
                          }}
                        />
                      ) : !perm?.client ? (
                        <label
                          style={{
                            display: "grid",
                            placeItems: "center",
                            color: "grey",
                            height: "402px",
                          }}
                        >
                          {t("aDash.noPermissionToViewClients")}
                        </label>
                      ) : allClients?.length > 0 ? (
                        <table className="table custom-table mb-0">
                          <thead>
                            <tr>
                              <th style={{ paddingLeft: "20px" }}>
                                {t("aDash.name")}
                              </th>
                              <th>{t("aDash.email")}</th>
                              <th>{t("aDash.phoneNo")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allClients?.map((client) => (
                              <tr style={{ height: "62px" }} key={client?._id}>
                                <td>
                                  <h2 className="table-avatar">
                                    <Link
                                      to="/client/client-profile"
                                      state={{ client_data: client }}
                                      onClick={() =>
                                        sessionStorage.setItem(
                                          `clients_tab`,
                                          "projects"
                                        )
                                      }
                                      className="avatar"
                                    >
                                      <img
                                        alt=""
                                        src={client?.logo || user_icon}
                                      />
                                    </Link>
                                    <Link
                                      to="/client/client-profile"
                                      state={{ client_data: client }}
                                      onClick={() =>
                                        sessionStorage.setItem(
                                          `clients_tab`,
                                          "projects"
                                        )
                                      }
                                    >
                                      {client?.clientName}
                                    </Link>
                                  </h2>
                                </td>
                                <td>{client?.clientEmail}</td>
                                <td style={{ unicodeBidi: "plaintext" }}>
                                  {client?.clientPhoneNo}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <label
                          style={{
                            display: "grid",
                            placeItems: "center",
                            color: "grey",
                            height: "402px",
                          }}
                        >
                          {t("aRequests.errors.noRecordFound")}
                        </label>
                      )}
                    </div>
                  </div>
                  {allClients?.length > 0 && perm?.client && (
                    <div className="card-footer">
                      <Link to="/clients">{t("aDash.viewAllClients")}</Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-6 d-flex">
                <div className="card card-table flex-fill">
                  <div className="card-header">
                    <h3 className="card-title mb-0">
                      {t("aDash.recentProjects")}
                    </h3>
                  </div>
                  <div className="card-body">
                    <div
                      className="table-responsive"
                      style={{ minHeight: "385px" }}
                    >
                      {tableLoader?.project ? (
                        <Spin
                          style={{
                            display: "grid",
                            placeItems: "center",
                            height: "402px",
                          }}
                        />
                      ) : !perm?.project ? (
                        <label
                          style={{
                            display: "grid",
                            placeItems: "center",
                            color: "grey",
                            height: "402px",
                          }}
                        >
                          {t("aDash.noPermissionToViewProjects")}
                        </label>
                      ) : allProjects?.length > 0 ? (
                        <table className="table custom-table mb-0">
                          <thead>
                            <tr>
                              <th>{t("aDash.projectName")} </th>
                              <th>{t("status")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allProjects?.map((project) => (
                              <tr style={{ height: "62px" }} key={project?._id}>
                                <td>
                                  <h2>
                                    <Link
                                      to={`/projects/projects-view/${project?._id}`}
                                      state={{ project: project }}
                                    >
                                      {project?.projectName}
                                    </Link>
                                  </h2>
                                </td>
                                <td>
                                  <label
                                    className={
                                      project?.status === "Completed"
                                        ? "badge bg-inverse-success"
                                        : project?.status === "Paused"
                                        ? "badge bg-inverse-warning"
                                        : project?.status === "Archived"
                                        ? "badge bg-inverse-danger"
                                        : "badge bg-inverse-info"
                                    }
                                  >
                                    {project?.status === "Scheduled"
                                      ? ` ${t("projectScreen.Modal.scheduled")}`
                                      : project?.status === "On-Going"
                                      ? ` ${t("projectScreen.Modal.onGoing")}`
                                      : project?.status === "Paused"
                                      ? ` ${t("projectScreen.Modal.paused")}`
                                      : project?.status === "Archived"
                                      ? ` ${t("projectScreen.Modal.archived")}`
                                      : project?.status === "Completed"
                                      ? ` ${t("projectScreen.Modal.completed")}`
                                      : ""}
                                  </label>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <label
                          style={{
                            display: "grid",
                            placeItems: "center",
                            color: "grey",
                            height: "402px",
                          }}
                        >
                          {t("aRequests.errors.noRecordFound")}
                        </label>
                      )}
                    </div>
                  </div>
                  {allProjects?.length > 0 && perm?.project && (
                    <div className="card-footer">
                      <Link to="/projects/project_dashboard">
                        {t("aDash.viewAllProjects")}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* /Page Content */}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
