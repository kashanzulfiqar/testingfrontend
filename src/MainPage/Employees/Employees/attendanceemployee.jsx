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
import InfiniteScroll from "react-infinite-scroll-component";
import { Form, Input, DatePicker, Select, Button } from "antd";

const { Option } = Select;





const AttendanceEmployee = () => {
  const [form] = Form.useForm();

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
    //let attendanceDate = "2023-08-21"
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
          setFetchattend([]);
          setPage(1);
          setReachedEnd(false);
        }
        setIsCheckedIn(true);
        setIsCheckedOut(false);
      }).catch(err=>{
        
        message.error(

          `${

            err?.response?.data?.msg

              ? err?.response?.data?.msg

              : err?.response?.data?.validation?.body?.message

              ? err?.response?.data?.validation?.body?.message

              : "Get Role Info Error"

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
        setFetchattend([]);
        setPage(1);
        setReachedEnd(false)
      }

      }).catch(err=>{
        
        message.error(

          `${

            err?.response?.data?.msg

              ? err?.response?.data?.msg

              : err?.response?.data?.validation?.body?.message

              ? err?.response?.data?.validation?.body?.message

              : "Get Role Info Error"

          }`

        );
      });
      setIsCheckedIn(false);
      setIsCheckedOut(true);
    } catch (error) {
      console.log("error", error);
    }

    
  };

  const currentDate = moment().format("DD MMM YYYY");

  
  const formatHoursMinutes = (timeString) => {
    if (!timeString) return "Loading..";
  
    const totalMinutes = parseFloat(timeString);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    return `${hours} hrs ${minutes} m`;
  };

  // const [filterDate, setFilterDate] = useState("");
  // const [filterMonth, setFilterMonth] = useState("");
  // const [filterYear, setFilterYear] = useState("");
  // const [filteredAttendance, setFilteredAttendance] = useState([]);
  // const [page, setPage] = useState(1);
  // const [limit, setLimit] = useState(10);
  // const [hasMore, setHasMore] = useState(true);
  

  // const fetchFilteredAttendance = (event) => {
  //   //e.preventDefault();
  //   if (event) {
  //     event.preventDefault();
  //   }
    

  //   const filters = [];

  //   if (filterDate) filters.push(`attendanceDate=${filterDate}`);
  //   if (filterMonth) filters.push(`attendanceMonth=${filterMonth}`);
  //   if (filterYear) filters.push(`attendanceYear=${filterYear}`);

  //   const queryParams = filters.join("&");

  //   apiServices("GET", `attendance/?${queryParams}&page=${page}&limit=${limit}`, null, user_state)
  //     .then((res) => {
  //       if (res.data.success === true) {
  //         // setFilteredAttendance(res.data.Attendance.docs);
  //         setFilteredAttendance([...filteredAttendance, ...res.data.Attendance.docs]);
  //         if (page >= res.data.Attendance.pages) {
  //           setHasMore(false);
  //         } else {
  //           setPage(page + 1);
  //         }
  //       }
  //     })
  //     .catch((error) => {
  //       console.log("error", error);
  //     });
  // };

  // Update the useEffect to fetch initial attendance records
  // useEffect(() => {
  //   console.log("jelo")
  //   fetchFilteredAttendance();
  // }, [checkIn,checkOut]);

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const startYear = 2010;
    const yearOptions = [];
  
    for (let year = currentYear; year >= startYear; year--) {
      yearOptions.push(
        <option key={year} value={year}>
          {year}
        </option>
      );
    }
  
    return yearOptions;
  };

  const [filters, setFilters] = useState({
    date: "",
    month: "",
    year: "",
  });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [fetchattend,setFetchattend]=useState([])
  const [totalPages, setTotalPages] = useState(1);
  const [reachedEnd, setReachedEnd] = useState(false);

  const [pageRefreshed, setPageRefreshed] = useState(true);

  useEffect(() => {
    // Fetch the first page of data when the page refreshes
    if (pageRefreshed) {
      console.log("refresh load")
      apiServices("GET", 'attendance/', null, user_state)
        .then((res) => {
          if (res.data.success === true) {
            const attendanceData = res.data.Attendance.docs;
            setFetchattend(attendanceData); // Store the data without rendering
            setPageRefreshed(false);
            console.log("refresh set false") // Set pageRefreshed to false
          }
        })
        .catch((error) => {
          console.log("error", error);
        });
    }
  }, [pageRefreshed]);

  useEffect(() => {
    // Automatically trigger the reset function after fetching the initial data
    if (!pageRefreshed) {
      console.log("refresh reset")
      handleReset();
    }
  }, [pageRefreshed]);

  useEffect(() => {
    if (!pageRefreshed){
      console.log("main executed")
    // Create an API request URL based on the selected filters and pagination.
    let apiUrl = `attendance/?page=${page}&limit=10`;
    if (filters.date) apiUrl += `&attendanceDate=${filters.date}`;
    if (filters.month) apiUrl += `&attendanceMonth=${filters.month}`;
    if (filters.year) apiUrl += `&attendanceYear=${filters.year}`;

    setLoading(true);
  
    apiServices("GET", apiUrl, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const { Attendance } = res.data;
          const newAttendanceData = [...fetchattend, ...Attendance.docs];
          setFetchattend(newAttendanceData);
          setTotalPages(Attendance.pages);
  
          if (page >= Attendance.pages) {
            setReachedEnd(true);
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        console.log("error", error);
        setLoading(false);
      });
    }
  }, [filters, page, checkIn, checkOut]);

  useEffect(() => {
    setReachedEnd(false);
  }, [filters]);

  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };
  
  
  useEffect(() => {
    if(!pageRefreshed){
    const handleScroll = debounce(() => {
      if (
        window.innerHeight + window.scrollY >=
          document.documentElement.offsetHeight &&
        !loading &&
        !reachedEnd &&
        totalPages>=page
      ) {
        console.log("current page", page );
        console.log("Scrolling to page", page + 1);
        setPage(page + 1);
      }
    }, 500); // Adjust the debounce delay as needed
  
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }
  }, [page, loading, reachedEnd, totalPages, selectedFilters]);


  const [selectedFilters, setSelectedFilters] = useState({
    date: "",
    month: "",
    year: "",
  });

  const handleFilterChange = (value, filterType) => {
    // Update the selected filter temporarily
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value,
    });
  };

  
  

  const handleSearch = () => {
    // Apply the selected filters, reset page, and clear the table
    setFetchattend([]);
    setPage(1);
    setFilters(selectedFilters);
  };

  const handleReset = () => {
    // Reset filters, fetch default records, and clear the table
    form.resetFields();

    setSelectedFilters({
      date: "",
      month: "",
      year: "",
    });
    setFetchattend([]);
    setPage(1);
    setFilters({});
  };

  // useEffect(()=>{
  //   handleReset();
  // },[])
  

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
                              <h6><label>{isCheckedIn || isCheckedOut ? checkIn.status : "--"}</label></h6>
                            </div>
                          </div>

                      <div className="col-md-6 col-6 text-center">
                        <div className="stats-box">
                          <p>Overtime</p>
                          {/* <h6>{isCheckedOut ? formatHoursMinutes(parseFloat(checkOut.overTime) * 60) : "--"}</h6> */}
                          <h6><label>{isCheckedOut ? formatHoursMinutes(checkOut.overTime) : "--"}</label></h6>
                          {/* <h6>{isCheckedOut ? formatHoursMinutes(checkOut.overTime) : "None"}</h6> */}
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
            {/* <div className="row filter-row">
  <div className="col-sm-3">
    <div className="form-group form-focus select-focus">
      <div>
        <input
          type="date"
          className="form-control floating datetimepicker"
          onChange={(e) => handleFilterChange(e, "date")}
        />
      </div>
      <label className="focus-label">Date</label>
    </div>
  </div>
  <div className="col-sm-3">
    <div className="form-group form-focus select-focus">
      <select
        className="form-control select2"
        onChange={(e) => handleFilterChange(e, "month")}
      >
        <option value="">-</option>
        <option>January</option>
        <option>February</option>
        <option>March</option>
        <option>April</option>
        <option>May</option>
        <option>June</option>
        <option>July</option>
        <option>August</option>
        <option>September</option>
        <option>October</option>
        <option>November</option>
        <option>December</option>
      </select>
      <label className="focus-label">Select Month</label>
    </div>
  </div>
  
  <div className="col-sm-3">
    <div className="form-group form-focus select-focus">
      <select
        className="form-control select2"
        onChange={(e) => handleFilterChange(e, "year")}
      >
        <option value="">-</option>
        {generateYearOptions()}
      </select>
      <label className="focus-label">Select Year</label>
    </div>
  </div>
  
<div className="col-sm-3">
    <button
    href="#"
      className="btn btn-success btn-block w-100"
      onClick={handleSearch}
    >
      Search
    </button>
    <button
  href="#"
      className="btn btn-secondary btn-block w-100"
      onClick={handleReset}
    >
      Reset
    </button>
</div>


                
</div> */}

<Form onFinish={handleSearch}>
      <div className="row filter-row">
      <div className="col-sm-6 col-md-3">  
      <div className="form-group">
          <Form.Item 
          name="date"
          >
            <DatePicker
              className="form-control"
              onChange={(date, dateString) => handleFilterChange(dateString, "date")}
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
            size="large"
          />
        </Form.Item>
      </div>
    </div>

        <div className="col-sm-6 col-md-3">
      <div className="">
        <Form.Item
          name="year"
          className="custom-border"
        >
          <DatePicker.YearPicker
            style={{
              width: '100%',
            }}
            placeholder="Select Year"
            size="large"
          />
        </Form.Item>
      </div>
    </div>

        <div className="col-sm-6 col-md-3" style={{display: 'flex', alignItems: 'flex-start', gap: '13px'}}>
          <Button
            type="primary"
            htmlType="submit"
            className="btn btn-success btn-block w-50"
          >
            Search
          </Button>
          <Button
            type="default"
            onClick={handleReset}
            className="btn btn-secondary btn-block w-50"
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
          
          <table className="table table-striped custom-table mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Date </th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Production</th>
                
                <th>Overtime</th>
              </tr>
            </thead>
            <tbody>
              {/* Iterate over filteredAttendance and display rows */}
              {fetchattend.map((record, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{record.attendanceDate}</td>
                  <td>{moment(record.checkInTime, "HH:mm").format("h:mm A")}</td>
                  <td>
                    {record.checkOutTime
                      ? moment(record.checkOutTime, "HH:mm").format("h:mm A")
                      : "--"}
                  </td>
                  <td>{record.status}</td>
                  <td>{formatHoursMinutes(record.hoursWorked)}</td>
                  <td>{record.overTime?
                  formatHoursMinutes(record.overTime):"None"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <tr>
              <td colSpan="6">Loading...</td>
            </tr>
          )}

          {reachedEnd && (
            <tr>
              <td colSpan="6">Reached end of records</td>
            </tr>
          )}
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
