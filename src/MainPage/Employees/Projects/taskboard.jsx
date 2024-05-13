import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "react-router-dom";
import { Avatar_12 } from "../../../Entryfile/imagepath";
import Offcanvas from "../../../Entryfile/offcanvance";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Button,
  DatePicker,
  Divider,
  Empty,
  Form,
  Input,
  Radio,
  Select,
  Spin,
  Tag,
  Tooltip,
  message,
} from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Modal } from "@mui/material";
import { apiServices } from "../../../Services/apiServices";
import { useSelector } from "react-redux";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { useForm } from "react-hook-form";

const response = [
  {
    _id: "1234",
    title: "Todo",
    color: "primary",
    tasks: [
      {
        id: "task1",
        title: "Website redesign",
        status: "backlog",
        progress: 70,
        priority: "Normal",
        date: "Sep 26",
        assignedUsers: [Avatar_12],
      },
      {
        id: "task2",
        title: "Website new",
        status: "backlog",
        progress: 13,
        priority: "Normal",
        date: "Sep 26",
        assignedUsers: [Avatar_12],
      },
    ],
  },
  {
    _id: "1235",
    title: "InProgress",
    color: "success",
    tasks: [
      {
        id: "task3",
        title: "dummytask",
        status: "backlog",
        progress: 70,
        priority: "Normal",
        date: "Sep 26",
        assignedUsers: [Avatar_12],
      },
    ],
  },
  {
    _id: "1236",
    title: "Done",
    color: "info",
    tasks: [],
  },
];


