
import React, { useState ,useEffect  } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';
import { Form, Table, Input, Pagination, Empty, Select, Spin, message, Button, Tag, Tooltip, Segmented, DatePicker } from 'antd';
import 'antd/dist/antd.css';
import {itemRender,onShowSizeChange} from "../../paginationfunction"
import "../../antdstyle.css"
import { useSelector } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import Modal from "@mui/material/Modal";
import { apiServices } from '../../../Services/apiServices';
import DayViewTimesheet from './DayViewTimesheet';
import WeekViewTimeSheet from './WeekViewTimeSheet';

const EmployeeTimesheet = () => {

  const moment = require('moment');

  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const nav = useNavigate();

  const permissions = useSelector((state) => state?.permissionsSlice?.data);

  const user_state = useSelector((state) => state?.user?.loginvalue);
  const role = user_state?.user?.role
  const employee_id = user_state?.user?._id

  const [allTasks, setAllTasks] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [tableLoader, setTableLoader] = useState(true);
  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: ''
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekDates, setCurrentWeekDates] = useState([]);
  const [tableStartDate, setTableStartDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [view, setView] = useState('Day');

//   useEffect(() => {
//     if(role === 'admin' || permissions?.projectManagement) {
//       getAllTasks();
//       getAllProjects()
//     }else{
//       nav(`${role === 'client' ? '/client/client-profile' : role === 'focalperson' ? `/client/focal-profile` : role === 'admin' ? `/main/dashboard` : `/employee/dashboard`}`)
//     }
//   }, [])

  useEffect(() => {
    if(view === 'Week'){
      getCurrentWeekDates()
    }
  }, [selectedDate])

//   const getAllTasks = (values, current_page, page_size) => {
//     setTableLoader(true);
//     apiServices("GET", `tasks?${values === '' ? '' : values?.projectId === '' ? '' : values?.projectId ? `projectId=${values?.projectId}` : filterValues?.projectId ? `projectId=${filterValues?.projectId}` : ''}${values === '' ? '' : values?.title === '' ? '' : values?.title ? `&title=${values?.title}` : filterValues?.title ? `&title=${filterValues?.title}` : ''}${values === '' ? '' : values?.tag === '' ? '' : values?.tag ? `&tag=${values?.tag}` : filterValues?.tag ? `&tag=${filterValues?.tag}` : ''}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
//       .then((res) => {
//           if (res?.data?.success === true) {
//               setAllTasks(res?.data?.Task?.docs);
//               setPaginationDetail(res?.data?.Task)
//               setTableLoader(false);
//             }
//           })
//           .catch((err) => {
//         setTableLoader(false);
//         message.error(
//           `${
//             err?.response?.data?.msg
//               ? err?.response?.data?.msg
//               : err?.response?.data?.validation?.body?.message
//               ? err?.response?.data?.validation?.body?.message
//               : "Get All Tasks Error"
//           }!`
//         );
//       });
//   }

  const getAllProjects = () => {
    setTableLoader(true);
    // apiServices("GET", `project-management?page=${1}&limit=${99999}` , null, user_state)
    apiServices("GET", `project-management?employeeId=${employee_id}&page=${1}&limit=${99999}` , null, user_state)
      .then((res) => {
          if (res?.data?.success === true) {
                const sortedData = res?.data?.projects?.docs?.slice().sort((a, b) => a.projectName.localeCompare(b.projectName));
              setAllProjects(sortedData);
            }
          })
          .catch((err) => {
        setTableLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Get All Projects Error"
          }!`
        );
      });
  }

  const handleCalendarClick = () => {
    setShowCalendar(!showCalendar);
  };

  const handlePreviousWeek = () => {
    setShowCalendar(false);
    if(view === 'Day'){
      const newStartDate = new Date(tableStartDate);
      newStartDate.setDate(newStartDate.getDate() - 1);
      setTableStartDate(newStartDate);
      setSelectedDate(newStartDate);
    }else{
      const newStartDate = new Date(tableStartDate);
      newStartDate.setDate(newStartDate.getDate() - 7);
      setTableStartDate(newStartDate);
      setSelectedDate(newStartDate);
      // getCurrentWeekDates()
    }
  };

  const handleToday = () => {
    setShowCalendar(false);
    if(moment(selectedDate).format('YYYY-MM-DD') !== moment(new Date()).format('YYYY-MM-DD')){
      setSelectedDate(new Date());
      setTableStartDate(new Date());
      if(view === 'Week'){
        // getCurrentWeekDates()
      }
    }
  };

  const handleNextWeek = () => {
    setShowCalendar(false);
    if(view === 'Day'){
      const newStartDate = new Date(tableStartDate);
      newStartDate.setDate(newStartDate.getDate() + 1);
      setTableStartDate(newStartDate);
      setSelectedDate(newStartDate);
    }else{
      const newStartDate = new Date(tableStartDate);
      newStartDate.setDate(newStartDate.getDate() + 7);
      setTableStartDate(newStartDate);
      setSelectedDate(newStartDate);
      // getCurrentWeekDates()
    }
  };

  const getCurrentWeekDates = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - ((selectedDate.getDay() + 6) % 7));

    // Calculate the dates for the entire week
    const weekDatesArray = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      // weekDatesArray.push(date.toISOString().split('T')[0]);
      weekDatesArray.push(moment(date).format('YYYY-MM-DD'));
    }
    setCurrentWeekDates(weekDatesArray);
  }

  // calender week start from monday
  moment.locale('en', {
    week: {
      dow: 1,
    },
  });

  const disabledDate = (current) => {
    return current && current > new Date();
  };

      return (
        <>
        <div className="page-wrapper">
            <Helmet>
                <title>Timesheet - DaftarPro</title>
                <meta name="description" content="Login page"/>					
            </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Timesheet</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>Dashboard</Link></li>
                  <li className="breadcrumb-item active">Timesheet</li>
                </ul>
              </div>
              <div className="col-auto float-end ms-auto" style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                <Segmented
                    onChange={(val) => {
                      setView(val);
                      setShowCalendar(false);
                      if(val === 'Week'){
                        getCurrentWeekDates()
                      } 
                    }}
                    defaultValue={view}
                    className='segmentStyle'
                    block
                    size="large"
                    options={[
                    {
                        label: 'Day',
                        value: 'Day',
                    },
                    {
                        label: 'Week',
                        value: 'Week',
                    },
                    ]}
                />
                {
                  view === 'Day' ?
                  <a href="javascript:void(0)" className="btn add-btn" onClick={() => { setOpen({ isAddOpen: true, data: '' }); form2.setFieldsValue({date: moment(selectedDate, 'YYYY-MM-DD')}); getAllProjects(); setShowCalendar(false); }}><i className="fa fa-plus" /> Add Entry</a>
                  :
                  <a href="javascript:void(0)" className="btn add-btn" onClick={() => { setOpen({ isAddWeekOpen: true, data: '' }); getAllProjects(); setShowCalendar(false); }}><i className="fa fa-plus" /> Add Row</a>
                }
              </div>
            </div>
          </div>
          {/* /Page Header */}

          {/* Next Previous Buttons */}
          <div className="page-header" style={{marginTop: '40px'}}>
            <div className="row align-items-center">
              <div className="col">
                {
                  view === 'Day' ? 
                  <h3 className="card-title d-flex">
                      {selectedDate?.toLocaleDateString('en-US', { weekday: 'long' })}, 
                      <h3 className="card-title" style={{color: '#6C757D'}}>{moment(selectedDate).format('DD')} {moment(selectedDate).format('MMM')}</h3>
                      {/* <label>{selectedDate?.toLocaleDateString('en-US', { weekday: 'long' })},</label>
                      <label style={{color: '#6C757D'}}>{moment(selectedDate).format('DD')} {moment(selectedDate).format('MMM')}</label> */}
                  </h3> :
                  <h3 className="card-title d-flex">
                      {moment(currentWeekDates[0]).format('DD MMM')} - {moment(currentWeekDates[6]).format('DD MMM')} 
                  </h3>
                }
              </div>
              <div className="col-auto float-end ms-auto">
                <div style={{display: 'flex', gap: '10px'}}>
                    {showCalendar && (
                        <DatePicker
                            className="hideDatePickerInput"
                            disabledDate={disabledDate}
                            open={showCalendar} // Set the visibility based on your state variable showCalendar
                            // onOpenChange={(open) => setShowCalendar(open)} // Handle the open state change
                            defaultValue={moment(selectedDate, 'YYYY-MM-DD')}
                            value={moment(selectedDate, 'YYYY-MM-DD')}
                            onChange={(date) => {
                              setSelectedDate(date?._d);
                              setTableStartDate(date?._d);
                              setShowCalendar(false)
                              if(view === 'Week'){
                                // getCurrentWeekDates()
                              } 
                            }}
                        />
                    )
                    }
                    <button
                        onClick={handleCalendarClick}
                        className='NextPrevButtons'
                        style={{border: '2px solid #DEE2E6', borderRadius: '8px', background: '#fff', color: '#333333', minWidth: '42px', height: '42px', padding: '4.6px 0px 0px 0px'}}
                    >
                        <i className="fa fa-calendar" style={{fontSize: '18px', margin: '0px'}} />
                    </button>
                    <button
                        onClick={handlePreviousWeek}
                        className='NextPrevButtons'
                        style={{border: '2px solid #DEE2E6', borderRadius: '8px', background: '#fff', color: '#333333', minWidth: '42px', height: '42px', padding: '4px 3.6px 0px 0px'}}
                    >
                        <i className="fa fa-angle-left" style={{fontSize: '26px', margin: '0px'}} />
                    </button>
                    <button
                        onClick={handleToday}
                        className='NextPrevButtons'
                        style={{border: '2px solid #DEE2E6', borderRadius: '8px', background: '#fff', color: '#333333', minWidth: '90px', height: '42px', paddingTop: '3px'}}
                    >
                        <span style={{fontSize: '16px', fontWeight: '500'}}>Today</span>
                    </button>
                    <button
                        onClick={handleNextWeek}
                        disabled={moment(selectedDate).format('YYYY-MM-DD') === moment(new Date()).format('YYYY-MM-DD')}
                        className='NextPrevButtons'
                        style={{ cursor: moment(selectedDate).format('YYYY-MM-DD') === moment(new Date()).format('YYYY-MM-DD') ? 'no-drop' : 'pointer', border: '2px solid #DEE2E6', borderRadius: '8px', background: moment(selectedDate).format('YYYY-MM-DD') === moment(new Date()).format('YYYY-MM-DD') ? '#ebebeb' : '#fff', color: moment(selectedDate).format('YYYY-MM-DD') === moment(new Date()).format('YYYY-MM-DD') ? '#bdbdbd' : '#333333', minWidth: '42px', height: '42px', padding: '4px 0px 0px 3.6px'}}
                    >
                        <i className="fa fa-angle-right" style={{fontSize: '26px', margin: '0px'}} />
                    </button>
                </div>
              </div>
            </div>
          </div>
          {/* Next Previous Buttons */}

          <div className="row">
            <div className="col-md-12">

              {
                view === 'Day' &&
                <DayViewTimesheet
                  tableStartDate={tableStartDate}
                  setTableStartDate={setTableStartDate}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  open={open}
                  setOpen={setOpen}
                  form2={form2}
                  allProjects={allProjects}
                  getAllProjects={getAllProjects}
                  setShowCalendar={setShowCalendar}
                />
              }

              {
                view === 'Week' &&
                <WeekViewTimeSheet
                  tableStartDate={tableStartDate}
                  setTableStartDate={setTableStartDate}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  open={open}
                  setOpen={setOpen}
                  allProjects={allProjects}
                  getAllProjects={getAllProjects}
                  currentWeekDates={currentWeekDates}
                  setShowCalendar={setShowCalendar}
                />
              }

            </div>
          </div>
        </div>
        {/* /Page Content */}
      </div>
        </>
        
      );
   
}

export default EmployeeTimesheet