import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Button,
  Col,
  Form,
  Input,
  DatePicker,
  Row,
  Select,
  Spin,
  Table,
  message,
  Empty,
  Pagination,
} from "antd";
import "antd/dist/antd.css";
import "../../antdstyle.css";
import Offcanvas from "../../../Entryfile/offcanvance";
import { apiServices } from "../../../Services/apiServices";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { user_icon } from "../../../Entryfile/imagepath";
import { useTranslation } from "react-i18next";
import { itemRender } from "../../paginationfunction";
import DetailsModal from "../Payroll/DetailsModal";
import GenerateSalaryPDF from "../Payroll/GenerateSalaryPDF";

const { Option } = Select;

const ViewPL = () => {
  const [Detailform] = Form.useForm();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const nav = useNavigate();

  const record = location?.state?.record ? location?.state?.record : location?.state;

  const PCurrency = record?.companyId?.preferredCurrency;

  console.log(record);
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
  
  const { startDate, endDate } = getMonthStartEndDate((record?.month), (record?.year));
  console.log("Start Date:", startDate);
  console.log("End Date:", endDate);
  const formattedDate = new Date(startDate)?.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit' });

  var moment = require('moment');

  // Assuming record.month is a number between 1 and 12
  var monthNumber = record?.month;

  // Creating a Moment object with the monthNumber
  var monthName = moment().month(monthNumber - 1).format('MMMM');

  //console.log(monthName);
  

  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  //console.log(permissions,role)

  const [menu, setMenu] = useState(false);
  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role;

  const [isStatLoading, setIsStatLoading] = useState(false);

  const [allExpenses, setAllExpenses] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [tableLoader, setTableLoader] = useState(true);
  const [tableLoader1, setTableLoader1] = useState(true);

  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize2, setPageSize2] = useState(20);
  const [currentPage2, setCurrentPage2] = useState(1);
  const [pageSize3, setPageSize3] = useState(20);
  const [currentPage3, setCurrentPage3] = useState(1);
  const [tableData, setTableData] = useState([]);  
  const [data, setData] = useState();
  const [paginationDetail, setPaginationDetail] = useState();
  const [openDetail, setOpenDetail] = useState({
    open: false,
    data: ''
  });

  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    //setIsStatLoading(true);
  }, []);

  useEffect(() => {
    if (
      role === "admin" ||
      permissions?.expenseManagement
    ) {
      //setIsLoading(true);
      getAllExpenses();
      getAllInvoices();
      getEmployeeSalary();
      //console.log("helloooooooooo")
    } else {
      nav("/restricted", { state: { unAuthorize: true } });
    }
  }, []);


  const getAllExpenses = () => {
    setTableLoader(true);
    apiServices("GET", `expenses?purchaseFrom=${startDate}&purchaseTo=${endDate}&limit=99999&page=1`, null, user_state)
      .then((res) => {
          if (res?.data?.success === true) {
              setAllExpenses(res?.data?.Expenses?.docs);
              //setPaginationDetail(res?.data?.Expenses)
              setTableLoader(false);
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
              : t('finance.Profit&loss.getAllExpensesError')
          }!`
        );
      });
  }

  const getAllInvoices = () => {
    setTableLoader(true);
    apiServices("GET", `invoices?invoiceMonth=${formattedDate}&both=true&limit=99999&page=1`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setAllInvoices(res?.data?.Invoices?.docs);
          //setPaginationDetail(res?.data?.Invoices)
          setTableLoader(false);
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
              : t('finance.Profit&loss.getAllInvoicesError')
          }!`
        );
      });
  }

  const getEmployeeSalary = (current_page, page_size) => {
    setTableLoader1(true);
    apiServices("GET", `payrolls/view-payrolls?payMonth=${monthName}&payYear=${record?.year}&page=${current_page ? current_page : currentPage3 ? currentPage3 : 1}&limit=${page_size ? page_size : pageSize3 ? pageSize3 : 20}&processed=${true}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          // console.log(res?.data?.payrolls);
          setData(res?.data?.payrolls)
          setPaginationDetail(res?.data)
          setTableLoader1(false);
        }
      })
      .catch((err) => {
        setTableLoader1(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('payroll.currentPayroll.getPayrollsHistoryError')
          }!`
        );
      });
  }

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
        height: "332px",
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
            {t('aRequests.errors.noRecordFound')}
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

  const customEmptyText2 = (
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
        height: "357px",
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
            {t('aRequests.errors.noRecordFound')}
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

  const columns1 = [
    // {
    //   title: "#",
    //   dataIndex: "id",
    // },
    {
        title: "#",
        dataIndex: "",
        width: 50,
        render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      },
    {
      title: t('finance.Profit&loss.category'),
      dataIndex: "expenseCategoryName",
      render: (text, record) => (
        <label>{record?.category ? record?.category?.expenseCategoryName : "None"}</label>
      ),
    },
    {
      title: t('Clientinvoices.amount'),
      dataIndex: "convertedAmount",
      render: (text, record) => (
        record?.convertedAmount ? 
        `${record?.convertedAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${PCurrency}`
        :
        `0.00 ${PCurrency}`
      ),
    },
  ];

  const columns2 = [
    {
        title: "#",
        dataIndex: "",
        width: 50,
        render: (text, record, index) => (currentPage2 - 1) * pageSize2 + index + 1,
      },
    {
      title: t('finance.Invoices.invoicenumber'),
      dataIndex: "invoiceNo",
    },
    {
      title: t('finance.Invoices.client'),
      dataIndex: "clientName",
      render: (text, record) => (
        <label>{record?.client ? record?.client?.clientName : "None"}</label>
      ),
    },
    {
      title: t('Clientinvoices.amount'),
      dataIndex: "paidAmountInPreferredCurrency",
      render: (text, record) => (
        record?.paidAmountInPreferredCurrency ? 
        `${record?.paidAmountInPreferredCurrency.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${PCurrency}`
        :
        `0.00 ${PCurrency}`
      ),
      
    },
    {
        title: t('status'),
        dataIndex: 'status',
        render: (text, record) => (
        <label className={text==="Paid" ? "badge bg-inverse-success" : text==="Partially Paid" ? "badge bg-inverse-info" : text==="Pending" ? "badge bg-inverse-warning" : text==="Cancelled" ? "badge bg-inverse-danger" : ''}>
          {text || '-'}
        </label>
          ),
      },
  ];

  const payRollColumns = [
    {
      title: t('payroll.currentPayroll.employeeName'),
      dataIndex: 'name',
      fixed: 'left',
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
      dataIndex: 'employeeId',
      render: (text,record) => (
        <>
          {record?.user?.employeeId}
        </>
      )
    },
    {
      title: t('finance.Profit&loss.month'),
      dataIndex: 'payMonth',
    },
    {
      title: t('finance.Profit&loss.year'),
      dataIndex: 'payYear',
    },
    {
        title: t('payroll.currentPayroll.salary'),
        dataIndex: 'salary',
        render: (text, record) => (
        <span>{record?.user?.salary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
            ),
    },
    {
        title: t('payroll.currentPayroll.tax'),
        dataIndex: 'tax',
        render: (text,record) => (
          <>
            {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0'}
          </>
        )
    },
    {
        title: t('payroll.currentPayroll.deduction'),
        dataIndex: 'deduction',
        render: (text,record) => (
          <>
            {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0'}
          </>
        )
    },
    {
        title: t('payroll.currentPayroll.totalDeduction'),
        dataIndex: 'totalDeduction',
        render: (text,record) => (
          <>
            {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0'}
          </>
        )
    },
    {
        title: t('payroll.currentPayroll.deductionReason'),
        dataIndex: 'deductionReason',
        render: (text,record) => (
            <label className='longText'>
              {text || '-'}
            </label>
          )
    },
    {
        title: t('payroll.currentPayroll.bonus'),
        dataIndex: 'bonus',
        render: (text,record) => (
          <>
            {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0'}
          </>
        )
    },
    {
        title: t('payroll.currentPayroll.bonusReason'),
        dataIndex: 'bonusReason',
        render: (text,record) => (
            <label className='longText'>
              {text || '-'}
            </label>
          )
    },
    {
        title: t('payroll.currentPayroll.totalAddition'),
        dataIndex: 'totalAddition',
        render: (text,record) => (
          <>
            {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0'}
          </>
        )
    },
    {
        title: t('payroll.currentPayroll.extraPayment'),
        dataIndex: 'extraPayment',
        render: (text,record) => (
          <>
            {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0'}
          </>
        )
    },
    {
        title: t('payroll.currentPayroll.extraPaymentReason'),
        dataIndex: 'extraPaymentReason',
        render: (text,record) => (
            <label className='longText'>
              {text || '-'}
            </label>
          )
    },
    {
        title: t('payroll.currentPayroll.absentFine'),
        dataIndex: 'absentFine',
        render: (text,record) => (
          <>
            {text ? parseFloat(text)?.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00'}
          </>
        )
    },
    {
        title: t('payroll.currentPayroll.creditSalary'),
        dataIndex: 'creditSalary',
        render: (text,record) => (
        <span>{text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
        )
    },
    {
        title: t('payroll.currentPayroll.modeOfPayment'),
        dataIndex: 'modeOfPayment',
        render: (text,record) => (
          <>
            {record?.modeOfPayment==="Cash" ? t('cash') : record?.modeOfPayment==="Cheque" ? t('cheque') : record?.modeOfPayment==="Bank Transfer" ? t('bankTransfer') : '-'}
          </>
        )
    },
    {
        title: t('payroll.currentPayroll.transactionID'),
        dataIndex: 'transactionId',
        render: (text,record) => (
          <>
            {text || '-'}
          </>
        )
    },
    {
        title: t('payroll.currentPayroll.payrollProcessingDate'),
        dataIndex: 'createdAt',
        render: (text,record) => {
          const date = new Date(text);
          const day = date.getDate();
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const month = monthNames[date.getMonth()];
          const year = date.getFullYear();
          const formattedDate = `${day} ${month}, ${year}`;
          return (
            <>
              {formattedDate}
            </>
          )
        }
    },
    {
        title: t('status'),
        dataIndex: 'status',
        render: (text) => (
          <label>{text==="Paid" ? t('payroll.currentPayroll.paid') : "-"}</label>
        ),
    },
    {
      title: t('allEmp.action'),
      render: (text, record) => (
          <div className="dropdown dropdown-action text-end">
            <a href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
              <div className="dropdown-menu dropdown-menu-right">
                <a className="dropdown-item" href="javascript:void(0)"
                  onClick={() => {
                    setOpenDetail({ open: true, data: record });
                    let d = {
                      ...record,
                      absentFine: record?.absentFine ? parseFloat(record?.absentFine)?.toFixed(2) : '0', 
                      salary: record?.basicSalary ? record?.basicSalary : record?.user?.salary,
                      employeeId: record?.user?.employeeId,
                      payMonth: moment(record?.payMonth, 'MMMM'),
                      payYear: moment(record?.payYear, 'YYYY'),
                      payrollCreationDate: moment(record?.createdAt, 'YYYY-MM-DD'),
                    }
                    Detailform.setFieldsValue(d);
                    console.log(record);
                  }}><i className="fa fa-eye m-r-5" /> {t('view')}</a>
                {/* <a className="dropdown-item" href="javascript:void(0)" onClick={()=> downloadPDF(record)}><i className="fa fa-download m-r-5" /> Export to PDF</a> */}
                <a className="dropdown-item" href="javascript:void(0)" onClick={()=> GenerateSalaryPDF(record, false, 'history', false)}><i className="fa fa-download m-r-5" /> {t('payroll.currentPayroll.exportPayslip')}</a>
              </div>
          </div>
        ),
    },        
  ]

  return (
    <>
      <div className={`main-wrapper ${menu ? "slide-nav" : ""}`}>
        {/* <Header onMenuClick={(value) => toggleMobileMenu()} /> */}
        {/* <Sidebar />         */}
        <div className="page-wrapper">
          <Helmet>
            <title>{t('finance.Profit&loss.profitAndloss')} - {t('header.daftarPro')}</title>
            <meta name="description" content="Login page" />
          </Helmet>
          {/* Page Content */}
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">Profit & Loss - {record?.month ? monthName : ""} {record?.year ? record?.year : ""}</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link
                        to={
                          role === "admin"
                            ? "/main/dashboard"
                            : "/employee/dashboard"
                        }
                      >
                        {t('dashboard')}
                      </Link>
                    </li>
                    <li className="breadcrumb-item active">{t('finance.Profit&loss.expenses')}</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* </div> */}
            {/* /Page Header */}
            {isStatLoading ? (
              <div
                className="row"
                style={{
                  minHeight: "83px",
                  display: "grid",
                  placeItems: "center",
                  background: "#ebebeb",
                  borderRadius: "5px",
                  marginBottom: "20px",
                  marginInline: "0px",
                }}
              >
                <Spin />
              </div>
            ) : (
              <div className="row" style={{marginBottom:"20px"}}>
                <div className="col-md-3">
                    <div className="stats-info">
                    <label>{t('finance.Profit&loss.payrolls')}</label>
                    <div style={{ display: "flex", flexDirection:"row", alignItems: "baseline", justifyContent:"center"}}>
                        <h4 style={{ marginRight: "5px" }}>{record?.creditedSalaryExpense.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h4>
                        <h8>{record?.companyId?.preferredCurrency}</h8>
                    </div>
                    </div>
                </div>
                <div className="col-md-3">
                  <div className="stats-info">
                    <label>{t('finance.Invoices.tax')}</label>
                    <div style={{ display: "flex", flexDirection:"row", alignItems: "baseline", justifyContent:"center"}}>
                        <h4 style={{ marginRight: "5px" }}>{record?.salaryTaxExpense.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h4>
                        <h8>{record?.companyId?.preferredCurrency}</h8>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stats-info">
                    <label>{t('finance.Invoices.invoices')}</label>
                    <div style={{ display: "flex", flexDirection:"row", alignItems: "baseline", justifyContent:"center"}}>
                    <h4 style={{ marginRight: "5px" }}>{record?.totalRevenue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h4>
                        <h8>{record?.companyId?.preferredCurrency}</h8>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="stats-info">
                    <label>{t('finance.Profit&loss.expense')}</label>
                    <div style={{ display: "flex", flexDirection:"row", alignItems: "baseline", justifyContent:"center"}}>
                        
                        <h4 style={{ marginRight: "5px" }}>{record?.generalExpense.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h4>
                        <h8>{record?.companyId?.preferredCurrency}</h8>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="row">
            <div className="col-md-5">
            <div className="table-heading">
              <div className="table-heading-text" style={{marginBottom:"15px"}}>{t('finance.Profit&loss.expense')}</div>
            </div>
            <div className="table-responsive PLTable">
              <Table
                className="table-striped fixedTableHeader2"
                locale={{
                  emptyText: tableLoader ? (
                    <Spin size="large" tip="Loading..." />
                  ) : (
                    customEmptyText
                  ),
                }}
                loading={tableLoader}
                pagination={false}
                //bordered
                style={{ height:"400px", backgroundColor:'white' }}
                columns={columns1} // Use columns1 for the first table
                dataSource={allExpenses} // Define your data source for the first table
                rowKey={(record) => record?._id}
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
          <div className="col-md-7">
          <div className="table-heading">
              <div className="table-heading-text" style={{marginBottom:"15px"}}>{t('finance.Invoices.invoices')}</div>
            </div>
            <div className="table-responsive PLTable2">
              <Table
                className="table-striped fixedTableHeader2"
                locale={{
                  emptyText: tableLoader ? (
                    <Spin size="large" tip="Loading..." />
                  ) : (
                    customEmptyText
                  ),
                }}
                loading={tableLoader}
                pagination={false}
                bordered
                style={{ height:"400px", backgroundColor:'white'}}
                columns={columns2} // Use columns2 for the second table
                dataSource={allInvoices} // Define your data source for the second table
                rowKey={(record) => record?._id}
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
          <div className="col-md-12" style={{marginTop:'20px'}}>
          <div className="table-heading">
            <div className="table-heading-text" style={{marginBottom:"15px"}}>Payroll History</div>
          </div>
            <div className="table-responsive payrollHistoryTable">
              <Table
                loading={tableLoader1}
                className={data?.length > 0 ? "table-striped" : ""}
                locale={{
                  emptyText: tableLoader1 ? null : customEmptyText2,
                }}
                // style = {{overflowX : 'auto'}}
                style = {{overflowX : 'auto', height: '440px'}}
                columns={payRollColumns}
                dataSource={data}
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
              />
              {
                data?.length > 0 &&
                <div>
                  <Pagination
                    style={{display: 'flex', float: 'right'}}
                    total={paginationDetail?.totalCount}
                    pageSize={pageSize3}
                    defaultCurrent={1}
                    current={currentPage3}
                    showTotal={(total, range) =>
                      t('paginationShow', { range1: range[0], range2: range[1], total: total })}
                    onChange={(page, size) => {
                      console.log(page, size);
                      setPageSize3(size); setCurrentPage3(page);
                      getEmployeeSalary(page, size)
                    }}
                    showSizeChanger={true}
                    pageSizeOptions={['20', '30', '40', '50']}
                    itemRender={(current, type, originalElement) =>
                      itemRender(current, type, originalElement, t)
                    }
                  />
                </div>
            }
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>

      <DetailsModal
        Detailform={Detailform}
        openDetail={openDetail}
        setOpenDetail={setOpenDetail}
      />

      <Offcanvas />
    </>
  );
};

export default ViewPL;
