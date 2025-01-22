import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useParams } from "react-router-dom";
import { user_icon } from "../../../Entryfile/imagepath";
import Editproject from "../../../_components/modelbox/Editproject";
import { useSelector } from "react-redux";
import {
  Avatar,
  Button,
  Checkbox,
  DatePicker,
  Empty,
  Form,
  Input,
  Pagination,
  Select,
  Spin,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import { Modal } from "@mui/material";
import moment from "moment";
import { apiServices } from "../../../Services/apiServices";
import { LoadingOutlined, MinusCircleFilled } from "@ant-design/icons";
import EditProjects from "./EditProjects";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
//import EditProjects from "./EditProjects";
import { getAllISOCodes } from "iso-country-currency";
import { useTranslation } from "react-i18next";

function TaskModal({
  data,
  viewModal,
  closeViewModal,
  getAllTasks,
  getTaskBoard,
  isFromTasksPage = false
}) {
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state.user.loginvalue);
  const employee_id = user_state?.user?._id;
  const role = user_state?.user?.role;
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const nav = useNavigate();
  console.log(data);
  const [taskData, setTaskData] = useState(data);

  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState([]);
  const [loader, setLoader] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tempSelectedTeamMembers, setTempSelectedTeamMembers] = useState([]);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(false);

  useEffect(() => {
    setDescription(data?.description);
    setTags(data?.tags);
    setTitle(data?.title);
    setEmployees(taskData?.ProjectData?.assignedDevelopers || []);
    setSelectedTeamMembers(taskData?.assignedDevelopers || data?.assignedDevelopers || []);
    setTempSelectedTeamMembers(taskData?.assignedDevelopers || []);

    // Initialize form with current values
    form.setFieldsValue({
      title: data?.title,
      description: data?.description,
      tags: data?.tags,
      assignedDevelopers: taskData?.assignedDevelopers?.map((dev) => dev._id),
    });
  }, [data, form, taskData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenStatusDropdown(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleChange = (values) => {
    const selectedEmployees = values?.map((value) =>
      employees?.find((employee) => employee._id === value)
    );
    setTempSelectedTeamMembers(selectedEmployees);
    setSelectedTeamMembers(selectedEmployees);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset all fields to original values
    setDescription(data?.description);
    setTags(data?.tags);
    setTitle(data?.title);
    setSelectedTeamMembers(taskData?.assignedDevelopers || []);
    setTempSelectedTeamMembers(taskData?.assignedDevelopers || []);
    form.setFieldsValue({
      title: data?.title,
      description: data?.description,
      tags: data?.tags,
      assignedDevelopers: taskData?.assignedDevelopers?.map((dev) => dev._id),
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoader(true);
      const data = {
        ...values,
        [taskData?.ProjectData?.projectName ? "projectId" : "boardId"]:
          taskData?.ProjectData?._id,
        _id: taskData?._id,
        assignedDevelopers: tempSelectedTeamMembers.map((dev) => dev._id),
      };

      apiServices("PUT", "tasks", data, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            message.success("Task details updated");
            setLoader(false);
            setIsEditing(false);
            setTitle(values?.title);
            setDescription(values?.description);
            setTags(values?.tags);
            getAllTasks(taskData?.ProjectData?._id);
            closeViewModal();
          }
        })
        .catch((err) => {
          setLoader(false);
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : t("Tasks.updateTaskError")
            }!`
          );
        });
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleUpdateStatus = (boardId, taskId, sourceId, destinationId) => {
    setLoader(true);
    setOpenStatusDropdown(false);
    let updated_data = {
      _id: boardId,
      columnId: destinationId,
      prevColumn: sourceId,
      taskId: taskId
    };
    
    apiServices("PUT", "taskBoard/add-taskBoard", updated_data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          // Find the new column details from allColumns
          const newColumn = taskData?.allColumns?.find(col => col.id === destinationId);
          if (newColumn) {
            // Update the task data with new status
            const updatedTask = {
              ...taskData,
              columnId: destinationId,
              columnColor: newColumn.color,
              columnName: newColumn.title,
              lane: newColumn.title
            };
            setTaskData(updatedTask);
            message.success('Task status updated successfully');
            setLoader(false);
            
            getAllTasks(taskData?.ProjectData?._id);
            getTaskBoard(taskData?.ProjectData?._id);
          }
        }
      })
      .catch((err) => {
        setLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error updating status"
          }!`
        );
      });
  };

  const getTeamMemberOptions = () => {
    return employees?.map((employee) => (
      <Select.Option key={employee._id} value={employee._id}>
        {employee.fullName}
      </Select.Option>
    ));
  };

  return (
    <Modal
      open={viewModal}
      onClose={closeViewModal}
      aria-labelledby="modal-modal-title"
      className="modalScroll"
      aria-describedby="modal-modal-description"
      disableRestoreFocus
      BackdropProps={{
        style: { backgroundColor: "rgb(0 0 0 / 70%)" },
      }}
      sx={{ overflowY: "auto" }}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-xl"
        role="document"
      >
        <div className="modal-content">
          <div
            className="modal-header"
            style={{
              flexDirection: "column",
              position: "relative",
              borderBottom: "1px solid #dee2e6",
              paddingBottom: "15px",
            }}
          >
            <h3
              style={{
                display: "block",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                width: "100%",
                textAlign: "center",
                margin: "0",
                fontWeight: "500",
                color: "#1f1f1f",
                fontSize: "22px",
                paddingRight: "20px",
              }}
            >
              {taskData?.title || data?.title}
            </h3>
            <Form
              form={form}
              layout="vertical"
              className="w-100"
              initialValues={{
                title: title || taskData?.title,
                description: description || taskData?.description,
                tags: tags || taskData?.tags,
                assignedDevelopers: selectedTeamMembers?.map((dev) => dev._id),
              }}
            >
              <div className="modal-body px-0">
                <div className="row">
                  <div className="col-lg-8 col-xl-8">
                    <div className="card">
                      <div className="card-body">
                        <div className="project-title">
                          <h5 className="card-title">Title</h5>
                        </div>
                        {isEditing ? (
                          <Form.Item
                            name="title"
                            className="custom-border mb-4"
                            rules={[
                              {
                                validator: (_, value) => {
                                  if (/\s{2,}/.test(value)) {
                                    return Promise.reject(
                                      t(
                                        "allEmp.errors.removeConsecutiveSpaces2"
                                      )
                                    );
                                  }
                                  return Promise.resolve();
                                },
                              },
                              {
                                required: true,
                                message: "Please enter a title",
                              },
                            ]}
                          >
                            <Input
                              className="form-control"
                              placeholder={t("Tasks.title")}
                              maxLength={50}
                            />
                          </Form.Item>
                        ) : (
                          <label
                            style={{
                              display: "block",
                              padding: "10px",
                              marginBottom: "20px",
                              backgroundColor: "#f9f9f9",
                              borderRadius: "4px",
                            }}
                          >
                            {title || taskData?.title}
                          </label>
                        )}
                        <div className="project-title">
                          <h5 className="card-title">Description</h5>
                        </div>
                        {isEditing ? (
                          <Form.Item
                            name="description"
                            rules={[
                              {
                                required: true,
                                message: "Please enter description",
                              },
                            ]}
                          >
                            <Input.TextArea
                              rows={4}
                              style={{
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                              }}
                            />
                          </Form.Item>
                        ) : (
                          <label
                            style={{
                              display: "block",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              maxHeight: "300px",
                              overflowY: "auto",
                              padding: "10px",
                              backgroundColor: "#f9f9f9",
                              borderRadius: "4px",
                            }}
                          >
                            {description || taskData?.description}
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-4 col-xl-4">
                    <div className="card">
                      <div className="card-body">
                        <h6 className="card-title m-b-15">Task Details</h6>
                        <div className="table-responsive">
                          <table className="table table-striped table-border">
                            <tbody>
                              {taskData?.ProjectData?.projectName ? (
                                <tr>
                                  <td style={{ display: "flex", alignItems: "flex-start" }}>
                                    <span style={{ whiteSpace: "nowrap" }}>Project:</span>
                                    <span style={{ 
                                    wordBreak: "break-word",
                                      whiteSpace: "normal",
                                      marginLeft: "4px",
                                      flex: 1
                                  }}>
                                    {taskData?.ProjectData?.projectName}
                                    </span>
                                  </td>
                                </tr>
                              ) : data?.projectId?.projectName ? (
                                <tr>
                                  <td style={{ display: "flex", alignItems: "flex-start" }}>
                                    <span style={{ whiteSpace: "nowrap" }}>Project:</span>
                                    <span style={{ 
                                    wordBreak: "break-word",
                                      whiteSpace: "normal",
                                      marginLeft: "4px",
                                      flex: 1
                                  }}>
                                    {data?.projectId?.projectName}
                                    </span>
                                  </td>
                                </tr>
                              ) : (
                                <tr>
                                  <td style={{ display: "flex", alignItems: "flex-start" }}>
                                    <span style={{ whiteSpace: "nowrap" }}>Task Board:</span>
                                    <span style={{ 
                                    wordBreak: "break-word",
                                      whiteSpace: "normal",
                                      marginLeft: "4px",
                                      flex: 1
                                  }}>
                                    {taskData?.ProjectData?.boardTitle || data?.boardId?.boardTitle}
                                    </span>
                                  </td>
                                </tr>
                              )}
                              <tr>
                                <td style={{ whiteSpace: "nowrap" }}>Task Status:
                                  {isFromTasksPage ? (
                                    <span style={{ display: "inline-block", marginLeft: "4px" }}>
                                      <i className={`fa fa-dot-circle-o text-${taskData?.columnColor || data?.columnColor}`} />{" "}
                                      {taskData?.columnName || data?.lane ? data?.lane : "No Status"}
                                    </span>
                                  ) : (
                                    <span className="dropdown action-label" style={{ display: "inline-block", marginLeft: "4px" }}>
                                      <a
                                        className="btn btn-white btn-sm btn-rounded dropdown-toggle"
                                        href="javascript:void(0)"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          setOpenStatusDropdown(!openStatusDropdown);
                                        }}
                                        aria-expanded={openStatusDropdown}
                                      >
                                        <i className={`fa fa-dot-circle-o text-${taskData?.columnColor}`} />{" "}
                                        {taskData?.columnName || taskData?.lane}
                                      </a>
                                      <div
                                        className={`dropdown-menu dropdown-menu-right ${openStatusDropdown ? "show" : ""}`}
                                      >
                                        {taskData?.allColumns && taskData?.allColumns.length > 0 ? (
                                          taskData?.allColumns?.map((column) => (
                                            <a
                                              key={column.id}
                                              className={`dropdown-item ${taskData?.columnId === column.id ? "disabled" : ""}`}
                                              href="javascript:void(0)"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (taskData?.columnId !== column.id) {
                                                  handleUpdateStatus(
                                                    taskData?.boardId,
                                                    taskData?._id,
                                                    taskData?.columnId,
                                                    column.id
                                                  );
                                                }
                                              }}
                                            >
                                              <i className={`fa fa-dot-circle-o text-${column.color}`} />{" "}
                                              {column.title}
                                            </a>
                                          ))
                                        ) : (
                                          <div className="dropdown-item disabled">
                                            Task not added in Board
                                          </div>
                                        )}
                                      </div>
                                    </span>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                          <div>
                            <h4>Tags</h4>
                            {isEditing ? (
                              <Form.Item
                                name="tags"
                                className="addTeamHeight"
                                rules={[
                                  {
                                    required: true,
                                    message: t("Tasks.pleaseentertags"),
                                  },
                                ]}
                              >
                                <Select
                                  mode="tags"
                                  className="custom-select customselect-height"
                                  getPopupContainer={() =>
                                    document.getElementById("area22")
                                  }
                                />
                              </Form.Item>
                            ) : (
                              <span className="text-end tag-container">
                                {(tags || taskData?.tags)?.slice(0, 4).map((tag) => (
                                  <Tooltip key={tag} title={tag}>
                                    <Tag
                                      style={{
                                        marginBottom: "4px",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap"
                                      }}
                                    >
                                      {tag}
                                    </Tag>
                                  </Tooltip>
                                ))}
                                {(tags || taskData?.tags)?.length > 4 && (
                                  <Tooltip 
                                    title={
                                      (tags || taskData?.tags)?.slice(4).join(", ")
                                    }
                                  >
                                    <Tag
                                      style={{
                                        marginBottom: "4px",
                                        cursor: "pointer"
                                      }}
                                    >
                                      +{(tags || taskData?.tags)?.length - 4}
                                    </Tag>
                                  </Tooltip>
                                )}
                              </span>
                            )}
                          </div>
                          <div className="mt-4">
                            <h4>{t("projectScreen.Modal.teamMembers")}</h4>
                            <div style={{ position: "relative" }} id="area">
                              {isEditing ? (
                                <Form.Item
                                  name="assignedDevelopers"
                                  className="addTeamHeight"
                                >
                                  <Select
                                    showSearch
                                    filterOption={(input, option) =>
                                      option.children
                                        .toLowerCase()
                                        .indexOf(input.toLowerCase()) >= 0
                                    }
                                    optionFilterProp="children"
                                    notFoundContent={
                                      <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                      />
                                    }
                                    dropdownRender={(menu) => <>{menu}</>}
                                    getPopupContainer={() =>
                                      document.getElementById("area")
                                    }
                                    className="customselect-height custom-select"
                                    mode="multiple"
                                    placeholder={t(
                                      "projectScreen.Modal.selectTeamMembers"
                                    )}
                                    onChange={handleChange}
                                  >
                                    {getTeamMemberOptions()}
                                  </Select>
                                </Form.Item>
                              ) : (
                                <div className="project-members">
                                  <ul
                                    className="team-members"
                                    style={{
                                      minWidth: "max-content",
                                      paddingLeft: 0,
                                    }}
                                  >
                                    {selectedTeamMembers
                                      ?.slice(0, 4)
                                      .map((teamMember, index) => (
                                        <li key={index}>
                                          <Tooltip title={teamMember?.fullName}>
                                            <Avatar
                                              style={{ cursor: "pointer" }}
                                              src={
                                                teamMember?.imageUrl ||
                                                user_icon
                                              }
                                            />
                                          </Tooltip>
                                        </li>
                                      ))}
                                    {selectedTeamMembers?.length > 4 && (
                                      <li className="dropdown avatar-dropdown">
                                        <Link
                                          className="all-users dropdown-toggle projectTeamMember"
                                          style={{
                                            display: "inline-flex",
                                            height: "33px",
                                            width: "33px",
                                          }}
                                          data-bs-toggle="dropdown"
                                          aria-expanded="false"
                                        >
                                          +{selectedTeamMembers?.length - 4}
                                        </Link>
                                        <div className="dropdown-menu dropdown-menu-right">
                                          <div className="avatar-group">
                                            {selectedTeamMembers
                                              ?.slice(4)
                                              .map((teamMember, index) => (
                                                <a
                                                  className="avatar avatar-xs projectTeamMember"
                                                  key={index}
                                                >
                                                  <Tooltip
                                                    title={teamMember?.fullName}
                                                  >
                                                    <Avatar
                                                      src={
                                                        teamMember?.imageUrl ||
                                                        user_icon
                                                      }
                                                      style={{
                                                        cursor: "pointer",
                                                      }}
                                                    />
                                                  </Tooltip>
                                                </a>
                                              ))}
                                          </div>
                                        </div>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
            <button type="button" className="close" onClick={closeViewModal}>
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="modal-footer">
            {isEditing ? (
              <>
                <Button
                  className="btn"
                  style={{ backgroundColor: "lightgrey", color: "white" }}
                  onClick={handleCancel}
                >
                  {t("cancel")}
                </Button>
                <Button
                  className="btn btn-primary"
                  type="primary"
                  onClick={handleSave}
                  disabled={loader}
                >
                  {t("save")}
                </Button>
              </>
            ) : !isFromTasksPage && (
              <Button
                className="btn btn-primary"
                type="primary"
                onClick={() => setIsEditing(true)}
              >
                {t("edit")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default TaskModal;
