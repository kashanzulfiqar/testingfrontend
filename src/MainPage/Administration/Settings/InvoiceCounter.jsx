import { Table, Button, Form, Input, message, Empty, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "antd/dist/antd.css";
import "../../antdstyle.css";
import Modal from "@mui/material/Modal";
// import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { apiServices } from "../../../Services/apiServices";
import { useSelector } from "react-redux";
import { LoadingOutlined } from "@ant-design/icons";

const InvoiceCounter = () => {
  const user_state = useSelector((state) => state.user.loginvalue);

  const [form] = Form.useForm();

  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });
  const [tableLoader, setTableLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getInvoiceCount();
  }, []);

  const getInvoiceCount = () => {
    setTableLoader(true);
    apiServices("GET", "invoice-counter", null, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          setData(res?.data?.InvoiceCounter);
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
              : "Get Invoice Count Error"
          }!`
        );
      });
  };

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
    form.resetFields();
  };

  const onHandleDelete = (id) => {
    setLoader(true);
    apiServices("DELETE", "invoice-counter", id, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // console.log(data);
          setData([...data.filter((counter) => counter._id !== id)]);
          handleClose();
          message.success("Invoice Counter Deleted Successfully!");
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
              : "Delete Invoice Counter Error"
          }!`
        );
      });
  };

  const onFinish = (values, info) => {
    setLoader(true);
    if (info) {
      let updated_data = {
        ...values,
        companyId: info?.companyId,
        _id: info?._id,
      };
      apiServices("PUT", "invoice-counter", updated_data, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            // console.log(data);
            setData(
              data.map((counter) => {
                if (counter._id === info._id) {
                  return {
                    ...counter,
                    invoiceCount: values?.invoiceCount,
                  };
                } else {
                  return {
                    ...counter,
                  };
                }
              })
            );
            handleClose();
            message.success("Invoice Count Updated Successfully!");
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
                : "Update Invoice Count Error"
            }!`
          );
        });
    } else {
      apiServices("POST", "invoice-counter", values, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            // console.log(data);
            setData([
              ...data,
              {
                ...values,
                _id: res?.data?.InvoiceCounter?._id,
              },
            ]);
            handleClose();
            message.success("Invoice Count Added Successfully!");
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
                : "Add Invoice Counter Info Error"
            }!`
          );
        });
    }
  };

  const columns = [
    {
      title: "#",
      dataIndex: "",
      width: 50,
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Invoice Count",
      dataIndex: "invoiceCount",
      // sorter: (a, b) => a.counterName.length - b.counterName.length,
    },
    {
      title: "Actions",
      render: (text, record) => (
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
                  data: record,
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
                  data: record,
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
            No Invoice Counter added yet
          </div>
          <div
            style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
          >
            Click 'Add Invoice Counter' Button To Create <br /> A New Invoice Counter{" "}
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
              <h3 className="page-title">Invoice Counter</h3>
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
                <i className="fa fa-plus" /> Add Invoice Counter
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
                className={data?.length > 0 ? "table-striped" : ""}
                style={{
                    minHeight: "200px"
                  }} 
                locale={{
                  emptyText: tableLoader ? null : customEmptyText,
                }}
                pagination={false}
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
              <h5 className="modal-title">
                {open?.data ? "Update" : "Add"} Invoice Count
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
                    message.error("Please Remove Consecutive Spaces!")
                  }else{
                    message.error("Please Fill Required Fields!")
                  }
                }}
                initialValues={{
                  invoiceCount: open?.data ? open?.data?.invoiceCount : "",
                }}
                autoComplete="off"
              >
                <div className="form-group">
                  <label>
                    Invoice Count <span className="text-danger">*</span>
                  </label>
                  <Form.Item
                    name="invoiceCount"
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        validator: (_, value) => {
                          if(value.trim() === ''){
                            return Promise.reject("please enter an invoice count");
                          }
                          else if (/\s{2,}/.test(value)) {
                            return Promise.reject("please remove consecutive spaces");
                          }
                          else if (isNaN(value)) {
                            return Promise.reject("Please enter a valid number");
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
                <h3 style={{ marginBottom: "30px" }}>Delete Invoice Count</h3>
                <p>
                  Are you sure you want to delete Count:{" "}
                  <b>{open?.data?.invoiceCount}</b>?
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

export default InvoiceCounter;