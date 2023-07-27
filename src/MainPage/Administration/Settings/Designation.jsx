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

  const columns = [
    {
      title: "#",
      dataIndex: '',
      width: 50,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Designation Name",
      dataIndex: "designationName",
      // sorter: (a, b) => a.departmentName.length - b.departmentName.length,
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
              onClick={() =>
                {
                  setOpen({
                  isAddOpen: true,
                  isDelOpen: false,
                  data: record,
                })
                }
              }
            >
              <i className="fa fa-pencil m-r-5" /> Edit
            </a>
            <a
              className="dropdown-item"
              href="javascript:void(0)"
              onClick={() =>
                {
                  setOpen({
                  isAddOpen: false,
                  isDelOpen: true,
                  data: record,
                })
                }
              }
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

  const onFinish = (values, data) => {
    if(data){
      console.log('submit',values);
      handleClose();
      message.success('Designation Updated Successfully')
    }else{
      console.log('submit',values);
      handleClose();
      message.success('Designation Added Successfully')
    }
  };

  return (
    <div>
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
                    <a href="javascript:void(0)" className="btn btn-primary continue-btn">
                      Delete
                    </a>
                  </div>
                  <div className="col-6">
                    <a
                      href="javascript:void(0)"
                      onClick={handleClose}
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
              <h5 className="modal-title">{open?.data ? 'Update' : 'Add'} Designation Name</h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                // form={form}
                name="control-hooks"
                onFinish={(val) => onFinish(val, open?.data)}
                onFinishFailed={() => message.error('Please Fill Required Fields!')}
                initialValues={{
                  designationName: open?.data ? open?.data?.designationName : ''
                }}
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
                    <Input className="form-control" autoFocus />
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
          <div className="modal-content" style={{height: '280px'}}>
            <div className="modal-body" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
              <div className="form-header">
                <h3 style={{marginBottom: '30px'}}>Delete Designation</h3>
                <p>Are you sure you want to delete <b>{open?.data?.designationName}</b>?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <a href="javascript:void(0)" className="btn btn-primary continue-btn">
                      Delete
                    </a>
                  </div>
                  <div className="col-6">
                    <a
                      href="javascript:void(0)"
                      onClick={handleClose}
                      className="btn btn-primary submit-btn"
                    >
                      Cancel
                    </a>
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

export default Designation;