import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import {
  user_icon,
} from "../../../Entryfile/imagepath";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
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
} from "antd";
import "antd/dist/antd.css";
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "../../antdstyle.css";
import Offcanvas from "../../../Entryfile/offcanvance";
import moment from "moment";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import { useTranslation } from "react-i18next";
import { exportTimesheetToExcel, exportTimesheetToPDF } from "../../../utils/timesheetExport";
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons";

const AdminTimeSheet = () => {
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const role = user_state?.user?.role
  //console.log(permissions,user_state)
  const nav = useNavigate();

  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState({ excel: false, pdf: false });
  const [allProjects, setAllProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  
  const [filters, setFilters] = useState({
    id :"",
    name: "",
    month: "",
    year: "",
    projectId: "",
  });

  const [selectedFilters, setSelectedFilters] = useState({
    id:"",
    name: "",
    month: "",
    year: "",
    projectId: "",
  });

  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));

  function getMonthStartEndDate(month, year) {
    const monthNumber = Number(month);
    const startDate = new Date(year, monthNumber - 1, 1);
    const endDate = new Date(year, monthNumber, 0);
    const formattedStartDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1 + "").padStart(2, "0")}-01`;
    const formattedEndDate = `${endDate.getFullYear()}-${(endDate.getMonth() + 1 + "").padStart(2, "0")}-${endDate.getDate()}`;
    return {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    };
  }
  
  const currentMonthYear = filters.month || selectedMonth || moment().format('YYYY-MM');
  let splitArray = currentMonthYear.split("-");
  let variable1 = splitArray[0];
  let variable2 = splitArray[1];
  
  const { startDate, endDate } = getMonthStartEndDate(variable2, variable1);
  //console.log("Start Date:", startDate);
  //console.log("End Date:", endDate);

  const getAllProjects = () => {
    setProjectsLoading(true);
    apiServices("GET", `project-management?page=${1}&limit=${99999}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          const sortedData = res?.data?.projects?.docs
            ?.slice()
            .sort((a, b) => a.projectName.localeCompare(b.projectName));
          setAllProjects(sortedData || []);
        }
      })
      .catch((err) => {
        console.error('Error fetching projects:', err);
        message.error(t('Timesheetadmin.errorFetchingProjects') || 'Error fetching projects');
      })
      .finally(() => {
        setProjectsLoading(false);
      });
  };

  const handleFilterChange = (value, filterType) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value,
    });
  };


  const handleSearch = () => {
    const { id, name, month, year, projectId } = selectedFilters;

    if (month) {
      setSelectedMonth(month);
    } else {
      setSelectedMonth(moment().format('YYYY-MM'));
    }

    setFilters(selectedFilters);
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const handleReset = () => { 
    setSelectedFilters({
      id: "",
      name: "",
      month: "",
      year: "",
      projectId: "",
    });

    setSelectedMonth(moment().format('YYYY-MM'));

    setFilters({
      id:"",
      name: "",
      month: "",
      year: "",
      projectId: "",
    });

    form.resetFields();

    setPagination({
      current: 1,
      pageSize: 20,
      total: 0,
    });
  };

  useEffect(() => {
    if ($(".select").length > 0) {
      $(".select").select2({
        minimumResultsForSearch: -1,
        width: "100%",
      });
    }
  });

  const [employees, setEmployees] = useState([]);

  const fetchEmployees = () => {
    apiServices("GET", `user/all-employees`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const emps = res?.data?.User;
          //console.log(emps)
          setEmployees(emps);
          //console.log("these are ", emps)
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('Timesheetadmin.getClientError')
          }`
        );
      });
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

  useEffect(() => {
      if (
        role === "admin" || permissions?.timesheetManagement
      ) {
        getAllProjects();
        setIsLoading(true);
        firstAPI();
      } else {
        nav("/restricted", { state: { unAuthorize: true } });
      }
  }, [filters, pagination.current, pagination.pageSize]);

  const firstAPI = () => {
    const params = {
      ...filters,
      page: pagination.current,
      limit: pagination.pageSize,
    };

    const monthToUse = filters.month || selectedMonth || moment().format('YYYY-MM');
    const monthArray = monthToUse.split("-");
    const year = monthArray[0];
    const month = monthArray[1];
    const { startDate: apiStartDate, endDate: apiEndDate } = getMonthStartEndDate(month, year);

    const projectIdParam = filters.projectId ? `&projectId=${filters.projectId}` : '';
    const userNameParam = filters.name ? `&userName=${filters.name}` : '';

    apiServices(
      "GET",
      `timesheet/?${userNameParam}&page=${params.page}&limit=999999&timesheetFrom=${apiStartDate}&timesheetTo=${apiEndDate}&employeeOnly=${false}${projectIdParam}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          //const newPayrolls = res?.data?.payrolls || [];
          const response = res?.data?.Timesheet?.docs
          //const submittedForApprovalData = response.filter(entry => entry.submittedForApproval === true);
          setData(response?.filter(entry => entry.submittedForApproval === true))
          //console.log(data)
          setPagination({
            ...pagination,
            total: res?.data?.Timesheet?.total,
          });
          
        }
      })
      .catch((err) => {
        console.log("error", err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('Timesheetadmin.errorFetchingTimesheets')
          }`
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Download handlers for project-level timesheet export
  const handleDownloadExcel = async () => {
    setDownloadLoading({ ...downloadLoading, excel: true });
    try {
      const projectIdParam = filters.projectId ? `&projectId=${filters.projectId}` : '';
      const userNameParam = filters.name ? `&userName=${filters.name}` : '';

      const response = await apiServices(
        "GET",
        `timesheet/?${userNameParam}&page=${1}&limit=${99999}&timesheetFrom=${startDate}&timesheetTo=${endDate}&employeeOnly=${false}${projectIdParam}`,
        null,
        user_state
      );

      if (response?.data?.success === true) {
        const timesheetData = response?.data?.Timesheet?.docs || [];
        
        if (timesheetData.length > 0) {
          const exportType = filters.name ? 'single' : 'project';
          
          let projectName = 'All Projects';
          if (filters.projectId) {
            const selectedProject = allProjects.find(p => p._id === filters.projectId);
            projectName = selectedProject?.projectName || 'Selected Project';
          } else if (exportType === 'project' && timesheetData.length > 0) {
            const firstProject = timesheetData[0]?.projectId?.projectName || 
                                timesheetData[0]?.boardId?.boardTitle;
            if (firstProject) {
              projectName = firstProject;
            }
          }
          
          await exportTimesheetToExcel(timesheetData, {
            type: exportType,
            resourceName: filters.name || '',
            projectName: projectName,
            dateFrom: apiStartDate,
            dateTo: apiEndDate,
          });
          message.success(t('Timesheetadmin.timesheetExportedSuccessfully') || 'Timesheet exported successfully');
        } else {
          message.warning(t('Timesheetadmin.noTimesheetDataFound') || 'No timesheet data found');
        }
      }
    } catch (err) {
      console.error('Download error:', err);
      message.error(
        err?.response?.data?.msg ||
        t('Timesheetadmin.errorDownloadingTimesheet') ||
        'Error downloading timesheet'
      );
    } finally {
      setDownloadLoading({ ...downloadLoading, excel: false });
    }
  };

  const handleDownloadPDF = async () => {
    setDownloadLoading({ ...downloadLoading, pdf: true });
    try {
      const monthToUse = filters.month || selectedMonth || moment().format('YYYY-MM');
      const monthArray = monthToUse.split("-");
      const year = monthArray[0];
      const month = monthArray[1];
      const { startDate: apiStartDate, endDate: apiEndDate } = getMonthStartEndDate(month, year);

      const projectIdParam = filters.projectId ? `&projectId=${filters.projectId}` : '';
      const userNameParam = filters.name ? `&userName=${filters.name}` : '';

      const response = await apiServices(
        "GET",
        `timesheet/?${userNameParam}&page=${1}&limit=${99999}&timesheetFrom=${apiStartDate}&timesheetTo=${apiEndDate}&employeeOnly=${false}${projectIdParam}`,
        null,
        user_state
      );

      if (response?.data?.success === true) {
        const timesheetData = response?.data?.Timesheet?.docs || [];
        
        if (timesheetData.length > 0) {
          const exportType = filters.name ? 'single' : 'project';
          
          let projectName = 'All Projects';
          if (filters.projectId) {
            const selectedProject = allProjects.find(p => p._id === filters.projectId);
            projectName = selectedProject?.projectName || 'Selected Project';
          } else if (exportType === 'project' && timesheetData.length > 0) {
            const firstProject = timesheetData[0]?.projectId?.projectName || 
                                timesheetData[0]?.boardId?.boardTitle;
            if (firstProject) {
              projectName = firstProject;
            }
          }
          
          exportTimesheetToPDF(timesheetData, {
            type: exportType,
            resourceName: filters.name || '',
            projectName: projectName,
            dateFrom: apiStartDate,
            dateTo: apiEndDate,
            userName: user_state?.user?.fullName || '',
          });
          message.success(t('Timesheetadmin.timesheetExportedSuccessfully') || 'Timesheet exported successfully');
        } else {
          message.warning(t('Timesheetadmin.noTimesheetDataFound') || 'No timesheet data found');
        }
      }
    } catch (err) {
      console.error('Download error:', err);
      message.error(
        err?.response?.data?.msg ||
        t('Timesheetadmin.errorDownloadingTimesheet') ||
        'Error downloading timesheet'
      );
    } finally {
      setDownloadLoading({ ...downloadLoading, pdf: false });
    }
  };

  function categorizeTimesheetByWeek(timesheetData, startDate, endDate) {
    const weeks = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    let currentDate = new Date(start);
  
    while (currentDate.getMonth() === start.getMonth()) {
      const weekStartDate = new Date(currentDate);
      weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay() + 1); // Get the start date of the week (Monday)
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6); // Get the end date of the week (Sunday)
  
      if (weekEndDate > end) {
        weekEndDate.setDate(end.getDate()); // Adjust the week end date to match the provided end date
      }
  
      const currentWeek = {
        startDate: weekStartDate.toISOString().split('T')[0],
        endDate: weekEndDate.toISOString().split('T')[0],
        data: [],
      };
  
      timesheetData.forEach(item => {
        const itemDate = new Date(item.date);
        if (itemDate >= weekStartDate && itemDate <= weekEndDate) {
          currentWeek.data.push(item);
        }
      });
  
      weeks.push(currentWeek);
      currentDate = new Date(weekEndDate);
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day after the week ends
    }
  
    return weeks;
}

  
  // Usage:
  // Pass in your timesheet data, start date, and end date to the function
  
  function calculateWeeksInMonth(startDate, endDate) {
    const weeks = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
  
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
    let currentDate = new Date(start);
  
    // Adjusting start date to the first Monday of the month or previous month's ending dates
    currentDate.setDate(currentDate.getDate() - (currentDate.getDay() - 1));
  
    while (currentDate <= end) {
      const weekStartDate = new Date(currentDate);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6); // Get the end date of the week (Sunday)
  
      if (weekEndDate > end) {
        weekEndDate.setDate(end.getDate()); // Adjust the week end date to match the provided end date
      }
  
      weeks.push({
        startDate: weekStartDate.toISOString().split('T')[0],
        endDate: weekEndDate.toISOString().split('T')[0],
      });
  
      currentDate.setDate(currentDate.getDate() + 7); // Move to the next week
    }
  
    return {
      numberOfWeeks: weeks.length,
      weeksData: weeks
    };
  }
  


  const monthToUse = filters.month || selectedMonth || moment().format('YYYY-MM');
  const monthArray = monthToUse.split("-");
  const year = monthArray[0];
  const month = monthArray[1];
  const { startDate: displayStartDate, endDate: displayEndDate } = getMonthStartEndDate(month, year);

  const categorizedTimesheets = categorizeTimesheetByWeek(data, displayStartDate, displayEndDate);
  
  // Your API response data


// Function to group data by userId while maintaining the weekly format
  const groupDataByUser = (data) => {
    const userData = {};

    // Iterate through each weekly data block
    data.forEach((week) => {
      const { startDate, endDate, data: weeklyData } = week;

      // Iterate through each entry in the weekly data
      weeklyData.forEach((entry) => {
        const { userId } = entry;

        // Create a key for the user if it doesn't exist
        const userIdValue = userId._id;

      // Create a key for the user if it doesn't exist
      if (!userData[userIdValue]) {
        userData[userIdValue] = [];
      }

      // Find the corresponding user data array and push the entry
      const userWeekData = userData[userIdValue].find(
        (userEntry) =>
          userEntry.startDate === startDate && userEntry.endDate === endDate
      );

        if (userWeekData) {
          userWeekData.data.push(entry);
        } else {
          userData[userIdValue].push({
            startDate,
            endDate,
            data: [entry],
          });
        }
      });
    });

    return userData;
  };

  // Group the data by userId
  const groupedUserData = groupDataByUser(categorizedTimesheets);

  // Output the grouped data
  //console.log("grouped by user:",groupedUserData);

  function calculateTotals(data) {
    // Function to calculate total hours in HH:mm format
    function calculateTotalHours(totalMinutes) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
  
    for (const userId in data) {
      const userData = data[userId];
      let monthlyTotalMinutes = 0;
  
      userData.forEach(week => {
        let weekTotalMinutes = 0;
  
        week.data.forEach(day => {
          if (day.hoursWorked && day.hoursWorked !== 'Invalid date') {
            const [hours, minutes] = day.hoursWorked.split(':').map(Number);
            weekTotalMinutes += hours * 60 + minutes;
          }
        });
  
        monthlyTotalMinutes += weekTotalMinutes;
  
        week.weekTotal = calculateTotalHours(weekTotalMinutes);
      });
  
      const monthlyTotal = calculateTotalHours(monthlyTotalMinutes);
      data[userId].monthlyTotal = monthlyTotal;
    }
  
    return data;
  }
  
  
  const updatedData = calculateTotals(groupedUserData);
  //console.log("this is updated",updatedData); 

  
  function transformData(inputData) {
    const transformedData = [];
  
    for (const userId in inputData) {
      const userData = inputData[userId];
      const userObject = {
        _id: userId,
        fullName: userData[0]?.data[0]?.userId.fullName || '',
        imageUrl: userData[0]?.data[0]?.userId.imageUrl || null,
        monthlyTotal: inputData[userId].monthlyTotal || '00:00',
      };
  
      const weeksData = {};
      userData.forEach((week, index) => {
        const weekData = {
          startDate: week.startDate,
          endDate: week.endDate,
          data: week.data,
          weekTotal: week.weekTotal,
        };
        weeksData[index] = weekData;
      });
  
      // Push weeksData to userObject
      Object.assign(userObject, weeksData);
      transformedData.push(userObject);
    }
  
    return transformedData;
  }
    
  const newData = transformData(updatedData);
  //console.log("without api",newData);
  
  // function combineData(userResponse, calculatedData) {
  //   const newDataStructure = [];
  
  //   userResponse.forEach(user => {
  //     const userId = user._id;
  //     const userData = calculatedData[userId];
  
  //     if (userData) {
  //       const { fullName, imageUrl, shiftId } = user;
  
  //       const newUserObj = {
  //         ...user,
  //         ...userData,
  //         fullName,
  //         imageUrl,
  //         shiftId,
  //       };
  
  //       newDataStructure.push(newUserObj);
  //     }
  //   });
  
  //   return newDataStructure;
  // }
  
  // const newData = combineData(employees, updatedData);
  // console.log("without api",newData);
  
  const weekData = calculateWeeksInMonth(displayStartDate, displayEndDate);
  //console.log("Result:", weekData);

  function sortUserDataByDate(usersData) {
    usersData?.forEach(userData => {
      Object.values(userData)?.forEach(week => {
        if (Array.isArray(week?.data)) {
          week?.data?.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
      });
    });
    return usersData;
  }
  
  // Function to update newData based on weekData
  const updateDataWithMissingWeeks = (newData, weekData) => {
    // Create a new array to hold the updated data
    const updatedData = newData?.map(user => {
      const userData = { ...user }; // Create a copy of the user object
  
      // Loop through weeks in weekData
      weekData?.weeksData?.forEach(week => {
        // Check if the user's data contains the week
        const weekStart = new Date(week.startDate);
        const weekEnd = new Date(week.endDate);
  
        const weekExists = Object.values(userData).some(item => {
          if (item && item.startDate && item.endDate) {
            const userWeekStart = new Date(item.startDate);
            const userWeekEnd = new Date(item.endDate);
  
            return userWeekStart.getTime() === weekStart.getTime() &&
              userWeekEnd.getTime() === weekEnd.getTime();
          }
          return false;
        });
  
        // If the week is missing, add it to the user's data
        if (!weekExists) {
          const missingWeek = {
            startDate: week.startDate,
            endDate: week.endDate,
            data: null,
            weekTotal: "--"
          };
          // Update the userData with the missing week
          userData[Object.keys(userData).length] = missingWeek;
        }
      });
  
      const sortedUserData = Object.values(userData).slice(0, -3); // Remove metadata
    sortedUserData?.sort((a, b) => {
      if (a?.startDate && b?.startDate) {
        return new Date(a?.startDate)?.getTime() - new Date(b?.startDate)?.getTime();
      }
      return 0;
    });

    // Merge sorted data back into userData
    let index = 0;
    sortedUserData?.forEach(item => {
      userData[index.toString()] = item;
      index++;
    });

      return userData; // Return the updated user data
    });
  
    return updatedData; // Return the completely updated newData
  };
  

// Call the function with your newData and weekData
const FinalData = updateDataWithMissingWeeks(newData, weekData);
//console.log(FinalData)

const generateWeekColumns = (weekData, finalData) => {
  const weekColumns = weekData?.weeksData?.map((week, index) => ({
    title: `${t('Timesheetadmin.week')} ${index + 1}`,
    dataIndex: `week_${index + 1}`,
    render: (_, record) => {
      const userWeekData = finalData?.find(
        (data) =>
          data._id === record._id &&
          data.monthlyTotal &&
          data[`${index}`] &&
          data[`${index}`].startDate === week.startDate &&
          data[`${index}`].endDate === week.endDate
      );
      return userWeekData ? userWeekData[`${index}`].weekTotal : 'N/A';
    },
  }));

  return weekColumns;
};

  const columns = [
    {
      title: t('Timesheetadmin.employee'),
      dataIndex: "fullName",
      render: (text, record) => (
        <h2 className="table-avatar">
          <label className="avatar"><img alt="" src={record?.imageUrl || user_icon} /></label>
          <label>{record?.fullName}</label>
        </h2>
      ),
    },
    ...generateWeekColumns(weekData, FinalData),
    {
      title: t('aDash.total'),
      dataIndex: "monthlyTotal",
    },
    {
      title: t('holiday.actions'),
      render: (text, record) => (
        <div
          style={{
            display: 'inline-block',
            border: '1px solid orange',
            borderRadius: '245px',
            fontSize: '13px',
            padding: '4px 10px',
            background: 'transparent',
            color: '#FF9B44',
            minWidth: 'max-content',
            cursor: 'pointer'
          }}
          className="view-detail-style"
          onClick={() => nav('/admin-timesheet/details', { state: record})}
        >
          {t('Timesheetadmin.viewDetails')}
          {/* <Link 
            // to="/admin-timesheet/details" 
            className="dropdown-item" 
            style={{
              color: 'orange',
              textDecoration: 'none',
            }}
            onClick={() => {
              sessionStorage.setItem(`time_sheet`, 'record')
              console.log(record)
            }} 
            state={{record: record}}>
              View Details
          </Link> */}
        </div>
        
      ),
    }
    
    
  ];
  
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
              </div>
              <div className="col-auto float-end ms-auto">
                {data?.length > 0 ? (
                  <div className="btn-group btn-group-sm">
                    <button
                      className="btn btn-white"
                      onClick={handleDownloadPDF}
                      style={{width: '46px', borderColor: '#cccccc', backgroundColor: '#fff'}}
                      disabled={downloadLoading.pdf}
                    >
                      {downloadLoading.pdf ? <Spin size="small" /> : 'PDF'}
                    </button>
                    <button
                      className="btn btn-white"
                      onClick={handleDownloadExcel}
                      style={{width: '64px', borderColor: '#cccccc', backgroundColor: '#fff'}}
                      disabled={downloadLoading.excel}
                    >
                      {downloadLoading.excel ? <Spin size="small" /> : 'Excel'}
                    </button>
                  </div>
                ) : (
                  <div className="btn-group btn-group-sm">
                    <button className="btn btn-white" style={{backgroundColor: 'transparent', color: '#bdbdbd', cursor: 'no-drop', width: '46px'}}>PDF</button>
                    <button className="btn btn-white" style={{backgroundColor: 'transparent', color: '#bdbdbd', cursor: 'no-drop', width: '64px'}}>Excel</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="row align-items-center">
  <div className="col">
    <h3 className="page-title">{moment(selectedMonth).format('MMMM YYYY')}</h3>
  </div>
  <div className="col-auto float-end ms-auto d-flex gap-2">
    <Form form={form}>
      <div className="row filter-row justify-content-end">
        <div className="col-sm-6 col-md-6 col-lg-2 col-xl-2" style={{ minWidth: '180px' }}>
          <div className="form-group">
            <Form.Item name="projectId" style={{ marginBottom: 0 }}>
              <Select
                showSearch
                allowClear
                placeholder={t('selectProject') || 'Select Project'}
                size="large"
                loading={projectsLoading}
                value={selectedFilters.projectId || undefined}
                filterOption={(input, option) => {
                  const projectName = allProjects.find(p => p._id === option.value)?.projectName || '';
                  return projectName.toLowerCase().includes(input.toLowerCase());
                }}
                onChange={(value) => handleFilterChange(value || '', "projectId")}
                style={{ width: '100%' }}
              >
                {allProjects.map((project) => (
                  <Select.Option key={project._id} value={project._id}>
                    {project.projectName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </div>
        <div className="col-sm-6 col-md-6 col-lg-2 col-xl-2" style={{ minWidth: '180px' }}>
          <div className="form-group">
            <Form.Item name="month" style={{ marginBottom: 0 }}>
              <DatePicker.MonthPicker
                style={{ width: "100%" }}
                placeholder={t('aAttend.selectMonth')}
                size="large"
                allowClear={false}
                format="YYYY-MM"
                value={selectedFilters.month ? moment(selectedFilters.month, 'YYYY-MM') : moment(selectedMonth, 'YYYY-MM')}
                onChange={(date, dateString) => {
                  handleFilterChange(dateString, "month");
                }}
              />
            </Form.Item>
          </div>
        </div>
        <div className="col-sm-6 col-md-6 col-lg-2 col-xl-2" style={{ minWidth: '180px' }}>
          <div className="form-group">
            <Form.Item name="name" style={{ marginBottom: 0 }}>
              <Input
                placeholder={t('employeeName')}
                value={selectedFilters.name || ''}
                onChange={(e) => handleFilterChange(e.target.value, "name")}
                size="large"
              />
            </Form.Item>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-lg-2 col-xl-2">
          <div className="form-group">
            <Button
              type="primary"
              htmlType="submit"
              onClick={handleSearch}
              className="btn-success btn-block w-100"
              style={{ borderRadius: "5px", display: "flex", justifyContent: "center", alignItems: "center" }}
              size="large"
            >
              {t('search')}
            </Button>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-lg-2 col-xl-2">
          <div className="form-group">
            <Button
              htmlType="submit"
              onClick={handleReset}
              className="btn-secondary btn-block w-100"
              style={{
                backgroundColor: "#616161",
                borderColor: "#616161",
                borderRadius: "5px",
                display: "flex", 
                justifyContent: "center",
                alignItems: "center"
              }}
              size="large"
            >
              {t('reset')}
            </Button>
          </div>
        </div>
      </div>
    </Form>
  </div>
</div>
<br/>


          {/* /Main Table */}
          <div className="row">
            <div className="col-md-12">
              <div className="table-responsive TimesheetTable" style={{background: 'white'}}>
                <Table
                  locale={{
                    emptyText: isLoading ? (
                      <Spin size="large" tip="Loading..." />
                    ) : (
                      customEmptyText
                    ),
                  }}
                  className="table-striped"
                  loading={isLoading}
                  style={{ height: "400px", background: "white" }}
                  columns={columns}
                  // bordered
                  dataSource={FinalData}
                  rowKey={(record) => record?._id}
                  pagination={false}
                  // onChange={this.handleTableChange}
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
              {/* {
                    data?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        total={pagination.total}
                        pageSize={pagination.pageSize}
                        defaultCurrent={1}
                        current={pagination.current}
                        showTotal={(total, range) =>
                          `Showing ${range[0]} to ${range[1]} of ${total} entries`}
                        onChange={(page, pageSize) => {
                          setPagination({
                            ...pagination,
                            current: page,
                            pageSize: pageSize,
                          });
                          //console.log(page, size);
                          //setPageSize(size); setCurrentPage(page);
                          //getAdminTimeSheet(filterValues, page, size)
                        }}
                        showSizeChanger={true}
                        pageSizeOptions={['20', '30', '40', '50']}
                        itemRender={itemRender}
                        disabled={isLoading}
                      />
                    </div>
                  } */}
            </div>
          </div>
      
        </div>

      </div>
      <Offcanvas />
    </>
  );
};

export default AdminTimeSheet;
