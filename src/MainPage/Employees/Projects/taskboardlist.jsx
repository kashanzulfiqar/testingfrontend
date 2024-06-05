import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Table,
  Select,
  DatePicker,
  message,
  Button,
  Spin,
  Empty,
  Pagination,
} from "antd";
import Modal from "@mui/material/Modal";
import "antd/dist/antd.css";
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "../../antdstyle.css";
import Sidebar from "../../../initialpage/Sidebar/sidebar";
import Offcanvas from "../../../Entryfile/offcanvance";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import { LoadingOutlined } from "@ant-design/icons";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { useTranslation } from "react-i18next";

const TaskBoardList = () => {
  const { t, i18n } = useTranslation();
  const [menu, setMenu] = useState(false);

  const moment = require("moment");
  const [form] = Form.useForm();
  const nav = useNavigate();
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const company_id = user_state?.user?.companyId;
  const role = user_state?.user?.role;
  const [allProjects, setAllProjects] = useState([]);
  const employee_id = user_state?.user?._id;
  const [categoryObj, setCategoryObj] = useState();
  const [loader, setLoader] = useState(false);
  const [holidayObj, setHolidayObj] = useState();
  const [tableData, setTableData] = useState([]);
  const [holidays, setHolidays] = useState([]);


  const [open, setOpen] = useState({
    isAddOpen: false,
    isEditOpen: false,
    data: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 10,
  });

  useEffect(() => {
    if ($(".select").length > 0) {
      $(".select").select2({
        minimumResultsForSearch: -1,
        width: "100%",
      });
    }
  });

  const [filters, setFilters] = useState({
    projectName: "",
    clientName: "",
    projectDomain: "",
    costType: "",
  });

  const [selectedFilters, setSelectedFilters] = useState({
    projectName: "",
    clientName: "",
    projectDomain: "",
    costType: "",
  });

  const handleFilterChange = (value, filterType) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value,
    });
  };

  const handleSearch = () => {
    setFilters(selectedFilters);
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  const handleReset = () => {
    setSelectedFilters({
      projectName: "",
      clientName: "",
      projectDomain: "",
      costType: "",
    });
    setFilters({
      projectName: "",
      clientName: "",
      projectDomain: "",
      costType: "",
    });

    form.resetFields();
    setPagination({
      current: 1,
      pageSize: 20,
      total: 0,
    });

  };

  useEffect(() => {
    setIsLoading(true);
    GetListProjects();
  }, [pagination.current, pagination.pageSize]);

  const searchHandler = (val, type) => {
    let dropdownValues = []
    if (type === 'project'){
      allProjects.forEach((proj)=>{
        dropdownValues.push(proj.projectName.toLowerCase())
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

  const getProjects = (page, pageSize) => {
    //setLoader(true);

    apiServices(
      "GET",
      // `project-management/?clientName=${filters.clientName}&projectName=${filters.projectName}&page=${params.page}&limit=${params.limit}`,
      `project-management/?taskBoard=false&employeeId=${(role === '' && !permissions?.projectManagement) ? employee_id : ''}&page=1&limit=999999`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          //setCategoryObj(res?.data?.projects);
          const sortedData = res?.data?.projects?.docs?.slice().sort((a, b) => a.projectName.localeCompare(b.projectName));
          setAllProjects(sortedData);
          setIsLoading(false);          
      }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('projectScreen.errors.getEmployeeProjectsError')
          }`
        );
        setIsLoading(false);
      })
  };

  const GetListProjects = (page, pageSize) => {
    //setLoader(true);

    const params = {
      ...filters,
      page: page || pagination.current,
      limit: pageSize ? pageSize : pagination.pageSize,
    };

    apiServices(
      "GET",
      // `project-management/?clientName=${filters.clientName}&projectName=${filters.projectName}&page=${params.page}&limit=${params.limit}`,
      `project-management/?taskBoard=true&projectName=${filters.projectName}&employeeId=${(role === '' && !permissions?.projectManagement) ? employee_id : ''}&page=${params.page}&limit=${params.limit}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          setCategoryObj(res?.data?.projects);
          setTableData(res?.data?.projects?.docs);
 
          setIsLoading(false);
          // setPagination({
          //   ...pagination,
          //   total: res.data.projects.totalDocs,
          // });
          //setFlag(true);
          setPagination({
            ...pagination,
            current : res.data.projects.page,
            total: res.data.projects.totalDocs,
          });
          setPage(parseInt(res?.data?.projects?.page, 10));
          setSize(parseInt(res?.data?.projects?.limit, 10));
      }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('projectScreen.errors.getEmployeeProjectsError')
          }`
        );
        setIsLoading(false);
      })
  };

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
    setLoader(false);
  };

  const onFinish = (values, info) => {
    let updated_data = {
      ...values,
      companyId: info?.companyId,
    }
    setLoader(true);
    apiServices("POST", "taskBoard/add-taskBoard", updated_data, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          handleClose();
          GetListProjects();
          message.success('Task board added successfully');
          setLoader(false);
        }
      })
      .catch((err) => {
        setLoader(false);
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : 'Error adding taskboard'
          }!`
        );
      });

  };

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) =>
        (page - 1) * size + index + 1,
    },
    {
      title: t('Project Name'),
      dataIndex: "projectName",
      key: "projectName",
      render: (text, record) => (
        <a
        onClick={() => nav(`/task-board/${record?._id}`, { state: record})} 
      >
        <label style={{cursor: 'pointer'}}>{text}</label>
      </a>
      ),
    },
    // {
    //   title: t('holiday.date'),
    //   dataIndex: "holidayDate",
    //   key: "holidayDate",
    //   render: (text) => moment(text).format("D MMM YYYY"),
    // },
    // {
    //   title: t('holiday.day'),
    //   dataIndex: "holidayDate",
    //   key: "holidayDate",
    //   render: (text) => moment(text).format("dddd"),
    // },
    {
      title: t('holiday.actions'),
      render: (record, row) => (
        <div className="dropdown dropdown-action text-end">
          <a
            href="javascript:void(0)"
            // className="action-icon dropdown-toggle"
            // data-bs-toggle="dropdown"
            // aria-expanded="false"
            className={`action-icon dropdown-toggle ${role === "admin" || permissions.projectManagement ? '' : 'disabled'}`}
            style={{ cursor: (role == "admin" || permissions.projectManagement) ? "pointer" : "not-allowed" }}
            data-bs-toggle={(role === "admin" || permissions.projectManagement) ? 'dropdown' : ''}
            aria-expanded={(role === "admin" || permissions.projectManagement) ? 'true' : 'false'}
          >
            <i className="material-icons">more_vert</i>
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            <a
              className="dropdown-item"
              href="javascript:void(0)"
              onClick={() => {
                setOpen({
                  isAddOpen: false,
                  isDelOpen: true,
                  data: row,
                });
              }}
            >
              <i className="fa fa-trash-o m-r-5" /> {t('holiday.delete')}
            </a>
          </div>
        </div>
      ),
    },
  ];

  const onHandleDelete = (id) => {
    setLoader(true);
    apiServices("DELETE", "taskBoard/delete-taskBoard", id, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          handleClose();
          message.success('Task board deleted successfully');
          if(categoryObj?.docs?.length === 1){
            //console.log(categoryObj.totalPages)
            GetListProjects((categoryObj.totalPages-1),null);
          }
          else{
            GetListProjects()
          }
          //setTableData(prevtable => prevtable.filter(proj=> proj._id !== id));
          //viewCategory();
          setLoader(false);
        }
      })
      .catch((err) => {
        setLoader(false);
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : 'Error deleting taskboard'
          }!`
        );
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
          >No TaskBoards found
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

  // const handlePageChange = (page, pageSize) => {
  //   // Update the pagination state
  //   setPagination({
  //     ...pagination,
  //     current: page,
  //     pageSize: pageSize,
  //   });
  //   setIsLoading(true);
  //   GetListProjects(page, pageSize);
  // };

  const toggleMobileMenu = () => {
    setMenu(!menu);
  };

  return (
    <>
      <div className={`main-wrapper ${menu ? "slide-nav" : ""}`}>
        {/* <Header onMenuClick={(value) => toggleMobileMenu()} /> */}
        {/* <Sidebar /> */}
        <div className="page-wrapper">
          <Helmet>
            <title>{t('Task Boards - DaftarPro')}</title>
            <meta name="description" content="Login page" />
          </Helmet>
          {/* Page Content */}
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">{t('Task Boards')}</h3>
                  <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link
                      to={
                        role === "admin"
                          ? "/main/dashboard"
                          : "/employee/dashboard"
                      }
                    >
                      {t('holiday.dashboard')}
                    </Link>
                  </li>
                    <li className="breadcrumb-item active">{t('Task Boards')}</li>
                  </ul>
                </div>
                {(role === "admin" || permissions?.projectManagement) && (<div className="col-auto float-end ms-auto">
                  <a
                    href="javascript:void(0)"
                    className="btn add-btn"
                    onClick={() => {
                      getProjects();
                      setOpen({
                        isAddOpen: true,
                        isDelOpen: false,
                        data: "",
                      });
                    }}
                  >
                    <i className="fa fa-plus" /> {t('Add TaskBoard')}
                  </a>
                </div>)}
              </div>
            </div>
            {/* /Page Header */}
            <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              <Table
                loading={isLoading}
                className={
                  tableData?.length > 0 ? "table-striped" : ""
                }
                locale={{
                    emptyText: isLoading ? null : customEmptyText,
                  }}
                pagination={false}
                // pagination={{
                //   current: pagination.current,
                //   pageSize: pagination.pageSize,
                //   total: pagination.total,
                //   showTotal: (total, range) =>
                //     `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                //   pageSizeOptions: ["10", "20", "40", "50"], // Options to change page size
                //   showSizeChanger: true, // Show the page size changer
                //   onChange: (page, pageSize) => {
                //     setPagination({
                //       ...pagination,
                //       current: page,
                //       pageSize: pageSize,
                //     });
                //     setIsLoading(true);
                //     getHolidays(page, pageSize)
                //   },
                //   itemRender: itemRender,
                // }}
                style = {{overflowX : 'auto', paddingBottom: '70px'}}
                columns={columns}
                bordered
                dataSource={tableData}
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
            {
                    tableData?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showTotal={(total, range) =>
                          t('paginationShow', { range1: range[0], range2: range[1], total: total })
                        }
                        pageSizeOptions={["20", "30", "40", "50"]}
                        showSizeChanger
                        onChange={(page, pageSize) => setPagination({...pagination, current: page, pageSize: pageSize,})}
                        itemRender={(current, type, originalElement) =>
                          itemRender(current, type, originalElement, t)
                        }
                        disabled={isLoading}
                      />
                    </div>
                  }
          </div>
        </div>
          </div>

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
                Add Task Board
              </h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                // form={form}
                name="control-hooks"
                onFinish={(val) => onFinish(val, open?.data)}
                onFinishFailed={({errorFields}) => {
                  const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                  if(consecutiveSpacesError){
                    message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                 }else{
                    message.error(t('allEmp.errors.fillRequiredFields'))
                  } 
                }}
                initialValues={{
                  holidayTitle: open?.data ? open?.data?.holidayTitle : "",
                  holidayDate: open?.data ? moment(open?.data.holidayDate, "YYYY-MM-DD") : "",
                }}
                autoComplete="off"
              >
                <div className="form-group">
                        <label>
                        {t('Tasks.project')} <span className="text-danger">*</span>
                        </label>
                        <div style={{ position: "relative" }} id="area">
                        <Form.Item
                            name='projectId'
                            className='custom-border'
                            rules={[
                            {
                                whitespace: true,
                                required: true,
                                message: t('Tasks.pleaseselectproject'),
                            },
                            ]}
                        >
                                <Select
                                    showSearch
                                    onSearch={(val) => {
                                      searchHandler(val, 'project')
                                    }}
                                    filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    optionFilterProp="children"
                                    notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                    dropdownRender={(menu) => (
                                      <>
                                        {menu}
                                      </>
                                    )}
                                    className="custom-select custom-normal"
                                    getPopupContainer={() =>
                                        document.getElementById("area")
                                    }
                                    placeholder={t('Tasks.selectproject')}
                                    >
                                    {
                                        allProjects.map((project, index) => (
                                        <Select.Option key={index} value={project._id}>
                                            {project.projectName}
                                        </Select.Option>
                                        ))
                                    }
                                </Select>
                        </Form.Item>
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
                <h3 style={{ marginBottom: "30px" }}>Delete TaskBoard</h3>
                <p>
                  <span dangerouslySetInnerHTML={{ __html: t('holiday.confirmDelete', { holiday: open?.data?.projectName }) }} />
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
                      style={{ width: "100%" }}
                    >
                      {loader ? (
                        <Spin size="small" indicator={antIcon} />
                      ) : (
                        t('delete')
                      )}
                    </Button>
                  </div>
                  <div className="col-6">
                    <Button
                      onClick={handleClose}
                      className="btn btn-primary submit-btn"
                      style={{ width: "100%" }}
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

        </div>
      </div>
      <Offcanvas />
    </>
  );
};

export default TaskBoardList;
