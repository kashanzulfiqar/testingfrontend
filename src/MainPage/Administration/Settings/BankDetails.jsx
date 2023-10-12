import React, { useEffect, useState } from "react";
import {
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  Pagination,
  Spin,
  Table,
  message,
} from "antd";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import { LoadingOutlined } from "@ant-design/icons";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { Modal } from "@mui/material";
import { itemRender } from "../../paginationfunction";

const BankDetails = () => {
  const user_state = useSelector((state) => state.user.loginvalue);
  let company_id = user_state?.user?.companyId;

  const [form] = Form.useForm();

  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [bankId, setBankId] = useState();
  const [tableLoader, setTableLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });

  useEffect(() => {
    getBankDetails();
    // console.log('hello leaves');
  }, []);

  const getBankDetails = () => {
    setTableLoader(true);
    apiServices("GET", "bank-details", null, user_state)
      .then((res) => {
        // console.log(res?.data?.leavePolicies);
        if (res?.data?.success === true) {
          setData(res?.data?.bankDetail);
          setBankId(
            res?.data?.bankDetail?._id ? res?.data?.bankDetail?._id : null
          );
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
              : "Get Bank Detail Error"
          }!`
        );
      });

    // setData(data1 ? data1 : {})
    // setFirstLeaves(data1)
  };

  //   useEffect(() => {
  //     // When the data state changes, update the form fields with the new data
  //     if (data) {
  //       let d = {
  //         bankName: data?.bankName ? data?.bankName : "",
  //         country: data?.country || "",
  //         city: data?.city || "",
  //         address: data?.address || "",
  //         iban: data?.iban|| "",
  //         swiftCode: data?.swiftCode || "",
  //       };
  //       form.setFieldsValue(d);
  //     }
  //   }, [data]);

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
    form.resetFields();
  };

  const onHandleDelete = (id) => {
    setLoader(true);
    apiServices("DELETE", "bank-details", id, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // console.log(data);
          setData([...data.filter((Bank) => Bank._id !== id)]);
          handleClose();
          message.success("Bankd Deleted Successfully!");
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
              : "Error deleting bank details"
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
      apiServices("PUT", "bank-details", updated_data, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            setData(
              data.map((Bank) => {
                if (Bank._id === info._id) {
                  return {
                    ...Bank,
                    ...values,
                  };
                } else {
                  return {
                    ...Bank,
                  };
                }
              })
            );
            handleClose();
            message.success("Bank Details Updated Successfully!");
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
                : "Updating Bank Details Error"
            }!`
          );
        });
    } else {
      apiServices("POST", "bank-details", values, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            // console.log(data);
            setData([
              ...data,
              {
                ...values,
                _id: res?.data?.bankDetail?._id,
              },
            ]);
            handleClose();
            message.success("Bank Details Added Successfully!");
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
                : "Add Bank Details Error"
            }!`
          );
        });
    }
  };

  //   const onFinish1 = (values) => {
  //     setLoader(true);
  //     let new_values = {
  //       ...values,
  //       companyId: company_id,
  //     };

  //     // if(!firstLeaves && firstFlag){
  //     if (!bankId) {
  //       apiServices("POST", "bank-details", new_values, user_state)
  //         .then((res) => {
  //           // console.log(res?.data);
  //           if (res?.data?.success === true) {
  //             // setData(res?.data?.leavePolicies || {})
  //             setBankId(res?.data?.bankDetail?._id);
  //             message.success("Bank Details Added Successfully!");
  //             setLoader(false);
  //           }
  //         })
  //         .catch((err) => {
  //           setLoader(false);
  //           // console.log(err);
  //           message.error(
  //             `${
  //               err?.response?.data?.msg
  //                 ? err?.response?.data?.msg
  //                 : err?.response?.data?.validation?.body?.message
  //                 ? err?.response?.data?.validation?.body?.message
  //                 : "Error Adding Bank Details"
  //             }!`
  //           );
  //         });

  //       // console.log("=======onAdding=======", new_values);
  //       // setFirstFlag(false)
  //     } else {
  //       let values_withId = {
  //         ...new_values,
  //         _id: bankId,
  //       };

  //       apiServices("PUT", "bank-details", values_withId, user_state)
  //         .then((res) => {
  //           // console.log(res?.data);
  //           if (res?.data?.success === true) {
  //             message.success("Bank Details Updated Successfully!");
  //             setLoader(false);
  //           }
  //         })
  //         .catch((err) => {
  //           setLoader(false);
  //           // console.log(err);
  //           message.error(
  //             `${
  //               err?.response?.data?.msg
  //                 ? err?.response?.data?.msg
  //                 : err?.response?.data?.validation?.body?.message
  //                 ? err?.response?.data?.validation?.body?.message
  //                 : "Updating Bank Details Error"
  //             }!`
  //           );
  //         });

  //       // console.log("--------Updating--------", values_withId);
  //     }
  //   };

  const columns = [
    {
      title: "#",
      dataIndex: "",
      width: 50,
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Bank Name",
      dataIndex: "bankName",
      // sorter: (a, b) => a.TagName.length - b.TagName.length,
    },
    {
      title: "Country",
      dataIndex: "country",
      // sorter: (a, b) => a.TagName.length - b.TagName.length,
    },
    {
      title: "City",
      dataIndex: "city",
      // sorter: (a, b) => a.TagName.length - b.TagName.length,
    },
    {
      title: "Address",
      dataIndex: "address",
      render: (text, record) => (
        <label className="longText">
          {record?.address ? record?.address : "-"}
        </label>
      ),
      // sorter: (a, b) => a.TagName.length - b.TagName.length,
    },
    {
      title: "IBAN",
      dataIndex: "iban",
      // sorter: (a, b) => a.TagName.length - b.TagName.length,
    },
    {
      title: "SWIFT Code",
      dataIndex: "swiftCode",
      // sorter: (a, b) => a.TagName.length - b.TagName.length,
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
            No Bank added yet
          </div>
          <div
            style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
          >
            Click 'Add Bank Details' Button To Add <br /> A New Invoice Bank{" "}
          </div>
        </div>
      }
    />
  );

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 30,
        color: "#fff",
      }}
      spin
    />
  );

  return (
    <div>
      <div>
        {/* <h6 className="card-title m-b-20">Module Access</h6>
               {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center pt-3 pb-3">
            <div className="col">
              <h3 className="page-title">Bank Details</h3>
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
                <i className="fa fa-plus" /> Add Bank Details
              </a>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive BankTable">
              <Table
                loading={tableLoader}
                className={data?.length > 0 ? "table-striped" : ""}
                style={{ marginBottom:"100px" }}
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
            {/* {
                    data?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        total={data?.length}
                        pageSize={pageSize}
                        defaultCurrent={1}
                        current={currentPage}
                        showTotal={(total, range) =>
                          `Showing ${range[0]} to ${range[1]} of ${total} entries`}
                        onChange={(page, size) => {
                            setCurrentPage(page);
                        }}  
                        showSizeChanger={true}
                        onShowSizeChange= {(current, size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                        pageSizeOptions={['10', '20', '40', '50']}
                        
                        itemRender={itemRender}
                      />
                    </div>
                  } */}
          </div>
        </div>
      </div>
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
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {open?.data ? "Update" : "Add"} Bank Details
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
                onFinishFailed={({ errorFields }) => {
                  const consecutiveSpacesError = errorFields.find((field) =>
                    field.errors.toString().includes("consecutive spaces")
                  );
                  if (consecutiveSpacesError) {
                    message.error("Please Remove Consecutive Spaces!");
                  } else {
                    message.error("Please Fill Required Fields!");
                  }
                }}
                initialValues={{
                  bankName: open?.data ? open?.data?.bankName : "",
                  country: open?.data ? open?.data?.country : "",
                  city: open?.data ? open?.data?.city : "",
                  address: open?.data ? open?.data?.address : "",
                  iban: open?.data ? open?.data?.iban : "",
                  swiftCode: open?.data ? open?.data?.swiftCode : "",
                }}
                autoComplete="off"
              >
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Bank Name <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="bankName"
                        rules={[
                          {
                            required: true,
                            message: "Please enter the Bank name",
                          },
                        ]}
                        validateTrigger="onSubmit"
                        className="custom-border"
                      >
                        <Input className="form-control" />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Country <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="country"
                        rules={[
                          {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                              if(value.trim() === ''){
                                return Promise.reject("please enter country name");
                              }
                              else if (/\s{2,}/.test(value)) {
                                return Promise.reject("please remove consecutive spaces");
                              }
                              return Promise.resolve();
                            },
                          },
                          {
                            min: 3,
                            message: "country length must be at least 3 characters long",
                          },
                        ]}
                        validateTrigger="onSubmit"
                        className="custom-border"
                      >
                        <Input className="form-control" maxLength={50} />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        City <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="city"
                        rules={[
                          {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                              if(value.trim() === ''){
                                return Promise.reject("please enter city name");
                              }
                              else if (/\s{2,}/.test(value)) {
                                return Promise.reject("please remove consecutive spaces");
                              }
                              return Promise.resolve();
                            },
                          },
                          {
                            min: 3,
                            message: "state length must be at least 3 characters long",
                          },
                        ]}
                        validateTrigger="onSubmit"
                        className="custom-border"
                      >
                        <Input className="form-control" maxLength={50} />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        Address <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="address"
                        rules={[
                          {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                              if(value.trim() === ''){
                                return Promise.reject("please enter the address");
                              }
                              else if (/\s{2,}/.test(value)) {
                                return Promise.reject("please remove consecutive spaces");
                              }
                              return Promise.resolve();
                            },
                          },
                          {
                            min: 5,
                            message: "address length must be at least 5 characters long",
                          },
                        ]}
                        validateTrigger="onSubmit"
                        className="custom-border"
                      >
                        <Input className="form-control" maxLength={150} />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        IBAN <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="iban"
                        rules={[
                          {
                            required: true,
                            message: "Please enter the IBAN number",
                          },
                          {
                            min: 24,
                            message: "IBAN must be atleast 24 characters long",
                          },
                          {
                            validator: (_, value) => {
                              if (/\s/.test(value)) {
                                return Promise.reject(
                                  "IBAN should not contain spaces"
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        validateTrigger="onSubmit"
                        className="custom-border"
                      >
                        <Input className="form-control" maxLength={34} />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        SWIFT Code <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="swiftCode"
                        rules={[
                          {
                            required: true,
                            message: "Please enter the bank SWIFT Code",
                          },
                          {
                            min: 8,
                            message: "SWIFT code must be between 8-11 alphanumeric characters",
                          },
                          {
                            validator: (_, value) => {
                              if (/\s/.test(value)) {
                                return Promise.reject(
                                  "SWFIT code should not contain spaces"
                                );
                              }
                              if (/[^A-Za-z0-9]/.test(value)) {
                                return Promise.reject("SWIFT code should not contain special characters");
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        validateTrigger="onSubmit"
                        className="custom-border"
                      >
                        <Input className="form-control" maxLength={11}/>
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
                        "Save Changes"
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
                <h3 style={{ marginBottom: "30px" }}>Delete Bank</h3>
                <p>
                  Are you sure you want to delete <b>{open?.data?.bankName}</b>?
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

export default BankDetails;
