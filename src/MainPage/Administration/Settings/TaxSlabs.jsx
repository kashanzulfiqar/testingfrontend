import { Table, Button, Form, Input, message, TimePicker, Select } from "antd";
import React, { useState } from "react";
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "antd/dist/antd.css";
import "../../antdstyle.css";
import Modal from "@mui/material/Modal";
import moment from "moment";


const TaxSlabs = () => {

  const { Option } = Select;

  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });

  const [datas, setData] = useState([
    { id: 1, slabName: "slab name 1", yearlyPayLowerLimit: '120000', yearlyPayUpperLimit: '100', tax: '14', fixTax: '5'},
    { id: 2, slabName: "slab name 2", yearlyPayLowerLimit: '211100', yearlyPayUpperLimit: '5100', tax: '12', fixTax: '10'},
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
      title: "Slab Name",
      dataIndex: "slabName",
      // sorter: (a, b) => a.shiftName.length - b.shiftName.length,
    },
    {
      title: "Lower Limit",
      dataIndex: "yearlyPayLowerLimit",
      // sorter: (a, b) => a.maxStartTime.length - b.maxStartTime.length,
      render: (record, row) => {
        const record_yearlyPayLowerLimit = record?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return ( 
        <span>
          {record_yearlyPayLowerLimit}
        </span>
      )}
    },
    {
      title: "Upper Limit",
      dataIndex: "yearlyPayUpperLimit",
      // sorter: (a, b) => a.startTime.length - b.startTime.length,
      render: (record, row) => {
        const record_yearlyPayUpperLimit = record?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return ( 
        <span>
          {record_yearlyPayUpperLimit}
        </span>
      )}
    },
    {
      title: "Tax",
      dataIndex: "tax",
      // sorter: (a, b) => a.endTime.length - b.endTime.length,
      render: (record, row) => {
        return ( 
        <span>
          {record}%
        </span>
      )}
    },
    {
      title: "Fix Tax",
      dataIndex: "fixTax",
      render: (record, row) => {
        return ( 
        <span>
          {record}%
        </span>
      )}
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
    console.log('submit',values);
    handleClose();
    message.success('Tax Slab Added Successfully')
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
              <h3 className="page-title">Tax Slabs</h3>
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
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
        }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Tax Slab</h5>
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
                  slabName: open?.data ? open?.data?.slabName : '',
                  yearlyPayLowerLimit: open?.data ? open?.data?.yearlyPayLowerLimit : '',
                  yearlyPayUpperLimit: open?.data ? open?.data?.yearlyPayUpperLimit : '',
                  tax: open?.data ? open?.data?.tax : '',
                  fixTax: open?.data ? open?.data?.fixTax : '',
                }}
              >
                <div className="row">

                  <div className="col-12">
                    <div className="form-group">
                      <label>
                        Slab Name <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="slabName"
                        rules={[
                          {
                            required: true,
                            message: "please enter slab name",
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
                        Yearly Pay Lower Limit <span className="text-danger">*</span>
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
                            if ( (e.which !== 46 && (e.which < 48 || e.which > 57)) ) {
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
                      Yearly Pay Upper Limit <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="yearlyPayUpperLimit"
                        rules={[
                          {
                            required: true,
                            message: "please enter upper limit",
                          },
                        ]}
                        className="custom-border"
                      >
                        <Input
                          className="form-control"
                          onKeyPress={(e) => {
                            if ( (e.which !== 46 && (e.which < 48 || e.which > 57)) ) {
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
                        name="tax"
                        rules={[
                          {
                            required: true,
                            message: "please enter tax percentage",
                          },
                        ]}
                        className="custom-border"
                      >
                        <Input
                          className="form-control"
                          onKeyPress={(e) => {
                            if ( (e.which !== 46 && (e.which < 48 || e.which > 57)) ) {
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
                        name="fixTax"
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
                            if ( (e.which !== 46 && (e.which < 48 || e.which > 57)) ) {
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
                <h3 style={{marginBottom: '30px'}}>Delete Tax Slab</h3>
                <p>Are you sure you want to delete <b>{open?.data?.slabName}</b>?</p>
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

export default TaxSlabs;