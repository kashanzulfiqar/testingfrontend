import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import {
  Avatar_01,
  Avatar_04,
  Avatar_05,
  Avatar_09,
  Avatar_10,
  Avatar_11,
  Avatar_12,
  Avatar_13,
  Avatar_16,
  user_icon,
} from "../../../Entryfile/imagepath";
import Tableavatar from "../../../_components/tableavatar/tableavatar";
import Sidebar from "../../../initialpage/Sidebar/sidebar";
import Header from "../../../initialpage/Sidebar/header";
import Offcanvas from "../../../Entryfile/offcanvance";
import { apiServices } from "../../../Services/apiServices";
import { useSelector } from "react-redux";
import {
  Table,
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Spin,
  message,
  Empty,
  TimePicker,
} from "antd";
import moment from "moment";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import Modal from "@mui/material/Modal";
import { EditOutlined } from "@mui/icons-material";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Option } = Select;

const AttendanceAdmin = () => {
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const [menu, setMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatLoading, setIsStatLoading] = useState(false);
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [statdata, setStatdata] = useState(null);
  const [specific, setSpecific] = useState(null);
  const [multiple, setMultiple] = useState([]);
  const [aStatus, setAStatus] = useState('');

  const toggleMobileMenu = () => {
    setMenu(!menu);
  };

  useEffect(() => {
    if ($(".select").length > 0) {
      $(".select").select2({
        minimumResultsForSearch: -1,
        width: "100%",
      });
    }
  });

  const [attendancerecords, setAttendanceRecords] = useState([]);

  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role;
  const loggedInUserId = user_state?.user?._id;

  const [loader, setLoader] = useState(false);

  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
    setSelectedStatus("");
    form.resetFields();
  };

  const [employeeAttendanceData, setEmployeeAttendanceData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");

  const [filters, setFilters] = useState({
    name: "",
    month: "",
    year: "",
  });
  const [selectedFilters, setSelectedFilters] = useState({
    name: "",
    month: "",
    year: "",
  });

  useEffect(() => {
    if (role === "admin" || permissions?.attendanceManagement) {
      setIsStatLoading(true);
      fetchEmployees();
    } else {
      navigate("/restricted", { state: { unAuthorize: true } });
    }
  }, []);

  const selectedMonthStart = filters.month && filters.year
    ? moment(`${filters.year}-${filters.month}-01`)
    : null;


  const fetchEmployees = () => {
   
     // Build query parameters
     let queryParams = `includeInactive=true`;
     if (filters.month && filters.year) {
       queryParams += `&month=${filters.month}&year=${filters.year}`;
     }
     
     apiServices("GET", `user/all-employees?${queryParams}`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const emps = res?.data?.User;
          setEmployees(emps);
          //console.log("these are ", emps)
        }
      })
      .catch((err) => {
        message.error(
          `${err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('aAttend.errors.getEmployeesError')
          }`
        );
      });
  };

  useEffect(() => {
    if (role === "admin" || permissions?.attendanceManagement) {
      // Only fetch attendance if employees are loaded (for proper filtering)
      if (employees && employees.length > 0) {
        setIsLoading(true);
        fetchAttendanceData();
      }
    } else {
      navigate("/restricted", { state: { unAuthorize: true } });
    }
  }, [filters, employees]);

  const fetchAttendanceData = async () => {
    apiServices(
      "GET",
      `attendance/employeesattendance?attendanceMonth=${filters.month}&attendanceYear=${filters.year}&search=${filters.name}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          let attendanceData = res?.data?.Attendance;
          const statData = res?.data;
          
          const flattenedRecords = [];
          attendanceData?.forEach((employeeRecord) => {
            const user = employeeRecord.user;
            if (employeeRecord.attendances && employeeRecord.attendances.length > 0) {
              employeeRecord.attendances.forEach((attendance) => {
                flattenedRecords.push({
                  ...attendance,
                  user: user,
                });
              });
            } else {
              flattenedRecords.push({
                user: user,
                attendanceDate: null,
              });
            }
          });
          
          const validRecords = [];
          const nullRecords = [];
          
          flattenedRecords?.forEach((record) => {
            if (!record.attendanceDate) {
              nullRecords.push(record);
            } else {
              if (employees && employees.length > 0) {
                const employee = employees.find(emp => emp._id === record.user?._id);
                
                if (!employee || !employee.employeeExitDate) {
                  validRecords.push(record);
                } else {
                  const exitDate = moment(employee.employeeExitDate);
                  const attendanceDate = moment(record.attendanceDate);
                  
                  if (attendanceDate.isSameOrBefore(exitDate, 'day')) {
                    validRecords.push(record);
                  }
                }
              } else {
                validRecords.push(record);
              }
            }
          });
          
          const filteredAttendanceData = [...validRecords, ...nullRecords];
          
          setAttendanceRecords(filteredAttendanceData);
          setStatdata(statData);

          const uniqueEmployees = [
            ...new Set(filteredAttendanceData.map((record) => record.user?._id).filter(Boolean)),
          ];
          const employeeData = uniqueEmployees?.map((employeeId) => {
            const employeeRecords = filteredAttendanceData?.filter(
              (record) => record.user?._id === employeeId
            );
            return {
              employeeId,
              records: employeeRecords,
            };
          });
          setEmployeeAttendanceData(employeeData);
        }
      })
      .catch((error) => {
        console.log("error", error);
      })
      .finally(() => {
        setIsLoading(false);
        setIsStatLoading(false);
      });
  };

  const [dayRecord, setDayRecord] = useState(null);

  const openModal = (dayRecord, abbreviation) => {
    if (abbreviation !== "-") {
      setIsModalVisible(true);
      if (dayRecord?.attendanceRecords) {
        console.log(dayRecord?.attendanceRecords)
        setMultiple(dayRecord?.attendanceRecords);
        setAStatus(dayRecord?.status);
        const len = dayRecord?.attendanceRecords?.length
        const checkIn = dayRecord?.attendanceRecords[0]?.checkInTime
        const checkOut = dayRecord?.attendanceRecords[len - 1]?.checkOutTime
        const update = {
          ...dayRecord,
          checkInTime: checkIn,
          checkOutTime: checkOut
        }
        setDayRecord(update);
      }
      else {
        setMultiple([{
          checkInTime: dayRecord?.checkInTime,
          checkOutTime: dayRecord?.checkOutTime,
          hoursWorked: dayRecord?.hoursWorked
        }]);
        setDayRecord(dayRecord)
      }
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setMultiple([]);
    setAStatus('');
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

  const formatHoursMinutes = (timeString) => {
    if (!timeString) return "None";

    const totalMinutes = parseFloat(timeString);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const handleFilterChange = (value, filterType) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value,
    });
  };

  // const handleSearch = () => {
  //   console.log(filters)
  //   setFilters(selectedFilters);

  //   //fetchattendance();
  // };

  const handleSearch = () => {
    const { name, month, year } = selectedFilters;

    if (name || (month && year)) {
      setFilters(selectedFilters);
    } else {
      message.warning(t('aAttend.errors.bothMonthAndYearRequired'));
    }
  };

  const handleReset = () => {
    setSelectedFilters({
      name: "",
      month: "",
      year: "",
    });

    setSelectedMonthYear("");

    setFilters({
      name: "",
      month: "",
      year: "",
    });

    form.resetFields();
  };

  //console.log(employeeAttendanceData);
  //const daysInMonth = moment().daysInMonth();
  let daysInMonth;
  if (filters.month) {
    //console.log("this is ", filters.month);
    // If filters.month is present, find the number of days in that month
    const formattedMonth = moment(
      `${filters.month} 1, ${new Date().getFullYear()}`,
      "MMMM D, YYYY"
    );
    daysInMonth = formattedMonth.daysInMonth();
  } else {
    // If filters.month is not present, find the number of days in the current month
    daysInMonth = moment().daysInMonth();
  }

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

  const handleEmployeeClick = (e, employeeId) => {
    e.stopPropagation();
    console.log('Employee clicked:', employeeId);
    if (employeeId) {
      sessionStorage.setItem('employee_tab', 'profile');
      navigate(`/profile/employee-profile/${employeeId}`);
    }
  };

  const columns = [
    {
      title: t('aAttend.employee'),
      dataIndex: "employeeName",
      key: "employeeName",
      // width: 170,
      fixed: "left",
      render: (text, record) => (
        <div
          className="table-avatar"
          style={{
            display: "flex",
            alignItems: "center",
            minWidth: "120px",
            width: "max-content",
            cursor: "pointer",
            position: "relative",
            zIndex: 10,
          }}
          onClick={(e) => handleEmployeeClick(e, record?.key)}
        >
          <span className="avatar" style={{ pointerEvents: 'none' }}>
            <img alt="" src={record?.employeeImageUrl || user_icon} />
          </span>
          <span style={{ pointerEvents: 'none' }}>{text}</span>
        </div>
      ),
    },
    ...Array.from({ length: daysInMonth }, (_, index) => {
      // Get the date for the current column based on the selected month and year
      const currentDate = filters.month
        ?
        moment().year(filters.year).month(filters.month).date(index + 1)
        :
        moment().date(index + 1);

      // Determine if the current column represents a Saturday or Sunday
      const isSaturday = currentDate.isoWeekday() === 6;
      const isSunday = currentDate.isoWeekday() === 7;
      const isWeekday = !isSaturday && !isSunday;

      return {
        title: (
          <div style={{ width: 30, textAlign: "center" }}>
            <span>{index + 1}</span>
            {isWeekday && (
              <div
                className="weekend-text"
                style={{ color: "green", fontSize: "10px" }}
              >
                {currentDate.format("ddd")}
              </div>
            )}
            {isSaturday && (
              <div
                className="weekend-text"
                style={{ color: "brown", fontSize: "10px" }}
              >
                Sat
              </div>
            )}
            {isSunday && (
              <div
                className="weekend-text"
                style={{ color: "brown", fontSize: "10px" }}
              >
                Sun
              </div>
            )}
          </div>
        ),
        dataIndex: `day${index + 1}`,
        key: `day${index + 1}`,
        width: 45,
        render: (text, record) => {
          const dayRecord = record[`day${index + 1}`];

          let abbreviation = "";
          let color = "";

          switch (dayRecord?.status) {
            case "Present":
              abbreviation = "P";
              color = "green";
              break;
            case "Late":
              abbreviation = "P";
              color = "orange";
              break;
            case "Absent":
              abbreviation = "A";
              color = "red";
              break;
            case "On-Leave":
              abbreviation = "L";
              color = "red"; // Change this color as needed
              break;
            case "Holiday":
              abbreviation = "H";
              color = "blue"; // Change this color as needed
              break;
            default:
              abbreviation = "-";
              color = "black";
              break;
          }

          const isOwnAttendance = record.key === loggedInUserId;

          return (
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  color: color,
                  cursor: abbreviation !== "-" && !isOwnAttendance ? "pointer" : "default",
                }}
                onClick={() => {
                  if (isOwnAttendance) {
                    return;
                  }
                  setSpecific(record)
                  openModal(dayRecord, abbreviation);
                  //console.log(dayRecord)
                }}
              >
                {abbreviation}
              </span>
            </div>
          );
        },
      };
    }),
  ];

  
  const dataSource = employeeAttendanceData
    ?.filter((data) => {
      const employeeFromList = employees?.find(emp => emp._id === data.employeeId);
      const employeeName = employeeFromList?.fullName || 
        data.records?.[0]?.user?.fullName || '';
      
      const matchesName = employeeName
        .toLowerCase()
        .includes(filters.name.toLowerCase());
      
      return matchesName;
    })
    ?.map((data) => {
      const employeeFromList = employees?.find(emp => emp._id === data.employeeId);
      const employeeUser = data.records?.[0]?.user;
      
      const rowData = {
        key: data.employeeId,
        employeeName: employeeFromList?.fullName || employeeUser?.fullName || '',
        employeeImageUrl: employeeFromList?.imageUrl || employeeUser?.imageUrl || '',
        shiftStart: employeeFromList?.shiftId?.startTime,
        shiftMaxStart: employeeFromList?.shiftId?.maxStartTime,
        shiftEnd: employeeFromList?.shiftId?.endTime,
      };

      // Determine the last day to show attendance for this employee
      let lastDayToShow = daysInMonth;
      if (employeeFromList?.employeeExitDate) {
        const exitDate = moment(employeeFromList.employeeExitDate);
        const selectedMonth = filters.month || moment().month() + 1;
        const selectedYear = filters.year || moment().year();
        
        // If the exit date is in the same month/year as selected, limit the days shown
        if (exitDate.year() === parseInt(selectedYear) && (exitDate.month() + 1) === parseInt(selectedMonth)) {
          lastDayToShow = exitDate.date();
        }
      }

      if (data.records) {
        const validRecords = data.records.filter(record => record.attendanceDate);
        
        if (validRecords.length > 0) {
          validRecords.forEach((record) => {
            const day = moment(record.attendanceDate).date();
            if (day <= lastDayToShow) {
              rowData[`day${day}`] = record;
            }
          });
        }
        
        // Fill remaining days with "-" if within the working period
        for (let i = 1; i <= lastDayToShow; i++) {
          if (!rowData[`day${i}`]) {
            rowData[`day${i}`] = { status: "-" };
          }
        }
      } else {
        // Employee has no attendance records - show "-" for all days
        for (let i = 1; i <= lastDayToShow; i++) {
          rowData[`day${i}`] = { status: "-" };
        }
      }

      return rowData;
    });

  const onFinish = (values, info) => {
    //console.log(info)
    setLoader(true);
    // let updated_data = {
    //   ...values,
    //   companyId: info?.companyId,
    //   _id: info?._id,
    // };
    let updated_data = {
      _id: info?._id,
      userId: info?.userId,
      attendanceDate: info?.attendanceDate,
      attendanceMonth: info?.attendanceMonth,
      attendanceYear: info?.attendanceYear,
      checkInTime: values?.checkInTime
        ? moment(values.checkInTime).format("HH:mm")
        : "", // Replace with the new check-in time
      checkOutTime: values?.checkOutTime
        ? moment(values.checkOutTime).format("HH:mm")
        : "", // Replace with the new check-out time
      status: selectedStatus ? selectedStatus : info?.status,
      // status: selectedStatus,
      // status: values.status,
      //hoursWorked: info?.hoursWorked,
      //lateArrival: "new_late_arrival", // Replace with the new late arrival value
      //status: "new_status", // Replace with the new status
      //overTime: info?.overTime,
    };
    apiServices("PUT", "attendance/update-attendance", updated_data, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // console.log(data);
          // setCategory(
          //   category.map((category) => {
          //     if (category._id === info._id) {
          //       return {
          //         ...category,
          //         ...values,
          //       };
          //     } else {
          //       return {
          //         ...category,
          //       };
          //     }
          //   })
          // );
          const updatedDayRecord = {
            ...dayRecord,
            //attendanceRecords: res.data.Attendance.attendanceRecords,
            checkInTime: updated_data.checkInTime,
            checkOutTime: updated_data.checkOutTime,
            status: updated_data.status,
            hoursWorked: res.data.Attendance.hoursWorked,
            overTime: res.data.Attendance.overTime,
          };

          setMultiple(res.data.Attendance.attendanceRecords);
          setAStatus(res.data.Attendance.status);
          // Update the dayRecord state with the new values
          setDayRecord(updatedDayRecord);
          fetchAttendanceData();
          handleClose();
          message.success(t('aAttend.errors.attendanceUpdatedSuccessfully'));
          setLoader(false);
        }
      })
      .catch((err) => {
        setLoader(false);
        // console.log(err);
        message.error(
          `${err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('aAttend.errors.updateAttendanceError')
          }!`
        );
      });
  };

  // const dataSource = employeeAttendanceData.map((employeeData) => {
  //   const rowData = {
  //     key: employeeData.employeeId,
  //     employeeName: employeeData.records[0].user.fullName,
  //   };

  //   employeeData.records.forEach((record) => {
  //     const day = moment(record.attendanceDate).date();
  //     rowData[`day${day}`] = record; // Store the entire day's record under day1, day2, ...
  //   });

  //   return rowData;
  // });

  return (
    <>
      <div className={`main-wrapper ${menu ? "slide-nav" : ""}`}>
        {/* <Header onMenuClick={(value) => toggleMobileMenu()} /> */}
        {/* <Sidebar /> */}
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

                </div>
              </div>
            </div>
            {/* STATS */}
            {isStatLoading ?
              <div className="row" style={{ minHeight: '83px', display: 'grid', placeItems: 'center', background: '#ebebeb', borderRadius: '5px', marginBottom: '20px', marginInline: '0px' }}>
                <Spin />
              </div> :
              <div className="row">
                <div className="col-md-3">
                  <div className="stats-info">
                    <label>{t('aAttend.todayPresent')}</label>
                    <h4>
                      {statdata?.todayPresent}
                    </h4>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stats-info">
                    <label>{t('aAttend.todayLate')}</label>
                    <h4>
                      {statdata?.todayLate}
                    </h4>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stats-info">
                    <label>{t('aAttend.todayAbsent')}</label>
                    <h4>
                      {statdata?.todayAbsent}
                    </h4>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stats-info">
                    <label>{t('aAttend.workFromHome')}</label>

                    <h4>
                      {statdata?.wfhToday}
                    </h4>
                  </div>
                </div>
              </div>
            }
            {/* Search Filter */}

            <Form form={form} onFinish={handleSearch}>
              <div className="row filter-row">
                <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <Form.Item name="name" className="custom-border">
                      <Input
                        className="form-control"
                        allowClear={false}
                        placeholder={t('employeeName')}
                        onChange={(e) =>
                          handleFilterChange(e.target.value, "name")
                        }
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
                        placeholder={
                          selectedMonthYear
                            ? t('aAttend.selectMonth')
                            : `${moment().format("MMMM")}`
                        }
                        size="large"
                        allowClear={false}
                        format="MMMM"
                        onChange={(date, dateString) => {
                          handleFilterChange(dateString, "month");
                          setSelectedMonthYear(dateString);
                        }}
                      />
                    </Form.Item>
                  </div>
                </div>

                <div className="col-sm-6 col-md-3">
                  <div className="">
                    <Form.Item name="year" className="custom-border">
                      <DatePicker.YearPicker
                        className="form-control"
                        style={{
                          width: "100%",
                        }}
                        placeholder={
                          selectedMonthYear
                            ? t('aAttend.selectYear')
                            : `${moment().format("YYYY")}`
                        }
                        size="large"
                        allowClear={false}
                        onChange={(date, dateString) => {
                          handleFilterChange(dateString, "year");
                          setSelectedMonthYear(dateString);
                        }}
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
                    className="btn-success btn-block w-50"
                    disabled={
                      role === "admin"
                        ? false
                        : permissions?.attendanceManagement
                          ? false
                          : true
                    }
                  >
                    {t('search')}
                  </Button>

                  <Button
                    htmlType="button"
                    className="btn-secondary btn-block w-50"
                    onClick={handleReset}
                    disabled={
                      role === "admin"
                        ? false
                        : permissions?.attendanceManagement
                          ? false
                          : true
                    }
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
                <div
                  className="table-responsive"
                  style={{ background: "white" }}
                >
                  {/* <div className="table-responsive fixedColmn"> */}
                  <Table
                    className="fixedTableHeader"
                    // locale={{ emptyText: customEmptyText }}
                    locale={{
                      emptyText: isLoading ? null : customEmptyText
                    }}
                    style={{ background: "white" }}
                    loading={isLoading}
                    columns={columns}
                    dataSource={dataSource}
                    pagination={{
                      pageSize: 20,
                      showSizeChanger: false,
                      showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                      position: ['bottomCenter'],
                    }}
                    scroll={{
                      x: 'max-content',
                    }}
                    components={i18n.dir() === "rtl" ?
                      {
                        header: {
                          cell: ({ children }) => <th style={{ textAlign: 'right' }}>{children}</th>,
                        },
                      } :
                      null
                    }
                    onRow={i18n.dir() === "rtl" ?
                      (record, rowIndex) => {
                        return {
                          style: { textAlign: 'right' }, // Align table data to the right
                        };
                      } :
                      null
                    }
                  />
                </div>
              </div>
            </div>

            <Modal
              open={isModalVisible}
              onClose={closeModal}
              aria-labelledby="modal-modal-title"
              // className="modal custom-modal fade"

              aria-describedby="modal-modal-description"
              disableRestoreFocus
              BackdropProps={{
                style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
              }}
              sx={{ overflowY: "auto" }}
            >
              <div
                className="modal-dialog modal-dialog-centered modal-lg"
                role="document"
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h5
                      className="modal-title"
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      {t('aAttend.Modal.attendanceDetails')}
                    </h5>

                    <button
                      type="button"
                      className="close"
                      onClick={closeModal}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>

                  <div className="modal-body">
                    {dayRecord && (
                      <div className="row">
                        <div className="col-md-6">
                          <div className="card punch-status">
                            <div className="card-body">
                              <h5 className="card-title d-flex gap-1">
                                {t('timesheet')}
                                <h5
                                  className="text-muted"
                                  style={{ fontSize: "20px", unicodeBidi: 'plaintext' }}
                                >
                                  {moment(dayRecord.attendanceDate).format(
                                    "DD MMM YYYY"
                                  )}
                                </h5>
                              </h5>

                              <div className="punch-det">
                                <h6>
                                  <label>{t('checkInAt')}</label>
                                </h6>
                                <p>
                                  {dayRecord.checkInTime ? (
                                    <label>
                                      {moment(dayRecord.attendanceDate).format(
                                        "ddd, Do MMM YYYY"
                                      )}
                                      {"  "}
                                      {moment(
                                        dayRecord.checkInTime,
                                        "HH:mm"
                                      ).format("h:mm A")}
                                    </label>
                                  ) : (
                                    "--"
                                  )}
                                </p>
                              </div>

                              <div className="punch-info">
                                <div className="punch-hours">
                                  <label>
                                    {dayRecord.checkOutTime
                                      ? formatHoursMinutes(
                                        dayRecord.hoursWorked
                                      )
                                      : "--"}
                                  </label>
                                </div>
                              </div>

                              <div className="punch-det">
                                <h6>
                                  <label>{t('checkedOutAt')}</label>
                                </h6>
                                <p>
                                  <label>
                                    {dayRecord.checkOutTime
                                      ? `${moment(
                                        dayRecord.attendanceDate
                                      ).format("ddd, Do MMM YYYY")}  ${moment(
                                        dayRecord.checkOutTime,
                                        "HH:mm"
                                      ).format("h:mm A")}`
                                      : "--"}
                                  </label>
                                </p>
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
                                              dayRecord.status === "Late"
                                                ? "red"
                                                : dayRecord.status === "Absent"
                                                  ? "red"
                                                  : dayRecord.status === "Present"
                                                    ? "green"
                                                    : dayRecord.status === "On-Leave"
                                                      ? "orange"
                                                      : dayRecord.status === "Holiday"
                                                        ? "blue"
                                                        : "black",
                                          }}
                                        >
                                          {dayRecord.status}
                                        </label>
                                      </h6>
                                    </div>
                                  </div>
                                  <div className="col-md-6 col-6 text-center">
                                    <div className="stats-box">
                                      <p>{t('overtime')}</p>

                                      <h6>
                                        <label>
                                          {dayRecord.checkOutTime
                                            ? formatHoursMinutes(
                                              dayRecord.overTime
                                            )
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

                        <div className="col-md-6">
                          <div className="card recent-activity">
                            <div className="card-body">
                              <h5 className="card-title">{t('aAttend.Modal.todayActivity')}</h5>
                              <div
                                className="stats-list"
                                style={{ height: "365px", overflowY: "auto" }}
                              >
                                <p className="mb-0"
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                  }}>
                                  <label
                                    style={{ paddingLeft: '29px' }}>
                                    CheckIn:
                                  </label>
                                  <label
                                    style={{ paddingRight: '11px', paddingLeft: '20px' }}>
                                    CheckOut:
                                  </label>
                                  <label
                                    style={{ paddingRight: '19px' }}>
                                    Duration:
                                  </label>
                                </p>
                                {(multiple?.length >= 1 && aStatus !== "Absent" && aStatus !== "On-Leave" && aStatus !== "Holiday") ?
                                  multiple?.slice().reverse().map((attendance, index) => (
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
                                            <a style={{ width: '75px', textAlign: 'left' }}>
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
                                            <a style={{ width: '70px', textAlign: 'left' }}>
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

                                          <a style={{ paddingLeft: '9px', width: '75px', textAlign: 'left' }}>
                                            <label>
                                              {(!attendance?.checkInTime && !attendance?.checkOutTime) ? "" : formatHoursMinutes(attendance?.hoursWorked)}
                                            </label>
                                          </a>
                                        </p>
                                      </li>

                                    </ul>
                                  ))
                                  : customEmptyText
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="submit-section" style={{ marginTop: "0" }}>
                          <Form.Item>
                            <Button
                              className="btn btn-primary submit-btn"
                              onClick={() => {
                                setOpen({
                                  isAddOpen: true,
                                  isDelOpen: false,
                                  data: dayRecord,
                                });
                                setSelectedStatus(dayRecord.status);
                                //console.log(dayRecord);
                                //console.log(specific);
                              }}
                            >
                              {t('aAttend.Modal.editAttendance')}
                            </Button>
                          </Form.Item>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Modal>

            <Modal
              open={open.isAddOpen}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
              disableRestoreFocus
              BackdropProps={{
                style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
              }}
            >
              <div
                className="modal-dialog modal-dialog-centered"
                role="document"
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{t('aAttend.Modal.updateAttendance')}</h5>
                    <button
                      type="button"
                      className="close"
                      onClick={handleClose}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <Form
                      // form={form}
                      name="control-hooks"
                      onFinish={(val) => onFinish(val, open?.data)}
                      onFinishFailed={({ errorFields }) => {
                        const consecutiveSpacesError = errorFields.find(
                          (field) =>
                            field.errors
                              .toString()
                              .includes("consecutive spaces")
                        );
                        if (consecutiveSpacesError) {
                          message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                        } else {
                          message.error(t('allEmp.errors.fillRequiredFields'))
                        }
                      }}
                      initialValues={{
                        //checkInTime: open?.data ? open?.data?.holidayTitle : "",
                        checkInTime: open?.data.checkInTime
                          ? moment(open?.data?.checkInTime, "h:mm A")
                          : "",
                        checkOutTime: open?.data.checkOutTime
                          ? moment(open?.data?.checkOutTime, "h:mm A")
                          : "",
                        //status: open?.data?.status ? open?.data?.status : "",
                      }}
                      autoComplete="off"
                    >
                      <div className="form-group">
                        <label>{t('aAttend.Modal.checkInTime')}</label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="checkInTime"
                            className="custom-border"
                            rules={[
                              // Add a custom validation rule for check-in time
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  const status = getFieldValue("status");

                                  if (
                                    (selectedStatus === "Absent" || selectedStatus === "Holiday" || selectedStatus === "On-Leave") &&
                                    value
                                  ) {
                                    return Promise.reject(
                                      //`Check In Time cannot be set while the status is ${selectedStatus}.`
                                      t('aAttend.errors.checkInNotAllowed', { selectedStatus: selectedStatus })
                                    );
                                  }

                                  if ((selectedStatus === "Present" || selectedStatus === "Late") && !value) {
                                    return Promise.reject(t('aAttend.errors.checkInTimeRequired'));
                                  }

                                  if (
                                    selectedStatus === "Late" &&
                                    value &&
                                    moment(value, "HH:mm").isSameOrBefore(moment(specific?.shiftMaxStart, "HH:mm"))
                                  ) {
                                    return Promise.reject(
                                      //`Check-in time must be later than shift max start time: ${moment(specific?.shiftMaxStart, "HH:mm").format("HH:mm")}`
                                      t('aAttend.errors.checkInTimeBeforeMaxStart', { shiftMaxStart: moment(specific?.shiftMaxStart, "HH:mm").format("HH:mm") })
                                    );
                                  }

                                  if (selectedStatus === "Present" && value && moment(value, "HH:mm").isAfter(moment(specific?.shiftMaxStart, "HH:mm"))) {
                                    return Promise.reject(
                                      //`Check-in time must be earlier than shift max start time: ${moment(specific?.shiftMaxStart, "HH:mm").format("HH:mm")}`
                                      t('aAttend.errors.checkInTimeAfterMaxStart', { shiftMaxStart: moment(specific?.shiftMaxStart, "HH:mm").format("HH:mm") })
                                    );
                                  }

                                  // If status allows or if value is empty, no issue
                                  return Promise.resolve();
                                },
                              }),
                            ]}
                            validateTrigger="onSubmit"
                          >
                            <TimePicker
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder={t('aAttend.selectTime')}
                              format="HH:mm" // Format for 24-hour time
                              style={{ width: "100%" }}
                              //allowClear={false}
                              className="form-control"
                              size="large"
                            />
                          </Form.Item>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>{t('aAttend.Modal.checkOutTime')}</label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="checkOutTime"
                            className="custom-border"
                            rules={[
                              // Add a custom validation rule for check-out time
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  const status = getFieldValue("status");

                                  if (
                                    (selectedStatus === "Absent" || selectedStatus === "Holiday" || selectedStatus === "On-Leave") &&
                                    value
                                  ) {
                                    return Promise.reject(
                                      t('aAttend.errors.checkOutNotAllowed', { selectedStatus: selectedStatus })
                                    );
                                  }

                                  const checkInTime =
                                    getFieldValue("checkInTime");

                                  // If check-in time is empty and check-out time has a value, show an error
                                  if (!checkInTime && value) {
                                    return Promise.reject(
                                      t('aAttend.errors.checkOutTimeRequired')
                                    );
                                  }

                                  if (value && value.isBefore(checkInTime, "minute")) {
                                    return Promise.reject(t('aAttend.errors.checkOutTimeBeforeCheckIn'));
                                  }

                                  // If both are empty, no issue
                                  // If check-in is empty and check-out is empty, no issue
                                  return Promise.resolve();
                                },
                              }),
                            ]}
                            validateTrigger="onSubmit"
                          >
                            <TimePicker
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              placeholder={t('aAttend.selectTime')}
                              format="HH:mm" // Format for 24-hour time
                              style={{ width: "100%" }}
                              className="form-control"
                              size="large"
                            />
                          </Form.Item>
                        </div>
                      </div>
                      <div className="form-group form-focus">
                        <label>{t('status')}</label>
                        <Form.Item
                          name="status"
                          className="custom-border"
                          rules={[
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const checkInTime = getFieldValue("checkInTime");
                                const checkOutTime = getFieldValue("checkOutTime");

                                // Define the statuses that should not be allowed when check-in or check-out time is present
                                const disallowedStatuses = ["Absent", "On-Leave", "Holiday"];

                                // Check if either check-in or check-out time is present and the selected status is in the disallowed list
                                if ((checkInTime || checkOutTime) && disallowedStatuses.includes(value)) {
                                  return Promise.reject(
                                    t('aAttend.errors.statusWithTimePresent', { value: value })
                                  );
                                }

                                // If not in the disallowed statuses or if both check-in and check-out time are empty, no issue
                                return Promise.resolve();
                              },
                            }),
                          ]}
                          validateTrigger="onSubmit"
                        >
                          <Select
                            placeholder={t('aAttend.selectStatus')}
                            style={{ width: "100%" }}
                            defaultValue={selectedStatus}
                            onChange={(value) => setSelectedStatus(value)}
                          >
                            <Select.Option value="Present">
                              {t('present')}
                            </Select.Option>
                            <Select.Option value="Late">{t('late')}</Select.Option>
                            <Select.Option value="Absent">{t('absent')}</Select.Option>
                            <Select.Option value="On-Leave">
                              {t('on-Leave')}
                            </Select.Option>
                            <Select.Option value="Holiday">
                              {t('holiDay')}
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </div>

                      <div className="submit-section">
                        <Form.Item>
                          <Button
                            htmlType="submit"
                            className="btn btn-primary submit-btn"
                            disabled={loader}
                          >
                            {loader ? (
                              <Spin size="small" indicator={antIcon} />
                            ) : (
                              t('submit')
                            )}
                          </Button>
                        </Form.Item>
                      </div>
                    </Form>
                  </div>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>
      <Offcanvas />
    </>
  );
};

export default AttendanceAdmin;
