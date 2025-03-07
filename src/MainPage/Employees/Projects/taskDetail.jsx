import React, { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useTranslation } from "react-i18next";
import { Select } from "antd";

const TaskDetails = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { taskId } = useParams();
  const { taskData } = location.state || {};

  const getInitials = (name) => {
    console.log("ASDFG",taskData)
    if (!name) return "";
    const nameParts = name.trim().split(" ");
    const initials = nameParts.map((part) => part[0].toUpperCase()).join("");
    return initials.length > 2 ? initials.slice(0, 2) : initials; // Limit to 2 characters
  };

  // Create options array for the dropdown
  const statusOptions = taskData?.options?.map(option => ({
    value: option.title,
    label: option.title,
    color: option.color
  })) || [];

  // Set initial value based on current lane
  const [selectedStatus, setSelectedStatus] = useState({
    value: taskData?.lane,
    label: taskData?.lane
  });

  const handleStatusChange = (selectedOption) => {
    setSelectedStatus(selectedOption);
    // Here you can add API call to update the task status
    // updateTaskStatus(taskId, selectedOption.value);
  };
  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col-md-4">
              <h3 className="page-title">Task</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to={"/projects/tasks"}>
                    <span className="arrow_routes"></span>
                    Task
                  </Link>
                </li>
                <li className="breadcrumb-item active">Task {t("Details")}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="contact-wrap">
              <div className="contact-profile">
                <div
                  className="avatar company-avatar"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <label className="text-icon">
                    {getInitials(taskData?.title)}
                  </label>
                </div>
                <div className="name-user">
                  <h4>{taskData?.title}</h4>
                </div>
              </div>
              <div className="btn btn-white btn-sm btn-rounded">
                  <Select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    options={statusOptions}
                    // styles={{
                    //   option: (provided, state) => ({
                    //     ...provided,
                    //     backgroundColor: state.data.color === 'info' ? '#17a2b8' :
                    //                    state.data.color === 'warning' ? '#ffc107' :
                    //                    state.data.color === 'success' ? '#28a745' :
                    //                    state.data.color === 'danger' ? '#dc3545' :
                    //                    state.data.color,
                    //     color: ['warning', 'info'].includes(state.data.color) ? '#000' : '#fff',
                    //     cursor: 'pointer'
                    //   }),
                    //   control: (provided) => ({
                    //     ...provided,
                    //     minWidth: '200px'
                    //   })
                    // }}
                  />
                </div>
            </div>
          </div>
          <div>
            <div className="project-description">
              <h5 className="card-title">
                {t("finance.Invoices.description")}
              </h5>
              <p>{taskData?.description}</p>
            </div>

            {taskData?.tags && taskData.tags.length > 0 && (
              <div className="project-tags">
                <h5 className="card-title">{t("Tasks.tags")}</h5>
                <div className="tags">
                  {taskData.tags.map((tag, index) => (
                    <span key={index} className="badge badge-primary">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="col-lg-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">{t("Tasks.details")}</h5>
            {taskData?.projectId && (
              <div className="task-detail">
                <label>{t("Tasks.project")}:</label>
                <span>{taskData.projectId.projectName}</span>
              </div>
            )}
            {taskData?.boardId && (
              <div className="task-detail">
                <label>{t("sideBar.taskBoard")}:</label>
                <span>{taskData.boardId.boardTitle}</span>
              </div>
            )}
            <div className="task-detail">
              <label>{t("Status")}:</label>
              <span>{taskData?.lane}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
