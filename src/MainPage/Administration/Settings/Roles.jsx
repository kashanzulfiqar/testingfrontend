import { Table, Button, Form, Input, message, Empty, Select, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "antd/dist/antd.css";
import "../../antdstyle.css";
import Modal from "@mui/material/Modal";
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSelector } from "react-redux";
import AccordianCheckBox from "../../../Components/Accordian";
import { apiServices } from "../../../Services/apiServices";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { LoadingOutlined } from "@ant-design/icons";
import PermissionsTable from "../../../Components/PermissionsTable";
import { useTranslation } from "react-i18next";

const Roles = () => {
  const { Option } = Select;
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state.user.loginvalue);
  let comp_id = user_state?.user?.companyId;

  const [updatePermissions, setUpdatePermissions] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [templateLoader, setTemplateLoader] = useState(false);
  const [rolePermeLoader, setRolePermLoader] = useState(false);
  const [tableLoader, setTableLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });
  const [openPermissions, setOpenPermissions] = useState({
    isOpen: false,
    data: "",
  });
  const [data, setData] = useState([]);

  useEffect(() => {
    getRole();
  }, []);

  const getRole = () => {
    setTableLoader(true);
    apiServices("GET", "role/view-role", null, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          setData(res?.data?.Role);
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
              : "Get Role Info Error"
          }`
        );
      });
  };

  const getPermissionsTemplate = () => {
    setTemplateLoader(true);
    apiServices("GET", "permissions-template", null, user_state)
      .then((res) => {
        console.log(res?.data);
        if (res?.data?.success === true) {
          setPermissions(res?.data?.PermissionsTemplate);
          setTemplateLoader(false);
        }
      })
      .catch((err) => {
        setTemplateLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Get Permissions Template Info Error"
          }`
        );
      });
  };

  const getRolePermissions = (row_data) => {
    setRolePermLoader(true);
    apiServices("GET", `permissions/?roleId=${row_data?._id}`, null, user_state)
      .then((res) => {
        console.log(res?.data);
        if (res?.data?.success === true) {
          setPermissions(res?.data?.permissions?.permissions);
          setUpdatePermissions(res?.data?.permissions);
          setRolePermLoader(false);
        }
      })
      .catch((err) => {
        setRolePermLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Get Permissions Template Info Error"
          }`
        );
      });
  };

  const handleClose = () => {
    setOpen({
      isAddOpen: false,
      isDelOpen: false,
      isEditOpen: false,
      data: "",
    });
    setPermissions([]);
  };
  const handlePermClose = () => {
    apiServices("DELETE", "role/delete-role", openPermissions?.data?._id, user_state)
    .then((res) => {
      // console.log(res?.data);
      if (res?.data?.success === true) {
        setOpenPermissions({ isOpen: false, data: "" });
        setPermissions([]);
      }
    })
    .catch((err) => {
      // console.log(err);
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : "Delete role Error"
        }`
      );
    });
  };
  const handleEditClose = () => {
    setOpen({
      isAddOpen: false,
      isDelOpen: false,
      isEditOpen: false,
      data: "",
    });
    setPermissions([]);
  };

  const onFinish = (values) => {
    setLoader(true)
    apiServices("POST", "role/add-role", values, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          // console.log(data);
          setOpenPermissions({ isOpen: true, data: res?.data?.Role });
          handleClose();
          getPermissionsTemplate();
          setLoader(false)
        }
      })
      .catch((err) => {
        setLoader(false)
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Add Role Info Error"
          }`
        );
      });
  };
  const onAddFinish = (info) => {
    setLoader(true)
    const allpermissions = permissions.every((item) =>
      item.subPermissions.every((subObj) => subObj.checked === true)
    );

    let new_role = {
      _id: info?._id,
      companyId: info?.companyId,
      roleName: info?.roleName,
      customPermissions: allpermissions,
    };

    apiServices("PUT", "role/update-role", new_role, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
        }
      })
      .catch((err) => {
        setLoader(false)
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Add Role Custom Permission Error"
          }`
        );
      });

    let perm_data = {
      roleId: info?._id,
      companyId: comp_id,
      permissions: permissions,
    };
    apiServices("POST", "permissions", perm_data, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          setData([
            ...data,
            {
              ...info,
              customPermissions: allpermissions,
            },
          ]);
          // handlePermClose();
          setOpenPermissions({ isOpen: false, data: "" });
          setPermissions([]);
          message.success("Role and Permissions Added Successfully!");
          setLoader(false)
        }
      })
      .catch((err) => {
        setLoader(false)
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Add Permissions Info Error"
          }`
        );
      });
  };
  const onEditFinish = (values, info) => {
    setLoader(true)
    const allpermissions = permissions.every((item) =>
      item.subPermissions.every((subObj) => subObj.checked === true)
    );

    let updated_data = {
      ...updatePermissions,
      permissions: permissions,
    };
    apiServices("PUT", "permissions", updated_data, user_state)
      .then((res) => {
        // console.log(res?.data);
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
              : "Update Permissions Info Error"
          }`
        );
      });

    let role_data = {
      _id: info?._id,
      companyId: info?.companyId,
      roleName: values?.roleName,
      customPermissions: allpermissions,
    };

    apiServices("PUT", "role/update-role", role_data, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // console.log(data);
          setData(
            data.map((role) => {
              if (role._id === info._id) {
                return {
                  ...role,
                  roleName: values?.roleName,
                  customPermissions: allpermissions,
                };
              } else {
                return {
                  ...role,
                };
              }
            })
          );
          handleEditClose();
          message.success("Role and Permissions Updated Successfully!");
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
              : "Update Role Info Error"
          }`
        );
      });
  };

  const onHandleDelete = (id) => {
    setLoader(true);
    apiServices("DELETE", "role/delete-role", id, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // console.log(data);
          setData([...data.filter((role) => role._id !== id)]);
          handleClose();
          message.success("Role Deleted Successfully!");
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
              : "Delete role Error"
          }`
        );
      });
  };

  const columns = [
    {
      title: "#",
      dataIndex: "",
      width: 50,
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Role Name",
      dataIndex: "roleName",
      // sorter: (a, b) => a.shiftName.length - b.shiftName.length,
    },
    {
      title: "Module Access",
      dataIndex: "customPermissions",
      // sorter: (a, b) => a.maxStartTime.length - b.maxStartTime.length,
      render: (record, row) => {
        return <>{record ? "Full Permissions" : "Custom Permissions"}</>;
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
                  isAddOpen: false,
                  isEditOpen: true,
                  isDelOpen: false,
                  data: row,
                });
                getRolePermissions(row);
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
            No role added yet
          </div>
          <div
            style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
          >
            Click 'Add Role' Button To Create <br /> A New Role{" "}
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
              <h3 className="page-title">Roles</h3>
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
                <i className="fa fa-plus" /> Add Role
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
                  t('paginationShow', { range1: range[0], range2: range[1], total: total }),
                  showSizeChanger: true,
                  onShowSizeChange: (current, size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  },
                  pageSizeOptions: ["20", "30", "40", "50"],
                  onChange: (page, size) => setCurrentPage(page),
                  itemRender: (current, type, originalElement) =>
                    itemRender(current, type, originalElement, t),
                }}
                style={{ overflowX: "auto" }}
                columns={columns}
                bordered
                dataSource={data}
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
              <h5 className="modal-title">Role Name</h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                // form={form}
                name="control-hooks"
                onFinish={onFinish}
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
                  roleName: open?.data ? open?.data?.roleName : "",
                }}
              >
                <div className="row">
                  <div className="col-12">
                    <div className="form-group">
                      <label>
                        Role Name <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="roleName"
                        rules={[
                          {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                              if (value.trim() === "") {
                                return Promise.reject("please enter role name");
                              } else if (/\s{2,}/.test(value)) {
                                return Promise.reject(
                                  "please remove consecutive spaces"
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        className="custom-border"
                      >
                        <Input
                          className="form-control"
                          maxLength={50}
                          autoFocus
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
                        {
                          loader ? <Spin size="small" indicator={antIcon} />
                            : 'Next'
                        }
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
                <h3 style={{ marginBottom: "30px" }}>Delete Role</h3>
                <p>
                  Are you sure you want to delete <b>{open?.data?.roleName}</b>?
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

      {/* Add permissions modal */}
      <Modal
        open={openPermissions?.isOpen}
        // open={openPermissions?.isOpen}
        onClose={handlePermClose}
        className="modalScroll"
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
        }}
        sx={{
          overflowY: "scroll",
        }}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content" style={{ minHeight: "580px" }}>
            <div className="modal-header">
              <h5 className="modal-title">Permissions</h5>
              <button type="button" className="close" onClick={handlePermClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              {templateLoader ? (
                <Spin
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "25%",
                  }}
                />
              ) : (
                <Form
                  // form={form}
                  name="control-hooks"
                  onFinish={() => onAddFinish(openPermissions?.data)}
                >
                  <PermissionsTable
                    permissions={permissions}
                    setPermissions={setPermissions}
                  />
                  {/* <AccordianCheckBox
                    permissions={permissions}
                    setPermissions={setPermissions}
                  /> */}

                  <div className="submit-section">
                    <Form.Item>
                      <Button
                        htmlType="submit"
                        className="btn btn-primary submit-btn"
                        disabled={loader}
                      >
                        {
                          loader ? <Spin size="small" indicator={antIcon} />
                            : 'Submit'
                        }
                      </Button>
                    </Form.Item>
                  </div>
                </Form>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit permissions modal */}
      <Modal
        open={open?.isEditOpen}
        // open={openPermissions?.isOpen}
        onClose={handleEditClose}
        className="modalScroll"
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
        }}
        sx={{
          overflowY: "scroll",
        }}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Role & Permissions</h5>
              <button type="button" className="close" onClick={handleEditClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                // form={form}
                name="control-hooks"
                onFinish={(val) => onEditFinish(val, open?.data)}
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
                  roleName: open?.data ? open?.data?.roleName : "",
                }}
              >
                <div className="row">
                  <div className="col-12">
                    <div className="form-group">
                      <label>
                        Role Name <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="roleName"
                        rules={[
                          {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                              if (value.trim() === "") {
                                return Promise.reject("please enter role name");
                              } else if (/\s{2,}/.test(value)) {
                                return Promise.reject(
                                  "please remove consecutive spaces"
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        className="custom-border"
                      >
                        <Input
                          className="form-control"
                          maxLength={50}
                          autoFocus
                        />
                      </Form.Item>
                    </div>
                  </div>
                  {rolePermeLoader ? (
                    <Spin
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "20%",
                        marginBottom: "20%",
                      }}
                    />
                  ) : (
                    <PermissionsTable
                      permissions={permissions}
                      setPermissions={setPermissions}
                    />
                    // <AccordianCheckBox
                    //   permissions={permissions}
                    //   setPermissions={setPermissions}
                    // />
                  )}
                </div>

                <div className="submit-section">
                  <Form.Item>
                    <Button
                      htmlType="submit"
                      className="btn btn-primary submit-btn"
                      disabled={loader}
                    >
                      {
                        loader ? <Spin size="small" indicator={antIcon} />
                          : 'Submit'
                      }
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Roles;
