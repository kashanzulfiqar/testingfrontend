import React, { useEffect, useRef, useState } from "react";
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
  Pagination,
} from "antd";
import moment from "moment";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import Modal from "@mui/material/Modal";
import { EditOutlined } from "@mui/icons-material";
import { LoadingOutlined } from "@ant-design/icons";
import { itemRender } from "../../paginationfunction";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from 'react-csv';

const { Option } = Select;

const AttendanceReport = () => {
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const user_name = useSelector((state) => state?.user?.loginvalue?.user?.fullName);
  console.log("permissions", permissions)
  const navigate = useNavigate();
  const csvLinkEl = useRef();

  const [form] = Form.useForm();
  const [menu, setMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatLoading, setIsStatLoading] = useState(false);
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [statdata, setStatdata] = useState(null);
  const [specific, setSpecific] = useState(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

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

  const [loader, setLoader] = useState(false);
  const [csvData, setCSVData] = useState([]);
  const [csvLoader, setCsvLoader] = useState(false);
  const [pdfLoader, setPdfLoader] = useState(false);
  const [printLoader, setPrintLoader] = useState(false);

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
    dateFrom: "",
    dateTo: "",
  });
  const [selectedFilters, setSelectedFilters] = useState({
    name: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    setIsStatLoading(true);
  }, []);
  
  useEffect(() => {
    if(csvData?.length > 0){
      csvLinkEl.current.link.click();
    }
  }, [csvData]);

  useEffect(() => {
    if (role === "admin" || permissions?.reportManagement) {
      setIsLoading(true);
      fetchAttendanceData();
    } else {
      navigate("/restricted", { state: { unAuthorize: true } });
    }
  }, [filters, pagination.current, pagination.pageSize]);

  const fetchAttendanceData = async () => {
    const params = {
      ...filters,
      page: pagination.current,
      limit: pagination.pageSize,
    };
    apiServices(
      "GET",
      `report/attendance?employeeName=${filters.name}&dateFrom=${filters?.dateFrom}&dateTo=${filters?.dateTo}&page=${params.page}&limit=${params.limit}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          const attendanceData = res?.data?.Attendance;
          const statData = res?.data;
          setAttendanceRecords(attendanceData);
          setPagination({
            ...pagination,
            total: res?.data?.totalDocs,
          });
          setStatdata(statData);
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
              : "Error Fetching Attendance Reports"
          }`
        );
      })
      .finally(() => {
        setIsLoading(false);
        setIsStatLoading(false);
      });
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

  const handleFilterChange = (value, filterType) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value,
    });
  };


  const handleSearch = () => {
    const { name, dateFrom, dateTo } = selectedFilters;

    if ((!dateFrom && dateTo) || (dateFrom && !dateTo)) {
      message.error("Both start and end dates are required");
    } else if (!name && !dateFrom && !dateTo) {
      message.error("No filters selected");
    } else {
      setFilters(selectedFilters);
      setPagination({
        ...pagination,
        current: 1,
      });
    }
  };

  const handleReset = () => {
    setSelectedFilters({
      name: "",
      dateFrom: "",
      dateTo: "",
    });

    //setSelectedMonthYear("");

    setFilters({
      name: "",
      dateFrom: "",
      dateTo: "",
    });

    form.resetFields();
    setPagination({
      current: 1,
      pageSize: 20,
      total: 0,
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

  const columns = [
    {
      title: "Employee",
      dataIndex: "employeeName",
      key: "employeeName",
      render: (text, record) => (
        <div
          className="table-avatar"
          style={{
            display: "flex",
            alignItems: "center",
            minWidth: "120px",
            width: "max-content",
          }}
        >
          <label className="avatar">
            <img alt="" src={record?.imageUrl || user_icon} />
          </label>
          <label>{text}</label>
        </div>
        // <h2 className="table-avatar">
        //   <label className="avatar"><img alt="" src={record?.user?.imageUrl || user_icon} /></label>
        //   <label>{record?.user?.fullName}</label>
        //   {/* <label>{text} <span>{record?.user?.role}</span></label> */}
        // </h2>
        // </div>
      ),
    },
    {
      title: "Total Presents",
      dataIndex: "totalPresents",
      key: "totalPresents",
    },
    {
      title: "Total Absents",
      dataIndex: "totalAbsents",
      key: "totalAbsents",
    },
    {
      title: "Total Leaves",
      dataIndex: "totalLeaves",
      key: "totalLeaves",
    },
    {
      title: "Late Arrivals",
      dataIndex: "totalLates",
      key: "totalLates",
    },
    {
      title: "Total WFH",
      dataIndex: "totalWFH",
      key: "totalWFH",
    },
    
  ];

  const downloadPDF = (data, type) => {
    let name = filters.name || '';
    let dateFrom = filters.dateFrom
    let dateTo = filters.dateTo
    type === 'csv' ? setCsvLoader(true) : type === 'pdf' ? setPdfLoader(true) : setPrintLoader(true)

    apiServices(
      "GET",
      `report/attendance?employeeName=${name}&dateFrom=${dateFrom}&dateTo=${dateTo}&page=${1}&limit=${99999}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          // console.log(res?.data?.Attendance);
          downloadPDF_File(res?.data?.Attendance, dateFrom, dateTo, type)
          type === 'csv' ? setCsvLoader(false) : type === 'pdf' ? setPdfLoader(false) : setPrintLoader(false)
        }
      })
      .catch((err) => {
        type === 'csv' ? setCsvLoader(false) : type === 'pdf' ? setPdfLoader(false) : setPrintLoader(false)
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error Downloading Attendance Reports"
          }`
        );
      })
  }

  const csvHeaders = [
    { label: "Sr#", key: "srNum", },
    { label: "Employee Name", key: "employeeName"},
    { label: "Total Presents", key: "totalPresents"},
    { label: "Total Absents", key: "totalAbsents"},
    { label: "Total Leaves", key: "totalLeaves"},
    { label: "Late Arrivals", key: "totalLates"},
    { label: "Total WFH", key: "totalWFH"}
  ];

  const downloadPDF_File = (data, dateFrom, dateTo, type) => {

    const columnsForPDF = [
      { title: "Sr.", dataIndex: "number", },
      { title: "Employee Name", dataIndex: "employeeName"},
      { title: "Total Presents", dataIndex: "totalPresents"},
      { title: "Total Absents", dataIndex: "totalAbsents"},
      { title: "Total Leaves", dataIndex: "totalLeaves"},
      { title: "Late Arrivals", dataIndex: "totalLates"},
      { title: "Total WFH", dataIndex: "totalWFH"},
    ];


    const doc = new jsPDF();

    const headerStyles = {
      // fillColor: '#F6F6F6',
      fillColor: 'white',
      textColor: 'black',
      fontStyle: 'bold',
      fontSize: 10,
      fontFamily: 'Calibri',
    };

    const dataForPDF = data.map((record, index) => [
      `${index+1}.`,
      record?.employeeName,
      record?.totalPresents,
      record?.totalAbsents,
      record?.totalLeaves,
      record?.totalLates,
      record?.totalWFH,
    ]);


    doc.setFontSize(17);
    doc.setTextColor(0, 0, 0);
    const pageWidth = doc.internal.pageSize.getWidth();
    // const textWidth = doc.getStringUnitWidth(`Attendance Report of ${month} ${year}`) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const textWidth = doc.getStringUnitWidth(`Attendance Report`) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const startX = (pageWidth - textWidth) / 2;
    // doc.text(`Attendance Report of ${month} ${year}`, startX, 25);

    (filters?.name || (filters?.dateFrom && filters.dateTo)) ? doc.text(`Attendance Report`, startX, 20) : doc.text(`Attendance Report`, startX, 25);

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    filters?.name && doc.text('Employee Name: ', 10, 28);
    const widthofEmployeeName = doc.getTextWidth('Employee Name: ');
    doc.setFont(undefined, 'normal');
    filters?.name && doc.text(`${filters?.name}`, 10 + widthofEmployeeName, 28);

    doc.setFont(undefined, 'bold')
    filters?.dateFrom && doc.text('From: ', 10, 35);
    const widthofFrom = doc.getTextWidth('From: ');
    doc.setFont(undefined, 'normal');
    filters?.dateFrom && doc.text(`${filters?.dateFrom}`, 10 + widthofFrom, 35);
    
    doc.setFont(undefined, 'bold')
    filters?.dateTo && doc.text('To: ', 10, 42);
    const widthofTo = doc.getTextWidth('To: ');
    doc.setFont(undefined, 'normal');
    filters?.dateTo && doc.text(`${filters?.dateTo}`, 10 + widthofTo, 42);


    doc.autoTable({
      startY: 47,
      // margin: { top: 20 },
      margin: { left: 10, right: 10 },
      headStyles: headerStyles,
      head: [columnsForPDF.map(rec => rec?.title)],
      body: dataForPDF,
      styles: {
        lineColor: [0, 0, 0], // color
        lineWidth: 0.01,      // width
        fontFamily: 'Calibri',
        textColor: [0, 0, 0],
      },
      alternateRowStyles: { fillColor: [255, 255, 255] },
    });

    // Set the font size for the footer
    doc.setFontSize(10);
    var totalPages = doc.internal.getNumberOfPages();
    for (var i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.text(`Print By: ${user_name}`, 10, doc.internal.pageSize.height - 7);
    }
    
    if(type === 'pdf'){
      doc.save('attendance_report.pdf');
      message.success("Report Exported in PDF Successfully!");
      // ---- view pdf ----
      // const pdfBlob = doc.output('blob');
      // const blobUrl = URL.createObjectURL(pdfBlob);
      // const newWindow = window.open();
      // newWindow.location.href = blobUrl;
     }
    else if(type === 'print'){
      const pdfBlob = doc.output('blob');
      const printWindow = window.open(URL.createObjectURL(pdfBlob), '_blank');
      printWindow.onload = () => {
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };
    }else if(type === 'csv'){
      const dataForCSV = data.map((record, index) => ({
        ...record,
        srNum: `${index+1}.`,
      }));
      setCSVData(dataForCSV);
      message.success("Report Exported in CSV Successfully!");
    }

  };

  const antIconDownload = (
    <LoadingOutlined
      style={{
        fontSize: 17,
        color: "#1f1f20",
        marginTop: '3px'
      }}
      spin
    />
  );


  return (
    <>
      <div className={`main-wrapper ${menu ? "slide-nav" : ""}`}>
        {/* <Header onMenuClick={(value) => toggleMobileMenu()} /> */}
        {/* <Sidebar /> */}
        <div className="page-wrapper">
          <Helmet>
            <title>Attednance Reports - DaftarPro</title>
            <meta name="description" content="Login page" />
          </Helmet>
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">Reports</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link
                        to={
                          role === "admin"
                            ? "/main/dashboard"
                            : "/employee/dashboard"
                        }
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li className="breadcrumb-item active">Attendance Report</li>
                  </ul>
                </div>
                <div className="col-auto float-end ms-auto">
                  {/* {
                    attendancerecords?.length > 0 ?
                    <a href="javascript:void(0)" className="btn add-btn" onClick={() => downloadPDF(attendancerecords)}><i className="fa fa-download" />Download</a>
                    :
                    <button href="javascript:void(0)" className="btn add-btn" disabled={true} style={{background: '#ff9b44', pointerEvents: 'auto', color: 'white', cursor: 'not-allowed'}}><i className="fa fa-download" />Download</button>
                  } */}
                  {
                    attendancerecords?.length > 0 ?
                    <div className="btn-group btn-group-sm">
                      <CSVLink
                        headers={csvHeaders}
                        filename="attendance_report.csv"
                        data={csvData}
                        ref={csvLinkEl}
                      />
                      <button
                        className="btn btn-white"
                        onClick={() => {
                          downloadPDF(attendancerecords, 'csv');
                        }}
                        style={{width: '46px', borderColor: '#cccccc', backgroundColor: '#fff'}}
                        disabled={csvLoader}
                      >
                        {
                          csvLoader ? <Spin size="small" indicator={antIconDownload} /> : 'CSV'
                        }
                      </button>
                      <button
                        className="btn btn-white"
                        onClick={() => {
                          downloadPDF(attendancerecords, 'pdf');
                        }}
                        style={{width: '46px', borderColor: '#cccccc', backgroundColor: '#fff'}}
                        disabled={pdfLoader}
                      >
                        {/* <i className="fa fa-download fa-lg m-r-5" /> */}
                        {
                          pdfLoader ? <Spin size="small" indicator={antIconDownload} /> : 'PDF'
                        }
                        {/* <Spin size="small" indicator={antIconDownload} /> */}
                      </button>
                      <button
                        className="btn btn-white"
                        onClick={() => {
                          downloadPDF(attendancerecords, 'print');
                        }}
                        style={{borderColor: '#cccccc', backgroundColor: '#fff'}}
                        disabled={printLoader}
                      >
                        {
                          printLoader ? <Spin size="small" style={{width: '50px'}} indicator={antIconDownload} />
                          : <><i className="fa fa-print fa-lg" /> Print</>
                        }
                      </button>
                    </div> :
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-white" style={{backgroundColor: 'transparent', color: '#bdbdbd', cursor: 'no-drop', width: '46px'}}>CSV</button>
                      <button
                        className="btn btn-white"
                        style={{backgroundColor: 'transparent', color: '#bdbdbd', cursor: 'no-drop', width: '46px'}}
                      >
                        {/* <i className="fa fa-download fa-lg m-r-5" /> */}
                        PDF
                      </button>
                      <button className="btn btn-white" style={{backgroundColor: 'transparent', color: '#bdbdbd', cursor: 'no-drop'}}><i className="fa fa-print fa-lg" /> Print</button>
                    </div>
                  }
                </div>
              </div>
            </div>
            {/* STATS */}
            {isStatLoading ? 
            <div className="row" style={{minHeight: '83px', display: 'grid', placeItems: 'center', background: '#ebebeb', borderRadius: '5px', marginBottom: '20px', marginInline: '0px'}}>
              <Spin />
            </div> :
            <div className="row">
              <div className="col-md-4">
                <div className="stats-info">
                  <label>Total working days</label>
                  <h4>{statdata?.totalWorkingDays}
                  </h4>
                </div>
              </div>
              <div className="col-md-4">
                <div className="stats-info">
                  <label>Total Non-working days</label>
                  <h4>{statdata?.totalHolidays}
                  </h4>
                </div>
              </div>
              <div className="col-md-4">
                <div className="stats-info">
                  <label>Total no. of Employees</label>
                  <h4>{statdata?.totalEmployees}
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
                        placeholder="Employee Name"
                        onChange={(e) =>
                          handleFilterChange(e.target.value, "name")
                        }
                      />
                    </Form.Item>
                  </div>
                </div>

                <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <Form.Item name="dateFrom" className="custom-border">
                      <DatePicker
                        className="form-control"
                        style={{
                          width: "100%",
                        }}
                        placeholder="Select a start date"
                        size="large"
                        //allowClear={false}
                        onChange={(date, dateString) => {
                          handleFilterChange(dateString, "dateFrom");
                          //setSelectedMonthYear(dateString);
                        }}
                      />
                    </Form.Item>
                  </div>
                </div>

                <div className="col-sm-6 col-md-3">
                  <div className="">
                    <Form.Item name="dateTo" className="custom-border">
                      <DatePicker
                        className="form-control"
                        style={{
                          width: "100%",
                        }}
                        placeholder="Select an end date"
                        size="large"
                        //allowClear={false}
                        onChange={(date, dateString) => {
                          handleFilterChange(dateString, "dateTo");
                          //setSelectedMonthYear(dateString);
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
                    style={{ borderRadius: "4px", display: "flex", justifyContent: "center", alignItems: "center" }}
                  >
                    SEARCH
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
                      borderRadius: "4px",
                      display: "flex", 
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    RESET
                  </Button>
                </div>
              </div>
            </Form>

            {/* /Search Filter */}
            <div className="row">
              <div className="col-lg-12">
                <div
                  className="table-responsive TimesheetTable"
                >
                  <Table
                    className="table-striped"
                    // locale={{ emptyText: customEmptyText }}
                    locale={{
                      emptyText: isLoading ? null : customEmptyText
                    }}
                    style={{ height: "400px", background: "white" }}
                    loading={isLoading}
                    columns={columns}
                    dataSource={attendancerecords}
                    bordered
                    pagination={false}
                  />
                </div>

                {
                    attendancerecords?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showTotal={(total, range) =>
                          `Showing ${range[0]} to ${range[1]} of ${total} entries`
                        }
                        pageSizeOptions={["20", "30", "40", "50"]}
                        showSizeChanger={true}
                        onChange={(page, pageSize) => setPagination({...pagination, current: page, pageSize: pageSize,})}
                        itemRender={itemRender}
                        disabled={isLoading}
                      />
                    </div>
                  }
              </div>
            </div>
          </div>
        </div>
      </div>
      <Offcanvas />
    </>
  );
};

export default AttendanceReport;
