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
  Card,
  Dropdown,
  Menu,
} from "antd";
import { Modal } from "@mui/material";
import moment from "moment";
import { apiServices } from "../../../Services/apiServices";
import { LoadingOutlined, MinusCircleFilled, UploadOutlined, DownloadOutlined, EllipsisOutlined, DeleteOutlined, PaperClipOutlined } from "@ant-design/icons";
import EditProjects from "./EditProjects";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
//import EditProjects from "./EditProjects";
import { getAllISOCodes } from "iso-country-currency";
import { useTranslation } from "react-i18next";
import { ArrowUpOutlined, ArrowDownOutlined, CheckOutlined, CloseOutlined, UserOutlined } from "@ant-design/icons";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  const [activityTab, setActivityTab] = useState("comments");
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [assignee, setAssignee] = useState(taskData?.assignee || null);
  const [priority, setPriority] = useState(taskData?.priority || null);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [assigneeLoading, setAssigneeLoading] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [assigneeSelectOpen, setAssigneeSelectOpen] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [editingLabels, setEditingLabels] = useState(false);
  const [dueDateValue, setDueDateValue] = useState(taskData.dueDate ? moment(taskData.dueDate) : null);
  const [labelsValue, setLabelsValue] = useState(taskData.labels || []);
  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = React.useRef();
  const API_URL = process.env.REACT_APP_API_BASE_URL || '';
  const [reporter, setReporter] = useState(taskData?.reporter || null);
  const [reporterLoading, setReporterLoading] = useState(false);
  const [reporterSelectOpen, setReporterSelectOpen] = useState(false);

  // Add this function to fetch the latest task data
  const fetchTaskDetails = async (id) => {
    if (!id) return;
    try {
      const res = await apiServices("GET", `tasks?taskId=${id}`, null, user_state);
      if (res?.data?.success) {
        const updatedTask = res?.data?.Task;
        setTaskData(updatedTask);
        setAssignee(updatedTask.assignee || null);
        setPriority(updatedTask.priority || null);
        setDueDateValue(updatedTask.dueDate ? moment(updatedTask.dueDate) : null);
        setLabelsValue(updatedTask.labels || []);
        setReporter(updatedTask.reporter || null);
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  // Fetch comments and history when modal opens or task changes
  useEffect(() => {
    if (viewModal && taskData?._id) {
      fetchComments(taskData._id);
      fetchHistory(taskData._id);
      fetchAttachments();
    }
    // eslint-disable-next-line
  }, [viewModal, taskData?._id]);

  // Fetch latest task data and update states when modal opens or task changes
  useEffect(() => {
    if (viewModal && (taskData?._id || data?._id)) {
      fetchTaskDetails(taskData?._id || data?._id);
    }
    // eslint-disable-next-line
  }, [viewModal, taskData?._id, data?._id]);

  // Sync local states with taskData when it changes
  useEffect(() => {
    setAssignee(taskData?.assignee || null);
    setPriority(taskData?.priority || null);
    setDueDateValue(taskData?.dueDate ? moment(taskData.dueDate) : null);
    setLabelsValue(taskData?.labels || []);
    setReporter(taskData?.reporter || null);
  }, [taskData]);

  const fetchComments = async (taskId) => {
    setCommentsLoading(true);
    try {
      const res = await apiServices("GET", `tasks/${taskId}/comments`, null, user_state);
      if (res?.data?.success) {
        setComments(res.data.comments || []);
      } else {
        setComments([]);
      }
    } catch (err) {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchHistory = async (taskId) => {
    setHistoryLoading(true);
    try {
      const res = await apiServices("GET", `tasks/${taskId}/history`, null, user_state);
      if (res?.data?.success) {
        setHistory(res.data.history || []);
      } else {
        setHistory([]);
      }
    } catch (err) {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const postComment = async () => {
    if (!comment.trim()) return;
    setPostingComment(true);
    try {
      const res = await apiServices("POST", `tasks/${taskData._id}/comments`, { text: comment }, user_state);
      if (res?.data?.success) {
        setComment("");
        fetchComments(taskData._id);
        // Refresh activity feed
        fetchHistory(taskData._id);
      } else {
        message.error("Failed to post comment");
      }
    } catch (err) {
      message.error("Failed to post comment");
    } finally {
      setPostingComment(false);
    }
  };

  useEffect(() => {
    if (data?.isEditing) {
      // Set up edit mode immediately
      setIsEditing(true);
    }
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

  // Fetch all employees for assignee dropdown
  useEffect(() => {
    apiServices("GET", `user/all-employees`, null, user_state)
      .then(res => {
        if (res?.data?.success) setAllEmployees(res.data.User || []);
      });
  }, []);

  // Handlers for assignee, priority, due date, labels
  const handleAssignToMe = async () => {
    setAssigneeLoading(true);
    try {
      const res = await apiServices("PUT", "tasks", { _id: taskData._id, assignee: user_state.user }, user_state);
      if (res?.data?.success) {
        setAssignee(user_state.user);
        message.success("Assigned to you");
        // Refresh activity feed
        fetchHistory(taskData._id);
      }
    } catch (err) {
      message.error("Failed to assign");
    }
    setAssigneeLoading(false);
  };
  const handlePriorityChange = async (value) => {
    setPriorityLoading(true);
    try {
      const res = await apiServices("PUT", "tasks", { _id: taskData._id, priority: value }, user_state);
      if (res?.data?.success) {
        setPriority(value);
        message.success("Priority updated");
        // Refresh activity feed
        fetchHistory(taskData._id);
      }
    } catch (err) {
      message.error("Failed to update priority");
    }
    setPriorityLoading(false);
  };
  const handleAssignToUser = async (userId) => {
    setAssigneeLoading(true);
    try {
      const res = await apiServices("PUT", "tasks", { _id: taskData._id, assignee: userId }, user_state);
      if (res?.data?.success) {
        setAssignee(allEmployees.find(u => u._id === userId) || null);
        message.success("Assignee updated");
        // Refresh activity feed
        fetchHistory(taskData._id);
      }
    } catch (err) {
      message.error("Failed to assign");
    }
    setAssigneeLoading(false);
  };
  const handleUnassign = async () => {
    setAssigneeLoading(true);
    try {
      const res = await apiServices("PUT", "tasks", { _id: taskData._id, assignee: null }, user_state);
      if (res?.data?.success) {
        setAssignee(null);
        message.success("Unassigned");
        // Refresh activity feed
        fetchHistory(taskData._id);
      }
    } catch (err) {
      message.error("Failed to unassign");
    }
    setAssigneeLoading(false);
  };
  const handleDueDateSave = async () => {
    try {
      await apiServices('PUT', 'tasks', { _id: taskData._id, dueDate: dueDateValue ? dueDateValue.toISOString() : null }, user_state);
      message.success('Due date updated');
      setEditingDueDate(false);
      // Refresh activity feed
      fetchHistory(taskData._id);
    } catch (err) {
      message.error('Failed to update due date');
    }
  };
  const handleLabelsSave = async () => {
    try {
      await apiServices('PUT', 'tasks', { _id: taskData._id, labels: labelsValue }, user_state);
      message.success('Labels updated');
      setEditingLabels(false);
    } catch (err) {
      message.error('Failed to update labels');
    }
  };
  const priorityOptions = [
    { value: 'Highest', label: (<><ArrowUpOutlined style={{color: '#e74c3c'}} /> Highest</>) },
    { value: 'High', label: (<><ArrowUpOutlined style={{color: '#e67e22'}} /> High</>) },
    { value: 'Medium', label: (<><MinusCircleFilled style={{color: '#f1c40f'}} /> Medium</>) },
    { value: 'Low', label: (<><ArrowDownOutlined style={{color: '#3498db'}} /> Low</>) },
    { value: 'Lowest', label: (<><ArrowDownOutlined style={{color: '#2980b9'}} /> Lowest</>) },
  ];

  const fetchAttachments = async () => {
    if (!taskData?._id) return;
    setAttachmentsLoading(true);
    try {
      const res = await apiServices("GET", `tasks/${taskData._id}/attachments`, null, user_state);
      if (res?.data?.success) {
        setAttachments(res.data.files || []);
      } else {
        setAttachments([]);
      }
    } catch (err) {
      setAttachments([]);
    }
    setAttachmentsLoading(false);
  };

  useEffect(() => {
    if (viewModal && taskData?._id) fetchAttachments();
  }, [viewModal, taskData?._id]);

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !taskData?._id) return;
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const xhr = new XMLHttpRequest();
      const token = user_state?.access_token?.accessToken || localStorage.getItem('token');
      xhr.open('POST', `${API_URL}/tasks/${taskData._id}/attachments`);
      xhr.setRequestHeader('Authorization', token ? `Bearer ${token}` : '');
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        setUploading(false);
        setUploadProgress(0);
        if (xhr.status === 200) {
          fetchAttachments();
          message.success('Attachment uploaded');
        } else {
          message.error('Failed to upload attachment');
        }
      };
      xhr.onerror = () => {
        setUploading(false);
        setUploadProgress(0);
        message.error('Failed to upload attachment');
      };
      xhr.send(formData);
    } catch (err) {
      setUploading(false);
      setUploadProgress(0);
      message.error('Failed to upload attachment');
    }
  };

  const handleUploadButtonClick = () => {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  const handleDeleteAttachment = async (fileId) => {
    if (!taskData?._id || !fileId) return;
    setAttachmentsLoading(true);
    try {
      const res = await apiServices('DELETE', `tasks/${taskData._id}/attachments/${fileId}`, null, user_state);
      if (res?.data?.success) {
        message.success('Attachment deleted');
        fetchAttachments();
      } else {
        message.error('Failed to delete attachment');
      }
    } catch (err) {
      message.error('Failed to delete attachment');
    }
    setAttachmentsLoading(false);
  };

  const handleReporterChange = async (userId) => {
    setReporterLoading(true);
    try {
      const reporterValue = userId === 'unassigned' ? null : userId;
      const res = await apiServices("PUT", "tasks", { _id: taskData._id, reporter: reporterValue }, user_state);
      if (res?.data?.success) {
        setReporter(allEmployees.find(u => u._id === userId) || null);
        message.success("Reporter updated");
        fetchHistory(taskData._id);
      }
    } catch (err) {
      message.error("Failed to update reporter");
    }
    setReporterLoading(false);
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
                                whitespace: true,
                                required: true,
                        validator: (_, value) => {
                                if (!value || value.trim() === '') {
                                    return Promise.reject(t('Tasks.pleaseentertitle'));
                                } else if (/\s{2,}/.test(value)) {
                            return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                                } else if (value.length < 3) {
                                    return Promise.reject(t('Tasks.titleLength'));
                          }
                          return Promise.resolve();
                        },
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
                                whitespace: true,
                                required: true,
                                validator: (_, value) => {
                                if(!value || value.trim() === ''){
                                    return Promise.reject(t('Tasks.pleaseenterdescription'));
                                }
                                else if (value.replace(/<(.|\n)*?>/g, '').length <= 4) {
                                    return Promise.reject(t('Tasks.descriptionLength'));
                                }
                                return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <ReactQuill
                              value={description}
                              onChange={setDescription}
                              theme="snow"
                              style={{ minHeight: 150 }}
                            />
                      </Form.Item>
                        ) : (
                          <div
                            className="description-content"
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
                            dangerouslySetInnerHTML={{ __html: description || taskData?.description || '' }}
                          />
                        )}
                        {/* Attachments section: now placed after description, before comments/history */}
                        {taskData?._id && (
                          <div style={{ margin: '24px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ fontWeight: 600, fontSize: 16 }}><PaperClipOutlined /> Attachments</span>
                              <span style={{
                                background: '#eee',
                                borderRadius: 8,
                                fontSize: 12,
                                fontWeight: 500,
                                marginLeft: 8,
                                padding: '2px 8px',
                              }}>{attachments.length}</span>
                              <div style={{ flex: 1 }} />
                              <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleAttachmentUpload}
                                disabled={uploading}
                              />
                              <Button
                                icon={<UploadOutlined />}
                                onClick={handleUploadButtonClick}
                                loading={uploading}
                                disabled={uploading}
                                style={{ marginLeft: 8 }}
                              >
                                Upload
                              </Button>
                            </div>
                            {attachmentsLoading ? (
                              <Spin />
                            ) : (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                                {attachments.map((file) => {
                                  const isImage = file.resource_type === 'image' || /\.(jpg|jpeg|png|gif)$/i.test(file.fileName);
                                  const menu = (
                                    <Menu>
                                      <Menu.Item key="delete" icon={<DeleteOutlined />} onClick={() => handleDeleteAttachment(file._id)}>
                                        Delete
                                      </Menu.Item>
                                    </Menu>
                                  );
                                  return (
                                    <Card
                                      key={file._id}
                                      style={{ width: 160, borderRadius: 12, boxShadow: '0 1px 4px #0001', padding: 0 }}
                                      cover={
                                        <div style={{ position: 'relative' }}>
                                          {isImage
                                            ? <img alt={file.fileName} src={file.imageUrl} style={{ borderRadius: '12px 12px 0 0', height: 100, objectFit: 'cover', width: '100%' }} />
                                            : <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: '12px 12px 0 0' }}>No Preview</div>
                                          }
                                          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4, zIndex: 2 }}>
                                            <Tooltip title="Download">
                                              <a
                                                href={file.imageUrl}
                                                download={file.fileName}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                  background: '#fff',
                                                  borderRadius: '50%',
                                                  boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                                                  width: 32,
                                                  height: 32,
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  marginRight: 4,
                                                  transition: 'box-shadow 0.2s',
                                                  cursor: 'pointer',
                                                }}
                                              >
                                                <DownloadOutlined style={{ fontSize: 18 }} />
                                              </a>
                                            </Tooltip>
                                            <Dropdown overlay={menu} trigger={['click']} getPopupContainer={triggerNode => triggerNode.parentNode}>
                                              <Button
                                                shape="circle"
                                                icon={<EllipsisOutlined style={{ fontSize: 18 }} />}
                                                style={{
                                                  background: '#fff',
                                                  border: 'none',
                                                  boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                                                  width: 32,
                                                  height: 32,
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  justifyContent: 'center',
                                                  transition: 'box-shadow 0.2s',
                                                  cursor: 'pointer',
                                                }}
                                              />
                                            </Dropdown>
                                          </div>
                                        </div>
                                      }
                                      bodyStyle={{ padding: 12 }}
                                    >
                                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.fileName}</div>
                                      <div style={{ fontSize: 12, color: '#888' }}>{file.createdAt ? new Date(file.createdAt).toLocaleString() : ''}</div>
                                    </Card>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                        {/* Comments & History Tabs - LEFT COLUMN, beneath description */}
                        <div style={{marginTop: 24}}>
                          <div style={{ borderBottom: '1px solid #eee', marginBottom: 16, display: 'flex', gap: 24 }}>
                            <div
                              style={{
                                padding: '8px 0',
                                cursor: 'pointer',
                                borderBottom: activityTab === 'comments' ? '2px solid #1890ff' : 'none',
                                fontWeight: activityTab === 'comments' ? 600 : 400
                              }}
                              onClick={() => setActivityTab('comments')}
                            >
                              Comments
                            </div>
                            <div
                              style={{
                                padding: '8px 0',
                                cursor: 'pointer',
                                borderBottom: activityTab === 'history' ? '2px solid #1890ff' : 'none',
                                fontWeight: activityTab === 'history' ? 600 : 400
                              }}
                              onClick={() => setActivityTab('history')}
                            >
                              History
                            </div>
                          </div>
                          {activityTab === 'comments' && (
                            <div className="comments-section">
                              <h5>Comments</h5>
                              <div style={{ maxHeight: 250, overflowY: 'auto', paddingRight: 8 }}>
                                {commentsLoading ? (
                                  <Spin />
                                ) : comments.length === 0 ? (
                                  <Empty description="No comments yet" />
                                ) : (
                                  comments.map((c, idx) => (
                                    <div key={idx} style={{display: 'flex', alignItems: 'flex-start', marginBottom: 12}}>
                                      <div style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 600, marginRight: 12
                                      }}>
                                        {c.userName ? c.userName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                      </div>
                                      <div>
                                        <div style={{fontWeight: 500}}>{c.userName || 'User'} <span style={{color: '#888', fontSize: 12, marginLeft: 8}}>{new Date(c.createdAt).toLocaleString()}</span></div>
                                        <div>{c.text}</div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                              <div style={{marginTop: 16}}>
                                <Input.TextArea
                                  value={comment}
                                  onChange={e => setComment(e.target.value)}
                                  placeholder="Add a comment..."
                                  autoSize={{ minRows: 2, maxRows: 4 }}
                                  onPressEnter={e => { e.preventDefault(); postComment(); }}
                                  disabled={postingComment}
                                />
                                <div style={{marginTop: 8, display: 'flex', gap: 8}}>
                                  {["Who is working on this...?", "Status update...", "Thanks..."].map((txt, i) => (
                                    <Button key={i} size="small" onClick={() => setComment(txt)}>{txt}</Button>
                                  ))}
                                  <Button type="primary" onClick={postComment} loading={postingComment} style={{marginLeft: 'auto'}}>Post</Button>
                                </div>
                              </div>
                      </div>
                          )}
                          {activityTab === 'history' && (
                            <div>
                              <h5>Activity</h5>
                              <div style={{ maxHeight: 250, overflowY: 'auto', paddingRight: 8 }}>
                                {historyLoading ? (
                                  <Spin />
                                ) : history.length === 0 ? (
                                  <Empty description="No history yet" />
                                ) : (
                                  history.map((h, idx) => (
                                    <div key={idx} style={{display: 'flex', alignItems: 'flex-start', marginBottom: 18}}>
                                      <div style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 600, marginRight: 12
                                      }}>
                                        {h.userName ? h.userName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                      </div>
                                      <div>
                                        <div style={{fontWeight: 500}}>
                                          {h.userName || 'User'} {h.action}
                                          {h.field && (
                                            <>
                                              {" "}
                                              <span style={{fontWeight: 400}}>
                                                {h.field === "status" && (
                                                  <>
                                                    <span style={{border: '1px solid #bbb', borderRadius: 4, padding: '2px 8px', margin: '0 4px'}}>{h.from || "None"}</span>
                                                    <span style={{margin: '0 4px'}}>→</span>
                                                    <span style={{border: '1px solid #bbb', borderRadius: 4, padding: '2px 8px', margin: '0 4px'}}>{h.to || "None"}</span>
                                                  </>
                                                )}
                                                {h.field !== "status" && (
                                                  <>
                                                    <span style={{color: '#888', margin: '0 4px'}}>{h.from || "None"}</span>
                                                    <span style={{margin: '0 4px'}}>→</span>
                                                    <span style={{color: '#888', margin: '0 4px'}}>{h.to || "None"}</span>
                                                  </>
                                                )}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                        <div style={{color: '#888', fontSize: 12}}>{new Date(h.createdAt).toLocaleString()}</div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                  )}
                </div>
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
                          <div style={{marginTop: 24}}>
                            {/* Assignee */}
                            <div style={{marginBottom: 20}}>
                              <div style={{fontWeight: 500}}>Assignee <span><i className="fa fa-thumb-tack" style={{fontSize: 13}} /></span></div>
                              <Select
                                showSearch
                                style={{width: '100%', marginTop: 4}}
                                placeholder="Assignee"
                                value={assignee?._id || 'unassigned'}
                                onChange={val => {
                                  if (val === 'unassigned') handleUnassign();
                                  else handleAssignToUser(val);
                                }}
                                loading={assigneeLoading}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.props.children[1]?.props?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                dropdownMatchSelectWidth={false}
                                open={assigneeSelectOpen}
                                onDropdownVisibleChange={setAssigneeSelectOpen}
                                dropdownRender={menu => (
                                  <div>
                                    {menu}
                                  </div>
                                )}
                              >
                                <Select.Option key="unassigned" value="unassigned">
                                  <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                    <UserOutlined style={{fontSize: 18}} />
                                    <span>Unassigned</span>
                                  </span>
                                </Select.Option>
                                {allEmployees.map(user => (
                                  <Select.Option key={user._id} value={user._id}>
                                    <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                      <Avatar size={24} src={user.imageUrl} style={{background: '#2d3e50', fontWeight: 600}}>
                                        {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </Avatar>
                                      <span>{user.fullName}</span>
                                    </span>
                                  </Select.Option>
                                ))}
                              </Select>
                              {/* Assign to me button below dropdown */}
                              {(!assignee || assignee?._id !== user_state?.user?._id) && (
                                <div style={{marginTop: 8}}>
                                  <a style={{color: '#1890ff', fontSize: 13, cursor: 'pointer'}} onClick={handleAssignToMe} disabled={assigneeLoading}>
                                    Assign to me
                                  </a>
                                </div>
                              )}
                            </div>
                            {/* Priority */}
                            <div style={{marginBottom: 20}}>
                              <div style={{fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6}}>Priority <span><i className="fa fa-thumb-tack" style={{fontSize: 13}} /></span></div>
                              <Select
                                style={{width: '100%', marginTop: 4}}
                                placeholder="Select Priority"
                                value={priority}
                                onChange={handlePriorityChange}
                                loading={priorityLoading}
                                optionLabelProp="label"
                              >
                                {priorityOptions.map(opt => (
                                  <Select.Option key={opt.value} value={opt.value} label={opt.label}>
                                    {opt.label}
                                  </Select.Option>
                                ))}
                              </Select>
                            </div>
                            {/* Due Date */}
                            <div style={{marginBottom: 20}}>
                              <div style={{fontWeight: 500}}>Due date</div>
                              <div style={{marginTop: 4, color: '#555'}}>
                                {editingDueDate ? (
                                  <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                    <DatePicker
                                      value={dueDateValue}
                                      onChange={setDueDateValue}
                                      allowClear
                                      style={{minWidth: 120}}
                                    />
                                    <CheckOutlined style={{color: '#52c41a', cursor: 'pointer'}} onClick={handleDueDateSave} />
                                    <CloseOutlined style={{color: '#f5222d', cursor: 'pointer'}} onClick={() => { setEditingDueDate(false); setDueDateValue(taskData.dueDate ? moment(taskData.dueDate) : null); }} />
                                  </span>
                                ) : (
                                  <span style={{cursor: 'pointer'}} onClick={() => setEditingDueDate(true)}>
                                    {taskData.dueDate ? moment(taskData.dueDate).format('YYYY-MM-DD') : 'None'}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Labels */}
                            <div style={{marginBottom: 20}}>
                              <div style={{fontWeight: 500}}>Labels</div>
                              <div style={{marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap'}}>
                                {editingLabels ? (
                                  <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                    <Select
                                      mode="tags"
                                      style={{minWidth: 180}}
                                      value={labelsValue}
                                      onChange={setLabelsValue}
                                      open={true}
                                      tokenSeparators={[',']}
                                      placeholder="Add labels"
                                    />
                                    <CheckOutlined style={{color: '#52c41a', cursor: 'pointer'}} onClick={handleLabelsSave} />
                                    <CloseOutlined style={{color: '#f5222d', cursor: 'pointer'}} onClick={() => { setEditingLabels(false); setLabelsValue(taskData.labels || []); }} />
                                  </span>
                                ) : (
                                  <span style={{cursor: 'pointer'}} onClick={() => setEditingLabels(true)}>
                                    {taskData.labels && taskData.labels.length > 0 ? (
                                      taskData.labels.map((label, idx) => (
                                        <Tag key={idx} color="blue">{label}</Tag>
                                      ))
                                    ) : (
                                      <span style={{color: '#888'}}>None</span>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                            {/* Reporter */}
                            <div style={{marginBottom: 20}}>
                              <div style={{fontWeight: 500}}>Reporter <span><i className="fa fa-thumb-tack" style={{fontSize: 13}} /></span></div>
                              <Select
                                showSearch
                                style={{width: '100%', marginTop: 4}}
                                placeholder="Reporter"
                                value={reporter?._id || 'unassigned'}
                                onChange={val => handleReporterChange(val)}
                                loading={reporterLoading}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.props.children[1]?.props?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                dropdownMatchSelectWidth={false}
                                open={reporterSelectOpen}
                                onDropdownVisibleChange={setReporterSelectOpen}
                                dropdownRender={menu => (
                                  <div>
                                    {menu}
                                  </div>
                                )}
                              >
                                <Select.Option key="unassigned" value="unassigned">
                                  <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                    <UserOutlined style={{fontSize: 18}} />
                                    <span>Unassigned</span>
                                  </span>
                                </Select.Option>
                                {allEmployees.map(user => (
                                  <Select.Option key={user._id} value={user._id}>
                                    <span style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                      <Avatar size={24} src={user.imageUrl} style={{background: '#2d3e50', fontWeight: 600}}>
                                        {user.fullName?.split(' ').map(n => n[0]).join('').toUpperCase()}
                                      </Avatar>
                                      <span>{user.fullName}</span>
                                    </span>
                                  </Select.Option>
                                ))}
                              </Select>
                            </div>
                          </div>
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
                              <span className="text-end tag-container" style={{padding: "0px 8px"}}>
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
                                <div className="project-members" style={{padding: "0px 8px"}}>
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
