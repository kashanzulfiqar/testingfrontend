import {
  Table,
  Button,
  Form,
  Input,
  message,
  TimePicker,
  Select,
  Spin,
  Empty,
} from "antd";
import React, { useEffect, useState } from "react";
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "antd/dist/antd.css";
import "../../antdstyle.css";
import Modal from "@mui/material/Modal";
import moment from "moment";
import { apiServices } from "../../../Services/apiServices";
import { useSelector } from "react-redux";
import { LoadingOutlined } from "@ant-design/icons";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { useTranslation } from "react-i18next";

const Shifts = () => {
  const user_state = useSelector((state) => state.user.loginvalue);
  let comp_id = user_state?.user?.companyId
  const { t, i18n } = useTranslation();
  const { Option } = Select;

  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });

  const [data, setData] = useState([]);
  const [tableLoader, setTableLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getShift();
  }, []);

  const getShift = () => {
    setTableLoader(true);
    apiServices("GET", "shift", null, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          setData(res?.data?.shift);
          setTableLoader(false);
        }
      })
      .catch((err) => {
        setTableLoader(false);
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('allEmp.errors.getShiftInfoError')
          }!`
        );
      });
  };

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
  };

  const onHandleDelete = (Data) => {
    setLoader(true);
    apiServices("DELETE", "shift", Data, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // console.log(data);
          setData([...data.filter((shift) => shift._id !== Data?._id)]);
          handleClose();
          message.success(t('settings.shift.shiftDeletedSuccessfully'));
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
              : t('settings.shift.deleteShiftError')
          }`
        );
      });
  };

  const onFinish = (values, info) => {
    setLoader(true);
    if (info) {
      let input_values = {
        title: values?.title,
        maxStartTime: values?.maxStartTime.format("HH:mm:ss"),
        startTime: values?.startTime.format("HH:mm:ss"),
        endTime: values?.endTime.format("HH:mm:ss"),
        // isActive: values?.isActive,
      };
      let updated_data = {
        ...input_values,
        companyId: info?.companyId || comp_id,
        _id: info?._id,
      };
      apiServices("PUT", "shift", updated_data, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            // console.log(data);
            setData(
              data.map((shift) => {
                if (shift._id === info._id) {
                  return {
                    ...shift,
                    ...input_values,
                  };
                } else {
                  return {
                    ...shift,
                  };
                }
              })
            );
            handleClose();
            message.success(t('settings.shift.shiftUpdatedSuccessfully'));
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
                : t('settings.shift.updateShiftInfoError')
            }`
          );
        });
    } else {
      let data_formatted = {
        title: values?.title,
        maxStartTime: values?.maxStartTime.format("HH:mm:ss"),
        startTime: values?.startTime.format("HH:mm:ss"),
        endTime: values?.endTime.format("HH:mm:ss"),
        // isActive: values?.isActive,
      };
      apiServices("POST", "shift", data_formatted, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            // console.log(data);
            setData([
              ...data,
              {
                ...data_formatted,
                _id: res?.data?.Shift?._id,
              },
            ]);
            handleClose();
            message.success(t('allEmp.errors.shiftAdded'));
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
                : t('allEmp.errors.addShiftError')
            }!`
          );
        });
    }
  };

  const columns = [
    {
      title: "#",
      dataIndex: "",
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Shift Name",
      dataIndex: "title",
      // sorter: (a, b) => a.shiftName.length - b.shiftName.length,
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      // sorter: (a, b) => a.startTime.length - b.startTime.length,
    },
    {
      title: "Max Start Time",
      dataIndex: "maxStartTime",
      // sorter: (a, b) => a.maxStartTime.length - b.maxStartTime.length,
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      // sorter: (a, b) => a.endTime.length - b.endTime.length,
    },
    // {
    //   title: "Status",
    //   dataIndex: "isActive",
    //   width: 100,
    //   render: (record, row) => (
    //     <>
    //       <span
    //         className="btn btn-white btn-sm btn-rounded"
    //         style={{ textTransform: "capitalize" }}
    //       >
    //         <i
    //           className={`fa ${
    //             record
    //               ? "fa-dot-circle-o text-success"
    //               : "fa-dot-circle-o text-danger"
    //           }`}
    //         />{" "}
    //         {record ? "Active" : "In-Active"}
    //       </span>
    //     </>
    //   ),
    // },
    {
      title: "Actions",
      render: (record, row) => (
        <div className="dropdown dropdown-action text-end">
          <a
            href="javascript:void(0)"
            className="action-icon dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
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
              <i className="fa fa-pencil m-r-5" /> Edit
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
              <i className="fa fa-trash-o m-r-5" /> Delete
            </a>
          </div>
        </div>
      ),
    },
  ];

  const timeFormat = "HH:mm:ss";

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
            {t('settings.shift.noShiftAddedYet')}
          </div>
          <div
            style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
          >
            {t('settings.shift.clickToAddShifts')} <br /> {t('settings.shift.newShift')}{" "}
          </div>
        </div>
      }
    />
  );

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
        color: "#fff",
      }}
      spin
    />
  );

  return (
    <div>
      {/* Page Content */}
      <div>
        {/* <div className="content container-fluid"> */}
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center pt-3 pb-3">
            <div className="col">
              <h3 className="page-title">{t('settings.shifts')}</h3>
            </div>
            <div className="col-auto float-end ms-auto">
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
                // data-bs-target="#add_leavetype"
              >
                <i className="fa fa-plus" /> {t('allEmp.Modal.addShift')}
              </a>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              <Table
                loading={tableLoader}
                className={
                  data?.length > 0 ? "table-striped antTableResponsive" : ""
                }
                locale={{
                  emptyText: tableLoader ? null : customEmptyText,
                }}
                pagination={{
                  total: data?.length,
                  pageSize: pageSize,
                  defaultCurrent: 1,
                  current: currentPage,
                  // pageSize: 1,
                  // hideOnSinglePage: true,
                  showTotal: (total, range) =>
                  t('paginationShow', { range1: range[0], range2: range[1], total: total }),
                  showSizeChanger: true,
                  onShowSizeChange: (current, size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  },
                  pageSizeOptions: ["20", "30", "40", "50"],
                  onChange: (page, size) => setCurrentPage(page),
                  itemRender: (current, type, originalElement) =>
                  itemRender(current, type, originalElement, t),
                }}
                style={{ overflowX: "auto" }}
                columns={columns}
                bordered
                dataSource={data}
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
      {/* /Page Content */}

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
                {open?.data ? t('holiday.update') : t('holiday.add')} {t('allEmp.Modal.shift')}
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
                  title: open?.data ? open?.data?.title : "",
                  maxStartTime: open?.data
                    ? moment(open?.data?.maxStartTime, timeFormat)
                    : "",
                  startTime: open?.data
                    ? moment(open?.data?.startTime, timeFormat)
                    : "",
                  endTime: open?.data
                    ? moment(open?.data?.endTime, timeFormat)
                    : "",
                  // isActive: open?.data ? open?.data?.isActive : "",
                }}
              >
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                      {t('allEmp.Modal.shiftName')} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="title"
                        rules={[
                          {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                              if(!value || value.trim() === ''){
                                return Promise.reject(t('allEmp.errors.enterShiftName'));
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
                        <Input className="form-control" maxLength={50} autoFocus />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                      {t('allEmp.Modal.startTime')} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="startTime"
                        rules={[
                          {
                            required: true,
                            message: t('allEmp.errors.enterStartTime'),
                          },
                        ]}
                        className="custom-border"
                      >
                        <TimePicker
                          className="form-control"
                          placeholder="HH:mm:ss"
                          format={timeFormat}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                      {t('allEmp.Modal.maxStartTime')} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="maxStartTime"
                        rules={[
                          {
                            required: true,
                            message: t('allEmp.errors.enterMaxStartTime'),
                          },
                          ({ getFieldValue }) => ({
                            validator: (_, value) => {
                              const startTime = getFieldValue('startTime');
                              if (!startTime) {
                                return Promise.resolve();
                            }
                            if (startTime && value && value.isBefore(startTime)) {
                                return Promise.reject(t('allEmp.errors.maxStartTimeGreaterEqualStartTime'));
                            }
                            return Promise.resolve();
                            },
                          }),
                        ]}
                        className="custom-border"
                      >
                        <TimePicker
                          className="form-control"
                          placeholder="HH:mm:ss"
                          format={timeFormat}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                      {t('allEmp.Modal.endTime')} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="endTime"
                        rules={[
                          {
                              required: true,
                              message: t('allEmp.errors.enterEndTime'),
                          },
                          ({ getFieldValue }) => ({
                              validator: (_, value) => {
                              const maxStartTime = getFieldValue('maxStartTime');
                              if (!maxStartTime) {
                                  return Promise.resolve();
                              }
                              if (value && value.isSameOrBefore(maxStartTime)) {
                                  if (value.isSame(maxStartTime, 'minute')) {
                                  return Promise.reject(t('allEmp.errors.endTimeMaxStartTimeCannotBeSame'));
                                  } else {
                                  return Promise.reject(t('allEmp.errors.endTimeGreaterThanMaxStartTime'));
                                  }
                              }
                              return Promise.resolve();
                              },
                          }),
                        ]}
                        className="custom-border"
                      >
                        <TimePicker
                          className="form-control"
                          placeholder="HH:mm:ss"
                          format={timeFormat}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  {/* <div className="col-12">
                    <div className="form-group">
                      <label>
                        Status <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="isActive"
                        rules={[
                          {
                            required: true,
                            message: "please select status",
                          },
                        ]}
                        className="custom-border"
                      >
                        <Select
                          options={[
                            {
                              value: true,
                              label: "Active",
                            },
                            {
                              value: false,
                              label: "In-Active",
                            },
                          ]}
                        />
                      </Form.Item>
                    </div>
                  </div> */}
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
                <h3 style={{ marginBottom: "30px" }}>{t('delete')} {t('allEmp.Modal.shift')}</h3>
                <p>
                <span dangerouslySetInnerHTML={{ __html: t('projectScreen.confirmDeleteProject', { project: open?.data?.title }) }} />
                </p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <Button
                      htmlType="submit"
                      className="btn btn-primary continue-btn"
                      onClick={() => onHandleDelete(open?.data)}
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
  );
};

export default Shifts;
