import React, {useEffect,useState } from 'react';
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';
import {   Avatar_01,Avatar_04,Avatar_05, Avatar_09, Avatar_10,Avatar_11,Avatar_12,Avatar_13 ,Avatar_16 } from "../../../Entryfile/imagepath"
import Tableavatar from '../../../_components/tableavatar/tableavatar'
import Sidebar from '../../../initialpage/Sidebar/sidebar';;
import Header from '../../../initialpage/Sidebar/header'
import Offcanvas from '../../../Entryfile/offcanvance';
import { apiServices } from '../../../Services/apiServices';
import { useSelector } from 'react-redux';
import { Table,Form, Input, DatePicker, Select, Button, Spin } from "antd";
import moment from "moment"; 
import Modal from "@mui/material/Modal";


const { Option } = Select;

const AttendanceAdmin = () => {
   
  const [menu, setMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false);

	const toggleMobileMenu = () => {
		setMenu(!menu)
	  }

  useEffect( ()=>{
    if($('.select').length > 0) {
      $('.select').select2({
        minimumResultsForSearch: -1,
        width: '100%'
      });
    }
  });  

  const [attendancerecords, setAttendanceRecords] = useState([]);
  const user_state = useSelector((state) => state.user.loginvalue);
  const [employeeAttendanceData, setEmployeeAttendanceData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);


  useEffect(() => {
    setIsLoading(true);
    
    // Create a function to fetch attendance data
    const fetchAttendanceData = async () => {
      apiServices("GET", 'attendance/employeesattendance', null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const attendanceData=res?.data?.Attendance
          setAttendanceRecords(attendanceData);
          console.log(attendanceData)
          console.log(attendancerecords)

          const uniqueEmployees = [...new Set(attendanceData.map((record) => record.user._id))];
          const employeeData = uniqueEmployees.map((employeeId) => {
            const employeeRecords = attendanceData.filter((record) => record.user._id === employeeId);
            return {
              employeeId,
              records: employeeRecords,
            };
          });
          //const newAttendanceData = [...fetchattend, ...Attendance.docs];
          setEmployeeAttendanceData(employeeData);
          
        }
      })
      .catch((error) => {
        console.log("error", error);
      }).finally(()=>{
        setIsLoading(false);
      });
    };
  
    // Call the fetchAttendanceData function
    fetchAttendanceData();
  }, []); // The empty array ensures that this effect runs only once when the component mounts

  const [dayRecord, setDayRecord] = useState(null);

  const openModal = (dayRecord,abbreviation) => {
    if (abbreviation !== "-" ) {
      setIsModalVisible(true);
      setDayRecord(dayRecord)
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };
  
  const formatHoursMinutes = (timeString) => {
    if (!timeString) return "None";
  
    const totalMinutes = parseFloat(timeString);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    return `${hours}h ${minutes}m`;
  };
  
  console.log(employeeAttendanceData)
  const daysInMonth = moment().daysInMonth();
const columns = [
  {
    title: "Employee",
    dataIndex: "employeeName",
    key: "employeeName",
  },
  ...Array.from({ length: daysInMonth }, (_, index) => ({
    title: `${index + 1}`,
    dataIndex: `day${index + 1}`,
    key: `day${index + 1}`,
    render: (text, record) => {
      const dayRecord = record[`day${index + 1}`];

      // Define styles based on status
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
        default:
          abbreviation = "-";
          color = "black";
          break;
      }

      return (
        <span
          style={{ color: color, cursor: abbreviation !== '-' ? 'pointer' : 'default' }}
          onClick={() => openModal(dayRecord,abbreviation)}
        >
          {abbreviation}
        </span>
      );
    },
  })),
];
const dataSource = employeeAttendanceData.map((employeeData) => {
  const rowData = {
    key: employeeData.employeeId,
    employeeName: employeeData.records[0].user.fullName,
  };

  employeeData.records.forEach((record) => {
    const day = moment(record.attendanceDate).date();
    rowData[`day${day}`] = record; // Store the entire day's record under day1, day2, ...
  });

  return rowData;
});
  
      return (  
        <>
        
        <div className={`main-wrapper ${menu ? 'slide-nav': ''}`}> 
          
        {/* <Header onMenuClick={(value) => toggleMobileMenu()} /> */}
        <Sidebar />   
      <div className="page-wrapper"> 
        <Helmet>
            <title>Attendance - HRMS Admin Template</title>
            <meta name="description" content="Login page"/>					
        </Helmet>
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">Attendance</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/app/main/dashboard">Dashboard</Link></li>
                <li className="breadcrumb-item active">Attendance</li>
              </ul>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        {/* Search Filter */}
        <Form

>
  <div className="row filter-row">
    <div className="col-sm-6 col-md-3">
      <div className="form-group">
        <Form.Item
          name="name"
          className="custom-border"
        >
          <Input
            className="form-control"
            
            placeholder="Employee Name"
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
    <div className="col-sm-6 col-md-3" style={{ display: 'flex', alignItems: 'flex-start', gap: '13px' }}>
      <button href="javascript:void(0)" type="submit" className="btn btn-success btn-block w-50"> Search </button>
      <button href="javascript:void(0)" type="submit" className="btn btn-success btn-block w-50" style={{ backgroundColor: '#b9b9b9', color: 'white', borderColor: '#aeaeae' }}> Reset </button>
    </div>
  </div>
</Form>

        {/* /Search Filter */}
        <div className="row">
          <div className="col-lg-12">
            <div className="table-responsive">
            <Table
            locale={{
              emptyText: isLoading ? (
                <Spin size="large" tip="Loading..." />
              ) : (
                "No data"
              ),
            }}
        columns={columns}
        dataSource={dataSource}
        pagination={false} // You can enable pagination if needed
      />
            </div>
          </div>
        </div>
        {/* <Modal

        open={isModalVisible}

        onClose={closeModal}

        aria-labelledby="modal-modal-title"

        // className="modal custom-modal fade"

        aria-describedby="modal-modal-description"

        disableRestoreFocus

        BackdropProps={{

          style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here

        }}

      >

      </Modal> */}
        {/* <Modal
  title="Attendance Details"
  visible={isModalVisible}
  onCancel={closeModal}
  footer={null}
>
  {dayRecord && 
  (<div className="row">
    <div className="col-md-4">
      <div className="card punch-status">
        <div className="card-body">
          <h5 className="card-title d-flex gap-1">
            Timesheet
            <h5 className="text-muted" style={{ fontSize: '20px' }}>
              {moment(dayRecord.attendanceDate).format("DD MMM YYYY")}
            </h5>
          </h5>

          <div className="punch-det">
            <h6>
              <label>{"Check in at"}</label>
            </h6>
            <p>
              <label>{moment(dayRecord.checkInTime, "HH:mm").format("h:mm A")}</label>
            </p>
          </div>

          <div className="punch-info">
            <div className="punch-hours">
              <label>
                {dayRecord.checkOutTime
                  ? formatHoursMinutes(dayRecord.hoursWorked)
                  : "--"}
              </label>
            </div>
          </div>

          <div className="punch-det">
            <h6>
              <label>{"Checked out at"}</label>
            </h6>
            <p>
              <label>{dayRecord.checkOutTime? moment(dayRecord.checkOutTime, "HH:mm").format("h:mm A") : "--"}</label>
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
              

              <div className="text-center">
                <div className="stats-box">
                  <p>Overtime</p>

                  <h6>
                    <label>
                      {dayRecord.checkOutTime
                        ? formatHoursMinutes(dayRecord.overTime)
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
      <div className="card recent-activity">
        <div className="card-body">
          <h5 className="card-title">Today Activity</h5>
          <ul className="res-activity-list">
            <li>
              <p className="mb-0">
                <label>Check In at</label>
              </p>
              <p className="res-activity-time">
                <i className="fa fa-clock-o" />
                <label>
                  {dayRecord.checkInTime ? moment(dayRecord.checkInTime, "HH:mm").format("h:mm A") : "--"}
                </label>
              </p>
            </li>
            <div className="text-center">
                <div className="stats-box">
                  <p>Status</p>

                  <h6>
                    <label
                      style={{
                        color:
                          dayRecord.status === "Late"
                            ? "orange"
                            : dayRecord.status === "Present"
                            ? "green"
                            : dayRecord.status === "On-Leave"
                            ? "red"
                            : "red",
                      }}
                    >
                      {dayRecord.status}
                    </label>
                  </h6>
                </div>
              </div>
            <li>
              <p className="mb-0">
                <label>Check Out at</label>
              </p>
              <p className="res-activity-time">
                <i className="fa fa-clock-o" />
                <label>
                  {dayRecord.checkOutTime ? moment(dayRecord.checkOutTime, "HH:mm").format("h:mm A") : "--"}
                </label>
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  )}
  
</Modal> */}

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

      >

        <div className="modal-dialog modal-dialog-centered modal-lg"  role="document">

          <div className="modal-content">

            <div className="modal-header">

              <h5 className="modal-title">

                Attendance

              </h5>

              <button type="button" className="close" onClick={closeModal}>

                <span aria-hidden="true">×</span>

              </button>

            </div>

            <div className="modal-body">

            {dayRecord && 
  (<div className="row">
    <div className="col-md-6">
      <div className="card punch-status">
        <div className="card-body">
          <h5 className="card-title d-flex gap-1">
            Timesheet
            <h5 className="text-muted" style={{ fontSize: '20px' }}>
              {moment(dayRecord.attendanceDate).format("DD MMM YYYY")}
            </h5>
          </h5>

          <div className="punch-det">
            <h6>
              <label>{"Check in at"}</label>
            </h6>
            <p>
              <label>{moment(dayRecord.attendanceDate).format("ddd, Do MMM YYYY")}{"  "}
                {moment(dayRecord.checkInTime, "HH:mm").format("h:mm A")}</label>
            </p>
          </div>

          <div className="punch-info">
            <div className="punch-hours">
              <label>
                {dayRecord.checkOutTime
                  ? formatHoursMinutes(dayRecord.hoursWorked)
                  : "--"}
              </label>
            </div>
          </div>

          <div className="punch-det">
            <h6>
              <label>{"Checked out at"}</label>
            </h6>
            <p>
              <label>{dayRecord.checkOutTime? `${moment(dayRecord.attendanceDate).format("ddd, Do MMM YYYY")}  ${moment(dayRecord.checkOutTime, "HH:mm").format("h:mm A")}` : "--"}</label>
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
              

              <div className="text-center">
                <div className="stats-box">
                  <p>Overtime</p>

                  <h6>
                    <label>
                      {dayRecord.checkOutTime
                        ? formatHoursMinutes(dayRecord.overTime)
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
          <h5 className="card-title">Today Activity</h5>
          <ul className="res-activity-list">
            <li>
              <h4 className="mb-0">
                <label>Check In at</label>
              </h4>
              <h5 className="res-activity-time">
                <i className="fa fa-clock-o" />
                <label>
                  <h5>{dayRecord.checkInTime ? moment(dayRecord.checkInTime, "HH:mm").format("h:mm A") : "--"}</h5>
                </label>
              </h5>
              
            </li>
            <br/>
            <br/>
            <div className="text-center">
                <div className="stats-box">
                  <h2>Status</h2>

                  <h4>
                    <label
                      style={{
                        color:
                          dayRecord.status === "Late"
                            ? "orange"
                            : dayRecord.status === "Present"
                            ? "green"
                            : dayRecord.status === "On-Leave"
                            ? "red"
                            : "red",
                      }}
                    >
                      {dayRecord.status}
                    </label>
                  </h4>
                </div>
              </div>
              <br/>
              <br/>
              
            <li>
              
              <h4 className="mb-0">
                <label>Check Out at</label>
              </h4>
              <h5 className="res-activity-time">
                <i className="fa fa-clock-o" />
                <label>
                  <h5>{dayRecord.checkOutTime ? moment(dayRecord.checkOutTime, "HH:mm").format("h:mm A") : "--"}</h5>
                </label>
              </h5>
            </li>
            {/* Add more entries as needed */}
          </ul>
        </div>
      </div>
    </div>
  </div>
  )}

            </div>

          </div>

        </div>

      </Modal>

      </div>
      {/*commented part here*/}
    </div>
  </div>
  <Offcanvas/>
        </>    
   
        );
  }

export default AttendanceAdmin;
