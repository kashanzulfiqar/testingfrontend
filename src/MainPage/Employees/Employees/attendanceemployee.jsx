import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Offcanvas from "../../../Entryfile/offcanvance";
import Header from "../../../initialpage/Sidebar/header";
import Sidebar from "../../../initialpage/Sidebar/sidebar";
import moment from "moment";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import { Empty, message } from "antd";
// import InfiniteScroll from "react-infinite-scroll-component";
import { ItemRender } from "antd/lib/upload/interface";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { Table, Form, Input, DatePicker, Select, Button, Spin } from "antd";
import { itemRender } from "../../paginationfunction";

const AttendanceEmployee = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [tableLoader, setTableLoader] = useState(false);
  const [Bdisbale, setBdisbale] = useState(false);
  const [disableAttend, setdisableAttend] = useState(false);

  const isDisabled = !Bdisbale;

  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role;

  let AuthObj = JSON.parse(localStorage.getItem("AuthObj"));
  let userID = AuthObj?.userId;

  const [menu, setMenu] = useState(false);
  const [statusText, setStatusText] = useState("Not yet checked in");
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [firstload, setFirstLoad] = useState(false);

  const [timer, setTimer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [shiftStartTime, setShiftStartTime] = useState('');
  const [shiftEndTime, setShiftEndTime] = useState('');
  const [shiftDuration, setShiftDuration] = useState(0);

  const [checkIn, setCheckIn] = useState({
    attendanceId: "",
    attendanceDate: "",
    checkInTime: "",
    status: "",
  });

  const [checkOut, setCheckout] = useState({
    _id: "",
    checkOutTime: "",
    hoursWorked: "",
    overTime: "",
  });

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
  const [fetchattend, setFetchattend] = useState([]);
  const [fetchattend6, setFetchattend6] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const toggleMobileMenu = () => {
    setMenu(!menu);
  };

  const [stats, setStats] = useState({
    lastWeek: 0, // Set initial values as needed
    lastMonth: 0, // Set initial values as needed
  });
  const [attendanceData, setAttendanceData] = useState(null);

  const moment = require("moment");
  let nowdate = new Date(Date.now());

  const firstDate = moment(nowdate).format("YYYY-MM-DD");
  //const firstDate = "2023-08-10"
  
  useEffect(() => {
    if (!disableAttend) {
      setTableLoader(true);

      fetchattendance();
    }
  }, [filters, pagination.current, pagination.pageSize, checkIn, checkOut]);

  useEffect(() => {
    setIsLoading(true);
    // Fetch user's attendance data
    apiServices(
      "GET",
      `attendance/?attendanceDate=${firstDate}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          const attendanceData = res?.data?.Attendance?.docs;
          setAttendanceData(attendanceData);
          const { shiftId } = res?.data?.user;
          const shiftStartTime = shiftId.startTime;
          const shiftEndTime = shiftId.endTime;

          // Calculate shift duration
          const shiftStart = moment(shiftStartTime, 'HH:mm:ss');
          const shiftEnd = moment(shiftEndTime, 'HH:mm:ss');
          const shiftDuration = moment.duration(shiftEnd.diff(shiftStart)).asMinutes();
          setStats({
            lastWeek: res.data.lastWeek,
            lastMonth: res.data.lastMonth,
          });
          setShiftDuration(shiftDuration)

          if (attendanceData?.length > 0) {
            const firstAttendanceRecord = attendanceData[0];

            // if (firstAttendanceRecord?.checkInTime){
            //   const checkInTime = firstAttendanceRecord?.checkInTime;
            //   const [hours, minutes] = checkInTime.split(':').map(Number);
            //   const currentTime = new Date();
            //   const startTime = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate(), hours, minutes);
            //   const newElapsedTime = Date.now() - startTime.getTime();

            //   // Set the elapsed time and start the timer
            //   setElapsedTime(newElapsedTime);
            //   startTimer(startTime);
            // }
            if (firstAttendanceRecord?.checkInTime) {
              const checkInTime = firstAttendanceRecord?.checkInTime;
              const [hours, minutes] = checkInTime.split(":").map(Number);
              const currentTime = new Date();
              const startTime = new Date(
                currentTime.getFullYear(),
                currentTime.getMonth(),
                currentTime.getDate(),
                hours,
                minutes
              );
              if (firstAttendanceRecord?.checkOutTime) {
                const checkOutTime = firstAttendanceRecord?.checkOutTime;
                const [outHours, outMinutes] = checkOutTime
                  .split(":")
                  .map(Number);
                const outTime = new Date(
                  currentTime.getFullYear(),
                  currentTime.getMonth(),
                  currentTime.getDate(),
                  outHours,
                  outMinutes
                );

                const newElapsedTime = outTime - startTime;
                // Set the elapsed time
                setElapsedTime(newElapsedTime);
              } else {
                let newElapsedTime = Date.now() - startTime.getTime();
                // Start the timer only if it's a check-in
                startTimer(startTime);
                // Set the elapsed time
                setElapsedTime(newElapsedTime);
              }
            }

            //console.log("First Attendance Record:", firstAttendanceRecord);
            //console.log(firstAttendanceRecord.checkInTime);

            if (firstAttendanceRecord?.checkOutTime) {
              //setIsCheckedOut(true);
              setCheckout({
                ...checkOut,
                checkOutTime: firstAttendanceRecord?.checkOutTime,
                hoursWorked: firstAttendanceRecord?.hoursWorked,
                overTime: firstAttendanceRecord?.overTime,
              });
              setIsCheckedOut(true);
              //setStatusText("Not yet checked in");
              setStatusText(`${moment(
                firstAttendanceRecord.attendanceDate
              ).format("ddd, Do MMM YYYY")} 
                                      ${moment(
                                        firstAttendanceRecord.checkOutTime,
                                        "HH:mm"
                                      ).format("h:mm A")}`);
            } else if (
              firstAttendanceRecord.status === "Absent" ||
              firstAttendanceRecord.status === "On-Leave" ||
              firstAttendanceRecord.status === "Holiday"
            ) {
              setIsCheckedIn(false);
              setIsCheckedOut(false);
              setStatusText("Not yet checked in");
            } else {
              setIsCheckedIn(true);
              setIsCheckedOut(false);
              setStatusText(`${moment(
                firstAttendanceRecord.attendanceDate
              ).format("ddd, Do MMM YYYY")} 
                                      ${moment(
                                        firstAttendanceRecord.checkInTime,
                                        "HH:mm"
                                      ).format("h:mm A")}`);
            }
            setCheckIn({
              ...checkIn,
              attendanceId: firstAttendanceRecord._id,
              checkInTime: firstAttendanceRecord.checkInTime,
              attendanceDate: firstAttendanceRecord.attendanceDate,
              status: firstAttendanceRecord.status,
            });
          }
        }
      })
      .catch((error) => {
        console.log("error", error);
      })
      .finally(() => {
        setIsLoading(false);
        setBdisbale(true);
        setdisableAttend(true);
      });
  }, []);

  useEffect(() => {
    if (isCheckedIn) {
      setStatusText(`${moment(checkIn.attendanceDate).format(
        "ddd, Do MMM YYYY"
      )} 
                                      ${moment(
                                        checkIn.checkInTime,
                                        "HH:mm"
                                      ).format("h:mm A")}`);
    } else if (isCheckedOut) {
      if (checkOut.checkOutTime) {
        setStatusText(`${moment(checkOut.attendanceDate).format(
          "ddd, Do MMM YYYY"
        )}
                                      ${moment(
                                        checkOut.checkOutTime,
                                        "HH:mm"
                                      ).format("h:mm A")}`);
      } else {
        setStatusText("Loading..");
      }
    } else {
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

  const startTimer = (ftime) => {
    if (ftime) {
      //console.log("first time",ftime)
      //const startTime = Date.now() - elapsedTime;
      const newTimer = setInterval(() => {
        const newElapsedTime = Date.now() - ftime.getTime();
        setElapsedTime(newElapsedTime);
      }, 1000); // Update every second (1000 milliseconds)
      setTimer(newTimer);
    } else {
      const startTime = Date.now() - elapsedTime;
      const newTimer = setInterval(() => {
        const newElapsedTime = Date.now() - startTime;
        setElapsedTime(newElapsedTime);
      }, 1000); // Update every second (1000 milliseconds)
      setTimer(newTimer);
    }
  };

  const stopTimer = () => {
    clearInterval(timer);
    setTimer(null);
  };

  const totalWorkTime = (shiftDuration/60) * 60 * 60 * 1000;

  const percentageCompleted = (elapsedTime / totalWorkTime) * 100;
  const percentageweek = (elapsedTime / totalWorkTime) * 100;
  const percentagemonth = (elapsedTime / totalWorkTime) * 100;

  const formatElapsedTime = (milliseconds) => {
    if (!milliseconds) return "--";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const formatTodayTime = (milliseconds) => {
    if (!milliseconds) return "None";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m`;
  };

  const handleCheckIn = () => {
    setBdisbale(false);
    //let current = new Date(Date.now());
    const moment = require("moment");
    let datebn = new Date(Date.now());
    let checkInTime = moment(datebn).format("HH:mm");
    //let attendanceDate = "2023-08-10"
    let attendanceDate = moment(datebn).format("YYYY-MM-DD");
    try {
      let data = {
        attendanceDate: attendanceDate,
        checkInTime: checkInTime,
      };
      apiServices("POST", "attendance/", data, user_state)
        .then((res) => {
          if (res.data.success === true) {
            startTimer();
            message.success("Check-In successful");
            setFirstLoad(false);
            setCheckIn({
              ...checkIn,
              attendanceId: res?.data?.Attendance?._id,
              checkInTime: res?.data?.Attendance?.checkInTime,
              attendanceDate: res?.data?.Attendance?.attendanceDate,
              status: res?.data?.Attendance?.status,
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
          setdisableAttend(false);
          setIsCheckedIn(true);
          setIsCheckedOut(false);
        })
        .catch((err) => {
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Error Marking Attendance"
            }`
          );
        })
        .finally(() => {
          setBdisbale(true);
        });
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleCheckOut = () => {
    setBdisbale(false);
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
      )
        .then((res) => {
          if (res.data.success === true) {
            stopTimer();
            message.success("Attendance Marked");
            setFirstLoad(false);
            setCheckout({
              ...checkOut,
              checkOutTime: checkOutTime,
              hoursWorked: res?.data?.Attendance?.hoursWorked,
              overTime: res?.data?.Attendance?.overTime,
            });
            setdisableAttend(false);
          }
        })
        .catch((err) => {
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Error Marking Attendance"
            }`
          );
        })
        .finally(() => {
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
          setBdisbale(true);
        });
    } catch (error) {
      console.log("error", error);
    }
  };

  const currentDate = moment(nowdate).format("DD MMM YYYY");

  const formatHoursMinutes = (timeString) => {
    if (!timeString) return "None";

    const totalMinutes = parseFloat(timeString);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const fetchattendance = () => {
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
          console.log(attendanceData);
          setStats({
            lastWeek: res.data.lastWeek,
            lastMonth: res.data.lastMonth,
          });
          if (!firstload) {
            setFetchattend6(attendanceData);
          }
          setFetchattend(attendanceData);
          setPagination({
            ...pagination,
            total: res.data.Attendance.total,
          });
          setFirstLoad(true);
        }
      })
      .catch((error) => {
        console.log("error", error);
      })
      .finally(() => {
        setIsLoading(false);
        setTableLoader(false);
      });
  };

  const [monthPickerValue, setMonthPickerValue] = useState(null);

  const handleFilterChange = (value, filterType) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value,
    });
  };

  const handleSearch = () => {
    setdisableAttend(false);
    //console.log(filters);
    setFilters(selectedFilters);
    setPagination({
      ...pagination,
      current: 1,
    });
    //fetchattendance();
  };

  const handleReset = () => {
    setdisableAttend(false);
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

  const customEmptyText = (
    <Empty
      image={<img src={EmptyTable} />}
      // image={<InboxOutlined />}
      imageStyle={
        {
          // fontSize: 48,
          // color: '#1890ff',
        }
      }
      style={{
        height: "300px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      description={
        <div style={{ display: "" }}>
          <div
            style={{
              color: "#34343F",
              fontWeight: "500",
              fontSize: "14px",
              margin: "7px 0px 4px 0px",
            }}
          >
            No Data
          </div>
          {/* <div
            style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
          >
            Click 'Add Department' Button To Create <br /> A New Department{" "}
          </div> */}
        </div>
      }
    />
  );

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
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
      render: (checkInTime) =>
        checkInTime ? moment(checkInTime, "HH:mm").format("h:mm A") : "--",
    },
    {
      title: "Check Out",
      dataIndex: "checkOutTime",
      key: "checkOutTime",
      render: (checkOutTime) =>
        checkOutTime ? moment(checkOutTime, "HH:mm").format("h:mm A") : "--",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          style={{
            color:
              status === "Late" || status === "Absent"
                ? "red"
                : status === "Present"
                ? "green"
                : status === "On-Leave"
                ? "orange"
                : status === "Holiday"
                ? "blue"
                : "black",
          }}
        >
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
      render: (overTime) => (overTime ? formatHoursMinutes(overTime) : "None"),
    },
  ];

  return (
    <>
      <div className={`main-wrapper ${menu ? "slide-nav" : ""}`}>
        <div className="page-wrapper">
          <Helmet>
            <title>Attendance - DaftarPro</title>
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
                      <Link
                        to={
                          role === "admin"
                            ? "/main/dashboard"
                            : "/employee/dashboard"
                        }
                      >
                        Dashboard
                      </Link>
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
                    <h5 className="card-title d-flex gap-1">
                      Timesheet
                      <h5 className="text-muted" style={{ fontSize: "20px" }}>
                        {currentDate}
                      </h5>
                    </h5>

                    <div className="punch-det">
                      <h6>
                        <label>
                          {isCheckedOut ? "Checked out at" : "Check in at"}
                        </label>
                      </h6>
                      <p>
                        <label>{statusText}</label>
                      </p>
                    </div>

                    {/* <div className="punch-info">
                      <div className="punch-hours"> */}
                    {/* <span>{isCheckedOut ? formatHoursMinutes(checkOut.hoursWorked) : "--"}</span> */}
                    {/* <span>{isCheckedOut ? formatHoursMinutes(parseFloat(checkOut.hoursWorked) * 60) : "--"}</span> */}
                    {/* <label>
                          {isDisabled ? (
                            <Spin size="large" />
                          ) : isCheckedOut ? (
                            formatHoursMinutes(checkOut.hoursWorked)
                          ) : (
                            "--"
                          )}
                        </label>
                      </div>
                    </div> */}

                    <div className="punch-info">
                      <div className="punch-hours">
                        <label>
                          {isDisabled ? (
                            <Spin size="large" />
                          ) : isCheckedOut ? (
                            formatHoursMinutes(checkOut.hoursWorked)
                          ) : (
                            formatElapsedTime(elapsedTime) // Create a function to format elapsed time
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="punch-btn-section">
                      <button
                        type="button"
                        className={`btn btn-${
                          isCheckedOut || checkIn.status === "Absent" || checkIn.status === "Holiday"
                            ? "success"
                            : isCheckedIn
                            ? "danger"
                            : "primary"
                        } punch-btn`}
                        onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                        disabled={
                          isCheckedOut ||
                          checkIn.status === "Absent" ||
                          checkIn.status === "On-Leave" ||
                          checkIn.status === "Holiday" ||
                          isDisabled
                        }
                      >
                        {isDisabled ? (
                          <Spin size="medium" />
                        ) : isCheckedOut || checkIn.status === "Absent" || checkIn.status === "Holiday" ? (
                          "Marked"
                        ) : isCheckedIn ? (
                          "Check Out"
                        ) : (
                          "Check In"
                        )}
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

                            <h6>
                              <label
                                style={{
                                  color:
                                    checkIn.status === "Late"
                                      ? "red"
                                      : checkIn.status === "Absent"
                                      ? "red"
                                      : checkIn.status === "Present"
                                      ? "green"
                                      : checkIn.status === "On-Leave"
                                      ? "orange"
                                      : checkIn.status === "Holiday"
                                      ? "blue"
                                      : "black",
                                }}
                              >
                                {isCheckedIn ||
                                isCheckedOut ||
                                checkIn.status === "Absent" ||
                                checkIn.status === "On-Leave" ||
                                checkIn.status === "Holiday"
                                  ? checkIn.status
                                  : "--"}
                              </label>
                            </h6>
                          </div>
                        </div>

                        <div className="col-md-6 col-6 text-center">
                          <div className="stats-box">
                            <p>Overtime</p>

                            <h6>
                              <label>
                                {isCheckedOut
                                  ? formatHoursMinutes(checkOut.overTime)
                                  : "--"}
                              </label>
                            </h6>
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
                    <div className="stats-list" style={{ height: "347px" }}>
                      <div className="stats-info">
                        <p>
                          Today{" "}
                          <strong>
                            {isCheckedOut
                              ? formatHoursMinutes(checkOut.hoursWorked)
                              : formatTodayTime(
                                  elapsedTime
                                ) // Create a function to format elapsed time
                            }{" "}
                            <small>/ {formatHoursMinutes(Math.floor(shiftDuration))}</small>
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: `${percentageCompleted}%` }}
                            aria-valuenow={percentageCompleted}
                            aria-valuemin={0}
                            aria-valuemax={shiftDuration}
                          />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>
                          <label>This Week</label>
                          <strong>
                            {formatHoursMinutes(stats.lastWeek)}{" "}
                            <small>/ {formatHoursMinutes(Math.floor(shiftDuration*5))}</small>
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-warning"
                            role="progressbar"
                            style={{
                              width: `${
                                (parseFloat(stats.lastWeek) / (shiftDuration*5)) * 100
                              }%`,
                            }}
                            aria-valuenow={parseFloat(stats.lastWeek)}
                            aria-valuemin={0}
                            aria-valuemax={(shiftDuration*5)}
                          />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>
                          <label>This Month</label>
                          <strong>
                            {formatHoursMinutes(stats.lastMonth)}{" "}
                            <small>/ {formatHoursMinutes(Math.floor(shiftDuration*22))}</small>
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{
                              width: `${
                                (parseFloat(stats.lastMonth) / (shiftDuration*22)) * 100
                              }%`,
                            }}
                            aria-valuenow={parseFloat(stats.lastMonth)}
                            aria-valuemin={0}
                            aria-valuemax={(shiftDuration*22)}
                          />
                        </div>
                      </div>

                      <div className="stats-info">
                        <p>
                          Remaining{" "}
                          <strong>
                            {formatHoursMinutes(
                              Math.floor((shiftDuration*22) - parseFloat(stats.lastMonth))
                            )}{" "}
                            <small>/ {formatHoursMinutes(Math.floor(shiftDuration*22))}</small>
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-danger"
                            role="progressbar"
                            style={{
                              width: `${
                                (((shiftDuration*22) - parseFloat(stats.lastMonth)) /
                                (shiftDuration*22)) *
                                100
                              }%`,
                            }}
                            aria-valuenow={
                              100 * 60 - parseFloat(stats.lastMonth)
                            }
                            aria-valuemin={0}
                            aria-valuemax={100 * 60}
                          />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>
                          Overtime{" "}
                          <strong>
                            {isCheckedOut
                            ? formatHoursMinutes(checkOut.overTime)
                            : "None"}
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-info"
                            role="progressbar"
                            style={{
                              width: `${checkOut.overTime
                                ? 100
                                : 0}%`,
                            }}
                            aria-valuenow={checkOut.overTime
                              ? 100
                              : 0}
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
                {/* <div className="card recent-activity">
                  <div className="card-body">
                    <h5 className="card-title">Last 6 days</h5>
                    <div className="stats-list" style={{ height: "347px" }}>
                      <ul className="res-activity-list">
                        <li>
                          <p className="mb-0">
                            <label>Check In at</label>
                          </p>
                          <p className="res-activity-time">
                            <i className="fa fa-clock-o" />
                            <label>10.00 AM.</label>
                            <i className="fa fa-clock-o" />
                            <label>10.00 AM.</label>
                            <i className="fa fa-clock-o" />
                            <label>Absent</label>
                          </p>
                        </li>
                        <li>
                          <p className="mb-0">
                            <label>Check Out at</label>
                          </p>
                          <p className="res-activity-time">
                            <i className="fa fa-clock-o" />
                            <label>11.00 AM.</label>
                            <i className="fa fa-clock-o" />
                            <label>11.00 AM.</label>
                            <i className="fa fa-clock-o" />
                            <label>Absent</label>
                          </p>
                        </li>
                        <li>
                          <p className="mb-0">
                            <label>Check In at</label>
                          </p>
                          <p className="res-activity-time">
                            <i className="fa fa-clock-o" />
                            <label>11.15 AM.</label>
                            <i className="fa fa-clock-o" />
                            <label>11.15 AM.</label>
                            <i className="fa fa-clock-o" />
                            <label>Absent</label>
                          </p>
                        </li>
                        <li>
                          <p className="mb-0">
                            <label>Check Out at</label>
                          </p>
                          <p className="res-activity-time">
                            <i className="fa fa-clock-o" />
                            <label>1.30 PM.</label>
                            <i className="fa fa-clock-o" />
                            <label>1.30 PM.</label>
                            <i className="fa fa-clock-o" />
                            <label>Absent</label>
                          </p>
                        </li>
                        <li>
                          <p className="mb-0">
                            <label>Check In at</label>
                          </p>
                          <p className="res-activity-time">
                            <i className="fa fa-clock-o" />
                            <label htmlFor="">2.00 PM.</label>
                            <i className="fa fa-clock-o" />
                            <label htmlFor="">2.00 PM.</label>
                            <i className="fa fa-clock-o" />
                            <label>Absent</label>
                          </p>
                        </li>
                        <li>
                          <p className="mb-0">
                            <label>Check Out at</label>
                          </p>
                          <p className="res-activity-time">
                            <i className="fa fa-clock-o" />
                            <label>7.30 PM.</label>
                            <i className="fa fa-clock-o" />
                            <label>7.30 PM.</label>
                            <i className="fa fa-clock-o" />
                            <label>Absent</label>
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div> */}
                <div className="card recent-activity">
                  <div className="card-body">
                    <h5 className="card-title">Last 6 Days</h5>
                    <div className="stats-list" style={{ height: "347px" }}>
                      <ul
                        className="res-activity-list"
                        style={{ marginRight: "10px" }}
                      >
                        {fetchattend6?.slice(0, 6).map((attendance, index) => (
                          <li key={index}>
                            <p className="mb-0">
                              <label>
                                {moment(attendance.attendanceDate).format(
                                  "ddd, Do MMM YYYY"
                                )}
                              </label>
                            </p>
                            <p
                              className="res-activity-time"
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                              }}
                            >
                              {attendance.checkInTime ? (
                                <a>
                                  <i className="fa fa-clock-o" />{" "}
                                  <label>
                                    {attendance.checkInTime
                                      ? moment(
                                          attendance.checkInTime,
                                          "HH:mm"
                                        ).format("h:mm A")
                                      : "--"}
                                  </label>
                                </a>
                              ) : (
                                ""
                              )}

                              {attendance.checkInTime ? (
                                <a>
                                  <i className="fa fa-clock-o" />{" "}
                                  <label>
                                    {attendance.checkOutTime
                                      ? moment(
                                          attendance.checkOutTime,
                                          "HH:mm"
                                        ).format("h:mm A")
                                      : "--"}
                                  </label>
                                </a>
                              ) : (
                                ""
                              )}

                              <a>
                                <span>Status:</span>{" "}
                                <label
                                  style={{
                                    color:
                                      attendance.status === "Late" ||
                                      attendance.status === "Absent"
                                        ? "red"
                                        : attendance.status === "Present"
                                        ? "green"
                                        : attendance.status === "On-Leave"
                                        ? "orange"
                                        : attendance.status === "Holiday"
                                        ? "blue"
                                        : "black",
                                  }}
                                >
                                  {attendance.status}
                                </label>
                              </a>
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Filter */}

            <Form form={form}>
              <div className="row filter-row">
                <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <Form.Item name="date">
                      <DatePicker
                        className="form-control"
                        onChange={(date, dateString) =>
                          handleFilterChange(dateString, "date")
                        }
                        allowClear={false}
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <Form.Item name="month" className="custom-border">
                      <DatePicker.MonthPicker
                        className="form-control"
                        style={{
                          width: "100%",
                        }}
                        placeholder="Select Month"
                        allowClear={false}
                        format="MMMM"
                        size="large"
                        onChange={(date, dateString) =>
                          handleFilterChange(dateString, "month")
                        }
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <Form.Item name="year" className="custom-border">
                      <DatePicker.YearPicker
                        className="form-control"
                        style={{
                          width: "100%",
                        }}
                        placeholder="Select Year"
                        allowClear={false}
                        size="large"
                        onChange={(date, dateString) =>
                          handleFilterChange(dateString, "year")
                        }
                      />
                    </Form.Item>
                  </div>
                </div>

                <div
                  className="col-sm-6 col-md-3"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "13px",
                  }}
                >
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
                    style={{
                      backgroundColor: "#616161",
                      borderColor: "#616161",
                    }}
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
                    loading={tableLoader}
                    columns={columns}
                    locale={{
                      emptyText: isLoading ? (
                        <Spin size="large" tip="Loading..." />
                      ) : (
                        customEmptyText
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
                        setdisableAttend(false);
                        setPagination({
                          ...pagination,
                          current: page,
                          pageSize: pageSize,
                        });
                      },
                      itemRender: itemRender,
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
