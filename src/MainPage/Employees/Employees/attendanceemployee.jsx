import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Offcanvas from "../../../Entryfile/offcanvance";
import Header from "../../../initialpage/Sidebar/header";
import Sidebar from "../../../initialpage/Sidebar/sidebar";
import moment from "moment";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import { message } from "antd";
// import InfiniteScroll from "react-infinite-scroll-component";
import { ItemRender } from "antd/lib/upload/interface";
import { Table, Form, Input, DatePicker, Select, Button, Spin } from "antd";
import { itemRender } from "../../paginationfunction";


const AttendanceEmployee = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);


  const user_state = useSelector((state) => state.user.loginvalue);

  let AuthObj = JSON.parse(localStorage.getItem("AuthObj"));
  let userID = AuthObj?.userId;

  const [menu, setMenu] = useState(false);
  const [statusText, setStatusText] = useState("Not yet checked in");
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  const [checkIn, setCheckIn] = useState({
    attendanceId: "",
    attendanceDate: "",
    checkInTime: "",
    status:""
  });

  const [checkOut, setCheckout] = useState({
    _id: "",
    checkOutTime: "",
    hoursWorked: "",
    overTime: ""
  });

  const toggleMobileMenu = () => {
    setMenu(!menu);
  };

  const [attendanceData, setAttendanceData] = useState(null);

  // ... (other useEffects)

  useEffect(() => {
    // Fetch user's attendance data
    apiServices("GET", 'attendance/', null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const attendanceData = res.data.Attendance.docs;
          setAttendanceData(attendanceData);
  
          if (attendanceData.length > 0) {
            const firstAttendanceRecord = attendanceData[0];
  
            console.log("First Attendance Record:", firstAttendanceRecord);
  
            if (firstAttendanceRecord.checkOutTime) {
              //setIsCheckedOut(true);
              setIsCheckedIn(false);
              //setStatusText("Not yet checked in");
            } else {
              setIsCheckedIn(true);
              setIsCheckedOut(false);
              setStatusText(`${moment(firstAttendanceRecord.attendanceDate).format("ddd, Do MMM YYYY")} 
                                      ${moment(firstAttendanceRecord.checkInTime, "HH:mm").format("h:mm A")}`);
            }
            setCheckIn({
              ...checkIn,
              attendanceId: firstAttendanceRecord._id,
              checkInTime: firstAttendanceRecord.checkInTime,
              attendanceDate: firstAttendanceRecord.attendanceDate,
              status:firstAttendanceRecord.status
            });
          }
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  }, []);
  

  useEffect(() => {

    if (isCheckedIn) {
      setStatusText(`${moment(checkIn.attendanceDate).format("ddd, Do MMM YYYY")} 
                                      ${moment(checkIn.checkInTime, "HH:mm").format("h:mm A")}`);

    } else if (isCheckedOut) {
      if(checkOut.checkOutTime){
      setStatusText(`${moment(checkOut.attendanceDate).format("ddd, Do MMM YYYY")}
                                      ${moment(checkOut.checkOutTime, "HH:mm").format("h:mm A")}`);
      }
      else{
        setStatusText("Loading..");
      }
    } 
    else {
      setStatusText("Not yet checked in");
    }
  }, [isCheckedIn, isCheckedOut, checkIn, checkOut]);

  useEffect(() => {
    if ($(".select").length > 0) {
      $(".select").select2({
        minimumResultsForSearch: -1,
        width: "100%",
      });
    }
  });

  const handleCheckIn = () => {
    //let current = new Date(Date.now());
    const moment = require("moment");
    let datebn = new Date(Date.now());
    let checkInTime = moment(datebn).format("HH:mm");
    //let attendanceDate = "2023-08-31" for testing
    let attendanceDate = moment(datebn).format("YYYY-MM-DD");
    try {
      let data = {
        attendanceDate: attendanceDate,
        checkInTime: checkInTime,
      };
      apiServices("POST", "attendance/", data, user_state).then((res) => {
        if (res.data.success === true) {
        
          setCheckIn({
            ...checkIn,
            attendanceId: res?.data?.Attendance?._id,
            checkInTime: res?.data?.Attendance?.checkInTime,
            attendanceDate: res?.data?.Attendance?.attendanceDate,
            status:res?.data?.Attendance?.status
          });
        }
        setPagination({
          ...pagination,
          current: 1,
        });
        setSelectedFilters({
          date: "",
          month: "",
          year: "",
        });
        setFilters({
          date: "",
          month: "",
          year: "",
        });
        setIsCheckedIn(true);
        setIsCheckedOut(false);
      }).catch(err=>{
        
        message.error(

          `${

            err?.response?.data?.msg

              ? err?.response?.data?.msg

              : err?.response?.data?.validation?.body?.message

              ? err?.response?.data?.validation?.body?.message

              : "Get Check In Time Error"

          }`

        );
      });
    } catch (error) {
      console.log("error", error);
    }

    
  };

  const handleCheckOut = () => {

    const moment = require("moment");
    let datebn = new Date(Date.now());
    let checkOutTime = moment(datebn).format("HH:mm");

    try {
      apiServices(
        "PUT",
        `attendance/`,
        {
          _id: checkIn?.attendanceId,
          checkOutTime: checkOutTime,
        },
        user_state
      ).then((res) => {
        if (res.data.success === true){
        
        setCheckout({
          ...checkOut,
          checkOutTime: checkOutTime,
          hoursWorked: res?.data?.Attendance?.hoursWorked,
          overTime: res?.data?.Attendance?.overTime,
        });
      }

      }).catch(err=>{
        
        message.error(

          `${

            err?.response?.data?.msg

              ? err?.response?.data?.msg

              : err?.response?.data?.validation?.body?.message

              ? err?.response?.data?.validation?.body?.message

              : "Get Check Out time error"

          }`

        );
      });
      setPagination({
        ...pagination,
        current: 1,
      });
      setSelectedFilters({
        date: "",
        month: "",
        year: "",
      });
      setFilters({
        date: "",
        month: "",
        year: "",
      });
      setIsCheckedIn(false);
      setIsCheckedOut(true);
    } catch (error) {
      console.log("error", error);
    }

    
  };

  const currentDate = moment().format("DD MMM YYYY");

  
  const formatHoursMinutes = (timeString) => {
    if (!timeString) return "None";
  
    const totalMinutes = parseFloat(timeString);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    return `${hours}h ${minutes}m`;
  };

  const [filters, setFilters] = useState({
    date: "",
    month: "",
    year: "",
  });
  const [selectedFilters, setSelectedFilters] = useState({
    date: "",
    month: "",
    year: "",
  });
  const[fetchattend,setFetchattend]=useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10, 
    total: 0, 
  });
  
  useEffect(() => {
    setIsLoading(true);
    
    fetchattendance();
  }, [filters, pagination.current, pagination.pageSize,checkIn, checkOut]);

  const fetchattendance=()=>{
    const params = {
      ...filters,
      page: pagination.current,
      limit: pagination.pageSize,
    };

    let apiUrl = `attendance/?page=${params.page}&limit=${params.limit}`;
    if (filters.date) apiUrl += `&attendanceDate=${filters.date}`;
    if (filters.month) apiUrl += `&attendanceMonth=${filters.month}`;
    if (filters.year) apiUrl += `&attendanceYear=${filters.year}`;
  
    apiServices("GET", apiUrl, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const attendanceData = res.data.Attendance.docs;
          setFetchattend(attendanceData);
          setPagination({
            ...pagination,
            total: res.data.Attendance.total ,
          });
        }
      })
      .catch((error) => {
        console.log("error", error);
      }).finally(()=>{
        setIsLoading(false);
      });
  }
  
  const [monthPickerValue, setMonthPickerValue] = useState(null);

  
  const handleFilterChange = (value, filterType) => {
    
    if (filterType === "month") {
      
      const monthName = moment(value, "YYYY-MM").format("MMMM");
      
      setSelectedFilters({
        ...selectedFilters,
        [filterType]: monthName ? monthName : '',
      });
    } else {
      
      setSelectedFilters({
        ...selectedFilters,
        [filterType]: value,
      });
    }
  };

  const handleSearch = () => {
    console.log(filters)
    setFilters(selectedFilters);
    setPagination({
      ...pagination,
      current: 1,
    });
    //fetchattendance();
  };

  const handleReset = () => {
    setSelectedFilters({
      date: "",
      month: "",
      year: "",
    });
    setFilters({
      date: "",
      month: "",
      year: "",
    });
    setPagination({
      ...pagination,
      current: 1, 
    });

    form.resetFields();
    //fetchattendance();

  };

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "attendanceDate",
      key: "attendanceDate",
    },
    {
      title: "Check In",
      dataIndex: "checkInTime",
      key: "checkInTime",
      render: (checkInTime) => moment(checkInTime, "HH:mm").format("h:mm A"),
    },
    {
      title: "Check Out",
      dataIndex: "checkOutTime",
      key: "checkOutTime",
      render: (checkOutTime) => checkOutTime? moment(checkOutTime, "HH:mm").format("h:mm A"):"--",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span style={{ color: status === "Late" ? "red" : status === "Present" ? "green" : "black" }}>
          {status}
        </span>
      ),
    },
    {
      title: "Duration",
      dataIndex: "hoursWorked",
      key: "hoursWorked",
      render: (hoursWorked) => formatHoursMinutes(hoursWorked),
    },
    {
      title: "Overtime",
      dataIndex: "overTime",
      key: "overTime",
      render: (overTime) => overTime?
        formatHoursMinutes(overTime):"None",
    },
  ];
  
  
  

  return (
    <>
      <div className={`main-wrapper ${menu ? "slide-nav" : ""}`}>
        {/* <Header onMenuClick={(value) => toggleMobileMenu()} /> */}
        <Sidebar />

        <div className="page-wrapper">
          <Helmet>
            <title>Attendance - HRMS Admin Template</title>
            <meta name="description" content="Login page" />
          </Helmet>
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <h3 className="page-title">Attendance</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/app/main/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Attendance</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="row">
              <div className="col-md-4">
                <div className="card punch-status">
                  <div className="card-body">
                    <h5 className="card-title">
                      Timesheet{" "}
                      <small className="text-muted">{currentDate}</small>
                    </h5>

                    <div className="punch-det">
                      <h6><label>{isCheckedOut ? "Checked out at" : "Check in at"}</label></h6>
                      <p>{statusText}</p>
                    </div>
                  

                    <div className="punch-info">
                      <div className="punch-hours">
                        {/* <span>{isCheckedOut ? formatHoursMinutes(checkOut.hoursWorked) : "--"}</span> */}
                        {/* <span>{isCheckedOut ? formatHoursMinutes(parseFloat(checkOut.hoursWorked) * 60) : "--"}</span> */}
                        <span>{isCheckedOut ? formatHoursMinutes(checkOut.hoursWorked) : "--"}</span>
                      </div>
                    </div>
                    


                    <div className="punch-btn-section">
                      <button
                        type="button"
                        className={`btn btn-${
                          isCheckedIn || (attendanceData && attendanceData.checkOutTime)
                            ? "danger"
                            : "primary"
                        } punch-btn`}
                        onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                      >
                        {isCheckedIn || (attendanceData && attendanceData.checkOutTime)
                          ? "Check Out"
                          : "Check In"}
                      </button>
                    </div>

                    <div className="statistics">
                      <div
                        className="row"
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <div className="col-md-6 col-6 text-center">
                            <div className="stats-box">
                              <p>Status</p>
                              
                              <h6><label
                              style={{
                                color:
                                  (isCheckedIn || isCheckedOut) &&
                                  (checkIn.status === "Late" ? "red" : checkIn.status === "Present" ? "green" : "black"),
                              }}>{isCheckedIn || isCheckedOut ? checkIn.status : "--"}</label></h6>
                            </div>
                          </div>

                      <div className="col-md-6 col-6 text-center">
                        <div className="stats-box">
                          <p>Overtime</p>
                          
                          <h6><label>{isCheckedOut ? formatHoursMinutes(checkOut.overTime) : "--"}</label></h6>
                          
                        </div>
                      </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card att-statistics">
                  <div className="card-body">
                    <h5 className="card-title">Statistics</h5>
                    <div className="stats-list">
                      <div className="stats-info">
                        <p>
                          Today{" "}
                          <strong>
                            3.45 <small>/ 8 hrs</small>
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: "31%" }}
                            aria-valuenow={31}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>
                          This Week{" "}
                          <strong>
                            28 <small>/ 40 hrs</small>
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-warning"
                            role="progressbar"
                            style={{ width: "31%" }}
                            aria-valuenow={31}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>
                          This Month{" "}
                          <strong>
                            90 <small>/ 160 hrs</small>
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: "62%" }}
                            aria-valuenow={62}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>
                          Remaining{" "}
                          <strong>
                            90 <small>/ 160 hrs</small>
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-danger"
                            role="progressbar"
                            style={{ width: "62%" }}
                            aria-valuenow={62}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>
                          Overtime <strong>4</strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-info"
                            role="progressbar"
                            style={{ width: "22%" }}
                            aria-valuenow={22}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card recent-activity">
                  <div className="card-body">
                    <h5 className="card-title">Today Activity</h5>
                    <ul className="res-activity-list">
                      <li>
                        <p className="mb-0">Check In at</p>
                        <p className="res-activity-time">
                          <i className="fa fa-clock-o" />
                          10.00 AM.
                        </p>
                      </li>
                      <li>
                        <p className="mb-0">Check Out at</p>
                        <p className="res-activity-time">
                          <i className="fa fa-clock-o" />
                          11.00 AM.
                        </p>
                      </li>
                      <li>
                        <p className="mb-0">Check In at</p>
                        <p className="res-activity-time">
                          <i className="fa fa-clock-o" />
                          11.15 AM.
                        </p>
                      </li>
                      <li>
                        <p className="mb-0">Check Out at</p>
                        <p className="res-activity-time">
                          <i className="fa fa-clock-o" />
                          1.30 PM.
                        </p>
                      </li>
                      <li>
                        <p className="mb-0">Check In at</p>
                        <p className="res-activity-time">
                          <i className="fa fa-clock-o" />
                          2.00 PM.
                        </p>
                      </li>
                      <li>
                        <p className="mb-0">Check Out at</p>
                        <p className="res-activity-time">
                          <i className="fa fa-clock-o" />
                          7.30 PM.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
        
            {/* Search Filter */}
            
