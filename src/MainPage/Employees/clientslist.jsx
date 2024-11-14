
import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';
import { user_icon } from "../../Entryfile/imagepath"
import { Button, Empty, Form, Input, Pagination, Select, Spin, Table, message } from 'antd';
import EmptyTable from "../../files/Icons/EmptyTable.svg";
import { LoadingOutlined } from '@ant-design/icons';
import AddClientModal from '../Pages/Profile/modals/AddClientModal';
import { useSelector } from 'react-redux';
import Modal from "@mui/material/Modal";
import { itemRender } from '../paginationfunction';
import 'antd/dist/antd.css';
import "../antdstyle.css"
import { apiServices } from '../../Services/apiServices';
import { getAllISOCodes } from 'iso-country-currency';
import { useTranslation } from 'react-i18next';


const ClientsList = () => {
  const { t, i18n } = useTranslation()
  const [form1] = Form.useForm();
  const nav = useNavigate();

  const permissions = useSelector((state) => state?.permissionsSlice?.data);

  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role

  const [allClients, setAllClients] = useState([])
  const [tableLoader, setTableLoader] = useState(true)
  const [loader, setLoader] = useState(false)
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationDetail, setPaginationDetail] = useState();
  const [filterValues, setFilterValues] = useState();
  const [open, setOpen] = useState({
    isAddOpen: false,
    data: ''
  });
  const [allCountries, setAllCountries] = useState([]);
  const [filters, setFilters] = useState({
    clientName: "",
    country: "",
  });

  const [selectedFilters, setSelectedFilters] = useState({
    clientName: "",
    country: "",
  });

  const handleFilterChange = (value, filterType) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value,
    });
  };

  useEffect(() => {
    getAllCountries();
    if(role === 'admin' || permissions?.clientManagement) {
      getAllClients()
    }else{
      nav(`${role === 'client' ? '/client/client-profile' : role === 'focalperson' ? `/client/focal-profile` : role === 'admin' ? `/main/dashboard` : `/employee/dashboard`}`)
    }
    }, [])

    const getAllClients = (values, current_page, page_size) => {
      setTableLoader(true);
      apiServices("GET", `client/view-client?deleted=false${values === '' ? '' : values?.clientName === '' ? '' : values?.clientName ? `&clientName=${values?.clientName}` : filterValues?.clientName ? `&clientName=${filterValues?.clientName}` : ''}${values === '' ? '' : values?.country === '' ? '' : values?.country ? `&country=${values?.country}` : filterValues?.country ? `&country=${filterValues?.country}` : ''}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            setAllClients(res?.data?.clients?.docs);
            setPaginationDetail(res?.data?.clients)
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
                : t('aDash.errors.getAllClientsError')
            }!`
          );
        });
    }
  
    const onFinishDelete = (id) => {
      setLoader(true)
      apiServices("DELETE", "client/delete-client", id, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            getAllClients(filterValues, currentPage, pageSize);
            // setAllClients([...allClients.filter((client) => client._id !== id)]);
            // setPaginationDetail({
            //   ...paginationDetail,
            //   total: paginationDetail?.total - 1
            // })
            setOpen({ isDelOpen: false, data: '' })
            message.success(t('client.clientDeletedSuccess'));
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
                : t('client.clientDeleteError')
            }!`
          );
        });
    }
  
    const onFilterFinish = () => {
      setFilters(selectedFilters);
      setCurrentPage(1);
      getAllClients(selectedFilters, currentPage, pageSize)
  }
  
  
  const columns = [
      
    {
      title: t('aDash.name'),
      // dataIndex: 'name',
      fixed: 'left',
      width: 120,
      render: (text, record) => (            
          <h2 className="table-avatar">
            <Link to="/client/client-profile" state={{client_data: record}} onClick={() => sessionStorage.setItem(`clients_tab`, 'projects')} className="avatar"><img alt="" src={record?.logo || user_icon} /></Link>
            <Link to="/client/client-profile" state={{client_data: record}} onClick={() => sessionStorage.setItem(`clients_tab`, 'projects')}>{record?.clientName}</Link>
          </h2>
        ),
    },
    {
      title: t('client.email'),
      dataIndex: 'clientEmail',
      width: 130,
    },
    {
      title: t('client.phoneNo'),
      dataIndex: 'clientPhoneNo',
      width: 130,
    },
    {
      title: t('client.country'),
      dataIndex: 'country',
      width: 130,
    },
    {
      title: t('client.invoiceEmail'),
      dataIndex: 'invoiceEmail',
      width: 130,
    },
    {
      title: t('allEmp.Modal.address'),
      dataIndex: 'headOfficeAddress',
      width: 130,
      render: (text,record) => (
        <label
          // className='longText'
          style={{textWrap: 'nowrap'}}
        >
          {text}
        </label>
      )
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'status',
    //   render: (text, record) => (
    //     <div className="dropdown">
    //         <a href="#" className="btn btn-white btn-sm btn-rounded dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
    //           <i className={text==="Active" ? "fa fa-dot-circle-o text-success" : "fa fa-dot-circle-o text-danger"} /> {text} </a>
    //         <div className="dropdown-menu">
    //           <a className="dropdown-item" href="#"><i className="fa fa-dot-circle-o text-success" /> Active</a>
    //           <a className="dropdown-item" href="#"><i className="fa fa-dot-circle-o text-danger" /> Inactive</a>
    //         </div>
    //   </div>
    //     ),
    // },
    {
      title: t('holiday.actions'),
      render: (text, record) => (
          <div className="dropdown dropdown-action text-end">
            <a href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
            <div className="dropdown-menu dropdown-menu-right">
              <a className="dropdown-item" href="javascript:void(0)" onClick={() => { setOpen({ isAddOpen: true, data: record }); getAllCountries() }}><i className="fa fa-pencil m-r-5" /> {t('edit')}</a>
              <a className="dropdown-item" href="javascript:void(0)" onClick={() => { setOpen({ isDelOpen: true, data: record }) }}><i className="fa fa-trash-o m-r-5" /> {t('delete')}</a>
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
            {t('client.noClientRecordFound')}
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

const getAllCountries = () => {
  const isoCodes = getAllISOCodes();
  const sorted_data = isoCodes.sort((a, b) => a.countryName.localeCompare(b.countryName));
  setAllCountries(sorted_data)
};
      return ( 
         <div className="page-wrapper">
         <Helmet>
             <title>{t('client.clientsList')} - {t('header.daftarPro')}</title>
             <meta name="description" content="Login page"/>					
         </Helmet>
         {/* Page Content */}
         <div className="content container-fluid">
           {/* Page Header */}
           <div className="page-header">
             <div className="row align-items-center">
               <div className="col">
                 <h3 className="page-title">{t('client.clientsList')}</h3>
                 
               </div>
               <div className="col-auto float-end ms-auto">
                 <a href="javascript:void(0)" className="btn add-btn" onClick={() => { setOpen({ isAddOpen: true, data: '' }); getAllCountries() }}><i className="fa fa-plus" /> {t('client.addClient')}</a>
                 <div className="view-icons">
                   <Link to="/clients" className="grid-view btn btn-link"><i className="fa fa-th" /></Link>
                   <Link to="/clients-list" className="list-view btn btn-link active"><i className="fa fa-bars" /></Link>
                 </div>
               </div>
             </div>
           </div>
           {/* /Page Header */}
           {/* Search Filter */}
           <Form
              form={form1}
              onFinish={onFilterFinish}
              autoComplete='off'
            >
            <div className="row filter-row">
              <div className="col-sm-3 col-md-3">  
                <div className="form-group">
                <Form.Item
                    name="clientName"
                    className="custom-border"
                  >
                  <Input
                    className="form-control"
                    style={{height:'50px'}}
                    placeholder={t('projectScreen.clientName')}
                    onChange={(e) =>
                      handleFilterChange(e.target.value, "clientName")
                    }
                  />
                  </Form.Item>
                </div>
              </div>
              <div className="col-sm-3 col-md-3">  
                <div className="form-group">
                  <Form.Item 
                    name="country"
                    className="custom-border"
                  >
                    <Select
                      onChange={(value) => {
                        handleFilterChange(value, "country");
                      }} // Handle changes
                      style={{height:'50px'}}
                      className='custom-select searchCenter'
                      placeholder={t('client.selectCountry')}
                      // options={allCountries.map((country) => ({
                      //   label: country.countryName,
                      //   value: country.countryCode
                      // }))}
                    >
                      {allCountries?.map((country) => (
                                <Select.Option
                                  key={country.countryCode}
                                  value={country.countryName}
                                >
                                  {country.countryName}
                                </Select.Option>
                              ))}
                    </Select>
                  </Form.Item>
                </div>
              </div>
              <div className="col-sm-3 col-md-3">  
                <button href="javascript:void(0)" type="submit" className="btn btn-success btn-block w-100" style={{marginBottom: '24px'}}> {t('search')}</button>  
              </div>
              <div className="col-sm-3 col-md-3">  
                <button 
                  href="javascript:void(0)" type="reset"
                  className="btn btn-success btn-block w-100"
                  style={{backgroundColor: '#616161', color: 'white', borderColor: '#aeaeae'}}
                  onClick={() => { form1.resetFields(); getAllClients('', 1, pageSize); setFilterValues(null); setCurrentPage(1)}}
                  // disabled={role === 'admin' ? false : permissions?.viewAllUsers ? false : true}
                >
                  {t('reset')}
                </button>  
              </div>
            </div>
            </Form>
           {/* Search Filter */}
           <div className="row">
             <div className="col-md-12">
               <div className="table-responsive clientTable">
                  <Table
                    loading={tableLoader}
                    className={allClients?.length > 0 ? "table-striped" : ""}
                    locale={{
                      emptyText: tableLoader ? null : customEmptyText,
                    }}
                    style = {{overflowX : 'auto', height: `${allClients?.length > 0 ? "485px" : "384px"}`}}
                    pagination={false}
                    columns={columns}       
                    // bordered
                    dataSource={allClients}
                    rowKey={record => record.id}
                    onChange={console.log("change")}
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
                    allClients?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        total={paginationDetail?.total}
                        pageSize={pageSize}
                        defaultCurrent={1}
                        current={currentPage}
                        showTotal={(total, range) =>
                          t('paginationShow', { range1: range[0], range2: range[1], total: total })}
                        onChange={(page, size) => {
                          console.log(page, size);
                          setPageSize(size); setCurrentPage(page);
                          getAllClients(filterValues, page, size)
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
        {/* Add Client Modal */}
        {
          open?.isAddOpen &&
          <AddClientModal
            open={open}
            setOpen={setOpen}
            user_state={user_state}
            allClients={allClients}
            setAllClients={setAllClients}
            setPaginationDetail={setPaginationDetail}
            paginationDetail={paginationDetail}
            allCountries={allCountries}
          />
        }
        {/* /Add Client Modal */}


         {/* Delete Client Modal */}
          <Modal
            open={open.isDelOpen}
            onClose={() => { setOpen({ isDelOpen: false, data: '' }) }}
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
                    <h3 style={{ marginBottom: "30px" }}>{t('client.deleteClient')}</h3>
                    <p>
                    <span dangerouslySetInnerHTML={{ __html: t('projectScreen.confirmDeleteProject', { project: open?.data?.clientName }) }} />
                    </p>
                  </div>
                  <div className="modal-btn delete-action">
                    <div className="row">
                      <div className="col-6">
                        <Button
                          htmlType="submit"
                          className="btn btn-primary continue-btn"
                          onClick={() => onFinishDelete(open?.data?._id)}
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
                          onClick={() => { setOpen({ isDelOpen: false, data: '' }) }}
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
         {/* /Delete Client Modal */}
       </div>
      );
  }

export default ClientsList;
