import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation } from "react-router-dom";
import { Avatar_12, user_icon } from "../../../Entryfile/imagepath";
import Offcanvas from "../../../Entryfile/offcanvance";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Avatar,
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
import TaskModal from "./taskModal";


const TaskBoard = () => {
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTaskLoading, setIsTaskLoading] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [optTasks, setOptTasks] = useState([]);
  const [boardId, setBoardId] = useState("");
  const [selectedTask, setSelectedTask] = useState({
    _id: "",
    title: "",
    tags:[],
    description: "",
    ProjectData: {}
  });
  const [columnId, setColumnId] = useState("");
  const [editId, setEditId] = useState("");
  const [boardTitle, setBoardTitle] = useState("");
  const [taskModal, setTaskModal] = useState(false);
  const [remove, setRemove] = useState(false);
  const [newTaskModal, setNewTaskModal] = useState(false);
  const [addTask, setAddTask] = useState({
    isAddOpen: false,
    isEditOpen: false,
    data: "",
    title: "",
  });


  const [disableDrag, setDisableDrag] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProjectName, setEditedProjectName] = useState('');
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loadingAllEmployees, setLoadingAllEmployees] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
  
    if (boardTitle?.trim() === '') {
      return
    }
    let updated_data = {
      _id: boardId,
      boardTitle: boardTitle
    };
    apiServices("PUT", "taskBoard/add-taskBoard", updated_data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          console.log("Name changed ")
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : 'Error editing name'
          }!`
        );
      })
    console.log("Save edited project name:", boardTitle);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Revert to original project name
    console.log("called")
    setBoardTitle(BoardData?._id ? BoardData?.projectName : BoardData?.board?.boardTitle);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    setBoardTitle(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };
  
  const [form2] = Form.useForm();

  const { t, i18n } = useTranslation();
  const location = useLocation();

  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const role = user_state?.user?.role;

  const BoardData = location?.state;
  console.log("data from previous screen",BoardData);
  const onDragEnd = (result) => {
    // Dropped outside the droppable area
    if (!result.destination) {
      return;
    }
    setDisableDrag(true);
    const { source, destination, type } = result;
    if (type === 'column') {
      const newColumns = Array.from(columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);


      let updated_data = {
        _id: boardId,
        columns:newColumns
      };
      apiServices("PUT", "taskBoard/add-taskBoard", updated_data, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            //const sortedData = res?.data?.Task?.docs?.slice().sort((a, b) => a.title.localeCompare(b.title));
            //setAllTasks(sortedData);
            //setColumns(res?.data?.taskBoard?.columns);
            //setIsLoading(false);
            //setLoader(false);
            //message.success('Task Moved successfully')
            //closeTaskModal();
            setDisableDrag(false);
          }
        })
        .catch((err) => {
          //setIsLoading(false);
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Error Moving Column"
            }!`
          );
          setDisableDrag(false);
          //setLoader(false);
        });

  
      setColumns(newColumns);
    }
    else {
      const sourceColumn = columns.find((column) => column._id === source.droppableId);
      const destinationColumn = columns.find((column) => column._id === destination.droppableId);

      const draggedTask = sourceColumn.tasks.find((task) => task.taskId === result.draggableId);

      if (source.droppableId === destination.droppableId) {
        
        const updatedTasks = Array.from(sourceColumn.tasks);
        updatedTasks.splice(source.index, 1);
        updatedTasks.splice(destination.index, 0, draggedTask);
    
        const updatedColumn = { ...sourceColumn, tasks: updatedTasks };
        console.log(updatedTasks);
        let updated_data = {
          _id: boardId,
          columnId: destination.droppableId,
          updatedTasks: updatedTasks,
        };
        apiServices("PUT", "taskBoard/add-taskBoard", updated_data, user_state)
          .then((res) => {
            if (res?.data?.success === true) {
              //const sortedData = res?.data?.Task?.docs?.slice().sort((a, b) => a.title.localeCompare(b.title));
              //setAllTasks(sortedData);
              //setColumns(res?.data?.taskBoard?.columns);
              //setIsLoading(false);
              //setLoader(false);
              //message.success('Task Moved successfully')
              //closeTaskModal();
              setDisableDrag(false);
            }
          })
          .catch((err) => {
            //setIsLoading(false);
            message.error(
              `${
                err?.response?.data?.msg
                  ? err?.response?.data?.msg
                  : err?.response?.data?.validation?.body?.message
                  ? err?.response?.data?.validation?.body?.message
                  : "Error Moving task"
              }!`
            );
            setDisableDrag(false);
            //setLoader(false);
          });
        // Update the state with the updated column
        setColumns((prevColumns) =>
          prevColumns.map((column) => (column._id === updatedColumn._id ? updatedColumn : column))
        );
      }
      else{

        let updated_data = {
          _id: boardId,
          columnId: destination.droppableId,
          prevColumn: source.droppableId,
          taskId: result.draggableId
        };
        apiServices("PUT", "taskBoard/add-taskBoard", updated_data, user_state)
          .then((res) => {
            if (res?.data?.success === true) {
              //const sortedData = res?.data?.Task?.docs?.slice().sort((a, b) => a.title.localeCompare(b.title));
              //setAllTasks(sortedData);
              //setColumns(res?.data?.taskBoard?.columns);
              //setIsLoading(false);
              //setLoader(false);
              //message.success('Task Moved successfully')
              //closeTaskModal();
              setDisableDrag(false);
            }
          })
          .catch((err) => {
            //setIsLoading(false);
            message.error(
              `${
                err?.response?.data?.msg
                  ? err?.response?.data?.msg
                  : err?.response?.data?.validation?.body?.message
                  ? err?.response?.data?.validation?.body?.message
                  : "Error Moving task"
              }!`
            );
            setDisableDrag(false);
            //setLoader(false);
          });

      const updatedSourceTasks = sourceColumn.tasks.filter((task) => task.taskId !== result.draggableId);

      const updatedSourceColumn = { ...sourceColumn, tasks: updatedSourceTasks };

      const updatedDestinationTasks = [...destinationColumn.tasks, draggedTask];
      const updatedDestinationColumn = { ...destinationColumn, tasks: updatedDestinationTasks };

      setColumns((prevColumns) => {
        const updatedColumns = prevColumns.map((column) => {
          if (column._id === updatedSourceColumn._id) {
            return updatedSourceColumn;
          }
          if (column._id === updatedDestinationColumn._id) {
            return updatedDestinationColumn;
          }
          return column;
        });
        return updatedColumns;
      });
    }
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

  const closeViewModal = () => {
    console.log("hello")
    setViewModal(false)
  };
  
  const closeTaskModal = () => {
    setSelectedTeamMembers([])
    setTaskModal(false);
    setColumnId('');
    //setIsLoading(false)
  };

  const closeNewTask = () => {
    setAddTask({
      isAddOpen: false,
      isDelOpen: false,
      data: '',
      title: '',
    });
    setSelectedTeamMembers([]); // Clear selected team members
    setEditId("");
    form2.resetFields();
    setLoader(false);
  };

  const colors = [
    { name: "Primary", value: "primary", color: "#ff9b44" },
    { name: "Success", value: "success", color: "#28a745" },
    { name: "Info", value: "info", color: "#42a5f5" },
    { name: "Purple", value: "purple", color: "#7460ee" },
    { name: "Warning", value: "warning", color: "#ffc107" },
    { name: "Danger", value: "danger", color: "#dc3545" },
  ];

  const colorMapping = {
    primary: "#ff9b44",
    success: "#28a745",
    info: "#42a5f5",
    purple: "#7460ee",
    warning: "#ffc107",
    danger: "#dc3545",
  };

  const getTaskTitle = (taskId) => {
    const task = allTasks.find((task) => task._id === taskId);
    return task ? task.title : "";
  };

  const getTaskAssignedDevelopers = (taskId) => {
    const task = allTasks.find((task) => task._id === taskId);
    return task ? task.assignedDevelopers : [];
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
      `tasks?id=${id}&page=${1}&limit=${99999}&isArchived=${BoardData?.board?.isArchived}`,
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
          setIsTaskLoading(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        setIsTaskLoading(false);
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
      `tasks?id=${id}&lane=empty&page=${1}&limit=${99999}&isArchived=${BoardData?.board?.isArchived}`,
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
      `taskBoard/view-taskBoard?id=${id}&isArchived=${BoardData?.board?.isArchived}`,
      null,
      user_state
    )
      .then((res) => {
        if (res?.data?.success === true) {
          //const sortedData = res?.data?.Task?.docs?.slice().sort((a, b) => a.title.localeCompare(b.title));
          //setAllTasks(sortedData);
          res?.data?.taskBoards?.map((board) => {
            setBoardId(board?._id);
            setBoardTitle(board?.boardTitle ? board?.boardTitle : BoardData?.board?.boardTitle ? BoardData?.board?.boardTitle : BoardData?.board?.project?.projectName ? BoardData?.board?.project?.projectName : BoardData?.projectName);
            setEmployees(board?.assignedDevelopers);
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

  const handleChange = (values) => {

    const selectedEmployees = values?.map((value) =>
      employees?.find((employee) => employee._id === value)
    );
    setSelectedTeamMembers(selectedEmployees);
  }

  const getTeamMemberOptions = () => {
    return employees?.map((employee) => (
      <Select.Option key={employee._id} value={employee._id}>
        {employee.fullName}
      </Select.Option>
    ));
  }
  useEffect(() => {
    setIsLoading(true);
    setIsTaskLoading(true);
    getAllTasks(BoardData?._id ? BoardData?._id : BoardData?.board?.project ? BoardData?.board?.project?._id : BoardData?.board?._id);
    getTaskBoard(BoardData?._id ? BoardData?._id : BoardData?.board?.project ? BoardData?.board?.project?._id : BoardData?.board?._id);
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
        color: !(values.color) ? 'primary' : values.color,
        title: values.title
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
            // Update columns with server response
            setColumns(res?.data?.taskBoard?.columns);
            
            // Get fresh data for all tasks
            getAllTasks(BoardData?._id ? BoardData?._id : BoardData?.board?.project ? BoardData?.board?.project?._id : BoardData?.board?._id);
            
            setIsLoading(false);
            setLoader(false);
            message.success('Task added successfully');
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
        if (res?.data?.success === true) {
          // Update columns to remove task
          setColumns((prevColumns) =>
            prevColumns?.map((column) => {
              if (column._id === columnId) {
                column.tasks = column?.tasks?.filter(task => task.taskId !== id);
              }
              return column;
            })
          );

          // Update allTasks to set empty developers array for the removed task
          setAllTasks(prevTasks => 
            prevTasks.map(task => {
              if (task._id === id) {
                return {
                  ...task,
                  assignedDevelopers: [] // Clear the developers array
                };
              }
              return task;
            })
          );

          message.success("Task Removed Successfully");
          closeNewTask();
          setColumnId('');
          setLoader(false);
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
              : "Error removing task"
          }!`
        );
      });
  };

  const onFinishAdd = (values) => {
    let updated_data = {
      ...values,
      ...(BoardData?.board?.project 
        ? { projectId: BoardData?.board?.project?._id } 
        : BoardData?._id
        ? { projectId: BoardData?._id}
        : { boardId: BoardData?.board?._id }),
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
      ...(BoardData?.board?.project 
        ? { projectId: BoardData?.board?.project?._id }
        : BoardData?._id
        ? { projectId: BoardData?._id}
        : { boardId: BoardData?.board?._id }),
      _id: addTask?.data?.taskId
  }

  setLoader(true)
  apiServices("PUT", 'tasks', data, user_state)
    .then((res) => {
        if (res?.data?.success === true) {
          closeNewTask();
          // Get the full developer objects from employees array using the assignedDevelopers IDs
          const updatedDevelopers = values.assignedDevelopers?.map(devId => 
            employees?.find(emp => emp._id === devId)
          ).filter(Boolean);

          const updatedOptTasks = allTasks?.map((task) => {
            if (task._id === addTask?.data?.taskId) {
                return {
                    ...task,
                    title: values.title,
                    tags: values.tags,
                    description: values.description,
                    assignedDevelopers: updatedDevelopers // Use the full developer objects
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

  const customEmptyText2 = (
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
        height: "250px",
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
            No tasks added
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

  const handleBoardMembersChange = (values) => {
    const selectedEmployees = values?.map((value) =>
      allEmployees?.find((employee) => employee._id === value)
    ).filter(Boolean); // Remove any undefined values
    
    // Ensure the data is properly structured
    const updated_data = {
      _id: boardId,
      assignedDevelopers: Array.isArray(values) ? values : []
    };
    
    setLoader(true);
    apiServices("PUT", "taskBoard/add-taskBoard", JSON.parse(JSON.stringify(updated_data)), user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setEmployees(selectedEmployees);
          message.success('Board members updated successfully');
          closeTaskModal();
          getAllTasks(BoardData?._id ? BoardData?._id : BoardData?.board?.project ? BoardData?.board?.project?._id : BoardData?.board?._id);
          setLoader(false);
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
              : 'Error updating board members'
          }!`
        );
      });
  }

  const fetchAllEmployees = () => {
    setLoadingAllEmployees(true);
    apiServices("GET", `user/all-employees`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const emps = res?.data?.User;
          const sortedData = emps
            .slice()
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
          setAllEmployees(sortedData);
          setLoadingAllEmployees(false);
        }
      })
      .catch((err) => {
        setLoadingAllEmployees(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("aAttend.errors.getEmployeesError")
          }`
        );
      });
  };

  const getAllEmployeeOptions = () => {
    return allEmployees?.map((employee) => (
      <Select.Option key={employee._id} value={employee._id}>
        {employee.fullName}
      </Select.Option>
    ));
  };

  const showEmployeeSearch = (val) => {
    let dropdownValues = [];
    allEmployees.forEach((emp) => {
      dropdownValues.push(emp.fullName.toLowerCase());
    });

    if (val !== "") {
      dropdownValues.some((name) => {
        if (name.includes(val.toLowerCase())) {
          return true;
        }
      });
    }
  };

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
              
                {isEditing ? (
                <React.Fragment>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <input
              type="text"
              className="form-control"
              value={boardTitle}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleCancel}
              autoFocus
              style={{width:'300px'}}
              required
              maxLength={50}
            />
            <a
              className="btn btn-primary"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleSave}
              style={{ marginLeft: '10px', height:'42px', textAlign:'center' }}
            >
              Save
            </a>
            </div>
            {boardTitle?.trim() === '' && <p className="text-danger">Board title cannot be empty.</p>}
            </React.Fragment>
          ) : (
            <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
            <h3 className="page-title" >
              {boardTitle ? boardTitle : BoardData?.board?.boardTitle ? BoardData?.board?.boardTitle : BoardData?._id ? BoardData?.projectName : BoardData?.board?.project?.projectName}
            </h3>
            {(role === "admin" || permissions?.projectManagement) &&
            (<h3 style={{marginLeft:'1%'}}>
            <a onClick={handleEditClick}><i className="fa fa-pencil ml-2" /></a>
            </h3>
          )}
            </div>
          )}{/* <h3 className="page-title">
                  {`${ProjectData?.projectName}`} - Task Board
                </h3> */}
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link
                      to={
                        "/task-board"
                      }
                    >
                      <span className="arrow_routes"></span>
                      {t('Task Boards')}
                    </Link>
                  </li>
                  <li className="breadcrumb-item active">Board</li>
                </ul>
                
                
              </div>
              <div className="col-auto float-end ms-auto">
                <div className="d-flex gap-2 align-items-center">
                  <div className="project-members mr-3">
                    <ul className="team-members" style={{minWidth: 'max-content', marginBottom: 0}}>
                      {employees?.slice(0, 4).map((developer, index) => (
                        <li key={index}>
                          <Tooltip title={developer?.fullName}>
                            <Avatar size={24} style={{cursor: 'pointer'}} src={developer?.imageUrl || user_icon} />
                          </Tooltip>
                        </li>
                      ))}
                      {employees?.length > 4 && (
                        <li className="dropdown avatar-dropdown">
                          <Link
                            className="all-users dropdown-toggle projectTeamMember"
                            style={{display:'inline-flex', height: '24px', width: '24px', fontSize: '10px'}}
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            +{employees?.length - 4}
                          </Link>
                          <div className="dropdown-menu dropdown-menu-right">
                            <div className="avatar-group">
                              {employees?.slice(4).map((developer, index) => (
                                <a
                                  className="avatar avatar-xs projectTeamMember"
                                  key={index}
                                >
                                  <Tooltip title={developer?.fullName}>
                                    <Avatar
                                      src={developer?.imageUrl || user_icon}
                                      style={{cursor: 'pointer'}}
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
                  {(role === "admin" || permissions?.projectManagement) && (
                      <a
                        className="btn add-btn mr-3"
                        onClick={() => {
                          fetchAllEmployees();
                          setTaskModal(true);
                          setColumnId('');
                        }}
                      >
                        <i className="fa fa-pencil ml-2" />
                        Edit Members
                      </a>
                  )}
                  <a
                    className="btn add-btn"
                    onClick={() => {
                      setOpen({ isAddOpen: true, isEditOpen: true, data: "" });
                    }}
                  >
                    <i className="fa fa-plus" /> Add Column
                  </a>
                </div>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="all-columns" direction="horizontal" type="column">
              {(provided) => (
                <div className="kanban-board card mb-0" {...provided.droppableProps} ref={provided.innerRef}>
                  {isLoading ? (
                    <div className="col-md-12 text-center">
                      <Spin size="large" tip="Loading..." />
                    </div>
                  ) : 
                  columns?.length > 0 ? (
                    <div className="card-body">
                      <div className="kanban-cont">
                        {columns.map((column, index) => (
                          <Draggable key={column._id} draggableId={column._id} index={index} type="column" isDragDisabled={disableDrag}>
                            {(provided) => (
                              <div
                                className="kanban-list-container"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                <div
                                  className={`kanban-list kanban-${
                                    column.color ? column.color : "primary"
                                  }`}
                                  style={{
                                     marginRight:'10px'
                                     }}
                                >
                                  <div className="kanban-header"
                                   {...provided.dragHandleProps}>
                                    <label className="status-title longText3">
                                      {column.title}
                                      </label>
                                    <div className="dropdown kanban-action">
                                      <a
                                        data-bs-toggle='dropdown'
                                        aria-expanded='true'
                                        style={{ cursor: "pointer" }}>
                                        <i className="fa fa-ellipsis-v " />
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
                                  <Droppable droppableId={column._id} type="task">
                                    {(provided) => (
                                      <div className="kanban-wrap" style={{ height: "365px", overflowY: "auto", padding: 5 }} ref={provided.innerRef} {...provided.droppableProps}>
                                        {
                                          isTaskLoading ? (
                                            <div className="col-md-12 text-center">
                                              <Spin size="medium" tip="Loading..." />
                                            </div>
                                          ) : 
                                        (
                                          column?.tasks?.length > 0 ? (
                                            column.tasks.map((task, index) => (
                                              <Draggable
                                                key={task.taskId}
                                                draggableId={task.taskId}
                                                index={index} 
                                                isDragDisabled={disableDrag}
                                                >
                                                {(provided) => (
                                                  <div
                                                  {...provided.draggableProps} 
                                                  {...provided.dragHandleProps} 
                                                  ref={provided.innerRef}
                                                  >
                                                    <div className="card panel" 
                                                    style={{ 
                                                      marginBottom: '5px' 
                                                      }}>
                                                      <div className="kanban-box">
                                                        <div className="task-board-header">
                                                          <span className="status-title" 
                                                          style={{ paddingRight: 'inherit', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', width: '100%' }}>
                                                            <a 
                                                            style={{
                                                              wordBreak:'break-word'
                                                            }}
                                                            onClick={() => 
                                                              {
                                                              const title = getTaskTitle(task.taskId);
                                                              const tags = getTaskTags(task.taskId);
                                                              const description = getTaskDescription(task.taskId);
                                                              const status = column.title;
                                                              const taskAssignedDevelopers = getTaskAssignedDevelopers(task.taskId);

                                                              setSelectedTask({
                                                                _id: task.taskId,
                                                                title,
                                                                tags,
                                                                description,
                                                                ProjectData: BoardData?._id ? 
                                                                  {
                                                                    projectName: BoardData?.projectName,
                                                                    _id: BoardData?._id,
                                                                    assignedDevelopers: employees
                                                                  } 
                                                                  : BoardData?.board?.project ? 
                                                                  {
                                                                    projectName: BoardData?.board?.project?.projectName,
                                                                    _id: BoardData?.board?.project?._id,
                                                                    assignedDevelopers: employees
                                                                  } 
                                                                  : 
                                                                  {
                                                                    boardTitle: BoardData?.board?.boardTitle,
                                                                    _id: BoardData?.board?._id,
                                                                    project: null,
                                                                    assignedDevelopers: employees
                                                                  },
                                                                status,
                                                                assignedDevelopers: taskAssignedDevelopers
                                                              });
                                                              setViewModal(true);
                                                            }}
                                                            >
                                                              {getTaskTitle(task.taskId)}
                                                            </a>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                              <div className="project-members" style={{margin: '4px auto'}}>
                                                                <ul className="team-members" style={{minWidth: 'max-content'}}>
                                                                  {getTaskAssignedDevelopers(task.taskId)?.slice(0, 4).map((developer, index) => (
                                                                    <li key={index}>
                                                                      <Tooltip title={developer?.fullName}>
                                                                        <Avatar size={24} style={{cursor: 'pointer'}} src={developer?.imageUrl || user_icon} />
                                                                      </Tooltip>
                                                                    </li>
                                                                  ))}
                                                                  {getTaskAssignedDevelopers(task.taskId)?.length > 4 && (
                                                                    <li className="dropdown avatar-dropdown">
                                                                      <Link
                                                                        className="all-users dropdown-toggle projectTeamMember"
                                                                        style={{display:'inline-flex', height: '24px', width: '24px', fontSize: '10px'}}
                                                                        data-bs-toggle="dropdown"
                                                                        aria-expanded="false"
                                                                      >
                                                                        +{getTaskAssignedDevelopers(task.taskId)?.length - 4}
                                                                      </Link>
                                                                      <div className="dropdown-menu dropdown-menu-right">
                                                                        <div className="avatar-group">
                                                                          {getTaskAssignedDevelopers(task.taskId)?.slice(4).map((developer, index) => (
                                                                            <a
                                                                              className="avatar avatar-xs projectTeamMember"
                                                                              key={index}
                                                                            >
                                                                              <Tooltip title={developer?.fullName}>
                                                                                <Avatar
                                                                                  src={developer?.imageUrl || user_icon}
                                                                                  style={{cursor: 'pointer'}}
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
                                                          <div className="dropdown kanban-task-action">
                                                            <a 
                                                            data-bs-toggle='dropdown'
                                                            aria-expanded='true'
                                                            style={{ cursor: "pointer" }}
                                                            >
                                                              <i className="fa fa-angle-down" />
                                                            </a>
                                                            <div className="dropdown-menu dropdown-menu-right">
                                                            {(role === "admin" || permissions?.projectManagement) && (
                                                              <a 
                                                              className="dropdown-item" 
                                                              onClick={() => 
                                                                {
                                                                const title = getTaskTitle(task.taskId);
                                                                const tags = getTaskTags(task.taskId);
                                                                const description = getTaskDescription(task.taskId);
                                                                const assignedDevelopers = getTaskAssignedDevelopers(task.taskId);
                                                                // Set the full developer objects for display
                                                                setSelectedTeamMembers(assignedDevelopers);
                                                                // Extract just the IDs for the form
                                                                const developerIds = assignedDevelopers?.map(dev => dev._id);
                                                                setAddTask({ isAddOpen: true, data: task });
                                                                form2.setFieldsValue({ 
                                                                  title, 
                                                                  tags, 
                                                                  description, 
                                                                  assignedDevelopers: developerIds 
                                                                });
                                                                setEditId(task.taskId);
                                                              }}
                                                              >
                                                                Edit
                                                              </a>
                                                            )}
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
                                                          </span>
                                                        </div>
                                                        <div className="task-board-body">
                                                          <div className="kanban-footer">
                                                            <span className="task-info-cont" style={{ maxHeight: "4em", overflow: "hidden" }}>
                                                              <span className="task-date">
                                                                {" "}
                                                                {getTaskTags(
                                                                  task.taskId
                                                                )?.map((tag) => (
                                                                  <Tag 
                                                                  key={tag}
                                                                  color={colorMapping[column.color]} 
                                                                  style={{ marginBottom: "4px" }}
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
                                            ))
                                          ) : (
                                            customEmptyText2
                                          )
                                        )
                                        }
                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>
                                  <div className="add-new-task" style={{ padding: '5px', borderTop: '1px solid #ddd' }}>
                                    <a 
                                    style={{ cursor: "pointer" }} 
                                    // style={{ cursor: (role === "admin" || permissions.projectManagement) ? "pointer" : "not-allowed" }} 
                                    // onClick={() => {
                                    //   if ((role === "admin" || permissions.projectManagement)) {
                                    //     getTasksOptions(ProjectData?._id);
                                    //     setTaskModal(true);
                                    //     setColumnId(column._id);
                                    //   } 
                                    //   else {
                                    //     return;
                                    //   }
                                    // }}
                                    onClick={() => {
                                      getTasksOptions(BoardData?._id ? BoardData?._id : BoardData?.board?.project ? BoardData?.board?.project?._id : BoardData?.board?._id);
                                      setTaskModal(true);
                                      setColumnId(column._id);
                                    }}
                                    >
                                      Add New Task
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  ) : (
                    customEmptyText
                  )}
                </div>
              )}
            </Droppable>
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
                    <Input className="form-control" autoFocus maxLength={30}/>
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
                            defaultChecked={
                              (open?.data?.color && color.value === open?.data?.color) ||
                              (!open?.data?.color && color.value === "primary")
                            }
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
                      __html: t("holiday.confirmRemove", {
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
              <h5 className="modal-title">{columnId ? "Add Task" : "Edit Board Members"}</h5>
              <button type="button" className="close" onClick={closeTaskModal}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            {columnId ? (
            <div className="modal-body">
              <Form
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
                            style={{ width: '100%', height: '40px', background: '#efefef', borderColor: '#efefef', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    cursor: "pointer"
                            }}
                            onClick={() => {
                              setSelectedTeamMembers([]); // Clear selected team members
                              form2.resetFields(); // Reset form fields
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
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.addTeam")}{" "}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="assignedDevelopers"
                          className="addTeamHeight"
                          
                        >
                          <Select
                            showSearch
                            onSearch={(val) => {
                              showTeamSearch(val, "Team");
                              // onTeamChange(val)
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
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.teamMembers")}</label>
                      <div
                        className="project-members"
                        style={{ margin: "4px auto" }}
                      >
                        <ul
                          className="team-members"
                          style={{ minWidth: "max-content" }}
                        >
                          {selectedTeamMembers
                            ?.slice(0, 4)
                            .map((teamMember, index) => (
                              <li key={index}>
                                <Tooltip
                                  title={teamMember?.fullName}
                                >
                                  <Avatar
                                    style={{ cursor: "pointer" }}
                                    src={
                                      teamMember?.imageUrl || user_icon
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
                              {/* Dropdown menu for additional team members */}
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
                                          title={
                                            teamMember?.fullName
                                          }
                                        >
                                          <Avatar
                                            src={
                                              teamMember?.imageUrl ||
                                              user_icon
                                            }
                                            style={{ cursor: "pointer" }}
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
                    </div>
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
            ) : (
            <div className="modal-body">
              <Form
                name="board-members-form"
                onFinish={(values) => handleBoardMembersChange(values.assignedDevelopers)}
                initialValues={{
                  assignedDevelopers: employees?.map(emp => emp._id)
                }}
                autoComplete="off"
              >
                <div className="form-group">
                  <label>
                    {t("projectScreen.Modal.addTeam")}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <div style={{ position: "relative" }} id="board-members-area">
                    <Form.Item
                      name="assignedDevelopers"
                      className="addTeamHeight"
                      rules={[
                        {
                          required: true,
                          message: 'Please select at least one team member'
                        }
                      ]}
                    >
                      <Select
                        showSearch
                        onSearch={(val) => {
                          showEmployeeSearch(val);
                        }}
                        filterOption={(input, option) =>
                          option.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        optionFilterProp="children"
                        notFoundContent={
                          loadingAllEmployees ? (
                            <Spin style={{
                              height: "38px",
                              width: "100%",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }} />
                          ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                          )
                        }
                        dropdownRender={(menu) => <>{menu}</>}
                        getPopupContainer={() =>
                          document.getElementById("board-members-area")
                        }
                        className="customselect-height custom-select"
                        mode="multiple"
                        placeholder={t(
                          "projectScreen.Modal.selectTeamMembers"
                        )}
                      >
                        {getAllEmployeeOptions()}
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
            )}
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
                            <Input className='form-control' maxLength={50}/>
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
                            <Input.TextArea rows={3} className='form-control' />
                        </Form.Item>
                        </div>
                    </div>
                    {addTask?.data ? (
                      <div className="row">
                        <div className="col-sm-6">
                          <div className="form-group">
                      <label>{t("projectScreen.Modal.addTeam")}{" "}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="assignedDevelopers"
                          className="addTeamHeight"
                          
                        >
                          <Select
                            showSearch
                            onSearch={(val) => {
                              showTeamSearch(val, "Team");
                              // onTeamChange(val)
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
                      </div>
                    </div>
                    </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.teamMembers")}</label>
                      <div
                        className="project-members"
                        style={{ margin: "4px auto" }}
                      >
                        <ul
                          className="team-members"
                          style={{ minWidth: "max-content" }}
                        >
                          {selectedTeamMembers
                            ?.slice(0, 4)
                            .map((teamMember, index) => (
                              <li key={index}>
                                <Tooltip
                                  title={teamMember?.fullName}
                                >
                                  <Avatar
                                    style={{ cursor: "pointer" }}
                                    src={
                                      teamMember?.imageUrl || user_icon
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
                              {/* Dropdown menu for additional team members */}
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
                                          title={
                                            teamMember?.fullName
                                          }
                                        >
                                          <Avatar
                                            src={
                                              teamMember?.imageUrl ||
                                              user_icon
                                            }
                                            style={{ cursor: "pointer" }}
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
                    </div>
                  </div>
                </div> ) : null} 
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

        {viewModal && (
          <TaskModal
            data={selectedTask}
            viewModal={viewModal}
            closeViewModal={closeViewModal}
            getAllTasks={getAllTasks}
          />
        )}
    </>
  );
};

export default TaskBoard;
