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

function DayViewTimesheet({ tableStartDate, setTableStartDate, selectedDate, setSelectedDate, open, setOpen, form2, allProjects, getAllProjects, setShowCalendar }) {

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
              : "View Timesheet Error!"
          }!`
        );
      });

    // const filtered = t_data.filter((timesheet) => timesheet?.date === moment(selectedDate).format('YYYY-MM-DD'))
    // const filtered = t_data.filter((timesheet) => moment(timesheet?.date).format('YYYY-MM-DD') === moment(selectedDate).format('YYYY-MM-DD'))
    // setAllData(filtered);
  }

  const getAllTasks = (id) => {
    setTaskLoader(true);
    apiServices("GET", `tasks?projectId=${id}&page=${1}&limit=${99999}`, null, user_state)
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
              : "Get All Tasks Error"
          }!`
        );
      });
  }

  const searchHandler = (val, type) => {
    let dropdownValues = []
    if (type === 'project'){
      allProjects.forEach((proj)=>{
        dropdownValues.push(proj.projectName.toLowerCase())
     })
    } else if (type === 'task'){
        allTasks.forEach((proj)=>{
          dropdownValues.push(proj.titile.toLowerCase())
       })
      }
  
    if(val !== ''){
      dropdownValues.some((team) => {
        if(team.includes(val.toLowerCase())){
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
              message.success('Timesheet Added Successfully!');
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
              : "Add Timesheet Error"
          }!`
        );
      });
  }

  const onFinishEdit = (values) => {
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
              // getData(currentPage, pageSize);
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
              message.success('Timesheet Updated Successfully!');
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
                : "Update Timesheet Error"
            }!`
          );
        });
  }

  const onHandleDelete = (id) => {
    // console.log(id);
    setLoader(true)
    apiServices("DELETE", "timesheet", id, user_state)
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
          message.success("Timesheet Deleted Successfully!");
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
              : "Delete Timesheet Error"
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

    const Dayscolumns = daysOfWeek.map((day, index) => (
        {
          title: (
            <div
              onClick={() => {
                  handleDateClick(
                  new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index)
                  );
                  setShowCalendar(false)
              }}
              style={{
                  display: "grid",
                  placeContent: 'center',
                  borderRadius: '6px',
                  padding: '9px 0px',
                  cursor: 'pointer',
                  background:
                  selectedDate.toDateString() ===
                  new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index).toDateString()
                      ? "#E9E9E9"
                      : "white",
              }}
            >
              <label style={{cursor: 'pointer', textAlign: 'center', fontWeight: '700', lineHeight: '20px'}}>{day}</label>
              <label style={{cursor: 'pointer', color: '#666', lineHeight: '20px'}}>
                {new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index).getDate()}{" "}
                {new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index).toLocaleDateString("en-US", { month: "short" })}
              </label>
            </div>
          ),
          dataIndex: day,
          key: day,
        }
      ));

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
                message.success('Timesheet Submitted Successfully!');
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
                  : "Submit Timesheet Error"
              }!`
            );
          });
        })
      }

  return (
    <div>
        <>
            <div className="table-responsive timeSheetDayTable" style={{borderRadius: '10px'}}>	
                <Table
                    pagination= {false}
                    // style = {{overflowX : 'auto'}}
                    columns={Dayscolumns}             
                    showHeader    
                />
            </div>
            <div style={{color: '#6C757D', fontSize: '18px', fontWeight: '500', margin: '30px 0px'}}>
                Actual Time
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
                                  <label>{record?.projectId?.projectName}</label>
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
                                            setOpen({ isAddOpen: true, data: record });
                                            getAllProjects()
                                            getAllTasks(record?.projectId?._id)
                                            let data = {
                                                ...record,
                                                projectId: record?.projectId?._id,
                                                taskId: record?.taskId?._id,
                                                hoursWorked: record?.hoursWorked ? moment(record?.hoursWorked, 'HH:mm') : '',
                                                date: moment(record?.date, 'YYYY-MM-DD')
                                            }
                                            form2.setFieldsValue(data);
                                            setDescLength(record?.notes?.length)
                                        }}
                                    >
                                        <i className="fa fa-pencil m-r-5" /> Edit
                                    </a>
                                    <a className="dropdown-item" href="javascript:void(0)"
                                        onClick={() => {
                                            setOpen({ isAddOpen: false, isEditOpen: false, isDelOpen: true, data: record });
                                        }}
                                    >
                                        <i className="fa fa-trash-o m-r-5" /> Delete
                                    </a>
                                </div>
                              </div>
                          </div>
                        </div>
                        {
                          record?.status === 'Approved' ?
                          <label style={{fontSize: '16px', fontWeight: '400', color: '#00b112', marginLeft: 'auto', marginTop: 'auto',marginBottom: 'auto', paddingRight: '15px'}}>Approved</label>
                          : record?.status === 'Declined' ?
                          <label style={{fontSize: '16px', fontWeight: '400', color: '#DD0000', marginLeft: 'auto', marginTop: 'auto',marginBottom: 'auto', paddingRight: '15px'}}>Declined</label>
                          : record?.submittedForApproval &&
                          <label style={{fontSize: '16px', fontWeight: '400', color: '#00b112', marginLeft: 'auto', marginTop: 'auto',marginBottom: 'auto', paddingRight: '15px'}}>Submitted For Approval</label>
                        }
                    </div>
                  </>
                ))

                :
                <div style={{background: '#fff',color: '#6C757D', border: '1px solid #DEE2E6', borderRadius: '7px', display: 'flex', placeContent: 'center', placeItems: 'center', fontSize: '17px', height: '200px'}}>
                    <label>
                        Empty Timesheet. <label style={{color: '#FF9B44', textDecoration: 'underline', cursor: 'pointer', fontWeight: '700'}} onClick={() => { setOpen({ isAddOpen: true, data: '' }); form2.setFieldsValue({date: moment(selectedDate, 'YYYY-MM-DD')}); setShowCalendar(false) }}>Add Entry</label>
                    </label>
                </div>
            }

        <h3 style={{display: 'flex', justifyContent: 'flex-end', gap: '15px', margin: '30px 25px 30px 0px'}}>
          <label>Total:</label>
          <label>{tableLoader ? '--:--' : totalTime()}</label>
        </h3>

            { tableLoader ? null :
              (!allData.some(item => item?.submittedForApproval === true)) &&
              <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <button
                    onClick={handleSubmitApproval}
                    className='SubmitForApprovalButton'
                    disabled={loader2}
                    style={{border: '2px solid #FF9B44', borderRadius: '8px', background: '#fff', color: '#FF9B44', minWidth: '90px', height: '42px', paddingTop: '3px', margin: '30px 0px 15px 0px', paddingInline: '18px'}}
                >
                  {
                    loader2 ? <Spin size="small" indicator={antIcon3} />
                    : <span style={{fontSize: '16px', fontWeight: '500'}}>Submit for Approval</span>
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
                        : <span style={{fontSize: '16px', fontWeight: '500'}}>Submit Updates</span>
                      }
                    </button>
                  </div>
                }
                <button
                    disabled
                    style={{border: '2px solid #00B112', borderRadius: '8px', background: '#fff', color: '#00B112', minWidth: '90px', height: '42px', paddingTop: '3px', margin: '30px 0px 15px 0px', paddingInline: '18px'}}
                >
                  <span style={{fontSize: '16px', fontWeight: '500'}}>Approved</span>
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
                        : <span style={{fontSize: '16px', fontWeight: '500'}}>Submit Updates</span>
                      }
                    </button>
                  </div>
                }
                <button
                    disabled
                    style={{border: '2px solid #DD0000', borderRadius: '8px', background: '#fff', color: '#DD0000', minWidth: '90px', height: '42px', paddingTop: '3px', margin: '30px 0px 15px 0px', paddingInline: '18px'}}
                >
                  <span style={{fontSize: '16px', fontWeight: '500'}}>Declined</span>
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
                        : <span style={{fontSize: '16px', fontWeight: '500'}}>Submit Updates</span>
                      }
                    </button>
                  </div>
                }
                <button
                    disabled
                    style={{border: '2px solid #00B112', borderRadius: '8px', background: '#fff', color: '#00B112', minWidth: '90px', height: '42px', paddingTop: '3px', margin: '30px 0px 15px 0px', paddingInline: '18px'}}
                >
                  <span style={{fontSize: '16px', fontWeight: '500'}}>Submitted for Approval</span>
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
                `Showing ${range[0]} to ${range[1]} of ${total} entries`}
              onChange={(page, size) => {
                setPageSize(size); setCurrentPage(page);
                getData(page, size)
              }}
              showSizeChanger={true}
              pageSizeOptions={['20', '30', '40', '50']}
              itemRender={itemRender}
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
                <h5 className="modal-title">{open?.data ? 'Edit' : 'Add'} Entry</h5>
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
                    message.error("Please Remove Consecutive Spaces!")
                    }else{
                    message.error("Please Fill Required Fields!")
                    }
                }}
                autoComplete='off'
                >
                <div className="row">
                    <div className="col-12">
                        <div className="form-group">
                        <label>
                            Project <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area">
                        <Form.Item
                            name='projectId'
                            className='custom-border'
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                message: 'please select project',
                            },
                            ]}
                        >
                                <Select
                                    showSearch
                                    onSearch={(val) => {
                                      searchHandler(val, 'project')
                                    }}
                                    filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
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
                                    placeholder="Select Project"
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
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="form-group">
                        <label>
                            Task <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area">
                        <Form.Item
                            name='taskId'
                            className='custom-border'
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                message: 'please select task',
                            },
                            ]}
                        >
                                <Select
                                    showSearch
                                    onSearch={(val) => {
                                      searchHandler(val, 'task')
                                    }}
                                    filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
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
                                    placeholder="Select Task"
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
                            Enter Duration <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area96">
                          <Form.Item
                              name="hoursWorked"
                              rules={[
                              {
                                  required: true,
                                  message: "please enter task duration",
                              },
                              ]}
                              className="custom-border"
                          >
                              <TimePicker
                                  allowClear={false}
                                  className="form-control"
                                  placeholder="HH:mm"
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
                            Date <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area97">
                          <Form.Item
                              name="date"
                              rules={[
                              {
                                  required: true,
                                  message: "please select date",
                              },
                              ]}
                              className="custom-border"
                          >
                              <DatePicker
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
                            <div>Notes</div>
                            <small style={{marginTop: '5px', fontSize: '10px', color: 'rgba(0, 0, 0, 0.5)'}}>{descLength} / 150</small>
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
                                    return Promise.reject("please remove consecutive spaces");
                                }
                                else if (value.length <= 4) {
                                    return Promise.reject("notes length must be at least 5 characters long");
                                }
                                return Promise.resolve();
                                },
                            },
                            ]}
                            className="custom-border"
                        >
                            <Input.TextArea rows={3} className='form-control' onChange={(e) => setDescLength(e.target.value.length)} maxLength={150} />
                        </Form.Item>
                        </div>
                    </div>
                </div>
                <div className="submit-section">
                    <button type='submit' className="btn btn-primary submit-btn" disabled={loader || open?.data ? buttonDisable : false}>
                    {
                        loader ? <Spin size="small" indicator={antIcon} />
                        : 'Submit'
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
                  <h3 style={{ marginBottom: "30px" }}>Delete Timesheet</h3>
                  <p>
                    Are you sure you want to delete the timesheet?{" "}
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
                            : 'Delete'
                        }
                      </Button>
                    </div>
                    <div className="col-6">
                      <Button
                        onClick={() => handleClose('delete')}
                        className="btn btn-primary submit-btn"
                        style={{width: '100%'}}
                      >
                        Cancel
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