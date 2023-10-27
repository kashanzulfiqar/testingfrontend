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


const ExpenseCategory = () => {

  const [isLoading, setIsLoading] = useState(false);
  const user_state = useSelector((state) => state.user.loginvalue);
  //const permissions = useSelector((state) => state?.permissionsSlice?.data);
  // const role = user_state?.user?.role
  //console.log(permissions,user_state)
  //const nav = useNavigate();

  const [category, setCategory] = useState([]);
  const [categoryObj, setCategoryObj] = useState();
  const [loader, setLoader] = useState(false);
  const [flag, setFlag] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 10,
  });

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
    if(!flag){
      setIsLoading(true);
      //console.log("flag false")
      viewCategory();
    }
    
  },[pagination.current, pagination.pageSize]);  

  const viewCategory = (page, pageSize) => {
    const params = {
      page: page || pagination.current,
      limit: pageSize ? pageSize : pagination.pageSize,
    };
    apiServices(
      "GET",
      `expenses-category/?page=${params.page}&limit=${params.limit}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
            setCategoryObj(res?.data?.Categories);
            setCategory(res?.data?.Categories?.docs)
            setFlag(true);
            setPagination({
              ...pagination,
              current : res.data.Categories.page,
              total: res.data.Categories.totalDocs,
            });
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
              : "Error getting expense category"
          }`
        );
      }).then(()=>{
        setIsLoading(false);
        setFlag(false);
      });
  };

  const onHandleDelete = (id) => {
    setLoader(true);
    apiServices("DELETE", "expenses-category", id, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // console.log(data);
          // setCategory([...category.filter((category) => category._id !== id)]);
          if(categoryObj?.docs?.length === 1){
            console.log(categoryObj.totalPages)
            viewCategory((categoryObj.totalPages-1),null);
          }
          else{
            viewCategory()
          }
          handleClose();
          message.success("Expense Category Deleted Successfully!");
          //viewCategory();
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
              : "Delete Expense Category Error"
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
      apiServices("PUT", "expenses-category", updated_data, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            // console.log(data);
            // setCategory(
            //   category.map((category) => {
            //     if (category._id === info._id) {
            //       return {
            //         ...category,
            //         ...values,
            //       };
            //     } else {
            //       return {
            //         ...category,
            //       };
            //     }
            //   })
            // );
            viewCategory();
            handleClose();
            message.success("Expense Category Updated Successfully");
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
      apiServices("POST", "expenses-category", values, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            // console.log(data);
            // setCategory([
            //   ...category,
            //   {
            //     ...values,
            //     _id: res?.data?.Category?._id,
            //   },
            // ]);
            viewCategory();
            handleClose();
            message.success("Expense Category Added Successfully");
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
                : "Add Expense Category Error"
            }!`
          );
        });
    }
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
            No expense category added yet
          </div>
          <div
            style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
          >
            Click 'Add Category' Button To Create <br /> A New Expense Category{" "}
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
    // {
    //   title: "#",
    //   dataIndex: "",
    //   render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    // },
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: 50,
      render: (text, record, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Category Name",
      dataIndex: "expenseCategoryName",
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
              <h3 className="page-title">Expense Categories</h3>
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
                <i className="fa fa-plus" /> Add Category
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
                className={
                  category?.length > 0 ? "table-striped" : ""
                }
                locale={{
                    emptyText: isLoading ? null : customEmptyText,
                  }}
                pagination={false}
                // pagination={{
                //   total: category?.length,
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
                //   pageSizeOptions: ["10", "20", "40", "50"],
                //   onChange: (page, size) => setCurrentPage(page),
                //   itemRender: itemRender,
                // }}
                style = {{overflowX : 'auto', paddingBottom: '70px'}}
                columns={columns}
                bordered
                dataSource={category}
                rowKey={(record) => record.id}
                // onChange={this.handleTableChange}
              />
              {
                    category?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        showTotal={(total, range) =>
                          `Showing ${range[0]} to ${range[1]} of ${total} entries`
                        }
                        pageSizeOptions={["20", "30", "40", "50"]}
                        showSizeChanger
                        onChange={(page, pageSize) => setPagination({...pagination, current: page, pageSize: pageSize,})}
                        itemRender={itemRender}
                        disabled={isLoading}
                      />
                    </div>
                  }
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
                {open?.data ? "Update" : "Add"} Category
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
                  expenseCategoryName: open?.data ? open?.data?.expenseCategoryName : "",
                }}
                autoComplete="off"
              >
                <div className="form-group">
                  <label>
                    Category Name <span className="text-danger">*</span>
                  </label>
                  <Form.Item
                    name="expenseCategoryName"
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        validator: (_, value) => {
                          if(value.trim() === ''){
                            return Promise.reject("please enter category name");
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
                <h3 style={{ marginBottom: "30px" }}>Delete Category</h3>
                <p>
                  Are you sure you want to delete <b>{open?.data?.expenseCategoryName}</b>?
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

export default ExpenseCategory;