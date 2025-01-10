import React, { useEffect, useState } from 'react'
import checkTickIcon from "../../../files/Icons/checkTickIcon.png";
import folderOpenIcon from "../../../files/Icons/folderOpenIcon.png";
import Modal from "@mui/material/Modal";
import { Form, Table, Input, Pagination, Empty, Select, Spin, message, Button, Tag, Tooltip, Segmented, DatePicker, TimePicker } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { apiServices } from '../../../Services/apiServices';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { itemRender } from '../../paginationfunction';
import { useTranslation } from 'react-i18next';

function DayViewTimesheet({ tableStartDate, setTableStartDate, selectedDate, setSelectedDate, open, setOpen, form2, allProjects, getAllProjects, allTaskboards, getAllTaskBoards, setShowCalendar }) {
  const { t, i18n } = useTranslation();
    const moment = require('moment');

    const [form] = Form.useForm();
    // const [form2] = Form.useForm();
    const nav = useNavigate();

    const permissions = useSelector((state) => state?.permissionsSlice?.data);
  
    const user_state = useSelector((state) => state?.user?.loginvalue);
    const role = user_state?.user?.role

  const [allData, setAllData] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [descLength, setDescLength] = useState(0);
  const [loader, setLoader] = useState(false);
  const [loader2, setLoader2] = useState(false);
  const [buttonDisable, setButtonDisable] = useState(true);
  const [taskLoader, setTaskLoader] = useState(false);
  const [tableLoader, setTableLoader] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isProjectAssociated, setIsProjectAssociated] = useState(false);
  const [paginationDetail, setPaginationDetail] = useState();

