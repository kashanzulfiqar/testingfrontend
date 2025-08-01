import { t } from "i18next";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TaskContent from "./TaskContent";
const TaskDetails = () => {
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
<TaskContent/>
       
      </div>
    </div>
  );
};

export default TaskDetails;
