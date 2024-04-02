import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Offcanvas from "../../../Entryfile/offcanvance";
import Header from "../../../initialpage/Sidebar/header";
import Sidebar from "../../../initialpage/Sidebar/sidebar";
import moment from "moment";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import { Empty, Pagination, message } from "antd";
// import InfiniteScroll from "react-infinite-scroll-component";
import { ItemRender } from "antd/lib/upload/interface";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { Table, Form, Input, DatePicker, Select, Button, Spin } from "antd";
import { itemRender } from "../../paginationfunction";
import { useTranslation } from "react-i18next";

const AttendanceEmployee = () => {
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [tableLoader, setTableLoader] = useState(false);
  const [Bdisbale, setBdisbale] = useState(false);
  const [statDisable, setstatDisable] = useState(false);
  const [disableAttend, setdisableAttend] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const isDisabled = !Bdisbale;

  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role;

  let AuthObj = JSON.parse(localStorage.getItem("AuthObj"));
  let userID = AuthObj?.userId;

  const [menu, setMenu] = useState(false);
  const [statusText, setStatusText] = useState(t('notCheckedIn'));
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [firstload, setFirstLoad] = useState(false);

  const [timer, setTimer] = useState(null);
  const [multiple, setMultiple] = useState([]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [elapse, setElapse] = useState(0);
  const [shiftStartTime, setShiftStartTime] = useState('');
  const [shiftEndTime, setShiftEndTime] = useState('');
  const [shiftDuration, setShiftDuration] = useState(0);

  const [checkIn, setCheckIn] = useState({
    attendanceId: "",
    attendanceRecordId: "",
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
    pageSize: 20,
    total: 0,
  });

  const toggleMobileMenu = () => {
    setMenu(!menu);
  };

  const [stats, setStats] = useState({
    lastWeek: 0, // Set initial values as needed
    lastMonth: 0, // Set initial values as needed
    endTime: "", // Set initial values as needed
  });
  const [attendanceData, setAttendanceData] = useState(null);

  const moment = require("moment");
  let nowdate = new Date(Date.now());

  const firstDate = moment(nowdate).format("YYYY-MM-DD");
  //const firstDate = "2023-08-10"
  
  useEffect(() => {
    // Update direction when language changes
    document.documentElement.dir = i18n.dir();
  }, [i18n.language]);
  
  useEffect(() => {
    if (!disableAttend) {
      setTableLoader(true);

      fetchattendance();
    }
  }, [filters, pagination.current, pagination.pageSize, checkIn, checkOut]);

  useEffect(() => {
    setTableLoader(true);
    //setIsLoading(true);
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
          const aData = res?.data?.Attendance?.docs;
          setAttendanceData(attendanceData);
          const { shiftId } = res?.data?.user;
          const shiftStartTime = shiftId.startTime;
          const shiftEndTime = shiftId.endTime;
          //const array = aData?.attendanceRecords
          //console.log(array)
          const len1 = aData?.map((a)=>{
            return a?.attendanceRecords?.length
          });
          const len = len1[0];
          console.log("aData",aData)
          const records = aData?.map((a)=>{
            const len = a?.attendanceRecords?.length
            return a?.attendanceRecords[len-1]
          })
          let elp = 0
          const multipleArray = aData?.map((a)=>{
            setElapsedTime((a?.hoursWorked)*60000)
            console.log((a?.hoursWorked)*60000)
            elp = (a?.hoursWorked)*60000
            setMultiple(a?.attendanceRecords)
            //return a?.attendanceRecords
          })
          //setMultiple();
          const attendanceRecord = records[0]
          console.log("this is",records)
          // Calculate shift duration
          const shiftStart = moment(shiftStartTime, 'HH:mm:ss');
          const shiftEnd = moment(shiftEndTime, 'HH:mm:ss');
          const shiftDuration = moment.duration(shiftEnd.diff(shiftStart)).asMinutes();
          setStats({
            lastWeek: res.data.lastWeek,
            lastMonth: res.data.lastMonth,
            endTime: res.data.user.shiftId.endTime,
          });
          setShiftDuration(shiftDuration)

          const timeParts = res?.data?.user?.shiftId?.endTime?.split(":");
          const hours = parseInt(timeParts[0], 10);
          const minutes = parseInt(timeParts[1], 10);
          const seconds = parseInt(timeParts[2], 10);

          // Calculate total milliseconds
          const milliseconds = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
          setShiftEndTime(milliseconds);

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
            if (attendanceRecord?.checkInTime) {
              const checkInTime = attendanceRecord?.checkInTime;
              console.log("this is checkIn time")
              const [hours, minutes] = checkInTime.split(":").map(Number);
              const currentTime = new Date();
              const startTime = new Date(
                currentTime.getFullYear(),
                currentTime.getMonth(),
                currentTime.getDate(),
                hours,
                minutes
              );
              if (attendanceRecord?.checkOutTime) {
                const checkOutTime = attendanceRecord?.checkOutTime;
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
                setElapse(newElapsedTime);
              } else {
                let newElapsedTime = Date.now() - startTime.getTime();
                // Start the timer only if it's a check-in
                startTimer(startTime, elp);
                // Set the elapsed time
                setElapsedTime((prev)=> prev + newElapsedTime);
              }
            }

            //console.log("First Attendance Record:", firstAttendanceRecord);
            //console.log(firstAttendanceRecord.checkInTime);

            if (attendanceRecord?.checkOutTime) {
              //setIsCheckedOut(true);
              setCheckout({
                ...checkOut,
                //checkOutTime: firstAttendanceRecord?.checkOutTime,
                checkOutTime: attendanceRecord?.checkOutTime,
                hoursWorked: firstAttendanceRecord?.hoursWorked,
                overTime: firstAttendanceRecord?.overTime,
              });
              setIsCheckedOut(true);
              //setStatusText("Not yet checked in");
              setStatusText(`${moment(
                firstAttendanceRecord.attendanceDate
              ).format("ddd, Do MMM YYYY")} 
                                      ${moment(
                                        attendanceRecord?.checkOutTime,
                                        "HH:mm"
                                      ).format("h:mm A")}`);
            } else if (
              firstAttendanceRecord.status === "Absent" ||
              firstAttendanceRecord.status === "On-Leave" ||
              firstAttendanceRecord.status === "Holiday"
            ) {
              setIsCheckedIn(false);
              setIsCheckedOut(false);
              setStatusText(t('notCheckedIn'));
            } else {
              setIsCheckedIn(true);
              setIsCheckedOut(false);
              setStatusText(`${moment(
                firstAttendanceRecord.attendanceDate
              ).format("ddd, Do MMM YYYY")} 
                                      ${moment(
                                        attendanceRecord?.checkInTime,
                                        "HH:mm"
                                      ).format("h:mm A")}`);
            }
            setCheckIn({
              ...checkIn,
              attendanceId: firstAttendanceRecord?._id,
              attendanceRecordId: attendanceRecord?._id,
              checkInTime: attendanceRecord?.checkInTime,
              attendanceDate: firstAttendanceRecord?.attendanceDate,
              status: firstAttendanceRecord?.status,
            });
          }
        }
      })
      .catch((error) => {
        console.log("error", error);
      })
      .finally(() => {
        setTableLoader(false);
        //setIsLoading(false);
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
        setStatusText(t('loading'));
      }
    } else {
      setStatusText(t('notCheckedIn'));
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

  const startTimer = (ftime, elp) => {
    if (ftime) {
      //console.log("first time",ftime)
      //const startTime = Date.now() - elapsedTime;
      const newTimer = setInterval(() => {
        const newElapsedTime = Date.now() - ftime.getTime() + elp;
        const stat = Date.now() - ftime.getTime()
        setElapsedTime(newElapsedTime);
        setElapse(stat)
      }, 1000); // Update every second (1000 milliseconds)
      setTimer(newTimer);
    } else {
      console.log(elapsedTime)
      const startTime = Date.now() - elapsedTime;
      const newT = Date.now() - elapse;
      const newTimer = setInterval(() => {
        const newElapsedTime = Date.now() - startTime;
        const ElapseTime = Date.now() - newT;
        setElapse(ElapseTime);
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
  const WWorkTime = ((shiftDuration*5)/60) * 60 * 60 * 1000;
  const MWorkTime = ((shiftDuration*22)/60) * 60 * 60 * 1000;

  const percentageCompleted = (elapsedTime / totalWorkTime) * 100;
  const percentageweek = ((elapse + (stats?.lastWeek * 60000)) / WWorkTime) * 100;
  const percentagemonth = ((elapse + (stats?.lastMonth * 60000)) / MWorkTime) * 100;

  const formatElapsedTime = (milliseconds) => {
    if (!milliseconds) return "--";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const formatTodayTime = (milliseconds) => {
    if (!milliseconds) return t('none');

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
            const len = res?.data?.Attendance?.attendanceRecords?.length
            const attendanceRecord =  res?.data?.Attendance?.attendanceRecords[len-1]
            console.log("this is",len)
            setMultiple(res?.data?.Attendance?.attendanceRecords)
            startTimer();
            message.success(t('checkInSuccess'));
            setFirstLoad(false);
            setCheckIn({
              ...checkIn,
              attendanceId: res?.data?.Attendance?._id,
              attendanceRecordId: attendanceRecord?._id,
              checkInTime: attendanceRecord?.checkInTime,
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
                : t('attendanceError')
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
          attendanceRecordId: checkIn?.attendanceRecordId,
          checkOutTime: checkOutTime,
        },
        user_state
      )
        .then((res) => {
          if (res.data.success === true) {
            stopTimer();
            setMultiple(res?.data?.Attendance?.attendanceRecords)
            console.log(res?.data?.Attendance?.attendanceRecords)
            message.success(t('attendanceMarked'));
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
                : t('attendanceError')
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
          setstatDisable(true);
        });
    } catch (error) {
      console.log("error", error);
    }
  };

  const currentDate = moment(nowdate).format("DD MMM YYYY");

  const formatHoursMinutes = (timeString) => {
    if (!timeString) return t('none');
    if (isNaN(timeString)) return "0h 0m";

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
          //console.log(attendanceData);
          setStats({
            lastWeek: res.data.lastWeek,
            lastMonth: res.data.lastMonth,
            endTime: res.data.user.shiftId.endTime,
          });

          const timeParts = res?.data?.user?.shiftId?.endTime?.split(":");
          const hours = parseInt(timeParts[0], 10);
          const minutes = parseInt(timeParts[1], 10);
          const seconds = parseInt(timeParts[2], 10);

          // Calculate total milliseconds
          const milliseconds = (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
          setShiftEndTime(milliseconds);

          if (!firstload) {
            setFetchattend6(attendanceData);
          }
          setFetchattend(attendanceData);
          setPage(parseInt(res?.data?.Attendance?.page, 10));
          setSize(parseInt(res?.data?.Attendance?.limit, 10));
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
        //setIsLoading(false);
        setTableLoader(false);
        setstatDisable(false);
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
            {t('noData')}
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
        (page - 1) * size + index + 1,
    },
    {
      title: t('date'),
      dataIndex: "attendanceDate",
      key: "attendanceDate",
    },
    {
      title: t('checkIn'),
      dataIndex: "attendanceRecords",
      key: "checkInTime",
      render: (attendanceRecords, record) => {
        if (attendanceRecords && attendanceRecords?.length > 0) {
        const firstRecord = attendanceRecords[0];
        const checkInTime = firstRecord ? firstRecord.checkInTime : null;
        return checkInTime ? moment(checkInTime, "HH:mm").format("h:mm A") : "--";
        }else {
          return record?.checkInTime ? moment(record?.checkInTime, "HH:mm").format("h:mm A") : "--";
        }
      }
    },
    {
      title: t('checkOut'),
      dataIndex: "attendanceRecords",
      key: "checkOutTime",
      render: (attendanceRecords, record) => {
        if (attendanceRecords && attendanceRecords?.length > 0) {
        const latestRecord = attendanceRecords[attendanceRecords.length - 1];
        const checkOutTime = latestRecord ? latestRecord.checkOutTime : null;
        return checkOutTime ? moment(checkOutTime, "HH:mm").format("h:mm A") : "--";
      } else {
        return record.checkOutTime ? moment(record.checkOutTime, "HH:mm").format("h:mm A") : "--";
      }
      }
    },
    {
      title: t('status'),
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
          {status==="Present" ? t('present') : status==="Late" ? t('late') : status==="On-Leave" ? t('on-Leave') : status==="Holiday" ? t('holiDay') : status==="Absent" ? t('absent') : status}
        </span>
      ),
    },
    {
      title: t('duration'),
      dataIndex: "hoursWorked",
      key: "hoursWorked",
      render: (hoursWorked) => formatHoursMinutes(hoursWorked),
    },
    {
      title: t('overtime'),
      dataIndex: "overTime",
      key: "overTime",
      render: (overTime) => (overTime ? formatHoursMinutes(overTime) : "None"),
    },
  ];

  const dayEnd = "23:59:59";

  const [hours, minutes, seconds] = dayEnd.split(':').map(Number);
  const absolutetime = ((hours * 60 * 60 + minutes * 60 + seconds) * 1000) - shiftEndTime;
  //console.log(absolutetime);

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentSeconds = now.getSeconds();

  const currentTimeInMilliseconds =
  currentHours * 60 * 60 * 1000 +
  currentMinutes * 60 * 1000 +
  currentSeconds * 1000;

  let liveOvertime = 0;

  if (!isCheckedOut && isCheckedIn && currentTimeInMilliseconds > shiftEndTime) {
    liveOvertime = currentTimeInMilliseconds - shiftEndTime;
  }

  return (
    <>
      <div className={`main-wrapper ${menu ? "slide-nav" : ""}`}>
        <div className="page-wrapper">
          <Helmet>
            <title>{t('aAttend.pageTitle')}</title>
            <meta name="description" content="Login page" />
          </Helmet>
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <h3 className="page-title">{t('attendance')}</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link
                        to={
                          role === "admin"
                            ? "/main/dashboard"
                            : "/employee/dashboard"
                        }
                      >
                        {t('dashboard')}
                      </Link>
                    </li>
                    <li className="breadcrumb-item active">{t('attendance')}</li>
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
                    {t('timesheet')}
                      <h5 className="text-muted" style={{ fontSize: "20px", unicodeBidi:'plaintext' }}>
                        {currentDate}
                      </h5>
                    </h5>

                    <div className="punch-det">
                      <h6>
                        <label>
                          {isCheckedOut ? t('checkedOutAt') : t('checkInAt')}
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
                        className={`btn btn-${checkIn.status === "Absent" || checkIn.status === "Holiday"
                            ? "success"
                            : isCheckedIn
                            ? "danger"
                            : "primary"
                        } punch-btn`}
                        onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                        disabled={
                          checkIn.status === "Absent" ||
                          checkIn.status === "On-Leave" ||
                          checkIn.status === "Holiday" ||
                          isDisabled
                        }
                      >
                        {isDisabled ? (
                          <Spin size="medium" />
                        ) : checkIn.status === "Absent" || checkIn.status === "Holiday" ? (
                          t('marked')
                        ) : isCheckedIn ? (
                          t('checkOut')
                        ) : (
                          t('checkIn')
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
                            <p>{t('status')}</p>

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
                                  ? (checkIn.status==="Present" ? t('present') : checkIn.status==="Late" ? t('late') : checkIn.status==="On-Leave" ? t('on-Leave') : checkIn.status==="Holiday" ? t('holiDay') : checkIn.status==="Absent" ? t('absent') : checkIn.status)
                                  : "--"}
                              </label>
                            </h6>
                          </div>
                        </div>

                        <div className="col-md-6 col-6 text-center">
                          <div className="stats-box">
                            <p>{t('overtime')}</p>

                            <h6>
                              <label>
                                {isCheckedOut
                                  ? formatHoursMinutes(checkOut.overTime)
                                  : formatTodayTime(liveOvertime)}
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
                    <h5 className="card-title">{t('statistics')}</h5>
                    <div className="stats-list" style={{ height: "347px" }}>
                      <div className="stats-info">
                        <p>
                        {t('today')}{" "}
                          <strong style={{direction:"ltr"}}>
                            {isCheckedOut
                              ? formatHoursMinutes(checkOut.hoursWorked)
                              : formatTodayTime(
                                  elapsedTime
                                ) // Create a function to format elapsed time
                            }{" "}
                            <small style={{unicodeBidi:'plaintext'}}>/ {formatHoursMinutes(Math.floor(shiftDuration))}</small>
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
                          <label>{t('thisWeek')}</label>
                          <strong style={{direction:"ltr"}}>
                            {isCheckedOut
                              ? ( !statDisable ? 
                                formatHoursMinutes(stats.lastWeek) 
                                : formatTodayTime((elapse + (stats.lastWeek * 60000))))
                              : formatTodayTime(
                                  (elapse + (stats.lastWeek * 60000))
                                ) // Create a function to format elapsed time
                            }{" "}
                            {/* {formatHoursMinutes(stats.lastWeek)}{" "} */}
                            <small style={{unicodeBidi:'plaintext'}}>/ {formatHoursMinutes(Math.floor(shiftDuration*5))}</small>
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-warning"
                            role="progressbar"
                            style={{
                              width: `${
                                isCheckedOut ? ( !statDisable ? ((parseFloat(stats.lastWeek) / (shiftDuration*5)) * 100) : percentageweek) : percentageweek
                              }%`,
                            }}
                            aria-valuenow={isCheckedOut ? ( !statDisable ? ((parseFloat(stats.lastWeek) / (shiftDuration*5)) * 100) : percentageweek) : percentageweek}
                            aria-valuemin={0}
                            aria-valuemax={(shiftDuration*5)}
                          />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>
                          <label>{t('thisMonth')}</label>
                          <strong style={{direction:"ltr"}}>
                          {isCheckedOut
                              ? ( !statDisable ? 
                                formatHoursMinutes(stats.lastMonth) 
                                : formatTodayTime((elapse + (stats.lastMonth * 60000))))
                              //? formatHoursMinutes(stats.lastMonth)
                              : formatTodayTime(
                                (elapse + (stats?.lastMonth * 60000))
                                ) // Create a function to format elapsed time
                            }{" "}
                            {/* {formatHoursMinutes(stats.lastMonth)}{" "} */}
                            <small style={{unicodeBidi:'plaintext'}}>/ {formatHoursMinutes(Math.floor(shiftDuration*22))}</small>
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{
                              width: `${
                                isCheckedOut ? ( !statDisable ? ((parseFloat(stats.lastMonth) / (shiftDuration*22)) * 100) : percentagemonth) : percentagemonth
                              }%`,
                            }}
                            aria-valuenow={isCheckedOut ? ( !statDisable ? ((parseFloat(stats.lastMonth) / (shiftDuration*22)) * 100) : percentagemonth) : percentagemonth}
                            aria-valuemin={0}
                            aria-valuemax={(shiftDuration*22)}
                          />
                        </div>
                      </div>

                      <div className="stats-info">
                        <p>
                        {t('remaining')}{" "}
                          <strong style={{direction:"ltr"}}>
                          {isCheckedOut
                              ? ( !statDisable ? 
                                formatHoursMinutes(Math.max(0, Math.floor((shiftDuration*22) - parseFloat(stats.lastMonth))))
                                : formatHoursMinutes(
                                  Math.max(0, Math.ceil((shiftDuration*22) - parseFloat(((elapse/60000)+stats.lastMonth))))
                                )
                                )
                              // formatHoursMinutes(
                              //   Math.floor((shiftDuration*22) - parseFloat(stats.lastMonth))
                              // )
                              : formatHoursMinutes(
                                Math.max(0, Math.ceil((shiftDuration*22) - parseFloat(((elapse/60000)+stats.lastMonth))))
                              ) // Create a function to format elapsed time
                            }{" "}
                            {/* {formatHoursMinutes(
                              Math.floor((shiftDuration*22) - parseFloat(stats.lastMonth))
                            )}{" "} */}
                            <small style={{unicodeBidi:'plaintext'}}>/ {formatHoursMinutes(Math.floor(shiftDuration*22))}</small>
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-danger"
                            role="progressbar"
                            style={{
                              width: `${
                                isCheckedOut ? ( !statDisable ? ((((shiftDuration*22) - parseFloat(stats.lastMonth)) /
                                (shiftDuration*22)) *
                                100) : ((((shiftDuration*22) - parseFloat(stats.lastMonth + (elapse/60000))) /
                                (shiftDuration*22)) *
                                100)) : ((((shiftDuration*22) - parseFloat(stats.lastMonth + (elapse/60000))) /
                                (shiftDuration*22)) *
                                100)
                              }%`,
                            }}
                            aria-valuenow={
                              isCheckedOut ? ( !statDisable ? ((((shiftDuration*22) - parseFloat(stats.lastMonth)) /
                                (shiftDuration*22)) *
                                100) : ((((shiftDuration*22) - parseFloat(stats.lastMonth + (elapse/60000))) /
                                (shiftDuration*22)) *
                                100)) : ((((shiftDuration*22) - parseFloat(stats.lastMonth + (elapse/60000))) /
                                (shiftDuration*22)) *
                                100)
                            }
                            aria-valuemin={0}
                            aria-valuemax={(shiftDuration*22)}
                          />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>
                        {t('overtime')}{" "}
                          <strong>
                            {isCheckedOut
                            ? formatHoursMinutes(checkOut.overTime)
                            : formatTodayTime(liveOvertime)}
                          </strong>
                        </p>
                        <div className="progress">
                          <div
                            className="progress-bar bg-info"
                            role="progressbar"
                            style={{
                              width: `${
                                isCheckedOut 
                                ? (checkOut.overTime
                                  ? ((checkOut.overTime*60000)/absolutetime)*100
                                  : 0) 
                                : ((!isCheckedOut && isCheckedIn && currentTimeInMilliseconds > shiftEndTime) ? (liveOvertime/absolutetime)*100 : 0)
                              }%`,
                            }}
                            aria-valuenow={
                              isCheckedOut 
                              ? (checkOut.overTime
                                ? ((checkOut.overTime*60000)/absolutetime)*100
                                : 0) 
                              : ((!isCheckedOut && isCheckedIn && currentTimeInMilliseconds > shiftEndTime) ? (liveOvertime/absolutetime)*100 : 0)
                            }
                            aria-valuemin={0}
                            aria-valuemax={absolutetime}
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
                    <h5 className="card-title">Today's Activity</h5>
                    <div className="stats-list" style={{ height: "347px",overflowY: "auto" }}>
                      <p className="mb-0"
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}>
                          <label
                          style={{paddingLeft:'29px'}}>
                            CheckIn:
                          </label>
                          <label
                          style={{paddingRight:'11px',paddingLeft:'20px'}}>
                            CheckOut:
                          </label>
                          <label
                          style={{paddingRight:'19px'}}>
                            Duration:
                          </label>
                        </p>
                        {multiple?.slice().reverse().map((attendance, index) => (
                          <ul
                          className="res-activity-list"
                          style={{ 
                            marginRight: (i18n.dir() === 'rtl') ? "unset" : "10px", 
                            marginLeft: (i18n.dir() === 'rtl') ? "10px" : "unset",
                            
                           }}
                        >
                          <li key={index}>
                            <p
                              className="res-activity-time"
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                              }}
                            >
                              {attendance.checkInTime ? (
                                <a style={{width:'75px', textAlign:'left'}}>
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
                                <a style={{width:'70px', textAlign:'left'}}>
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

                              <a style={{paddingLeft:'9px',width:'75px', textAlign:'left'}}>
                                <label>
                                  {(!attendance?.checkInTime && !attendance?.checkOutTime) ? "" : formatHoursMinutes(attendance?.hoursWorked)}
                                </label>
                              </a>
                            </p>
                          </li>
                          
                      </ul>
                        ))}
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
                        placeholder={t('requests.addModal.selectDate')}
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
                        placeholder={t('aAttend.selectMonth')}
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
                        placeholder={t('aAttend.selectYear')}
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
                    {t('search')}
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
                    {t('reset')}
                  </Button>
                </div>
              </div>
            </Form>
            {/* /Search Filter */}

            <div className="row">
              <div className="col-lg-12">
                <div className="table-responsive">
                  <Table
                    className="table-striped"
                    dataSource={fetchattend}
                    loading={tableLoader}
                    columns={columns}
                    locale={{
                      emptyText: tableLoader ? null : customEmptyText
                    }}
                    bordered
                    pagination={false}
                    components={i18n.dir()==="rtl" ?
                      {
                      header: {
                        cell: ({ children }) => <th style={{ textAlign: 'right' }}>{children}</th>,
                      },
                    } :
                    null
                    }
                    onRow={ i18n.dir()==="rtl" ?
                      (record, rowIndex) => {
                      return {
                        style: { textAlign: 'right' }, // Align table data to the right
                      };
                    } :
                    null
                    }
                  />
                </div>
                {
                    fetchattend?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showTotal={(total, range) =>
                          t('paginationShow', { range1: range[0], range2: range[1], total: total })
                          // `Showing ${range[0]} to ${range[1]} of ${total} entries`
                        }
                        pageSizeOptions={["20", "30", "40", "50"]}
                        showSizeChanger
                        onChange={(page, pageSize) => {
                          setdisableAttend(false) 
                          setPagination({...pagination, current: page, pageSize: pageSize,})
                        }}
                        itemRender={(current, type, originalElement) =>
                          itemRender(current, type, originalElement, t)
                        }
                        disabled={tableLoader}
                      />
                    </div>
                  }
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
