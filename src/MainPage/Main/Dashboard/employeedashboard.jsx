/**
 * Signin Firebase
 */
import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { Avatar_02, Avatar_04, Avatar_05, Avatar_07, Avatar_08, Avatar_09, user_icon } from '../../../Entryfile/imagepath.jsx'
import Header from '../../../initialpage/Sidebar/header'
import Sidebar from '../../../initialpage/Sidebar/sidebar';
import Offcanvas from '../../../Entryfile/offcanvance/index.jsx';
import { apiServices } from '../../../Services/apiServices.js';
import { useSelector } from 'react-redux';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { Avatar, Table, Card, Spin, Empty } from 'antd';

const EmployeeDashboard = () => {

  const [menu, setMenu] = useState(false)
  const user_state = useSelector((state) => state.user.loginvalue);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleMobileMenu = () => {
    setMenu(!menu)
  }

  const moment = require("moment");
  let nowdate = new Date(Date.now());

  const todayDate = moment(nowdate).format("dddd, DD MMM YYYY")

  const formatHoursMinutes = (timeString) => {
    if (!timeString) return "None";
  
    const totalMinutes = parseFloat(timeString);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    return `${hours}h ${minutes}m`;
  };

  useEffect(()=>{
    fetchdata();
  },[])

  const fetchdata = async () => {
    setIsLoading(true)
    apiServices("GET", `user/employee-overview`, null, user_state)
    .then((res) => {
      if (res.data.success === true) {
        const userData=res?.data
        setUserData(userData)
        console.log(userData)
        setIsLoading(false); 
        setFirstLoad(false);       
      }
    })
    .catch((error) => {
      console.log("error", error);
    });
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
        height: "282px",
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
            No Employees
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
      title: '#',
      dataIndex: 'index',
      key: 'index',
      width: '10%',
      render: (index) => <span>{index}</span>,
    },
    {
      title: 'Employee Name',
      dataIndex: 'userId',
      key: 'employee',
      width: '60%',
      render: (userId) => (
        <div>
          <img src={userId.imageUrl || user_icon} alt={userId.fullName} className="avatar" />
          {userId.fullName}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '35%',
      render: (status) => (
        <span style={{ color: status === 'Pending' ? 'orange' : status === 'Approved' ? 'green' : 'red' }}>
        {status}
      </span>
      ),
    },
  ];

  const dataSourceWfh = userData?.employeeOnWfh || [];
  const dataSourceLeave = userData?.employeeOnLeave || [];

  const workAnniversaryData = userData?.workAnniversary || [];
  const birthdaysData = userData?.todayBirthdays || [];

  const tableContainerStyle = {
    maxWidth: '100%',
    overflowX: 'auto',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', // Adjust the shadow values
  };


  return (
    <>

      <div className={`main-wrapper ${menu ? 'slide-nav' : ''}`}>

        {/* <Header onMenuClick={(value) => toggleMobileMenu()} />
        <Sidebar /> */}
        <div className="page-wrapper">
          <Helmet>
            <title>Employee Dashboard - DaftarPro</title>
            <meta name="description" content="Dashboard" />
          </Helmet>
          {/* Page Content */}
          <div className="content container-fluid">
            <div className="row">
              <div className="col-md-12">{isLoading ? (
                <Spin size="large" />
              ) : (

                <div className="welcome-box">
                  <div className="welcome-img">
                    <img alt="" src={userData?.user?.imageUrl || Avatar_02} />
                  </div>
                  <div className="welcome-det">
                    <h3>{userData? `Welcome, ${userData?.user?.fullName }`:" "} </h3>
                    <p><label>{todayDate}</label></p>
                  </div>
                </div>
              )}
              </div>
            </div>
            <div className="row">
            <div className="col-lg-8 col-md-8">
              <section className="dash-section">
                <label className="dash-sec-title">Employees on Work From Home</label>
                <div style={{ maxWidth: '100%', overflowX: 'auto',boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
                <Table
                  columns={columnsWfh}
                  className='fixedTableHeader'
                  style={{height: '349px', background: 'white'}}
                  dataSource={dataSourceWfh.map((item, index) => ({ ...item, index: index + 1 }))}
                  pagination={false}
                  locale={{
                    emptyText: isLoading ? (
                      <Spin size="large" style={{height: '280px', display: 'flex', justifyContent: 'center', alignItems: 'center'}} tip="Loading..." />
                    ) : (
                      customEmptyText
                    ),
                  }}
                />
                </div>
              </section>

              <section className="dash-section">
                <label className="dash-sec-title">Employees On Leave</label>
                <div style={{ maxWidth: '100%', overflowX: 'auto',boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' }}>
                <Table
                  columns={columnsWfh}
                  className='fixedTableHeader'
                  style={{height: '349px', background: 'white'}}
                  dataSource={dataSourceLeave.map((item, index) => ({ ...item, index: index + 1 }))}
                  pagination={false}
                  locale={{
                    emptyText: isLoading ? (
                      <Spin size="large" style={{height: '280px', display: 'flex', justifyContent: 'center', alignItems: 'center'}} tip="Loading..." />
                    ) : (
                      customEmptyText
                    ),
                  }}
                />
                </div>
              </section>
            </div>

              <div className="col-lg-4 col-md-4">
                <div className="dash-sidebar">
                <section>
                    <h5 className="dash-title">Projects</h5>
                    <div className="card">
                      <div className="card-body">
                        <div className="time-list">
                          <div className="dash-stats-list">
                            <h4>71</h4>
                            <p>Total Tasks</p>
                          </div>
                          <div className="dash-stats-list">
                            <h4>14</h4>
                            <p>Pending Tasks</p>
                          </div>
                        </div>
                        <div className="request-btn">
                          <div className="dash-stats-list">
                            <h4>2</h4>
                            <p>Total Projects</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section>
                    <h5 className="dash-title"><label>Your Leaves</label></h5>
                    <div className="card">
                    <div className="card-body">
                      <div className="time-list">
                        <div className="dash-stats-list">
                          <h4>{userData?.leave?.leavesTaken || 0}</h4> {/* Display taken leave */}
                          <p>Leaves Taken</p>
                        </div>
                        <div className="dash-stats-list">
                          <h4>{userData?.leave?.remainingLeaves || 0}</h4> {/* Display remaining leave */}
                          <p>Remaining</p>
                        </div>
                      </div>
                      </div>
                    </div>
                  </section>
                  <section>
                    <h5 className="dash-title"><label>Hours Worked</label></h5>
                    <div className="card">
                      <div className="card-body">
                        <div className="time-list">
                        {isLoading ? (
                          <Spin size="large" /> // Display Spin while loading
                        ) : (
                          <>
                          <div className="dash-stats-list">
                            <h4>{formatHoursMinutes(userData?.hoursWorked?.today)}</h4> {/* Display hours worked today */}
                            <p>Today</p>
                          </div>
                          <div className="dash-stats-list">
                            <h4>{formatHoursMinutes(userData?.hoursWorked?.lastFiveDays)}</h4> {/* Display hours worked in last 5 days */}
                            <p>Last 5 Days</p>
                          </div>
                          </>
                        )}
                        </div>
                      </div>
                    </div>
                  </section>
                  <section>
                    <h5 className="dash-title"><label>Work Anniversaries</label></h5>
                    <div className="card">
                      <div className="card-body">
                      {isLoading ? (
                        <Spin size="large" />
                      ) : (
                        userData?.workAnniversary.length === 0 ? (
                          <p>No Work anniversaries today</p>
                        ) : (
                        workAnniversaryData.map((item) => {
                          const joiningDate = new Date(item.joiningDate);
                          const today = new Date();
                          const yearsSinceJoining = today.getFullYear() - joiningDate.getFullYear();

                          return (
                            <div key={item._id} className="time-list">
                              <div className="dash-stats-list">
                                <h4><img src={item.imageUrl || user_icon} alt={item.fullName} className="avatar" />{item.fullName}</h4>
                                <p>{yearsSinceJoining} years at the company</p>
                              </div>
                            </div>
                          );
                        })
                        ))}
                      </div>
                    </div>
                  </section>

                  <section>
                    <h5 className="dash-title">Birthdays</h5>
                    <div className="card">
                      <div className="card-body">
                      {isLoading ? (
                        <Spin size="large" />
                      ) : (
                        userData?.todayBirthdays.length === 0 ? (
                          <p>No birthdays today</p>
                        ) : (
                      birthdaysData.map((item) => {
                          const dateOfBirth = new Date(item.dateOfBirth);
                          const today = new Date();
                          const age = today.getFullYear() - dateOfBirth.getFullYear();

                          return (
                            <div key={item._id} className="time-list">
                              <div className="dash-stats-list">
                                
                                <h4><img src={item.imageUrl || user_icon} alt={item.fullName} className="avatar" />{item.fullName}</h4>
                                <p>{age} years old</p>
                              </div>
                            </div>
                          );
                        })
                        ))}
                      </div>
                    </div>
                  </section>
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
}

export default EmployeeDashboard;
