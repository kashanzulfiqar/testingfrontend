import { Table, Button, Form, Input, message, TimePicker, Select } from "antd";
import React, { useState } from "react";
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "antd/dist/antd.css";
import "../../antdstyle.css";
import Modal from "@mui/material/Modal";
import moment from "moment";


const Shifts = () => {

  const { Option } = Select;

  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });

  const [datas, setData] = useState([
    { id: 1, shiftName: "Night", maxStartTime: '12:00', startTime: '13:00', endTime: '14:00', status: 'active'},
    { id: 2, shiftName: "Morning", maxStartTime: '20:00', startTime: '21:00', endTime: '22:00', status: 'in-active'},
  ]);

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
  };

  const columns = [
    {
      title: "#",
      dataIndex: '',
      render: (text, record, index) => index + 1,
    },
    {
      title: "Shifts Name",
      dataIndex: "shiftName",
      // sorter: (a, b) => a.shiftName.length - b.shiftName.length,
    },
    {
      title: "Max Start Time",
      dataIndex: "maxStartTime",
      // sorter: (a, b) => a.maxStartTime.length - b.maxStartTime.length,
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      // sorter: (a, b) => a.startTime.length - b.startTime.length,
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      // sorter: (a, b) => a.endTime.length - b.endTime.length,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (record, row) => (
        <>
        <span className="btn btn-white btn-sm btn-rounded" style={{textTransform: 'capitalize'}}>
            <i className={`fa ${record === 'active' ? 'fa-dot-circle-o text-success' : 'fa-dot-circle-o text-danger'}`} /> {record}
          </span>
        </>
      ),
    },
    {
      title: "Actions",
      render: (record, row) => (
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
                  data: row,
                })
                }
              }
            >
              <i className="fa fa-pencil m-r-5" /> Edit
            </a>
            <a
              className="dropdown-item"
              href="#"
              onClick={() =>
                {
                  setOpen({
                  isAddOpen: false,
                  isDelOpen: true,
                  data: row,
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

  const onFinish = (values) => {
    let data = {
      shiftName: values?.shiftName,
      maxStartTime: values?.maxStartTime.format('HH:mm'),
      startTime: values?.startTime.format('HH:mm'),
      endTime: values?.endTime.format('HH:mm'),
      status: values?.status
    }
    console.log('submit',data);
    handleClose();
    message.success('Shift Added Successfully')
  };

  const timeFormat = 'HH:mm';

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
                    <a href="#" className="btn btn-primary continue-btn">
                      Delete
                    </a>
                  </div>
                  <div className="col-6">
                    <a
                      href="#"
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
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
        }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Shift</h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                // form={form}
                name="control-hooks"
                onFinish={onFinish}
                onFinishFailed={() => message.error('Please Fill Required Fields!')}
                initialValues={{
                  shiftName: open?.data ? open?.data?.shiftName : '',
                  maxStartTime: open?.data ? moment(open?.data?.maxStartTime, timeFormat) : '',
                  startTime: open?.data ? moment(open?.data?.startTime, timeFormat) : '',
                  endTime: open?.data ? moment(open?.data?.endTime, timeFormat) : '',
                  status: open?.data ? open?.data?.status : '',
                }}
              >
                <div className="row">

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Shift Name <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="shiftName"
                        rules={[
                          {
                            required: true,
                            message: "please enter shift name",
                          },
                        ]}
                        className="custom-border"
                      >
                        <Input
                          className="form-control"
                          autoFocus
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
                          placeholder="HH:mm"
                          format={timeFormat}
                        />
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
                          placeholder="HH:mm"
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
                          placeholder="HH:mm"
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
                        name="status"
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
                              value: 'active',
                              label: 'Active',
                            },
                            {
                              value: 'in-active',
                              label: 'In-Active',
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
                      >
                        Submit
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
          <div className="modal-content" style={{height: '280px'}}>
            <div className="modal-body" style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
              <div className="form-header">
                <h3 style={{marginBottom: '30px'}}>Delete Shift</h3>
                <p>Are you sure you want to delete <b>{open?.data?.shiftName}</b>?</p>
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

export default Shifts;