<Form form={form}>
      <div className="row filter-row">
      <div className="col-sm-6 col-md-3">  
      <div className="form-group">
          <Form.Item 
          name="date"
          >
            <DatePicker
              className="form-control"
              onChange={(date, dateString) => handleFilterChange(dateString, "date")}
              allowClear={false}
            />
          </Form.Item>
        </div>
        </div>
        <div className="col-sm-6 col-md-3">
      <div className="form-group">
        <Form.Item
          name="month"
          className="custom-border"
        >
          <DatePicker.MonthPicker
            style={{
              width: '100%',
            }}
            placeholder="Select Month"
            allowClear={false}
            format="MMMM"
            size="large"
            onChange={(date, dateString) => handleFilterChange(dateString, "month")
            
            
          }
          />
        </Form.Item>
      </div>
    </div>
        <div className="col-sm-6 col-md-3">
      <div className="form-group">
        <Form.Item
          name="year"
          className="custom-border"
        >
          <DatePicker.YearPicker
            style={{
              width: '100%',
            }}
            placeholder="Select Year"
            allowClear={false}
            size="large"
            onChange={(date, dateString) => handleFilterChange(dateString, "year")}
          />
        </Form.Item>
      </div>
    </div>

        <div className="col-sm-6 col-md-3" style={{display: 'flex', alignItems: 'flex-start', gap: '13px'}}>
          <Button
            type="primary"
            htmlType="submit"
            onClick={handleSearch}
            className="btn-success btn-block w-100"
          >
            Search
          </Button>
          <Button
            htmlType="submit"
            type="primary"
            onClick={handleReset}
            className="btn-secondary btn-block w-100"
          >
            Reset
          </Button>
        </div>
      </div>
    </Form>
    {/* /Search Filter */}

    <div className="row">
      <div className="col-lg-12">
      
        <div className="table-responsive">
          
        <Table
  dataSource={fetchattend}
  columns={columns}
  locale={{
    emptyText: isLoading ? (
      <Spin size="large" tip="Loading..." />
    ) : (
      "No data"
    ),
  }}
  bordered
  pagination={{
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    showTotal: (total, range) =>
      `Showing ${range[0]} to ${range[1]} of ${total} entries`,
    pageSizeOptions: ["10", "20", "30", "40"], // Options to change page size
    showSizeChanger: true, // Show the page size changer
    onChange: (page, pageSize) => {
      setPagination({
        ...pagination,
        current: page,
        pageSize: pageSize,
      });
    },
    itemRender:itemRender
  }}

/>

        </div>
        
      </div>
    </div>
            
          </div>
          {/* /Page Content */}
        </div>
      </div>
      <Offcanvas />
    </>
  );
};

export default AttendanceEmployee;
