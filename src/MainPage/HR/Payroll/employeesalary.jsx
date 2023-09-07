import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import {
  Avatar_02,
  Avatar_05,
  Avatar_09,
  Avatar_10,
  Avatar_11,
  Avatar_12,
  Avatar_13,
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
} from "antd";
import "antd/dist/antd.css";
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "../../antdstyle.css";
import Offcanvas from "../../../Entryfile/offcanvance";
import moment from "moment";
import {
  CloudDownloadOutlined,
  DownloadOutlined,
  MinusCircleFilled,
} from "@ant-design/icons";
import { Modal } from "@mui/material";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import jsPDF from "jspdf";
import "jspdf-autotable";
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import DownloadForOfflineRoundedIcon from '@mui/icons-material/DownloadForOfflineRounded';

const EmployeeSalary = () => {
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const role = user_state?.user?.role
  console.log(permissions,user_state)
  const nav = useNavigate();

  const [form] = Form.useForm();
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [genModal, setGenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messageflag, setMessageflag] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [processedPayrolls, setProcessedPayrolls] = useState([]);
  const [downloadModal, setDownloadModal] = useState(false);
  const [downloadTable, setDownloadTable] = useState(false);
  const [downloadData, setDownloadData] = useState([]);
  const [data, setData] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [pagination2, setPagination2] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const OpenEditModal = (record) => {
    setSelectedRecord(record);
    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false);
    setSelectedRecord(null);
  };


  const handleOpenModal = () => {
    setGenModal(true);
  };

  const [filters, setFilters] = useState({
    name: "",
    month: "",
    year: "",
  });

  const [selectedFilters, setSelectedFilters] = useState({
    name: "",
    month: "",
    year: "",
  });

  const handleFilterChange = (value, filterType) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value,
    });
  };

  const handleSearch = () => {
    const { name, month, year } = selectedFilters;

    if (name || (month && year)) {
      setFilters(selectedFilters);
    } else {
      message.warning("Both Month and Year required");
    }
  };

  const handleReset = () => {
    setSelectedFilters({
      name: "",
      month: "",
      year: "",
    });

    setSelectedMonthYear("");

    setFilters({
      name: "",
      month: "",
      year: "",
    });

    form.resetFields();
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setGenModal(false);
    PayFilterReset();
  };

  const handleGeneratePayroll = () => {
    const { month, year } = selectedPayFilters;
    if (month && year) {
      //setFilters(selectedFilters)

      setIsLoading(true);

      let data = {
        payrollMonth: "payrollMonth",
        payrollYear: "payrollYear",
      };

      apiServices(
        "POST",
        `payrolls/generate-payrolls?payrollMonth=${selectedPayFilters.month}&payrollYear=${selectedPayFilters.year}`,
        data,
        user_state
      )
        .then((res) => {
          if (res.data.success === true) {
            //const payrolls=res?.data?.payrolls;
            //console.log(payrolls)
            //setData((prevData) => [...prevData, ...payrolls]);
            //setFilters(selectedPayFilters);
            //GetGenPayrolls();
            message.success(
              `Successfully Generated Payrolls of ${selectedPayFilters.month} ${selectedPayFilters.year}`
            );
            GetGenPayrolls();
            handleCloseModal();
          }
        })
        .catch((err) => {
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Generate Payroll Error"
            }`
          );
          setIsLoading(false);
          PayFilterReset();
        });
    } else {
      message.warning("Both Month and Year required");
    }
  };

  // useEffect(() => {
  //   if (selectedRows.length > 0) {
  //     handleProcessPayroll();
  //   }
  //   console.log("Processed Payrolls:", processedPayrolls);
  // }, [processedPayrolls]);

  let processingMultipleRecords = false;

  const updateProcessedStatus = (record) => {
    const updateData = {
      _id: record._id,
      companyId: record.companyId,
      userId: record.userId,
      deduction: record.deduction,
      deductionReason: record.deductionReason,
      tax: record.tax,
      totalDeduction: record.totalDeduction,
      bonus: record.bonus,
      bonusReason: record.bonusReason,
      totalAddition: record.totalAddition,
      creditSalary: record.creditSalary,
      modeOfPayment: record.modeOfPayment,
      transactionId: record.transactionId,
      extraPayment: record.extraPayment,
      extraPaymentReason: record.extraPaymentReason,
      absentFine: record.absentFine,
      payMonth: record.payMonth,
      payYear: record.payYear,
      processed: true,
      status: record.status,
      deleted: record.deleted,
    };

    console.log(updateData);
    // Send a PUT request for each payroll ID

    apiServices("PUT", `payrolls/process-payroll`, updateData, user_state)
      .then((res) => {
        if (res.data.success === true) {
          if (!processingMultipleRecords) {
            message.success(`Payroll processed successfully`);
            handleReset();
          }
        }
        // Handle success or error if needed
        console.log(`Payroll ID ${record} processed successfully`);
      })
      .catch((error) => {
        console.error(`Error processing Payroll ID ${record}:`, error);
      });
  };

  const handleProcessPayroll = (record) => {
    if (record) {
      // Process a specific row by its ID
      const updatedData = data.filter((row) => row._id !== record._id);
      setData(updatedData);
      setProcessedPayrolls([...processedPayrolls, record._id]);
      updateProcessedStatus(record);
      if (updatedData.length === 0) {
        // Reset the current page to the first page
        setPagination({
          ...pagination,
          total: pagination.total - 1,
          current: pagination.current - 1,
        });
      }
    } else if (selectedRows.length > 0) {
      // Process selected rows
      const updatedData = data.filter(
        (row) =>
          !selectedRows.some((selectedRow) => selectedRow._id === row._id)
      );
      setData(updatedData);
      const selectedRecords = [...selectedRows];
      const selectedIds = selectedRows.map((row) => row._id);

      processingMultipleRecords = true;
      Promise.all(
        selectedRecords.map((record) => updateProcessedStatus(record))
      )
        .then(() => {
          message.success(`Selected Payrolls Processed successfully`);
          handleReset();
        })
        .catch((error) => {
          console.error(`Error processing selected payrolls:`, error);
        });
      if (updatedData.length === 0) {
        // Reset the current page to the first page
        setPagination({
          ...pagination,
          total: pagination.total - selectedRows.length,
          current: pagination.current - 1,
        });
        handleReset();
      }
      handleReset();
      setProcessedPayrolls([...processedPayrolls, ...selectedIds]);
      // Update processed status for all selected rows (you can loop through selectedRows)
    } else {
      processingMultipleRecords = false; // Reset the flag to false
    }
    setSelectedRows([]);
  };

  const closeDmodal = () => {
    setDownloadModal(false);
    setDownloadData([]);
    PayFilterReset();
  };

  useEffect(() => {
    if ($(".select").length > 0) {
      $(".select").select2({
        minimumResultsForSearch: -1,
        width: "100%",
      });
    }
  });

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
      title: (
        <Checkbox
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows(data);
            } else {
              setSelectedRows([]);
            }
          }}
          checked={selectedRows.length === data.length && data.length > 0}
        />
      ),
      dataIndex: "checkbox",
      render: (_, record) => (
        <Checkbox
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRows([...selectedRows, record]);
            } else {
              setSelectedRows(
                selectedRows.filter((row) => row._id !== record._id)
              );
            }
          }}
          checked={selectedRows.some((row) => row._id === record._id)}
        />
      ),
    },
    {
      title: "Employee Name",
      dataIndex: "user.fulName",
      fixed: "left",
      render: (text, record) => (
        <h2 className="table-avatar">
          <label className="avatar"><img alt="" src={record?.user?.imageUrl || user_icon} /></label>
          <label>{record?.user?.fulName}</label>
          {/* <label>{text} <span>{record?.user?.role}</span></label> */}
        </h2>
      ),
    },
    {
      title: "Employee ID",
      dataIndex: "user.employeeId",
      render: (text, record) => <>{record?.user?.employeeId}</>,
    },
    {
      title: "Pay Month",
      dataIndex: "payMonth",
    },
    {
      title: "Pay Year",
      dataIndex: "payYear",
    },
    {
      title: "Salary",
      dataIndex: "salary",
      render: (text, record) => (
        <span>
          {record?.user?.salary ? `${record?.user?.salary} PKR` : "-"}
        </span>
      ),
    },
    {
      title: "Tax",
      dataIndex: "tax",
    },
    {
      title: "Deduction",
      dataIndex: "deduction",
    },
    {
      title: "Deduction Reason",
      dataIndex: "deductionReason",
      render: (text, record) => (
        <label className="longText">
          {record?.deductionReason ? record?.deductionReason : "-"}
        </label>
      ),
    },
    {
      title: "Total Deduction",
      dataIndex: "totalDeduction",
    },
    {
      title: "Bonus",
      dataIndex: "bonus",
    },
    {
      title: "Bonus Reason",
      dataIndex: "bonusReason",
      render: (text, record) => (
        <label className="longText">
          {record?.bonusReason ? record?.bonusReason : "-"}
        </label>
      ),
    },
    {
      title: "Total Addition",
      dataIndex: "totalAddition",
    },
    {
      title: "Credit Salary",
      dataIndex: "creditSalary",
      render: (text, record) => (
        <span>
          {record?.creditSalary ? `${record?.creditSalary} PKR` : "-"}
        </span>
      ),
    },
    {
      title: "Extra Payment",
      dataIndex: "extraPayment",
    },
    {
      title: "Extra Payment Reason",
      dataIndex: "extraPaymentReason",
      render: (text, record) => (
        <label className="longText">
          {record?.extraPaymentReason ? record?.extraPaymentReason : "-"}
        </label>
      ),
    },
    {
      title: "Absent Fine",
      dataIndex: "absentFine",
    },
    {
      title: "Mode of Payment",
      dataIndex: "modeOfPayment",
      render: (text, record) => (
        <label>{record?.modeOfPayment ? record?.modeOfPayment : "-"}</label>
      ),
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      render: (text, record) => (
        <label>{record?.transactionId ? record?.transactionId : "-"}</label>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (text) => moment(text).format("D MMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Payslip",
      render: (text, record) => (
        <button
          className="btn btn-sm btn-primary"
          onClick={() => handleProcessPayroll(record)}
        >
          Process Payroll
        </button>
      ),
    },
    {
      title: "Action",
      render: (text, record) => (
            <a
              className="dropdown-item"
              href="javascript:void(0)"
              onClick={() => {
                OpenEditModal(record);
              }}
            >
              <i className="fa fa-pencil m-r-5" /> Edit
            </a>
      ),
    },
  ];

  const columns2 = [
    {
      title: "Employee Name",
      dataIndex: "user.fulName",
      fixed: "left",
      render: (text, record) => (
        <h2 className="table-avatar">
          <label className="avatar"><img alt="" src={record?.user?.imageUrl || user_icon} /></label>
          <label>{record?.user?.fulName}</label>
          {/* <label>{text} <span>{record?.user?.role}</span></label> */}
        </h2>
      ),
    },
    {
      title: "Employee ID",
      dataIndex: "user.employeeId",
      render: (text, record) => <>{record?.user?.employeeId}</>,
    },
    {
      title: "Pay Month",
      dataIndex: "payMonth",
    },
    {
      title: "Pay Year",
      dataIndex: "payYear",
    },
    {
      title: "Salary",
      dataIndex: "salary",
      render: (text, record) => (
        <span>
          {record?.user?.salary ? `${record?.user?.salary} PKR` : "-"}
        </span>
      ),
    },
    {
      title: "Tax",
      dataIndex: "tax",
    },
    {
      title: "Deduction",
      dataIndex: "deduction",
    },
    {
      title: "Deduction Reason",
      dataIndex: "deductionReason",
      render: (text, record) => (
        <label className="longText">
          {record?.deductionReason ? record?.deductionReason : "-"}
        </label>
      ),
    },
    {
      title: "Total Deduction",
      dataIndex: "totalDeduction",
    },
    {
      title: "Bonus",
      dataIndex: "bonus",
    },
    {
      title: "Bonus Reason",
      dataIndex: "bonusReason",
      render: (text, record) => (
        <label className="longText">
          {record?.bonusReason ? record?.bonusReason : "-"}
        </label>
      ),
    },
    {
      title: "Total Addition",
      dataIndex: "totalAddition",
    },
    {
      title: "Credit Salary",
      dataIndex: "creditSalary",
      render: (text, record) => (
        <span>
          {record?.creditSalary ? `${record?.creditSalary} PKR` : "-"}
        </span>
      ),
    },
    {
      title: "Extra Payment",
      dataIndex: "extraPayment",
    },
    {
      title: "Extra Payment Reason",
      dataIndex: "extraPaymentReason",
      render: (text, record) => (
        <label className="longText">
          {record?.extraPaymentReason ? record?.extraPaymentReason : "-"}
        </label>
      ),
    },
    {
      title: "Absent Fine",
      dataIndex: "absentFine",
    },
    {
      title: "Mode of Payment",
      dataIndex: "modeOfPayment",
      render: (text, record) => (
        <label>{record?.modeOfPayment ? record?.modeOfPayment : "-"}</label>
      ),
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      render: (text, record) => (
        <label>{record?.transactionId ? record?.transactionId : "-"}</label>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      render: (text) => moment(text).format("D MMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Action",
      render: (text, record) => (
        <span
          style={{ color: "red", cursor: "pointer" }}
          onClick={() => {
            const updatedData = downloadData.filter(
              (item) => item._id !== record._id
            );
            setDownloadData(updatedData);
          }}
        >
          <MinusCircleFilled />
        </span>
      ),
    },
  ];

  const handleDownloadTable = () => {
    setIsLoading(true);
    const { month, year } = selectedPayFilters;
    if (month && year) {
      apiServices(
        "GET",
        `payrolls/view-payrolls?payMonth=${month}&payYear=${year}&processed=false&page=1&limit=99999`,
        null,
        user_state
      )
        .then((res) => {
          if (res.data.success === true) {
            const newPayrolls = res?.data?.payrolls || [];
            setDownloadData((prevData) => [...prevData, ...newPayrolls]);
            //handleReset();
          }
        })
        .catch((error) => {
          console.log("error", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
      closeDmodal();
      setDownloadTable(true);
    } else {
      message.warning("Both Month and Year required");
      setIsLoading(false);
    }
  };

  const closeTable = () => {
    setDownloadTable(false);
    setPagination2({
      current: 1,
      pageSize: 10,
      total: 0,
    });
    PayFilterReset();
  };

  const GetGenPayrolls = () => {
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
    };

    apiServices(
      "GET",
      `payrolls/view-payrolls??payrollMonth=${selectedPayFilters.month}&payrollYear=${selectedPayFilters.year}&employeeName=${filters.name}&processed=false&page=${params.page}&limit=${params.limit}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          const newPayrolls = res?.data?.payrolls || [];
          // Check for duplicate _id and add only unique records
          const uniquePayrolls = newPayrolls.filter(
            (newPayroll) =>
              !data.some(
                (existingPayroll) => existingPayroll._id === newPayroll._id
              )
          );
          // Update the data state with unique payroll records
          setData((prevData) => [...prevData, ...uniquePayrolls]);
          //handleReset();
          setPagination({
            ...pagination,
            total: res?.data?.totalCount,
          });
          PayFilterReset();
        }
      })
      .catch((error) => {
        console.log("error", error);
      });

    setIsLoading(false);
    //PayFilterReset();
  };

  useEffect(() => {
    if(user_state?.role === 'admin' || permissions?.managePayrolls) {

    setIsLoading(true);
    firstAPI();

    }else{
      nav('/restricted', { state: { unAuthorize: true}})
    }
  }, [filters, pagination.current, pagination.pageSize]);

  const firstAPI = () => {
    const params = {
      ...filters,
      page: pagination.current,
      limit: pagination.pageSize,
    };

    apiServices(
      "GET",
      `payrolls/view-payrolls?payMonth=${filters.month}&payYear=${filters.year}&employeeName=${filters.name}&processed=false&page=${params.page}&limit=${params.limit}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          const newPayrolls = res?.data?.payrolls || [];
          const uniquePayrolls = newPayrolls.filter(
            (newPayroll) =>
              !data.some(
                (existingPayroll) => existingPayroll._id === newPayroll._id
              )
          );
          //setData((prevData) => [...prevData, ...uniquePayrolls])
          setData(newPayrolls);
          setPagination({
            ...pagination,
            total: res?.data?.totalCount,
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

  const [Payrollfilters, setPayrollFilters] = useState({
    month: "",
    year: "",
  });

  const [selectedPayFilters, setSelectedPayFilters] = useState({
    month: "",
    year: "",
  });

  const handlePayFilterChange = (value, filterType) => {
    setSelectedPayFilters({
      ...selectedPayFilters,
      [filterType]: value,
    });
  };

  const PayFilterReset = () => {
    setSelectedPayFilters({
      month: "",
      year: "",
    });

    setPayrollFilters({
      month: "",
      year: "",
    });

    form.resetFields();
  };

  const downloadPDF = (row_data) => {
    const d1 = Array.isArray(row_data) ? row_data : [row_data];

    const columnsForPDF = [
      { title: "Employee ID", dataIndex: "employeeId" },

      { title: "Employee Name", dataIndex: "name" },

      { title: "Account No", dataIndex: "bankAccountNumber" },

      { title: "Credit Salary", dataIndex: "creditSalary" },
    ];

    const doc = new jsPDF();

    const headerStyles = {
      // fillColor: '#F6F6F6',

      fillColor: "white",

      textColor: "black",

      fontStyle: "bold",

      fontSize: 10,
    };

    const dataForPDF = d1.map((record, index) => [
      record?.user?.employeeId,

      record?.user?.fulName,

      record?.user?.bankAccountNumber,

      record?.creditSalary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
    ]);

    doc.autoTable({
      headStyles: headerStyles,

      head: [columnsForPDF.map((rec) => rec?.title)],

      body: dataForPDF,

      // styles: {

      //   lineColor: [0, 0, 0], // Border color

      //   lineWidth: 0.1,      // Border width

      // },
    });

    doc.save("payroll_export.pdf");
  };

  const updatePayroll = (values) => {

    const updateData = {
      _id: selectedRecord?._id,
      companyId: selectedRecord?.companyId,
      deduction: values.deduction, // Use values from the form
      deductionReason: values.deductionReason, // Use values from the form
      totalDeduction: values.totalDeduction, // Use values from the form
      bonus: values.bonus, // Use values from the form
      bonusReason: values.bonusReason, // Use values from the form
      totalAddition: values.totalAddition, // Use values from the form
      creditSalary: values.creditSalary, // Use values from the form
      modeOfPayment: values.modeOfPayment, // Use values from the form
      transactionId: values.transactionId, // Use values from the form
      extraPayment: values.extraPayment, // Use values from the form
      extraPaymentReason: values.extraPaymentReason,
      processed : false // Use values from the form
    };
    // const updateData = {
    //   _id: selectedRecord?._id,
    //   absentFine: selectedRecord?.absentFine,
    //   companyId: selectedRecord?.companyId,
    //   deduction: selectedRecord?.deduction,
    //   deductionReason: selectedRecord?.deductionReason,
    //   totalDeduction: selectedRecord?.totalDeduction,
    //   bonus: selectedRecord?.bonus,
    //   bonusReason: selectedRecord?.bonusReason,
    //   totalAddition: selectedRecord?.totalAddition,
    //   creditSalary: selectedRecord?.creditSalary,
    //   modeOfPayment: selectedRecord?.modeOfPayment,
    //   transactionId: selectedRecord?.transactionId,
    //   extraPayment: selectedRecord?.extraPayment,
    //   extraPaymentReason: selectedRecord?.extraPaymentReason,
    // };

    console.log(updateData);
    // Send a PUT request for each payroll ID

    apiServices("PUT", `payrolls/process-payroll`, updateData, user_state)
      .then((res) => {
        if (res.data.success === true) {
          message.success(`Payroll Details Updated`);
          closeEditModal();
          handleReset();
        }
      })
      .catch((error) => {
        console.error(`Error updating Payroll Details`, error);
      });
  };


  return (
    <>
      <div className="page-wrapper">
        <Helmet>
          <title>Salary - DaftarPro</title>
          <meta name="description" content="Login page" />
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Employee Salary</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/app/main/dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Salary</li>
                </ul>
              </div>
              <div className="col-auto float-end ms-auto d-flex gap-2">
                <Button
                  className="btn add-btn"
                  onClick={() => handleProcessPayroll()}
                  style={{ display: 'flex',justifyContent: 'center', alignItems: 'center', backgroundColor: '#ff9b44', color: '#ffffff' }}
                >
                  <i className="fa fa-plus" />Process Payroll
                </Button>

                <Button className="btn add-btn"
                  style={{ display: 'flex',justifyContent: 'center',alignItems: 'center',}}
                  onClick={handleOpenModal}>
                  <i className="fa fa-plus" /> Generate Payroll
                </Button>
                <Button
                  className="col-auto"
                  type="default"
                  icon={<DownloadOutlinedIcon />}
                  onClick={() => {
                    setDownloadModal(true);
                  }}
                  style={{ backgroundColor: '#ff9b44', color: '#ffffff', borderRadius: "40px" }}
                />
              </div>
            </div>
          </div>

          {/* Search Filter */}
          <Form form={form}>
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
                  <Form.Item name="month">
                    <DatePicker.MonthPicker
                      style={{
                        width: "100%",
                      }}
                      className="form-control"
                      placeholder={"Select Month"}
                      size="large"
                      allowClear={false}
                      format="MMMM"
                      onChange={(date, dateString) => {
                        handleFilterChange(dateString, "month");
                      }}
                    />
                  </Form.Item>
                </div>
              </div>
              <div className="col-sm-6 col-md-3">
                <div className="form-group">
                  <Form.Item name="year">
                    <DatePicker.YearPicker
                      style={{
                        width: "100%",
                      }}
                      className="form-control"
                      placeholder={"Select Year"}
                      size="large"
                      allowClear={false}
                      onChange={(date, dateString) => {
                        handleFilterChange(dateString, "year");
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
                  onClick={handleSearch}
                  className="btn-success btn-block w-100"
                  style={{ borderRadius: "5px" }}
                >
                  Search
                </Button>
                <Button
                  htmlType="submit"
                  onClick={handleReset}
                  className="btn-secondary btn-block w-100"
                  style={{ backgroundColor: "#616161", borderColor: "#616161", borderRadius: "5px" }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </Form>

          {/* Generate Payroll */}
          <Modal
            open={genModal}
            onClose={handleCloseModal}
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
                  <h5 className="modal-title">Generate Payroll</h5>
                  <button
                    type="button"
                    className="close"
                    onClick={handleCloseModal}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <Form
                    form={form}
                    name="control-hooks"
                    //onFinish={(val) => onFinish(val, open?.data)}
                  >
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>
                            Payroll Month <span className="text-danger">*</span>
                          </label>
                          <div className='filterDateMonth' style={{ position: 'relative' }} id='area'>
                          <Form.Item name="Month" className="custom-border">
                            <DatePicker.MonthPicker
                              style={{minHeight: '50px', display: 'flex'}}
                              className='form-control filterDate'
                              placeholder={"Select Month"}
                              size="large"
                              allowClear={false}
                              format="MMMM"
                              onChange={(date, dateString) => {
                                handlePayFilterChange(dateString, "month");
                              }}
                            />
                          </Form.Item>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label>
                            Payroll Year <span className="text-danger">*</span>
                          </label>
                          <div className='filterDateMonth' style={{ position: 'relative' }} id='area'>
                          <Form.Item name="Year" className="custom-border">
                            <DatePicker.YearPicker
                              style={{minHeight: '50px', display: 'flex'}}
                              className='form-control filterDate'
                              placeholder={"Select Year"}
                              size="large"
                              allowClear={false}
                              onChange={(date, dateString) => {
                                handlePayFilterChange(dateString, "year");
                              }}
                            />
                          </Form.Item>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="submit-section">
                      <Form.Item>
                        <Button
                          htmlType="submit"
                          className="btn btn-primary submit-btn"
                          //disabled={loader}
                          onClick={handleGeneratePayroll}
                        >
                          Submit
                        </Button>
                      </Form.Item>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </Modal>

          {/* Download Modal */}
          <Modal
            open={downloadModal}
            onClose={closeDmodal}
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
                  <h5 className="modal-title">Download</h5>
                  <button type="button" className="close" onClick={closeDmodal}>
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <Form
                    form={form}
                    name="control-hooks"
                    //onFinish={(val) => onFinish(val, open?.data)}
                  >
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>
                            Payroll Month <span className="text-danger">*</span>
                          </label>
                          <div className='filterDateMonth' style={{ position: 'relative' }} id='area'>
                          <Form.Item name="Month" className="custom-border">
                            <DatePicker.MonthPicker
                              style={{minHeight: '50px', display: 'flex'}}
                              className='form-control filterDate'
                              placeholder={"Select Month"}
                              size="large"
                              allowClear={false}
                              format="MMMM"
                              onChange={(date, dateString) => {
                                handlePayFilterChange(dateString, "month");
                              }}
                            />
                          </Form.Item>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>
                            Payroll Year <span className="text-danger">*</span>
                          </label>
                          <div className='filterDateMonth' style={{ position: 'relative' }} id='area'>
                          <Form.Item name="Year" className="custom-border">
                            <DatePicker.YearPicker
                              style={{minHeight: '50px', display: 'flex'}}
                              className='form-control filterDate'
                              placeholder={"Select Year"}
                              size="large"
                              allowClear={false}
                              onChange={(date, dateString) => {
                                handlePayFilterChange(dateString, "year");
                              }}
                            />
                          </Form.Item>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="submit-section">
                      <Form.Item>
                        <Button
                          htmlType="submit"
                          className="btn btn-primary submit-btn"
                          onClick={handleDownloadTable}
                          //disabled={loader}
                        >
                          Submit
                        </Button>
                      </Form.Item>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </Modal>

          {/* /Main Table */}
          <div className="row">
            <div className="col-md-12">
              <div className="table-responsive currentPayrollTable">
                <Table
                  locale={{
                    emptyText: isLoading ? (
                      <Spin size="large" tip="Loading..." />
                    ) : (
                      customEmptyText
                    ),
                  }}
                  className="fixedTableHeader2"
                  loading={isLoading}
                  pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showTotal: (total, range) =>
                      `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                    pageSizeOptions: ["10", "20", "30", "40"], // Options to change page size
                    showSizeChanger: true, // Show the page size changer
                    onChange: (page, pageSize) => {
                      setPagination({
                        ...pagination,
                        current: page,
                        pageSize: pageSize,
                      });
                    },
                    itemRender: itemRender,
                  }}
                  style={{ height: "400px", background: "white" }}
                  columns={columns}
                  // bordered
                  dataSource={data}
                  rowKey={(record) => record?._id}
                  // onChange={this.handleTableChange}
                />
              </div>
            </div>
          </div>

          {/* Download Table */}
          <Modal
            open={downloadTable}
            onClose={closeTable}
            aria-labelledby="modal-modal-title"
            // className="modal custom-modal fade"
            aria-describedby="modal-modal-description"
            disableRestoreFocus
            BackdropProps={{
              style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
            }}
          >
            <div
              className="modal-dialog modal-dialog-centered modal-lg"
              role="document"
            >
              <div className="modal-content">
                <div className="modal-header">
                
                  <h5 className="modal-title"
                  style={{marginInline:'auto'}}>
                    PayRolls
                  </h5>
                  <a 
                  href="javascript:void(0)" 
                  className="btn add-btn"
                  onClick={() => {
                    downloadPDF(downloadData);
                    console.log(downloadData);
                  }}>
                  <DownloadOutlinedIcon />
                    Export</a>

                  {/* <Button
                    type="default"
                    className="col-auto btn add-btn"
                    icon={<DownloadOutlinedIcon />}
                    onClick={() => {
                      downloadPDF(downloadData);
                      console.log(downloadData);
                    }}
                    style={{ position: 'absolute', right: '35px' }}
                  >
                    Export
                  </Button> */}
                  
                  <button type="button" className="close" onClick={closeTable}>
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="table-responsive DownPayrollTable">
                        <Table
                          locale={{
                            emptyText: isLoading ? (
                              <Spin size="large" tip="Loading..." />
                            ) : (
                              customEmptyText
                            ),
                          }}
                          className="fixedTableHeader"
                          loading={isLoading}
                          style={{ height: "400px", background: "white" }}
                          columns={columns2}
                          // bordered
                          pagination={false}
                          dataSource={downloadData}
                          rowKey={(record) => record.id}
                          // onChange={this.handleTableChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal>

          {/* EDIT MODAL */}
          <Modal
            open={editModal}
            onClose={closeEditModal}
            aria-labelledby="modal-modal-title"
            className="modalScroll"
            aria-describedby="modal-modal-description"
            disableRestoreFocus
            BackdropProps={{
              style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
            }}
            sx={{ overflowY: "auto" }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Details</h5>

                  <button
                    type="button"
                    className="close"
                    onClick={closeEditModal}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                <div className="modal-body">
                  <Form
                  onFinish={updatePayroll}

                  name="control-hooks"

                  initialValues={{
                    deduction: selectedRecord?.deduction || "0",
                    deductionReason: selectedRecord?.deductionReason || "",
                    tax: selectedRecord?.tax || "0",
                    totalDeduction: selectedRecord?.totalDeduction || "0",
                    bonus: selectedRecord?.bonus || "0",
                    bonusReason: selectedRecord?.bonusReason || "",
                    totalAddition: selectedRecord?.totalAddition || "0.00",
                    creditSalary: selectedRecord?.creditSalary || "0.00",
                    modeOfPayment: selectedRecord?.modeOfPayment || "",
                    transactionId: selectedRecord?.transactionId || "",
                    extraPayment: selectedRecord?.extraPayment || "0",
                    extraPaymentReason: selectedRecord?.extraPaymentReason || "",
                    absentFine: selectedRecord?.absentFine || "0",
                    payMonth: moment(selectedRecord?.payMonth, 'MMMM') || "",
                    payYear: moment(selectedRecord?.payYear, 'YYYY') || "",
                    processed: selectedRecord?.processed || false,
                    status: selectedRecord?.status || "Unpaid",
                    createdAt: moment(selectedRecord?.createdAt).format("D MMM YYYY") || "",
                    updatedAt: moment(selectedRecord?.updatedAt).format("D MMM YYYY") || "",
                    employeeId: selectedRecord?.user?.employeeId || "",
                    fullName: selectedRecord?.user?.fulName || "",
                    salary: selectedRecord?.user?.salary || "0.00",
                    email: selectedRecord?.user?.email || "",

                  }}
                  >
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Employee ID</label>
                          <Form.Item
                            name="employeeId"
                            className="custom-border"
                          >
                            <Input className="form-control" readOnly />
                          </Form.Item>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Employee Name</label>
                          <Form.Item
                            name="fullName"
                            className="custom-border"
                          >
                            <Input className="form-control" readOnly />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Pay Month</label>
                          <Form.Item name="payMonth">
                            <DatePicker.MonthPicker
                              style={{ width: "100%", backgroundColor:'#e9ecef' }}
                              className='form-control datepicker-color'
                              size="large"
                              format="MMMM"
                              disabled
                            />
                          </Form.Item>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Pay Year</label>
                          <Form.Item name="payYear">
                            <DatePicker.YearPicker
                              style={{ width: "100%", backgroundColor:'#e9ecef' }}
                              className='form-control datepicker-color'
                              size="large"
                              disabled
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                    {/* Add more fields in the same row format */}
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Tax</label>
                          <Form.Item name="tax">
                            <Input className="form-control" readOnly/>
                          </Form.Item>
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Salary</label>
                          <Form.Item name="salary">
                            <Input className="form-control" readOnly/>
                          </Form.Item>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                    <div className="col-sm-6">
                        <div className="form-group">
                          <label>Deduction</label>
                          <Form.Item name="deduction">
                            <Input className="form-control" />
                          </Form.Item>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Total Deduction</label>
                          <Form.Item name="totalDeduction">
                            <Input className="form-control" readOnly/>
                          </Form.Item>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group">
                        <label>Deduction Reason</label>
                        <Form.Item name="deductionReason">
                          <Input.TextArea className="form-control" rows={3} />
                        </Form.Item>
                      </div>
                    </div>

                    <div className="row">
                    <div className="col-sm-6">
                        <div className="form-group">
                          <label>Credit Salary</label>
                          <Form.Item name="creditSalary">
                            <Input className="form-control" readOnly/>
                          </Form.Item>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Bonus</label>
                          <Form.Item name="bonus">
                            <Input className="form-control" />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="form-group">
                        <label>Bonus Reason</label>
                        <Form.Item name="bonusReason">
                          <Input.TextArea className="form-control" rows={3} />
                        </Form.Item>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Extra Payment</label>
                          <Form.Item name="extraPayment">
                            <Input className="form-control" />
                          </Form.Item>
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Total Addition</label>
                          <Form.Item name="totalAddition">
                            <Input className="form-control" readOnly/>
                          </Form.Item>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group">
                        <label>Extra Payment Reason</label>
                        <Form.Item name="extraPaymentReason">
                          <Input.TextArea className="form-control" rows={3} />
                        </Form.Item>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Absent Fine</label>
                          <Form.Item name="absentFine">
                            <Input className="form-control" readOnly/>
                          </Form.Item>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Mode of Payment</label>
                          <Form.Item name="modeOfPayment">
                            <Input className="form-control" />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
                    <div className="col-sm-6">
                        <div className="form-group">
                          <label>Transaction ID</label>
                          <Form.Item name="transactionId">
                            <Input className="form-control" />
                          </Form.Item>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>Created At</label>
                          <Form.Item name="createdAt">
                            <Input className="form-control" readOnly/>
                          </Form.Item>
                        </div>
                      </div>
                    </div>

                    <div className="submit-section">
                      <Form.Item>
                        <Button
                          type="primary" 
                          htmlType="submit"
                          className="btn btn-primary submit-btn"
                        >
                          Submit
                        </Button>
                      </Form.Item>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </Modal>

        </div>

      </div>
      <Offcanvas />
    </>
  );
};

export default EmployeeSalary;
