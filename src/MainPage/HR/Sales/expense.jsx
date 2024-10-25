
import React, { useState ,useEffect  } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';
import { Avatar_04, Avatar_03,PlaceHolder, user_icon} from "../../../Entryfile/imagepath"

import { Form, Table, Input, DatePicker, Pagination, Empty, Select, Spin, message, Button } from 'antd';
import 'antd/dist/antd.css';
import {itemRender,onShowSizeChange} from "../../paginationfunction"
import "../../antdstyle.css"
import { useSelector } from 'react-redux';
import { LoadingOutlined } from '@ant-design/icons';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import Modal from "@mui/material/Modal";
import { apiServices } from '../../../Services/apiServices';
import ExpenseModal from './ExpenseModal';
import { useTranslation } from 'react-i18next';

const Expenses = () => {
  const { t, i18n } = useTranslation();
  const moment = require('moment');

  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const nav = useNavigate();

  const permissions = useSelector((state) => state?.permissionsSlice?.data);

  const user_state = useSelector((state) => state?.user?.loginvalue);
  const role = user_state?.user?.role

  const [allExpenses, setAllExpenses] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [tableLoader, setTableLoader] = useState(true);
  const [loader, setLoader] = useState(false)
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationDetail, setPaginationDetail] = useState();
  const [filterValues, setFilterValues] = useState();
  const [fromExpenseDate, setFromExpenseDate] = useState('');
  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: ''
  });

  useEffect(() => {
    if(role === 'admin' || permissions?.expenseManagement) {
      getAllExpenses();
      getAllEmployees();
    }else{
      nav(`${role === 'client' ? '/client/client-profile' : role === 'focalperson' ? `/client/focal-profile` : role === 'admin' ? `/main/dashboard` : `/employee/dashboard`}`)
    }
  }, [])

  const getAllExpenses = (values, current_page, page_size) => {
    setTableLoader(true);
    apiServices("GET", `expenses?${values === '' ? '' : values?.itemName === '' ? '' : values?.itemName ? `itemName=${values?.itemName}` : filterValues?.itemName ? `itemName=${filterValues?.itemName}` : ''}${values === '' ? '' : values?.purchasedBy === '' ? '' : values?.purchasedBy ? `&purchasedBy=${values?.purchasedBy}` : filterValues?.purchasedBy ? `&purchasedBy=${filterValues?.purchasedBy}` : ''}${values === '' ? '' : values?.paidBy === '' ? '' : values?.paidBy ? `&paidBy=${values?.paidBy}` : filterValues?.paidBy ? `&paidBy=${filterValues?.paidBy}` : ''}${values === '' ? '' : values?.purchaseFrom === '' ? '' : values?.purchaseFrom ? `&purchaseFrom=${values?.purchaseFrom}` : filterValues?.purchaseFrom ? `&purchaseFrom=${filterValues?.purchaseFrom}` : ''}${values === '' ? '' : values?.purchaseTo === '' ? '' : values?.purchaseTo ? `&purchaseTo=${values?.purchaseTo}` : filterValues?.purchaseTo ? `&purchaseTo=${filterValues?.purchaseTo}` : ''}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
      .then((res) => {
          if (res?.data?.success === true) {
              setAllExpenses(res?.data?.Expenses?.docs);
              setPaginationDetail(res?.data?.Expenses)
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
              : t('finance.expenses.getAllExpensesError')
          }!`
        );
      });
  }
  
  const getAllEmployees = () => {
    apiServices("GET", `user/all-employees`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
            const sortedData = res?.data?.User.slice().sort((a, b) => a.fullName.localeCompare(b.fullName));
            setAllEmployees(sortedData);
          }
        })
        .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('allEmp.errors.getEmployeesError')
          }!`
        );
      });
  }

  const onFilterFinish = (values) => {
    let formatted_data = {
      itemName: values?.itemName ? values?.itemName : '',
      purchasedBy: values?.purchasedBy ? values?.purchasedBy : '',
      paidBy: values?.paidBy ? values?.paidBy : '',
      purchaseFrom: values?.purchaseFrom ? moment(values?.purchaseFrom).format('YYYY-MM-DD') : '',
      purchaseTo: values?.purchaseTo ? moment(values?.purchaseTo).format('YYYY-MM-DD') : '',
    }
    if(formatted_data?.itemName || formatted_data?.purchasedBy || formatted_data?.paidBy || formatted_data?.purchaseFrom){
      getAllExpenses(formatted_data, 1, pageSize);
      setFilterValues(formatted_data);
      setCurrentPage(1);
    }
  }

  const onHandleDelete = (id) => {
    setLoader(true);
    apiServices("DELETE", "expenses", id, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          getAllExpenses(filterValues,currentPage, pageSize);
          handleClose('delete');
          message.success(t('finance.expenses.expenseDeletedSuccessfully'));
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
              : t('finance.expenses.deleteExpenseError')
          }`
        );
      });
  };

  const onHandleStatus = (data, type) => {
    setTableLoader(true);
    const formatted_data = {
      status: `${type}`,
      _id: data?._id,
    }
    apiServices("PUT", "expenses", formatted_data, user_state)
    .then((res) => {
        if (res?.data?.success === true) {
        message.success(t('finance.expenses.statusUpdatedSuccessfully'))
        handleClose('update');
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
            : t('finance.expenses.updateStatusInfoError')
        }!`
        );
    });
  }

const handleClose = (type) => {
  if(type === 'update'){
    setOpen({
      isAddOpen: false,
      isDelOpen: false,
      data: ''
    });
    form2.resetFields();
    getAllExpenses(filterValues, currentPage, pageSize)
  }else if(type === 'delete'){
    setOpen({
      isAddOpen: false,
      isDelOpen: false,
      data: ''
    });
  }else{
    setOpen({
      isAddOpen: false,
      isDelOpen: false,
      data: ''
    });
    form2.resetFields(); 
  }
};

const searchHandler = (val, type) => {
  let dropdownValues = []
  if (type === 'employee'){
    allEmployees.forEach((emp)=>{
      dropdownValues.push(emp.fullName.toLowerCase())
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

const formatDate = (inputDate) => {
  if(inputDate){
    const date = new Date(inputDate);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();

    const formattedDate = `${day} ${month} ${year}`;
    return formattedDate;
  }
}
  
    const columns = [
           
      {
        title: t('finance.Invoices.item'),
        dataIndex: 'itemName',
        fixed: 'left',
        render: (text, record) => (            
        <strong>{text}</strong>
          ),
      },     
      {
        title: t('finance.expenses.category'),
        dataIndex: 'category',
        render: (text, record) => (
          <label>{record?.category?.expenseCategoryName}</label>
            ),
      },     
      {
        title: t('finance.expenses.purchaseFrom'),
        dataIndex: 'purchaseFrom',
        render: (text, record) => (
          <label>{text}</label>
            ),
      },     
      {
        title: t('finance.expenses.purchaseDate'),
        dataIndex: 'purchaseDate',
        render: (text, record) => (
          <label>{formatDate(text || '')}</label>
            ),
      },
      {
        title: t('finance.expenses.purchasedBy'),
        dataIndex: 'purchasedBy',
        render: (text, record) => (            
            <h2 className="table-avatar">
              <a href='javascript:void(0)' className="avatar"><img alt="" src={record?.purchasedBy?.imageUrl || user_icon} /></a>
              <a href='javascript:void(0)'><label>{record?.purchasedBy?.fullName}</label></a>
              {/* <Link to="/app/profile/employee-profile" className="avatar"><img alt="" src={record.image} /></Link>
              <Link to="/app/profile/employee-profile">{text} <span>{record.role}</span></Link> */}
            </h2>
          ),
      },      
      {
        title: t('finance.Invoices.amount'),
        dataIndex: 'amount',
        render: (text, record) => (
        <label>{text?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {record?.currency}</label>
          ),
      },

      {
        title: t('finance.expenses.paidBy'),
        dataIndex: 'paidBy',
        render: (text, record) => (
          <label>{text==="Cash" ? t('cash') : text==="Cheque" ? t('cheque') : text==="Bank Transfer" ? t('bankTransfer') : '-'}</label>
            ),
      },  
      // {
      //   title: 'Status',
      //   dataIndex: 'status',
      //   render: (text, record) => (
      //     <div className="dropdown action-label">
      //         <a className="btn btn-white btn-sm btn-rounded dropdown-toggle" href="javascript:void(0)" data-bs-toggle="dropdown" aria-expanded="false">
      //           <i className={text==="Pending" ?"fa fa-dot-circle-o text-warning" : "fa fa-dot-circle-o text-success"} /> {text}
      //         </a>
      //         <div className="dropdown-menu">
      //           {/* style={{cursor: 'default', background: '#FF9B44', color: 'white'}} */}
      //           <a className="dropdown-item" href="javascript:void(0)" onClick={() => text !== 'Approved' ? onHandleStatus(record, 'Approved') : ''} style={text === 'Approved' ? {cursor: 'default', background: '#FF9B44', color: 'white'} : {}}><i className="fa fa-dot-circle-o text-success" /> Approved</a>
      //           <a className="dropdown-item" href="javascript:void(0)" onClick={() => text !== 'Pending' ? onHandleStatus(record, 'Pending') : ''} style={text === 'Pending' ? {cursor: 'default', background: '#FF9B44', color: 'white'} : {}}><i className="fa fa-dot-circle-o text-warning" /> Pending</a>
      //         </div>
      //     </div>
      //     ),
      // },
      {
        title: t('allEmp.action'),
        render: (text, record) => (
            <div className="dropdown dropdown-action text-end">
                  <a href="#" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
                      <div className="dropdown-menu dropdown-menu-right">
                        <a className="dropdown-item" href='javascript:void(0)' onClick={() => { setOpen({ isAddOpen: true, data: record }); }}><i className="fa fa-pencil m-r-5" /> {t('edit')}</a>
                        <a className="dropdown-item" href='javascript:void(0)' onClick={() => { setOpen({ isDelOpen: true, data: record }); }}><i className="fa fa-trash-o m-r-5" /> {t('delete')}</a>
                      </div>
            </div>
          ),
      },
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
              {t('finance.Profit&loss.noRecordFound')}
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

  const handleFromDateChange = (date) => {
    setFromExpenseDate(date);
  };
  const disabledDate = (current) => {
    // return fromExpenseDate && current < moment(fromExpenseDate).endOf('day');
    return fromExpenseDate && current < moment(fromExpenseDate).startOf('day');
  };

      return (
        <>
        <div className="page-wrapper">
            <Helmet>
                <title>{t('finance.Profit&loss.expenses')} - {t('header.daftarPro')}</title>
                <meta name="description" content="Login page"/>					
            </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">{t('finance.Profit&loss.expenses')}</h3>
                
              </div>
              <div className="col-auto float-end ms-auto">
                <a href="javascript:void(0)" className="btn add-btn" onClick={() => { setOpen({ isAddOpen: true, data: '' }); }}><i className="fa fa-plus" /> {t('finance.expenses.addExpense')}</a>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          {/* Search Filter */}
          <Form
            form={form}
            onFinish={onFilterFinish}
            autoComplete='off'
          >
          <div className="row filter-row">
            <div className="col-sm-6 col-md-2">  
              <div className=' form-groupfilterDateMonth'>
                  <Form.Item
                    name="itemName"
                    className="custom-border"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (/\s{2,}/.test(value)) {
                            return Promise.reject("please remove consecutive spaces");
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input className='form-control' style={{height:'50px'}} placeholder={t('finance.expenses.itemName')} />
                  </Form.Item>
              </div>
            </div>
            <div className="col-sm-6 col-md-2" style={{paddingLeft: '0px'}}>  
              <div style={{ position: 'relative' }} id='area11'>
                <Form.Item
                  name="purchasedBy"
                  className="custom-border"
                >
                  <Select
                    showSearch
                    onSearch={(val) => {
                      searchHandler(val, 'employee')
                    }}
                    filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    optionFilterProp="children"
                    notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                      </>
                    )}
                    className="custom-select searchCenter"
                    style={{
                      width: '100%',
                    }}
                    placeholder={t('finance.expenses.purchasedBy')}
                    size='large'
                    getPopupContainer={() => document.getElementById('area11')}
                  >
                    {
                      allEmployees?.map((emp, index) => {
                      return (
                          <Option key={index} value={emp?._id}>{emp?.fullName}</Option>
                      )
                      })
                    }
                  </Select>
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6 col-md-2" style={{paddingLeft: '0px'}}>
              <div style={{ position: 'relative' }} id='area11'>
                <Form.Item
                  name="paidBy"
                  className="custom-border"
                >
                  <Select
                    className="custom-select"
                    style={{
                      width: '100%',
                    }}
                    placeholder={t('finance.expenses.paidBy')}
                    size='large'
                    getPopupContainer={() => document.getElementById('area11')}
                    options={[
                      {
                        value: 'Cash',
                        label: t('cash'),
                      },
                      {
                        value: 'Cheque',
                        label: t('cheque'),
                      },
                      {
                        value: 'Bank Transfer',
                        label: t('bankTransfer'),
                      },
                    ]}
                  />
                </Form.Item>
              </div>  
            </div>
            <div className="col-sm-6 col-md-2" style={{paddingLeft: '0px'}}>  
              <div className=' form-group filterDateMonth' style={{ position: 'relative' }} id='area11'>
                  <Form.Item
                    name="purchaseFrom"
                    className="custom-border"
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(rule, value) {
                          if ( !value && getFieldValue("purchaseTo")) {
                            return Promise.reject(
                              "please select date"
                              );
                            }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <DatePicker 
                      allowClear={false}
                      size='large'
                      placeholder={t('finance.Invoices.from')}
                      className='form-control filterDate'
                      style={{minHeight: '50px', display: 'flex'}} 
                      getPopupContainer={() => document.getElementById('area11')}
                      onChange={e => {
                        handleFromDateChange(e);
                        if(e === null || e){
                          form.setFieldsValue({ toDate: '' });
                        }}}
                    />
                  </Form.Item>
              </div>
            </div>
            <div className="col-sm-6 col-md-2" style={{paddingLeft: '0px'}}>
            <div className=' form-group filterDateMonth' style={{ position: 'relative' }} id='area11'>
              <Form.Item
                name="purchaseTo"
                className="custom-border"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(rule, value) {
                      if ( !value && getFieldValue("purchaseFrom")) {
                        return Promise.reject(
                          "please select date"
                          );
                        }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <DatePicker 
                  allowClear={false}
                  size='large'
                  placeholder={t('finance.Invoices.to')}
                  className='form-control filterDate'
                  style={{minHeight: '50px', display: 'flex'}} 
                  getPopupContainer={() => document.getElementById('area11')}
                  disabledDate={disabledDate}
                />
              </Form.Item>
              </div>
            </div>
            <div className="col-sm-6 col-md-2" style={{paddingLeft: '0px', display: 'flex', gap: '5px'}}>  
              <button 
                href="javascript:void(0)"
                type="submit"
                className="btn btn-success btn-block w-50"
                // disabled={role === 'admin' ? false : permissions?.viewAllUsers ? false : true}
                style={{marginBottom: '24px', paddingInline: '10px'}}
              > 
                {t('search')}
              </button>
              <button
                href="javascript:void(0)" type="reset"
                onClick={() => {
                  form.resetFields();
                  getAllExpenses('', 1, pageSize);
                  setFilterValues(null);
                  setCurrentPage(1)
                  setFromExpenseDate('')
                }}
                className="btn btn-success btn-block w-50 resetButton" style={{marginBottom: '24px', backgroundColor: '#616161', color: 'white', borderColor: '#aeaeae'}} 
                // disabled={role === 'admin' ? false : permissions?.viewAllUsers ? false : true}
              >
                {t('reset')} 
              </button>  
            </div>
          </div>
          </Form>
          {/* /Search Filter */}
          <div className="row">
            <div className="col-md-12">
              <div className="table-responsive expenseTable">
               <Table
                  loading={tableLoader}
                  className={allExpenses?.length > 0 ? "table-striped" : ""}
                  locale={{
                    emptyText: tableLoader ? null : customEmptyText,
                  }}
                  pagination={false}
                  style = {{overflowX : 'auto', paddingBottom: '70px'}}
                  columns={columns}                 
                  // bordered
                  dataSource={allExpenses}
                  rowKey={record => record.id}
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
                {
                    allExpenses?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        total={paginationDetail?.totalDocs}
                        pageSize={pageSize}
                        defaultCurrent={1}
                        current={currentPage}
                        showTotal={(total, range) =>
                          t('paginationShow', { range1: range[0], range2: range[1], total: total })}
                        onChange={(page, size) => {
                          setPageSize(size); setCurrentPage(page);
                          getAllExpenses(filterValues, page, size)
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
        {/* /Page Content */}

        {/* Expense Modal */}
        {
          open?.isAddOpen &&
          <ExpenseModal
            form={form2}
            open={open}
            handleClose={handleClose}
            user_state={user_state}
            allExpenses={allExpenses}
            setAllExpenses={setAllExpenses}
            setPaginationDetail={setPaginationDetail}
            paginationDetail={paginationDetail}
            allEmployees={allEmployees}
          />
        }
        {/* /Expense Modal */}

        {/* Delete Expense Modal */}
        <Modal
          open={open.isDelOpen}
          onClose={() => handleClose('delete')}
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
                  <h3 style={{ marginBottom: "30px" }}>{t('finance.expenses.deleteExpense')}</h3>
                  <p>
                  <span dangerouslySetInnerHTML={{ __html: t('projectScreen.confirmDeleteProject', { project: open?.data?.itemName }) }} />
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
                            : t('delete')
                        }
                      </Button>
                    </div>
                    <div className="col-6">
                      <Button
                        onClick={() => handleClose('delete')}
                        className="btn btn-primary submit-btn"
                        style={{width: '100%'}}
                      >
                        {t('cancel')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
        {/* Delete Expense Modal */}
      </div>
        </>
        
      );
   
}

export default Expenses;
