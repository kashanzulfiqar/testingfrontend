import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { user_icon } from "../../../Entryfile/imagepath";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import ViewDetailPopup from '../../../files/Icons/ViewDetailPopup.svg';
import {
  Button,
  DatePicker,
  Form,
  Select,
  Table,
  Checkbox,
  message,
  Spin,
  Empty,
  Input,
  Pagination,
  Collapse
} from "antd";
import { useSelector } from "react-redux";
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Modal from "@mui/material/Modal";
import {
  Table as MTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Grid,
} from '@mui/material';
import moment from "moment";
import { apiServices } from "../../../Services/apiServices";
import { LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from "react-i18next";

const { Panel } = Collapse;

const ViewDetailTimesheet = () => {
    const { t, i18n } = useTranslation();
    const [form] = Form.useForm();

    const user_state = useSelector((state) => state.user.loginvalue);
    const permissions = useSelector((state) => state?.permissionsSlice?.data);
    const role = user_state?.user?.role;
    const login_user_id = user_state?.user?._id;
    
    const location = useLocation();
    const month_data = location?.state;
    const nav = useNavigate();

    const [allData, setAllData] = useState([])
    const [allData1, setAllData1] = useState([])
    const [allData2, setAllData2] = useState([])
    const [allData3, setAllData3] = useState([])
    const [allData4, setAllData4] = useState([])
    const [allData5, setAllData5] = useState([])
    const [declineLoader, setDeclineLoader] = useState(false);
    const [loader, setLoader] = useState(false);
    const [loader2, setLoader2] = useState(false);
    const [loader3, setLoader3] = useState(false);
    const [loader4, setLoader4] = useState(false);
    const [loader5, setLoader5] = useState(false);
    const [open, setOpen] = useState({
      isOpen: false,
      isViewOpen: false
    });
  const [reasonLength, setReasonLength] = useState('0')


    useEffect(() => {
      const allDataLocal = JSON.parse(localStorage.getItem("allDataLocalStorage"));
      setAllData(allDataLocal ? allDataLocal : month_data);
      // console.log('month_data', month_data);

      week1();
      week2();
      week3();
      week4();
      week5();

    }, [])

    const week1 = () => {
      const mergedData = month_data[0]?.data?.reduce((acc, currentItem) => {
        const existingItem = acc?.find(item => item?.date === currentItem?.date);

        if (existingItem) {
            existingItem?.mergeObjects?.push(currentItem);
        } else {
            acc.push({ ...currentItem, mergeObjects: [currentItem] });
        }

        return acc;
    }, []);
    
    setAllData1(mergedData)
    }
    const week2 = () => {
      const mergedData = month_data[1]?.data?.reduce((acc, currentItem) => {
        const existingItem = acc?.find(item => item?.date === currentItem?.date);

        if (existingItem) {
            existingItem?.mergeObjects?.push(currentItem);
        } else {
            acc.push({ ...currentItem, mergeObjects: [currentItem] });
        }

        return acc;
    }, []);
    
    setAllData2(mergedData)
    }
    const week3 = () => {
      const mergedData = month_data[2]?.data?.reduce((acc, currentItem) => {
        const existingItem = acc?.find(item => item?.date === currentItem?.date);

        if (existingItem) {
            existingItem?.mergeObjects?.push(currentItem);
        } else {
            acc.push({ ...currentItem, mergeObjects: [currentItem] });
        }

        return acc;
    }, []);
    
    setAllData3(mergedData)
    }
    const week4 = () => {
      const mergedData = month_data[3]?.data?.reduce((acc, currentItem) => {
        const existingItem = acc?.find(item => item?.date === currentItem?.date);

        if (existingItem) {
            existingItem?.mergeObjects?.push(currentItem);
        } else {
            acc.push({ ...currentItem, mergeObjects: [currentItem] });
        }

        return acc;
    }, []);
    
    setAllData4(mergedData)
    // console.log(mergedData);
    }
    const week5 = () => {
      const mergedData = month_data[4]?.data?.reduce((acc, currentItem) => {
        const existingItem = acc?.find(item => item?.date === currentItem?.date);

        if (existingItem) {
            existingItem?.mergeObjects?.push(currentItem);
        } else {
            acc.push({ ...currentItem, mergeObjects: [currentItem] });
        }

        return acc;
    }, []);
    
    setAllData5(mergedData)
    }

    const onDecline = (val, week_data, week_no) => {

      const week_detail = `week no ${week_no+1}, ${moment(week_data?.sort((a, b) => a.date.localeCompare(b.date))[0]?.date).format('DD-MM-YYYY')}, ${moment(week_data?.sort((a, b) => a.date.localeCompare(b.date))[week_data?.length-1]?.date).format('DD-MM-YYYY')}`;
      let data = {
        _id: week_data?.map(item => item?._id),
        week: week_detail,
        approved: false,
        ...val
      }
      setDeclineLoader(true);
      apiServices("PUT", 'timesheet', data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
            message.success(t('Timesheetadmin.timesheetDeclinedSuccessfully'));
            setDeclineLoader(false);
            handleClose();
            setAllData({
              ...allData,
              [week_no]: {
                ...allData[week_no],
                data: allData[week_no]?.data?.map(obj => ({ ...obj, status: 'Declined', ...val }))
              }
            });
            let d = {
              ...allData,
              [week_no]: {
                ...allData[week_no],
                data: allData[week_no]?.data?.map(obj => ({ ...obj, status: 'Declined', ...val }))
              }
            }
            localStorage.setItem(`allDataLocalStorage`, JSON.stringify(d));
        }})
        .catch((err) => {
        setDeclineLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('Timesheetadmin.timesheetDeclinedError')
          }!`
        );
      });
    };
    

    const onHandleApprove = (week_data, week_no) => {

      const week_detail = `week no ${week_no+1}, ${moment(week_data?.sort((a, b) => a.date.localeCompare(b.date))[0]?.date).format('DD-MM-YYYY')}, ${moment(week_data?.sort((a, b) => a.date.localeCompare(b.date))[week_data?.length-1]?.date).format('DD-MM-YYYY')}`;
      let data = {
        _id: week_data?.map(item => item?._id),
        week: week_detail,
        approved: true,
      }

      week_no == 0 ? setLoader(true) : week_no == 1 ? setLoader2(true) : week_no == 2 ? setLoader3(true) : week_no == 3 ? setLoader4(true) : week_no == 4 ? setLoader5(true) : null;
      apiServices("PUT", 'timesheet', data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
            message.success(t('Timesheetadmin.timesheetApprovedSuccessfully'));
            week_no == 0 ? setLoader(false) : week_no == 1 ? setLoader2(false) : week_no == 2 ? setLoader3(false) : week_no == 3 ? setLoader4(false) : week_no == 4 ? setLoader5(false) : null;
            setAllData({
              ...allData,
              [week_no]: {
                ...allData[week_no],
                data: allData[week_no]?.data?.map(obj => ({ ...obj, status: 'Approved' }))
              }
            });
            let d = {
              ...allData,
              [week_no]: {
                ...allData[week_no],
                data: allData[week_no]?.data?.map(obj => ({ ...obj, status: 'Approved' }))
              }
            }
            localStorage.setItem(`allDataLocalStorage`, JSON.stringify(d));
        }})
        .catch((err) => {
        week_no == 0 ? setLoader(false) : week_no == 1 ? setLoader2(false) : week_no == 2 ? setLoader3(false) : week_no == 3 ? setLoader4(false) : week_no == 4 ? setLoader5(false) : null;
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('Timesheetadmin.timesheetApprovedError')
          }!`
        );
      });
    }
    
    const handleClose = () => {
      setOpen({ isOpen: false, isViewOpen: false, data: null, week_no: null});
    };

    const columns = [
        { 
          title: t('Timesheetadmin.workdays'),
          dataIndex: 'date',
          key: 'date',
          render: (text, record) => (            
            <>
              {moment(text).format('dddd')} <br />
              {moment(text).format('DD-MMM-YYYY')}
            </>
          ),
        },
        {
          title: t('Timesheetadmin.project'),
          dataIndex: 'projectId',
          key: 'projectId',
          render: (text, record) => {
              return (
                <div>
                  {record?.mergeObjects?.map((item, index) => (
                    <>
                    {/* <label key={index} className="projectTitleLongDesc" style={{marginBottom: `${index < record?.mergeObjects?.length - 1 && '17px'}`}}> */}
                    <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                      <label key={index} className="projectTitleLongDesc">
                        {item?.projectId?.projectName}
                      </label>
                    </div>
                      {/* {index < record?.mergeObjects?.length - 1 && <br />} */}
                    </>
                  ))}
                </div>
              )},
          // render: (text, record) => (            
          //   <>{text?.projectName}</>
          // ),
        },
        {
          title: t('Timesheetadmin.task'),
          dataIndex: 'taskId',
          key: 'taskId',
          render: (text, record) => {
              return (
                <div>
                  {record?.mergeObjects?.map((item, index) => (
                    <>
                    <div style={{display: 'flex', alignItems: 'flex-start', marginBottom: '10px'}}>
                      <label key={index} className="taskTitleLongDesc">
                      {/* <label key={index} className="taskTitleLongDesc" style={{marginBottom: `${index < record?.mergeObjects?.length - 1 && '17px'}`}}> */}
                        {item?.taskId?.title}
                      </label>
                      {
                        item?.notes &&
                        // <label
                        //   style={{
                        //     fontSize: '13px',
                        //     color: '#FF9B44',
                        //     cursor: 'pointer',
                        //     textDecoration: 'underline',
                        //     marginLeft: '10px'
                        //   }}
                        //   onClick={() => {setOpen({ isOpen: false, isViewOpen: true, data: item}); form.setFieldsValue({notes: item?.notes})}}
                        // >
                        //     View Notes
                        // </label>
                            <img
                              src={ViewDetailPopup}
                              style={{
                                cursor: 'pointer',
                                marginLeft: '10px',
                              }}
                              onClick={() => {
                                setOpen({ isOpen: false, isViewOpen: true, data: item});
                                let d = {
                                  // date: moment(item?.date, 'YYYY-MM-DD'),
                                  date: moment(item?.date).format('DD-MMM-YYYY'),
                                  projectName: item?.projectId?.projectName ,
                                  title: item?.taskId?.title ,
                                  hoursWorked: item?.hoursWorked ,
                                  notes: item?.notes,
                                }
                                form.setFieldsValue(d);
                              }}
                            />
                      }
                    </div>
                      {/* {index < record?.mergeObjects?.length - 1 && <br />} */}
                    </>
                  ))}
                </div>
              )
          },
          // render: (text, record) => (            
          //   <>{text?.title}</>
          // ),
        },
        {
          title: t('Timesheetadmin.hours'),
          dataIndex: 'hoursWorked',
          key: 'hoursWorked',
          render: (text, record) => {
              return (
                <div>
                  {record?.mergeObjects?.map((item, index) => (
                    <>
                      {/* <label key={index} style={{marginBottom: `${index < record?.mergeObjects?.length - 1 && '17px'}`}}> */}
                      <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                        <label key={index}>
                          {item?.hoursWorked || '--:--'}
                        </label>
                      </div>
                      {/* {index < record?.mergeObjects?.length - 1 && <br />} */}
                    </>
                  ))}
                </div>
              )},
        },
        // {
        //   title: 'Action',
        //   dataIndex: '',
        //   key: 'viewDetail',
        //   render: (text, record) => {
        //       return (
        //         <>
        //           {record?.mergeObjects?.map((item, index) => (
        //             <>
        //             <div
        //               style={{
        //                 display: 'inline-block',
        //                 border: '1px solid orange',
        //                 borderRadius: '245px',
        //                 fontSize: '13px',
        //                 padding: '4px 10px',
        //                 background: 'transparent',
        //                 color: '#FF9B44',
        //                 minWidth: 'max-content',
        //                 cursor: 'pointer',
        //                 marginBottom: `${index < record?.mergeObjects?.length - 1 && '10px'}`
        //               }}
        //               className="view-detail-style"
        //               onClick={() => {setOpen({ isOpen: false, isViewOpen: true, data: item}); form.setFieldsValue({notes: item?.notes})}}
        //             >
        //               View Detail
        //             </div>
        //               {index < record?.mergeObjects?.length - 1 && <br />}
        //             </>
        //           ))}
        //         </>
        //       )},
        // },
      ];
      const data = [
        {
          workDays: 'workDays',
          project: 'project project project',
          task: 'task',
          hours: 'hours',
        },
        {
          workDays: 'workDays2',
          project: 'project2',
          task: 'task2',
          hours: 'hours2',
        },
        {
          workDays: 'workDays3',
          project: 'project3',
          task: 'task3',
          hours: 'hours3',
        },
      ];

      
      const [expanded, setExpanded] = React.useState('week');

      const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
      };

      const yourDataArray = [
        { workDays: 'Monday', project: 'Data 2A project project project project project project', task: 'Data 3A project project project project project project', hours: '4:00' },
        { workDays: 'Tuesday', project: 'Data 2B', task: 'Data 3B', hours: '2:00' },
        { workDays: 'Wednesday', project: 'Data 2B', task: 'Data 3B', hours: '1:00' },
        // Add more objects for additional rows
      ];

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
            height: "175px",
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
                  margin: "0px 0px 4px 0px",
                }}
              >
                {t('Timesheetadmin.noRecordForThisWeekTimesheet')}
              </div>
            </div>
          }
        />
      );

      const antIcon = (
        <LoadingOutlined
            style={{
            fontSize: 24,
            color: '#fff'
            }}
            spin
        />
        );
    
  
  
  return (
    <>
      <div className="page-wrapper">
        <Helmet>
          <title>{t('Timesheetemployee.timesheetTitle')}</title>
          <meta name="description" content="Login page" />
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
            <div className="page-header">
                <div className="row align-items-center">
                <div className="col">
                    <h3 className="page-title">{t('Timesheetemployee.timesheet')}</h3>
                    <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>{t('Timesheetemployee.dashboard')}</Link>
                    </li>
                    <li className="breadcrumb-item active">{t('Timesheetadmin.timesheetadmin')}</li>
                    </ul>
                </div>
                </div>
            </div>

            <div className="row align-items-center">
                <div className="col">
                    <h3 className="page-title">
                        <label className="avatar" style={{width: '60px', height: '60px'}}><img alt="" src={allData?.imageUrl || user_icon} /></label>
                        {allData?.fullName}
                    </h3>
                </div>
            </div>
            <br/>
                
            <div style={{color: '#6C757D', fontSize: '18px', fontWeight: '500', margin: '20px 0px'}}>
            {t('Timesheetadmin.week')} 1
            </div>

                    {/* <Table dataSource={data} columns={columns} pagination={false} /> */}
            {/* <Collapse defaultActiveKey={['1']} expandIconPosition={'start'}>
                <Panel header={<label style={{display: 'flex', justifyContent: 'space-between', width: '100%', cursor: 'pointer'}}><h4>Work Days</h4><h4>Project</h4><h4>Task</h4><h4>Hours</h4></label>} key="1">
                    data
                </Panel>
            </Collapse> */}

            {/* <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ backgroundColor: '#E6E6E6', color: '#000', borderRadius: '8px'}} />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
                >
                <label style={{display: 'flex', justifyContent: 'space-between', width: '100%', cursor: 'pointer', marginRight: '100px'}}><h4 className="mb-0">Work Days</h4><h4 className="mb-0">Project</h4><h4 className="mb-0">Task</h4><h4 className="mb-0">Hours</h4></label>
                </AccordionSummary>
                <AccordionDetails sx={{padding: '8px 0px 16px'}}>
                <Table
                  dataSource={data}
                  columns={columns}
                  pagination={false}
                  className="table-striped accordian-table"
                />
                </AccordionDetails>
            </Accordion> */}

            <Accordion expanded={expanded === 'week'}>
              <AccordionSummary
                // expandIcon={<ExpandMoreIcon sx={{ backgroundColor: '#E6E6E6', color: '#000', borderRadius: '8px' }} />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                {
                  expanded === 'week1' ? null : null
                  // <Grid container spacing={4}>
                  //   <Grid item xs={3}>
                  //     <MTable>
                  //       <TableHead>
                  //         <TableRow>
                  //         <h4 className="mb-0">Work Days</h4>
                  //         </TableRow>
                  //       </TableHead>
                  //     </MTable>
                  //   </Grid>
                  //   <Grid item xs={3}>
                  //     <MTable>
                  //       <TableHead>
                  //         <TableRow>
                  //         <h4 className="mb-0">Project</h4>
                  //         </TableRow>
                  //       </TableHead>
                  //     </MTable>
                  //   </Grid>
                  //   <Grid item xs={3}>
                  //     <MTable>
                  //       <TableHead>
                  //         <TableRow>
                  //         <h4 className="mb-0">Task</h4>
                  //         </TableRow>
                  //       </TableHead>
                  //     </MTable>
                  //   </Grid>
                  //   <Grid item xs={3}>
                  //     <MTable>
                  //       <TableHead>
                  //         <TableRow>
                  //         <h4 className="mb-0">Hours</h4>
                  //         </TableRow>
                  //       </TableHead>
                  //     </MTable>
                  //   </Grid>
                  // </Grid>
                }
              </AccordionSummary>
              <AccordionDetails>
                {/* <MTable sx={{overflowX: 'auto'}}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{width: '200px'}}>
                        <h4 style={{fontFamily: 'CircularStd'}}>Work Days</h4>
                      </TableCell>
                      <TableCell sx={{width: '200px'}}>
                        <h4 style={{fontFamily: 'CircularStd'}}>Project</h4>
                      </TableCell>
                      <TableCell sx={{width: '200px'}}>
                        <h4 style={{fontFamily: 'CircularStd'}}>Task</h4>
                      </TableCell>
                      <TableCell sx={{width: '200px'}}>
                        <h4 style={{fontFamily: 'CircularStd'}}>Hours</h4>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {yourDataArray.map((rowData, index) => (
                      <TableRow key={index} sx={index % 2 === 0 ? { backgroundColor: '#F2F2F2' } : null}>
                        <TableCell sx={{maxWidth: '75px'}}><label style={{fontFamily: 'CircularStd', color: '#4F4F4F'}}>{rowData.workDays}</label></TableCell>
                        <TableCell sx={{maxWidth: '75px'}}><label style={{fontFamily: 'CircularStd', color: '#4F4F4F'}}>{rowData.project}</label></TableCell>
                        <TableCell sx={{maxWidth: '75px'}}><label style={{fontFamily: 'CircularStd', color: '#4F4F4F'}}>{rowData.task}</label></TableCell>
                        <TableCell><label style={{fontFamily: 'CircularStd', color: '#4F4F4F'}}>{rowData.hours}</label></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </MTable> */}

                {/* <Table
                  dataSource={data}
                  columns={columns}
                  pagination={false}
                  className="table-striped accordian-table"
                  style={{overflowX: 'auto'}}
                /> */}

              <div className="row" style={{marginTop: '-60px'}}>
                <div className="col-md-12">
                  <div className="table-responsive invoiceTable accordian-table2">
                    <Table
                        className={allData[0]?.data ? "table-striped" : ''}
                        locale={{
                          emptyText: allData[0]?.data ? null : customEmptyText,
                        }}
                        pagination={false}
                        style = {{overflowX : 'auto'}}
                        columns={columns}                 
                        // bordered
                        dataSource={allData1?.sort((a, b) => a.date.localeCompare(b.date))}
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
               </div>
             </div>

             {
                  allData[0]?.data &&
                  <>
                    <div style={{color: '#6C757D', fontSize: '18px', fontWeight: '500', margin: '35px 25px 30px 0px', display: 'flex', justifyContent: 'flex-end'}}>
                    {t('aDash.total')}: <label style={{color: '#333333', marginLeft: '5px'}}>{allData[0]?.weekTotal}</label>
                    </div>
                    {
                      allData[0]?.data[0]?.status === "Approved" ?
                      <div style={{display: 'flex', justifyContent: 'flex-end', marginRight: '25px'}}>
                        <button
                          className='NextPrevButtons22'
                          disabled={true}
                          style={{border: '1px solid #55ce63b0', borderRadius: '8px', background: '#55ce63b0', color: '#fff', minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px', cursor: 'no-drop'}}
                        >
                          <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetadmin.approved')}</span>
                        </button>
                      </div> :
                      allData[0]?.data[0]?.status === "Declined" ?
                      <div style={{display: 'flex', justifyContent: 'flex-end', marginRight: '25px'}}>
                        <button
                            disabled={true}
                            className='NextPrevButtons22'
                            style={{border: '1px solid #dd000073', borderRadius: '8px', background: '#dd000073', color: '#fff', minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px', cursor: 'no-drop'}}
                        >
                          <span style={{fontSize: '16px', fontWeight: '500', color: '#fff'}}>{t('Timesheetadmin.declined')}</span>
                        </button>
                      </div> :
                      <div style={{display: 'flex', gap: '15px', justifyContent: 'flex-end', marginRight: '25px'}}>
                        <Button
                            disabled={login_user_id === allData?._id}
                            onClick={() => setOpen({ isOpen: true, data: allData[0]?.data, week_no: 0})}
                            className={login_user_id !== allData?._id && `NextPrevButtons`}
                            style={{border: `${login_user_id === allData?._id ? '1px solid #ff8181' : '1px solid #DD0000'}`, borderRadius: '8px', background: '#fff', color: `${login_user_id === allData?._id ? '#ff8181' : '#DD0000'}`, minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px'}}
                        >
                          <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetadmin.decline')}</span>
                        </Button>
                        <Button
                          onClick={() => {
                            onHandleApprove(allData[0]?.data, 0);
                          }}
                          className={login_user_id !== allData?._id && `NextPrevButtons2`}
                          disabled={loader || login_user_id === allData?._id}
                          style={{border: `${login_user_id === allData?._id ? '1px solid #7bd485' : '1px solid #55CE63'}`, borderRadius: '8px', background: `${login_user_id === allData?._id ? '#7bd485' : '#55CE63'}`, color: '#fff', minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px'}}
                        >
                          {
                            loader ? <Spin size="small" indicator={antIcon} />
                            : <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetadmin.approve')}</span>
                          }
                        </Button>
                      </div>
                    }
                    
                  </>
                }
                
              </AccordionDetails>
            </Accordion>

            <div style={{color: '#6C757D', fontSize: '18px', fontWeight: '500', margin: '20px 0px'}}>
            {t('Timesheetadmin.week')} 2
            </div>
            <Accordion expanded={expanded === 'week'}>
              <AccordionSummary
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
              </AccordionSummary>

              <AccordionDetails>
                <div className="row" style={{marginTop: '-60px'}}>
                    <div className="col-md-12">
                      <div className="table-responsive invoiceTable accordian-table2">
                        <Table
                            className={allData[1]?.data ? "table-striped" : ''}
                            locale={{
                              emptyText: allData[1]?.data ? null : customEmptyText,
                            }}
                            pagination={false}
                            style = {{overflowX : 'auto'}}
                            columns={columns}                 
                            // bordered
                            dataSource={allData2?.sort((a, b) => a.date.localeCompare(b.date))}
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
                  </div>
                </div>

                {
                  allData[1]?.data &&
                  <>
                    <div style={{color: '#6C757D', fontSize: '18px', fontWeight: '500', margin: '35px 25px 30px 0px', display: 'flex', justifyContent: 'flex-end'}}>
                    {t('aDash.total')}: <label style={{color: '#333333', marginLeft: '5px'}}>{allData[1]?.weekTotal}</label>
                    </div>

                    {
                      allData[1]?.data[0]?.status === "Approved" ?
                      <div style={{display: 'flex', justifyContent: 'flex-end', marginRight: '25px'}}>
                        <button
                          className='NextPrevButtons22'
                          disabled={true}
                          style={{border: '1px solid #55ce63b0', borderRadius: '8px', background: '#55ce63b0', color: '#fff', minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px', cursor: 'no-drop'}}
                        >
                          <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetadmin.approved')}</span>
                        </button>
                      </div> :
                      allData[1]?.data[0]?.status === "Declined" ?
                      <div style={{display: 'flex', justifyContent: 'flex-end', marginRight: '25px'}}>
                        <button
                            disabled={true}
                            className='NextPrevButtons22'
                            style={{border: '1px solid #dd000073', borderRadius: '8px', background: '#dd000073', color: '#fff', minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px', cursor: 'no-drop'}}
                        >
                          <span style={{fontSize: '16px', fontWeight: '500', color: '#fff'}}>{t('Timesheetadmin.declined')}</span>
                        </button>
                      </div> :
                      <div style={{display: 'flex', gap: '15px', justifyContent: 'flex-end', marginRight: '25px'}}>
                        <Button
                            disabled={login_user_id === allData?._id}
                            onClick={() => setOpen({ isOpen: true, data: allData[1]?.data, week_no: 1})}
                            className={login_user_id !== allData?._id && `NextPrevButtons`}
                            style={{border: `${login_user_id === allData?._id ? '1px solid #ff8181' : '1px solid #DD0000'}`, borderRadius: '8px', background: '#fff', color: `${login_user_id === allData?._id ? '#ff8181' : '#DD0000'}`, minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px'}}
                        >
                          <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetadmin.decline')}</span>
                        </Button>
                        <Button
                          onClick={() => {
                            onHandleApprove(allData[1]?.data, 1);
                          }}
                          className={login_user_id !== allData?._id && `NextPrevButtons2`}
                          disabled={loader2 || login_user_id === allData?._id}
                          style={{border: `${login_user_id === allData?._id ? '1px solid #7bd485' : '1px solid #55CE63'}`, borderRadius: '8px', background: `${login_user_id === allData?._id ? '#7bd485' : '#55CE63'}`, color: '#fff', minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px'}}
                        >
                          {
                            loader2 ? <Spin size="small" indicator={antIcon} />
                            : <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetadmin.approve')}</span>
                          }
                        </Button>
                      </div>
                    }

                    
                  </>
                }
              </AccordionDetails>
            </Accordion>

            <div style={{color: '#6C757D', fontSize: '18px', fontWeight: '500', margin: '20px 0px'}}>
            {t('Timesheetadmin.week')} 3
            </div>
            <Accordion expanded={expanded === 'week'}>
              <AccordionSummary
                // expandIcon={<ExpandMoreIcon sx={{ backgroundColor: '#E6E6E6', color: '#000', borderRadius: '8px' }} />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                
              </AccordionSummary>

              <AccordionDetails>
                <div className="row" style={{marginTop: '-60px'}}>
                    <div className="col-md-12">
                      <div className="table-responsive invoiceTable accordian-table2">
                        <Table
                            className={allData[2]?.data ? "table-striped" : ''}
                            locale={{
                              emptyText: allData[2]?.data ? null : customEmptyText,
                            }}
                            pagination={false}
                            style = {{overflowX : 'auto'}}
                            columns={columns}                 
                            // bordered
                            dataSource={allData3?.sort((a, b) => a.date.localeCompare(b.date))}
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
                  </div>
                </div>

                {
                  allData[2]?.data &&
                  <>
                    <div style={{color: '#6C757D', fontSize: '18px', fontWeight: '500', margin: '35px 25px 30px 0px', display: 'flex', justifyContent: 'flex-end'}}>
                    {t('aDash.total')}: <label style={{color: '#333333', marginLeft: '5px'}}>{allData[2]?.weekTotal}</label>
                    </div>

                    {
                      allData[2]?.data[0]?.status === "Approved" ?
                      <div style={{display: 'flex', justifyContent: 'flex-end', marginRight: '25px'}}>
                        <button
                          className='NextPrevButtons22'
                          disabled={true}
                          style={{border: '1px solid #55ce63b0', borderRadius: '8px', background: '#55ce63b0', color: '#fff', minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px', cursor: 'no-drop'}}
                        >
                          <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetadmin.approved')}</span>
                        </button>
                      </div> :
                      allData[2]?.data[0]?.status === "Declined" ?
                      <div style={{display: 'flex', justifyContent: 'flex-end', marginRight: '25px'}}>
                        <button
                            disabled={true}
                            className='NextPrevButtons22'
                            style={{border: '1px solid #dd000073', borderRadius: '8px', background: '#dd000073', color: '#fff', minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px', cursor: 'no-drop'}}
                        >
                          <span style={{fontSize: '16px', fontWeight: '500', color: '#fff'}}>{t('Timesheetadmin.declined')}</span>
                        </button>
                      </div> :
                      <div style={{display: 'flex', gap: '15px', justifyContent: 'flex-end', marginRight: '25px'}}>
                        <Button
                            disabled={login_user_id === allData?._id}
                            onClick={() => setOpen({ isOpen: true, data: allData[2]?.data, week_no: 2})}
                            className={login_user_id !== allData?._id && `NextPrevButtons`}
                            style={{border: `${login_user_id === allData?._id ? '1px solid #ff8181' : '1px solid #DD0000'}`, borderRadius: '8px', background: '#fff', color: `${login_user_id === allData?._id ? '#ff8181' : '#DD0000'}`, minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px'}}
                        >
                          <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetadmin.decline')}</span>
                        </Button>
                        <Button
                          onClick={() => {
                            onHandleApprove(allData[2]?.data, 2);
                          }}
                          className={login_user_id !== allData?._id && `NextPrevButtons2`}
                          disabled={loader3 || login_user_id === allData?._id}
                          style={{border: `${login_user_id === allData?._id ? '1px solid #7bd485' : '1px solid #55CE63'}`, borderRadius: '8px', background: `${login_user_id === allData?._id ? '#7bd485' : '#55CE63'}`, color: '#fff', minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px'}}
                        >
                          {
                            loader3 ? <Spin size="small" indicator={antIcon} />
                            : <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetadmin.approve')}</span>
                          }
                        </Button>
                      </div>
                    }
                    
                  </>
                }
              </AccordionDetails>
            </Accordion>

            <div style={{color: '#6C757D', fontSize: '18px', fontWeight: '500', margin: '20px 0px'}}>
            {t('Timesheetadmin.week')} 4
            </div>
            <Accordion expanded={expanded === 'week'}>
              <AccordionSummary
                // expandIcon={<ExpandMoreIcon sx={{ backgroundColor: '#E6E6E6', color: '#000', borderRadius: '8px' }} />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                
              </AccordionSummary>

              <AccordionDetails>
                <div className="row" style={{marginTop: '-60px'}}>
                    <div className="col-md-12">
                      <div className="table-responsive invoiceTable accordian-table2">
                        <Table
                            className={allData[3]?.data ? "table-striped" : ''}
                            locale={{
                              emptyText: allData[3]?.data ? null : customEmptyText,
                            }}
                            pagination={false}
                            style = {{overflowX : 'auto'}}
                            columns={columns}                 
                            // bordered
                            dataSource={allData4?.sort((a, b) => a.date.localeCompare(b.date))}
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
                  </div>
                </div>

                {
                  allData[3]?.data &&
                  <>
                    <div style={{color: '#6C757D', fontSize: '18px', fontWeight: '500', margin: '35px 25px 30px 0px', display: 'flex', justifyContent: 'flex-end'}}>
                    {t('aDash.total')}: <label style={{color: '#333333', marginLeft: '5px'}}>{allData[3]?.weekTotal}</label>
                    </div>

                    {
                      allData[3]?.data[0]?.status === "Approved" ?
                      <div style={{display: 'flex', justifyContent: 'flex-end', marginRight: '25px'}}>
                        <button
                          className='NextPrevButtons22'
                          disabled={true}
                          style={{border: '1px solid #55ce63b0', borderRadius: '8px', background: '#55ce63b0', color: '#fff', minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px', cursor: 'no-drop'}}
                        >
                          <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetadmin.approved')}</span>
                        </button>
                      </div> :
                      allData[3]?.data[0]?.status === "Declined" ?
                      <div style={{display: 'flex', justifyContent: 'flex-end', marginRight: '25px'}}>
                        <button
                            disabled={true}
                            className='NextPrevButtons22'
                            style={{border: '1px solid #dd000073', borderRadius: '8px', background: '#dd000073', color: '#fff', minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px', cursor: 'no-drop'}}
                        >
                          <span style={{fontSize: '16px', fontWeight: '500', color: '#fff'}}>{t('Timesheetadmin.declined')}</span>
                        </button>
                      </div> :
                      <div style={{display: 'flex', gap: '15px', justifyContent: 'flex-end', marginRight: '25px'}}>
                        <Button
                            disabled={login_user_id === allData?._id}
                            onClick={() => setOpen({ isOpen: true, data: allData[3]?.data, week_no: 3})}
                            className={login_user_id !== allData?._id && `NextPrevButtons`}
                            style={{border: `${login_user_id === allData?._id ? '1px solid #ff8181' : '1px solid #DD0000'}`, borderRadius: '8px', background: '#fff', color: `${login_user_id === allData?._id ? '#ff8181' : '#DD0000'}`, minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px'}}
                        >
                          <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetadmin.decline')}</span>
                        </Button>
                        <Button
                          onClick={() => {
                            onHandleApprove(allData[3]?.data, 3);
                          }}
                          className={login_user_id !== allData?._id && `NextPrevButtons2`}
                          disabled={loader4 || login_user_id === allData?._id}
                          style={{border: `${login_user_id === allData?._id ? '1px solid #7bd485' : '1px solid #55CE63'}`, borderRadius: '8px', background: `${login_user_id === allData?._id ? '#7bd485' : '#55CE63'}`, color: '#fff', minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px'}}
                        >
                          {
                            loader4 ? <Spin size="small" indicator={antIcon} />
                            : <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetadmin.approve')}</span>
                          }
                        </Button>
                      </div>
                    }
                    
                  </>
                }
              </AccordionDetails>
            </Accordion>

            <div style={{color: '#6C757D', fontSize: '18px', fontWeight: '500', margin: '20px 0px'}}>
            {t('Timesheetadmin.week')} 5
            </div>
            <Accordion expanded={expanded === 'week'}>
              <AccordionSummary
                // expandIcon={<ExpandMoreIcon sx={{ backgroundColor: '#E6E6E6', color: '#000', borderRadius: '8px' }} />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                
              </AccordionSummary>

              <AccordionDetails>
                <div className="row" style={{marginTop: '-60px'}}>
                    <div className="col-md-12">
                      <div className="table-responsive invoiceTable accordian-table2">
                        <Table
                            className={allData[4]?.data ? "table-striped" : ''}
                            locale={{
                              emptyText: allData[4]?.data ? null : customEmptyText,
                            }}
                            pagination={false}
                            style = {{overflowX : 'auto'}}
                            columns={columns}                 
                            // bordered
                            dataSource={allData5?.sort((a, b) => a.date.localeCompare(b.date))}
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
                  </div>
                </div>

                {
                  allData[4]?.data &&
                  <>
                    <div style={{color: '#6C757D', fontSize: '18px', fontWeight: '500', margin: '35px 25px 30px 0px', display: 'flex', justifyContent: 'flex-end'}}>
                    {t('aDash.total')}: <label style={{color: '#333333', marginLeft: '5px'}}>{allData[4]?.weekTotal}</label>
                    </div>

                    {
                      allData[4]?.data[0]?.status === "Approved" ?
                      <div style={{display: 'flex', justifyContent: 'flex-end', marginRight: '25px'}}>
                        <button
                          className='NextPrevButtons22'
                          disabled={true}
                          style={{border: '1px solid #55ce63b0', borderRadius: '8px', background: '#55ce63b0', color: '#fff', minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px', cursor: 'no-drop'}}
                        >
                          <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetadmin.approved')}</span>
                        </button>
                      </div> :
                      allData[4]?.data[0]?.status === "Declined" ?
                      <div style={{display: 'flex', justifyContent: 'flex-end', marginRight: '25px'}}>
                        <button
                            disabled={true}
                            className='NextPrevButtons22'
                            style={{border: '1px solid #dd000073', borderRadius: '8px', background: '#dd000073', color: '#fff', minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px', cursor: 'no-drop'}}
                        >
                          <span style={{fontSize: '16px', fontWeight: '500', color: '#fff'}}>{t('Timesheetadmin.declined')}</span>
                        </button>
                      </div> :
                      <div style={{display: 'flex', gap: '15px', justifyContent: 'flex-end', marginRight: '25px'}}>
                        <Button
                            disabled={login_user_id === allData?._id}
                            onClick={() => setOpen({ isOpen: true, data: allData[4]?.data, week_no: 4})}
                            className={login_user_id !== allData?._id && `NextPrevButtons`}
                            style={{border: `${login_user_id === allData?._id ? '1px solid #ff8181' : '1px solid #DD0000'}`, borderRadius: '8px', background: '#fff', color: `${login_user_id === allData?._id ? '#ff8181' : '#DD0000'}`, minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px'}}
                        >
                          <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetadmin.decline')}</span>
                        </Button>
                        <Button
                          onClick={() => {
                            onHandleApprove(allData[4]?.data, 4);
                          }}
                          className={login_user_id !== allData?._id && `NextPrevButtons2`}
                          disabled={loader5 || login_user_id === allData?._id}
                          style={{border: `${login_user_id === allData?._id ? '1px solid #7bd485' : '1px solid #55CE63'}`, borderRadius: '8px', background: `${login_user_id === allData?._id ? '#7bd485' : '#55CE63'}`, color: '#fff', minWidth: '180px', height: '50px', paddingTop: '3px', margin: '0px 0px 25px 0px'}}
                        >
                          {
                            loader5 ? <Spin size="small" indicator={antIcon} />
                            : <span style={{fontSize: '16px', fontWeight: '500'}}>{t('Timesheetadmin.approve')}</span>
                          }
                        </Button>
                      </div>
                    }
                    
                  </>
                }
              </AccordionDetails>
            </Accordion>

      
        </div>

      </div>

      {/* ----- Decline Modal ----- */}
      <Modal
        open={open.isOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        // className="modal custom-modal fade"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
        }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
              {t('Timesheetadmin.reasonforrejection')}
              </h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                // form={form}
                name="control-hooks"
                onFinish={(val) => onDecline(val, open?.data, open?.week_no)}
                onFinishFailed={({errorFields}) => {
                  console.log(errorFields.map(field => field.errors.toString().includes('consecutive')));
                  console.log(errorFields);
                  const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                  if(consecutiveSpacesError){
                    message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                 }else{
                    message.error(t('allEmp.errors.fillRequiredFields'))
                  } 
                }}
                initialValues={{
                  designationName: open?.data
                    ? open?.data?.designationName
                    : "",
                }}
              >
                <div className="form-group">
                <label style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div>{t('Timesheetadmin.reason')} <span className="text-danger">*</span></div>
                  </label>
                  <Form.Item
                    name="reason"
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        validator: (_, value) => {
                          if(!value || value.trim() === ''){
                            return Promise.reject(t('Timesheetadmin.pleaseEnterReason'));
                          }
                          else if (/\s{2,}/.test(value)) {
                            return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                          }
                          else if (value.length < 5) {
                            return Promise.reject(t('Timesheetadmin.reasonLengthAtLeast'));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    className="custom-border"
                  >
                    <Input.TextArea rows={3} className={'form-control'} />
                  </Form.Item>
                </div>
                <div className="submit-section">
                  <Form.Item>
                    <Button
                      htmlType="submit"
                      className="btn btn-primary submit-btn"
                      disabled={declineLoader}
                    >
                      {
                        declineLoader ? <Spin size="small" indicator={antIcon} />
                          : t('submit')
                      }
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Modal>

            {/* ----- View Detail Modal ----- */}
            <Modal
              open={open.isViewOpen}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              className="modalScroll"
              // className="modal custom-modal fade"
              aria-describedby="modal-modal-description"
              disableRestoreFocus
              BackdropProps={{
                style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
              }}
              sx={{overflowY: 'auto'}}
            >
              <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                    {t('aRequests.viewModal.details')}
                      {/* {moment(open?.data?.date).format('dddd')} <span style={{marginInline: '6px'}}>|</span> {moment(open?.data?.date).format('DD-MMM-YYYY')} */}
                    </h5>
                    <button type="button" className="close" onClick={handleClose}>
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <Form
                      form={form}
                      name="control-hooks"
                    >
                      {/* <div className="form-group" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                        <div>
                          <h4 style={{fontWeight: '500', marginBottom: '-15px'}}>{open?.data?.projectId?.projectName}</h4>
                          <br />
                          <h4 className="mb-0" style={{color: '#0409217D', fontWeight: '450'}}>{open?.data?.taskId?.title}</h4>
                        </div>
                        <h4 className="mb-0">{open?.data?.hoursWorked}</h4>
                      </div> */}

                      <div className="form-group">
                        <label>
                        {t('Timesheetemployee.date')}
                        </label>
                          <Form.Item
                          name='date'
                          className='custom-border'
                          >
                            {/* <DatePicker style={{backgroundColor: '#e9ecef'}} disabled={true} className={'dateDisable form-control'} /> */}
                            <Input className='form-control' style={{color: '#6C757D', backgroundColor: 'transparent', cursor: 'default'}} disabled/>
                          </Form.Item>
                      </div>
                      <div className="form-group">
                        <label>
                        {t('Timesheetemployee.project')}
                        </label>
                          <Form.Item
                          name='projectName'
                          className='custom-border'
                          >
                              {/* <Select
                                  disabled={true}
                                  className="custom-select custom-normal"
                                  style={{
                                  width: '100%',
                                  }}
                              /> */}
                            <Input className='form-control' style={{color: '#6C757D', backgroundColor: 'transparent', cursor: 'default'}} disabled/>
                          </Form.Item>
                      </div>
                      <div className="form-group">
                        <label>
                        {t('Timesheetadmin.taskName')}
                        </label>
                          <Form.Item
                          name='title'
                          className='custom-border'
                          >
                              {/* <Select
                                  disabled={true}
                                  className="custom-select custom-normal"
                                  style={{
                                  width: '100%',
                                  }}
                              /> */}
                            <Input className='form-control' style={{color: '#6C757D', backgroundColor: 'transparent', cursor: 'default'}} disabled/>
                          </Form.Item>
                      </div>
                      <div className="form-group">
                        <label>
                        {t('Timesheetadmin.hours')}
                        </label>
                          <Form.Item
                          name='hoursWorked'
                          className='custom-border'
                          >
                            <Input className='form-control' style={{color: '#6C757D', backgroundColor: 'transparent', cursor: 'default'}} disabled/>
                          </Form.Item>
                      </div>
                      <div className="form-group">
                        <label style={{display: 'flex', justifyContent: 'space-between'}}>
                          <div>{t('Timesheetemployee.notes')}</div>
                        </label>
                        <Form.Item
                          name="notes"
                          className="custom-border mb-0"
                        >
                          <Input.TextArea disabled rows={3} style={{resize: 'none', color: '#6C757D', backgroundColor: 'transparent', cursor: 'default'}} className='form-control' />
                        </Form.Item>
                      </div>
                    </Form>
                  </div>
                </div>
              </div>
            </Modal>


    </>
  );
};

export default ViewDetailTimesheet