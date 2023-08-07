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

const Shifts = () => {
  const user_state = useSelector((state) => state.user.loginvalue);
  let comp_id = user_state?.user?.companyId

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
    getDesignation();
  }, []);

  const getDesignation = () => {
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
              : "Get Shift Info"
          } Error`
        );
      });
  };

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
  };

  const onHandleDelete = (id) => {
    setLoader(true);
    apiServices("DELETE", "shift", id, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // console.log(data);
          setData([...data.filter((shift) => shift._id !== id)]);
          handleClose();
          message.success("Shift Deleted Successfully!");
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
              : "Delete Shift"
          } Error`
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
        isActive: values?.isActive,
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
            message.success("Shift Updated Successfully");
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
                : "Update Shift Info"
            } Error`
          );
        });
    } else {
      let data_formatted = {
        title: values?.title,
        maxStartTime: values?.maxStartTime.format("HH:mm:ss"),
        startTime: values?.startTime.format("HH:mm:ss"),
        endTime: values?.endTime.format("HH:mm:ss"),
        isActive: values?.isActive,
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
            message.success("Shift Added Successfully");
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
                : "Add Shift Info"
            } Error`
          );
        });
    }
  };

  const columns = [
    {
      title: "#",
      dataIndex: "",
      render: (text, record, index) => index + 1,
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
    {
      title: "Status",
      dataIndex: "isActive",
      width: 100,
      render: (record, row) => (
        <>
          <span
            className="btn btn-white btn-sm btn-rounded"
            style={{ textTransform: "capitalize" }}
          >
            <i
              className={`fa ${
                record
                  ? "fa-dot-circle-o text-success"
                  : "fa-dot-circle-o text-danger"
              }`}
            />{" "}
            {record ? "Active" : "In-Active"}
          </span>
        </>
      ),
    },
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
            No Shift added yet
          </div>
          <div
            style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
          >
            Click 'Add Shifts' Button To Create <br /> A New Shift{" "}
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
              <h3 className="page-title">Shifts</h3>
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
                <i className="fa fa-plus" /> Add Shifts
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
                  // pageSize: 1,
                  // hideOnSinglePage: true,
                  showTotal: (total, range) =>
                    `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  showSizeChanger: true,
                  onShowSizeChange: (current, size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  },
                  pageSizeOptions: ["20", "30", "40", "50"],
                  itemRender: itemRender,
                }}
                style={{ overflowX: "auto" }}
                columns={columns}
                bordered
                dataSource={data}
                rowKey={(record) => record.id}
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
                {open?.data ? "Update" : "Add"} Shift
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
                onFinishFailed={() =>
                  message.error("Please Fill Required Fields!")
                }
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
                  isActive: open?.data ? open?.data?.isActive : "",
                }}
              >
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Shift Name <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="title"
                        rules={[
                          {
                            required: true,
                            message: "please enter shift name",
                          },
                        ]}
                        className="custom-border"
                      >
                        <Input className="form-control" autoFocus />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Start Time <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="startTime"
                        rules={[
                          {
                            required: true,
                            message: "please enter start time",
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
                        Max Start Time <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="maxStartTime"
                        rules={[
                          {
                            required: true,
                            message: "please enter max start time",
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
                        End Time <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="endTime"
                        rules={[
                          {
                            required: true,
                            message: "please enter end time",
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
                  <div className="col-12">
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
                <h3 style={{ marginBottom: "30px" }}>Delete Shift</h3>
                <p>
                  Are you sure you want to delete <b>{open?.data?.title}</b>?
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
    </div>
  );
};

export default Shifts;
