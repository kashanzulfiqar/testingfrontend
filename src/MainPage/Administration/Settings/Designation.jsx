import { Table, Button, Form, Input, message } from "antd";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "antd/dist/antd.css";
import "../../antdstyle.css";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
// import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';

const Designation = () => {
  const [form] = Form.useForm();

  const [designationValue, setDesignationValue] = useState('');
  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });

  const [datas, setData] = useState([
    { id: 1, designationName: "CEO"},
    { id: 2, designationName: "Director"},
    { id: 3, designationName: "Web Developer"},
  ]);

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
    setDesignationValue('');
    form.resetFields();
  };
  const onHandleChange = (type, value) => {
    const updatedValues = {
      [type]: `${value}`, // Replace 'New Value' with the desired new value
    };

    // Set the updated values back to the form
    form.setFieldsValue(updatedValues);
    setDesignationValue(value)
  };

  const columns = [
    {
      title: "#",
      dataIndex: "id",
    },
    {
      title: "Designation Name",
      dataIndex: "designationName",
      sorter: (a, b) => a.departmentName.length - b.departmentName.length,
    },
    {
      title: "Actions",
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
              onClick={() =>
                {
                  setOpen({
                  isAddOpen: true,
                  isDelOpen: false,
                  data: record,
                })
                form.setFieldsValue(record);
                }
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
    message.success('Designation Added Successfully')
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
              <h3 className="page-title">Designations</h3>
            </div>
            <div className="col-auto float-end ms-auto">
              <a
                href="#"
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
                <i className="fa fa-plus" /> Add Designation
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
              <h5 className="modal-title">Designation Name</h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                form={form}
                name="control-hooks"
                onFinish={onFinish}
              >
                <div className="form-group">
                  <label>
                    Designation Name <span className="text-danger">*</span>
                  </label>
                  <Form.Item
                    name="designationName"
                    rules={[
                      {
                        required: true,
                        message: "please enter designation name",
                      },
                    ]}
                    className="custom-border"
                  >
                    <Input className="form-control" style={{display: 'none'}} value={designationValue} />
                    <input className="form-control"
                      defaultValue={open?.data ? open?.data?.designationName : ''}
                      onChange={(e) => {
                        onHandleChange("designationName", e.target.value);
                      }}
                      autoFocus
                    />
                  </Form.Item>
                </div>
                <div className="submit-section">
                  <Form.Item>
                    <Button
                      htmlType="submit"
                      className="btn btn-primary submit-btn"
                    >
                      Submit
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Designation;