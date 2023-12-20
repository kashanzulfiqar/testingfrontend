import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';
import Modal from "@mui/material/Modal";
import { Form, Select, Table, Empty, message, TimePicker, Button, Input, Spin, Pagination } from 'antd'
import { apiServices } from '../../../Services/apiServices';
import PencilIcon from "../../../files/Icons/pencilIcon.png";
import { itemRender } from '../../paginationfunction';


function WeekViewTimeSheet({ tableStartDate, setTableStartDate, selectedDate, setSelectedDate, open, setOpen, allProjects, getAllProjects, currentWeekDates, setShowCalendar }) {
    
    const moment = require('moment');

    const [form] = Form.useForm();
    const [form2] = Form.useForm();
    const [formduration] = Form.useForm();
    const nav = useNavigate();
    const location = useLocation();

    const permissions = useSelector((state) => state?.permissionsSlice?.data);
  
    const user_state = useSelector((state) => state?.user?.loginvalue);

    const [allData, setAllData] = useState([])
    const [allTasks, setAllTasks] = useState([]);
    const [loader, setLoader] = useState(false);
    const [taskLoader, setTaskLoader] = useState(false);
    const [tableLoader, setTableLoader] = useState(true);
    const [saveButton, setSaveButton] = useState(true);
    const [descLength, setDescLength] = useState(0);
    const [cardReason, setCardReason] = useState('');
    const [oldDurationValue, setOldDurationValue] = useState('');
    const [updatedDuration, setUpdatedDuration] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [paginationDetail, setPaginationDetail] = useState();
    const [showCard, setShowCard] = useState({
      isShown: false,
      data: ''
    });
    const [delOpen, setDelOpen] = useState({
      isDelOpen: false,
      data: ''
    });


    useEffect(() => {
        getData();
        setCurrentPage(1);
        // setPageSize(20);
        formduration.resetFields();
        setShowCard({ isShown: false, data: '' });
        setCardReason('');
        setDescLength(0);
        setOldDurationValue('')
  }, [currentWeekDates])


  const getData = (current_page, page_size) => {
    // const current_date = moment(selectedDate).format('YYYY-MM-DD')
    const from_data = currentWeekDates[0];
    const to_data = currentWeekDates[currentWeekDates.length - 1];
    // console.log(currentWeekDates, from_data, to_data);

    setTableLoader(true)
    // apiServices("GET", `timesheet?page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}${from_data ? `&timesheetFrom=${from_data}` : ''}${to_data ? `&timesheetTo=${to_data}` : ''}`, null, user_state)
    apiServices("GET", `timesheet?page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=99999${from_data ? `&timesheetFrom=${from_data}` : ''}${to_data ? `&timesheetTo=${to_data}` : ''}`, null, user_state)
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

    // const filteredData = t_data.filter(item => currentWeekDates.includes(item.date));
    // setAllData(filteredData);
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
    let d = {
      projectId: {
        _id: values?.projectId,
        projectName: allProjects?.find(proj => proj?._id === values?.projectId)?.projectName
      },
      taskId: {
        _id: values?.taskId,
        title: allTasks?.find(task => task?._id === values?.taskId)?.title
      }
    }
    // when table is empty
    if(allData.length === 0){
      setAllData([d, ...allData]);
      handleClose();
    }
    // when table is not empty or filled with data
    let foundMatch = false;
    for (const item of allData) {
      const projectId = item?.projectId?._id;
      const taskId = item?.taskId?._id;

      if (projectId === values?.projectId && taskId === values?.taskId) {
        // message.error('Data Already Exist for this Project & Task!');
        foundMatch = true;
        break
      }
    }

    if (foundMatch) {
      message.error('Data Already Exist for this Project & Task!');
    } else {
      setAllData([d, ...allData]);
      handleClose();
      formduration.resetFields();
    }


    // let data = {
    //     ...values,
    // }
    // setLoader(true);

    // currentWeekDates.map((date, index) => {
    //   let new_data = {
    //     ...data,
    //     date
    //   }
    //   apiServices("POST", 'timesheet', new_data, user_state)
    //     .then((res) => {
    //         if (res?.data?.success === true) {
    //             if(index === 6){
    //               getData(currentPage, pageSize);
    //               handleClose();
    //               message.success('Timesheet Added Successfully!');
    //               setLoader(false);
    //             }
    //           }
    //         })
    //         .catch((err) => {
    //       setLoader(false);
    //       message.error(
    //         `${
    //           err?.response?.data?.msg
    //             ? err?.response?.data?.msg
    //             : err?.response?.data?.validation?.body?.message
    //             ? err?.response?.data?.validation?.body?.message
    //             : "Add Timesheet Error"
    //         }!`
    //       );
    //     });
    // })
  }

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekStartDate = new Date(tableStartDate);
    weekStartDate.setDate(
      weekStartDate.getDate() - ((weekStartDate.getDay() + 6) % 7)
    );

    const handleClose = (type) => {
    if(type === 'update'){
        setOpen({
        isAddOpen: false,
        isAddWeekOpen: false,
        isDelOpen: false,
        data: ''
        });
        form2.resetFields();
    //   getAllTasks(filterValues, currentPage, pageSize)
    }else if(type === 'delete'){
        setDelOpen({
        isDelOpen: false,
        data: ''
        });
    }else{
        setOpen({
        isAddOpen: false,
        isAddWeekOpen: false,
        isDelOpen: false,
        data: ''
        });
        form2.resetFields(); 
    }
    };


    const handleTimePickerChange = (date, project, task, time, type) => {
      if(type === 'Update'){
        const updatedData = allData.map((item) => {
          if (moment(item?.date).format('YYYY-MM-DD') === date && item.projectId?._id === project?._id && item.taskId?._id === task?._id) {
            // console.log({ ...item, hoursWorked: time });
            setUpdatedDuration(time)
            return { ...item, hoursWorked: time };
          }
          return item;
      });
      setAllData(updatedData);
      }else{
        setUpdatedDuration(time)
      }
    };

  const handleUpdate = () => {
    let u_data = {
      _id: showCard?.data?._id,
      hoursWorked: updatedDuration,
      reason: cardReason,

      submittedForApproval: false,
      status: 'No-Status'
    }

    setLoader(true);
    apiServices("PUT", 'timesheet', u_data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
            getData(currentPage, pageSize);
            setShowCard({isShown: false, data: ''});
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
  const handleCreate = () => {
    let c_data = {
      // ...showCard?.data,
      date: showCard?.data?.date,
      projectId: showCard?.data?.projectId?._id,
      taskId: showCard?.data?.taskId?._id,
      hoursWorked: updatedDuration,
      reason: cardReason,
    }

    setLoader(true);
    apiServices("POST", 'timesheet', c_data, user_state)
      .then((res) => {
          if (res?.data?.success === true) {
              getData(currentPage, pageSize);
              setShowCard({isShown: false, data: ''});
              message.success('Timesheet Created Successfully!');
              setLoader(false);
              formduration.resetFields();
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
              : "Create Timesheet Error"
          }!`
        );
      });
    }

    const onHandleDelete = (id) => {
      setLoader(true)
    apiServices("DELETE", "timesheet", id, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          // setData([...data.filter((designation) => designation._id !== id)]);
          // getData(currentPage, pageSize)
          if(allData?.length > 1){
            getData(currentPage, pageSize);
            setShowCard({isShown: false, data: ''});
          }else{
            if(currentPage === 1){
              getData(currentPage, pageSize);
            setShowCard({isShown: false, data: ''});
            }else{
              getData(currentPage-1, pageSize);
              setCurrentPage(prev => prev-1);
              setShowCard({isShown: false, data: ''});
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

  const handleSubmitApproval = () => {
    // const found = allData.some(item => item?.submittedForApproval === true)
    let data = {
      submittedForApproval: true,
      status: 'Pending'
    }
    setLoader(true);

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
            setLoader(false);
          }
        }})
        .catch((err) => {
        setLoader(false);
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

    const handleCancel = () => {
      const updatedData = allData.map((item) => {
        if (item?.date === showCard?.data?.date && item.projectId?._id === showCard?.data?.projectId?._id && item.taskId?._id === showCard?.data?.taskId?._id) {
          // console.log({ ...item, hoursWorked: time });
          return { ...item, hoursWorked: oldDurationValue };
        }
        return item;
    });
    setAllData(updatedData);
    // setOldDurationValue('');
    }

    const handleCancel2 = () => {
    formduration.resetFields();
    }

const Dayscolumns = daysOfWeek.map((day, index) => (
    {
        title: (
        <div
            style={{
                display: "grid",
                placeContent: 'center',
                padding: '9px 0px',
            }}
        >
            <label style={{textAlign: 'center', fontWeight: '700', lineHeight: '20px'}}>{day}</label>
            <label style={{color: '#666', lineHeight: '20px'}}>
            {new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index).getDate()}{" "}
            {new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index).toLocaleDateString("en-US", { month: "short" })}
            </label>
        </div>
        ),
        dataIndex: '',
        key: day,
        render: (text, record, index2) => {
            if(record?.projectId){
              // console.log(record, new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index).toISOString().split('T')[0]);
            // const d = record?.data?.filter(rec => rec?.date === new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index).toISOString().split('T')[0])
            const d = record?.data?.filter(rec => moment(rec?.date).format('YYYY-MM-DD') === moment(new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index)).format('YYYY-MM-DD'))
            const [specific_date_data] = d;
            // console.log(d);
            return (
                <>
                    {
                        // <label style={{fontWeight: '500', border: '2px solid #BCBCBC', borderRadius: '8px', padding: '6px 12px', fontSize: '17px'}}>
                        //     {specific_date_data?.hoursWorked} 
                        // </label> 
                        specific_date_data ?
                          <TimePicker
                              allowClear={false}
                              // disabled={allData.some(item => item?.submittedForApproval === true)}
                              className="form-control timePickerWithData"
                              placeholder="00:00"
                              format={"HH:mm"}
                              defaultValue={specific_date_data?.hoursWorked ? moment(specific_date_data?.hoursWorked, 'HH:mm') : ''}
                              // value={moment(specific_date_data?.hoursWorked, 'HH:mm')}
                              value={specific_date_data?.hoursWorked ? moment(specific_date_data?.hoursWorked, 'HH:mm') : ''}
                              onClick={() => {
                                if(!showCard?.isShown || (showCard?.isShown && (specific_date_data?._id !== showCard?.data?._id))){
                                  setShowCard({ isShown: true, data: specific_date_data });
                                  setCardReason(specific_date_data?.reason);
                                  setUpdatedDuration(specific_date_data?.hoursWorked)
                                  setDescLength(specific_date_data?.reason?.length);
                                  setOldDurationValue(specific_date_data?.hoursWorked);
                                  handleCancel();
                                  formduration.resetFields();
                                  console.log(specific_date_data);
                                  setSaveButton(true);
                                }
                              }}
                              onChange={(value) => {
                                // handleTimePickerChange(new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index).toISOString().split('T')[0], record?.projectId, record.taskId, moment(value).format('HH:mm'), 'Update');
                                handleTimePickerChange(moment(new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index)).format('YYYY-MM-DD'), record?.projectId, record.taskId, moment(value).format('HH:mm'), 'Update');
                                setSaveButton(false);
                                // console.log(specific_date_data);
                              }
                              }
                              suffixIcon={false}
                          />
                        :
                        // <label style={{color: '#66666633', border: '2px solid #BCBCBC', borderRadius: '8px', padding: '6px 12px', fontSize: '17px'}}>
                        //     00:00 
                        // </label>

                        <Form
                          form={formduration}
                          className='formDurationInput'
                        >
                          <Form.Item
                            // name={`${record?.taskId?._id}${new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index).toISOString().split('T')[0]}`}
                            // name={`${record?.taskId?._id}${new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index)}`}
                            name={`${index}${index2}`}
                          >
                            <TimePicker
                              // disabled={allData.some(item => item?.submittedForApproval === true)}
                              allowClear={false}
                              className="form-control timePickerWithData"
                              placeholder="00:00"
                              format={"HH:mm"}
                              onClick={() => {
                                if(!showCard?.isShown || (showCard?.isShown && (`${index}${index2}` !== showCard?.data?.indexId))){
                                  let d = {
                                    projectId: {_id: record?.projectId?._id, projectName: record?.projectId?.projectName},
                                    taskId: {_id: record?.taskId?._id, title: record?.taskId?.title},
                                    date: moment(new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index)).format('YYYY-MM-DD'),
                                    indexId: `${index}${index2}`
                                  }
                                  let idd = showCard?.data?.indexId;
                                  setShowCard({ isShown: true, data: d });
                                    setCardReason('');
                                    setUpdatedDuration('')
                                    setDescLength(0);
                                    formduration.setFieldsValue({ [idd]: ''})
                                    console.log(record, moment(new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index)).format('YYYY-MM-DD'));
                                    setSaveButton(true);
                                }
                              }}
                              onChange={(value) => {
                                handleTimePickerChange(moment(new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index)).format('YYYY-MM-DD'), record?.projectId, record?.taskId, moment(value).format('HH:mm'), 'Add');
                                setSaveButton(false);
                              }
                              }
                              suffixIcon={false}
                            />
                          </Form.Item>
                        </Form>
                    }
                </>
            )
            }else{
              // const totalMinutes = allData?.filter(item => item.date === new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index).toISOString().split('T')[0])
              const totalMinutes = allData?.filter(item => moment(item?.date).format('YYYY-MM-DD') === moment(new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index)).format('YYYY-MM-DD'))
              ?.reduce((acc, item) => acc + item?.hoursWorked?.split(':')?.reduce((acc, val, idx) => acc + parseInt(val ? val : 0, 10) * (idx === 0 ? 60 : 1), 0), 0);

              const hours = Math.floor(totalMinutes / 60) || 0;
              const minutes = totalMinutes % 60 || 0;
              const formattedHours = hours.toString().padStart(2, '0');
              const formattedMinutes = minutes.toString().padStart(2, '0');
                
              return (
                <label style={{fontSize: '17px', fontWeight: '500', width: '76px'}}>{formattedHours}:{formattedMinutes}</label>
              )
            }
        }
    }
    ));

//     let t_data = [
//     {
//         _id: 1,
//         projectId: {
//             _id: "652e535c13934c8ecc420eea",
//             projectName: 'Monndaine'
//         },
//         taskId: {
//             _id: "65361fcb4215f750c657235aX",
//             title: 'ADS 1213'
//         },
//         hoursWorked: "",
//         date: "2023-11-06",
//         reason: "lkklklj444 lkjlkjlk lkjlkj lklkjl lkjlkj lkjklj lkjlkj jhg h gf jhk hkj iuy kj kjh iuy uiyiuyiu yuiiy ytytrytryt yttyryt rytrytry ytytrty ygjhh kj444."
//     },
//     {
//         _id: 11,
//         projectId: {
//             _id: "652e535c13934c8ecc420eea",
//             projectName: 'Monndaine'
//         },
//         taskId: {
//             _id: "65361fcb4215f750c657235aX",
//             title: 'ADS 1213'
//         },
//         hoursWorked: "",
//         date: "2023-11-07",
//         reason: "lkklklj444 lkjlkjlk lkjlkj lklkjl lkjlkj lkjklj lkjlkj jhg h gf jhk hkj iuy kj kjh iuy uiyiuyiu yuiiy ytytrytryt yttyryt rytrytry ytytrty ygjhh kj444."
//     },
//     {
//         _id: 4,
//         projectId: {
//             _id: "652e535c13934c8ecc420eea",
//             projectName: 'Monndaine'
//         },
//         taskId: {
//             _id: "65361fcb4215f750c657235aX",
//             title: 'ADS 1213'
//         },
//         hoursWorked: "02:00",
//         date: "2023-11-14",
//         reason: "lkklklj444 lkjlkjlk lkjlkj lklkjl lkjlkj lkjklj lkjlkj jhg h gf jhk hkj iuy kj kjh iuy uiyiuyiu yuiiy ytytrytryt yttyryt rytrytry ytytrty ygjhh kj444."
//     },
//     {
//         _id: 2,
//         projectId: {
//             _id: "652e535c13934c8ecc420eea",
//             projectName: 'Monndaine3'
//         },
//         taskId: {
//             _id: "65361fcb4215f750c657235aX1",
//             title: 'ADS 1213'
//         },
//         hoursWorked: "03:00",
//         date: "2023-11-07",
//         reason: "lkklklj333"
//     },
//     {
//         _id: 22,
//         projectId: {
//             _id: "652e535c13934c8ecc420eea",
//             projectName: 'Monndaine3'
//         },
//         taskId: {
//             _id: "65361fcb4215f750c657235aX1",
//             title: 'ADS 1213'
//         },
//         hoursWorked: "",
//         date: "2023-11-06",
//         reason: "lkklklj333"
//     },
//     {
//         _id: 3,
//         projectId: {
//             _id: "652e535c13934c8ecc420eea",
//             projectName: 'Monndaine 2'
//         },
//         taskId: {
//             _id: "65361fcb4215f750c657235a",
//             title: 'ADS 1213 2'
//         },
//         hoursWorked: "10:00",
//         date: "2023-11-07",
//         reason: "lkklklj33310000"
//     },
// ]

    const antIcon = (
    <LoadingOutlined
        style={{
        fontSize: 24,
        color: '#fff'
        }}
        spin
    />
    );
    const antIcon2 = (
    <LoadingOutlined
        style={{
        fontSize: 22,
        // color: '#fff'
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

    const groupedData = allData.reduce((result, item) => {
        const key = `${item.projectId._id}-${item.taskId._id}`;
        if (!result[key]) {
          result[key] = {
            projectId: item.projectId,
            // projectId: item.projectId.projectName,
            taskId: item.taskId,
            // taskId: item.taskId.title,
            data: [],
            totalDuration: 0,
          };
        }
        result[key].data.push(item);
        result[key].totalDuration += durationToMinutes(item?.hoursWorked ? item?.hoursWorked : '00:00');
        return result;
      }, {});
      
      function durationToMinutes(duration) {
        const [hours, minutes] = duration?.split(":").map(Number)
        return hours * 60 + minutes || 0;
      }
      
      // const rows = Object.values(groupedData);
      const rows1 = Object.values(groupedData);
      const rows = [...rows1, {}];

      
      const columns = [
        {
          title: "Title",
          dataIndex: "Title",
          key: "Title",
          render: (text, record) => (
            <>
              <label onClick={() => console.log(record)} style={{textWrap: 'nowrap', fontWeight: '500'}}>{record?.projectId?.projectName}</label>
              <br />
              <label style={{textWrap: 'no-wrap', color: '#0409217D', fontWeight: '450'}}>{record?.taskId?.title}</label>
            </>
          ),
        },
        ...Dayscolumns,
        {
          title: "Total",
          dataIndex: "Total",
          key: "Total",
          render: (text, record) => {
            if(record?.projectId){
              const hours = Math.floor(record?.totalDuration / 60) || 0;
              const remainingMinutes = record?.totalDuration % 60 || 0;

              const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
              const formattedMinutes = remainingMinutes < 10 ? `0${remainingMinutes}` : `${remainingMinutes}`;

              return (
                  <label style={{fontSize: '17px', fontWeight: '500'}}>{formattedHours}:{formattedMinutes}</label>
                )
            }else{
              function getColumnData(data, columnName) {
                return data.map(item => item[columnName] ? item[columnName] : 0);
              }
              
              const totalDurationArray = getColumnData(rows, 'totalDuration');
              let popped = totalDurationArray.pop();
              const totalMinutes = totalDurationArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

              const hours = Math.floor(totalMinutes / 60);
              const minutes = totalMinutes % 60;

              const formattedHours = hours.toString().padStart(2, '0');
              const formattedMinutes = minutes.toString().padStart(2, '0');
              
              return (
                <label style={{fontSize: '17px', fontWeight: '500', width: '76px'}}>{formattedHours}:{formattedMinutes}</label>
              )
            }
        },
        },
      ];

      
  return (
    <div>
        <>
            <div className="table-responsive timeSheetWeekTable" style={{borderRadius: '10px'}}>	
            {/* payrollHistoryTable */}
            {/* height: '485px' */}
              <Table
                loading={tableLoader}
                className={rows?.length > 0 ? "table-striped" : ""}
                pagination={false}
                // style={{ overflowX: "auto" }}
                style={{ maxHeight: '409px' }}
                columns={columns}
                dataSource={rows}
              />
            </div>
            {
              (!showCard?.isShown && rows?.length > 1 && !allData.some(item => item?.submittedForApproval === true)) &&
              <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <button
                    onClick={handleSubmitApproval}
                    className='SubmitForApprovalButton'
                    disabled={loader}
                    style={{border: '2px solid #FF9B44', borderRadius: '8px', background: '#fff', color: '#FF9B44', minWidth: '90px', height: '42px', paddingTop: '3px', margin: '30px 0px 15px 0px', paddingInline: '18px'}}
                >
                  {
                    loader ? <Spin size="small" indicator={antIcon3} />
                    : <span style={{fontSize: '16px', fontWeight: '500'}}>Submit for Approval</span>
                  }
                  {/* <span style={{fontSize: '16px', fontWeight: '500'}}>Submit for Approval</span> */}
                </button>
              </div>
            }
            {
              (!showCard?.isShown && rows?.length > 1 && allData.some(item => item?.submittedForApproval === true)) &&
              <div style={{display: 'flex', justifyContent: 'flex-end', gap: '15px'}}>
                {
                  (!showCard?.isShown && rows?.length > 1 && allData.some(item => item?.submittedForApproval === false)) &&
                  <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <button
                        onClick={handleSubmitApproval}
                        className='SubmitForApprovalButton'
                        disabled={loader}
                        style={{border: '2px solid #FF9B44', borderRadius: '8px', background: '#fff', color: '#FF9B44', minWidth: '90px', height: '42px', paddingTop: '3px', margin: '30px 0px 15px 0px', paddingInline: '18px'}}
                    >
                      {
                        loader ? <Spin size="small" indicator={antIcon4} />
                        : <span style={{fontSize: '16px', fontWeight: '500'}}>Submit Changes</span>
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

        {/* {
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
        } */}

            {/* Bottom info card */}
            {
              showCard?.isShown &&
              <>
                <div className='col-12' style={{background: '#fff', border: '1px solid #DEE2E6', borderRadius: '7px', display: 'flex', minHeight: '190px', margin: '76px 0px 20px 0px', padding: '30px 40px', flexDirection: 'column', gap: '17px'}}>
                  <h4 className="project-title" style={{color: '#333', display: 'flex', alignItems: 'center', gap: '13px'}}>
                      <img src={PencilIcon} width='25px' />
                      <label>
                        Notes- <label style={{marginLeft: '3px', fontWeight: '400'}}>{moment(showCard?.data?.date).format('ddd, MMM DD')}, {showCard?.data?.projectId?.projectName} and {showCard?.data?.taskId?.title} | {moment(showCard?.data?.date).format('YYYY')}</label>
                      </label>
                  </h4>                  
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '14px', width: '100%'}}>
                        <div style={{marginRight: '25px'}}>
                        <Form>
                          <Form.Item
                            name="reasonInCard"
                            // rules={[
                            // {
                            //     whitespace: true,
                            //     // required: true,
                            //     validator: (_, value) => {
                            //     if(!value || value.trim() === ''){
                            //         // return Promise.reject("please enter notes");
                            //         return Promise.resolve();
                            //     }
                            //     else if (/\s{2,}/.test(value)) {
                            //         return Promise.reject("please remove consecutive spaces");
                            //     }
                            //     else if (value.length <= 4) {
                            //         return Promise.reject("notes length must be at least 5 characters long");
                            //     }
                            //     return Promise.resolve();
                            //     },
                            // },
                            // ]}
                            className="custom-border"
                            style={{margin: '0px'}}
                          >
                            <div>
                              <small style={{ fontSize: '10px', color: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'flex-end'}}>{descLength} / 150</small>
                              <Input.TextArea rows={2} defaultValue={showCard?.data?.reason} value={cardReason} style={{resize: 'none'}} className='form-control' onChange={(e) => { setCardReason(e.target.value); setDescLength(e.target.value.length); setSaveButton(false)}} maxLength={150} />
                            </div>
                          </Form.Item>
                        </Form>
                        </div>
                    </div>

                    <div style={{display: 'flex', alignItems: 'center', gap: '30px', marginLeft: '15px'}}>
                      {/* <h3>{showCard?.data?.hoursWorked}</h3> */}
                      <h3>{updatedDuration}</h3>
                      <div className="dropdown dropdown-action text-end">
                        {
                          showCard?.data?._id &&
                          <>
                            <a onClick={() => setShowCalendar(false)} href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons" style={{fontSize: '28px', marginTop: '-3px'}}>more_vert</i></a>
                            <div className="dropdown-menu dropdown-menu-right">
                                <a className="dropdown-item" href="javascript:void(0)"
                                    onClick={() => {
                                      setDelOpen({ isDelOpen: true, data: showCard?.data });
                                    }}
                                >
                                    <i className="fa fa-trash-o m-r-5" /> Delete
                                </a>
                            </div>
                          </>
                        }
                    </div>
                    </div>
                  </div>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  <button
                      onClick={() => {
                        if(showCard?.data?._id){
                        handleUpdate()
                        }else{
                        handleCreate()
                        }
                      }}
                      disabled={loader || saveButton}
                      className='NextPrevButtons'
                      style={{border: '2px solid #DEE2E6', borderRadius: '8px', background: '#fff', color: '#666', minWidth: '90px', height: '42px', paddingTop: '3px', margin: '0px 0px 25px 0px'}}
                  >
                    {
                        loader ? <Spin size="small" indicator={antIcon2} />
                        : <span style={{fontSize: '16px', fontWeight: '500'}}>Save</span>
                    }
                  </button>
                  <button
                    onClick={() => { 
                      if(showCard?.data?._id){
                        handleCancel();
                        setShowCard({isShown: false, data: ''});
                      }else{
                        handleCancel2();
                        setShowCard({isShown: false, data: ''});
                      }
                    }}
                    className='NextPrevButtons1'
                    disabled={loader}
                    style={{border: '2px solid #FF9B44', borderRadius: '8px', background: '#FF9B44', color: '#fff', minWidth: '90px', height: '42px', paddingTop: '3px', margin: '0px 0px 25px 0px'}}
                >
                    <span style={{fontSize: '16px', fontWeight: '500'}}>Cancel</span>
                </button>
                </div>
              </>
            }
        </>

        {/* Add Modal */}
        <Modal
            open={open?.isAddWeekOpen}
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
                <h5 className="modal-title">{open?.data ? 'Edit' : 'Add'} Row</h5>
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
                </div>
                <div className="submit-section">
                    <button type='submit' className="btn btn-primary submit-btn" disabled={loader}>
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
        {/* Add Modal */}

        {/* Delete Task Modal */}
        <Modal
          open={delOpen.isDelOpen}
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
                        onClick={() => onHandleDelete(delOpen?.data?._id)}
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

export default WeekViewTimeSheet