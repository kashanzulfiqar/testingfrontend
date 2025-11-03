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
  const [openViewUsers, setOpenViewUsers] = useState({
    isOpen: false,
    data: null,
    users: [],
    loading: false,
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
              : t('settings.Roles.getRoleInfoError')
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
              : t('allEmp.errors.getPermTemplateError')
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
              : t('allEmp.errors.getPermTemplateError')
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
    let Data = openPermissions?.data;
    apiServices("DELETE", "role/delete-role", Data, user_state)
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
            : t('settings.Roles.deleteRoleError')
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
              : t('settings.Roles.addRoleInfoError')
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
              : t('settings.Roles.addRoleCustomPermissionError')
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
          message.success(t('allEmp.errors.rolePermAdded'));
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
              : t('allEmp.errors.addRoleError')
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
              : t('settings.Roles.updatePermissionsInfoError')
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
          message.success(t('settings.Roles.rolePermissionsUpdated'));
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
              : t('settings.Roles.updateRoleInfoError')
          }`
        );
      });
  };

  const onHandleDelete = (Data) => {
    setLoader(true);
    apiServices("DELETE", "role/delete-role", Data, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // console.log(data);
          setData([...data.filter((role) => role._id !== Data?._id)]);
          handleClose();
          message.success(t('settings.Roles.roleDeletedSuccessfully'));
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
              : t('settings.Roles.deleteRoleError')
          }`
        );
      });
  };

  const handleViewUsers = (roleData) => {
    setOpenViewUsers({
      isOpen: true,
      data: roleData,
      users: [],
      loading: true,
    });

    apiServices("GET", `user/view-user?userRole=${roleData._id}&deleted=false`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setOpenViewUsers((prev) => ({
            ...prev,
            users: res?.data?.users?.docs || [],
            loading: false,
          }));
        }
      })
      .catch((err) => {
        setOpenViewUsers((prev) => ({
          ...prev,
          loading: false,
        }));
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('allEmp.errors.getEmployeesError')
          }`
        );
      });
  };

  const handleViewUsersClose = () => {
    setOpenViewUsers({
      isOpen: false,
      data: null,
      users: [],
      loading: false,
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
      title: t('settings.Roles.roleName'),
      dataIndex: "roleName",
      // sorter: (a, b) => a.shiftName.length - b.shiftName.length,
    },
    {
      title: t('settings.Roles.moduleAccess'),
      dataIndex: "customPermissions",
      render: (record, row) => {
        return <>{record ? "Full Permissions" : "Custom Permissions"}</>;
      },
    },
    {
      title: "",
      width: 60,
      align: "center",
      render: (record, row) => (
        <a
          href="javascript:void(0)"
          onClick={() => handleViewUsers(row)}
          style={{
            color: "#ff9b44",
            fontSize: "18px",
            transition: "color 0.3s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e76f51")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#ff9b44")}
          title="View Users"
        >
          <i className="fa fa-eye" />
        </a>
      ),
    },
    {
      title: t('settings.Roles.actions'),
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
              <i className="fa fa-pencil m-r-5" /> {t('edit')}
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
              <i className="fa fa-trash-o m-r-5" /> {t('delete')}
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
            {t('settings.Roles.noRoleAdded')}
          </div>
          <div
            style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
          >
            {t('settings.Roles.clickToAddRole')} <br /> {t('settings.Roles.newRole')}{" "}
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
              <h3 className="page-title">{t('settings.roles')}</h3>
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
                <i className="fa fa-plus" /> {t('settings.Roles.addRole')}
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
              <h5 className="modal-title">{t('settings.Roles.roleName')}</h5>
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
                  if(consecutiveSpacesError){
                    message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                 }else{
                    message.error(t('allEmp.errors.fillRequiredFields'))
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
                      {t('settings.Roles.roleName')} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="roleName"
                        rules={[
                          {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                              if (value.trim() === "") {
                                return Promise.reject(t('settings.Roles.enterRoleName'));
                              } else if (/\s{2,}/.test(value)) {
                                return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
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
                <h3 style={{ marginBottom: "30px" }}>{t('settings.Roles.deleteRole')}</h3>
                <p>
                  <span dangerouslySetInnerHTML={{ __html: t('projectScreen.confirmDeleteProject', { project: open?.data?.roleName }) }} />
                </p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <Button
                      htmlType="submit"
                      className="btn btn-primary continue-btn"
                      onClick={() => onHandleDelete(open?.data)}
                      disabled={loader}
                      style={{ width: "100%" }}
                    >
                      {loader ? (
                        <Spin size="small" indicator={antIcon} />
                      ) : (
                        t('delete')
                      )}
                    </Button>
                  </div>
                  <div className="col-6">
                    <Button
                      onClick={handleClose}
                      className="btn btn-primary submit-btn"
                      style={{ width: "100%" }}
                    >
                      {t('cancel')}
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
              <h5 className="modal-title">{t('settings.Roles.editRolePermissions')}</h5>
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
                  if(consecutiveSpacesError){
                    message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                 }else{
                    message.error(t('allEmp.errors.fillRequiredFields'))
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
                      {t('settings.Roles.roleName')} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="roleName"
                        rules={[
                          {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                              if (value.trim() === "") {
                                return Promise.reject(t('settings.Roles.enterRoleName'));
                              } else if (/\s{2,}/.test(value)) {
                                return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
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
                          : t('submit')
                      }
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={openViewUsers.isOpen}
        onClose={handleViewUsersClose}
        aria-labelledby="view-users-modal"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" },
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {openViewUsers.data?.roleName} - Users
              </h5>
              <button type="button" className="close" onClick={handleViewUsersClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body" style={{ minHeight: "300px" }}>
              {openViewUsers.loading ? (
                <Spin
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "100px",
                  }}
                />
              ) : openViewUsers.users.length === 0 ? (
                <Empty
                  image={<img src={EmptyTable} />}
                  imageStyle={{}}
                  style={{
                    height: "250px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                  description={
                    <div>
                      <div
                        style={{
                          color: "#34343F",
                          fontWeight: "500",
                          fontSize: "14px",
                          margin: "7px 0px 4px 0px",
                        }}
                      >
                        No users found
                      </div>
                      <div
                        style={{
                          color: "#464665",
                          fontWeight: "300",
                          fontSize: "13px",
                        }}
                      >
                        There are no users assigned to this role.
                      </div>
                    </div>
                  }
                />
              ) : (
                <div className="table-responsive">
                  <Table
                    className="table-striped"
                    pagination={false}
                    style={{ overflowX: "auto" }}
                    columns={[
                      {
                        title: "#",
                        width: 50,
                        render: (text, record, index) => index + 1,
                      },
                      {
                        title: "Employee Name",
                        dataIndex: "fullName",
                        render: (text, record) => {
                          const displayName = record?.fullName || record?.email || "N/A";
                          const initial = (record?.fullName || record?.email)?.charAt(0)?.toUpperCase() || "U";
                          
                          return (
                            <h2 className="table-avatar">
                              <a href="javascript:void(0)" className="avatar">
                                {record?.imageUrl ? (
                                  <img
                                    alt="User"
                                    src={record.imageUrl}
                                  />
                                ) : (
                                  <span
                                    className="avatar"
                                    style={{
                                      backgroundColor: "#ff9b44",
                                      color: "white",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    {initial}
                                  </span>
                                )}
                              </a>
                              <a href="javascript:void(0)">
                                {displayName}
                              </a>
                            </h2>
                          );
                        },
                      },
                      {
                        title: "Employee ID",
                        dataIndex: "employeeId",
                      },
                      {
                        title: "Email",
                        dataIndex: "email",
                      },
                      {
                        title: "Status",
                        dataIndex: "userStatus",
                        render: (status) => (
                          <span
                            style={{
                              padding: "4px 12px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "500",
                              backgroundColor:
                                status === "Active" ? "#e8f5e9" : "#ffebee",
                              color: status === "Active" ? "#2e7d32" : "#c62828",
                            }}
                          >
                            {status}
                          </span>
                        ),
                      },
                    ]}
                    dataSource={openViewUsers.users}
                    rowKey={(record) => record._id}
                    bordered
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
                        style: { textAlign: 'right' },
                      };
                    } :
                    null
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Roles;
