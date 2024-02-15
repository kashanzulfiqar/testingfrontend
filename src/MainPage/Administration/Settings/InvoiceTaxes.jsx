import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';
import Offcanvas from '../../../Entryfile/offcanvance';
import { Button, Empty, Form, Input, Pagination, Select, Spin, Table, message } from 'antd';
import { itemRender } from '../../paginationfunction';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { useSelector } from 'react-redux';
import { apiServices } from '../../../Services/apiServices';
import { Modal } from '@mui/material';
import { LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';


const InvoiceTaxes = () => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const user_state = useSelector((state) => state.user.loginvalue);
  //const permissions = useSelector((state) => state?.permissionsSlice?.data);
  // const role = user_state?.user?.role
  //console.log(permissions,user_state)
  //const nav = useNavigate();

  const [taxes, setTaxes] = useState([]);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [loader, setLoader] = useState(false);

  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
    setLoader(false);
  };

  useEffect( ()=>{
    if($('.select').length > 0) {
      $('.select').select2({
        minimumResultsForSearch: -1,
        width: '100%'
      });
    }
  });  

  useEffect( ()=>{
    setIsLoading(true);
    ViewTaxes();
  },[]);  

  const ViewTaxes = () => {
    apiServices(
      "GET",
      `invoices-tax-slab`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
            setTaxes(res?.data?.invoicesTaxSlab)
            //console.log(res?.data?.invoicesTaxSlab)
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error getting invoice taxes"
          }`
        );
      }).then(()=>{
        setIsLoading(false);
      });
  };

  const onHandleDelete = (id) => {
    setLoader(true);
    apiServices("DELETE", "invoices-tax-slab", id, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // console.log(data);
          setTaxes([...taxes.filter((tax) => tax._id !== id)]);
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
    //console.log(info)
    setLoader(true);
    if (info) {
      let updated_data = {
        ...values,
        companyId: info?.companyId,
        _id: info?._id,
      };
      apiServices("PUT", "invoices-tax-slab", updated_data, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            // console.log(data);
            setTaxes(
              taxes.map((taxslab) => {
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
      apiServices("POST", "invoices-tax-slab", values, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            // console.log(data);
            setTaxes([
              ...taxes,
              {
                ...values,
                _id: res?.data?.taxSlab?._id,
                status: res?.data?.taxSlab?.status,
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

  const handleUpdateStatus = (record, newStatus) => {

    let updatedData = {
        title: record?.title,
        status: newStatus,
        companyId: record?.companyId,
        _id: record?._id,
      };

    const apiUrl = `invoices-tax-slab`; 
    apiServices("PUT", apiUrl, updatedData, user_state)
      .then((res) => {
        if (res.data.success === true) {
            setTaxes((taxes) =>
            taxes.map((taxslab) =>
              taxslab._id === record._id
                ? {
                    ...taxslab,
                    status: newStatus, 
                  }
                : taxslab
            )
          );
          message.success(`Tax status updated to ${newStatus}`);
        }
      })
      .catch((error) => {
        console.log("error", error);
        message.error('Failed to update tax status');
      });
  };

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
            Click 'Add New Tax Slab' Button To Create <br /> A New Invoice Tax Slab{" "}
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

  const columns = [
    {
      title: "#",
      dataIndex: "",
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Slab Name",
      dataIndex: "title",
    },
    {
      title: "Tax Percentage (%)",
      dataIndex: "taxPercent",
      
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text, record) => (
        <div>
          <a
            className={`btn btn-white btn-sm btn-rounded dropdown-toggle`}
            href={text !== 'Active' && text !== 'In-Active' ? "javascript:void(0)" : undefined}
            data-bs-toggle={"dropdown"}
            aria-expanded="false"
            onClick={(e) => e.preventDefault()}
          >
            <i
              className={`fa ${
                text === 'Active'
                  ? 'fa-dot-circle-o text-success'
                  : text === 'In-Active'
                  ? 'fa-dot-circle-o text-danger'
                  : 'fa-dot-circle-o text-danger'
              }`}
            />{' '}
            {text}
          </a>
          {/* <div className={`dropdown-menu dropdown-menu-right`}>
            
            <a className={`dropdown-item ${text === 'Active'}`} href="javascript:void(0)" onClick={(e) => {
              e.preventDefault();
              handleUpdateStatus(record, 'Active')
            }}>
  
              <i className="fa fa-dot-circle-o text-success" /> Active
            </a>
            <a className={`dropdown-item ${text === 'In-Active'}`} href="javascript:void(0)" onClick={(e) => {
              e.preventDefault();
              handleUpdateStatus(record, 'In-Active')
              }}>
  
              <i className="fa fa-dot-circle-o text-danger" /> In-Active
            </a>
          </div> */}
          <div className={`dropdown-menu dropdown-menu-right`}>
        <a
          className={`dropdown-item ${text === 'Active' ? 'disabled text-muted' : ''}`}
          href="javascript:void(0)"
          onClick={(e) => {
            if (text !== 'Active') {
              e.preventDefault();
              handleUpdateStatus(record, 'Active');
            }
          }}
        >
          <i className="fa fa-dot-circle-o text-success" /> Active
        </a>
        <a
          className={`dropdown-item ${text === 'In-Active' ? 'disabled text-muted' : ''}`}
          href="javascript:void(0)"
          onClick={(e) => {
            if (text !== 'In-Active') {
              e.preventDefault();
              handleUpdateStatus(record, 'In-Active');
            }
          }}
        >
          <i className="fa fa-dot-circle-o text-danger" /> In-Active
        </a>
      </div>
        </div>
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
  
      return (
        <>
      <div>
        {/* <div className="content container-fluid"> */}
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center pt-3 pb-3">
            <div className="col">
              <h3 className="page-title">Invoice Tax Slabs</h3>
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
                data-bs-target="#add_leavetype"
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
                loading={isLoading}
                locale={{
                    emptyText: isLoading ? null : customEmptyText,
                  }}
                className={
                    taxes?.length > 0 ? "table-striped antTableResponsive" : ""
                  }
                // pagination={{
                //   total: taxes?.length,
                //   pageSize: pageSize,
                //   defaultCurrent: 1,
                //   current: currentPage,
                //   // pageSize: 1,
                //   // hideOnSinglePage: true,
                //   showTotal: (total, range) =>
                //     `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                //   showSizeChanger: true,
                //   onShowSizeChange: (current, size) => {
                //     setPageSize(size);
                //     setCurrentPage(1);
                //   },
                //   pageSizeOptions: ["20", "30", "40", "50"],
                //   onChange: (page, size) => setCurrentPage(page),
                //   itemRender: itemRender,
                // }}
                pagination={false}
                style = {{overflowX : 'auto', paddingBottom: '70px'}}
                columns={columns}
                bordered
                dataSource={taxes.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
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
            {
                    taxes?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        total={taxes?.length}
                        pageSize={pageSize}
                        current={currentPage}
                        showTotal={(total, range) =>
                          t('paginationShow', { range1: range[0], range2: range[1], total: total })}
                        showSizeChanger
                        onShowSizeChange={(current, size) => {
                          setPageSize(size);
                          setCurrentPage(1);
                        }}
                        pageSizeOptions={["20", "30", "40", "50"]}
                        onChange={(page, size) => setCurrentPage(page)}
                        itemRender={(current, type, originalElement) =>
                          itemRender(current, type, originalElement, t)
                        }
                      />
                    </div>
                  }
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
            {open?.data ? (
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
                  taxPercent: open?.data
                    ? open?.data?.taxPercent
                    : "",
                  status: open?.data ? open?.data?.status : "",
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
                        Tax (%) <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="taxPercent"
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
                        Status <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="status"
                        rules={[
                          {
                            required: true,
                            message: "please select a status",
                          },
                        ]}
                        className="custom-border"
                      >
                        <Select
                              className="custom-select custom-normal"
                            //   getPopupContainer={() =>
                            //     document.getElementById("area")
                            //   }
                              placeholder="Select a Status"
                            >
                              <Select.Option value="Active">
                                Active
                              </Select.Option>
                              <Select.Option value="In-Active">
                                In-Active
                              </Select.Option>
                            </Select>
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
            )
            :
            (
              <div className="modal-body">
              <Form
                // form={form}
                name="control-hooks"
                onFinish={(val) => onFinish(val)}
                onFinishFailed={({errorFields}) => {
                  const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                  if(consecutiveSpacesError){
                    message.error("Please Remove Consecutive Spaces!")
                  }else{
                    message.error("Please Fill Required Fields!")
                  }
                }}
                initialValues={{
                  title: "",
                  taxPercent: "",
                }}
              >
                <div className="row">
                  <div className="col-sm-6">
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
                        Tax (%) <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="taxPercent"
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
            )
            }
            
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

      {/* Add Tax Modal */}
      <div id="add_tax" className="modal custom-modal fade" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Tax</h5>
              <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label>Tax Name <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" />
                </div>
                <div className="form-group">
                  <label>Tax Percentage (%) <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" />
                </div>
                <div className="form-group">
                  <label>Status <span className="text-danger">*</span></label>
                  <select className="select">
                    <option>Pending</option>
                    <option>Approved</option>
                  </select>
                </div>
                <div className="submit-section">
                  <button className="btn btn-primary submit-btn">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Add Tax Modal */}
      {/* Edit Tax Modal */}
      <div id="edit_tax" className="modal custom-modal fade" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Tax</h5>
              <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label>Tax Name <span className="text-danger">*</span></label>
                  <input className="form-control" defaultValue="VAT" type="text" />
                </div>
                <div className="form-group">
                  <label>Tax Percentage (%)  <span className="text-danger">*</span></label>
                  <input className="form-control" defaultValue="14%" type="text" />
                </div>
                <div className="form-group">
                  <label>Status <span className="text-danger">*</span></label>
                  <select className="select">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div className="submit-section">
                  <button className="btn btn-primary submit-btn">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Edit Tax Modal */}
      {/* Delete Tax Modal */}
      <div className="modal custom-modal fade" id="delete_tax" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Delete Tax</h3>
                <p>Are you sure want to delete?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <a href="" className="btn btn-primary continue-btn">Delete</a>
                  </div>
                  <div className="col-6">
                    <a href="" data-bs-dismiss="modal" className="btn btn-primary cancel-btn">Cancel</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Delete Tax Modal */}
    <Offcanvas/>
        </> 
      
      );
   
}

export default InvoiceTaxes;