import { Table, Button, Form, Input, message } from "antd";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "antd/dist/antd.css";
import "../../antdstyle.css";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
// import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

const Leaves = () => {
  const [form] = Form.useForm();

  const [leaveValue, setLeaveValue] = useState({});
  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });

  const [datas, setData] = useState([
    { id: 1, leaveType: "Medical Leave", leaveDays: "12 days" },
    { id: 2, leaveType: "Loss of Pay", leaveDays: "-" },
    { id: 3, leaveType: "Casual Leave", leaveDays: "12 days" },
  ]);

  const onHandleChange = (val, type) => {
    setLeaveValue({ ...leaveValue, [type]: val });
  };
  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
    setLeaveValue({});
  };

  const columns = [
    {
      title: "#",
      dataIndex: "id",
    },
    {
      title: "Leave Type",
      dataIndex: "leaveType",
      sorter: (a, b) => a.leaveType.length - b.leaveType.length,
    },

    {
      title: "Leave Days",
      dataIndex: "leaveDays",
      sorter: (a, b) => a.leaveDays.length - b.leaveDays.length,
    },
    {
      title: "Status",
      render: (text, record) => (
        <div className="dropdown action-label">
          <a
            className="btn btn-white btn-sm btn-rounded dropdown-toggle"
            href="#"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="fa fa-dot-circle-o text-success" /> Active
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            <a href="#" className="dropdown-item">
              <i className="fa fa-dot-circle-o text-success" /> Active
            </a>
            <a href="#" className="dropdown-item">
              <i className="fa fa-dot-circle-o text-danger" /> Inactive
            </a>
          </div>
        </div>
      ),
    },
    {
      title: "Action",
      render: (text, record) => (
        <div className="dropdown dropdown-action text-end">
          <a
            href="#"
            className="action-icon dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="material-icons">more_vert</i>
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            <a
              className="dropdown-item"
              href="#"
              // data-bs-toggle="modal"
              // data-bs-target="#edit_leavetype"
              onClick={() =>
                setOpen({
                  isAddOpen: true,
                  isDelOpen: false,
                  data: record,
                })
              }
            >
              <i className="fa fa-pencil m-r-5" /> Edit
            </a>
            <a
              className="dropdown-item"
              href="#"
              data-bs-toggle="modal"
              data-bs-target="#delete_leavetype"
            >
              <i className="fa fa-trash-o m-r-5" /> Delete
            </a>
          </div>
        </div>
      ),
    },
  ];

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 500,
    height: 328,
    bgcolor: "#fff",
    borderRadius: "10px",
    boxShadow: 24,
    paddingTop: 5,
  };

  const onFinish = (values) => {
    console.log('submit',values);
    handleClose();
    message.success('Leave Added Successfully')
  };

  return (
    <>
      {/* Page Content */}
      <div>
        {/* <div className="content container-fluid"> */}
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center pt-3 pb-3">
            <div className="col">
              <h3 className="page-title">Leave Type</h3>
            </div>
            <div className="col-auto float-end ms-auto">
              <a
                href="#"
                className="btn add-btn"
                // data-bs-toggle="modal"
                // data-bs-target="#edit_leavetype"
                onClick={() => {
                  setOpen({
                    isAddOpen: true,
                    isDelOpen: false,
                    data: "",
                  });
                }}
                // data-bs-target="#add_leavetype"
              >
                <i className="fa fa-plus" /> Add Leave Type
              </a>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              <Table
                className="table-striped"
                pagination={{
                  total: datas.length,
                  // pageSize: 1,
                  // hideOnSinglePage: true,
                  showTotal: (total, range) =>
                    `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  showSizeChanger: true,
                  onShowSizeChange: onShowSizeChange,
                  itemRender: itemRender,
                }}
                style={{ overflowX: "auto" }}
                columns={columns}
                bordered
                dataSource={datas}
                rowKey={(record) => record.id}
                // onChange={this.handleTableChange}
              />
            </div>
          </div>
        </div>
      </div>
      {/* /Page Content */}
      {/* Add Leavetype Modal */}
      <div id="add_leavetype" className="modal custom-modal fade" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Leave Type</h5>
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
                    Leave Type <span className="text-danger">*</span>
                  </label>
                  <input className="form-control" type="text" />
                </div>
                <div className="form-group">
                  <label>
                    Number of days <span className="text-danger">*</span>
                  </label>
                  <input className="form-control" type="text" />
                </div>
                <div className="submit-section">
                  <button className="btn btn-primary submit-btn">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Add Leavetype Modal */}
      {/* Edit Leavetype Modal */}
      <div
        id="edit_leavetype"
        className="modal custom-modal fade"
        // className={`modal custom-modal fade${showModal ? ' show' : ''}`}
        role="dialog"
        onClick={(e) => {
          if (e.target.className === "modal custom-modal fade") {
            // setModalData({});
            console.log("fade close");
          }
        }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Leave Type</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => {
                  // setModalData({});
                  console.log("close");
                }}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label>
                    Leave Type <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    // defaultValue={modalData ? modalData?.leavetype : ""}
                    // value={modalData?.leavetype}
                    onChange={(e) =>
                      onHandleChange(e.target.value, "leaveType")
                    }
                    // defaultValue="Casual Leave"
                  />
                </div>
                <div className="form-group">
                  <label>
                    Number of days <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    // defaultValue={modalData ? modalData?.leavedays : ""}
                    // value={modalData?.leavedays}
                    onChange={(e) => {
                      onHandleChange(e.target.value, "leavedays");
                    }}
                    // defaultValue={12}
                  />
                </div>
                <div className="submit-section">
                  <button
                    className="btn btn-primary submit-btn"
                    onClick={() => {
                      e.preventDefault();
                      // console.log(leaveValue);
                    }}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Edit Leavetype Modal */}
      {/* Delete Leavetype Modal */}
      <div
        className="modal custom-modal fade"
        id="delete_leavetype"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Delete Leave Type</h3>
                <p>Are you sure want to delete?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <a href="" className="btn btn-primary continue-btn">
                      Delete
                    </a>
                  </div>
                  <div className="col-6">
                    <a
                      href=""
                      data-bs-dismiss="modal"
                      className="btn btn-primary cancel-btn"
                    >
                      Cancel
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Leavetype Modal */}

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
              <h5 className="modal-title">Edit Leave Type</h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              {/* <form> */}
              <Form
                // {...layout}
                // form={form}
                name="control-hooks"
                onFinish={onFinish}
                initialValues={{
                  leaveType: open ? open?.data?.leaveType : "",
                  leaveDays: open ? open?.data?.leaveDays : "",
                }}
                // onFinishFailed={() => message.error('ops')}
                // style={{
                //   maxWidth: 600,
                // }}
              >
                <div className="form-group">
                  <label>
                    Leave Type <span className="text-danger">*</span>
                  </label>
                  <Form.Item
                    name="leaveType"
                    // label="Note"
                    rules={[
                      {
                        required: true,
                        message: "please enter leave type",
                      },
                      {
                        min: 8,
                        message: "length should be minimun 8",
                      },
                    ]}
                  >
                    {/* <input
                      className="form-control"
                      type="text"
                      defaultValue={open ? open?.data?.leavetype : ""}
                      value={leaveValue?.leavetype}
                      onChange={(e) =>
                        onHandleChange(e.target.value, "leaveType")
                      }
                      // defaultValue="Casual Leave"
                    /> */}
                    <Input
                      className="form-control"
                      // defaultValue={open ? open?.data?.leaveType : ""}
                      // value={leaveValue?.leavetype}
                      // onChange={(e) =>
                      //   onHandleChange(e.target.value, "leaveType")
                      // }
                    />
                  </Form.Item>
                </div>
                <div className="form-group">
                  <label>
                    Number of days <span className="text-danger">*</span>
                  </label>
                  <Form.Item
                    name="leaveDays"
                    // label="Note"
                    rules={[
                      {
                        required: true,
                        message: "please enter leave days",
                      },
                    ]}
                    
                  >
                    {/* <input
                      className="form-control"
                      type="text"
                      defaultValue={open ? open?.data?.leavedays : ""}
                      value={leaveValue?.leavedays}
                      onChange={(e) => {
                        onHandleChange(e.target.value, "leavedays");
                      }}
                      // defaultValue={12}
                    /> */}
                    <Input
                      className="form-control"
                      // defaultValue={open ? open?.data?.leaveDays : ""}
                      // value={leaveValue?.leavetype}
                      // onChange={(e) =>
                      //   onHandleChange(e.target.value, "leaveDays")
                      // }
                    />
                  </Form.Item>
                </div>
                <div className="submit-section">
                  <Form.Item>
                    <Button
                      // type="primary"
                      htmlType="submit"
                      className="btn btn-primary submit-btn"
                      onClick={(e) => {
                        // e.preventDefault();
                        // console.log(leaveValue);
                        // handleClose();
                      }}
                    >
                      Submit
                    </Button>
                    {/* <button
                      htmlType="submit"
                      className="btn btn-primary submit-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log(leaveValue);
                      }}
                    >
                      Save
                    </button> */}
                  </Form.Item>
                </div>
              </Form>
              {/* </form> */}
            </div>
          </div>
        </div>

        {/* <Box >
          <div className="BoxModal">

            </div>
            </Box> */}
      </Modal>
    </>
  );
};

export default Leaves;