const TaskBoard = () => {
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [optTasks, setOptTasks] = useState([]);
  const [boardId, setBoardId] = useState("");
  const [columnId, setColumnId] = useState("");
  const [editId, setEditId] = useState("");
  const [taskModal, setTaskModal] = useState(false);
  const [remove, setRemove] = useState(false);
  const [newTaskModal, setNewTaskModal] = useState(false);
  const [addTask, setAddTask] = useState({
    isAddOpen: false,
    isEditOpen: false,
    data: "",
    title: "",
  });

  
  const [form2] = Form.useForm();

  const { t, i18n } = useTranslation();
  const location = useLocation();

  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const role = user_state?.user?.role;

  const ProjectData = location?.state;
  console.log(ProjectData);
  const onDragEnd = (result) => {
    // Dropped outside the droppable area
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;

    // Find the source column from the response array based on droppableId
    const sourceColumn = columns?.find(
      (column) => column._id === source.droppableId
    );

    // Find the task being moved
    const movedTask = sourceColumn?.columns?.find(
      (task) => task.id === result.draggableId
    );

    // Remove the task from the source column
    const updatedSourceTasks = sourceColumn?.columns?.filter(
      (task) => task.id !== result.draggableId
    );

    // If source and destination columns are different, update the status of the moved task
    if (source.droppableId !== destination.droppableId) {
      // Find the destination column
      const destinationColumn = columns?.find(
        (column) => column._id === destination.droppableId
      );

      // Update the status of the moved task
      //movedTask.status = destination.droppableId;

      // Insert the moved task into the destination column
      const updatedDestinationTasks = Array.from(destinationColumn.tasks);
      updatedDestinationTasks.splice(destination.index, 0, movedTask);

      // Update tasks state with updated columns
      const updatedTasks = columns?.map((column) => {
        if (column._id === sourceColumn._id) {
          return { ...column, tasks: updatedSourceTasks };
        }
        if (column._id === destinationColumn._id) {
          return { ...column, tasks: updatedDestinationTasks };
        }
        return column;
      });

      // Set the updated tasks state
      setColumns(updatedTasks);
    } else {
      // If the task is dropped in the same board, just update the tasks array without modifying the task's status
      const updatedSourceTasksSameBoard = Array.from(updatedSourceTasks);
      updatedSourceTasksSameBoard.splice(destination.index, 0, movedTask);

      // Update tasks state with the same board
      const updatedTasksSameBoard = columns?.map((column) => {
        if (column._id === sourceColumn._id) {
          return { ...column, tasks: updatedSourceTasksSameBoard };
        }
        return column;
      });

      // Set the updated tasks state
      setColumns(updatedTasksSameBoard);
    }
  };
  const [loader, setLoader] = useState(false);

  const [descLength, setDescLength] = useState(0);

  const [open, setOpen] = useState({
    isAddOpen: false,
    isEditOpen: false,
    data: "",
  });

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
    setLoader(false);
  };

  const closeTaskModal = () => {
    setTaskModal(false);
    setColumnId('');
    //setIsLoading(false)
  };

  const closeNewTask = () => {
    //setNewTaskModal(false);
    setAddTask({
      isAddOpen: false,
      isDelOpen: false,
      data: '',
      title: '',
    });
    setEditId("");
    form2.resetFields();
    setLoader(false);
    //setIsLoading(false)
  };

  const colors = [
    { name: "Primary", value: "primary", color: "#007bff" },
    { name: "Success", value: "success", color: "#28a745" },
    { name: "Info", value: "info", color: "#17a2b8" },
    { name: "Purple", value: "purple", color: "#6f42c1" },
    { name: "Warning", value: "warning", color: "#ffc107" },
    { name: "Danger", value: "danger", color: "#dc3545" },
  ];

  const getTaskTitle = (taskId) => {
    const task = allTasks.find((task) => task._id === taskId);
    return task ? task.title : "";
  };

  const getTaskTags = (taskId) => {
    const task = allTasks.find((task) => task._id === taskId);
    return task ? task.tags : [];
  };

  const getTaskDescription = (taskId) => {
    const task = allTasks.find((task) => task._id === taskId);
    return task ? task.description : "";
  };

  const getAllTasks = (id) => {
    apiServices(
      "GET",
      `tasks?projectId=${id}&page=${1}&limit=${99999}`,
      null,
      user_state
    )
      .then((res) => {
        if (res?.data?.success === true) {
          const sortedData = res?.data?.Task?.docs
            ?.slice()
            .sort((a, b) => a.title.localeCompare(b.title));
          setAllTasks(sortedData);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("Timesheetemployee.getAllTasksError")
          }!`
        );
      });
  };

  const getTasksOptions = (id) => {
    apiServices(
      "GET",
      `tasks?projectId=${id}&lane=empty&page=${1}&limit=${99999}`,
      null,
      user_state
    )
      .then((res) => {
        if (res?.data?.success === true) {
          const sortedData = res?.data?.Task?.docs
            ?.slice()
            .sort((a, b) => a.title.localeCompare(b.title));
          setOptTasks(sortedData);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("Timesheetemployee.getAllTasksError")
          }!`
        );
      });
  };

  const getTaskBoard = (id) => {
    apiServices(
      "GET",
      `taskBoard/view-taskBoard?projectId=${id}`,
      null,
      user_state
    )
      .then((res) => {
        if (res?.data?.success === true) {
          //const sortedData = res?.data?.Task?.docs?.slice().sort((a, b) => a.title.localeCompare(b.title));
          //setAllTasks(sortedData);
          res?.data?.taskBoards?.map((board) => {
            setBoardId(board?._id);
            setColumns(board?.columns);
          });
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : 'Error getting taskboard data'
          }!`
        );
      });
  };

  useEffect(() => {
    setIsLoading(true);
    getAllTasks(ProjectData?._id);
    getTaskBoard(ProjectData?._id);
  }, []);

  const onFinish = (values, info) => {
    setLoader(true);
    if (info) {
      let updated_data = {
        _id: boardId,
        columnId: info._id,
        ...values,
      };
      apiServices("PUT", "taskBoard/add-taskBoard", updated_data, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            //const sortedData = res?.data?.Task?.docs?.slice().sort((a, b) => a.title.localeCompare(b.title));
            //setAllTasks(sortedData);
            setColumns(res?.data?.taskBoard?.columns);
            setIsLoading(false);
            setLoader(false);
            message.success('Column Updated Successfully')
            handleClose();
          }
        })
        .catch((err) => {
          setIsLoading(false);
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : 'Error updating column'
            }!`
          );
          setLoader(false);
        }).finally(() => {
          setLoader(false);
        });
      // setColumns(prevTasks =>
      //   prevTasks.map(task =>
      //     task._id === info._id ? { ...task, title: values.title, color: values.color } : task
      //   ));
    } else {
      let updated_data = {
        _id: boardId,
        ...values,
      };
      apiServices("PUT", "taskBoard/add-taskBoard", updated_data, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            //const sortedData = res?.data?.Task?.docs?.slice().sort((a, b) => a.title.localeCompare(b.title));
            //setAllTasks(sortedData);
            setColumns(res?.data?.taskBoard?.columns);
            setIsLoading(false);
            setLoader(false);
            message.success('Column Added Successfully')
            handleClose();
          }
        })
        .catch((err) => {
          setIsLoading(false);
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : 'Error adding column'
            }!`
          );
          setLoader(false);
        }).finally(() => {
          setLoader(false);
        });
      // const newTask = {
      //   _id: Math.random().toString(36).substr(2, 9),
      //   title: values.title,
      //   color: values.color,
      //   tasks: []
      // };
      // console.log(newTask)

      // setColumns(prevTasks => [...prevTasks, newTask]);
    }
  };

  const onFinishTask = (values, info) => {
    setLoader(true);
    if (info) {
      setColumns((prevTasks) =>
        prevTasks.map((task) =>
          task._id === info._id
            ? { ...task, title: values.title, color: values.color }
            : task
        )
      );
    } else {
      let updated_data = {
        _id: boardId,
        columnId: columnId,
        ...values,
      };
      apiServices("PUT", "taskBoard/add-taskBoard", updated_data, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            //const sortedData = res?.data?.Task?.docs?.slice().sort((a, b) => a.title.localeCompare(b.title));
            //setAllTasks(sortedData);
            setColumns(res?.data?.taskBoard?.columns);
            setIsLoading(false);
            setLoader(false);
            message.success('Task added successfully')
            closeTaskModal();
          }
        })
        .catch((err) => {
          setIsLoading(false);
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Error adding task"
            }!`
          );
          setLoader(false);
        });
      // const newTask = {
      //   _id: Math.random().toString(36).substr(2, 9),
      //   title: values.title,
      //   color: values.color,
      //   tasks: []
      // };
      // console.log(newTask)

      // setColumns(prevTasks => [...prevTasks, newTask]);
    }
  };

  const onHandleDelete = (id) => {
    let updated_data = {
      _id: boardId,
      columnId: id,
    };
    setLoader(true);
    apiServices("DELETE", "taskBoard/delete-column", updated_data, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          setColumns((prevTasks) =>
            prevTasks.filter((column) => column._id !== id)
          );
          message.success("Column Deleted Successfully");
          handleClose();
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
              : "Error deleting column"
          }!`
        );
      });
  };

  const onHandleRemove = (id) => {
    let updated_data = {
      _id: boardId,
      columnId: columnId,
      taskId: id,
    };
    setLoader(true);
    apiServices("DELETE", "taskBoard/remove-task", updated_data, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          setColumns((prevColumns) =>
            prevColumns?.map((column) => {
              if (column._id === columnId) {
                column.tasks = column?.tasks?.filter(task => task.taskId !== id);
              }
              return column;
            })
          );
          message.success("Task Removed Successfully");
          closeNewTask();
          setColumnId('')
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
              : "Error removing task"
          }!`
        );
      });
  };

  const onFinishAdd = (values) => {
    let updated_data = {
      ...values,
      projectId: ProjectData?._id
    }
    setLoader(true)
    apiServices("POST", 'tasks', updated_data, user_state)
      .then((res) => {
          if (res?.data?.success === true) {
              closeNewTask();
              setOptTasks(prev => [...prev, res?.data?.Task])
              setAllTasks(prev => [...prev, res?.data?.Task])
              message.success(t('Tasks.addTaskSuccess'))
              setLoader(false)
            }
          })
          .catch((err) => {
        setLoader(false)
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('Tasks.addTaskError')
          }!`
        );
      });
}

const onFinishEdit = (values) => {
  const data = {
      ...values,
      projectId: ProjectData?._id,
      _id: addTask?.data?.taskId
  }

  setLoader(true)
  apiServices("PUT", 'tasks', data, user_state)
    .then((res) => {
        if (res?.data?.success === true) {
          closeNewTask();
          const updatedOptTasks = allTasks?.map((task) => {
            if (task._id === addTask?.data?.taskId) {
                return {
                    ...task,
                    title: values.title,
                    tags: values.tags,
                    description: values.description
                };
            }
            return task;
          });

          setAllTasks(updatedOptTasks);
          // setAllTasks(prev => [...prev, res?.data?.Task])
          message.success(t('Tasks.updateTaskSuccess'))
          setLoader(false)
          }
        })
        .catch((err) => {
      setLoader(false)
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : t('Tasks.updateTaskError')
        }!`
      );
    });
}

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
            No columns found
          </div>
          {/* <div
                    style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
                  >
                    Click 'Add Employees' Button To Create <br /> A New Employee{" "}
                  </div> */}
        </div>
      }
    />
  );

  const searchHandler = (val, type) => {
    let dropdownValues = [];
    if (type === "task") {
      optTasks.forEach((task) => {
        dropdownValues.push(task.title.toLowerCase());
      });
    }

    if (val !== "") {
      dropdownValues.some((team) => {
        if (team.includes(val.toLowerCase())) {
          // setNoData(false);
          return true;
        } else {
          // setNoData(true);
        }
      });
    } else {
      // setNoData(false)
    }
  };

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
    <>
      <div className="page-wrapper">
        <Helmet>
          <title>Task Board - DaftarPro</title>
          <meta name="description" content="Login page" />
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">
                  {`${ProjectData?.projectName}`} - Task Board
                </h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link
                      to={
                        role === "admin"
                          ? "/main/dashboard"
                          : "/employee/dashboard"
                      }
                    >
                      {t("holiday.dashboard")}
                    </Link>
                  </li>
                  <li className="breadcrumb-item active">Task Board</li>
                </ul>
              </div>
              <div className="col-auto float-end ms-auto">
                <a
                  className="btn btn-white float-end ml-2"
                  onClick={() => {
                    setOpen({ isAddOpen: true, isEditOpen: true, data: "" });
                  }}
                >
                  <i className="fa fa-plus" /> Add Column
                </a>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="kanban-board card mb-0">
              {isLoading ? (
                <div className="col-md-12 text-center">
                  <Spin size="large" tip="Loading..." />
                </div>
              ) :
              columns?.length > 0 ? (
                <div className="card-body">
                  <div className="kanban-cont">
                    {columns.map((column) => (
                      <Droppable key={column._id} droppableId={column._id}>
                        {(provided) => (
                          <div
                            className="kanban-list-container"
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                          >
                            <div
                              className={`kanban-list kanban-${
                                column.color ? column.color : "primary"
                              }`}
                            >
                              <div className="kanban-header">
                                <span className="status-title">
                                  {column.title}
                                </span>
                                <div className="dropdown kanban-action">
                                  <a data-bs-toggle="dropdown">
                                    <i className="fa fa-ellipsis-v" />
                                  </a>
                                  <div className="dropdown-menu dropdown-menu-right">
                                    <a
                                      className="dropdown-item"
                                      onClick={() => {
                                        setOpen({
                                          isAddOpen: true,
                                          data: column,
                                        });
                                        console.log(column);
                                      }}
                                    >
                                      Edit
                                    </a>
                                    <a
                                      className="dropdown-item"
                                      onClick={() => {
                                        setOpen({
                                          isAddOpen: false,
                                          isDelOpen: true,
                                          data: column,
                                        });
                                        console.log(column);
                                      }}
                                    >
                                      Delete
                                    </a>
                                  </div>
                                </div>
                              </div>
                              <div className="kanban-wrap">
                                {column.tasks.map((task, index) => (
                                  <Draggable
                                    key={task.taskId}
                                    draggableId={task.taskId}
                                    index={index}
                                  >
                                    {(provided) => (
                                      <div
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        ref={provided.innerRef}
                                      >
                                        <div className="card panel">
                                          <div className="kanban-box">
                                            <div className="task-board-header">
                                              <span className="status-title">
                                                <a href="task-view.html">
                                                  {getTaskTitle(task.taskId)}
                                                </a>
                                              </span>
                                              <div className="dropdown kanban-task-action">
                                                <a
                                                  href=""
                                                  data-bs-toggle="dropdown"
                                                >
                                                  <i className="fa fa-angle-down" />
                                                </a>
                                                <div className="dropdown-menu dropdown-menu-right">
                                                  <a
                                                    className="dropdown-item"
                                                    onClick={() => 
                                                      { 
                                                        const title = getTaskTitle(task.taskId);
                                                        const tags = getTaskTags(task.taskId);
                                                        const description = getTaskDescription(task.taskId);
                                                        setAddTask({ isAddOpen: true, data: task }); 
                                                        form2.setFieldsValue({ title, tags, description  }) 
                                                        setEditId(task.taskId);
                                                      }}
                                                  >
                                                    Edit
                                                  </a>
                                                  <a
                                                    className="dropdown-item"
                                                    onClick={() => 
                                                      { 
                                                        const title = getTaskTitle(task.taskId);
                                                        setAddTask({ isDelOpen: true, isAddOpen: false, data: task, title: title }); 
                                                        setColumnId(column._id);
                                                      }}
                                                  >
                                                    Remove
                                                  </a>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="task-board-body">
                                              <div className="kanban-footer">
                                                <span className="task-info-cont">
                                                  <span className="task-date">
                                                    {" "}
                                                    {getTaskTags(
                                                      task.taskId
                                                    )?.map((tag) => (
                                                      <Tag
                                                        key={tag}
                                                        color="blue"
                                                      >
                                                        {tag}
                                                      </Tag>
                                                    ))}
                                                  </span>
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              </div>
                              <div className="add-new-task">
                                <a
                                  onClick={() => {
                                    getTasksOptions(ProjectData?._id);
                                    setTaskModal(true);
                                    setColumnId(column._id);
                                  }}
                                >
                                  Add New Task
                                </a>
                              </div>
                            </div>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    ))}
                  </div>
                </div>
              ) : (
                customEmptyText
              )}
            </div>
          </DragDropContext>
        </div>
        {/* /Page Content */}
        <Offcanvas />
      </div>
      <Modal
        open={open?.isAddOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        className="modalScroll"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" },
        }}
        sx={{
          overflowY: "scroll",
        }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {open?.data ? "Edit Column" : "Add Column"}
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
                onFinishFailed={({ errorFields }) => {
                  const consecutiveSpacesError = errorFields.find((field) =>
                    field.errors.toString().includes("consecutive spaces")
                  );
                  if (consecutiveSpacesError) {
                    message.error(t("allEmp.errors.removeConsecutiveSpaces"));
                  } else {
                    message.error(t("allEmp.errors.fillRequiredFields"));
                  }
                }}
                initialValues={{
                  title: open?.data ? open?.data?.title : "",
                  color: open?.data ? open?.data?.color : "",
                }}
                autoComplete="off"
              >
                <div className="form-group">
                  <label>
                    Column Title <span className="text-danger">*</span>
                  </label>
                  <Form.Item name="title" className="custom-border"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: "Please enter a title name",
                    },
                  ]}
                  >
                    <Input className="form-control" autoFocus />
                  </Form.Item>
                </div>
                <div className="form-group task-board-color">
                  <label>Column Color</label>
                  <Form.Item name="color">
                    <div className="board-color-list">
                      {colors.map((color) => (
                        <label
                          key={color.value}
                          className={`board-control board-${color.value}`}
                          style={{ backgroundColor: color.color }}
                        >
                          <Input
                            type="radio"
                            name="color"
                            value={color.value}
                            className="board-control-input"
                            defaultChecked={color.value === open?.data?.color}
                          />
                          <span className="board-indicator" />
                        </label>
                      ))}
                    </div>
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
                        t("submit")
                      )}
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Modal>

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
                <h3 style={{ marginBottom: "30px" }}>Delete Column</h3>
                <p>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t("holiday.confirmDelete", {
                        holiday: open?.data?.title,
                      }),
                    }}
                  />
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
                        t("delete")
                      )}
                    </Button>
                  </div>
                  <div className="col-6">
                    <Button
                      onClick={handleClose}
                      className="btn btn-primary submit-btn"
                      style={{ width: "100%" }}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={addTask.isDelOpen}
        onClose={closeNewTask}
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
                <h3 style={{ marginBottom: "30px" }}>Remove Task</h3>
                <p>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t("holiday.confirmDelete", {
                        holiday: addTask?.title
                      }),
                    }}
                  />
                </p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <Button
                      htmlType="submit"
                      className="btn btn-primary continue-btn"
                      onClick={() => onHandleRemove(addTask?.data?.taskId)}
                      disabled={loader}
                      style={{ width: "100%" }}
                    >
                      {loader ? (
                        <Spin size="small" indicator={antIcon} />
                      ) : (
                        'Remove'
                      )}
                    </Button>
                  </div>
                  <div className="col-6">
                    <Button
                      onClick={closeNewTask}
                      className="btn btn-primary submit-btn"
                      style={{ width: "100%" }}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={taskModal}
        onClose={closeTaskModal}
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
              <h5 className="modal-title">Add Task</h5>
              <button type="button" className="close" onClick={closeTaskModal}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                // form={form}
                name="control-hooks"
                onFinish={(val) => onFinishTask(val, null)}
                onFinishFailed={({ errorFields }) => {
                  const consecutiveSpacesError = errorFields.find((field) =>
                    field.errors.toString().includes("consecutive spaces")
                  );
                  if (consecutiveSpacesError) {
                    message.error(t("allEmp.errors.removeConsecutiveSpaces"));
                  } else {
                    message.error(t("allEmp.errors.fillRequiredFields"));
                  }
                }}
                initialValues={
                  {
                    // holidayTitle: open?.data ? open?.data?.holidayTitle : "",
                    // holidayDate: open?.data ? moment(open?.data.holidayDate, "YYYY-MM-DD") : "",
                  }
                }
                autoComplete="off"
              >
                <div className="form-group">
                  <label>
                    Task Name <span className="text-danger">*</span>
                  </label>
                  <div style={{ position: "relative" }} id="area">
                    <Form.Item
                      name="taskId"
                      className="custom-border"
                      rules={[
                        {
                          whitespace: true,
                          required: true,
                          message: "Please Select a task",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        onSearch={(val) => {
                          searchHandler(val, "task");
                        }}
                        filterOption={(input, option) =>
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        optionFilterProp="children"
                        notFoundContent={
                          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        }
                        dropdownRender={(menu) => <>
                        {menu}
                        <Divider style={{ margin: '5px 0' }} />
                        <Button
                            type="button"
                            icon={<PlusOutlined style={{ fontSize: '20px', marginRight: '5px' }} />}
                            className="addButtonStyles"
                            style={{ width: '100%', height: '40px', background: '#efefef', borderColor: '#efefef', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                            onClick={() => {
                              setAddTask({ isAddOpen: true, data: '' });
                            }}
                        >
                            Add New Task
                        </Button>
                        </>}
                        className="custom-select custom-normal"
                        getPopupContainer={() =>
                          document.getElementById("area")
                        }
                        placeholder="Select Task"
                      >
                        {optTasks.map((task, index) => (
                          <Select.Option key={index} value={task._id}>
                            {task.title}
                          </Select.Option>
                        ))}
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
                        t("submit")
                      )}
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
            open={addTask.isAddOpen}
            onClose={closeNewTask}
            aria-labelledby="modal-modal-title"
            className="modalScroll"
            aria-describedby="modal-modal-description"
            disableRestoreFocus
            BackdropProps={{
            style: { backgroundColor: "rgb(0 0 0 / 87%)" },
            }}
            sx={{
            overflowY: "scroll",
            }}
        >
            <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title">{addTask?.data ? t('edit') : t('holiday.add')} {t('Timesheetemployee.task')}</h5>
                <button type="button" className="close" onClick={closeNewTask}>
                    <span aria-hidden="true">×</span>
                </button>
                </div>
                <div className="modal-body">
                <Form
                form={form2}
                onFinish={(values) => {
                  addTask?.data ? onFinishEdit(values) : onFinishAdd(values)
                }
                }
                onFinishFailed={({errorFields}) => {
                    const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                    if(consecutiveSpacesError){
                      message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                   }else{
                      message.error(t('allEmp.errors.fillRequiredFields'))
                    } 
                }}
                autoComplete='off'
                >
                <div className="row">
                    <div className="col-12">
                        <div className="form-group">
                        <label>
                        {t('Tasks.title')} <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                            name='title'
                            className='custom-border'
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
                            <Input className='form-control' maxLength={50} />
                        </Form.Item>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="form-group">
                        <label>
                        {t('Tasks.tags')} <span className="text-danger">*</span>
                            <Tooltip className="custom-tooltip" placement="rightBottom" title={(
                                <label>{t('Tasks.taginstruction')}</label>
                            )}>
                                <span style={{border: '1px solid grey', color: 'grey', fontSize: '12px', borderRadius: '50%', padding: '1.5px 4px 1px', margin: '5px', cursor: 'pointer'}}>
                                {t('Tasks.Qmark')}
                                </span>
                            </Tooltip>
                        </label>
                        <div style={{ position: "relative" }} className='hideDropdownMenu' id="area22">
                        <Form.Item
                            name='tags'
                            className='addTeamHeight'
                            rules={[
                            {
                                // whitespace: true,
                                required: true,
                                message: t('Tasks.pleaseentertags'),
                            },
                            ]}
                        >
                                <Select
                                    mode="tags"
                                    // className="custom-select custom-normal"
                                    className="custom-select customselect-height"
                                    getPopupContainer={() =>
                                        document.getElementById("area22")
                                    }
                                />
                        </Form.Item>
                        </div>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="form-group">
                        <label style={{display: 'flex', justifyContent: 'space-between'}}>
                            <div>{t('finance.Invoices.description')} <span className="text-danger">*</span></div>
                            <small style={{marginTop: '5px', fontSize: '10px', color: 'rgba(0, 0, 0, 0.5)'}}>{descLength} / 150</small>
                        </label>
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
                                else if (/\s{2,}/.test(value)) {
                                    return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                                }
                                else if (value.length <= 4) {
                                    return Promise.reject(t('Tasks.descriptionLength'));
                                }
                                return Promise.resolve();
                                },
                            },
                            ]}
                            className="custom-border"
                        >
                            <Input.TextArea rows={3} className='form-control' onChange={(e) => setDescLength(e.target.value.length)} maxLength={150} />
                        </Form.Item>
                        </div>
                    </div>
                </div>
                <div className="submit-section">
                    <button type='submit' className="btn btn-primary submit-btn" disabled={loader}>
                    {
                        loader ? <Spin size="small" indicator={antIcon} />
                        : t('submit')
                    }
                    </button>
                </div>
                </Form>
                </div>
            </div>
            </div>
        </Modal>
    </>
  );
};

export default TaskBoard;
