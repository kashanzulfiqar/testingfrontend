import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clockin, holidaycalendar } from "../../../Entryfile/imagepath.jsx";
//import { avatar1, avatar13, avatar16, avatar18, avatar19, avatar2, avatar20, avatar21, avatar23, avatar26, avatar4, avatar6, avatar8, clockin, employeeimg, holidaycalendar } from "../../../../../Routes/ImagePath";
import Chart from "react-apexcharts";
import { ArrowRightCircle } from "react-feather";
// import { FaBirthdayCake, FaThumbtack } from "react-icons/fa";
// import { GiPartyPopper } from "react-icons/gi";
import { user_icon } from "../../../Entryfile/imagepath.jsx";
import { apiServices } from "../../../Services/apiServices.js";
import { useTranslation } from "react-i18next";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import axios from "axios";
import { Spin, Table, Empty, DatePicker, message, Tooltip, Avatar } from "antd";
import { GiftOutlined, PushpinOutlined } from "@ant-design/icons";
import { Cake, Celebration, PushPin } from "@mui/icons-material";
import {
  joinNotificationRooms,
  subscribeToNewNotifications,
  subscribeToNotificationRefresh,
} from "../../../Services/socketClient";

const EmployeeDashboard = () => {
  const moment = require("moment");
  let nowdate = new Date(Date.now());
  const todayDate = moment(nowdate).format("dddd, DD MMM YYYY");
  const firstDate = moment(nowdate).format("YYYY-MM-DD");
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);

  const [employees, setEmployees] = useState([]);
  const [notifList, setNotifList] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [daysLoading, setDaysLoading] = useState(true);
  const [requestData, setRequestData] = useState([]);
  const [sevenDays, setSevenDays] = useState([]);
  const [tableData, setTableData] = useState([]);
  const userIdForSocket = user_state?.user?._id || user_state?.email;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);

  const [timer, setTimer] = useState(null);
  const [statDisable, setstatDisable] = useState(false);

  const [fetchattend, setFetchattend] = useState([]);
  const [fetchattend6, setFetchattend6] = useState([]);
  const [firstload, setFirstLoad] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [Bdisbale, setBdisbale] = useState(false);
  const [multiple, setMultiple] = useState([]);
  const [aStatus, setAStatus] = useState("");
  const [shiftDuration, setShiftDuration] = useState(0);
  const [shiftEndTime, setShiftEndTime] = useState("");
  const [elapse, setElapse] = useState(0);
  const [statusText, setStatusText] = useState(t("notCheckedIn"));
  const [disableAttend, setdisableAttend] = useState(false);

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
  const [stats, setStats] = useState({
    lastWeek: 0, // Set initial values as needed
    lastMonth: 0, // Set initial values as needed
    endTime: "", // Set initial values as needed
  });

  const isDisabled = !Bdisbale;

  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => {
    // Update direction when language changes
    document.documentElement.dir = i18n.dir();
  }, [i18n.language]);

  // useEffect(() => {
  //   if (!disableAttend) {
  //     // setTableLoader(true);

  //     fetchattendance();
  //   }
  // }, [checkIn, checkOut]);

  const notificationRouteMap = {
    task_comment: "/projects/tasks",
    task_assignment: "/projects/tasks",
    task_removal: "/projects/tasks",
  
    project_assignment: "/projects/project_dashboard",
    projectReminder: "/projects/project_dashboard",
    project_removal: "/projects/project_dashboard",
  
    taskboard_assigned: "/task-board",
    taskboard_removal: "/task-board",
  
    leave_status_change: "/employee/requests",
    payment_success: "/payroll/payslip",
    celebration: "/employee/dashboard",
  };

  const loadNotifications = () => {
    apiServices("GET", "notifications", null, user_state).then((res) => {
      if (res?.data?.success && res?.data?.data?.length > 0) {
        setNotifList(res.data.data);
      }
    });
  };

  const handleNotificationClick = (item) => {
    const route = notificationRouteMap[item.type];
    if (route) {
      nav(route);
    }
  };

  useEffect(() => {
    if (!userIdForSocket) {
      return;
    }

    joinNotificationRooms({
      userId: userIdForSocket,
      companyId: user_state?.user?.companyId,
    });

    const unsubscribe = subscribeToNewNotifications((notification) => {
      if (!notification) {
        return;
      }

      setNotifList((prev) => {
        const alreadyExists = prev.some(
          (item) => item?._id === notification?._id
        );
        if (alreadyExists) {
          return prev.map((item) =>
            item?._id === notification?._id ? notification : item
          );
        }
        return [notification, ...prev];
      });
    });

    const unsubscribeRefresh = subscribeToNotificationRefresh(() => {
      loadNotifications();
    });

    return () => {
      unsubscribe();
      unsubscribeRefresh();
    };
  }, [userIdForSocket, user_state?.user?.companyId]);

  useEffect(() => {
    // setTableLoader(true);
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
          const aData = res?.data?.Attendance?.docs;
          setAttendanceData(attendanceData);
          const { shiftId } = res?.data?.user;
          const shiftStartTime = shiftId.startTime;
          const shiftEndTime = shiftId.endTime;
          //const array = aData?.attendanceRecords
          //console.log(array)
          const len1 = aData?.map((a) => {
            return a?.attendanceRecords?.length;
          });
          const len = len1[0];
          //console.log("aData",aData)
          const records = aData?.map((a) => {
            const len = a?.attendanceRecords?.length;
            return a?.attendanceRecords[len - 1];
          });
          let elp = 0;
          const multipleArray = aData?.map((a) => {
            setElapsedTime(a?.hoursWorked * 60000);
            //console.log((a?.hoursWorked)*60000)
            elp = a?.hoursWorked * 60000;
            setMultiple(a?.attendanceRecords);
            setAStatus(a?.status);
            //return a?.attendanceRecords
          });
          //setMultiple();
          const attendanceRecord = records[0];
          //console.log("this is",records)
          // Calculate shift duration
          const shiftStart = moment(shiftStartTime, "HH:mm:ss");
          const shiftEnd = moment(shiftEndTime, "HH:mm:ss");
          const shiftDuration = moment
            .duration(shiftEnd.diff(shiftStart))
            .asMinutes();
          setStats({
            lastWeek: res.data.lastWeek,
            lastMonth: res.data.lastMonth,
            endTime: res.data.user.shiftId.endTime,
          });
          setShiftDuration(shiftDuration);

          const timeParts = res?.data?.user?.shiftId?.endTime?.split(":");
          const hours = parseInt(timeParts[0], 10);
          const minutes = parseInt(timeParts[1], 10);
          const seconds = parseInt(timeParts[2], 10);

          // Calculate total milliseconds
          const milliseconds =
            (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
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
              //console.log("this is checkIn time")
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
                setElapsedTime((prev) => prev + newElapsedTime);
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
              setStatusText(t("notCheckedIn"));
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
        // setTableLoader(false);
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
        setStatusText(t("loading"));
      }
    } else {
      setStatusText(t("notCheckedIn"));
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
        const stat = Date.now() - ftime.getTime();
        setElapsedTime(newElapsedTime);
        setElapse(stat);
      }, 1000); // Update every second (1000 milliseconds)
      setTimer(newTimer);
    } else {
      //console.log(elapsedTime)
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

  const totalWorkTime = (shiftDuration / 60) * 60 * 60 * 1000;
  const WWorkTime = ((shiftDuration * 5) / 60) * 60 * 60 * 1000;
  const MWorkTime = ((shiftDuration * 22) / 60) * 60 * 60 * 1000;

  const percentageCompleted = (elapsedTime / totalWorkTime) * 100;
  const percentageweek = ((elapse + stats?.lastWeek * 60000) / WWorkTime) * 100;
  const percentagemonth =
    ((elapse + stats?.lastMonth * 60000) / MWorkTime) * 100;

  const getServerTimeFromAPI = async () => {
    const requestStartTime = Date.now();
    
    try {
      const response = await axios.get('https://api.timezonedb.com/v2.1/get-time-zone', {
        params: {
          key: 'VBQ3Q4HMILY9',
          format: 'xml',
          by: 'zone',
          zone: 'UTC'
        },
        timeout: 10000,
        headers: {
          'Accept': 'application/xml, text/xml, */*'
        }
      });
      
      const requestEndTime = Date.now();
      const networkLatency = requestEndTime - requestStartTime;
      
      let timestamp;
      
      if (typeof response.data === 'string') {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data, 'text/xml');
        const statusElement = xmlDoc.getElementsByTagName('status')[0];
        const timestampElement = xmlDoc.getElementsByTagName('timestamp')[0];
        
        if (statusElement && statusElement.textContent === 'OK' && timestampElement) {
          timestamp = parseInt(timestampElement.textContent);
        } else {
          throw new Error('Invalid response from time API');
        }
      } else if (response.data && response.data.status === 'OK' && response.data.timestamp) {
        timestamp = parseInt(response.data.timestamp);
      } else {
        throw new Error('Invalid response from time API');
      }
      
      if (timestamp) {
        const utcTimestamp = timestamp * 1000;
        const adjustedTime = new Date(utcTimestamp + (networkLatency / 2));
        return adjustedTime;
      }
      
      throw new Error('Invalid response from time API');
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Time verification request timed out. Please check your internet connection.');
      }
      if (error.message && !error.message.includes('Time verification')) {
        throw new Error('Unable to verify system time. Please check your internet connection and try again.');
      }
      throw error;
    }
  };

  const validateSystemTime = async () => {
    try {
      const serverTime = await getServerTimeFromAPI();
      const clientTime = new Date();
      const timeDifference = Math.abs(serverTime.getTime() - clientTime.getTime());
      const allowedDifference = 3 * 60 * 1000;
      
      if (timeDifference > allowedDifference) {
        const differenceMinutes = Math.floor(timeDifference / 60000);
        const differenceSeconds = Math.floor((timeDifference % 60000) / 1000);
        const serverTimeStr = moment(serverTime).format('YYYY-MM-DD HH:mm:ss');
        const clientTimeStr = moment(clientTime).format('YYYY-MM-DD HH:mm:ss');
        
        throw new Error(
          `System time is incorrect. Please synchronize your system clock.\n\n` +
          `Server time: ${serverTimeStr}\n` +
          `Your system time: ${clientTimeStr}\n` +
          `Difference: ${differenceMinutes} minutes ${differenceSeconds} seconds\n\n` +
          `Please update your system time settings to match the server time.`
        );
      }
      
      return true;
    } catch (error) {
      throw error;
    }
  };

  const getDeviceLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator || !navigator.geolocation) {
        return reject(new Error('Geolocation not supported'));
      }
      
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'denied') {
            return reject({ code: 1, message: 'Location permission denied' });
          }
          requestLocation();
        }).catch(() => {
          requestLocation();
        });
      } else {
        requestLocation();
      }
      
      function requestLocation() {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              deviceLatitude: pos.coords.latitude,
              deviceLongitude: pos.coords.longitude,
              deviceAccuracy: pos.coords.accuracy,
            });
          },
          (err) => {
            let errorMessage = 'Location permission denied or unavailable';
            if (err.code === 1) {
              errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            } else if (err.code === 2) {
              errorMessage = 'Location unavailable. Please check your GPS/network connection.';
            } else if (err.code === 3) {
              errorMessage = 'Location request timed out. Please try again.';
            }
            reject({ ...err, userMessage: errorMessage });
          },
          { 
            enableHighAccuracy: true, 
            timeout: 20000,
            maximumAge: 60000
          }
        );
      }
    });
  };

  const handleCheckIn = async () => {
    setBdisbale(false);
    const moment = require("moment");
    let datebn = new Date(Date.now());
    let checkInTime = moment(datebn).format("HH:mm");
    let attendanceDate = moment(datebn).format("YYYY-MM-DD");
    try {
      try {
        await validateSystemTime();
      } catch (timeError) {
        message.error(timeError.message || 'System time validation failed. Please synchronize your system clock.');
        setBdisbale(true);
        return;
      }

      let location;
      try {
        location = await getDeviceLocation();
      } catch (e) {
        const errorMessage = e?.userMessage || e?.message || t('locationPermissionDenied') || 'Location permission denied or unavailable';
        message.error(errorMessage);
        setBdisbale(true);
        return;
      }

      let data = {
        attendanceDate: attendanceDate,
        checkInTime: checkInTime,
        ...location,
      };
      apiServices("POST", "attendance/", data, user_state)
        .then((res) => {
          if (res.data.success === true) {
            const len = res?.data?.Attendance?.attendanceRecords?.length;
            const attendanceRecord =
              res?.data?.Attendance?.attendanceRecords[len - 1];
            //console.log("this is",len)
            setMultiple(res?.data?.Attendance?.attendanceRecords);
            setAStatus(res?.data?.Attendance?.status);
            startTimer();
            message.success(t("checkInSuccess"));
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
          setdisableAttend(false);
          setIsCheckedIn(true);
          setIsCheckedOut(false);
          fetchDays();
        })
        .catch((err) => {
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : t("attendanceError")
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

  const handleCheckOut = async () => {
    setBdisbale(false);
    const moment = require("moment");
    let datebn = new Date(Date.now());
    let checkOutTime = moment(datebn).format("HH:mm");

    try {
      try {
        await validateSystemTime();
      } catch (timeError) {
        message.error(timeError.message || 'System time validation failed. Please synchronize your system clock.');
        setBdisbale(true);
        return;
      }

      let location;
      try {
        location = await getDeviceLocation();
      } catch (e) {
        const errorMessage = e?.userMessage || e?.message || t('locationPermissionDenied') || 'Location permission denied or unavailable';
        message.error(errorMessage);
        setBdisbale(true);
        return;
      }
      apiServices(
        "PUT",
        `attendance/`,
        {
          _id: checkIn?.attendanceId,
          attendanceRecordId: checkIn?.attendanceRecordId,
          checkOutTime: checkOutTime,
          ...location,
        },
        user_state
      )
        .then((res) => {
          if (res.data.success === true) {
            stopTimer();
            setMultiple(res?.data?.Attendance?.attendanceRecords);
            setAStatus(res?.data?.Attendance?.status);
            //console.log(res?.data?.Attendance?.attendanceRecords)
            message.success(t("attendanceMarked"));
            setFirstLoad(false);
            setCheckout({
              ...checkOut,
              checkOutTime: checkOutTime,
              hoursWorked: res?.data?.Attendance?.hoursWorked,
              overTime: res?.data?.Attendance?.overTime,
            });
            setdisableAttend(false);
            fetchDays();
          }
        })
        .catch((err) => {
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : t("attendanceError")
            }`
          );
        })
        .finally(() => {
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
  // const fetchattendance = () => {
  //   apiServices("GET", `attendance/`, null, user_state)
  //     .then((res) => {
  //       if (res.data.success === true) {
  //         const attendanceData = res.data.Attendance.docs;
  //         //console.log(attendanceData);
  //         setStats({
  //           lastWeek: res.data.lastWeek,
  //           lastMonth: res.data.lastMonth,
  //           endTime: res.data.user.shiftId.endTime,
  //         });

  //         const timeParts = res?.data?.user?.shiftId?.endTime?.split(":");
  //         const hours = parseInt(timeParts[0], 10);
  //         const minutes = parseInt(timeParts[1], 10);
  //         const seconds = parseInt(timeParts[2], 10);

  //         // Calculate total milliseconds
  //         const milliseconds =
  //           (hours * 60 * 60 + minutes * 60 + seconds) * 1000;
  //         setShiftEndTime(milliseconds);

  //         if (!firstload) {
  //           setFetchattend6(attendanceData);
  //         }
  //         setFetchattend(attendanceData);
  //         setFirstLoad(true);
  //       }
  //     })
  //     .catch((error) => {
  //       console.log("error", error);
  //     })
  //     .finally(() => {
  //       setIsLoading(false);
  //       // setTableLoader(false);
  //       setstatDisable(false);
  //     });
  // };
  const formatTodayTime = (milliseconds) => {
    if (!milliseconds) return t("none");

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours} Hrs ${minutes} Min`;
  };

  const formatHoursMinutes = (timeString) => {
    if (!timeString) return t("none");
    if (isNaN(timeString)) return "0h 0m";

    const totalMinutes = parseFloat(timeString);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours} Hrs ${minutes} Min`;
  };

  const formatElapsedTime = (milliseconds) => {
    if (!milliseconds) return "--";

    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours} Hrs ${minutes} Min ${seconds} Sec`;
  };
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentSeconds = now.getSeconds();

  const currentTimeInMilliseconds =
    currentHours * 60 * 60 * 1000 +
    currentMinutes * 60 * 1000 +
    currentSeconds * 1000;

  let liveOvertime = 0;

  if (
    !isCheckedOut &&
    isCheckedIn &&
    currentTimeInMilliseconds > shiftEndTime
  ) {
    liveOvertime = currentTimeInMilliseconds - shiftEndTime;
  }

  const formatLeaveType = (leaveType) => {
    if (leaveType === "wfh") {
      return "Work-From-Home";
    }
    return leaveType.charAt(0).toUpperCase() + leaveType.slice(1).toLowerCase();
  };
  useEffect(() => {
    const updateCardsToShow = () => {
      if (window.innerWidth <= 425) {
        setCardsToShow(1);
      } else if (window.innerWidth >= 426 && window.innerWidth <= 1024) {
        setCardsToShow(3);
      } else {
        setCardsToShow(4);
      }
    };

    window.addEventListener("resize", updateCardsToShow);
    updateCardsToShow();

    return () => {
      window.removeEventListener("resize", updateCardsToShow);
    };
  }, []);

  const fetchEmployees = () => {
    apiServices("GET", `user/all-employees`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const emps = res?.data?.User;
          const sortedData = emps
            .slice()
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
          setEmployees(sortedData);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("aAttend.errors.getEmployeesError")
          }`
        );
      });
  };

  const getEmployeeImage = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee?.imageUrl || ""; // You may provide a default image URL
  };

  const getEmployeeFullName = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee ? employee.fullName : "";
  };

  const GetListProjects = () => {
    setIsLoading(true);
    apiServices(
      "GET",
      // `project-management/?clientName=${filters.clientName}&projectName=${filters.projectName}&page=${params.page}&limit=${params.limit}`,
      `project-management/?employeeId=${user_state?.user?._id}&page=1&limit=999`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          setTableData(res?.data?.projects?.docs);
          console.log("projects", res?.data?.projects?.docs);

          setIsLoading(false);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("projectScreen.errors.getEmployeeProjectsError")
          }`
        );
        setIsLoading(false);
      });
  };

  const handleNext = () => {
    // Check if we can move forward (e.g., if the current index + 3 is within the modules array)
    if (currentIndex + cardsToShow < tableData?.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    // Check if we can move backward
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const renderProjectCard = () => {
    return tableData
      .slice(currentIndex, currentIndex + cardsToShow)
      .map((project, index) => (
        <div className="col-lg-4 col-sm-6 col-md-4 col-xl-3" key={index}>
          <div className="card">
            <div className="card-body">
              {/* {
              (role === 'admin' || permissions?.projectManagement) &&
              <div className="dropdown dropdown-action profile-action">
                <a
                  className="action-icon dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="material-icons">more_vert</i>
                </a>
                <div className="dropdown-menu dropdown-menu-right">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      // ViewClients();
                      // fetchEmployees();
                      getAllCurrencies();
                      openEditModal(project);
                      form.setFieldsValue({
                        ...project,
                        startDate: moment(
                          project?.startDate,
                          "YYYY-MM-DD"
                        ),
                        endDate: moment(
                          project?.endDate,
                          "YYYY-MM-DD"
                        ),
                      });
                    }}
                  >
                    <i className={`fa fa-pencil ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} />
                    {t('edit')}
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      openDelete(project);
                    }}
                  >
                    <i className={`fa fa-trash ${i18n.dir() === "rtl" ? "m-l-5" : "m-r-5"}`} /> {t('delete')}
                  </button>
                </div>
              </div>
            } */}
              <h4 className="project-title longText">
                <Link
                  to={`/projects/projects-view/${project?._id}`}
                  state={{ project: project }}
                >
                  {project?.projectName}
                </Link>
              </h4>
              {/* <small className="block text-ellipsis m-b-15">
            <span className="text-xs">1</span>{" "}
            <span className="text-muted">open tasks, </span>
            <span className="text-xs">9</span>{" "}
            <span className="text-muted">tasks completed</span>
          </small> */}
              <div style={{ height: "110px" }}>
                <p className="text-muted longText1">
                  {project?.projectDescription}
                </p>
              </div>
              <div className="pro-deadline m-b-15">
                <div className="sub-title">{t("projectScreen.deadline")}:</div>
                <div className="text-muted">{project?.endDate}</div>
              </div>
              <div className="pro-deadline m-b-15">
                <div className="sub-title">{t("projectScreen.status")}:</div>
                <div
                  style={{
                    color:
                      project?.status === "Scheduled"
                        ? "red"
                        : project?.status === "On-Going"
                        ? "orange"
                        : project?.status === "Paused" ||
                          project?.status === "Archived"
                        ? "grey"
                        : project?.status === "Completed"
                        ? "green"
                        : "inherit",
                  }}
                >
                  {project?.status === "Scheduled"
                    ? t("projectScreen.Modal.scheduled")
                    : project?.status === "On-Going"
                    ? t("projectScreen.Modal.onGoing")
                    : project?.status === "Paused"
                    ? t("projectScreen.Modal.paused")
                    : project?.status === "Completed"
                    ? t("projectScreen.Modal.completed")
                    : project?.status === "Archived"
                    ? t("projectScreen.Modal.archived")
                    : project?.status}
                </div>
              </div>
              <div className="project-members m-b-15">
                <div>{t("projectScreen.projectLeader")}:</div>
                <ul className="team-members">
                  <li>
                    <Tooltip title={project?.projectLead?.fullName}>
                      <a>
                        <img
                          alt=""
                          src={project?.projectLead?.imageUrl || user_icon}
                        />
                      </a>
                    </Tooltip>
                  </li>
                </ul>
              </div>
              <div className="project-members m-b-15">
                <div>{t("projectScreen.team")}:</div>
                <ul className="team-members" style={{ marginLeft: "10px" }}>
                  {project?.assignedDevelopers
                    ?.slice(0, 4)
                    ?.map((developer, devIndex) => (
                      <li key={devIndex}>
                        <Tooltip
                          className="projectTeamMember"
                          title={developer?.fullName}
                        >
                          <a>
                            <img
                              alt=""
                              src={developer?.imageUrl || user_icon}
                            />
                          </a>
                        </Tooltip>

                        {/* <a
                        className="projectTeamMember"
                        data-bs-toggle="tooltip"
                        title={getEmployeeFullName(developer)}
                      >
                        <img
                          alt=""
                          src={
                            getEmployeeImage(developer) || user_icon
                          }
                        />
                      </a> */}
                      </li>
                    ))}
                  {project?.assignedDevelopers?.length > 4 && (
                    <li className="dropdown avatar-dropdown">
                      <a
                        className="all-users dropdown-toggle projectTeamMember"
                        style={{ display: "inline-flex" }}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        +{project?.assignedDevelopers?.length - 4}
                      </a>
                      <div className="dropdown-menu dropdown-menu-right">
                        <div className="avatar-group">
                          {project?.assignedDevelopers
                            ?.slice(4)
                            .map((developer, devIndex) => (
                              <a
                                className="avatar avatar-xs projectTeamMember"
                                key={devIndex}
                              >
                                <Tooltip title={developer?.fullName}>
                                  <Avatar
                                    src={developer?.imageUrl || user_icon}
                                  />
                                </Tooltip>
                              </a>
                            ))}
                        </div>
                        {/* <div className="avatar-pagination">
                        <ul className="pagination">
                          <li className="page-item">
                            <a
                              className="page-link"
                              aria-label="Previous"
                            >
                              <span aria-hidden="true">«</span>
                              <span className="sr-only">
                                Previous
                              </span>
                            </a>
                          </li>
                          <li className="page-item">
                            <a className="page-link">1</a>
                          </li>
                          <li className="page-item">
                            <a className="page-link" href="#">
                              2
                            </a>
                          </li>
                          <li className="page-item">
                            <a
                              className="page-link"
                              aria-label="Next"
                            >
                              <span aria-hidden="true">»</span>
                              <span className="sr-only">Next</span>
                            </a>
                          </li>
                        </ul>
                      </div> */}
                      </div>
                    </li>
                  )}
                </ul>
              </div>
              {/* <p className="m-b-5">
            Progress{" "}
            <span className="text-success float-end">40%</span>
          </p>
          <div className="progress progress-xs mb-0">
            <div
              className="progress-bar bg-success"
              role="progressbar"
              data-bs-toggle="tooltip"
              title="40%"
              style={{ width: "40%" }}
            />
          </div> */}
            </div>
          </div>
        </div>
      ));
  };

  useEffect(() => {
    loadNotifications();
    //fetchEmployees();
    GetListProjects();
    getSelfRequests();
    fetchDays();
    fetchdata();
    // if (permissions?.viewSelfRequest) {

    // } else {
    //   nav("/restricted", { state: { unAuthorize: true } });
    // }
  }, []);

  const fetchdata = async () => {
    setLoading(true);
    apiServices("GET", `user/employee-overview-dashboard`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const userData = res?.data;
          setUserData(userData);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const fetchDays = async () => {
    setDaysLoading(true);
    apiServices("GET", `user/getSevenDays`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const daysWorked = res?.data;
          setSevenDays(daysWorked);
          setDaysLoading(false);
        }
      })
      .catch((error) => {
        console.log("error", error);
        setDaysLoading(false);
      });
  };

  const getSelfRequests = async () => {
    setIsLoading(true);
    apiServices("GET", `requests/view-self-request-dashboard`, null, user_state)
      .then((res) => {
        console.log("request page data in emmplyee dash", res?.data);
        if (res?.data?.success === true) {
          // setWorkingDays(res?.data?.workingDays)
          setRequestData(res?.data);
          // setPaginationDetail(res?.data?.SelfRequests?.total)
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        console.log("err", err);
      });
  };

  // Step 1: Convert the `lastFiveDays` data into x-axis categories and hours worked arrays
  const processLastFiveDays = (lastFiveDays) => {
    const categories = [];
    const hoursWorkedInHours = [];

    lastFiveDays.forEach((dayObj) => {
      const day = Object.keys(dayObj)[0]; // Get the day label, e.g., "M", "T", "W"
      const minutes = dayObj[day]; // Get the hours worked in minutes
      const hours = (Math.ceil(minutes) / 60).toFixed(2); // Convert minutes to hours and format to 2 decimal places

      categories.push(day); // Add day label to x-axis categories
      hoursWorkedInHours.push(hours); // Add hours to the series data
    });

    return { categories, hoursWorkedInHours };
  };

  // Step 2: Process the `lastFiveDays` data
  const pastSevenDaysData = processLastFiveDays(sevenDays?.hoursWorked || []);

  // Step 3: Use the processed data to update the chart options
  const [chartOptions, setChartOptions] = useState({
    series: [
      {
        name: "Hours",
        data: pastSevenDaysData.hoursWorkedInHours, // Set initial series data
      },
    ],
    colors: ["#55CE63"],
    chart: {
      type: "bar",
      height: 210,
      stacked: true,
      zoom: {
        enabled: true,
      },
    },
    responsive: [
      {
        breakpoint: 280,
        options: {
          legend: {
            position: "bottom",
            offsetY: 0,
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 6,
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "all",
        columnWidth: "30%",
        endingShape: "rounded",
      },
    },
    dataLabels: {
      enabled: false,
    },
    yaxis: {
      min: 0,
      max: 10,
      tickAmount: 5,
    },
    xaxis: {
      categories: pastSevenDaysData.categories, // Set x-axis categories
    },
    tooltip: {
      y: {
        formatter: function (minutes) {
          const totalMinutes = minutes * 60; // Convert hours back to minutes
          const displayHours = Math.floor(totalMinutes / 60);
          const remainingMinutes = Math.round(totalMinutes % 60); // Get remaining minutes
          return `${displayHours}h ${remainingMinutes}m`; // Format tooltip as "Xh Ym"
        },
      },
    },
    legend: { show: false },
    fill: {
      opacity: 1,
    },
  });

  // Step 4: Update chart options when data changes
  useEffect(() => {
    setChartOptions((prevOptions) => ({
      ...prevOptions,
      xaxis: { categories: pastSevenDaysData.categories }, // Update x-axis categories
      series: [
        {
          name: "Hours",
          data: pastSevenDaysData.hoursWorkedInHours, // Update series data
        },
      ],
    }));
  }, [sevenDays?.hoursWorked]); // Listen for changes in `lastFiveDays`

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    marginrigth: 10,
  };
  const settingsprojectslide = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
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
        height: "357px",
        // height: "282px",
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

  const columnsWfh = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: "10%",
      render: (index) => <span>{index}</span>,
    },
    {
      title: t("employeeName"),
      dataIndex: "userId",
      key: "employee",
      width: "60%",
      render: (userId) => (
        <div>
          <img
            src={userId.imageUrl || user_icon}
            alt={userId.fullName}
            className="avatar"
          />
          {userId.fullName}
        </div>
      ),
    },
    {
      title: t("status"),
      dataIndex: "status",
      key: "status",
      width: "35%",
      render: (status) => (
        <span
          style={{
            color:
              status === "Pending"
                ? "orange"
                : status === "Approved"
                ? "green"
                : "red",
          }}
        >
          {status === "Approved"
            ? t("aRequests.Approved")
            : status === "Declined"
            ? t("aRequests.Declined")
            : status === "Pending"
            ? t("aDash.pending")
            : status === "Cancelled"
            ? t("aDash.cancelled")
            : status}
        </span>
      ),
    },
  ];

  // Assume joiningDate and birthDate are coming from the backend, part of requestData object.
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth() + 1; // getMonth() is zero-based

  const dataSourceWfh = userData?.employeeOnWfh || [];
  const dataSourceLeave = userData?.employeeOnLeave || [];
  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        {/* Page Content */}
        <div className="content container-fluid pb-0">
          {/* Leave Alert */}
          {/* <div className="row">
            <div className="col-md-12">
              <div className="employee-alert-box">
                {requestData?.SelfRequests?.[0] && (
                  <div className="alert alert-outline-success alert-dismissible fade show">
                    <div className="employee-alert-request">
                      <i className="far fa-circle-question" />
                      Your <span>
                        {formatLeaveType(requestData.SelfRequests[0].leaveType)}
                      </span>{" "}
                      Leave Request on{" "}
                      <span>
                        {moment(requestData.SelfRequests[0].createdAt).format("DD MMM YYYY")}
                      </span>{" "}
                      has been Approved!!!
                    </div>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="alert"
                      aria-label="Close"
                    >
                      <i className="fas fa-xmark" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div> */}
          {/* /Leave Alert */}
          <div className="row">
            <div className="col-xxl-8 col-lg-12 col-md-12">
              <div className="row">
                {/* Employee Details */}
                <div className="col-lg-6 col-md-12">
                  <div className="card employee-welcome-card flex-fill">
                    <div className="card-body">
                      <div className="welcome-info">
                        <div className="welcome-content">
                          <h4>
                            {`Welcome Back, ${user_state?.user?.fullName}`}
                          </h4>
                          <p>
                            <label>{todayDate}</label>
                          </p>
                        </div>
                        <div className="welcome-img">
                          <img
                            src={user_state?.user?.image || user_icon}
                            className="img-fluid"
                            alt="User"
                          />
                        </div>
                      </div>

                      <div className="welcome-btn">
                        <Link to="/profile" className="btn">
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="card flex-fill">
                    <div className="card-body">
                      <div className="statistic-header">
                        <h4>Statistics</h4>
                        {/* <div className="dropdown statistic-dropdown">
                          <Link
                            className="dropdown-toggle"
                            data-bs-toggle="dropdown"
                            to="#"
                          >
                            Today
                          </Link>
                          <div className="dropdown-menu dropdown-menu-end">
                            <Link to="#" className="dropdown-item">
                              Week
                            </Link>
                            <Link to="#" className="dropdown-item">
                              Month
                            </Link>
                            <Link to="#" className="dropdown-item">
                              Year
                            </Link>
                          </div>
                        </div> */}
                      </div>
                      <div className="clock-in-info">
                        <div className="clock-in-content">
                          <p>Work Time</p>
                          <h5>
                            <label>
                              {isDisabled ? (
                                <Spin size="large" />
                              ) : isCheckedOut ? (
                                formatHoursMinutes(checkOut.hoursWorked)
                              ) : (
                                formatElapsedTime(elapsedTime) // Create a function to format elapsed time
                              )}
                            </label>
                          </h5>
                        </div>
                        <div className="clock-in-btn">
                          <button
                            type="button"
                            className={`btn btn-${
                              checkIn.status === "Absent" ||
                              checkIn.status === "Holiday"
                                ? "success"
                                : isCheckedIn
                                ? "danger"
                                : "primary"
                            } punch-btn`}
                            onClick={
                              isCheckedIn ? handleCheckOut : handleCheckIn
                            }
                            disabled={
                              checkIn.status === "Absent" ||
                              checkIn.status === "On-Leave" ||
                              checkIn.status === "Holiday" ||
                              isDisabled
                            }
                          >
                            <img src={clockin} alt="Icon" />
                            {isDisabled ? (
                              <Spin size="medium" />
                            ) : checkIn.status === "Absent" ||
                              checkIn.status === "Holiday" ? (
                              t("marked")
                            ) : isCheckedIn ? (
                              t("checkOut")
                            ) : (
                              t("checkIn")
                            )}
                          </button>
                        </div>
                      </div>
                      <div
                        className="row"
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <div className="col-md-6 col-6 text-center">
                          <div className="stats-box">
                            <p>{t("status")}</p>

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
                                  ? checkIn.status === "Present"
                                    ? t("present")
                                    : checkIn.status === "Late"
                                    ? t("late")
                                    : checkIn.status === "On-Leave"
                                    ? t("on-Leave")
                                    : checkIn.status === "Holiday"
                                    ? t("holiDay")
                                    : checkIn.status === "Absent"
                                    ? t("absent")
                                    : checkIn.status
                                  : "--"}
                              </label>
                            </h6>
                          </div>
                        </div>

                        <div className="col-md-6 col-6 text-center">
                          <div className="stats-box">
                            <p>{t("overtime")}</p>

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
                      <div className="view-attendance">
                        <Link to="/employee/attendance-employee">
                          View Attendance{" "}
                          <i className="fe fe-arrow-right-circle" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="card info-card flex-fill">
                    <div className="card-body">
                      <h4>Upcoming Holidays</h4>
                      {loading ? (
                        <Spin
                          style={{
                            color: "white",
                            height: "38px",
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        />
                      ) : (
                        <div className="holiday-details">
                          <div className="holiday-calendar">
                            <div className="holiday-calendar-icon">
                              <img src={holidaycalendar} alt="Icon" />
                            </div>
                            {userData?.upcomingHoliday === null ? (
                              <label
                                style={{ color: "white", marginBottom: "16px" }}
                              >
                                {t("noUpcomingHoliday")}
                              </label>
                            ) : (
                              <label
                                className="holiday-calendar-content"
                                style={{
                                  textAlign: "center",
                                  display: "grid",
                                  placeContent: "center",
                                  gap: "8px",
                                }}
                              >
                                <h6>
                                  {userData?.upcomingHoliday?.holidayTitle}
                                </h6>
                                <p>
                                  <label>
                                    {moment(
                                      userData?.upcomingHoliday?.holidayDate
                                    ).format("ddd, DD MMM YYYY")}
                                  </label>
                                </p>
                              </label>
                            )}
                          </div>
                          <div className="holiday-btn">
                            <Link to="/employee/holidays" className="btn">
                              View All
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* /Employee Details */}
                {/* Attendance & Leaves */}
                <div className="col-lg-6 col-md-12">
                  <div className="card flex-fill">
                    <div className="card-body">
                      <div className="statistic-header">
                        <h4>Attendance &amp; Leaves</h4>
                        {/* <div className="dropdown statistic-dropdown">
                          <Link
                            className="dropdown-toggle"
                            data-bs-toggle="dropdown"
                            to="#"
                          >
                            2024
                          </Link>
                          <div className="dropdown-menu dropdown-menu-end">
                            <Link to="#" className="dropdown-item">
                              2025
                            </Link>
                            <Link to="#" className="dropdown-item">
                              2026
                            </Link>
                            <Link to="#" className="dropdown-item">
                              2027
                            </Link>
                          </div>
                        </div> */}
                      </div>
                      {loading ? (
                        <Spin
                          style={{
                            color: "white",
                            height: "38px",
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        />
                      ) : (
                        <div className="attendance-list">
                          <div className="row">
                            <div className="col-md-4 col-6">
                              <div className="attendance-details">
                                <h4 className="text-primary">
                                  {userData?.leave?.totalLeaves || 0}
                                </h4>
                                <p>Total Leaves</p>
                              </div>
                            </div>
                            <div className="col-md-4 col-6">
                              <div className="attendance-details">
                                <h4 className="text-pink">
                                  {userData?.leave?.takenLeaves || 0}
                                </h4>
                                <p>Leaves Taken</p>
                              </div>
                            </div>
                            <div className="col-md-4 col-6">
                              <div className="attendance-details">
                                <h4 className="text-success">
                                  {userData?.leave?.remainingLeaves || 0}
                                </h4>
                                <p>Leaves Remaining</p>
                              </div>
                            </div>
                            <div className="col-md-4 col-6">
                              <div className="attendance-details">
                                <h4 className="text-purple">
                                  {userData?.leave?.pendingApprovel || 0}
                                </h4>
                                <p>Pending Approval</p>
                              </div>
                            </div>
                            <div className="col-md-4 col-6">
                              <div className="attendance-details">
                                <h4 className="text-info">
                                  {userData?.attendence?.workingDays || 0}
                                </h4>
                                <p>Days Worked</p>
                              </div>
                            </div>
                            <div className="col-md-4 col-6">
                              <div className="attendance-details">
                                <h4 className="text-danger">
                                  {userData?.attendence?.totalAbsence || 0}
                                </h4>
                                <p>Total Absents</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="view-attendance">
                        <Link to="/employee/requests">
                          Apply Leave
                          <i className="fe fe-arrow-right-circle" />
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="card flex-fill">
                    <div className="card-body">
                      <div
                        className="statistic-header"
                        style={{ paddingBottom: "6.8%" }}
                      >
                        <h4>Working hours</h4>
                        {/* <div className="dropdown statistic-dropdown">
                          <Link
                            className="dropdown-toggle"
                            data-bs-toggle="dropdown"
                            to="#"
                          >
                            This Week
                          </Link>
                          <div className="dropdown-menu dropdown-menu-end">
                            <Link to="#" className="dropdown-item">
                              Last Week
                            </Link>
                            <Link to="#" className="dropdown-item">
                              This Month
                            </Link>
                            <Link to="#" className="dropdown-item">
                              Last 30 Days
                            </Link>
                          </div>
                        </div> */}
                      </div>
                      <div className="working-hour-info">
                        <div id="working_chart" />
                        {daysLoading ? (
                          <Spin
                            style={{
                              height: "38px",
                              width: "100%",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          />
                        ) : (
                          <Chart
                            options={chartOptions}
                            series={chartOptions?.series}
                            type="bar"
                            height={210}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Attendance & Leaves */}
              </div>
            </div>
            {/* Employee Notifications */}
            <div className="col-xxl-4 col-lg-12 col-md-12 d-flex">
              <div className="card flex-fill">
                <div className="card-body">
                  <div className="statistic-header">
                    <h4>Important</h4>
                    {/* <div className="important-notification">
                      <Link to="/employee/requests">
                        <span className="me-1">View All</span>
                        <ArrowRightCircle size={15} />
                      </Link>
                    </div> */}
                  </div>
                  {loading ? (
                    <Spin
                      style={{
                        color: "white",
                        height: "38px",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    />
                  ) : notifList?.length > 0 ? (
                    <div className="notification-tab">
                      <ul className="nav nav-tabs">
                        <li>
                          <i className="la la-bell" /> Notifications
                        </li>
                        {/* <li>
                        <Link
                          to="#"
                          data-bs-toggle="tab"
                          data-bs-target="#schedule_tab"
                        >
                          <i className="la la-list-alt" /> Schedules
                        </Link>
                      </li> */}
                      </ul>
                      <div className="tab-content">
                        <div className="tab-pane active" id="notification_tab">
                          <div className="scrollable-requests">
                            {/* {requestData?.workAnniversary?.map(
                              (employee, index) => {
                                const joiningDate = new Date(
                                  employee.joiningDate
                                );
                                const joiningDay = joiningDate.getDate();
                                const joiningMonth = joiningDate.getMonth() + 1;
                                const joiningYear = joiningDate.getFullYear(); // Extract the year from the birthday

                                // Calculate the age
                                const currentYear = new Date().getFullYear();
                                const years = currentYear - joiningYear;

                                // Check if today's day and month match the employee's joining date for work anniversary
                                const isWorkAnniversary =
                                  todayDay === joiningDay &&
                                  todayMonth === joiningMonth;

                                return (
                                  isWorkAnniversary &&
                                  years > 0 && (
                                    <div
                                      key={index}
                                      className="employee-noti-content"
                                      style={{ position: "relative" }}
                                    >
                                      <PushPin
                                        style={{
                                          position: "absolute",
                                          top: "10px",
                                          right: "10px",
                                          fontSize: "16px",
                                          transform: "rotate(45deg)",
                                          color: "#999",
                                        }}
                                      />

                                      <ul className="employee-notification-list">
                                        <li className="employee-notification-grid">
                                          <div className="employee-notification-icon">
                                            <span className="badge-soft-danger rounded-circle">
                                              <Celebration />
                                            </span>
                                          </div>
                                          <div className="employee-notification-content">
                                            <h6>
                                              <label>
                                                {`Happy Work Anniversary ${employee.fullName}!`}
                                              </label>
                                            </h6>
                                            <ul
                                              className="nav"
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                              }}
                                            >
                                              <li>
                                                {`Celebrating ${years} ${
                                                  years === 1 ? "year" : "years"
                                                } of hard work!`}
                                              </li>
                                            </ul>
                                          </div>
                                        </li>
                                      </ul>
                                    </div>
                                  )
                                );
                              }
                            )}
                            {requestData?.todayBirthdays?.map(
                              (employee, index) => {
                                const birthdayDate = new Date(
                                  employee.dateOfBirth
                                );
                                const birthdayDay = birthdayDate.getDate();
                                const birthdayMonth =
                                  birthdayDate.getMonth() + 1;
                                const birthdayYear = birthdayDate.getFullYear(); // Extract the year from the birthday

                                // Calculate the age
                                const currentYear = new Date().getFullYear();
                                const age = currentYear - birthdayYear;

                                // Check if today's day and month match the employee's joining date for work anniversary
                                const isBirthday =
                                  todayDay === birthdayDay &&
                                  todayMonth === birthdayMonth;

                                return (
                                  isBirthday &&
                                  age > 0 && (
                                    <div
                                      key={index}
                                      className="employee-noti-content"
                                      style={{ position: "relative" }}
                                    >
                                      <PushPin
                                        style={{
                                          position: "absolute",
                                          top: "10px",
                                          right: "10px",
                                          fontSize: "16px",
                                          transform: "rotate(45deg)",
                                          color: "#999",
                                        }}
                                      />
                                      <ul className="employee-notification-list">
                                        <li className="employee-notification-grid">
                                          <div className="employee-notification-icon">
                                            <span className="badge-soft-danger rounded-circle">
                                              <Cake />
                                            </span>
                                          </div>
                                          <div className="employee-notification-content">
                                            <h6>
                                              <label>
                                                {`Happy Birthday ${employee.fullName}!`}
                                              </label>
                                            </h6>
                                            <ul
                                              className="nav"
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                              }}
                                            >
                                              <li>
                                                {`Just turned ${age} years old!`}
                                              </li>
                                            </ul>
                                          </div>
                                        </li>
                                      </ul>
                                    </div>
                                  )
                                );
                              }
                            )}
                            {requestData?.SelfRequests?.length > 0 ? (
                              <>
                                {requestData?.SelfRequests?.map(
                                  (requests, indx) => (
                                    <div
                                      key={indx}
                                      className="employee-noti-content"
                                    >
                                      <ul className="employee-notification-list">
                                        <Link to="/employee/requests">
                                          <li className="employee-notification-grid">
                                            <div className="employee-notification-icon">
                                              <span className="badge-soft-danger rounded-circle">
                                                HR
                                              </span>
                                            </div>
                                            <div className="employee-notification-content">
                                              <h6>
                                                <label>
                                                  {`Your ${formatLeaveType(
                                                    requests.requestType
                                                  )} request is ${
                                                    requests.status
                                                  }`}
                                                </label>
                                              </h6>
                                              <ul
                                                className="nav"
                                                style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                }}
                                              >
                                                <li>
                                                  {`Request Date: ${moment(
                                                    requests.createdAt
                                                  ).format("DD MMM YYYY")}`}
                                                </li>
                                                <li>
                                                  {`Updated: ${moment(
                                                    requests.updatedAt
                                                  ).format("DD MMM YYYY")}`}
                                                </li>
                                              </ul>
                                            </div>
                                          </li>
                                        </Link>
                                      </ul>
                                    </div>
                                  )
                                )}
                                <div className="employee-noti-content">
                                  <ul className="employee-notification-list">
                                    <Link to="/employee/requests">
                                      <li
                                        className="employee-notification-grid"
                                        style={{ justifyContent: "center" }}
                                      >
                                        <div className="employee-notification-content">
                                          <h6>
                                            <label
                                              style={{
                                                color: "#ffb062",
                                                textDecoration: "underline",
                                                cursor: "pointer",
                                                marginTop: "5%",
                                              }}
                                            >
                                              {`Click Here to View all Requests`}
                                            </label>
                                          </h6>
                                        </div>
                                      </li>
                                    </Link>
                                  </ul>
                                </div>
                              </>
                            ) : (
                              ""
                            )} */}
                            {notifList?.map(
                              (item, index) => (
                                (
                                  <div key={index} className="employee-noti-content" style={{ cursor: "pointer" }}
                                  onClick={() => handleNotificationClick(item)} >
                                    <ul className="employee-notification-list">
                                        <li className="employee-notification-grid">
                                          <div className="employee-notification-icon">
                                            <span className="badge-soft-danger rounded-circle">
                                              <i className="fa fa-bell"></i>
                                            </span>
                                          </div>
                                          <div className="employee-notification-content">
                                            <h6>
                                              <label>
                                                {item.title}
                                              </label>
                                            </h6>
                                            <ul
                                              className="nav"
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                              }}
                                            >
                                              <li>
                                                {item.message}
                                              </li>
                                            </ul>
                                          </div>
                                        </li>
                                      </ul>
                                  </div>
                                )
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Render custom empty text when no data is available
                    <div className="col-md-12 text-center">
                      {customEmptyText}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* /Employee Notifications */}
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-body">
                  <div className="statistic-header">
                    <h4>Assigned Projects</h4>
                    <div className="arrow-btns">
                      <button
                        className="custom-arrow-btn"
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                      >
                        <span className="arrow left-arrow"></span>
                      </button>
                      <button
                        className="custom-arrow-btn"
                        onClick={handleNext}
                        disabled={
                          currentIndex + cardsToShow >= tableData?.length
                        }
                      >
                        <span className="arrow right-arrow"></span>
                      </button>
                    </div>
                  </div>
                  {loading ? (
                    <Spin
                      style={{
                        color: "white",
                        height: "38px",
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    />
                  ) : tableData?.length > 0 ? (
                    <div class="row">{renderProjectCard()}</div>
                  ) : (
                    // Render custom empty text when no data is available
                    <div className="col-md-12 text-center">
                      {customEmptyText}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-xl-6 col-md-12 d-flex-fill">
              <div className="card">
                <div className="card-body">
                  <div className="statistic-header">
                    <h4>Employee on work from home</h4>
                  </div>
                  <div
                    style={{
                      maxWidth: "100%",
                      overflowX: "auto",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Table
                      columns={columnsWfh}
                      className="fixedTableHeader"
                      style={{ height: "424px", background: "white" }}
                      // style={{height: '349px', background: 'white'}}
                      dataSource={dataSourceWfh.map((item, index) => ({
                        ...item,
                        index: index + 1,
                      }))}
                      pagination={false}
                      locale={{
                        emptyText: isLoading ? (
                          <Spin
                            style={{
                              height: "357px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            tip="Loading..."
                          />
                        ) : (
                          // <Spin style={{height: '280px', display: 'flex', justifyContent: 'center', alignItems: 'center'}} tip="Loading..." />
                          customEmptyText
                        ),
                      }}
                      components={
                        i18n.dir() === "rtl"
                          ? {
                              header: {
                                cell: ({ children }) => (
                                  <th style={{ textAlign: "right" }}>
                                    {children}
                                  </th>
                                ),
                              },
                            }
                          : null
                      }
                      onRow={
                        i18n.dir() === "rtl"
                          ? (record, rowIndex) => {
                              return {
                                style: { textAlign: "right" }, // Align table data to the right
                              };
                            }
                          : null
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-md-12 d-flex-fill">
              <div className="card">
                <div className="card-body">
                  <div className="statistic-header">
                    <h4>Employee on Leave</h4>
                  </div>
                  <div
                    style={{
                      maxWidth: "100%",
                      overflowX: "auto",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Table
                      columns={columnsWfh}
                      className="fixedTableHeader"
                      style={{ height: "424px", background: "white" }}
                      dataSource={dataSourceLeave.map((item, index) => ({
                        ...item,
                        index: index + 1,
                      }))}
                      pagination={false}
                      locale={{
                        emptyText: isLoading ? (
                          <Spin
                            style={{
                              height: "357px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            tip="Loading..."
                          />
                        ) : (
                          customEmptyText
                        ),
                      }}
                      components={
                        i18n.dir() === "rtl"
                          ? {
                              header: {
                                cell: ({ children }) => (
                                  <th style={{ textAlign: "right" }}>
                                    {children}
                                  </th>
                                ),
                              },
                            }
                          : null
                      }
                      onRow={
                        i18n.dir() === "rtl"
                          ? (record, rowIndex) => {
                              return {
                                style: { textAlign: "right" }, // Align table data to the right
                              };
                            }
                          : null
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Employee Month */}
            {/* <div className="col-xl-6 col-md-12 d-flex">
            <div className="card employee-month-card flex-fill">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-lg-9 col-md-12">
                    <div className="employee-month-details">
                      <h4>Employee of the month</h4>
                      <p>
                        We are really proud of the difference you have made
                        which gives everybody the reason to applaud &amp;
                        appreciate
                      </p>
                    </div>
                    <div className="employee-month-content">
                      <h6>Congrats, Hanna</h6>
                      <p>UI/UX Team Lead</p>
                    </div>
                  </div>
                  <div className="col-lg-3 col-md-12">
                    <div className="employee-month-img">
                      <img
                        //src={employeeimg}
                        className="img-fluid"
                        alt="User"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div> */}
            {/* /Employee Month */}
            {/* Company Policy */}
            {/* <div className="col-xl-6 col-md-12 d-flex">
            <div className="card flex-fill">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-sm-8">
                    <div className="statistic-header">
                      <h4>Company Policy</h4>
                    </div>
                  </div>
                  <div className="col-sm-4 text-sm-end">
                    <div className="owl-nav company-nav nav-control" />
                  </div>
                </div>
                <Slider
                  {...settings}
                  className="company-slider owl-carousel owl-loaded owl-drag"
                >
                  {/* Company Grid */}
            {/* <div
                    className="owl-item active"
                    style={{ width: "199.667px", marginRight: "20px" }}
                  >
                    <div className="company-grid company-soft-tertiary">
                      <div className="company-top">
                        <div className="company-icon">
                          <span className="company-icon-tertiary rounded-circle">
                            HR
                          </span>
                        </div>
                        <div className="company-link">
                          <Link to="/companies">HR Policy</Link>
                        </div>
                      </div>
                      <div className="company-bottom d-flex">
                        <ul>
                          <li>Policy Name : Work policy</li>
                          <li>Updated on : Today</li>
                        </ul>
                        <div className="company-bottom-links">
                          <Link to="#">
                            <i className="la la-download" />
                          </Link>
                          <Link to="#">
                            <i className="la la-eye" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div> */}
            {/* Company Grid */}
            {/* Company Grid */}
            {/* <div
                    className="owl-item active"
                    style={{ width: "199.667px", marginRight: "20px" }}
                  >
                    <div className="company-grid company-soft-success">
                      <div className="company-top">
                        <div className="company-icon">
                          <span className="company-icon-success rounded-circle">
                            EP
                          </span>
                        </div>
                        <div className="company-link">
                          <Link to="/companies">Employer Policy</Link>
                        </div>
                      </div>
                      <div className="company-bottom d-flex">
                        <ul>
                          <li>Policy Name : Parking</li>
                          <li>Updated on : 25 Jan 2024</li>
                        </ul>
                        <div className="company-bottom-links">
                          <Link to="#">
                            <i className="la la-download" />
                          </Link>
                          <Link to="#">
                            <i className="la la-eye" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div> */}
            {/* Company Grid */}
            {/* Company Grid */}
            {/* <div
                    className="owl-item active"
                    style={{ width: "199.667px", marginRight: "20px" }}
                  >
                    <div className="company-grid company-soft-info">
                      <div className="company-top">
                        <div className="company-icon">
                          <span className="company-icon-info rounded-circle">
                            LP
                          </span>
                        </div>
                        <div className="company-link">
                          <Link to="/companies">Leave Policy</Link>
                        </div>
                      </div>
                      <div className="company-bottom d-flex">
                        <ul>
                          <li>Policy Name : Annual Leave</li>
                          <li>Updated on : 25 Jan 2023</li>
                        </ul>
                        <div className="company-bottom-links">
                          <Link to="#">
                            <i className="la la-download" />
                          </Link>
                          <Link to="#">
                            <i className="la la-eye" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div> */}
            {/* Company Grid */}
            {/* </Slider>
              </div>
            </div>
            </div> */}
            {/* /Company Policy */}
          </div>
        </div>
        {/* /Page Content */}
      </div>
      {/* /Page Wrapper */}
    </>
  );
};

export default EmployeeDashboard;
