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

const Holidays = () => {
  const { t, i18n } = useTranslation();
  const [menu, setMenu] = useState(false);

  const navigate = useNavigate();
  const moment = require("moment");
  const [form] = Form.useForm();
  const nav = useNavigate();
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  //console.log(permissions)
  const company_id = user_state?.user?.companyId;
  const role = user_state?.user?.role;

  const [loader, setLoader] = useState(false);
  const [holidayObj, setHolidayObj] = useState();
  const [holidays, setHolidays] = useState([]);
  //const [flag, setFlag] = useState(false);

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

  useEffect(() => {
    setIsLoading(true);
    getHolidays();
  }, []);

  const getHolidays = (page, pageSize) => {
    const params = {
      page: page || pagination.current,
      limit: pageSize || pagination.pageSize,
    };

    apiServices("GET", `holidays/?page=${params.page}&limit=${params.limit}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setHolidayObj(res?.data?.Holiday)
          setHolidays(res?.data?.Holiday?.docs);
          //setFlag(true);
          setPage(parseInt(res?.data?.Holiday?.page, 10));
          setSize(parseInt(res?.data?.Holiday?.limit, 10));
          setPagination({
            ...pagination,
            current : parseInt(res?.data?.Holiday?.page, 10),
            pageSize : parseInt(res?.data?.Holiday?.limit, 10),
            total: res?.data?.Holiday.total,
          });
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('holiday.getHolidaysError')
          }!`
        );
      }).then(()=>{
        setIsLoading(false);
        //setFlag(false);
      });
  };

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
    setLoader(false);
  };

  const onFinish = (values, info) => {
    //console.log(info)
    setLoader(true);
    if (values?.holidayDate) {
      values.holidayDate = moment(values.holidayDate).format('YYYY-MM-DD');
    }
    if (info) {
      let updated_data = {
        ...values,
        companyId: info?.companyId,
        _id: info?._id,
      };
      const isHolidayExisting = holidays?.some(
        (holiday) =>
          new Date(holiday.holidayDate).toISOString() ===
          new Date(values?.holidayDate).toISOString()
      );
    
      if (isHolidayExisting) {
        message.error(t('holiday.holidayExists'));
        setLoader(false); 
        return; 
      }
      apiServices("PUT", "holidays", updated_data, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            // console.log(data);
            // setCategory(
            //   category.map((category) => {
            //     if (category._id === info._id) {
            //       return {
            //         ...category,
            //         ...values,
            //       };
            //     } else {
            //       return {
            //         ...category,
            //       };
            //     }
            //   })
            // );
            getHolidays();
            handleClose();
            message.success(t('holiday.holidayUpdatedSuccess'));
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
                : t('holiday.updateHolidayError')
            }!`
          );
        });
    } else {
      apiServices("POST", "holidays", values, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            // console.log(data);
            // setCategory([
            //   ...category,
            //   {
            //     ...values,
            //     _id: res?.data?.Category?._id,
            //   },
            // ]);
            getHolidays();
            handleClose();
            message.success(t('holiday.holidayAddedSuccess'));
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
                : t('holiday.addHolidayError')
            }!`
          );
        });
    }
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
      title: t('holiday.title'),
      dataIndex: "holidayTitle",
      key: "holidayTitle",
    },
    {
      title: t('holiday.date'),
      dataIndex: "holidayDate",
      key: "holidayDate",
      render: (text) => moment(text).format("D MMM YYYY"),
    },
    {
      title: t('holiday.day'),
      dataIndex: "holidayDate",
      key: "holidayDate",
      render: (text) => moment(text).format("dddd"),
    },
    {
      title: t('holiday.actions'),
      render: (record, row) => (
        <div className="dropdown dropdown-action text-end">
          <a
            href="javascript:void(0)"
            // className="action-icon dropdown-toggle"
            // data-bs-toggle="dropdown"
            // aria-expanded="false"
            className={`action-icon dropdown-toggle ${role === "admin" || permissions.companyManagement ? '' : 'disabled'}`}
            style={{ cursor: role == "admin" || permissions.companyManagement ? "pointer" : "not-allowed" }}
            data-bs-toggle={role === "admin" || permissions.companyManagement ? 'dropdown' : ''}
            aria-expanded={role === "admin" || permissions.companyManagement ? 'true' : 'false'}
          >
            <i className="material-icons">more_vert</i>
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            <a
              className="dropdown-item"
              href="javascript:void(0)"
              onClick={() => {
                setOpen({
                  isAddOpen: true,
                  isDelOpen: false,
                  data: row,
                });
              }}
            >
              <i className="fa fa-pencil m-r-5" /> {t('holiday.edit')}
            </a>
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
    apiServices("DELETE", "holidays", id, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // console.log(data);
          // setCategory([...category.filter((category) => category._id !== id)]);
          // if(categoryObj?.docs?.length === 1){
          //   console.log(categoryObj.totalPages)
          //   viewCategory((categoryObj.totalPages-1),null);
          // }
          // else{
          //}
          if(holidayObj?.docs?.length === 1){
            //console.log(holidayObj.totalPages)
            getHolidays((holidayObj.pages-1),null);
          }
          else{
            getHolidays()
          }
          handleClose();
          message.success(t('holiday.holidayDeletedSuccess'));
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
              : t('holiday.deleteHolidayError')
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
          >No Holidays found
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

  const handlePageChange = (page, pageSize) => {
    // Update the pagination state
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize,
    });
    setIsLoading(true);
    getHolidays(page, pageSize);
  };

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
            <title>{t('holiday.holidaysTitle')}</title>
            <meta name="description" content="Login page" />
          </Helmet>
          {/* Page Content */}
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">{t('holiday.holidays')} {new Date().getFullYear()}</h3>
                  
                </div>
                {(role === "admin" || permissions?.companyManagement) && (<div className="col-auto float-end ms-auto">
                  <a
                    href="javascript:void(0)"
                    className="btn add-btn"
                    onClick={() => {
                      setOpen({
                        isAddOpen: true,
                        isDelOpen: false,
                        data: "",
                      });
                    }}
                  >
                    <i className="fa fa-plus" /> {t('holiday.addholiday')}
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
                  holidays?.length > 0 ? "table-striped" : ""
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
                style = {{overflowX : 'auto'}}
                columns={columns}
                bordered
                dataSource={holidays}
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
                    holidays?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showTotal={(total, range) =>
                          t('paginationShow', { range1: range[0], range2: range[1], total: total })}
                        pageSizeOptions={["20", "30", "40", "50"]}
                        showSizeChanger
                        onChange={handlePageChange}
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
                {open?.data ? t('holiday.update') : t('holiday.add')} {t('holiday.holiday')}
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
                  {t('holiday.holidayname')} <span className="text-danger">*</span>
                  </label>
                  <Form.Item
                    name="holidayTitle"
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        validator: (_, value) => {
                          if(value.trim() === ''){
                            return Promise.reject(t('holiday.pleaseenterholidayname'));
                          }
                          else if (/\s{2,}/.test(value)) {
                            return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    className="custom-border"
                  >
                    <Input className="form-control" autoFocus />
                  </Form.Item>
                </div>
                <div className="form-group">
                        <label>{t('holiday.holidaydate')}</label>
                        <div style={{ position: "relative" }} id="area">
                          <Form.Item
                            name="holidayDate"
                            rules={[
                              {
                                required: true,
                                message: t('holiday.pleaseenterholidaydate'),
                              },
                            ]}
                            className="custom-border"
                          >
                            <DatePicker
                              getPopupContainer={() =>
                                document.getElementById("area")
                              }
                              style={{ width: "100%" }}
                              placeholder={t('requests.addModal.selectDate')}
                              className="form-control"
                              size="large"
                            />
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
                <h3 style={{ marginBottom: "30px" }}>{t('holiday.deleteHoliday')}</h3>
                <p>
                  <span dangerouslySetInnerHTML={{ __html: t('holiday.confirmDelete', { holiday: open?.data?.holidayTitle }) }} />
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

          {/* /Page Content */}
          {/* Add Holiday Modal */}
          <div
            className="modal custom-modal fade"
            id="add_holiday"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{t('holiday.addholiday')}</h5>
                  <button
                    type="button"
                    className="close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="form-group">
                      <label>
                        {t('holiday.holidayname')} <span className="text-danger">*</span>
                      </label>
                      <input className="form-control" type="text" />
                    </div>
                    <div className="form-group">
                      <label>
                      {t('holiday.holidaydate')} <span className="text-danger">*</span>
                      </label>
                      <div>
                        <input
                          className="form-control datetimepicker"
                          type="date"
                        />
                      </div>
                    </div>
                    <div className="submit-section">
                      <button className="btn btn-primary submit-btn">
                      {t('submit')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          {/* /Add Holiday Modal */}
          {/* Edit Holiday Modal */}
          <div
            className="modal custom-modal fade"
            id="edit_holiday"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Holiday</h5>
                  <button
                    type="button"
                    className="close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="form-group">
                      <label>
                      {t('holiday.holidayname')} <span className="text-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        defaultValue="New Year"
                        type="text"
                      />
                    </div>
                    <div className="form-group">
                      <label>
                      {t('holiday.holidaydate')} <span className="text-danger">*</span>
                      </label>
                      <div>
                        <input
                          className="form-control datetimepicker"
                          defaultValue="01-01-2019"
                          type="date"
                        />
                      </div>
                    </div>
                    <div className="submit-section">
                      <button className="btn btn-primary submit-btn">
                      {t('holiday.save')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          {/* /Edit Holiday Modal */}
          {/* Delete Holiday Modal */}
          <div
            className="modal custom-modal fade"
            id="delete_holiday"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-body">
                  <div className="form-header">
                    <h3>Delete Holiday</h3>
                    <p>Are you sure want to delete?</p>
                  </div>
                  <div className="modal-btn delete-action">
                    <div className="row">
                      <div className="col-6">
                        <a href="" className="btn btn-primary continue-btn">
                        {t('delete')}
                        </a>
                      </div>
                      <div className="col-6">
                        <a
                          href=""
                          data-bs-dismiss="modal"
                          className="btn btn-primary cancel-btn"
                        >
                          {t('cancel')}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /Delete Holiday Modal */}
        </div>
      </div>
      <Offcanvas />
    </>
  );
};

export default Holidays;
