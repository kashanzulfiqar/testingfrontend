import React, {useEffect,useState } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate, useNavigation } from 'react-router-dom';
import { Avatar_01,Avatar_02,Avatar_03,Avatar_04,Avatar_05,Avatar_11, Avatar_12,Avatar_09,
    Avatar_10, Avatar_08,Avatar_13,Avatar_16, user_icon } from "../../../Entryfile/imagepath"
import Offcanvas from '../../../Entryfile/offcanvance';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Empty, Form, Input, Pagination, Select, Spin, message } from 'antd';
import Modal from "@mui/material/Modal";
import favicon from '../../../files/Icons/DaftarProIcon.svg';
import { itemRender } from '../../paginationfunction';
import ProfileInfoModal from '../../Pages/Profile/modals/ProfileInfoModal';
import { apiServices } from '../../../Services/apiServices';
import { LoadingOutlined } from '@ant-design/icons';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";

const AllEmployees = () => {

  const moment = require('moment');
  const [form] = Form.useForm();

  const nav = useNavigate();
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const company_id = user_state?.user?.companyId
  const role = user_state?.user?.role

  const [allDesignations, setAllDesignations] = useState([])
  const [desigInfo, setDesigInfo] = useState({})

  const [open, setOpen] = useState({ isAddOpen: false, isEditOpen: false, data: '' })
  const [tableLoader, setTableLoader] = useState(false)
  const [loader, setLoader] = useState(false)
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationDetail, setPaginationDetail] = useState();
  const [filterValues, setFilterValues] = useState();
  const [users, setUsers] = useState([])

  useEffect(() => {
    if(permissions?.viewAllUsers || permissions?.updateUser || permissions?.updateStatusOfEmployee) {
      getEmployees();
      getAllDesignations();
    }else if(permissions?.viewAllUsers && permissions?.updateUser && permissions?.updateStatusOfEmployee && permissions?.addUser){
      navigate('/restricted', { state: { unAuthorize: true}})
    }
  }, [])


  const getEmployees = (values, current_page, page_size) => {
    setTableLoader(true);
    apiServices("GET", `user/view-user?deleted=false${values === '' ? '' : values?.employeeName === '' ? '' : values?.employeeName ? `&employeeName=${values?.employeeName}` : filterValues?.employeeName ? `&employeeName=${filterValues?.employeeName}` : ''}${values === '' ? '' : values?.employeeId === '' ? '' : values?.employeeId ? `&employeeId=${values?.employeeId}` : filterValues?.employeeId ? `&employeeId=${filterValues?.employeeId}` : ''}${values === '' ? '' : values?.designation === '' ? '' : values?.designation ? `&designation=${values?.designation}` : filterValues?.designation ? `&designation=${filterValues?.designation}` : ''}&page=${current_page ? current_page : currentPage ? currentPage : 1}&limit=${page_size ? page_size : pageSize ? pageSize : 20}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setUsers(res?.data?.users?.docs);
          setPaginationDetail(res?.data?.users)
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
              : "Get All Employees Error"
          }!`
        );
      });
  }
  const getAllDesignations = () => {
    apiServices("GET", "designation", null, user_state)
    .then((res) => {
      if (res?.data?.success === true) {
        setAllDesignations(res?.data?.Designation);
        res?.data?.Designation?.map((desig)=> {
          setDesigInfo((prevDesig) => ({
            ...prevDesig,
            [desig?._id]: desig?.designationName,
          }));
        })
      }
    })
    .catch((err) => {
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : "Get Designation Info Error1"
        }`
      );
    });
  }
  

  const handleClose = () => {
    setOpen({ isAddOpen: false, isEditOpen: false, isDelOpen: false, data: '' });
  };

  const st1 = useSelector((state) => state);
  const [menu, setMenu] = useState(false)

	const toggleMobileMenu = () => {
		setMenu(!menu)
	  }

    useEffect( ()=>{
      if($('.select').length > 0) {
        $('.select').select2({
          minimumResultsForSearch: -1,
          width: '100%'
        });
      }
      console.log('st1======', st1);
    });  


    const onFilterFinish = (values) => {
      for (const key in values) {
        if (values[key]) {
          getEmployees(values, currentPage, pageSize);
          console.log(values);
          setFilterValues(values)
        }
      }
    }

    const onFinishAdd = (values) => {

      const replacer = (key, value) => {
          if (typeof value === 'number') {
              return String(value);
          }else if(value === undefined || value === '' || value === null || !value){
              return ''
          }else if(key === 'dateOfBirth' || key === 'joiningDate'){
              return moment(value).format('YYYY-MM-DD');
          }
          return value;
          };
          const d = JSON.parse(JSON.stringify(values, replacer));
          // Remove keys with empty values
          Object.keys(d).forEach((key) => {
            if (d[key] === '') {
              delete d[key];
            }
          });

          let new_values = {
            ...d,
            companyId: company_id,
          }
          setLoader(true)
          apiServices("POST", "user/add-user", new_values, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            setUsers((prev) => ([
              {
                ...d,
                _id: res?.data?.User?._id,
                companyId: company_id,
              },
              ...prev,
            ]))
            handleClose();
            message.success('Employee Added Successfully!')
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
                : "Add User Info Error"
            }!`
          );
        });
    }

    const onFinishEdit = (values) => {

      const replacer = (key, value) => {
          if (typeof value === 'number') {
              return String(value);
          }else if(value === undefined || value === '' || value === null || !value){
              return ''
          }else if(key === 'dateOfBirth' || key === 'joiningDate'){
              return moment(value).format('YYYY-MM-DD');
          }
          return value;
          };
          const d = JSON.parse(JSON.stringify(values, replacer));
          // Remove keys with empty values
          Object.keys(d).forEach((key) => {
            if (key === 'password' || d[key] === '') {
              delete d[key];
            }
          });
          if(open?.data?._id === user_state?.user?._id){
            localStorage.setItem('updated_user', JSON.stringify({imageUrl: d?.imageUrl, fullName: d?.fullName}))
            nav('/employee/allemployees', {state: {updated_user: {imageUrl: d?.imageUrl, fullName: d?.fullName}}})
          }
          
          let new_values = {
            ...d,
            _id: open?.data?._id,
            companyId: open?.data?.companyId
          }
          setLoader(true)
          apiServices("PUT", "user/update-user", new_values, user_state)
          .then((res) => {
            if (res?.data?.success === true) {
              setUsers(
                users.map((user) => {
                    if (user._id === open?.data?._id) {
                  return {
                    ...user,
                    ...d,
                  };
                } else {
                  return {
                      ...user,
                    };
                  }
                })
              );
              handleClose()
              message.success('Employee Updated Successfully!')
              setLoader(false)
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
                  : "Update Employee Info Error"
              }!`
            );
          });
    }

    const onFinishDelete = (id) => {
      setLoader(true)
      apiServices("DELETE", "user/delete-user", id, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            setUsers([...users.filter((user) => user._id !== id)]);
            handleClose();
            message.success("Employee Deleted Successfully!");
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
                : "Delete Employee Error"
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
              {
                permissions?.viewAllUsers ? 'No Employee Record found!' : 'You are Restricted to View Employees'
              }
            </div>
            {/* <div
              style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
            >
              Click 'Add Employees' Button To Create <br /> A New Employee{" "}
            </div> */}
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

      return (
        <>
        <div className={`main-wrapper ${menu ? 'slide-nav': ''}`}> 
      
      {/* <Header onMenuClick={(value) => toggleMobileMenu()} />
      <Sidebar />  */}
      <div className="page-wrapper">
        <Helmet>
            <title>Employee - DaftarPro</title>
            <meta name="description" content="Login page"/>		
            <link rel="icon" type="image/x-icon" href={favicon} />				
        </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Employee</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>Dashboard</Link></li>
                <li className="breadcrumb-item active">Employee</li>
              </ul>
            </div>
            <div className="col-auto float-end ms-auto">
              {
                permissions?.addUser &&
                  <a href="javascript:void(0)" className="btn add-btn" onClick={() => setOpen({ isAddOpen: true, isEditOpen: false, data: '' })}><i className="fa fa-plus" /> Add Employee</a>
              }
              <div className="view-icons">
                <Link to="/employee/allemployees" className="grid-view btn btn-link active"><i className="fa fa-th" /></Link>
                <Link to="/employee/employees-list" className="list-view btn btn-link"><i className="fa fa-bars" /></Link>
              </div>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        {/* Search Filter */}
        <Form
          form={form}
          onFinish={onFilterFinish}
        >
        <div className="row filter-row">
          <div className="col-sm-6 col-md-3">  
            <div className="form-group">
            <Form.Item
                name="employeeId"
                className="custom-border"
              >
              <Input
                className="form-control"
                style={{height:'50px'}}
                placeholder='Employee ID'
              />
              </Form.Item>
            </div>
          </div>
          <div className="col-sm-6 col-md-3">  
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
          </div>
          <div className="col-sm-6 col-md-3">
          <div style={{ position: 'relative' }} id='area'>
              <Form.Item
                name="designation"
                className="custom-border"
              >
                <Select
                  className="custom-select"
                  style={{
                    width: '100%',
                  }}
                  placeholder='Select Designation'
                  size='large'
                  getPopupContainer={() => document.getElementById('area')}
                >
                  {allDesignations?.map((item, index) => {
                  return (
                      <Option key={index} value={item?._id}>{item?.designationName}</Option>
                  )
                  })}
                </Select>
              </Form.Item>
            </div>
          </div>
          <div className="col-sm-6 col-md-3" style={{display: 'flex', alignItems: 'flex-start', gap: '13px'}}>  
            <button href="javascript:void(0)" type="submit" className="btn btn-success btn-block w-50" disabled={!permissions?.viewAllUsers}> Search </button>  
            <button href="javascript:void(0)" type="reset" onClick={() => { form.resetFields(); getEmployees('', 1, pageSize); setFilterValues(null); setCurrentPage(1)}} className="btn btn-success btn-block w-50" style={{backgroundColor: '#b9b9b9', color: 'white', borderColor: '#aeaeae'}} disabled={!permissions?.viewAllUsers}> Reset </button>  
          </div>
        </div>
        </Form>
        {/* Search Filter */}
        <div className="row staff-grid-row">

        { tableLoader ? <div style={{display: 'flex', justifyContent: 'center', height: '150px', background: '#efefef', alignItems: 'center', borderRadius: '10px'}}> <Spin size='middle' /> </div> :
          users?.length > 0 ? users.map((user, index) => (
            <>
              <div key={index} className="col-md-4 col-sm-6 col-12 col-lg-4 col-xl-3">
                <div className="profile-widget">
                  <div className="profile-img">
                    <Link to="/profile/employee-profile" state={{user_data: user}} className="avatar"><img src={user?.imageUrl ? user?.imageUrl : user_icon} alt="" /></Link>
                  </div>
                  <div className="dropdown profile-action">
                    {
                      (permissions?.updateStatusOfEmployee || permissions?.updateUser) &&
                        <a href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
                    }
                    <div className="dropdown-menu dropdown-menu-right">
                    {
                      permissions?.updateUser &&
                      <a className="dropdown-item" href="javascript:void(0)" onClick={() => setOpen({ isAddOpen: false, isEditOpen: true, data: user })}><i className="fa fa-pencil m-r-5" /> Edit</a>
                    }
                    {
                      permissions?.updateStatusOfEmployee &&
                      <a className="dropdown-item" href="javascript:void(0)" onClick={() => setOpen({ isAddOpen: false, isEditOpen: false, isDelOpen: true, data: user })}><i className="fa fa-trash-o m-r-5" /> Delete</a>
                    }
                    </div>
                  </div>
                  <h4 className="user-name m-t-10 mb-0 text-ellipsis"><Link to="/profile/employee-profile" state={{user_data: user}}>{user?.fullName}</Link></h4>
                  <div className="small text-muted">{desigInfo[user?.designationId]}</div>
                </div>
              </div>
            </>
          )) : customEmptyText
        }

        {
          users?.length > 0 &&
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
                console.log(page, size);
                setPageSize(size); setCurrentPage(page);
                getEmployees(filterValues, page, size)
              }}
              showSizeChanger={true}
              pageSizeOptions={['20', '30', '40', '50']}
              itemRender={itemRender}
            />
          </div>
        }
        </div>
      </div>
      {/* /Page Content */}
      {/* Add Employee Modal */}
     {/* <Addemployee/> */}
     {
        open?.isAddOpen &&
        <ProfileInfoModal
          open={open}
          handleClose={handleClose}
          onFinishAdd={onFinishAdd}
          loader={loader}
        />
      }
      {/* /Add Employee Modal */}
      {/* Edit Employee Modal */}
        {/* <Editemployee/> */}
        {
          open?.isEditOpen &&
          <ProfileInfoModal
            open={open}
            handleClose={handleClose}
            user_data={open?.data}
            onFinishEdit={onFinishEdit}
            loader={loader}
          />
        }
      {/* /Edit Employee Modal */}
      {/* Delete Employee Modal */}
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
                <h3 style={{ marginBottom: "30px" }}>Delete Employee</h3>
                <p>
                  Are you sure you want to delete{" "}
                  <b>{open?.data?.fullName}</b>?
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
                          : 'Delete'
                      }
                    </Button>
                  </div>
                  <div className="col-6">
                    <Button
                      onClick={handleClose}
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
      {/* /Delete Employee Modal */}
    </div>
  </div>
        {/* <Offcanvas/> */}
        </> 
    
        );
  }

export default AllEmployees;
