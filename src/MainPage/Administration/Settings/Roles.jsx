import { Table, Button, Form, Input, message, TimePicker, Select } from "antd";
import React, { useEffect, useState } from "react";
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "antd/dist/antd.css";
import "../../antdstyle.css";
import Modal from "@mui/material/Modal";
import moment from "moment";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useSelector } from "react-redux";
import AccordianCheckBox from "../../../Components/Accordian";

const Roles = () => {
  const { Option } = Select;

  const login = useSelector((state) => state.user.loginvalue);
  useEffect(() => {
    console.log("login==========", login);
  }, []);

  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });
  const [openPermissions, setOpenPermissions] = useState({
    isOpen: false,
    data: "",
  });

  const [datas, setData] = useState([
    { id: 1, roleName: "slab name 1", permissions: [{ all: true }] },
    { id: 2, roleName: "slab name 2", permissions: [{ all: false }] },
  ]);

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, isEditOpen: false, data: "" });
  };
  const handlePermClose = () => {
    setOpenPermissions({ isOpen: false, data: "" });
  };
  const handleEditClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, isEditOpen: false, data: "" });
  };

  const columns = [
    {
      title: "#",
      dataIndex: "",
      width: 50,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Role Name",
      dataIndex: "roleName",
      // sorter: (a, b) => a.shiftName.length - b.shiftName.length,
    },
    {
      title: "Module Access",
      dataIndex: "permissions",
      // sorter: (a, b) => a.maxStartTime.length - b.maxStartTime.length,
      render: (record, row) => {
        return (
          <span>
            {record?.map((d) =>
              d?.all ? "Full Permissions" : "Custom Permissions"
            )}
          </span>
        );
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

  const onFinish = (values) => {
    console.log("submit", values);
    setOpenPermissions({ isOpen: true, data: "" });
    handleClose();
    // message.success('Role and Permissions Added Successfully!')
  };
  const onFinish2 = (values) => {
    handlePermClose();
    message.success("Role and Permissions Added Successfully!");
  };
  const onFinish3 = (values) => {
    handleEditClose();
    message.success("Role and Permissions Updated Successfully!");
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
                onFinishFailed={() =>
                  message.error("Please Fill Required Fields!")
                }
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
                            required: true,
                            message: "please enter role name",
                          },
                        ]}
                        className="custom-border"
                      >
                        <Input className="form-control" autoFocus />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="submit-section">
                    <Form.Item>
                      <Button
                        htmlType="submit"
                        className="btn btn-primary submit-btn"
                      >
                        Next
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
                    <a
                      href="javascript:void(0)"
                      className="btn btn-primary continue-btn"
                    >
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

      {/* permissions modal */}
      <Modal
        open={openPermissions?.isOpen}
        // open={openPermissions?.isOpen}
        onClose={handlePermClose}
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
              <h5 className="modal-title">Permissions</h5>
              <button type="button" className="close" onClick={handlePermClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                // form={form}
                name="control-hooks"
                onFinish={onFinish2}
                onFinishFailed={() =>
                  message.error("Please Fill Required Fields!")
                }
                initialValues={
                  {
                    // roleName: open?.data ? open?.data?.roleName : '',
                  }
                }
              >
                {/* <div className="table-responsive m-t-15">
                     <table className="table table-striped custom-table">
                       <thead>
                         <tr>
                           <th>Module Permission</th>
                           <th className="text-center">Read</th>
                           <th className="text-center">Write</th>
                           <th className="text-center">Create</th>
                           <th className="text-center">Delete</th>
                           <th className="text-center">Import</th>
                           <th className="text-center">Export</th>
                         </tr>
                       </thead>
                       <tbody>
                         <tr key={1}>
                           <td>Holidays</td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                         </tr>
                         <tr key={2}>
                           <td>Leaves</td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                         </tr>
                         <tr key={3}>
                           <td>Clients</td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                         </tr>
                         <tr key={4}>
                           <td>Projects</td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                         </tr>
                         <tr key={5}>
                           <td>Tasks</td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                         </tr>
                         <tr key={6}>
                           <td>Chats</td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                         </tr>
                         <tr key={7}>
                           <td>Assets</td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                         </tr>
                         <tr key={8}>
                           <td>Timing Sheets</td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input defaultChecked type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                           <td className="text-center">
                             <input type="checkbox" />
                           </td>
                         </tr>
                       </tbody>
                     </table>
                   </div> */}
                {/* <Accordion>
                  <AccordionSummary
                    // expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ width: "33%", flexShrink: 0 }}>
                      <FormControlLabel
                        label={
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: "700",
                              color: "#151515",
                            }}
                          >
                            label
                          </span>
                        }
                        control={
                          <Checkbox
                            id="1"
                            checked={true}
                            // indeterminate={item?.subPermissions?.every(subObj => subObj.checked === true ? true : false) ? false
                            //     : item?.subPermissions?.some(subObj => subObj.checked === true ? true : false)}
                            // onChange={(e) => handleCheckboxAll(e, item)}
                          />
                        }
                      />
                    </Typography>
                    <Typography
                      sx={{
                        marginTop: "10px",
                        fontSize: "14px",
                        color: "#151515de",
                      }}
                    >
                      description
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", ml: 3 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <Typography sx={{ width: "31%", flexShrink: 0 }}>
                          <FormControlLabel
                            label={
                              <span
                                style={{ fontSize: "14px", color: "#151515" }}
                              >
                                title
                              </span>
                            }
                            control={<Checkbox checked={false} />}
                          />
                        </Typography>
                        <Typography
                          sx={{ fontSize: "14px", color: "#151515de" }}
                        >
                          sub description
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionDetails>
                </Accordion> */}

                <AccordianCheckBox />


                {/* <div className="submit-section">
                  <Form.Item>
                    <Button
                      htmlType="submit"
                      className="btn btn-primary submit-btn"
                    >
                      Submit
                    </Button>
                  </Form.Item>
                </div> */}
              </Form>
            </div>
          </div>
        </div>
      </Modal>

            {/* permissions modal */}
            <Modal
        open={open?.isEditOpen}
        // open={openPermissions?.isOpen}
        onClose={handleEditClose}
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
                onFinish={onFinish3}
                onFinishFailed={() =>
                  message.error("Please Fill Required Fields!")
                }
                initialValues={
                  {
                    roleName: open?.data ? open?.data?.roleName : '',
                  }
                }
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
                            required: true,
                            message: "please enter role name",
                          },
                        ]}
                        className="custom-border"
                      >
                        <Input className="form-control" autoFocus />
                      </Form.Item>
                    </div>
                  </div>

                  <AccordianCheckBox />

                  {/* <div className="submit-section">
                    <Form.Item>
                      <Button
                        htmlType="submit"
                        className="btn btn-primary submit-btn"
                      >
                        Submitt
                      </Button>
                    </Form.Item>
                  </div> */}
                </div>

                


                {/* <div className="submit-section">
                  <Form.Item>
                    <Button
                      htmlType="submit"
                      className="btn btn-primary submit-btn"
                    >
                      Submit
                    </Button>
                  </Form.Item>
                </div> */}
              </Form>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Roles;
