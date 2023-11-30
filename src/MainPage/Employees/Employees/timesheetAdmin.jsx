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

const AdminTimeSheet = () => {
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const role = user_state?.user?.role
  //console.log(permissions,user_state)
  const nav = useNavigate();

  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

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
  });

  const [selectedFilters, setSelectedFilters] = useState({
    id:"",
    name: "",
    month: "",
    year: "",
  });

  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));

  let splitArray = selectedMonth.split("-");
  let variable1 = splitArray[0];
  let variable2 = splitArray[1];
  
  function getMonthStartEndDate(month, year) {
    // Convert the month to a number
    const monthNumber = Number(month);
  
    // Create a Date object by setting the year and month (here, day is set as 1 for the start date)
    const startDate = new Date(year, monthNumber - 1, 1);
  
    // Get the last day of the month
    const endDate = new Date(year, monthNumber, 0);
  
    // Format the dates in 'YYYY-MM-DD' format
    const formattedStartDate = `${startDate.getFullYear()}-${(startDate.getMonth() + 1 + "").padStart(2, "0")}-01`;
    const formattedEndDate = `${endDate.getFullYear()}-${(endDate.getMonth() + 1 + "").padStart(2, "0")}-${endDate.getDate()}`;
  
    return {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    };
  }
  
  const { startDate, endDate } = getMonthStartEndDate(variable2, variable1);
  const { startDate1, endDate1 } = getMonthStartEndDate(variable2, variable1);
  //console.log("Start Date:", startDate);
  //console.log("End Date:", endDate);

  const handleFilterChange = (value, filterType) => {
    // if (filterType === "month") {
    //   setSelectedMonth(value);
    // }
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value,
    });
  };


  const handleSearch = () => {
    const { id, name, month, year } = selectedFilters;

    if (name || month) {
      setSelectedMonth(month);
      setFilters(selectedFilters);
      setPagination({
        ...pagination,
        current: 1,
      });
    }
    else {
      message.warning("No Filters selected");
    }
  };

  const handleReset = () => { 
    const { id, name, month, year } = selectedFilters;

    if (name || month) {
      setSelectedFilters({
        id: "",
        name: "",
        month: "",
        year: "",
      });
  
      setSelectedMonth(moment().format('YYYY-MM'));
  
      setFilters({
        id:"",
        name: "",
        month: "",
        year: "",
      });
  
      form.resetFields();
  
      setPagination({
        current: 1,
        pageSize: 20,
        total: 0,
      })
    }
    else{
      return
    }
    
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
              : "Get Client Error"
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
    setIsLoading(true);
    fetchEmployees();
    firstAPI();

  }, [filters, pagination.current, pagination.pageSize]);

  const firstAPI = () => {
    const params = {
      ...filters,
      page: pagination.current,
      limit: pagination.pageSize,
    };

    apiServices(
      "GET",
      `timesheet/?page=${params.page}&limit=999999&timesheetFrom=${startDate}&timesheetTo=${endDate}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          //const newPayrolls = res?.data?.payrolls || [];
          setData(res?.data?.Timesheet?.docs)
          //console.log(data)
          setPagination({
            ...pagination,
            total: res?.data?.Timesheet?.total,
          });
          
        }
      })
      .catch((error) => {
        console.log("error", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
  


  const categorizedTimesheets = categorizeTimesheetByWeek(data, startDate, endDate);
  //console.log(categorizedTimesheets); // Output the categorized timesheet data by weeks
  
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
        if (!userData[userId]) {
          userData[userId] = [];
        }

        // Find the corresponding user data array and push the entry
        const userWeekData = userData[userId].find(
          (userEntry) =>
            userEntry.startDate === startDate && userEntry.endDate === endDate
        );

        if (userWeekData) {
          userWeekData.data.push(entry);
        } else {
          userData[userId].push({
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
  
  // Usage:
  // Assuming `yourData` contains the object you provided earlier
  const updatedData = calculateTotals(groupedUserData);
  //console.log(updatedData); 

  // for (const userId in updatedData) {
  //   console.log(`User ID: ${userId}, Monthly Total: ${updatedData[userId].monthlyTotal}`);
  // }// Contains the data object with weekTotal and monthlyTotal added
  
  function combineData(userResponse, calculatedData) {
    const newDataStructure = [];
  
    userResponse.forEach(user => {
      const userId = user._id;
      const userData = calculatedData[userId];
  
      if (userData) {
        const { fullName, imageUrl, shiftId } = user;
  
        const newUserObj = {
          ...user,
          ...userData,
          fullName,
          imageUrl,
          shiftId,
        };
  
        newDataStructure.push(newUserObj);
      }
    });
  
    return newDataStructure;
  }
  
  // Assuming 'employees' contains the user response and 'updatedData' contains the calculated data
  const newData = combineData(employees, updatedData);
  //console.log(newData); // Use this new data structure as needed
  
  
  const weekData = calculateWeeksInMonth(startDate, endDate);
  console.log("Result:", weekData);

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
            weekTotal: "00:00"
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
console.log(FinalData)

const generateWeekColumns = (weekData, finalData) => {
  const weekColumns = weekData?.weeksData?.map((week, index) => ({
    title: `Week ${index + 1}`,
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
      title: "Employee",
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
      title: "Total",
      dataIndex: "monthlyTotal",
    },
    {
      title: "Action",
      render: (text, record) => (
        <Button
      type="default"
      onClick={() => {
        // OpenEditModal(record);
        console.log(record);
      }}
      style={{
        color: "orange",
        border: "1px solid orange",
        borderRadius: "245px",
        textDecoration: "none",
        background: "transparent",
        fontSize: "12px",
        padding: "2px 6px", // Adjust the padding here
        lineHeight: 1, // Adjust the font size here
      }}
    >
      View Details
    </Button>
      ),
    }
    
    
  ];
  
  return (
    <>
      <div className="page-wrapper">
        <Helmet>
          <title>Timesheet - DaftarPro</title>
          <meta name="description" content="Login page" />
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Timesheet</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Timesheet Admin</li>
                </ul>
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

      <div className="col-sm-6 col-md-4 col-lg-3 col-xl-3">
          <div className="form-group">
            <Form.Item name="month">
              <DatePicker.MonthPicker
                style={{ width: "100%" }}
                className="form-control"
                placeholder="Select Month"
                size="large"
                allowClear={false}
                format="YYYY-MM"
                onChange={(date, dateString) => {
                  handleFilterChange(dateString, "month");
                }}
              />
            </Form.Item>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-lg-3 col-xl-3">
          <div className="form-group">
            <Form.Item name="name" className="custom-border">
              <Input
                className="form-control"
                allowClear={false}
                placeholder="Employee Name"
                onChange={(e) => handleFilterChange(e.target.value, "name")}
              />
            </Form.Item>
          </div>
        </div>
        
        <div className="col-sm-6 col-md-4 col-lg-3 col-xl-3">
          <div className="form-group">
            <Button
              type="primary"
              htmlType="submit"
              onClick={handleSearch}
              className="btn-success btn-block w-100"
              style={{ borderRadius: "5px" }}
            >
              SEARCH
            </Button>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-lg-3 col-xl-3">
          <div className="form-group">
            <Button
              htmlType="submit"
              onClick={handleReset}
              className="btn-secondary btn-block w-100"
              style={{
                backgroundColor: "#616161",
                borderColor: "#616161",
                borderRadius: "5px",
              }}
            >
              RESET
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
              <div className="table-responsive" style={{background: 'white'}}>
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