let t_data = [
    {
        _id: 1,
        projectId: {
            _id: "652e535c13934c8ecc420eea",
            projectName: 'Monndaine 11'
        },
        taskId: {
            _id: "65361fcb4215f750c657235a",
            title: 'ADS 1213'
        },
        hoursWorked: "02:00",
        date: "2023-11-07T09:55:58.528Z",
        notes: "lkklklj444 lkjlkjlk lkjlkj lklkjl lkjlkj lkjklj lkjlkj jhg h gf jhk hkj iuy kj kjh iuy uiyiuyiu yuiiy ytytrytryt yttyryt rytrytry ytytrty ygjhh kj444."
    },
    {
        _id: 2,
        projectId: {
            _id: "652e535c13934c8ecc420eea",
            projectName: 'Monndaine'
        },
        taskId: {
            _id: "65361fcb4215f750c657235a",
            title: 'ADS 1213'
        },
        hoursWorked: "03:00",
        date: "2023-11-03",
        notes: "lkklklj333"
    },
    {
        _id: 3,
        projectId: {
            _id: "652e535c13934c8ecc420eea",
            projectName: 'Monndaine'
        },
        taskId: {
            _id: "65361fcb4215f750c657235a",
            title: 'ADS 1213'
        },
        hoursWorked: "10:00",
        date: "2023-11-03",
        notes: "lkklklj33310000"
    },
]
useEffect(() => {
  if (open?.isAddOpen) {
      // Reset toggle state when modal is opened
      if (open?.data) {
          // Editing mode
          if (open.data.projectId) {
              setIsProjectAssociated(true); // Task is associated with a project
              form2.setFieldsValue({ boardId: undefined }); // Reset taskboard field
          } else if (open.data.boardId) {
              setIsProjectAssociated(false); // Task is associated with a task board
          }
      } else {
          // Adding mode
          setIsProjectAssociated(false); // Default to task board
      }
  }
}, [open]);

  useEffect(() => {
    getData();
    setCurrentPage(1);
    setPageSize(20);
  }, [selectedDate])

  const getData = (current_page, page_size) => {
    const current_date = moment(selectedDate).format('YYYY-MM-DD')
    // console.log(current_date);

    setTableLoader(true)
    apiServices("GET", `timesheet?page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}${current_date ? `&timesheetFrom=${current_date}` : ''}${current_date ? `&timesheetTo=${current_date}` : ''}&employeeOnly=${true}`, null, user_state)
      .then((res) => {
          if (res?.data?.success === true) {
            setAllData(res?.data?.Timesheet?.docs);
            setPaginationDetail(res?.data?.Timesheet);
            setTableLoader(false);
          }
          })
          .catch((err) => {
        setTableLoader(false)
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('Timesheetemployee.viewTimesheetError')
          }!`
        );
      });

    // const filtered = t_data.filter((timesheet) => timesheet?.date === moment(selectedDate).format('YYYY-MM-DD'))
    // const filtered = t_data.filter((timesheet) => moment(timesheet?.date).format('YYYY-MM-DD') === moment(selectedDate).format('YYYY-MM-DD'))
    // setAllData(filtered);
  }

  const handleSelectionChange = (value) => {
    setIsProjectAssociated(value === 'project')
    if (!isProjectAssociated) {
      setAllTasks([])
      form2.setFieldsValue({taskId: '', projectId: ''})
  } else {
      setAllTasks([])
      form2.setFieldsValue({taskId: '', boardId: ''})
  }
  }
  const getAllTasks = (id) => {
    setTaskLoader(true);
    apiServices("GET", `tasks?id=${id}&page=${1}&limit=${99999}`, null, user_state)
      .then((res) => {
          if (res?.data?.success === true) {
              const sortedData = res?.data?.Task?.docs?.slice().sort((a, b) => a.title.localeCompare(b.title));
              setAllTasks(sortedData);
              setTaskLoader(false);
            }
          })
        .catch((err) => {
        setTaskLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('Timesheetemployee.getAllTasksError')
          }!`
        );
      });
  }

  const searchHandler = (val, type) => {
    let dropdownValues = []
    if (type === 'project'){
      allProjects.forEach((proj)=>{
        dropdownValues.push(proj.projectName?.toLowerCase())
     })
    } else if (type === 'task'){
        allTasks.forEach((proj)=>{
          dropdownValues.push(proj.title?.toLowerCase())
       })
      }
  
    if(val !== ''){
      dropdownValues.some((team) => {
        if(team.includes(val?.toLowerCase())){
          // setNoData(false);
          return true
        }else{
          // setNoData(true);
        }
      })
    }else{
      // setNoData(false)
    }
  }

  const onFinishAdd = (values) => {
    let data = {
        ...values,
        hoursWorked: moment(values?.hoursWorked).format('HH:mm'),
        date: moment(values?.date).format('YYYY-MM-DD'),
    }

    setLoader(true);
    apiServices("POST", 'timesheet', data, user_state)
      .then((res) => {
          if (res?.data?.success === true) {
              getData(currentPage, pageSize);
              handleClose();
              message.success(t('Timesheetemployee.timesheetAddedSuccessfully'));
              setLoader(false);
            }
          })
          .catch((err) => {
        setLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('Timesheetemployee.addTimesheetError')
          }!`
        );
      });
  }

  const onFinishEdit = (values) => {
    console.log("values on edit :", values);
    
    let updated_data = {
        ...values,
        _id: open?.data?._id,
        hoursWorked: moment(values?.hoursWorked).format('HH:mm'),
        date: moment(values?.date).format('YYYY-MM-DD'),

        submittedForApproval: false,
        status: 'No-Status'
    }

    setLoader(true);
    apiServices("PUT", 'timesheet', updated_data, user_state)
      .then((res) => {
          if (res?.data?.success === true) {
              getData(currentPage, pageSize);
              setAllData(
                allData.map((data) => {
                    if (data._id === open?.data?._id) {
                  return {
                    ...data,
                    ...updated_data,
                    projectId: { _id: open?.data?.projectId?._id, projectName: open?.data?.projectId?.projectName },
                    taskId: {_id: open?.data?.taskId?._id, title: open?.data?.taskId?.title }
                  };
                } else {
                  return {
                      ...data,
                    };
                  }
                })
              );
              handleClose();
              message.success(t('Timesheetemployee.timesheetUpdatedSuccessfully'));
              setLoader(false);
            }
          })
          .catch((err) => {
          setLoader(false);
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : t('Timesheetemployee.UpdateTimesheetError')
            }!`
          );
        });
  }

  const onHandleDelete = (id) => {
    // console.log(id);
    const data = {
      _id: id,
    };
    setLoader(true)
    apiServices("DELETE", "timesheet", data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          // setData([...data.filter((designation) => designation._id !== id)]);
          // getData(currentPage, pageSize)
          if(allData?.length > 1){
            getData(currentPage, pageSize)
          }else{
            if(currentPage === 1){
              getData(currentPage, pageSize)
            }else{
              getData(currentPage-1, pageSize)
              setCurrentPage(prev => prev-1)
            }
          }
          handleClose('delete');
          message.success(t('Timesheetemployee.timesheetDeletedSuccessfully'));
          setLoader(false)
        }
      })
      .catch((err) => {
        setLoader(false)
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('Timesheetemployee.deleteTimesheetError')
          }!`
        );
      });
  }


    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekStartDate = new Date(tableStartDate);
    weekStartDate.setDate(
      weekStartDate.getDate() - ((weekStartDate.getDay() + 6) % 7)
    );

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setTableStartDate(date);
      };

      const handleClose = (type) => {
        setOpen({
          isAddOpen: false,
          isDelOpen: false,
          data: ''
        });
        if(type !== 'delete'){
          form2.resetFields();
          setDescLength(0);
        }

      };

    const Dayscolumns = daysOfWeek.map((day, index) => {
      const currentDate = new Date();
      const cellDate = new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index);
      const isToday = currentDate.toDateString() === cellDate.toDateString();
      const isFuture = currentDate < cellDate;
      const backgroundColor = isToday ? "green" : isFuture ? "red" : "white";

      return {
          title: (
            <div
              onClick={() => {
                if(!isFuture){
                  handleDateClick(
                  new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index)
                  );
                  setShowCalendar(false)
                }
              }}
              style={{
                  display: "grid",
                  placeContent: 'center',
                  borderRadius: '6px',
                  padding: '9px 0px',
                  cursor: isFuture ? 'no-drop' : 'pointer',
                  background:
                  selectedDate.toDateString() ===
                  new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index).toDateString()
                      ? "#E9E9E9"
                      : "white",
              }}
            >
              <label style={{cursor: isFuture ? 'no-drop' : 'pointer', color: isFuture ? '#cfcfcf' : '#262626', textAlign: 'center', fontWeight: '700', lineHeight: '20px'}}>{day}</label>
              <label style={{cursor: isFuture ? 'no-drop' : 'pointer', color: isFuture ? '#cfcfcf' : '#666', lineHeight: '20px'}}>
                {new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index).getDate()}{" "}
                {new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index).toLocaleDateString("en-US", { month: "short" })}
              </label>
            </div>
          ),
          dataIndex: day,
          key: day,
        }
      });

      const onFormValuesChange = () => {
        const currentValues = form2.getFieldsValue();
        const initalValues = open?.data;
        let current_data = {
          notes: currentValues?.notes,
          projectId: currentValues?.projectId,
          taskId: currentValues?.taskId,
          hoursWorked: currentValues?.hoursWorked ? moment(currentValues?.hoursWorked).format('HH:mm') : '',
          date: moment(currentValues?.date).format('YYYY-MM-DD')
        }
        let initial_data = {
          notes: initalValues?.notes,
          projectId: initalValues?.projectId?._id,
          taskId: initalValues?.taskId?._id,
          hoursWorked: initalValues?.hoursWorked,
          date: moment(initalValues?.date).format('YYYY-MM-DD')
        }
        const areObjectsEqual = JSON.stringify(current_data) === JSON.stringify(initial_data);
        setButtonDisable(areObjectsEqual ? true : false)
        // console.log(areObjectsEqual ? "Same" : "Not Same");
      }

      const antIcon = (
        <LoadingOutlined
          style={{
            fontSize: 24,
            marginBottom: '-2px',
            color: '#fff'
          }}
          spin
        />
      );
      const antIcon3 = (
        <LoadingOutlined
            style={{
            fontSize: 22,
            color: '#FF9B44',
            width: '148px'
            }}
            spin
        />
        );
        const antIcon4 = (
        <LoadingOutlined
            style={{
            fontSize: 22,
            color: '#FF9B44',
            width: '120px'
            }}
            spin
        />
        );

      const totalTime = () => {
        const totalMinutes = allData?.reduce((acc, item) => acc + item?.hoursWorked?.split(':')?.reduce((acc, val, idx) => acc + parseInt(val ? val : 0, 10) * (idx === 0 ? 60 : 1), 0), 0);
        const hours = Math.floor(totalMinutes / 60) || 0;
        const minutes = totalMinutes % 60 || 0;
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        return `${formattedHours}:${formattedMinutes}`
      }

      const handleSubmitApproval = () => {
        // const found = allData.some(item => item?.submittedForApproval === true)
        let data = {
          submittedForApproval: true,
          status: 'Pending'
        }
        setLoader2(true);
    
        allData.map((item, index) => {
          let updated_data = {
            ...data,
            _id: item?._id
          }
    
          apiServices("PUT", 'timesheet', updated_data, user_state)
          .then((res) => {
            if (res?.data?.success === true) {
              if(index === allData?.length - 1){
                getData(currentPage, pageSize);
                message.success(t('Timesheetemployee.timesheetSubmittedSuccessfully'));
                setLoader2(false);
              }
            }})
            .catch((err) => {
            setLoader2(false);
            message.error(
              `${
                err?.response?.data?.msg
                  ? err?.response?.data?.msg
                  : err?.response?.data?.validation?.body?.message
                  ? err?.response?.data?.validation?.body?.message
                  : t('Timesheetemployee.submitTimesheetError')
              }!`
            );
          });
        })
      }

      const disabledDate = (current) => {
        return current && current > new Date();
      };

  return (
    <div>
        <>
            <div className="table-responsive timeSheetDayTable" style={{borderRadius: '10px'}}>	
                <Table
                    pagination= {false}
                    // style = {{overflowX : 'auto'}}
                    columns={Dayscolumns}             
                    showHeader
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
            <div style={{color: '#6C757D', fontSize: '18px', fontWeight: '500', margin: '30px 0px'}}>
            {t('Timesheetemployee.actualtime')}
            </div>

            {/* Lists */}
            {
                tableLoader ? <div style={{display: 'flex', justifyContent: 'center', height: '150px', background: '#efefef', alignItems: 'center', borderRadius: '10px'}}> <Spin size='middle' /> </div> :
                allData?.length > 0 ?
                allData?.map((record, index) => (
                  <>
                    {/* <div key={index} style={{background: '#fff', border: '1px solid #DEE2E6', borderRadius: '7px', display: 'flex', height: '220px', margin: '20px 0px', padding: '30px 40px', justifyContent: 'space-between'}}> */}
                    <div key={index} style={{background: '#fff', border: '1px solid #DEE2E6', display: 'grid', borderRadius: '7px', height: '220px', margin: '20px 0px', padding: '30px 40px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                          <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '14px'}}>
                              <h4 className="project-title" style={{color: '#333', display: 'flex', alignItems: 'center', gap: '13px'}}>
                                  {/* <Link to={`/projects/projects-view/${project?._id}`}> */}
                                  <img src={folderOpenIcon} width='29px' />
                                  {record?.projectId?.projectName  ? <label>{record?.projectId?.projectName}</label>  : <label>{record?.boardId?.boardTitle} <span
              style={{
                marginLeft: "8px",
                backgroundColor: "#7460EE",
                color: "#fff",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            >
              {t('Taskboard')}
            </span></label>}
                                  {/* </Link> */}
                              </h4>
                              <h4 className="project-title" style={{color: '#333', display: 'flex', alignItems: 'center', gap: '18px'}}>
                                  <img src={checkTickIcon} width='25px' />
                                  <label>{record?.taskId?.title}</label>
                              </h4>
                              {
                                record?.notes?.length > 0 &&
                                <div style={{marginRight: '25px'}}>
                                    <p style={{margin: '0px'}}>
                                        <label className="text-muted longText2">{record?.notes}</label>
                                    </p>
                                </div>
                              }
                          </div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '45px'}}>
                              <h3>{record?.hoursWorked}</h3>
                              <div className="dropdown dropdown-action text-end">
                                {/* <a disabled={record?.submittedForApproval} onClick={() => setShowCalendar(false)} href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons" style={{fontSize: '28px', marginTop: '-3px'}}>more_vert</i></a> */}
                                {/* <a disabled={record?.status === 'Approved'} onClick={() => setShowCalendar(false)} href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons" style={{fontSize: '28px', marginTop: '-3px'}}>more_vert</i></a> */}
                                <a onClick={() => setShowCalendar(false)} href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons" style={{fontSize: '28px', marginTop: '-3px'}}>more_vert</i></a>
                                <div className="dropdown-menu dropdown-menu-right">
                                    <a className="dropdown-item" href="javascript:void(0)"
                                        onClick={() => {
                                            
                                            console.log("recORDing",record);
                                            getAllProjects()
                                            getAllTaskBoards()
                                            getAllTasks(record?.projectId?._id ? record?.projectId?._id : record?.boardId?._id)
                                            let data = {
                                                ...record,
                                                boardId: record?.boardId?._id,
                                                projectId: record?.projectId?._id,
                                                taskId: record?.taskId?._id,
                                                hoursWorked: record?.hoursWorked ? moment(record?.hoursWorked, 'HH:mm') : '',
                                                date: moment(record?.date, 'YYYY-MM-DD')
                                            }
                                            form2.setFieldsValue(data);
                                            setOpen({ isAddOpen: true, data: record });
                                            setAllTasks([])
                                            setDescLength(record?.notes?.length)
                                        }}
                                    >
                                        <i className="fa fa-pencil m-r-5" /> {t('edit')}
                                    </a>
                                    <a className="dropdown-item" href="javascript:void(0)"
                                        onClick={() => {
                                            setOpen({ isAddOpen: false, isEditOpen: false, isDelOpen: true, data: record });
                                        }}
                                    >
                                        <i className="fa fa-trash-o m-r-5" /> {t('delete')}
                                    </a>
                                </div>
                              </div>
                          </div>
                        </div>
                        {
                          record?.status === 'Approved' ?
                          <label style={{fontSize: '16px', fontWeight: '400', color: '#00b112', marginLeft: 'auto', marginTop: 'auto',marginBottom: 'auto', paddingRight: '15px'}}>{t('Timesheetemployee.approved')}</label>
                          : record?.status === 'Declined' ?
                          <label style={{fontSize: '16px', fontWeight: '400', color: '#DD0000', marginLeft: 'auto', marginTop: 'auto',marginBottom: 'auto', paddingRight: '15px'}}>{t('Timesheetemployee.declined')}</label>
                          : record?.submittedForApproval &&
                          <label style={{fontSize: '16px', fontWeight: '400', color: '#00b112', marginLeft: 'auto', marginTop: 'auto',marginBottom: 'auto', paddingRight: '15px'}}>{t('Timesheetemployee.submittedForApproval')}</label>
                        }
                    </div>
                  </>
                ))

                :
                <div style={{background: '#fff',color: '#6C757D', border: '1px solid #DEE2E6', borderRadius: '7px', display: 'flex', placeContent: 'center', placeItems: 'center', fontSize: '17px', height: '200px'}}>
                    <label>
                    {t('Timesheetemployee.emptytimesheet')} <label style={{color: '#FF9B44', textDecoration: 'underline', cursor: 'pointer', fontWeight: '700'}} onClick={() => { getAllTaskBoards(); getAllProjects(); setOpen({ isAddOpen: true, data: '' }); form2.setFieldsValue({date: moment(selectedDate, 'YYYY-MM-DD')}); setShowCalendar(false) }}>{t('Timesheetemployee.addentry')}</label>
                    </label>
                </div>
            }

        <h3 style={{display: 'flex', justifyContent: 'flex-end', gap: '15px', margin: '30px 25px 30px 0px'}}>
          <label style={{color: '#6C757D'}}>{t('Timesheetemployee.total')}:</label>
          <label>{tableLoader ? '--:--' : totalTime()}</label>
        </h3>

            { tableLoader ? null :
              allData?.length === 0 ? null :
              (!allData?.some(item => item?.submittedForApproval === true)) &&
              <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <button
                    onClick={handleSubmitApproval}
                    className='SubmitForApprovalButton'
                    disabled={loader2}
                    style={{border: '2px solid #FF9B44', borderRadius: '8px', background: '#fff', color: '#FF9B44', minWidth: '90px', height: '42px', paddingTop: '3px', margin: '30px 0px 15px 0px', paddingInline: '18px'}}
                >
                  {
                    loader2 ? <Spin size="small" indicator={antIcon3} />
                    : <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetemployee.submitForApproval')}</span>
                  }
                  {/* <span style={{fontSize: '16px', fontWeight: '500'}}>Submit for Approval</span> */}
                </button>
              </div>
            }
            {
              tableLoader ? null :
              allData.some(item => item?.status === 'Approved') ?
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '15px'}}>
                {
                  (allData.some(item => item?.submittedForApproval === false)) &&
                  <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <button
                        onClick={handleSubmitApproval}
                        className='SubmitForApprovalButton'
                        disabled={loader2}
                        style={{border: '2px solid #FF9B44', borderRadius: '8px', background: '#fff', color: '#FF9B44', minWidth: '90px', height: '42px', paddingTop: '3px', margin: '30px 0px 15px 0px', paddingInline: '18px'}}
                    >
                      {
                        loader2 ? <Spin size="small" indicator={antIcon4} />
                        : <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetemployee.submitUpdates')}</span>
                      }
                    </button>
                  </div>
                }
                <button
                    disabled
                    style={{border: '2px solid #00B112', borderRadius: '8px', background: '#fff', color: '#00B112', minWidth: '90px', height: '42px', paddingTop: '3px', margin: '30px 0px 15px 0px', paddingInline: '18px'}}
                >
                  <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetemployee.approved')}</span>
                </button>
              </div> :
              allData.some(item => item?.status === 'Declined') ?
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '15px'}}>
                {
                  (allData.some(item => item?.submittedForApproval === false)) &&
                  <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <button
                        onClick={handleSubmitApproval}
                        className='SubmitForApprovalButton'
                        disabled={loader2}
                        style={{border: '2px solid #FF9B44', borderRadius: '8px', background: '#fff', color: '#FF9B44', minWidth: '90px', height: '42px', paddingTop: '3px', margin: '30px 0px 15px 0px', paddingInline: '18px'}}
                    >
                      {
                        loader2 ? <Spin size="small" indicator={antIcon4} />
                        : <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetemployee.submitUpdates')}</span>
                      }
                    </button>
                  </div>
                }
                <button
                    disabled
                    style={{border: '2px solid #DD0000', borderRadius: '8px', background: '#fff', color: '#DD0000', minWidth: '90px', height: '42px', paddingTop: '3px', margin: '30px 0px 15px 0px', paddingInline: '18px'}}
                >
                  <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetemployee.declined')}</span>
                </button>
              </div> :
              (allData.some(item => item?.submittedForApproval === true)) &&
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '15px'}}>
                {
                  (allData.some(item => item?.submittedForApproval === false)) &&
                  <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <button
                        onClick={handleSubmitApproval}
                        className='SubmitForApprovalButton'
                        disabled={loader2}
                        style={{border: '2px solid #FF9B44', borderRadius: '8px', background: '#fff', color: '#FF9B44', minWidth: '90px', height: '42px', paddingTop: '3px', margin: '30px 0px 15px 0px', paddingInline: '18px'}}
                    >
                      {
                        loader2 ? <Spin size="small" indicator={antIcon4} />
                        : <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetemployee.submitUpdates')}</span>
                      }
                    </button>
                  </div>
                }
                <button
                    disabled
                    style={{border: '2px solid #00B112', borderRadius: '8px', background: '#fff', color: '#00B112', minWidth: '90px', height: '42px', paddingTop: '3px', margin: '30px 0px 15px 0px', paddingInline: '18px'}}
                >
                  <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetemployee.submittedForApproval')}</span>
                </button>
              </div>
            }

        {
          allData?.length > 0 &&
          <div>
            <Pagination
              style={{display: 'flex', float: 'right'}}
              total={paginationDetail?.total}
              pageSize={pageSize}
              defaultCurrent={1}
              current={currentPage}
              showTotal={(total, range) =>
                t('paginationShow', { range1: range[0], range2: range[1], total: total })}
              onChange={(page, size) => {
                setPageSize(size); setCurrentPage(page);
                getData(page, size)
              }}
              showSizeChanger={true}
              pageSizeOptions={['20', '30', '40', '50']}
              itemRender={(current, type, originalElement) =>
                itemRender(current, type, originalElement, t)
              }
            />
          </div>
        }
        </>

        {/* Task Modal */}
        <Modal
            open={open?.isAddOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            className="modalScroll"
            aria-describedby="modal-modal-description"
            disableRestoreFocus
            BackdropProps={{
            style: { backgroundColor: "rgb(0 0 0 / 87%)" },
            }}
            sx={{
            overflowY: "scroll",
            }}
        >
            <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title">{open?.data ? t('holiday.edit') : t('holiday.add')} {t('Timesheetemployee.entry')}</h5>
                <button type="button" className="close" onClick={handleClose}>
                    <span aria-hidden="true">×</span>
                </button>
                </div>
                <div className="modal-body">
                <Form
                form={form2}
                onFinish={(values) => {
                    open?.data ? onFinishEdit(values) : onFinishAdd(values)
                    }
                }
                onValuesChange={onFormValuesChange}
                onFinishFailed={({errorFields}) => {
                    const phoneErrorExists = errorFields.find(field => field.errors.toString().includes('please enter phone number'));
                    if(phoneErrorExists){
                    setPhoneLengthError({emp: true})
                    }
                    const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                    if(consecutiveSpacesError){
                      message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                   }else{
                      message.error(t('allEmp.errors.fillRequiredFields'))
                    } 
                }}
                autoComplete='off'
                >
                <div className="row">
                  <div className="col-12">
                    <div className="form-group">
                        <label>
                            {t('Associate with')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                        className="custom-border">
                          <Select
                            value={isProjectAssociated ? 'project' : 'taskboard'}
                            onChange={(value) => handleSelectionChange(value)}
                            className="custom-select custom-normal"
                        >
                            <Select.Option value="project">{t('Project')}</Select.Option>
                            <Select.Option value="taskboard">{t('TaskBoard')}</Select.Option>
                        </Select>
                        </Form.Item>
                    </div>
                </div>
                    <div className="col-12">
                        <div className="form-group">
                        {isProjectAssociated ? (
                                <>
                        <label>
                        {t('Timesheetemployee.project')} <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area">
                        <Form.Item
                            name='projectId'
                            className='custom-border'
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                message: t('Timesheetemployee.pleaseselectproject'),
                            },
                            ]}
                        >
                                <Select
                                    showSearch
                                    onSearch={(val) => {
                                      searchHandler(val, 'project')
                                    }}
                                    filterOption={(input, option) => option.children?.toLowerCase().indexOf(input?.toLowerCase()) >= 0}
                                    optionFilterProp="children"
                                    notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                    dropdownRender={(menu) => (
                                      <>
                                        {menu}
                                      </>
                                    )}
                                    onChange={(val) => {
                                        getAllTasks(val);
                                        form2.setFieldsValue({taskId: ''})
                                    }}
                                    className="custom-select custom-normal"
                                    getPopupContainer={() =>
                                        document.getElementById("area")
                                    }
                                    placeholder={t('Timesheetemployee.selectproject')}
                                    >
                                    {
                                        allProjects.map((project, index) => (
                                        <Select.Option key={index} value={project._id}>
                                            {project.projectName}
                                        </Select.Option>
                                        ))
                                    }
                                </Select>
                        </Form.Item>
                        </div>
                        </>
                        ) : (
                          <>
                          <label>
                        {t('TaskBoard')} <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area">
                        <Form.Item
                            name='boardId'
                            className='custom-border'
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                message: t('please select taskboard'),
                            },
                            ]}
                        >
                                <Select
                                    showSearch
                                    onSearch={(val) => {
                                      searchHandler(val, 'taskboard')
                                    }}
                                    filterOption={(input, option) => option.children?.toLowerCase().indexOf(input?.toLowerCase()) >= 0}
                                    optionFilterProp="children"
                                    notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                    dropdownRender={(menu) => (
                                      <>
                                        {menu}
                                      </>
                                    )}
                                    onChange={(val) => {
                                        getAllTasks(val);
                                        form2.setFieldsValue({taskId: ''})
                                    }}
                                    className="custom-select custom-normal"
                                    getPopupContainer={() =>
                                        document.getElementById("area")
                                    }
                                    placeholder={t('Select Taskboard')}
                                    >
                                    {
                                        allTaskboards.map((taskBoard, index) => (
                                          <Select.Option key={index} value={taskBoard._id}>
                                              {taskBoard.boardTitle}
                                          </Select.Option>
                                      ))
                                    }
                                </Select>
                        </Form.Item>
                        </div>
                        </>)}
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="form-group">
                        <label>
                        {t('Timesheetemployee.task')} <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area">
                        <Form.Item
                            name='taskId'
                            className='custom-border'
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                message: t('Timesheetemployee.pleaseselecttask'),
                            },
                            ]}
                        >
                                <Select
                                    showSearch
                                    onSearch={(val) => {
                                      searchHandler(val, 'task')
                                    }}
                                    filterOption={(input, option) => option.children?.toLowerCase().indexOf(input?.toLowerCase()) >= 0}
                                    optionFilterProp="children"
                                    notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                    dropdownRender={(menu) => (
                                      <>
                                        {menu}
                                      </>
                                    )}
                                    className="custom-select custom-normal"
                                    getPopupContainer={() =>
                                        document.getElementById("area")
                                    }
                                    placeholder={t('Timesheetemployee.selecttask')}
                                    >
                                    {
                                        allTasks.map((task, index) => (
                                        <Select.Option key={index} value={task._id}>
                                            {task.title}
                                        </Select.Option>
                                        ))
                                    }
                                </Select>
                        </Form.Item>
                        </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="form-group">
                        <label>
                        {t('Timesheetemployee.enterduration')} <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area96">
                          <Form.Item
                              name="hoursWorked"
                              rules={[
                              {
                                  required: true,
                                  // message: "please enter task duration",
                                  validator: (_, value) => {
                                    if(!value){
                                        return Promise.reject(t('Timesheetemployee.pleaseentertaskduration'));
                                    }
                                    else if (moment(value).format('HH:mm') === '00:00') {
                                        return Promise.reject(t('Timesheetemployee.taskDurationCannotBeZero'));
                                    }
                                    return Promise.resolve();
                                  },
                              },
                              ]}
                              className="custom-border"
                          >
                              <TimePicker
                                  // disabledHours={() => [0]}
                                  // disabledMinutes={() => [0]}
                                  allowClear={false}
                                  className="form-control"
                                  placeholder="hh:mm"
                                  format={"HH:mm"}
                                  getPopupContainer={() =>
                                    document.getElementById("area96")
                                  }
                              />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                        <div className="form-group">
                        <label>
                        {t('Timesheetemployee.date')} <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area97">
                          <Form.Item
                              name="date"
                              rules={[
                              {
                                  required: true,
                                  message: t('Timesheetemployee.pleaseselectdate'),
                              },
                              ]}
                              className="custom-border"
                          >
                              <DatePicker
                                  disabledDate={disabledDate}
                                  allowClear={false}
                                  className="form-control"
                                  placeholder="YYYY-MM-DD"
                                  format={"YYYY-MM-DD"}
                                  getPopupContainer={() =>
                                    document.getElementById("area97")
                                  }
                              />
                          </Form.Item>
                        </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="form-group">
                        <label style={{display: 'flex', justifyContent: 'space-between'}}>
                            <div>{t('Timesheetemployee.notes')}</div>
                        </label>
                        <Form.Item
                            name="notes"
                            rules={[
                            {
                                whitespace: true,
                                // required: true,
                                validator: (_, value) => {
                                if(!value || value.trim() === ''){
                                    // return Promise.reject("please enter notes");
                                    return Promise.resolve();
                                }
                                else if (/\s{2,}/.test(value)) {
                                  return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                                }
                                else if (value.length <= 4) {
                                    return Promise.reject(t('Timesheetemployee.notesLengthMustBeAtLeastFive'));
                                }
                                return Promise.resolve();
                                },
                            },
                            ]}
                            className="custom-border"
                        >
                            <Input.TextArea rows={3} className='form-control' />
                        </Form.Item>
                        </div>
                    </div>
                </div>
                <div className="submit-section">
                    <button type='submit' className="btn btn-primary submit-btn" disabled={loader || open?.data ? buttonDisable : false}>
                    {
                        loader ? <Spin size="small" indicator={antIcon} />
                        : t('submit')
                    }
                    </button>
                </div>
                </Form>
                </div>
            </div>
            </div>
        </Modal>
        {/* Task Modal */}
        
        {/* Delete Task Modal */}
        <Modal
          open={open.isDelOpen}
          onClose={() => handleClose('delete')}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          disableRestoreFocus
          BackdropProps={{
            style: { backgroundColor: "rgb(0 0 0 / 87%)" },
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ height: "280px" }}>
              <div
                className="modal-body"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <div className="form-header">
                  <h3 style={{ marginBottom: "30px" }}>{t('Timesheetemployee.deleteTimesheet')}</h3>
                  <p>
                  {t('Timesheetemployee.confirmDeleteTimesheet')}{" "}
                    {/* <b>{open?.data?.title}?</b> */}
                  </p>
                </div>
                <div className="modal-btn delete-action">
                  <div className="row">
                    <div className="col-6">
                      <Button
                        htmlType="submit"
                        className="btn btn-primary continue-btn"
                        onClick={() => onHandleDelete(open?.data?._id)}
                        disabled={loader}
                        style={{width: '100%'}}
                      >
                        {
                          loader ? <Spin size="small" indicator={antIcon} />
                            : t('delete')
                        }
                      </Button>
                    </div>
                    <div className="col-6">
                      <Button
                        onClick={() => handleClose('delete')}
                        className="btn btn-primary submit-btn"
                        style={{width: '100%'}}
                      >
                        {t('cancel')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        {/* Delete Task Modal */}


    </div>
  )
}

export default DayViewTimesheet