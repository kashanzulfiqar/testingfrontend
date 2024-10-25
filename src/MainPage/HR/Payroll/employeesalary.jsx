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
  Pagination,
} from "antd";
import "antd/dist/antd.css";
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "../../antdstyle.css";
import Offcanvas from "../../../Entryfile/offcanvance";
import moment from "moment";
import {
  CloudDownloadOutlined,
  DownloadOutlined,
  LoadingOutlined,
  MinusCircleFilled,
} from "@ant-design/icons";
import { Modal } from "@mui/material";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import jsPDF from "jspdf";
import "jspdf-autotable";
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import DownloadForOfflineRoundedIcon from '@mui/icons-material/DownloadForOfflineRounded';
import CurrentPayrollPDF from "./CurrentPayrollPDF";
import { useTranslation } from "react-i18next";

const EmployeeSalary = () => {
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const role = user_state?.user?.role
  console.log(permissions,user_state)
  const nav = useNavigate();

  const [form] = Form.useForm();
  const [selectedMonthYear, setSelectedMonthYear] = useState("");
  const [genModal, setGenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editLoader, setEditLoader] = useState(false);
  const [messageflag, setMessageflag] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [processedPayrolls, setProcessedPayrolls] = useState([]);
  const [downloadModal, setDownloadModal] = useState(false);
  const [downloadTable, setDownloadTable] = useState(false);
  const [downloadData, setDownloadData] = useState([]);
  const [data, setData] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [bankData, setBankData] = useState({});

  
  const [employees, setEmployees] = useState([]);
  const [paginationDetail, setPaginationDetail] = useState();

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [pagination2, setPagination2] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [toProcess, setToProcess] = useState(null);
  const [confirmProcess, setCofirmProcess] = useState(false);
  const [MOPModal, setMOPModal] = useState(false);

  const [loader, setLoader] = useState(false);

  const [dataAvailable, setDataAvailable] = useState(false);
  const [downAvailable, setDownAvailable] = useState(false);
  
  useEffect(()=>{
    getBankDetails();
  },[])

  useEffect(()=>{
    if (data.length===0){
      setDataAvailable(false);
    }
    else{
      setDataAvailable(true);
    }
  },[data])

  useEffect(() => {
    if (downloadData.length === 0) {
      setDownAvailable(false);
    } else {
      setDownAvailable(true);
    }
  },[downloadData]);

  const isdownDisabled = !downAvailable;
  const isDisabled = !dataAvailable;

  const OpenProcesConfirm = (record) => {
    if(record?.modeOfPayment){
      setToProcess(record);
      setCofirmProcess(true);
      setSelectedRecord(null);
    }
    else{
      openMOP(record);
      //WORK FROM HERE!!!!!!!
    }
  };

  const closeProcessConfirm = () => {
    setCofirmProcess(false);
    setToProcess(null);
  };

  const openMOP = (record) => {
    setMOPModal(true);
    setSelectedRecord(record)
  }

  const closeMOP = () => {
    setMOPModal(false);
    setLoader(false);
    setSelectedRecord(null);
  }

  const OpenEditModal = (record) => {
    setSelectedRecord(record);
    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditLoader(false);
    setEditModal(false);
    setSelectedRecord(null);
  };


  const handleOpenModal = () => {
    setGenModal(true);
  };

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

  const handleFilterChange = (value, filterType) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value,
    });
  };


  const handleSearch = () => {
    const { id, name, month, year } = selectedFilters;

    if ((name || id) && (!month && !year)) {
      setFilters(selectedFilters);
      setPagination({
        ...pagination,
        current: 1,
      });
    } else if (month && year) {
      setFilters(selectedFilters);
      setPagination({
        ...pagination,
        current: 1,
      });
    }
    else {
      message.warning(t('payroll.currentPayroll.bothMonthAndYearRequired'));
    }
  };

  const handleReset = () => {
    setSelectedFilters({
      id: "",
      name: "",
      month: "",
      year: "",
    });

    setSelectedMonthYear("");

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

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setGenModal(false);
    setLoader(false);
    PayFilterReset();
  };

  const getBankDetails = () => {
    //setTableLoader(true);
    apiServices("GET", "bank-details", null, user_state)
      .then((res) => {
        // console.log(res?.data?.leavePolicies);
        if (res?.data?.success === true) {
          setBankData(res?.data?.bankDetail[0]);
          console.log(res?.data?.bankDetail[0])
          // setBankId(
          //   res?.data?.bankDetail?._id ? res?.data?.bankDetail?._id : null
          // );
          //setTableLoader(false);
        }
      })
      .catch((err) => {
        //setTableLoader(false);
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('settings.BankDetails.getBankDetailError')
          }!`
        );
      });

    // setData(data1 ? data1 : {})
    // setFirstLeaves(data1)
  };

  const handleGeneratePayroll = () => {
    setLoader(true);
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
              t('payroll.currentPayroll.successfullyGeneratedPayrollsOfYear', {year: `${selectedPayFilters.month} ${selectedPayFilters.year}`})
            );
            setLoader(false);
            GetGenPayrolls();
            handleCloseModal();
          }
        })
        .catch((err) => {
          if (err?.response?.data?.msg == 'Some payrolls were not generated due to no applicable tax slabs') {
            message.error(err?.response?.data?.msg);
            setLoader(false);
            GetGenPayrolls();
            handleCloseModal();
          }
          else {
            message.error(
              `${
                err?.response?.data?.msg
                  ? err?.response?.data?.msg
                  : err?.response?.data?.validation?.body?.message
                  ? err?.response?.data?.validation?.body?.message
                  : t('payroll.currentPayroll.generatePayrollError')
              }`
            );
            setIsLoading(false);
            setLoader(false);
            PayFilterReset();
          }
        });
    } else {
      message.warning(t('payroll.currentPayroll.bothMonthAndYearRequired'));
      setLoader(false);
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
            message.success(t('payroll.currentPayroll.payrollProcessedSuccessfully'));
            closeProcessConfirm()
            handleReset();
          }
        }
        // Handle success or error if needed
        console.log(`Payroll ID ${record} processed successfully`);
      })
      .catch((error) => {
        console.error(`Error processing Payroll ID ${record}:`, error);
        message.error(t('payroll.currentPayroll.errorProcessingPayroll'));
        closeProcessConfirm();
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
          message.success(t('payroll.currentPayroll.selectedPayrollsProcessedSuccessfully'));
          closeProcessConfirm();
          handleReset();
        })
        .catch((error) => {
          console.error(`Error processing selected payrolls:`, error);
          closeProcessConfirm();
        });
      if (updatedData.length === 0) {
        // Reset the current page to the first page
        setPagination({
          ...pagination,
          total: pagination.total - selectedRows.length,
          current: pagination.current - 1,
          //pageSize:pagination.pageSize
        });
        console.log(pagination)
        console.log('slected',selectedRows.length)
        handleReset();
      }
      handleReset();
      setProcessedPayrolls([...processedPayrolls, ...selectedIds]);
      // Update processed status for all selected rows (you can loop through selectedRows)
    }
      else if (selectedRows.length === 0){
        message.warning(t('payroll.currentPayroll.pleaseSelectPayrolls'))
    }
     else {
      processingMultipleRecords = false; // Reset the flag to false
    }
    setSelectedRows([]);
  };

  const closeDmodal = () => {
    setDownloadModal(false);
    setDownloadData([])
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
            {t('finance.Profit&loss.noRecordFound')}
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
      title: t('payroll.currentPayroll.employeeName'),
      dataIndex: "user.fullName",
      fixed: "left",
      render: (text, record) => (
        <h2 className="table-avatar">
          <label className="avatar"><img alt="" src={record?.user?.imageUrl || user_icon} /></label>
          <label>{record?.user?.fullName}</label>
          {/* <label>{text} <span>{record?.user?.role}</span></label> */}
        </h2>
      ),
    },
    {
      title: t('payroll.currentPayroll.employeeID'),
      dataIndex: "user.employeeId",
      render: (text, record) => <>{record?.user?.employeeId}</>,
    },
    {
      title: t('payroll.currentPayroll.payMonth'),
      dataIndex: "payMonth",
    },
    {
      title: t('payroll.currentPayroll.payYear'),
      dataIndex: "payYear",
    },
    {
      title: t('payroll.currentPayroll.salary'),
      dataIndex: "basicSalary",
      render: (text, record) => (
        <span>
          {record?.basicSalary ? `${record?.basicSalary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} PKR` : record?.user?.salary ? `${record?.user?.salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} PKR` : "-"}
        </span>
      ),
    },
    {
      title: t('payroll.currentPayroll.tax'),
      dataIndex: "tax",
    },
    {
      title: t('payroll.currentPayroll.deduction'),
      dataIndex: "deduction",
      render: (text, record) => (
        <span>
          {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      ),
    },
    {
      title: t('payroll.currentPayroll.deductionReason'),
      dataIndex: "deductionReason",
      render: (text, record) => (
        <label className="longText">
          {record?.deductionReason ? record?.deductionReason : "-"}
        </label>
      ),
    },
    {
      title: t('payroll.currentPayroll.totalDeduction'),
      dataIndex: "totalDeduction",
      render: (text, record) => (
        <span>
          {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      ),
    },
    {
      title: t('payroll.currentPayroll.bonus'),
      dataIndex: "bonus",
      render: (text, record) => (
        <span>
          {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      ),
    },
    {
      title: t('payroll.currentPayroll.bonusReason'),
      dataIndex: "bonusReason",
      render: (text, record) => (
        <label className="longText">
          {record?.bonusReason ? record?.bonusReason : "-"}
        </label>
      ),
    },
    {
      title: t('payroll.currentPayroll.totalAddition'),
      dataIndex: "totalAddition",
      render: (text, record) => (
        <span>
          {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      ),
    },
    {
      title: t('payroll.currentPayroll.creditSalary'),
      dataIndex: "creditSalary",
      render: (text, record) => (
        <span>
          {record?.creditSalary ? `${record?.creditSalary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} PKR` : "-"}
        </span>
      ),
    },
    {
      title: t('payroll.currentPayroll.extraPayment'),
      dataIndex: "extraPayment",
      render: (text, record) => (
        <span>
          {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      ),
    },
    {
      title: t('payroll.currentPayroll.extraPaymentReason'),
      dataIndex: "extraPaymentReason",
      render: (text, record) => (
        <label className="longText">
          {record?.extraPaymentReason ? record?.extraPaymentReason : "-"}
        </label>
      ),
    },
    {
      title: t('payroll.currentPayroll.absentFine'),
      dataIndex: "absentFine",
      render: (text, record) => (
        <span>
          {text ? text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00'}
        </span>
      ),
    },
    {
      title: t('payroll.currentPayroll.modeOfPayment'),
      dataIndex: "modeOfPayment",
      render: (text, record) => (
        <label>{record?.modeOfPayment==="Cash" ? t('cash') : record?.modeOfPayment==="Cheque" ? t('cheque') : record?.modeOfPayment==="Bank Transfer" ? t('bankTransfer') : '-'}</label>
          ),
    },
    {
      title: t('payroll.currentPayroll.transactionID'),
      dataIndex: "transactionId",
      render: (text, record) => (
        <label>{record?.transactionId ? record?.transactionId : "-"}</label>
      ),
    },
    {
      title: t('finance.Invoices.bank'),
      dataIndex: "user.bankName",
      render: (text, record) => (
        <label>{record?.user?.bankName ? record?.user?.bankName : "-"}</label>
      ),
    },
    {
      title: t('payroll.currentPayroll.createdAt'),
      dataIndex: "createdAt",
      render: (text) => moment(text).format("D MMM YYYY"),
    },
    {
      title: t('status'),
      dataIndex: "status",
      render: (text) => (
        <label>{text==="Unpaid" ? t('payroll.currentPayroll.unpaid') : "-"}</label>
      ),
    },
    {
      title: t('payroll.currentPayroll.payslip'),
      render: (text, record) => (
        <button
          className="btn btn-sm btn-primary"
          onClick={() => OpenProcesConfirm(record)}
        >
          {t('payroll.currentPayroll.processPayroll')}
        </button>
      ),
    },
    {
      title: t('allEmp.action'),
      render: (text, record) => (
            <a
              className="dropdown-item"
              href="javascript:void(0)"
              onClick={() => {
                OpenEditModal(record);
              }}
            >
              <i className="fa fa-pencil m-r-5" /> {t('edit')}
            </a>
      ),
    },
  ];

  const columns2 = [
    {
      title: t('payroll.currentPayroll.employeeName'),
      dataIndex: "user.fullName",
      fixed: "left",
      render: (text, record) => (
        <h2 className="table-avatar">
          <label className="avatar"><img alt="" src={record?.user?.imageUrl || user_icon} /></label>
          <label>{record?.user?.fullName}</label>
          {/* <label>{text} <span>{record?.user?.role}</span></label> */}
        </h2>
      ),
    },
    {
      title: t('payroll.currentPayroll.employeeID'),
      dataIndex: "user.employeeId",
      render: (text, record) => <>{record?.user?.employeeId}</>,
    },
    {
      title: t('payroll.currentPayroll.payMonth'),
      dataIndex: "payMonth",
    },
    {
      title: t('payroll.currentPayroll.payYear'),
      dataIndex: "payYear",
    },
    {
      title: t('payroll.currentPayroll.salary'),
      dataIndex: "basicSalary",
      render: (text, record) => (
        <span>
          {record?.basicSalary ? `${record?.basicSalary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} PKR` : record?.user?.salary ? `${record?.user?.salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} PKR` : "-"}
        </span>
      ),
    },
    {
      title: t('payroll.currentPayroll.tax'),
      dataIndex: "tax",
    },
    {
      title: t('payroll.currentPayroll.deduction'),
      dataIndex: "deduction",
      render: (text, record) => (
        <span>
          {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      ),
    },
    {
      title: t('payroll.currentPayroll.deductionReason'),
      dataIndex: "deductionReason",
      render: (text, record) => (
        <label className="longText">
          {record?.deductionReason ? record?.deductionReason : "-"}
        </label>
      ),
    },
    {
      title: t('payroll.currentPayroll.totalDeduction'),
      dataIndex: "totalDeduction",
      render: (text, record) => (
        <span>
          {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      ),
    },
    {
      title: t('payroll.currentPayroll.bonus'),
      dataIndex: "bonus",
      render: (text, record) => (
        <span>
          {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      ),
    },
    {
      title: t('payroll.currentPayroll.bonusReason'),
      dataIndex: "bonusReason",
      render: (text, record) => (
        <label className="longText">
          {record?.bonusReason ? record?.bonusReason : "-"}
        </label>
      ),
    },
    {
      title: t('payroll.currentPayroll.totalAddition'),
      dataIndex: "totalAddition",
      render: (text, record) => (
        <span>
          {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      ),
    },
    {
      title: t('payroll.currentPayroll.creditSalary'),
      dataIndex: "creditSalary",
      render: (text, record) => (
        <span>
          {record?.creditSalary ? `${record?.creditSalary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} PKR` : "-"}
        </span>
      ),
    },
    {
      title: t('payroll.currentPayroll.extraPayment'),
      dataIndex: "extraPayment",
      render: (text, record) => (
        <span>
          {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </span>
      ),
    },
    {
      title: t('payroll.currentPayroll.extraPaymentReason'),
      dataIndex: "extraPaymentReason",
      render: (text, record) => (
        <label className="longText">
          {record?.extraPaymentReason ? record?.extraPaymentReason : "-"}
        </label>
      ),
    },
    {
      title: t('payroll.currentPayroll.absentFine'),
      dataIndex: "absentFine",
      render: (text, record) => (
        <span>
          {text ? text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00'}
        </span>
      ),
    },
    {
      title: t('payroll.currentPayroll.modeOfPayment'),
      dataIndex: "modeOfPayment",
      render: (text, record) => (
        <label>{record?.modeOfPayment==="Cash" ? t('cash') : record?.modeOfPayment==="Cheque" ? t('cheque') : record?.modeOfPayment==="Bank Transfer" ? t('bankTransfer') : '-'}</label>
          ),
    },
    {
      title: t('payroll.currentPayroll.transactionID'),
      dataIndex: "transactionId",
      render: (text, record) => (
        <label>{record?.transactionId ? record?.transactionId : "-"}</label>
      ),
    },
    {
      title: t('finance.Invoices.bank'),
      dataIndex: "user.bankName",
      render: (text, record) => (
        <label>{record?.user?.bankName ? record?.user?.bankName : "-"}</label>
      ),
    },
    {
      title: t('payroll.currentPayroll.createdAt'),
      dataIndex: "createdAt",
      render: (text) => moment(text).format("D MMM YYYY"),
    },
    {
      title: t('status'),
      dataIndex: "status",
      render: (text) => (
        <label>{text==="Unpaid" ? t('payroll.currentPayroll.unpaid') : "-"}</label>
      ),
    },
    {
      title: t('allEmp.action'),
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
      message.warning(t('payroll.currentPayroll.bothMonthAndYearRequired'));
      setIsLoading(false);
    }
  };

  const closeTable = () => {
    setDownloadTable(false);
    setPagination2({
      current: 1,
      pageSize: 20,
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
      `payrolls/view-payrolls?payMonth=${selectedPayFilters.month}&payYear=${selectedPayFilters.year}&employeeName=${filters.name}&processed=false&page=${params.page}&limit=${params.limit}`,
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
          setData((prevData) => [ ...uniquePayrolls, ...prevData]);
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
    if(role === 'admin' || permissions?.managePayrolls) {

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
      `payrolls/view-payrolls?payMonth=${filters.month}&payYear=${filters.year}&employeeName=${filters.name}&employeeId=${filters.id}&processed=false&page=${params.page}&limit=${params.limit}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          const newPayrolls = res?.data?.payrolls || [];
          //setPaginationDetail(res?.data)
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

  // const downloadPDF = (row_data) => {
  //   const d1 = Array.isArray(row_data) ? row_data : [row_data];

  //   const columnsForPDF = [
  //     { title: "Employee ID", dataIndex: "employeeId" },

  //     { title: "Employee Name", dataIndex: "name" },

  //     { title: "Account No", dataIndex: "bankAccountNumber" },

  //     { title: "Credit Salary", dataIndex: "creditSalary" },
  //   ];

  //   const doc = new jsPDF();

  //   const headerStyles = {
  //     // fillColor: '#F6F6F6',

  //     fillColor: "white",

  //     textColor: "black",

  //     fontStyle: "bold",

  //     fontSize: 10,
  //   };

  //   const dataForPDF = d1.map((record, index) => [
  //     record?.user?.employeeId,

  //     record?.user?.fullName,

  //     record?.user?.bankAccountNumber,

  //     record?.creditSalary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
  //   ]);

  //   doc.autoTable({
  //     headStyles: headerStyles,

  //     head: [columnsForPDF.map((rec) => rec?.title)],

  //     body: dataForPDF,

  //     // styles: {

  //     //   lineColor: [0, 0, 0], // Border color

  //     //   lineWidth: 0.1,      // Border width

  //     // },
  //   });

  //   doc.save("payroll_export.pdf");
  // };

  const updatePayroll = (values) => {
    setEditLoader(true);
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

    console.log(updateData);
    // Send a PUT request for each payroll ID

    apiServices("PUT", `payrolls/process-payroll`, updateData, user_state)
      .then((res) => {
        if (res.data.success === true) {
          message.success(`Payroll Details Updated`);
          closeEditModal();
          //handleReset();
          firstAPI()
        }
      })
      .catch((error) => {
        message.error(t('payroll.currentPayroll.errorUpdatingPayrollDetails'));
        console.error(`Error updating Payroll Details`, error);
        setEditLoader(false);
      });
  };

  const updateModeOfPayment = (values) => {
    const { modeOfPayment } = values;
    if (!modeOfPayment) {
      message.warning(t('payroll.currentPayroll.selectModeOfPayment'));
    } 
    else {
      setLoader(true);

      const updateData = {
        _id: selectedRecord?._id,
        companyId: selectedRecord?.companyId,
        deduction: selectedRecord?.deduction, // Use values from the form
        deductionReason: selectedRecord?.deductionReason, // Use values from the form
        totalDeduction: selectedRecord?.totalDeduction, // Use values from the form
        bonus: selectedRecord?.bonus, // Use values from the form
        bonusReason: selectedRecord?.bonusReason, // Use values from the form
        totalAddition: selectedRecord?.totalAddition, // Use values from the form
        creditSalary: selectedRecord?.creditSalary,
        modeOfPayment: values.modeOfPayment,
        transactionId: selectedRecord?.transactionId, // Use values from the form
        extraPayment: selectedRecord?.extraPayment, // Use values from the form
        extraPaymentReason: selectedRecord?.extraPaymentReason,
        processed : false
      };
      console.log(updateData);
  
      apiServices("PUT", `payrolls/process-payroll`, updateData, user_state)
        .then((res) => {
          if (res.data.success === true) {
            const updated = res?.data?.payroll
            message.success(t('payroll.currentPayroll.modeOfPaymentAdded'));
            handleReset();
            closeMOP();
            setLoader(false);
            OpenProcesConfirm(updated)
          }
        })
        .catch((error) => {
          message.error(t('payroll.currentPayroll.errorAddingModeOfPayment'));
          closeMOP();
          setLoader(false);
          console.error(`Error Adding Mode of Payment`, error);
        });
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <Helmet>
          <title>{t('payroll.currentPayroll.currentPayroll')} - {t('header.daftarPro')}</title>
          <meta name="description" content="Login page" />
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">{t('payroll.currentPayroll.currentPayroll')}</h3>
                
              </div>
              <div className="col-auto float-end ms-auto d-flex gap-2">
                <Button className="btn add-btn"
                  style={{ display: 'flex',justifyContent: 'center',alignItems: 'center',}}
                  onClick={handleOpenModal}>
                  <i className="fa fa-plus" /> {t('payroll.currentPayroll.GeneratePayroll')}
                </Button>

                <Button
                  className="btn add-btn"
                  onClick={() => handleProcessPayroll()}
                  style={{ display: 'flex',justifyContent: 'center', alignItems: 'center', backgroundColor: '#ff9b44', color: '#ffffff' }}
                  disabled={isDisabled}
                >
                  <i className="fa fa-plus" />{t('payroll.currentPayroll.processPayroll')}
                </Button>

                <Button
                  className="col-auto"
                  type="default"
                  icon={<DownloadOutlinedIcon />}
                  onClick={() => {
                    if (!bankData) {
                      //if (!messageflag) {
                      message.warning(t('noBankAdded'));
                      nav('/settings')
                      //console.log("empty");
                      return;
                    }
                    else if (!bankData?.financeHeadName) {
                      //if (!messageflag) {
                      message.warning(t('addFinancialHeadFirst'));
                      nav('/settings')
                      //console.log("empty");
                      return;
                    }
                    else{
                      setDownloadModal(true);
                    }
                    //setDownloadModal(true);
                  }}
                  style={{ backgroundColor: '#ff9b44', color: '#ffffff', borderRadius: "40px",
                  pointerEvents: isDisabled ? 'none' : 'auto',
                  opacity: isDisabled ? 0.5 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer'
                }}
                  disabled={isDisabled}
                />
              </div>
            </div>
          </div>

          {/* Search Filter */}
          <Form form={form}>
            <div className="row filter-row">
            <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">
                <div className="form-group">
                  <Form.Item name="id" className="custom-border">
                    <Input
                      className="form-control"
                      allowClear={false}
                      placeholder={t('payroll.currentPayroll.employeeID')}
                      onChange={(e) =>
                        handleFilterChange(e.target.value, "id")
                      }
                    />
                  </Form.Item>
                </div>
              </div>
              
              <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">
                <div className="form-group">
                  <Form.Item name="name" className="custom-border">
                    <Input
                      className="form-control"
                      allowClear={false}
                      placeholder={t('payroll.currentPayroll.employeeName')}
                      onChange={(e) =>
                        handleFilterChange(e.target.value, "name")
                      }
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">
                <div className="form-group">
                  <Form.Item name="month">
                    <DatePicker.MonthPicker
                      style={{
                        width: "100%",
                      }}
                      className="form-control"
                      placeholder={t('payroll.currentPayroll.selectMonth')}
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
              <div className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12">
                <div className="form-group">
                  <Form.Item name="year">
                    <DatePicker.YearPicker
                      style={{
                        width: "100%",
                      }}
                      className="form-control"
                      placeholder={t('aAttend.selectYear')}
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
                className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12"
              >
                <div className="form-group">
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={handleSearch}
                  className="btn-success btn-block w-100"
                  style={{ borderRadius: "5px" }}
                >
                  {t('search')}
                </Button>
                </div>
                </div>
                <div
                className="col-sm-6 col-md-3 col-lg-3 col-xl-2 col-12"
              >
                <div className="form-group">
                <Button
                  htmlType="submit"
                  onClick={handleReset}
                  className="btn-secondary btn-block w-100"
                  style={{ backgroundColor: "#616161", borderColor: "#616161", borderRadius: "5px" }}
                >
                  {t('reset')}
                </Button>
                </div>
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
                  <h5 className="modal-title">{t('payroll.currentPayroll.GeneratePayroll')}</h5>
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
                          {t('payroll.currentPayroll.payrollMonth')} <span className="text-danger">*</span>
                          </label>
                          <div className='filterDateMonth' style={{ position: 'relative' }} id='area'>
                          <Form.Item name="Month" className="custom-border">
                            <DatePicker.MonthPicker
                              style={{minHeight: '50px', display: 'flex'}}
                              className='form-control filterDate'
                              placeholder={t('payroll.currentPayroll.selectMonth')}
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
                          {t('payroll.currentPayroll.payrollYear')} <span className="text-danger">*</span>
                          </label>
                          <div className='filterDateMonth' style={{ position: 'relative' }} id='area'>
                          <Form.Item name="Year" className="custom-border">
                            <DatePicker.YearPicker
                              style={{minHeight: '50px', display: 'flex'}}
                              className='form-control filterDate'
                              placeholder={t('aAttend.selectYear')}
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
                          disabled={loader}
                          onClick={handleGeneratePayroll}
                        >
                          {loader ? (
                            <Spin size="small" indicator={antIcon} />
                          ) : (
                            t('submit')
                          )}
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
                  <h5 className="modal-title">{t('payroll.currentPayroll.downLoad')}</h5>
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
                          {t('payroll.currentPayroll.payrollMonth')} <span className="text-danger">*</span>
                          </label>
                          <div className='filterDateMonth' style={{ position: 'relative' }} id='area'>
                          <Form.Item name="Month" className="custom-border">
                            <DatePicker.MonthPicker
                              style={{minHeight: '50px', display: 'flex'}}
                              className='form-control filterDate'
                              placeholder={t('payroll.currentPayroll.selectMonth')}
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
                          {t('payroll.currentPayroll.payrollYear')} <span className="text-danger">*</span>
                          </label>
                          <div className='filterDateMonth' style={{ position: 'relative' }} id='area'>
                          <Form.Item name="Year" className="custom-border">
                            <DatePicker.YearPicker
                              style={{minHeight: '50px', display: 'flex'}}
                              className='form-control filterDate'
                              placeholder={t('aAttend.selectYear')}
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
                          {t('submit')}
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
              <div className="table-responsive currentPayrollTable" style={{background: 'white'}}>
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
                  style={{ height: "400px", background: "white" }}
                  columns={columns}
                  // bordered
                  dataSource={data}
                  rowKey={(record) => record?._id}
                  pagination={false}
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
                  // onChange={this.handleTableChange}
                />
                
              </div>
              {
                    data?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        total={pagination.total}
                        pageSize={pagination.pageSize}
                        defaultCurrent={1}
                        current={pagination.current}
                        showTotal={(total, range) =>
                          t('paginationShow', { range1: range[0], range2: range[1], total: total })}
                        onChange={(page, pageSize) => {
                          setPagination({
                            ...pagination,
                            current: page,
                            pageSize: pageSize,
                          });
                          //console.log(page, size);
                          //setPageSize(size); setCurrentPage(page);
                          //getEmployeeSalary(filterValues, page, size)
                        }}
                        showSizeChanger={true}
                        pageSizeOptions={['20', '30', '40', '50']}
                        itemRender={(current, type, originalElement) =>
                          itemRender(current, type, originalElement, t)
                        }
                        disabled={isLoading}
                      />
                    </div>
                  }
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
                    {t('finance.Profit&loss.payrolls')}
                  </h5>
                  <button
                  href="javascript:void(0)" 
                  className="btn add-btn"
                  disabled={isdownDisabled}
                  onClick={() => {
                    CurrentPayrollPDF(downloadData, bankData)
                    // downloadPDF(downloadData);
                    // console.log(downloadData);
                  }}>
                  <DownloadOutlinedIcon />
                  {t('payroll.currentPayroll.export')}</button>

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
                  <h5 className="modal-title">{t('projectScreen.Modal.editDetails')}</h5>

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
                    fullName: selectedRecord?.user?.fullName || "",
                    salary: selectedRecord?.basicSalary ? selectedRecord?.basicSalary : selectedRecord?.user?.salary ? selectedRecord?.user?.salary : "0.00",
                    email: selectedRecord?.user?.email || "",
                    bankAccountNumber: selectedRecord?.user?.bankAccountNumber || "-",
                    bankName: selectedRecord?.user?.bankName || "-",

                  }}
                  >
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>{t('payroll.currentPayroll.employeeID')}</label>
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
                          <label>{t('payroll.currentPayroll.employeeName')}</label>
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
                          <label>{t('payroll.currentPayroll.payMonth')}</label>
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
                          <label>{t('payroll.currentPayroll.payYear')}</label>
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
                          <label>{t('payroll.currentPayroll.tax')}</label>
                          <Form.Item name="tax">
                            <Input className="form-control" readOnly/>
                          </Form.Item>
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>{t('payroll.currentPayroll.salary')}</label>
                          <Form.Item name="salary">
                            <Input className="form-control" readOnly/>
                          </Form.Item>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                    <div className="col-sm-6">
                        <div className="form-group">
                          <label>{t('payroll.currentPayroll.deduction')}</label>
                          <Form.Item name="deduction">
                            <Input className="form-control" />
                          </Form.Item>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>{t('payroll.currentPayroll.totalDeduction')}</label>
                          <Form.Item name="totalDeduction">
                            <Input className="form-control" readOnly/>
                          </Form.Item>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group">
                        <label>{t('payroll.currentPayroll.deductionReason')}</label>
                        <Form.Item name="deductionReason">
                          <Input.TextArea className="form-control" rows={3} />
                        </Form.Item>
                      </div>
                    </div>

                    <div className="row">
                    <div className="col-sm-6">
                        <div className="form-group">
                          <label>{t('payroll.currentPayroll.creditSalary')}</label>
                          <Form.Item name="creditSalary">
                            <Input className="form-control" readOnly/>
                          </Form.Item>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>{t('payroll.currentPayroll.bonus')}</label>
                          <Form.Item name="bonus">
                            <Input className="form-control" />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="form-group">
                        <label>{t('payroll.currentPayroll.bonusReason')}</label>
                        <Form.Item name="bonusReason">
                          <Input.TextArea className="form-control" rows={3} />
                        </Form.Item>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>{t('payroll.currentPayroll.extraPayment')}</label>
                          <Form.Item name="extraPayment">
                            <Input className="form-control" />
                          </Form.Item>
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>{t('payroll.currentPayroll.totalAddition')}</label>
                          <Form.Item name="totalAddition">
                            <Input className="form-control" readOnly/>
                          </Form.Item>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="form-group">
                        <label>{t('payroll.currentPayroll.extraPaymentReason')}</label>
                        <Form.Item name="extraPaymentReason">
                          <Input.TextArea className="form-control" rows={3} />
                        </Form.Item>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>{t('payroll.currentPayroll.absentFine')}</label>
                          <Form.Item name="absentFine">
                            <Input className="form-control" readOnly/>
                          </Form.Item>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>{t('payroll.currentPayroll.modeOfPayment')}</label>
                          {/* <Form.Item name="modeOfPayment">
                            <Input className="form-control" />
                          </Form.Item> */}
                          <div style={{ position: "relative" }} id="area">
                            <Form.Item
                              name="modeOfPayment"
                              className="custom-border"
                            >
                              <Select
                                className="custom-select custom-normal"
                                getPopupContainer={() =>
                                  document.getElementById("area")
                                }
                                placeholder="Select Mode of Payment"
                              >
                                <Select.Option value="Bank Transfer">{t('bankTransfer')}</Select.Option>
                                <Select.Option value="Cheque">{t('cheque')}</Select.Option>
                                <Select.Option value="Cash">{t('cash')}</Select.Option>
                              </Select>
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="row">
                    <div className="col-sm-6">
                        <div className="form-group">
                          <label>{t('payroll.currentPayroll.bankName')}</label>
                          <Form.Item name="bankName">
                            <Input className="form-control" readOnly/>
                          </Form.Item>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>{t('payroll.currentPayroll.bankAccountNumber')}</label>
                          <Form.Item name="bankAccountNumber">
                            <Input className="form-control" readOnly/>
                          </Form.Item>
                        </div>
                      </div>
                    </div>

                    <div className="row">
                    <div className="col-sm-6">
                        <div className="form-group">
                          <label>{t('payroll.currentPayroll.transactionID')}</label>
                          <Form.Item name="transactionId">
                            <Input className="form-control" />
                          </Form.Item>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="form-group">
                          <label>{t('payroll.currentPayroll.createdAt')}</label>
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
                          disabled={editLoader}
                        >
                          {t('submit')}
                        </Button>
                      </Form.Item>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </Modal>

          {/* Process Confirmation */}
          <Modal
            open={confirmProcess}
            onClose={closeProcessConfirm}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            disableRestoreFocus
            BackdropProps={{
              style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
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
                    <h3 style={{ marginBottom: "30px" }}>Process Payroll</h3>
                    <p>
                      Are you sure you want to Process ?
                    </p>
                  </div>
                  <div className="modal-btn delete-action">
                    <div className="row">
                      <div className="col-6">
                        <Button
                          htmlType="submit"
                          className="btn btn-primary continue-btn"
                          onClick={() => handleProcessPayroll(toProcess)}
                          style={{width: '100%'}}
                        >
                          Process
                        </Button>
                      </div>
                      <div className="col-6">
                        <Button
                          onClick={closeProcessConfirm}
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

          {/* Mode Of Payment Modal */}
          <Modal
            open={MOPModal}
            onClose={closeMOP}
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
                  <h5 className="modal-title">Mode Of Payment</h5>
                  <button
                    type="button"
                    className="close"
                    onClick={closeMOP}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                <div className="modal-body">
                  <Form
                  onFinish={updateModeOfPayment}

                  name="control-hooks"
                  >
                    <div className="row">
                        <div className="form-group" 
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                          }}>
                          <label>Choose a Payment Method</label>
                          <br/>
                          <Form.Item
                            name="modeOfPayment"
                            className="custom-border"
                          >
                            <Select
                              className="custom-select"
                              placeholder="Select Mode of Payment"
                            >
                              <Select.Option value="Bank Transfer">Bank Transfer</Select.Option>
                              <Select.Option value="Cheque">Cheque</Select.Option>
                              <Select.Option value="Cash">Cash</Select.Option>
                            </Select>
                          </Form.Item>
                          <div className="submit-section">
                            <Form.Item>
                              <Button
                                type="primary" 
                                htmlType="submit"
                                className="btn btn-primary submit-btn"
                                disabled={loader}
                              >
                                Submit
                              </Button>
                            </Form.Item>
                          </div>
                        </div>
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
