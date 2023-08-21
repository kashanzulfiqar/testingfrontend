import {
  Table,
  Button,
  Form,
  Input,
  message,
  Empty,
  TimePicker,
  Select,
  Spin,
} from "antd";
import React, { useEffect, useState } from "react";
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "antd/dist/antd.css";
import "../../antdstyle.css";
import Modal from "@mui/material/Modal";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { LoadingOutlined } from "@ant-design/icons";

const TaxSlabs = () => {
  const user_state = useSelector((state) => state.user.loginvalue);
  let comp_id = user_state?.user?.companyId

  const { Option } = Select;

  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });
  const [tableLoader, setTableLoader] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [loader, setLoader] = useState(false);

  const [data, setData] = useState([]);

  useEffect(() => {
    getTaxSlab();
  }, []);

  const getTaxSlab = () => {
    setTableLoader(true);
    apiServices("GET", "tax-slab", null, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          setData(res?.data?.taxSlabs);
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
              : "Get Tax Slabs Info Error"
          }!`
        );
      });
  };

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
  };

  const onHandleDelete = (id) => {
    setLoader(true);
    apiServices("DELETE", "tax-slab", id, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // console.log(data);
          setData([...data.filter((tax) => tax._id !== id)]);
          handleClose();
          message.success("Tax Slab Deleted Successfully!");
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
              : "Delete Tax Slab Error"
          }!`
        );
      });
  };

  const onFinish = (values, info) => {
    setLoader(true);
    if (info) {
      let updated_data = {
        ...values,
        companyId: info?.companyId || comp_id,
        _id: info?._id,
      };
      apiServices("PUT", "tax-slab", updated_data, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            // console.log(data);
            setData(
              data.map((taxslab) => {
                if (taxslab._id === info._id) {
                  return {
                    ...taxslab,
                    ...values,
                  };
                } else {
                  return {
                    ...taxslab,
                  };
                }
              })
            );
            handleClose();
            message.success("Tax Slab Updated Successfully");
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
                : "Update Tax Slab Info Error"
            }!`
          );
        });
    } else {
      apiServices("POST", "tax-slab", values, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            // console.log(data);
            setData([
              ...data,
              {
                ...values,
                _id: res?.data?.taxSlab?._id,
              },
            ]);
            handleClose();
            message.success("Tax Slab Added Successfully");
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
                : "Add Tax Slab Info Error"
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
      title: "Slab Name",
      dataIndex: "title",
      // sorter: (a, b) => a.shiftName.length - b.shiftName.length,
    },
    {
      title: "Lower Limit",
      dataIndex: "yearlyPayLowerLimit",
      // sorter: (a, b) => a.maxStartTime.length - b.maxStartTime.length,
      render: (record, row) => {
        const record_yearlyPayLowerLimit = record
          ?.toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return <span>{record_yearlyPayLowerLimit}</span>;
      },
    },
    {
      title: "Upper Limit",
      dataIndex: "yearlyPayUpperLimit",
      // sorter: (a, b) => a.startTime.length - b.startTime.length,
      render: (record, row) => {
        const record_yearlyPayUpperLimit = record
          ?.toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return <span>{record_yearlyPayUpperLimit}</span>;
      },
    },
    {
      title: "Tax",
      dataIndex: "monthlyTaxInPercent",
      // sorter: (a, b) => a.endTime.length - b.endTime.length,
      width: "14%",
      render: (record, row) => {
        return <span>{record}%</span>;
      },
    },
    {
      title: "Fix Tax",
      dataIndex: "fixedYearlyTax",
      render: (record, row) => {
        const record_fixedYearlyTax = record
          ?.toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return <span>{record_fixedYearlyTax}</span>;
      },
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
            No tax slab added yet
          </div>
          <div
            style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
          >
            Click 'Add New Tax Slab' Button To Create <br /> A New Tax Slab{" "}
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
              <h3 className="page-title">Tax Slabs</h3>
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
                <i className="fa fa-plus" /> Add New Tax Slab
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
                    `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  showSizeChanger: true,
                  onShowSizeChange: (current, size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  },
                  pageSizeOptions: ["20", "30", "40", "50"],
                  onChange: (page, size) => setCurrentPage(page),
                  itemRender: itemRender,
                }}
                // style={{ overflowX: "auto" }}
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
                {open?.data ? "Update" : "Add"} Tax Slab
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
                  title: open?.data ? open?.data?.title : "",
                  yearlyPayLowerLimit: open?.data
                    ? open?.data?.yearlyPayLowerLimit
                    : "",
                  yearlyPayUpperLimit: open?.data
                    ? open?.data?.yearlyPayUpperLimit
                    : "",
                  monthlyTaxInPercent: open?.data
                    ? open?.data?.monthlyTaxInPercent
                    : "",
                  fixedYearlyTax: open?.data ? open?.data?.fixedYearlyTax : "",
                }}
              >
                <div className="row">
                  <div className="col-12">
                    <div className="form-group">
                      <label>
                        Slab Name <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="title"
                        rules={[
                          {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                              if(value.trim() === ''){
                                return Promise.reject("please enter slab name");
                              }
                              else if (/\s{2,}/.test(value)) {
                                return Promise.reject("please remove consecutive spaces");
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
                        Yearly Pay Lower Limit{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="yearlyPayLowerLimit"
                        rules={[
                          {
                            required: true,
                            message: "please enter lower limit",
                          },
                        ]}
                        className="custom-border"
                      >
                        <Input
                          className="form-control"
                          onKeyPress={(e) => {
                            if (
                              e.key === '.' &&
                              e.target.value.includes('.')
                            ) {
                              e.preventDefault();
                            } else if (
                              e.which !== 46 &&
                              (e.which < 48 || e.which > 57)
                            ) {
                              e.preventDefault();
                            }
                          }}
                          maxLength={50}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Yearly Pay Upper Limit{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="yearlyPayUpperLimit"
                        rules={[
                          {
                            required: true,
                            message: "please enter upper limit",
                          },
                          ({ getFieldValue }) => ({
                            validator: (_, value) => {
                              const lowerLimit = getFieldValue(
                                "yearlyPayLowerLimit"
                              );
                              if (!lowerLimit) {
                                return Promise.resolve();
                              }
                              if (parseFloat(value) < parseFloat(lowerLimit)) {
                                return Promise.reject(
                                  "Yearly Pay Upper Limit must be greater than or equal to Yearly Pay Lower Limit"
                                );
                              }
                              return Promise.resolve();
                            },
                          }),
                        ]}
                        className="custom-border"
                      >
                        <Input
                          className="form-control"
                          onKeyPress={(e) => {
                            if (
                              e.key === '.' &&
                              e.target.value.includes('.')
                            ) {
                              e.preventDefault();
                            } else if (
                              e.which !== 46 &&
                              (e.which < 48 || e.which > 57)
                            ) {
                              e.preventDefault();
                            }
                          }}
                          maxLength={50}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Tax (%) <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="monthlyTaxInPercent"
                        rules={[
                          {
                            required: true,
                            validator: (_, value) => {
                              if(value.trim() === ''){
                                return Promise.reject("please enter tax percentage");
                              }
                              else if (value > 100) {
                                return Promise.reject("tax percentage must not be more than 100");
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        className="custom-border"
                      >
                        <Input
                          className="form-control"
                          onKeyPress={(e) => {
                            if (
                              e.key === '.' &&
                              e.target.value.includes('.')
                            ) {
                              e.preventDefault();
                            } else if (
                              e.which !== 46 &&
                              (e.which < 48 || e.which > 57)
                            ) {
                              e.preventDefault();
                            }
                          }}
                          maxLength={50}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Fix Tax (Amount) <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="fixedYearlyTax"
                        rules={[
                          {
                            required: true,
                            message: "please enter fix tax",
                          },
                        ]}
                        className="custom-border"
                      >
                        <Input
                          className="form-control"
                          onKeyPress={(e) => {
                            if (
                              e.key === '.' &&
                              e.target.value.includes('.')
                            ) {
                              e.preventDefault();
                            } else if (
                              e.which !== 46 &&
                              (e.which < 48 || e.which > 57)
                            ) {
                              e.preventDefault();
                            }
                          }}
                          maxLength={50}
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
                <h3 style={{ marginBottom: "30px" }}>Delete Tax Slab</h3>
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

export default TaxSlabs;
