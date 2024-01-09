
import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';
import { DatePicker, Form, Input, Pagination, Select, Table, Spin, Empty, Button, message, InputNumber } from 'antd';
import 'antd/dist/antd.css';
import {itemRender,onShowSizeChange} from "../../paginationfunction"
import "../../antdstyle.css"
import Offcanvas from '../../../Entryfile/offcanvance';
import { useSelector } from 'react-redux';
import Modal from "@mui/material/Modal";
import { LoadingOutlined } from '@ant-design/icons';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { apiServices } from '../../../Services/apiServices';
import {
  BarChart, Bar, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart,
} from 'recharts';


const ProfitLoss = () => {

  const nav = useNavigate();

  const moment = require('moment');
  const [form] = Form.useForm();
  const [formadd] = Form.useForm();
  const [formedit] = Form.useForm();
  const [formyear] = Form.useForm();

  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const role = user_state?.user?.role

  const [allProfitLoss, setAllProfitLoss] = useState([]);
  const [allGraphsData, setAllGraphsData] = useState([]);
  const [graphData, setGraphData] = useState({});
  const [allYears, setAllYears] = useState([]);
  const [tableLoader, setTableLoader] = useState(true);
  const [graphLoader, setGraphLoader] = useState(true);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [loader, setLoader] = useState(false)
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationDetail, setPaginationDetail] = useState();
  const [filterValues, setFilterValues] = useState();
  const [open, setOpen] = useState({
    isAddOpen: false,
    isEditOpen: false,
    isDelOpen: false,
    data: ''
  });

  useEffect(() => {
    if(role === 'admin' || permissions?.managePayrolls) {
      getAllProfitLoss();
      getAllGraphData()
    }else{
      nav(`${role === 'client' ? '/client/client-profile' : role === 'focalperson' ? `/client/focal-profile` : role === 'admin' ? `/main/dashboard` : `/employee/dashboard`}`)
    }
  }, [])

  const getAllProfitLoss = (values, current_page, page_size) => {
    setTableLoader(true);
    apiServices("GET", `profit-loss?${values === '' ? '' : values?.month === '' ? '' : values?.month ? `month=${values?.month}` : filterValues?.month ? `month=${filterValues?.month}` : ''}${values === '' ? '' : values?.year === '' ? '' : values?.year ? `&year=${values?.year}` : filterValues?.year ? `&year=${filterValues?.year}` : ''}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setAllProfitLoss(res?.data?.profitLoss?.docs);
          setPaginationDetail(res?.data?.profitLoss)
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
              : "Get All Profit & Loss Error"
          }!`
        );
      });
  }
  
  const getAllGraphData = (year) => {
    setGraphLoader(true);
    apiServices("GET", 'profit-loss/graph', null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          const all_years = res?.data?.profitLoss?.map((item => item?.year))?.sort((a, b) => b.localeCompare(a));
          if(year){
            const recent_year = res?.data?.profitLoss?.length > 0 ?
              res?.data?.profitLoss?.filter(item => item?.year === year).length > 0 ?
              res?.data?.profitLoss?.find(item => item?.year === year)
              : res?.data?.profitLoss?.reduce((prev, current) =>
              prev.year > current.year ? prev : current
              ) : {};
            setGraphData(recent_year)
            formyear.setFieldsValue({years: recent_year?.year})
          }else{
            const recent_year = res?.data?.profitLoss?.length > 0 ? res?.data?.profitLoss?.reduce((prev, current) =>
              prev.year > current.year ? prev : current
            ) : {};
            setGraphData(recent_year)
            formyear.setFieldsValue({years: recent_year?.year})
          }
          setAllGraphsData(res?.data?.profitLoss)
          setAllYears(all_years)
          setGraphLoader(false);
          
          // const all_years = res?.data?.profitLoss?.map((item => item?.year)).sort((a, b) => b.localeCompare(a));
          // const recent_year = res?.data?.profitLoss?.length > 0 ? res?.data?.profitLoss.reduce((prev, current) =>
          //   prev.year > current.year ? prev : current
          // ) : {};
          // setAllGraphsData(res?.data?.profitLoss)
          // setGraphData(recent_year)
          // setAllYears(all_years)
          // formyear.setFieldsValue({years: recent_year?.year})
          // setGraphLoader(false);
        }
      })
      .catch((err) => {
        setGraphLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Get Profit & Loss Graph Data Error"
          }!`
        );
      });

    // const all_years = graphD?.map((item => item?.year)).sort((a, b) => b?.localeCompare(a));
    // const recent_year = graphD?.length > 0 ? graphD?.reduce((prev, current) =>
    //   prev?.year > current?.year ? prev : current
    // ) : {}
    // setGraphData(recent_year)
    // setAllGraphsData(graphD)
    // setAllYears(all_years)
    // formyear.setFieldsValue({years: recent_year?.year})
    // setGraphLoader(false)
  }

  const onFilterFinish = (values) => {
    const formatted_data = {
      month: values?.month ? moment(values?.month).format('M') : '',
      year: values?.year ? moment(values?.year).format('YYYY') : '',
    }
    if(formatted_data?.year || formatted_data?.month){
      getAllProfitLoss(formatted_data, 1, pageSize);
      setFilterValues(formatted_data);
      setCurrentPage(1);
    }
  }

  const onFinishAdd = (values) => {
    const formatted_data = {
    month: values?.month ? moment(values?.month).format('M') : '',
    year: values?.year ? moment(values?.year).format('YYYY') : '',
    }

    setLoader(true)
    apiServices("POST", "profit-loss", formatted_data, user_state)
    .then((res) => {
      if (res?.data?.success === true) {
        getAllProfitLoss(filterValues, currentPage, pageSize);
        let sel_year = graphData?.year
        getAllGraphData(sel_year);
        handleClose();
        message.success("Record Generated Successfully!");
        setLoader(false);
      }
    })
    .catch((err) => {
      setLoader(false)
      // console.log(err);
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : "Generate Profit & Loss Error"
        }`
      );
    });
  }

  // const onFinishUpdate = (values, open_data) => {
  //   let formatted_data = {
  //     ...values,
  //     _id: open_data?._id,
  //     paidAmount: values?.paidAmount ? `${values?.paidAmount}` : '',
  //     paymentDate: values?.paymentDate ? moment(values?.paymentDate).format('YYYY-MM-DD') : '',
  //     remainingAmount: `${(+open_data?.totalAmount - values?.paidAmount)?.toFixed(2)}`
  //   }
  //   console.log(formatted_data);

  //   setLoader(true)
  //   apiServices("PUT", "invoices", formatted_data, user_state)
  //   .then((res) => {
  //     if (res?.data?.success === true) {
  //       setAllInvoices(
  //         allInvoices.map((invoice) => {
  //           if (invoice._id === open_data._id) {
  //             return {
  //               ...invoice,
  //               ...formatted_data,
  //             };
  //           } else {
  //             return {
  //               ...invoice,
  //             };
  //           }
  //         })
  //       );
  //       handleClose();
  //       message.success("Invoice Updated Successfully!");
  //       setLoader(false)
  //     }
  //   })
  //   .catch((err) => {
  //     setLoader(false)
  //     // console.log(err);
  //     message.error(
  //       `${
  //         err?.response?.data?.msg
  //           ? err?.response?.data?.msg
  //           : err?.response?.data?.validation?.body?.message
  //           ? err?.response?.data?.validation?.body?.message
  //           : "Update Invoice Error"
  //       }`
  //     );
  //   });
  // }

  const handleClose = () => {
    setOpen({
      isAddOpen: false,
      isEditOpen: false,
      isDelOpen: false,
      data: ''
    });
    formedit.resetFields();
    formadd.resetFields();
  };

  const onHandleDelete = (id) => {
    setDeleteLoader(true);
    apiServices("DELETE", "profit-loss", id, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          getAllProfitLoss(filterValues, currentPage, pageSize)
          let sel_year = graphData?.year
          getAllGraphData(sel_year);
          handleClose();
          message.success("Record Deleted Successfully!");
          setDeleteLoader(false);
        }
      })
      .catch((err) => {
        setDeleteLoader(false);
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Delete Invoice Error"
          }`
        );
      });

    // console.log(id);
    // message.success('Invoice Deleted Successfully!');
    // handleClose()
  }
  
    const columns = [  
      {
        title: '#',
        dataIndex: '',
        render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
      },         
      {
        title: 'Month',
        dataIndex: 'month',
        render: (text, record) => {
          return(
          <label>{moment(text).format('MMMM')}</label>
          )},
      },    
      {
        title: 'Year',
        dataIndex: 'year',
      },
      {
        title: 'Payrolls',
        dataIndex: 'creditedSalaryExpense',
        render: (text, record) => {
          const salaryExpense = parseFloat(record?.creditedSalaryExpense) + parseFloat(record?.salaryTaxExpense);
          return (
            <span>
              {salaryExpense?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {record?.companyId?.preferredCurrency}
            </span>
          );
        },
      },
      
      {
        title: 'Expense',
        dataIndex: 'generalExpense',
        render: (text, record) => (
        <span>{text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {record?.companyId?.preferredCurrency}</span>
          ),
      },
      {
        title: 'Total Revenue',
        dataIndex: 'totalRevenue',
        render: (text, record) => (
        <span>{text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {record?.companyId?.preferredCurrency}</span>
          ),
      },
      {
        title: 'Profit/Loss',
        dataIndex: 'profitLoss',
        render: (text, record) => (
        <label className={text >= 0 ? "badge bg-inverse-success" : "badge bg-inverse-danger"} style={{fontSize: '13px'}}>
          {text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {record?.companyId?.preferredCurrency}
        </label>
          ),
      },
      {
        title: 'Actions',
        render: (text, record) => (
          <div className="dropdown dropdown-action text-end">
            <a href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
            <div className="dropdown-menu dropdown-menu-right">
            <Link to="/profit-loss/view" className="dropdown-item" onClick={() => sessionStorage.setItem(`profit_loss`, 'record')} state={{record: record}}>
              <i className="fa fa-eye m-r-5" /> View
            </Link>
            {/* <a className="dropdown-item" href="javascript:void(0)"
              onClick={() => {
                console.log(record);
              }}><i className="fa fa-eye m-r-5" /> View</a> */}
              <a className="dropdown-item" href="javascript:void(0)" onClick={() => { setOpen({ isEditOpen: false, isDelOpen: true, data: record }) }}><i className="fa fa-trash-o m-r-5" /> Delete</a>
            </div>
          </div>
        ),
      }
    ]

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
              {/* {
                (role === 'admin' || permissions?.viewAllUsers) ? 'No Employee Record found!' : 'You are Restricted to View Employees'
              } */}
              No Record Found!
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

  const amountFormatter = (value) => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    } else if (value <= -1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    } else if (value <= -1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    } else if (value <= -1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    } else {
      return value;
    }
  }

  const disabledDate = (current) => {
    // Disable dates that are in the future
    return current && current.isAfter();
  };

      return (
        <>
        <div className="page-wrapper">
            <Helmet>
                <title>Profit & Loss - DaftarPro</title>
                <meta name="description" content="Login page"/>					
            </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col">
              <h3 className="page-title">Profit & Loss</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>Dashboard</Link></li>
                <li className="breadcrumb-item active">Profit & Loss</li>
              </ul>
            </div>
            <div className="col-auto float-end ms-auto">
                <a href="javascript:void(0)" className="btn add-btn"
                onClick={() => { setOpen({ isAddOpen: true, data: '' }); }}
                >
                    <i className="fa fa-plus" /> Generate Profit & Loss
                </a>
            </div>
          </div>
        </div>
        {/* /Page Header */}

        {/* /Graphs */}
        {
          graphLoader ? <Spin style={{height: '140px', display: 'grid', placeItems: 'center', background: '#f3f3f3', borderRadius: '10px', marginBottom: '35px'}} /> :
          graphData?.year ? 
          <div className="row">
            <div className="col-md-12 text-center">
              <div className="card">
                <div className="card-body">
                  <div style={{display: 'flex', justifyContent: 'space-between', padding: '0px 20px'}}>
                    <span style={{color: 'transparent'}}>.</span>
                    <h3 className="card-title">Overview - {graphData?.year}</h3>
                    <Form form={formyear}>
                      <div style={{ position: 'relative' }} id='area4'>
                        <Form.Item
                          name="years"
                          className="custom-border"
                        >
                          <Select
                            showSearch
                            className="custom-select custom-normal"
                            style={{
                              width: '100%',
                            }}
                            size='small'
                            getPopupContainer={() => document.getElementById('area4')}
                            onChange={(val => {
                              const data = allGraphsData?.filter(item => item?.year === val);
                              setGraphData(...data)
                            })}
                          >
                            {
                              allYears?.map((item, index) => {
                              return (
                                  <Option key={index} value={item}>{item}</Option>
                              )
                              })
                            }
                          </Select>
                        </Form.Item>
                      </div>
                    </Form>
                  </div>

                  {
                    graphLoader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                    // allData?.expenses?.length > 0 ?
                    <ResponsiveContainer width='100%' height={300}>
                      <ComposedChart
                        // data={graphData?.months}
                        data={graphData?.months?.map((item => item)).sort((a, b) => +a.month - +b.month)}
                        margin={{
                          top: 5, right: 5, left: 5, bottom: 5,
                        }}
                        className='showLegend'
                      >
                        <CartesianGrid />
                        <XAxis
                          dataKey="month"
                          tickFormatter={(value) =>  moment(value).format('MMM') }
                        />
                        <YAxis 
                          tickFormatter={(value) => {
                          if (value >= 1e9) {
                            return `${(value / 1e9).toFixed(1)}B`;
                          } else if (value >= 1e6) {
                            return `${(value / 1e6).toFixed(1)}M`;
                          } else if (value >= 1e3) {
                            return `${(value / 1e3).toFixed(1)}K`;
                          } else if (value <= -1e9) {
                            return `${(value / 1e9).toFixed(1)}B`;
                          } else if (value <= -1e6) {
                            return `${(value / 1e6).toFixed(1)}M`;
                          } else if (value <= -1e3) {
                            return `${(value / 1e3).toFixed(1)}K`;
                          } else {
                            return value;
                          }
                          }}
                        />
                        {/* <Tooltip /> */}
                        <Tooltip
                          labelFormatter={(value) => 
                            <>
                              {moment(value).format('MMMM')} {graphData?.year}
                            </>
                          }
                          // formatter={(value) => <label>{value.toLocaleString()}</label>}
                          formatter={(value, name, entry) => {
                            if (entry.dataKey === 'totalExpense' || entry.dataKey === 'totalRevenue') {
                              // return <label> {value.toLocaleString()}</label>;
                              return amountFormatter(value)
                            }else {
                              return <>{value >= 0 ? 'Profit    :    ' : 'Loss    :    ' } {amountFormatter(value)}</>;
                            }
                          }}
                        />
                        <Legend
                          formatter={(value) => {
                            if (value === 'Total Expense') {
                              return <label>Total Expense</label>;
                            }else if (value === 'Total Revenue') {
                              return <label>Total Revenue</label>;
                            }else{
                              return 'Profit/Loss';
                            }
                          }}
                        />
                        <Bar dataKey="totalExpense" name='Total Expense' fill="#fc6075" barSize={20} minPointSize={1} />
                        <Bar dataKey="totalRevenue" name='Total Revenue' fill="#ff9b44" barSize={20} minPointSize={1} />
                        <Line type="monotone" dataKey="profitLoss" name={val => val >= 0 ? 'Profit' : 'Loss'} stroke="#ff7300" fill="#ff7300" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 7 }} />
                        {/* <Line type="monotone" dataKey="profitLoss" name='Profit Loss' stroke="#ff9b44" fill="#00c5fb" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 7 }} /> */}
                      </ComposedChart>
                    </ResponsiveContainer> 
                    // :
                    // <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>No Record Found!</label>
                  }

                </div>
              </div>
            </div>
          </div> : null
        }
        {/* /Graphs */}

        {/* /Search Filter */}
        <Form
        form={form}
        onFinish={onFilterFinish}
        >
        <div className="row filter-row">
        {/* <div className="col-sm-6 col-md-3">  
            <div className="form-group">
            <Form.Item
                name="employeeName"
                className="custom-border"
            >
            <Input
                className="form-control"
                style={{height:'50px'}}
                placeholder='Employee Name'
            />
            </Form.Item>
            </div>
        </div> */}
        <div className="col-sm-6 col-md-4">
            <div className='filterDateMonth' style={{ position: 'relative' }} id='area'>
                <Form.Item
                    name="month"
                    className="custom-border"
                    // rules={[
                    //   {
                    //     whitespace: true,
                    //     required: true,
                    //     message: "please select month",
                    //   },
                    // ]}
                >
                    <DatePicker format="MMMM" allowClear={false} size='large' picker="month" placeholder='Select Month' className='form-control filterDate' style={{minHeight: '50px', display: 'flex'}} getPopupContainer={() => document.getElementById('area')} />
                </Form.Item>
            </div>
        </div>
        <div className="col-sm-6 col-md-4">
        <div style={{ position: 'relative' }} id='area1'>
            <Form.Item
                name="year"
                className="custom-border"
                // rules={[
                //   {
                //     whitespace: true,
                //     required: true,
                //     message: "please select year",
                //   },
                // ]}
            >
                <DatePicker allowClear={false} size='large' picker="year" placeholder='Select Year' className='form-control filterDate' style={{minHeight: '50px', display: 'flex'}} getPopupContainer={() => document.getElementById('area1')} />
            </Form.Item>
            </div>
        </div>
        <div className="col-sm-6 col-md-4" style={{display: 'flex', alignItems: 'flex-start', gap: '13px'}}>  
            <button href="javascript:void(0)" type="submit" className="btn btn-success btn-block w-50"> Search </button>  
            <button
                href="javascript:void(0)" type="reset"
                onClick={() => { 
                    form.resetFields();
                    getAllProfitLoss('', 1, pageSize);
                    setFilterValues(null); setCurrentPage(1)
                }}
                className="btn btn-success btn-block w-50" style={{backgroundColor: '#616161', color: 'white', borderColor: '#aeaeae'}}
            > 
                Reset
            </button>  
        </div>
        </div>
        </Form>
        {/* /Search Filter */}
        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive profitLossTable">	
               <Table
                  loading={tableLoader}
                  className={allProfitLoss?.length > 0 ? "table-striped" : ""}
                  locale={{
                    emptyText: tableLoader ? null : customEmptyText,
                  }}
                  pagination= {false}
                  style = {{overflowX : 'auto', paddingBottom: '70px'}}
                  columns={columns}                 
                  // bordered
                  dataSource={allProfitLoss}
                  rowKey={record => record._id}
                  // onChange={this.handleTableChange}
                />

                  {
                    allProfitLoss?.length > 0 &&
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
                          getAllProfitLoss(filterValues, page, size)
                        }}
                        showSizeChanger={true}
                        pageSizeOptions={['20', '30', '40', '50']}
                        itemRender={itemRender}
                      />
                    </div>
                  }
            </div>
          </div>
        </div>
      </div>
      {/* /Page Content */}
    </div>
    {/* Add modall */}
      <Modal
        open={open.isAddOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
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
                Generate Profit & Loss
              </h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                form={formadd}
                name="control-hooks"
                onFinish={onFinishAdd}
                onFinishFailed={({errorFields}) => {
                  const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                  if(consecutiveSpacesError){
                    message.error("Please Remove Consecutive Spaces!")
                  }else{
                    message.error("Please Fill Required Fields!")
                  }
                }}
              >
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Month <span className="text-danger">*</span>
                      </label>
                        <div className='filterDateMonth disableAlign' style={{ position: 'relative' }} id='area2'>
                            <Form.Item
                                name="month"
                                className="custom-border"
                                rules={[
                                  {
                                    required: true,
                                    message: "please select month",
                                  },
                                ]}
                            >
                                <DatePicker disabledDate={disabledDate} format="MMMM" allowClear={false} size='large' picker="month" placeholder='Select Month' className='form-control filterDate' style={{minHeight: '50px', display: 'flex'}} getPopupContainer={() => document.getElementById('area2')} />
                            </Form.Item>
                        </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Year <span className="text-danger">*</span>
                      </label>
                        <div className='disableAlign' style={{ position: 'relative' }} id='area3'>
                            <Form.Item
                                name="year"
                                className="custom-border"
                                rules={[
                                  {
                                    required: true,
                                    message: "please select year",
                                  },
                                ]}
                            >
                                <DatePicker disabledDate={disabledDate} allowClear={false} size='large' picker="year" placeholder='Select Year' className='form-control filterDate' style={{minHeight: '50px', display: 'flex'}} getPopupContainer={() => document.getElementById('area3')} />
                            </Form.Item>
                        </div>
                    </div>
                  </div>
                  <div className="submit-section">
                    <Form.Item>
                      <Button
                        htmlType="submit"
                        className="btn btn-primary submit-btn"
                        disabled={loader}
                      >
                        {loader ? (
                          <Spin size="small" indicator={antIcon} />
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    </Form.Item>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Modal>
    {/* Add modall */}

    {/* delete modall */}
    <Modal
      open={open.isDelOpen}
      onClose={handleClose}
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
              <h3 style={{ marginBottom: "30px" }}>Delete Profit/Loss</h3>
              <p>
                Are you sure you want to delete the record of<br /> <b>{moment(open?.data?.month).format('MMMM')} {open?.data?.year}</b>?
              </p>
            </div>
            <div className="modal-btn delete-action">
              <div className="row">
                <div className="col-6">
                  <Button
                    htmlType="submit"
                    className="btn btn-primary continue-btn"
                    onClick={() => onHandleDelete(open?.data?._id)}
                    disabled={deleteLoader}
                    style={{ width: "100%" }}
                  >
                    {deleteLoader ? (
                      <Spin size="small" indicator={antIcon} />
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </div>
                <div className="col-6">
                  <Button
                    onClick={handleClose}
                    className="btn btn-primary submit-btn"
                    style={{ width: "100%" }}
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
    {/* delete modall */}
    {/* <Offcanvas/> */}
        </> 
        
      );
   
}


export default ProfitLoss