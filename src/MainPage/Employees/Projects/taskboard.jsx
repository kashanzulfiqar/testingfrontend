import React, { useEffect, useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate, useSearchParams, useParams } from "react-router-dom";
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
  Popover,
  Badge,
  Table,
} from "antd";
import {
  LoadingOutlined,
  MinusCircleFilled,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { Modal } from "@mui/material";
import { apiServices } from "../../../Services/apiServices";
import { useSelector } from "react-redux";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { useForm } from "react-hook-form";
import TaskModal from "./taskModal";
import TaskContent from "./taskContents";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import moment from 'moment';

const TaskBoard = () => {
  const [form] = Form.useForm();
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTaskLoading, setIsTaskLoading] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [optTasks, setOptTasks] = useState([]);
  const [boardId, setBoardId] = useState("");
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedTask, setSelectedTask] = useState({
    _id: "",
    title: "",
    tags: [],
    description: "",
    ProjectData: {},
    columnId: "",
    columnName: "",
    columnColor: "",
    allColumns: [],
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

  const [openUser, setOpenUser] = useState(false);
  const [selectedDevelopers, setSelectedDevelopers] = useState([]);
  const [disableDrag, setDisableDrag] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProjectName, setEditedProjectName] = useState("");
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [loadingAllEmployees, setLoadingAllEmployees] = useState(false);
  const [descValue, setDescValue] = useState('');
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [dueDateValue, setDueDateValue] = useState(null);
  const [originalDueDate, setOriginalDueDate] = useState(null);
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState([]);
  const [filteredColumns, setFilteredColumns] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState([]);
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState([]);
  const [selectedReporterFilter, setSelectedReporterFilter] = useState([]);
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [viewMode, setViewMode] = useState('board');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkStatusModal, setBulkStatusModal] = useState(false);
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (boardTitle?.trim() === "") {
      return;
    }
    let updated_data = {
      _id: boardId,
      boardTitle: boardTitle,
    };
    apiServices("PUT", "taskBoard/add-taskBoard", updated_data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          console.log("Name changed ");
        }
      })
      .catch((err) => {
        message.error(
          `${err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error editing name"
          }!`
        );
      });
    console.log("Save edited project name:", boardTitle);
    setIsEditing(false);
  };

  const handleDropdownToggle = (taskId, event) => {
    event.stopPropagation(); // Prevent event bubbling
    setActiveDropdown(activeDropdown === taskId ? null : taskId); // Toggle state
  };

  const handleCancel = () => {
    // Revert to original project name
    console.log("called");
    setBoardTitle(
      BoardData?._id ? BoardData?.projectName : BoardData?.board?.boardTitle
    );
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { id: urlBoardId } = useParams();

  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const role = user_state?.user?.role;

  const BoardData = location?.state;
  console.log("data from previous screen", BoardData);
  const onDragEnd = (result) => {
    // Dropped outside the droppable area
    if (!result.destination) {
      return;
    }
    // Prevent drag-and-drop for client and focalperson roles
    // if (role === 'client' || role === 'focalperson') {
    //   return;
    // }
    setDisableDrag(true);
    const { source, destination, type } = result;
    if (type === "column") {
      const newColumns = Array.from(columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);

      let updated_data = {
        _id: boardId,
        columns: newColumns,
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
            //closeAddTaskModal();
            setDisableDrag(false);
          }
        })
        .catch((err) => {
          //setIsLoading(false);
          message.error(
            `${err?.response?.data?.msg
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
    } else {
      const sourceColumn = columns.find(
        (column) => column._id === source.droppableId
      );
      const destinationColumn = columns.find(
        (column) => column._id === destination.droppableId
      );

      const draggedTask = sourceColumn.tasks.find(
        (task) => task.taskId === result.draggableId
      );

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
              //closeAddTaskModal();
              setDisableDrag(false);
            }
          })
          .catch((err) => {
            //setIsLoading(false);
            message.error(
              `${err?.response?.data?.msg
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
          prevColumns.map((column) =>
            column._id === updatedColumn._id ? updatedColumn : column
          )
        );
      } else {
        let updated_data = {
          _id: boardId,
          columnId: destination.droppableId,
          prevColumn: source.droppableId,
          taskId: result.draggableId,
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
              //closeAddTaskModal();
              setDisableDrag(false);
            }
          })
          .catch((err) => {
            //setIsLoading(false);
            message.error(
              `${err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                  ? err?.response?.data?.validation?.body?.message
                  : "Error Moving task"
              }!`
            );
            setDisableDrag(false);
            //setLoader(false);
          });

        const updatedSourceTasks = sourceColumn.tasks.filter(
          (task) => task.taskId !== result.draggableId
        );

        const updatedSourceColumn = {
          ...sourceColumn,
          tasks: updatedSourceTasks,
        };

        const updatedDestinationTasks = [
          ...destinationColumn.tasks,
          draggedTask,
        ];
        const updatedDestinationColumn = {
          ...destinationColumn,
          tasks: updatedDestinationTasks,
        };

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
    setViewModal(false);
  };

  const closeAddTaskModal = () => {
    setSelectedTeamMembers([]);
    setTaskModal(false);
    setOpenUser(false);
    setColumnId("");
    //setIsLoading(false)
  };

  const closeNewTask = () => {
    setAddTask({
      isAddOpen: false,
      isDelOpen: false,
      data: "",
      title: "",
    });
    closeAddTaskModal();
    getAllTasks(
      BoardData?._id
        ? BoardData?._id
        : BoardData?.board?.project
          ? BoardData?.board?.project?._id
          : BoardData?.board?._id
    );
    getTaskBoard(
      BoardData?._id
        ? BoardData?._id
        : BoardData?.board?.project
          ? BoardData?.board?.project?._id
          : BoardData?.board?._id
    );
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

  const getTaskPriority = (taskId) => {
    const task = allTasks.find((task) => task._id === taskId);
    return task ? task.priority : "";
  };

  const getTaskTicketNumber = (taskId) => {
    const task = allTasks.find((task) => task._id === taskId);
    return task ? task.ticketNumber : "";
  };

  const getTaskAssignee = (taskId) => {
    const task = allTasks.find((task) => task._id === taskId);
    if (!task) return null;

    if (task.assignee) {
      const assignee = employees.find(emp => emp._id === task.assignee);
      return assignee;
    }

    if (task.assignedDevelopers && task.assignedDevelopers.length > 0) {
      return task.assignedDevelopers[0];
    }

    return null;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const getAllTasks = (id) => {
    const taskId = id;

    // Client/Focalperson: fetch tasks via role-specific endpoint with taskboardId
    if (role === 'client' || role === 'focalperson') {
      apiServices(
        "GET",
        `tasks/task-by-id?role=${role}&id=${user_state?.user?._id}&taskBoardId=${taskId}&page=${1}&limit=${99999}&isArchived=${BoardData?.board?.isArchived || false}&populate=assignedDevelopers`,
        null,
        user_state
      )
        .then((res) => {
          if (res?.data?.success === true) {
            const docs = res?.data?.Task?.docs || res?.data?.Task || [];
            const sortedData = docs?.slice()?.sort((a, b) => a.title.localeCompare(b.title));
            setAllTasks(sortedData);
            setIsLoading(false);
            setIsTaskLoading(false);
          }
        })
        .catch((err) => {
          setIsLoading(false);
          setIsTaskLoading(false);
          message.error(
            `${err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : t("Timesheetemployee.getAllTasksError")
            }!`
          );
        });
      return;
    }

    apiServices(
      "GET",
      `tasks?taskBoardId=${taskId}&page=${1}&limit=${99999}&isArchived=${BoardData?.board?.isArchived || false}&populate=assignedDevelopers`,
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
          `${err?.response?.data?.msg
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
      `tasks?taskBoardId=${id}&lane=empty&page=${1}&limit=${99999}&isArchived=${BoardData?.board?.isArchived || false}`,
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
          `${err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("Timesheetemployee.getAllTasksError")
          }!`
        );
      });
  };

  const getTaskBoard = (id) => {
    setIsLoading(true);
    const taskboardId = id;

    // Client/Focalperson: use role-specific endpoint with clientId and taskboardId
    if (role === 'client' || role === 'focalperson') {
      apiServices(
        "GET",
        `taskBoard/taskboard-by-id?role=${role}&id=${user_state?.user?._id}&taskboardId=${taskboardId}`,
        null,
        user_state
      )
        .then((res) => {
          if (res?.data?.success === true) {
            const boards = res?.data?.taskBoards?.docs || res?.data?.taskBoards || (res?.data?.taskBoard ? [res?.data?.taskBoard] : []);
            boards?.map((board) => {
              setBoardId(board?._id);
              setBoardTitle(
                board?.boardTitle
                  ? board?.boardTitle
                  : BoardData?.board?.boardTitle
                    ? BoardData?.board?.boardTitle
                    : BoardData?.board?.project?.projectName
                      ? BoardData?.board?.project?.projectName
                      : BoardData?.projectName
              );
              setEmployees(board?.assignedDevelopers);
              setSelectedDevelopers(board?.assignedDevelopers);
              setColumns(board?.columns);
            });
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          message.error(
            `${err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Error getting taskboard data"
            }!`
          );
        });
      return;
    }

    // Default: existing endpoint
    apiServices(
      "GET",
      `taskBoard/view-taskBoard?id=${taskboardId}&isArchived=${BoardData?.board?.isArchived || false}`,
      null,
      user_state
    )
      .then((res) => {
        if (res?.data?.success === true) {
          res?.data?.taskBoards?.map((board) => {
            setBoardId(board?._id);
            setBoardTitle(
              board?.boardTitle
                ? board?.boardTitle
                : BoardData?.board?.boardTitle
                  ? BoardData?.board?.boardTitle
                  : BoardData?.board?.project?.projectName
                    ? BoardData?.board?.project?.projectName
                    : BoardData?.projectName
            );
            setEmployees(board?.assignedDevelopers);
            setSelectedDevelopers(board?.assignedDevelopers);
            setColumns(board?.columns);
          });
          setIsLoading(false);
        }
      })
      .catch((err) => {
        setIsLoading(false);
        message.error(
          `${err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error getting taskboard data"
          }!`
        );
      });
  };
  // used in add new task & onclick edit task ticket
  const handleChange = (values) => {
    const selectedEmployees = values?.map((value) =>
      employees?.find((employee) => employee._id === value)
    );
    setSelectedTeamMembers(selectedEmployees);
  };
  // used in add new task & onclick edit task ticket
  const getTeamMemberOptions = () => {
    return employees?.map((employee) => (
      <Select.Option key={employee._id} value={employee._id}>
        {employee.fullName}
      </Select.Option>
    ));
  };
  // Get the effective board ID - from state or URL
  const getEffectiveBoardId = useCallback(() => {
    if (BoardData?._id) return BoardData._id;
    if (BoardData?.board?.project?._id) return BoardData.board.project._id;
    if (BoardData?.board?._id) return BoardData.board._id;
    return urlBoardId;
  }, [BoardData, urlBoardId]);

  // Initial load - fetch board and tasks
  useEffect(() => {
    const boardIdToUse = getEffectiveBoardId();
    
    if (!boardIdToUse) return;
    
    setIsLoading(true);
    setIsTaskLoading(true);
    getTaskBoard(boardIdToUse);
    getAllTasks(boardIdToUse);
    
    const handleClickOutside = (event) => {
      if (!event.target.closest(".kanban-task-action")) {
        setActiveDropdown(null); // Close dropdown when clicking outside
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [urlBoardId]);

  useEffect(() => {
    if (boardId && allTasks.length === 0 && !isTaskLoading) {
      setIsTaskLoading(true);
      getAllTasks(boardId);
    }
  }, [boardId]);

  // Check if we're viewing a specific task (separate screen)
  const taskParam = searchParams.get('task');
  const isTaskDetailView = !!taskParam;

  // Load task for detail view
  useEffect(() => {
    if (!isTaskDetailView) return;
    if (allTasks.length === 0 || columns.length === 0 || !boardId) return;
    
    // Find task in columns
    let foundTask = null;
    let taskColumnId = '';
    let taskColumnTitle = '';
    let taskColumnColor = 'primary';
    
    for (const col of columns) {
      const colTask = col.tasks?.find(t => {
        const taskData = allTasks.find(at => at._id === t.taskId);
        return taskData?.ticketNumber?.toUpperCase() === taskParam.toUpperCase() || t.taskId === taskParam;
      });
      if (colTask) {
        foundTask = allTasks.find(at => at._id === colTask.taskId);
        taskColumnId = col._id;
        taskColumnTitle = col.title;
        taskColumnColor = col.color || 'primary';
        break;
      }
    }
    
    if (!foundTask) return;
    
    const taskAssignedDevelopers = foundTask?.assignedDevelopers?.map(
      (dev) => ({
        ...dev,
        ...(employees.find((emp) => emp._id === dev._id) || {}),
      })
    ) || [];
    
    const projectData = {
      boardTitle: boardTitle,
      _id: boardId,
      project: null,
      assignedDevelopers: employees,
    };
    
    setSelectedTask({
      ...foundTask,
      ProjectData: projectData,
      boardId: boardId,
      columnId: taskColumnId,
      columnName: taskColumnTitle,
      assignedDevelopers: taskAssignedDevelopers,
      columnColor: taskColumnColor,
      allColumns: columns.map((col) => ({
        id: col._id,
        title: col.title,
        color: col.color || "primary",
      })),
    });
  }, [isTaskDetailView, taskParam, allTasks, columns, boardId, boardTitle, employees]);

  const openTaskWithUrl = useCallback((task, columnId, columnTitle, columnColor) => {
    const taskIdentifier = task.ticketNumber || task._id;
    navigate(`/task-board/${boardId}?task=${taskIdentifier}`);
  }, [boardId, navigate]);


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
            message.success("Column Updated Successfully");
            handleClose();
          }
        })
        .catch((err) => {
          setIsLoading(false);
          message.error(
            `${err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Error updating column"
            }!`
          );
          setLoader(false);
        })
        .finally(() => {
          setLoader(false);
        });
      // setColumns(prevTasks =>
      //   prevTasks.map(task =>
      //     task._id === info._id ? { ...task, title: values.title, color: values.color } : task
      //   ));
    } else {
      let updated_data = {
        _id: boardId,
        color: !values.color ? "primary" : values.color,
        title: values.title,
      };
      apiServices("PUT", "taskBoard/add-taskBoard", updated_data, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            //const sortedData = res?.data?.Task?.docs?.slice().sort((a, b) => a.title.localeCompare(b.title));
            //setAllTasks(sortedData);
            setColumns(res?.data?.taskBoard?.columns);
            setIsLoading(false);
            setLoader(false);
            message.success("Column Added Successfully");
            handleClose();
          }
        })
        .catch((err) => {
          setIsLoading(false);
          message.error(
            `${err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Error adding column"
            }!`
          );
          setLoader(false);
        })
        .finally(() => {
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
            getAllTasks(
              BoardData?._id
                ? BoardData?._id
                : BoardData?.board?.project
                  ? BoardData?.board?.project?._id
                  : BoardData?.board?._id
            );

            setIsLoading(false);
            setLoader(false);
            message.success("Task added successfully");
            closeAddTaskModal();
          }
        })
        .catch((err) => {
          setIsLoading(false);
          message.error(
            `${err?.response?.data?.msg
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
          getAllTasks(
            BoardData?._id
              ? BoardData?._id
              : BoardData?.board?.project
                ? BoardData?.board?.project?._id
                : BoardData?.board?._id
          );
          getTaskBoard(
            BoardData?._id
              ? BoardData?._id
              : BoardData?.board?.project
                ? BoardData?.board?.project?._id
                : BoardData?.board?._id
          );
          setLoader(false);
        }
      })
      .catch((err) => {
        setLoader(false);
        // console.log(err);
        message.error(
          `${err?.response?.data?.msg
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
                column.tasks = column?.tasks?.filter(
                  (task) => task.taskId !== id
                );
              }
              return column;
            })
          );

          // Update allTasks to set empty developers array for the removed task
          setAllTasks((prevTasks) =>
            prevTasks.map((task) => {
              if (task._id === id) {
                return {
                  ...task,
                  assignedDevelopers: [], // Clear the developers array
                };
              }
              return task;
            })
          );

          message.success("Task Removed Successfully");
          closeNewTask();
          setColumnId("");
          setLoader(false);
        }
      })
      .catch((err) => {
        setLoader(false);
        message.error(
          `${err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error removing task"
          }!`
        );
      });
  };

  const onFinishAdd = (values) => {
    // Find the column to get its title
    const currentColumn = columns.find(col => col._id === columnId);
    console.log("currentColumn", currentColumn)
    let updated_data = {
      ...values,
      ...(BoardData?.board?.project
        ? { projectId: BoardData?.board?.project?._id }
        : BoardData?._id
          ? { projectId: BoardData?._id }
          : { boardId: BoardData?.board?._id }),
      columnId: columnId,
      lane: currentColumn?.title,
    };
    setLoader(true);
    apiServices("POST", "tasks", updated_data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          closeNewTask();
          setOptTasks((prev) => [...prev, res?.data?.Task]);
          setAllTasks((prev) => [...prev, res?.data?.Task]);
          message.success(t("Tasks.addTaskSuccess"));
          setLoader(false);
        }
      })
      .catch((err) => {
        setLoader(false);
        message.error(
          `${err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("Tasks.addTaskError")
          }!`
        );
      });
  };
  // used in edit task ticket
  // const onFinishEdit = (values) => {
  //   const data = {
  //       ...values,
  //       ...(BoardData?.board?.project
  //         ? { projectId: BoardData?.board?.project?._id }
  //         : BoardData?._id
  //         ? { projectId: BoardData?._id}
  //         : { boardId: BoardData?.board?._id }),
  //       _id: addTask?.data?.taskId
  //   }

  //   setLoader(true)
  //   apiServices("PUT", 'tasks', data, user_state)
  //     .then((res) => {
  //         if (res?.data?.success === true) {
  //           closeNewTask();
  //           // Get the full developer objects from employees array using the assignedDevelopers IDs
  //           const updatedDevelopers = values.assignedDevelopers?.map(devId =>
  //             employees?.find(emp => emp._id === devId)
  //           ).filter(Boolean);

  //           const updatedOptTasks = allTasks?.map((task) => {
  //             if (task._id === addTask?.data?.taskId) {
  //                 return {
  //                     ...task,
  //                     title: values.title,
  //                     tags: values.tags,
  //                     description: values.description,
  //                     assignedDevelopers: updatedDevelopers // Use the full developer objects
  //                 };
  //             }
  //             return task;
  //           });

  //           setAllTasks(updatedOptTasks);
  //           // setAllTasks(prev => [...prev, res?.data?.Task])
  //           message.success(t('Tasks.updateTaskSuccess'))
  //           setLoader(false)
  //           }
  //         })
  //         .catch((err) => {
  //       setLoader(false)
  //       message.error(
  //         `${
  //           err?.response?.data?.msg
  //             ? err?.response?.data?.msg
  //             : err?.response?.data?.validation?.body?.message
  //             ? err?.response?.data?.validation?.body?.message
  //             : t('Tasks.updateTaskError')
  //         }!`
  //       );
  //     });
  // }

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

  const handleBoardMembersChange = () => {
    const selectedEmployees = selectedDevelopers
      ?.map((value) =>
        allEmployees?.find((employee) => employee._id === value._id)
      )
      .filter(Boolean); // Remove any undefined values

    // Ensure the data is properly structured
    const updated_data = {
      _id: boardId,
      assignedDevelopers: selectedDevelopers?.map((dev) => dev?._id),
    };

    setLoader(true);
    apiServices(
      "PUT",
      "taskBoard/add-taskBoard",
      JSON.parse(JSON.stringify(updated_data)),
      user_state
    )
      .then((res) => {
        if (res?.data?.success === true) {
          setEmployees(selectedEmployees);
          message.success("Board members updated successfully");
          closeAddTaskModal();
          getAllTasks(
            BoardData?._id
              ? BoardData?._id
              : BoardData?.board?.project
                ? BoardData?.board?.project?._id
                : BoardData?.board?._id
          );
          setLoader(false);
        }
      })
      .catch((err) => {
        setLoader(false);
        message.error(
          `${err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error updating board members"
          }!`
        );
      });
  };

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
          `${err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("aAttend.errors.getEmployeesError")
          }`
        );
      });
  };

  const handleRemoveDeveloper = (developerId) => {
    const updatedSelectedDevelopers = selectedDevelopers.filter(
      (obj) => obj?._id !== developerId
    );
    setSelectedDevelopers(updatedSelectedDevelopers);
  };

  const handleSelectDeveloper = (value) => {
    const selectedEmployee = allEmployees.find(
      (employee) => employee._id === value
    );
    setSelectedDevelopers([...selectedDevelopers, selectedEmployee]);
    form.resetFields(); // Clear the selection in the form
  };

  const getAllEmployeeOptions = () => {
    const selectedEmployeeIds = [...selectedDevelopers];
    return allEmployees
      .filter(
        (employee) =>
          !selectedEmployeeIds.some((selected) => selected._id === employee._id)
      )
      .map((employee) => (
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

  useEffect(() => {
    if (addTask.isAddOpen) {
      setDescValue(addTask.data?.description || '');
      setDueDateValue(addTask.data?.dueDate ? moment(addTask.data.dueDate) : null);
      setOriginalDueDate(addTask.data?.dueDate ? moment(addTask.data.dueDate) : null);
      if (allEmployees.length === 0) {
        apiServices("GET", `user/all-employees`, null, user_state)
          .then(res => {
            if (res?.data?.success) setAllEmployees(res.data.User || []);
          });
      }
    }
  }, [addTask.isAddOpen]);

  useEffect(() => {
    // Check if any filters are applied
    const hasFilters = 
      searchQuery.trim() ||
      (selectedAssigneeFilter && selectedAssigneeFilter.length > 0) ||
      (selectedTypeFilter && selectedTypeFilter.length > 0) ||
      (selectedPriorityFilter && selectedPriorityFilter.length > 0) ||
      (selectedReporterFilter && selectedReporterFilter.length > 0);

    // If no filters are applied, show all columns
    if (!hasFilters) {
      setFilteredColumns(columns);
      return;
    }

    const filtered = columns.map(column => {
      const filteredTasks = column.tasks.filter(task => {
        const taskDetails = allTasks.find(t => t._id === task.taskId);

        if (!taskDetails) {
          return false;
        }

        // Search filter - check if task title matches search query
        const searchLower = searchQuery.toLowerCase().trim();
        if (searchQuery.trim() && !taskDetails.title?.toLowerCase().includes(searchLower)) {
          return false;
        }

        // Type filter
        if (selectedTypeFilter && selectedTypeFilter.length > 0) {
          if (!taskDetails.type || !selectedTypeFilter.includes(taskDetails.type)) {
            return false;
          }
        }

        // Priority filter
        if (selectedPriorityFilter && selectedPriorityFilter.length > 0) {
          if (!taskDetails.priority || !selectedPriorityFilter.includes(taskDetails.priority)) {
            return false;
          }
        }

        // Reporter filter
        if (selectedReporterFilter && selectedReporterFilter.length > 0) {
          const reporterId = typeof taskDetails.reporter === 'string' 
            ? taskDetails.reporter 
            : (taskDetails.reporter?._id || taskDetails.createdBy);
          
          if (!reporterId || !selectedReporterFilter.includes(reporterId)) {
            return false;
          }
        }

        // Assignee filter
        if (selectedAssigneeFilter && selectedAssigneeFilter.length > 0) {
          let assigneeMatch = false;

          // Check if task's assignee is in the selected filters
          if (taskDetails.assignee && selectedAssigneeFilter.includes(taskDetails.assignee)) {
            assigneeMatch = true;
          }

          // Check if any of the task's assigned developers are in the selected filters
          if (!assigneeMatch && taskDetails.assignedDevelopers && taskDetails.assignedDevelopers.length > 0) {
            assigneeMatch = taskDetails.assignedDevelopers.some(dev => {
              const devId = typeof dev === 'string' ? dev : (dev?._id || dev?.userId || dev?.id);
              return selectedAssigneeFilter.includes(devId);
            });
          }

          if (!assigneeMatch) {
            return false;
          }
        }

        return true;
      });

      return {
        ...column,
        tasks: filteredTasks
      };
    });

    setFilteredColumns(filtered);
  }, [selectedAssigneeFilter, selectedTypeFilter, selectedPriorityFilter, selectedReporterFilter, columns, allTasks, searchQuery]);

  // If viewing a specific task, show task detail page instead of board
  if (isTaskDetailView) {
    // Show loader if task is not loaded OR if task has no title (data not fully populated)
    if (!selectedTask || !selectedTask.title || !selectedTask._id) {
      return (
        <div className="page-wrapper">
          <div className="content container-fluid" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Spin size="large" tip="Loading task..." />
          </div>
        </div>
      );
    }
    
    return (
      <>
        <div className="page-wrapper">
          <Helmet>
            <title>{selectedTask.ticketNumber || 'Task'} - DaftarPro</title>
            <meta name="description" content="Task Detail" />
          </Helmet>
          <div className="content container-fluid">
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <button 
                    onClick={() => navigate(`/task-board/${boardId}`)} 
                    className="btn btn-primary"
                    style={{ marginBottom: '20px' }}
                  >
                    <i className="fa fa-arrow-left" style={{ marginRight: '8px' }}></i>
                    Back to Board
                  </button>
                </div>
              </div>
            </div>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <TaskContent
                closeModal={() => navigate(`/task-board/${boardId}`)}
                taskDatas={selectedTask}
                getTaskBoard={() => getTaskBoard(boardId)}
                getAllTasks={getAllTasks}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

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
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="text"
                        className="form-control"
                        value={boardTitle}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onBlur={handleCancel}
                        autoFocus
                        style={{ width: "300px" }}
                        required
                        maxLength={50}
                      />
                      <a
                        className="btn btn-primary"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleSave}
                        style={{
                          marginLeft: "10px",
                          height: "42px",
                          textAlign: "center",
                        }}
                      >
                        Save
                      </a>
                      <a
                        className="btn"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={handleCancel}
                        style={{
                          marginLeft: "10px",
                          height: "42px",
                          textAlign: "center",
                          backgroundColor: "lightgrey",
                          color: "white"
                        }}

                      >
                        Cancel
                      </a>
                    </div>
                    {boardTitle?.trim() === "" && (
                      <p className="text-danger">
                        Board title cannot be empty.
                      </p>
                    )}
                  </React.Fragment>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <h3 className="page-title">
                      {boardTitle
                        ? boardTitle
                        : BoardData?.board?.boardTitle
                          ? BoardData?.board?.boardTitle
                          : BoardData?._id
                            ? BoardData?.projectName
                            : BoardData?.board?.project?.projectName}
                    </h3>
                    {(role === "admin" || permissions?.projectManagement) && (
                      <h3 style={{ marginLeft: "1%" }}>
                        <a onClick={handleEditClick}>
                          <i className="fa fa-pencil fa-xs ml-2" />
                        </a>
                      </h3>

                    )}
                  </div>
                )}
                {/* <h3 className="page-title">
                  {`${ProjectData?.projectName}`} - Task Board
                </h3> */}
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to={"/task-board"}>
                      <span className="arrow_routes"></span>
                      {t("Task Boards")}
                    </Link>
                  </li>
                  <li className="breadcrumb-item active">Board</li>
                </ul>
              </div>
              <div className="col-auto float-end ms-auto">
                <div className="d-flex gap-2 align-items-center">
                  {/* Search Input */}
                  <Input
                    placeholder="Search tasks..."
                    prefix={<i className="fa fa-search" style={{ color: '#999' }} />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    allowClear
                    style={{
                      width: '250px',
                      borderRadius: '8px',
                      height: '38px'
                    }}
                  />
                  
                  {/* Filter Button with Popover */}
                  <Popover
                    content={
                      <div style={{ width: '320px', padding: '12px' }}>
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: 500,
                            fontSize: '13px',
                            color: '#333'
                          }}>
                            Type
                          </label>
                          <Select
                            mode="multiple"
                            placeholder="Select types..."
                            value={selectedTypeFilter}
                            onChange={setSelectedTypeFilter}
                            allowClear
                            style={{ width: '100%' }}
                            maxTagCount="responsive"
                          >
                            <Select.Option value="Bug">Bug</Select.Option>
                            <Select.Option value="Feature">Feature</Select.Option>
                            <Select.Option value="Enhancement">Enhancement</Select.Option>
                            <Select.Option value="Refactor">Refactor</Select.Option>
                            <Select.Option value="Task">Task</Select.Option>
                          </Select>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: 500,
                            fontSize: '13px',
                            color: '#333'
                          }}>
                            Priority
                          </label>
                          <Select
                            mode="multiple"
                            placeholder="Select priorities..."
                            value={selectedPriorityFilter}
                            onChange={setSelectedPriorityFilter}
                            allowClear
                            style={{ width: '100%' }}
                            maxTagCount="responsive"
                          >
                            <Select.Option value="Highest">Highest</Select.Option>
                            <Select.Option value="High">High</Select.Option>
                            <Select.Option value="Medium">Medium</Select.Option>
                            <Select.Option value="Low">Low</Select.Option>
                            <Select.Option value="Lowest">Lowest</Select.Option>
                          </Select>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: 500,
                            fontSize: '13px',
                            color: '#333'
                          }}>
                            Assignee
                          </label>
                          <Select
                            mode="multiple"
                            placeholder="Select assignees..."
                            value={selectedAssigneeFilter}
                            onChange={setSelectedAssigneeFilter}
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            style={{ width: '100%' }}
                            maxTagCount="responsive"
                          >
                            {employees?.map((employee) => (
                              <Select.Option key={employee._id} value={employee._id}>
                                {employee.fullName}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: 500,
                            fontSize: '13px',
                            color: '#333'
                          }}>
                            Reporter
                          </label>
                          <Select
                            mode="multiple"
                            placeholder="Select reporters..."
                            value={selectedReporterFilter}
                            onChange={setSelectedReporterFilter}
                            allowClear
                            showSearch
                            filterOption={(input, option) =>
                              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            style={{ width: '100%' }}
                            maxTagCount="responsive"
                          >
                            {employees?.map((employee) => (
                              <Select.Option key={employee._id} value={employee._id}>
                                {employee.fullName}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>

                        {((selectedAssigneeFilter && selectedAssigneeFilter.length > 0) ||
                          (selectedTypeFilter && selectedTypeFilter.length > 0) ||
                          (selectedPriorityFilter && selectedPriorityFilter.length > 0) ||
                          (selectedReporterFilter && selectedReporterFilter.length > 0)) && (
                          <div style={{ 
                            borderTop: '1px solid #f0f0f0',
                            paddingTop: '12px',
                            marginTop: '12px'
                          }}>
                            <Button 
                              size="small"
                              onClick={() => {
                                setSelectedAssigneeFilter([]);
                                setSelectedTypeFilter([]);
                                setSelectedPriorityFilter([]);
                                setSelectedReporterFilter([]);
                              }}
                              style={{ width: '100%' }}
                            >
                              Clear All Filters
                            </Button>
                          </div>
                        )}
                      </div>
                    }
                    title={
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontWeight: 600 }}>Filters</span>
                        <CloseOutlined 
                          style={{ cursor: 'pointer', fontSize: '12px' }}
                          onClick={() => setFilterDropdownVisible(false)}
                        />
                      </div>
                    }
                    trigger="click"
                    open={filterDropdownVisible}
                    onOpenChange={setFilterDropdownVisible}
                    placement="bottomRight"
                    overlayStyle={{ maxWidth: '360px' }}
                  >
                    <Badge 
                      count={
                        (selectedAssigneeFilter?.length || 0) +
                        (selectedTypeFilter?.length || 0) +
                        (selectedPriorityFilter?.length || 0) +
                        (selectedReporterFilter?.length || 0)
                      }
                      offset={[-5, 5]}
                    >
                      <Button
                        style={{
                          height: '38px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <i className="fa fa-filter" /> Filter
                      </Button>
                    </Badge>
                  </Popover>

                  {/* Board/List View Toggle */}
                  <div style={{ 
                    display: 'flex', 
                    border: '1px solid #d9d9d9', 
                    borderRadius: '8px',
                    overflow: 'hidden'
                  }}>
                    <Button
                      style={{
                        borderRadius: 0,
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: viewMode === 'board' ? '#ff9b44' : '#fff',
                        color: viewMode === 'board' ? '#fff' : '#333',
                      }}
                      onClick={() => setViewMode('board')}
                    >
                      <i className="fa fa-th-large" /> Board
                    </Button>
                    <Button
                      style={{
                        borderRadius: 0,
                        border: 'none',
                        borderLeft: '1px solid #d9d9d9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: viewMode === 'list' ? '#ff9b44' : '#fff',
                        color: viewMode === 'list' ? '#fff' : '#333',
                      }}
                      onClick={() => setViewMode('list')}
                    >
                      <i className="fa fa-list" /> List
                    </Button>
                  </div>

                  <div className="project-members mr-3">
                    <ul
                      className="team-members"
                      style={{ minWidth: "max-content", marginBottom: 0 }}
                    >
                      {employees?.slice(0, 4).map((developer, index) => (
                        <li key={index}>
                          <Tooltip title={`${developer?.fullName} - Click to ${selectedAssigneeFilter.includes(developer._id) ? 'remove from' : 'add to'} filter`}>
                            <Avatar
                              size={24}
                              style={{
                                cursor: "pointer",
                                border: selectedAssigneeFilter.includes(developer._id) ? "2px solid #ff902f" : "none"
                              }}
                              src={developer?.imageUrl || user_icon}
                              onClick={() => {
                                if (selectedAssigneeFilter.includes(developer._id)) {
                                  setSelectedAssigneeFilter(selectedAssigneeFilter.filter(id => id !== developer._id));
                                } else {
                                  setSelectedAssigneeFilter([...selectedAssigneeFilter, developer._id]);
                                }
                              }}
                            />
                          </Tooltip>
                        </li>
                      ))}
                      {employees?.length > 4 && (
                        <li className="dropdown avatar-dropdown">
                          <Link
                            className="all-users dropdown-toggle projectTeamMember"
                            style={{
                              display: "inline-flex",
                              height: "24px",
                              width: "24px",
                              fontSize: "10px",
                            }}
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                          >
                            +{employees?.length - 4}
                          </Link>
                          <div className="dropdown-menu dropdown-menu-right" style={{
                            padding: "8px",
                            minWidth: "240px",
                            maxHeight: "400px",
                            overflowY: "auto",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            borderRadius: "8px"
                          }}>
                            <div style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px"
                            }}>
                              {employees?.slice(4).map((developer, index) => (
                                <div
                                  key={index}
                                  onClick={() => {
                                    if (selectedAssigneeFilter.includes(developer._id)) {
                                      setSelectedAssigneeFilter(selectedAssigneeFilter.filter(id => id !== developer._id));
                                    } else {
                                      setSelectedAssigneeFilter([...selectedAssigneeFilter, developer._id]);
                                    }
                                  }}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    cursor: "pointer",
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    transition: "background-color 0.2s",
                                    backgroundColor: selectedAssigneeFilter.includes(developer._id) ? "#fff3e0" : "transparent"
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!selectedAssigneeFilter.includes(developer._id)) {
                                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!selectedAssigneeFilter.includes(developer._id)) {
                                      e.currentTarget.style.backgroundColor = "transparent";
                                    }
                                  }}
                                >
                                  <Avatar
                                    size={36}
                                    src={developer?.imageUrl || user_icon}
                                    style={{
                                      cursor: "pointer",
                                      border: selectedAssigneeFilter.includes(developer._id) ? "2px solid #ff902f" : "2px solid #e0e0e0",
                                      flexShrink: 0
                                    }}
                                  />
                                  <span style={{
                                    fontSize: "14px",
                                    color: "#333",
                                    fontWeight: selectedAssigneeFilter.includes(developer._id) ? "500" : "400",
                                    flex: 1,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                  }}>
                                    {developer?.fullName}
                                  </span>
                                  {selectedAssigneeFilter.includes(developer._id) && (
                                    <i className="fa fa-check" style={{
                                      color: "#ff902f",
                                      fontSize: "14px",
                                      flexShrink: 0
                                    }} />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </li>
                      )}
                    </ul>
                  </div>
                  {(role === "admin" || permissions?.projectManagement) &&
                    !BoardData?._id &&
                    !BoardData?.board?.project && (
                      <a
                        className="btn add-btn mr-3"
                        onClick={() => {
                          fetchAllEmployees();
                          setOpenUser(true);
                          setColumnId("");
                        }}
                      >
                        <i className="fa fa-pencil ml-2" />
                        Edit Members
                      </a>
                    )}
                  {!(role === 'client' || role === 'focalperson') && <a
                    className="btn add-btn"
                    onClick={() => {
                      setOpen({ isAddOpen: true, isEditOpen: true, data: "" });
                    }}
                  >
                    <i className="fa fa-plus" /> Add Column
                  </a>}
                </div>
              </div>
            </div>
          </div>
          {/* /Page Header */}
          
          {/* List View */}
          {viewMode === 'list' && (
            <div className="card mb-0">
              {selectedRowKeys.length > 0 && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#fff7e6',
                  borderBottom: '1px solid #ffd591',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  <span style={{ fontWeight: 500, color: '#d46b08' }}>
                    {selectedRowKeys.length} task{selectedRowKeys.length > 1 ? 's' : ''} selected
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Select
                      placeholder="Change Status"
                      style={{ width: 150 }}
                      value={null}
                      onChange={async (newStatus) => {
                        const targetColumn = columns.find(col => col.title === newStatus);
                        if (targetColumn) {
                          setBulkActionLoading(true);
                          try {
                            const res = await apiServices(
                              "PUT",
                              "tasks/bulk-update-status",
                              {
                                taskIds: selectedRowKeys,
                                columnId: targetColumn._id,
                                boardId: boardId
                              },
                              user_state
                            );
                            if (res?.data?.success) {
                              message.success(res?.data?.msg || `${selectedRowKeys.length} task(s) moved to ${newStatus}`);
                              setSelectedRowKeys([]);
                              const boardIdToFetch = BoardData?._id
                                ? BoardData?._id
                                : BoardData?.board?.project
                                  ? BoardData?.board?.project?._id
                                  : BoardData?.board?._id;
                              getTaskBoard(boardIdToFetch);
                            } else {
                              message.error(res?.data?.msg || 'Failed to update tasks');
                            }
                          } catch (err) {
                            message.error('Failed to update tasks');
                          } finally {
                            setBulkActionLoading(false);
                          }
                        }
                      }}
                      loading={bulkActionLoading}
                      disabled={bulkActionLoading}
                    >
                      {columns.map(col => (
                        <Select.Option key={col._id} value={col.title}>
                          {col.title}
                        </Select.Option>
                      ))}
                    </Select>
                    {!(role === 'client' || role === 'focalperson') && (
                      <Button
                        danger
                        onClick={() => setBulkDeleteModal(true)}
                        loading={bulkActionLoading}
                        disabled={bulkActionLoading}
                      >
                        Delete Selected
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        const selectedTasks = filteredColumns?.flatMap(column =>
                          column.tasks
                            .filter(task => selectedRowKeys.includes(task.taskId))
                            .map(task => {
                              const taskDetails = allTasks.find(t => t._id === task.taskId);
                              return {
                                Title: taskDetails?.title || '',
                                Project: BoardData?.projectName || BoardData?.board?.project?.projectName || '-',
                                'Task Board': boardTitle || '-',
                                Tags: taskDetails?.tags?.join(', ') || '',
                                Status: column.title,
                              };
                            })
                        );
                        const headers = ['Title', 'Project', 'Task Board', 'Tags', 'Status'];
                        const csvContent = [
                          headers.join(','),
                          ...selectedTasks.map(task => 
                            headers.map(h => `"${(task[h] || '').replace(/"/g, '""')}"`).join(',')
                          )
                        ].join('\n');
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `tasks_export_${moment().format('YYYY-MM-DD')}.csv`;
                        link.click();
                        message.success(`${selectedRowKeys.length} task(s) exported`);
                      }}
                    >
                      Export Selected
                    </Button>
                    <Button
                      type="text"
                      onClick={() => setSelectedRowKeys([])}
                      style={{ color: '#666' }}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              )}
              <div className="card-body" style={{ padding: 0 }}>
                {isLoading ? (
                  <div className="text-center py-5">
                    <Spin size="large" tip="Loading..." />
                  </div>
                ) : (
                  <Table
                    rowSelection={{
                      selectedRowKeys,
                      onChange: (keys) => setSelectedRowKeys(keys),
                    }}
                    dataSource={filteredColumns?.flatMap(column => 
                      column.tasks.map(task => {
                        const taskDetails = allTasks.find(t => t._id === task.taskId);
                        return {
                          key: task.taskId,
                          taskId: task.taskId,
                          title: taskDetails?.title || task.title,
                          ticketNumber: taskDetails?.ticketNumber || '',
                          project: BoardData?.projectName || BoardData?.board?.project?.projectName || '-',
                          taskBoard: boardTitle || '-',
                          tags: taskDetails?.tags || [],
                          status: column.title,
                          statusColor: column.color || 'primary',
                          columnId: column._id,
                          taskDetails: taskDetails,
                        };
                      })
                    )}
                    columns={[
                      {
                        title: 'Title',
                        dataIndex: 'title',
                        key: 'title',
                        sorter: (a, b) => (a.title || '').localeCompare(b.title || ''),
                        sortDirections: ['ascend', 'descend', 'ascend'],
                        render: (text, record) => (
                          <div 
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              const taskDetails = record.taskDetails;
                              if (taskDetails) {
                                const taskAssignedDevelopers = taskDetails?.assignedDevelopers?.map(
                                  (dev) => ({
                                    ...dev,
                                    ...(employees.find((emp) => emp._id === dev._id) || {}),
                                  })
                                );
                                setSelectedTask({
                                  ...taskDetails,
                                  ProjectData: BoardData?._id
                                    ? {
                                        projectName: BoardData?.projectName,
                                        _id: BoardData?._id,
                                        assignedDevelopers: employees,
                                      }
                                    : BoardData?.board?.project
                                    ? {
                                        projectName: BoardData?.board?.project?.projectName,
                                        _id: BoardData?.board?.project?._id,
                                        assignedDevelopers: employees,
                                      }
                                    : {
                                        boardTitle: BoardData?.board?.boardTitle,
                                        _id: BoardData?.board?._id,
                                        project: null,
                                        assignedDevelopers: employees,
                                      },
                                  boardId: boardId,
                                  columnId: record.columnId,
                                  columnName: record.status,
                                  assignedDevelopers: taskAssignedDevelopers,
                                  columnColor: record.statusColor,
                                  allColumns: columns.map((col) => ({
                                    id: col._id,
                                    title: col.title,
                                    color: col.color || "primary",
                                  })),
                                });
                                setViewModal(true);
                              }
                            }}
                          >
                            {record.ticketNumber && (
                              <span style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#FF9B44',
                                display: 'block',
                                marginBottom: '2px'
                              }}>
                                {record.ticketNumber}
                              </span>
                            )}
                            <span style={{ fontWeight: 500 }}>{text}</span>
                          </div>
                        ),
                      },
                      {
                        title: 'Project',
                        dataIndex: 'project',
                        key: 'project',
                        sorter: (a, b) => (a.project || '').localeCompare(b.project || ''),
                        sortDirections: ['ascend', 'descend', 'ascend'],
                        render: (text) => (
                          <span style={{ 
                            maxWidth: '180px', 
                            display: 'inline-block', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap' 
                          }}>
                            {text}
                          </span>
                        ),
                      },
                      {
                        title: 'Task Boards',
                        dataIndex: 'taskBoard',
                        key: 'taskBoard',
                        sorter: (a, b) => (a.taskBoard || '').localeCompare(b.taskBoard || ''),
                        sortDirections: ['ascend', 'descend', 'ascend'],
                        render: (text) => text || '-',
                      },
                      {
                        title: 'Tags',
                        dataIndex: 'tags',
                        key: 'tags',
                        sorter: (a, b) => (a.tags?.join(',') || '').localeCompare(b.tags?.join(',') || ''),
                        sortDirections: ['ascend', 'descend', 'ascend'],
                        render: (tags) => (
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {tags?.length > 0 ? tags.map((tag, idx) => (
                              <Tag 
                                key={idx}
                                style={{ 
                                  borderRadius: '4px',
                                  margin: 0,
                                  backgroundColor: '#f5f5f5',
                                  border: '1px solid #d9d9d9',
                                  color: '#595959'
                                }}
                              >
                                {tag}
                              </Tag>
                            )) : '-'}
                          </div>
                        ),
                      },
                      {
                        title: 'Status',
                        dataIndex: 'status',
                        key: 'status',
                        width: 160,
                        sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
                        sortDirections: ['ascend', 'descend', 'ascend'],
                        render: (text, record) => {
                          const colorMap = {
                            primary: '#ff902f',
                            success: '#55ce63',
                            info: '#009efb',
                            warning: '#ffbc34',
                            danger: '#f62d51',
                            purple: '#9368e9',
                          };
                          const statusColor = colorMap[record.statusColor] || '#ff902f';
                          return (
                            <Select
                              value={text}
                              style={{ width: '100%' }}
                              bordered={false}
                              dropdownMatchSelectWidth={false}
                              onChange={(newStatus) => {
                                const targetColumn = columns.find(col => col.title === newStatus);
                                if (targetColumn && record.columnId !== targetColumn._id) {
                                  // Move task to new column
                                  const sourceColumn = columns.find(col => col._id === record.columnId);
                                  const taskIndex = sourceColumn.tasks.findIndex(t => t.taskId === record.taskId);
                                  
                                  if (taskIndex !== -1) {
                                    const [movedTask] = sourceColumn.tasks.splice(taskIndex, 1);
                                    targetColumn.tasks.push(movedTask);
                                    
                                    // Update columns state
                                    setColumns([...columns]);
                                    
                                    // Call API to update task status
                                    apiServices(
                                      "PUT",
                                      `task/update-task/${record.taskId}`,
                                      { columnId: targetColumn._id },
                                      user_state
                                    ).then(() => {
                                      message.success('Task status updated');
                                    }).catch(() => {
                                      message.error('Failed to update task status');
                                      // Revert on error
                                      fetchBoard();
                                    });
                                  }
                                }
                              }}
                            >
                              {columns.map(col => {
                                const colColor = colorMap[col.color] || '#ff902f';
                                return (
                                  <Select.Option key={col._id} value={col.title}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: colColor,
                                        display: 'inline-block'
                                      }} />
                                      {col.title}
                                    </div>
                                  </Select.Option>
                                );
                              })}
                            </Select>
                          );
                        },
                      },
                      {
                        title: 'Action',
                        key: 'action',
                        width: 80,
                        align: 'center',
                        render: (_, record) => (
                          <div className="dropdown">
                            <a
                              style={{ cursor: 'pointer', fontSize: '18px', color: '#999' }}
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              <i className="fa fa-ellipsis-v" />
                            </a>
                            <div className="dropdown-menu dropdown-menu-right">
                              <a
                                className="dropdown-item"
                                onClick={() => {
                                  const taskDetails = record.taskDetails;
                                  if (taskDetails) {
                                    const taskAssignedDevelopers = taskDetails?.assignedDevelopers?.map(
                                      (dev) => ({
                                        ...dev,
                                        ...(employees.find((emp) => emp._id === dev._id) || {}),
                                      })
                                    );
                                    setSelectedTask({
                                      ...taskDetails,
                                      ProjectData: BoardData?._id
                                        ? {
                                            projectName: BoardData?.projectName,
                                            _id: BoardData?._id,
                                            assignedDevelopers: employees,
                                          }
                                        : BoardData?.board?.project
                                        ? {
                                            projectName: BoardData?.board?.project?.projectName,
                                            _id: BoardData?.board?.project?._id,
                                            assignedDevelopers: employees,
                                          }
                                        : {
                                            boardTitle: BoardData?.board?.boardTitle,
                                            _id: BoardData?.board?._id,
                                            project: null,
                                            assignedDevelopers: employees,
                                          },
                                      boardId: boardId,
                                      columnId: record.columnId,
                                      columnName: record.status,
                                      assignedDevelopers: taskAssignedDevelopers,
                                      columnColor: record.statusColor,
                                      allColumns: columns.map((col) => ({
                                        id: col._id,
                                        title: col.title,
                                        color: col.color || "primary",
                                      })),
                                      isEditing: true,
                                    });
                                    setViewModal(true);
                                  }
                                }}
                              >
                                Edit
                              </a>
                              {!(role === 'client' || role === 'focalperson') && (
                                <a
                                  className="dropdown-item"
                                  onClick={() => {
                                    const taskDetails = record.taskDetails;
                                    setAddTask({
                                      isDelOpen: true,
                                      isAddOpen: false,
                                      data: { taskId: record.taskId },
                                      title: taskDetails?.title || record.title,
                                    });
                                    setColumnId(record.columnId);
                                  }}
                                >
                                  Remove
                                </a>
                              )}
                            </div>
                          </div>
                        ),
                      },
                    ]}
                    pagination={{
                      pageSize: 20,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} tasks`,
                    }}
                    scroll={{ x: 900 }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={EmptyTable}
                          imageStyle={{ height: 100 }}
                          description="No tasks found"
                        />
                      ),
                    }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Board View */}
          {viewMode === 'board' && (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
              droppableId="all-columns"
              direction="horizontal"
              type="column"
            >
              {(provided) => (
                <div
                  className="kanban-board card mb-0"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {isLoading ? (
                    <div className="col-md-12 text-center">
                      <Spin size="large" tip="Loading..." />
                    </div>
                  ) : filteredColumns?.length > 0 ? (
                    <div className="card-body">
                      <div className="kanban-cont">
                        {filteredColumns.map((column, index) => (
                          <Draggable
                            key={column._id}
                            draggableId={column._id}
                            index={index}
                            type="column"
                            isDragDisabled={disableDrag}
                          >
                            {(provided) => (
                              <div
                                className="kanban-list-container"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                              >
                                <div
                                  className={`kanban-list kanban-${column.color ? column.color : "primary"
                                    }`}
                                  style={{
                                    marginRight: "10px",
                                  }}
                                >
                                  <div
                                    className="kanban-header"
                                    {...provided.dragHandleProps}
                                  >
                                    <label className="status-title longText3">
                                      {column.title} <span style={{ marginLeft: '8px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: '500' }}>{column.tasks.length}</span>
                                    </label>
                                    {column.title !== "Backlog" && !(role === 'client' || role === 'focalperson') && (
                                      <div className="dropdown kanban-action">
                                        <a
                                          data-bs-toggle="dropdown"
                                          aria-expanded="true"
                                          style={{ cursor: "pointer" }}
                                        >
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
                                    )}
                                  </div>
                                  <Droppable
                                    droppableId={column._id}
                                    type="task"
                                  >
                                    {(provided) => (
                                      <div
                                        className="kanban-wrap"
                                        style={{
                                          height: "365px",
                                          overflowY: "auto",
                                          padding: 5,
                                        }}
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                      >
                                        {isTaskLoading ? (
                                          <div className="col-md-12 text-center">
                                            <Spin
                                              size="medium"
                                              tip="Loading..."
                                            />
                                          </div>
                                        ) : column?.tasks?.length > 0 ? (
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
                                                  <div
                                                    className="card panel"
                                                    style={{
                                                      marginBottom: "5px",
                                                    }}
                                                  >
                                                    <div
                                                      className="kanban-box"
                                                      onClick={() => {
                                                        const title =
                                                          getTaskTitle(
                                                            task.taskId
                                                          );
                                                        const tags =
                                                          getTaskTags(
                                                            task.taskId
                                                          );
                                                        const description =
                                                          getTaskDescription(
                                                            task.taskId
                                                          );
                                                        const status =
                                                          column.title;
                                                        const taskAssignedDevelopers =
                                                          getTaskAssignedDevelopers(
                                                            task.taskId
                                                          );

                                                        setSelectedTask({
                                                          _id: task.taskId,
                                                          title,
                                                          tags,
                                                          description,
                                                          ProjectData:
                                                            BoardData?._id
                                                              ? {
                                                                projectName:
                                                                  BoardData?.projectName,
                                                                _id: BoardData?._id,
                                                                assignedDevelopers:
                                                                  employees,
                                                              }
                                                              : BoardData?.board
                                                                ?.project
                                                                ? {
                                                                  projectName:
                                                                    BoardData
                                                                      ?.board
                                                                      ?.project
                                                                      ?.projectName,
                                                                  _id: BoardData
                                                                    ?.board
                                                                    ?.project
                                                                    ?._id,
                                                                  assignedDevelopers:
                                                                    employees,
                                                                }
                                                                : {
                                                                  boardTitle:
                                                                    BoardData
                                                                      ?.board
                                                                      ?.boardTitle,
                                                                  _id: BoardData
                                                                    ?.board
                                                                    ?._id,
                                                                  project: null,
                                                                  assignedDevelopers:
                                                                    employees,
                                                                },
                                                          status,
                                                          boardId: boardId,
                                                          columnId: column._id,
                                                          columnName:
                                                            column.title,
                                                          assignedDevelopers:
                                                            taskAssignedDevelopers,
                                                          columnColor:
                                                            column.color ||
                                                            "primary", // Add column color
                                                          allColumns:
                                                            columns.map(
                                                              (col) => ({
                                                                // Add all columns data
                                                                id: col._id,
                                                                title:
                                                                  col.title,
                                                                color:
                                                                  col.color ||
                                                                  "primary",
                                                              })
                                                            ),
                                                        });
                                                        setViewModal(true);
                                                      }}
                                                    >
                                                      <div className="task-board-header">
                                                        <span
                                                          className="status-title"
                                                          style={{
                                                            paddingRight:
                                                              "inherit",
                                                            display: "flex",
                                                            alignItems:
                                                              "center",
                                                            gap: "8px",
                                                            justifyContent:
                                                              "space-between",
                                                            width: "100%",
                                                          }}
                                                        >
                                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden', maxWidth: '100%' }}>
                                                            {getTaskTicketNumber(task.taskId) && (
                                                              <span style={{
                                                                fontSize: '11px',
                                                                fontWeight: 600,
                                                                color: '#FF9B44',
                                                                letterSpacing: '0.3px'
                                                              }}>
                                                                {getTaskTicketNumber(task.taskId)}
                                                              </span>
                                                            )}
                                                          <a
                                                            style={{
                                                                wordBreak: "break-word",
                                                              display: "block",
                                                              overflow: "hidden",
                                                              textOverflow: "ellipsis",
                                                              whiteSpace: "nowrap",
                                                              maxWidth: "100%"
                                                            }}
                                                            >
                                                              {getTaskTitle(task.taskId)}
                                                            </a>
                                                          </div>
                                                          <div
                                                            style={{
                                                              display: "flex",
                                                              alignItems:
                                                                "center",
                                                              gap: "4px",
                                                            }}
                                                          >
                                                            {/* <div
                                                              className="project-members"
                                                              style={{
                                                                margin:
                                                                  "4px auto",
                                                              }}
                                                            >
                                                              <ul
                                                                className="team-members"
                                                                style={{
                                                                  minWidth:
                                                                    "max-content",
                                                                }}
                                                              >
                                                                {getTaskAssignedDevelopers(
                                                                  task.taskId
                                                                )
                                                                  ?.slice(0, 2)
                                                                  .map(
                                                                    (
                                                                      developer,
                                                                      index
                                                                    ) => (
                                                                      <li
                                                                        key={
                                                                          index
                                                                        }
                                                                      >
                                                                        <Tooltip
                                                                          title={
                                                                            developer?.fullName
                                                                          }
                                                                        >
                                                                          <Avatar
                                                                            size={
                                                                              24
                                                                            }
                                                                            style={{
                                                                              cursor:
                                                                                "pointer",
                                                                            }}
                                                                            src={
                                                                              developer?.imageUrl ||
                                                                              user_icon
                                                                            }
                                                                          />
                                                                        </Tooltip>
                                                                      </li>
                                                                    )
                                                                  )}
                                                                {getTaskAssignedDevelopers(
                                                                  task.taskId
                                                                )?.length >
                                                                  2 && (
                                                                  <li className="dropdown avatar-dropdown">
                                                                    <Link
                                                                      className="all-users dropdown-toggle projectTeamMember"
                                                                      style={{
                                                                        display:
                                                                          "inline-flex",
                                                                        height:
                                                                          "24px",
                                                                        width:
                                                                          "24px",
                                                                        fontSize:
                                                                          "10px",
                                                                      }}
                                                                      onClick={(e) => e.stopPropagation()}
                                                                      data-bs-toggle="dropdown"
                                                                      aria-expanded="false"
                                                                    >
                                                                      +
                                                                      {getTaskAssignedDevelopers(
                                                                        task.taskId
                                                                      )
                                                                        ?.length -
                                                                        2}
                                                                    </Link>
                                                                    <div className="dropdown-menu dropdown-menu-right">
                                                                      <div className="avatar-group">
                                                                        {getTaskAssignedDevelopers(
                                                                          task.taskId
                                                                        )
                                                                          ?.slice(
                                                                            2
                                                                          )
                                                                          .map(
                                                                            (
                                                                              developer,
                                                                              index
                                                                            ) => (
                                                                              <a
                                                                                className="avatar avatar-xs projectTeamMember"
                                                                                key={
                                                                                  index
                                                                                }
                                                                              >
                                                                                <Tooltip
                                                                                  title={
                                                                                    developer?.fullName
                                                                                  }
                                                                                >
                                                                                  <Avatar
                                                                                    src={
                                                                                      developer?.imageUrl ||
                                                                                      user_icon
                                                                                    }
                                                                                    style={{
                                                                                      cursor:
                                                                                        "pointer",
                                                                                    }}
                                                                                  />
                                                                                </Tooltip>
                                                                              </a>
                                                                            )
                                                                          )}
                                                                      </div>
                                                                    </div>
                                                                  </li>
                                                                )}
                                                              </ul>
                                                            </div> */}
                                                            <div className="dropdown kanban-task-action" onClick={(e) => e.stopPropagation()}>
                                                              <a
                                                                data-bs-toggle="dropdown"
                                                                aria-expanded={activeDropdown === task.taskId} // Control open state
                                                                style={{
                                                                  cursor:
                                                                    "pointer",
                                                                  padding:
                                                                    "5px",
                                                                }}
                                                                onClick={(e) => handleDropdownToggle(task.taskId, e)}
                                                              >
                                                                <i className="fa fa-angle-down" />
                                                              </a>
                                                              <div className={`dropdown-menu dropdown-menu-right ${activeDropdown === task.taskId ? "show" : ""}`}>
                                                                {/* {(role === "admin" || permissions?.projectManagement) && ( */}
                                                                <a
                                                                  className="dropdown-item"
                                                                  onClick={() => {
                                                                    const title =
                                                                      getTaskTitle(
                                                                        task.taskId
                                                                      );
                                                                    const tags =
                                                                      getTaskTags(
                                                                        task.taskId
                                                                      );
                                                                    const description =
                                                                      getTaskDescription(
                                                                        task.taskId
                                                                      );
                                                                    const status =
                                                                      column.title;
                                                                    const taskAssignedDevelopers =
                                                                      getTaskAssignedDevelopers(
                                                                        task.taskId
                                                                      );

                                                                    setSelectedTask(
                                                                      {
                                                                        _id: task.taskId,
                                                                        title,
                                                                        tags,
                                                                        description,
                                                                        ProjectData:
                                                                          BoardData?._id
                                                                            ? {
                                                                              projectName:
                                                                                BoardData?.projectName,
                                                                              _id: BoardData?._id,
                                                                              assignedDevelopers:
                                                                                employees,
                                                                            }
                                                                            : BoardData
                                                                              ?.board
                                                                              ?.project
                                                                              ? {
                                                                                projectName:
                                                                                  BoardData
                                                                                    ?.board
                                                                                    ?.project
                                                                                    ?.projectName,
                                                                                _id: BoardData
                                                                                  ?.board
                                                                                  ?.project
                                                                                  ?._id,
                                                                                assignedDevelopers:
                                                                                  employees,
                                                                              }
                                                                              : {
                                                                                boardTitle:
                                                                                  BoardData
                                                                                    ?.board
                                                                                    ?.boardTitle,
                                                                                _id: BoardData
                                                                                  ?.board
                                                                                  ?._id,
                                                                                project:
                                                                                  null,
                                                                                assignedDevelopers:
                                                                                  employees,
                                                                              },
                                                                        status,
                                                                        boardId:
                                                                          boardId,
                                                                        columnId:
                                                                          column._id,
                                                                        columnName:
                                                                          column.title,
                                                                        assignedDevelopers:
                                                                          taskAssignedDevelopers,
                                                                        columnColor:
                                                                          column.color ||
                                                                          "primary",
                                                                        allColumns:
                                                                          columns.map(
                                                                            (
                                                                              col
                                                                            ) => ({
                                                                              id: col._id,
                                                                              title:
                                                                                col.title,
                                                                              color:
                                                                                col.color ||
                                                                                "primary",
                                                                            })
                                                                          ),
                                                                        isEditing: true,
                                                                      }
                                                                    );
                                                                    setViewModal(
                                                                      true
                                                                    );
                                                                  }}
                                                                >
                                                                  Edit
                                                                </a>
                                                                {/* )} */}
                                                                {!(role === 'client' || role === 'focalperson') && (
                                                                  <a
                                                                    className="dropdown-item"
                                                                    onClick={() => {
                                                                      const title =
                                                                        getTaskTitle(
                                                                          task.taskId
                                                                        );
                                                                      setAddTask({
                                                                        isDelOpen: true,
                                                                        isAddOpen: false,
                                                                        data: task,
                                                                        title:
                                                                          title,
                                                                      });
                                                                      setColumnId(
                                                                        column._id
                                                                      );
                                                                    }}
                                                                  >
                                                                    Remove
                                                                  </a>)}
                                                              </div>
                                                            </div>

                                                          </div>
                                                        </span>
                                                      </div>
                                                      <div className="task-board-body">
                                                        <div className="kanban-footer" style={{ position: "relative" }}>
                                                          <span
                                                            className="task-info-cont"
                                                            style={{
                                                              maxHeight: "4em",
                                                              overflow:
                                                                "hidden",
                                                            }}
                                                          >
                                                            <div
                                                              className="task-tags"
                                                              style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "4px",
                                                                flexWrap: "nowrap"
                                                              }}
                                                            >
                                                              {getTaskTags(
                                                                task.taskId
                                                              )?.slice(0, 1).map((tag) => (
                                                                <Tag
                                                                  key={tag}
                                                                  color={
                                                                    colorMapping[
                                                                    column
                                                                      .color
                                                                    ]
                                                                  }
                                                                  style={{
                                                                    marginBottom: 0,
                                                                    maxWidth: "100px",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap",
                                                                    display: "inline-block"
                                                                  }}
                                                                >
                                                                  {tag}
                                                                </Tag>
                                                              ))}
                                                              {getTaskTags(task.taskId)?.length > 1 && (
                                                                <Tag
                                                                  color="default"
                                                                  style={{
                                                                    marginBottom: 0,
                                                                    fontSize: "11px",
                                                                    padding: "0 4px",
                                                                    height: "22px",
                                                                    lineHeight: "20px"
                                                                  }}
                                                                >
                                                                  +{getTaskTags(task.taskId).length - 1}
                                                                </Tag>
                                                              )}
                                                            </div>
                                                          </span>
                                                          {getTaskPriority(task.taskId) && (
                                                            <div
                                                              style={{
                                                                position: "absolute",
                                                                bottom: "2px",
                                                                right: "44px",
                                                                fontSize: "10px",
                                                                fontWeight: "500",
                                                                padding: "2px 6px",
                                                                borderRadius: "4px",
                                                                backgroundColor:
                                                                  getTaskPriority(task.taskId) === "Highest" ? "#ff4d4f" :
                                                                    getTaskPriority(task.taskId) === "High" ? "#ff7a45" :
                                                                      getTaskPriority(task.taskId) === "Medium" ? "#faad14" :
                                                                        getTaskPriority(task.taskId) === "Low" ? "#52c41a" :
                                                                          getTaskPriority(task.taskId) === "Lowest" ? "#1890ff" : "#d9d9d9",
                                                                color: "#fff",
                                                                textTransform: "uppercase",
                                                                letterSpacing: "0.5px"
                                                              }}
                                                            >
                                                              {getTaskPriority(task.taskId)}
                                                            </div>
                                                          )}
                                                          {/* Assignee Avatar */}
                                                          {(() => {
                                                            const assignee = getTaskAssignee(task.taskId);
                                                            if (!assignee) return null;

                                                            return (
                                                              <Tooltip title={assignee?.fullName || 'Assignee'}>
                                                                <div
                                                                  style={{
                                                                    position: "absolute",
                                                                    bottom: "0px",
                                                                    right: "8px",
                                                                    width: "28px",
                                                                    height: "28px",
                                                                    borderRadius: "50%",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    fontSize: "11px",
                                                                    fontWeight: "600",
                                                                    cursor: "pointer",
                                                                    border: "2px solid white",
                                                                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                                                    backgroundColor: assignee?.imageUrl ? "transparent" : "#4285f4",
                                                                    color: "white",
                                                                    backgroundImage: assignee?.imageUrl ? `url(${assignee.imageUrl})` : "none",
                                                                    backgroundSize: "cover",
                                                                    backgroundPosition: "center"
                                                                  }}
                                                                  onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    // Toggle filter for this assignee
                                                                    if (selectedAssigneeFilter.includes(assignee._id)) {
                                                                      setSelectedAssigneeFilter(selectedAssigneeFilter.filter(id => id !== assignee._id));
                                                                    } else {
                                                                      setSelectedAssigneeFilter([...selectedAssigneeFilter, assignee._id]);
                                                                    }
                                                                  }}
                                                                >
                                                                  {!assignee?.imageUrl && getInitials(assignee?.fullName)}
                                                                </div>
                                                              </Tooltip>
                                                            );
                                                          })()}
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
                                        )}
                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>
                                  <div
                                    className="add-new-task"
                                    style={{
                                      padding: "5px",
                                      borderTop: "1px solid #ddd",
                                    }}
                                  >
                                    <a
                                      style={{ cursor: "pointer" }}
                                      onClick={() => {
                                        setSelectedTeamMembers([]);
                                        form2.resetFields();
                                        setAddTask({ isAddOpen: true, data: "" });
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
          )}
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
                  <Form.Item
                    name="title"
                    className="custom-border"
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        message: "Please enter a title name",
                      },
                    ]}
                  >
                    <Input className="form-control" autoFocus maxLength={30} />
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
                              (open?.data?.color &&
                                color.value === open?.data?.color) ||
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
                      __html: `${t("holiday.confirmRemove", {
                        holiday: addTask?.title,
                      })}<br/> Upon removing, the task will be deleted.`,
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
                        "Remove"
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
        open={bulkDeleteModal}
        onClose={() => setBulkDeleteModal(false)}
        aria-labelledby="bulk-delete-modal"
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" },
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
                <h3 style={{ marginBottom: "30px" }}>Delete Selected Tasks</h3>
                <p>
                  Are you sure you want to delete {selectedRowKeys.length} selected task{selectedRowKeys.length > 1 ? 's' : ''}? This action cannot be undone.
                </p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <Button
                      className="btn btn-primary continue-btn"
                      onClick={async () => {
                        setBulkActionLoading(true);
                        try {
                          const res = await apiServices(
                            "DELETE",
                            "tasks/bulk-delete",
                            {
                              taskIds: selectedRowKeys,
                              boardId: boardId
                            },
                            user_state
                          );
                          if (res?.data?.success) {
                            message.success(res?.data?.msg || `${selectedRowKeys.length} task(s) deleted`);
                            setSelectedRowKeys([]);
                            setBulkDeleteModal(false);
                            const boardIdToFetch = BoardData?._id
                              ? BoardData?._id
                              : BoardData?.board?.project
                                ? BoardData?.board?.project?._id
                                : BoardData?.board?._id;
                            getTaskBoard(boardIdToFetch);
                          } else {
                            message.error(res?.data?.msg || 'Failed to delete tasks');
                          }
                        } catch (err) {
                          message.error('Failed to delete tasks');
                        } finally {
                          setBulkActionLoading(false);
                        }
                      }}
                      disabled={bulkActionLoading}
                      style={{ width: "100%" }}
                    >
                      {bulkActionLoading ? (
                        <Spin size="small" indicator={antIcon} />
                      ) : (
                        "Delete"
                      )}
                    </Button>
                  </div>
                  <div className="col-6">
                    <Button
                      onClick={() => setBulkDeleteModal(false)}
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

      <Modal
        open={taskModal}
        onClose={closeAddTaskModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" },
        }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{"Add Task"}</h5>
              <button type="button" className="close" onClick={closeAddTaskModal}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
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
                        dropdownRender={(menu) => (
                          <>
                            {menu}
                            <Divider style={{ margin: "5px 0" }} />
                            <Button
                              type="button"
                              icon={
                                <PlusOutlined
                                  style={{
                                    fontSize: "20px",
                                    marginRight: "5px",
                                  }}
                                />
                              }
                              className="addButtonStyles"
                              style={{
                                width: "100%",
                                height: "40px",
                                background: "#efefef",
                                borderColor: "#efefef",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setSelectedTeamMembers([]); // Clear selected team members
                                form2.resetFields(); // Reset form fields
                                setAddTask({ isAddOpen: true, data: "" });
                              }}
                            >
                              Add New Task
                            </Button>
                          </>
                        )}
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
                      <label>{t("projectScreen.Modal.addTeam")} </label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="assignedDevelopers"
                          className="addTeamHeight"
                        >
                          <Select
                            showSearch
                            onSearch={(val) => {
                              // showTeamSearch(val, "Team");
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
                                <Tooltip title={teamMember?.fullName}>
                                  <Avatar
                                    style={{ cursor: "pointer" }}
                                    src={teamMember?.imageUrl || user_icon}
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
                                        <Tooltip title={teamMember?.fullName}>
                                          <Avatar
                                            src={
                                              teamMember?.imageUrl || user_icon
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
            {/* ) : ( */}
            {/* <div className="modal-body">
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
            </div> */}
            {/* )} */}
          </div>
        </div>
      </Modal>

      <Modal
        open={openUser}
        onClose={closeAddTaskModal}
        aria-labelledby="modal-modal-title"
        className="modalScroll"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
        }}
        sx={{ overflowY: "auto" }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Board Members</h5>

              <button type="button" className="close" onClick={closeAddTaskModal}>
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="modal-body">
              <Form
                form={form}
                name="board-members-form"
                onFinish={handleBoardMembersChange}
                // initialValues={{
                //   assignedDevelopers: employees?.map(emp => emp._id)
                // }}
                autoComplete="off"
              >
                <div className="row">
                  <div className="form-group">
                    <label>Add Team</label>
                    <Form.Item
                      name="assignedDevelopers"
                      className="custom-border"
                    >
                      <Select
                        showSearch
                        onSearch={(val) => {
                          // showTeamSearch(val, "Team");
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
                        // mode="multiple"
                        placeholder="Select Team Members"
                        onSelect={handleSelectDeveloper}
                        className="custom-select custom-normal"
                      >
                        {getAllEmployeeOptions()}
                      </Select>
                    </Form.Item>
                  </div>
                </div>

                <ul className="chat-user-list">
                  {selectedDevelopers?.map((developerId) => (
                    <li>
                      <div
                        className="employee-selection"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <img
                            alt=""
                            className="avatar"
                            src={developerId?.imageUrl || user_icon}
                          />
                          <span className="employee-name">
                            {developerId?.fullName}
                          </span>
                        </div>

                        <MinusCircleFilled
                          style={{ color: "red", cursor: "pointer" }}
                          onClick={() =>
                            handleRemoveDeveloper(developerId?._id)
                          }
                        />
                      </div>
                      <hr
                        className="developer-divider"
                        style={{ opacity: "0.1" }}
                      />
                    </li>
                  ))}
                </ul>

                <div className="submit-section">
                  <Form.Item>
                    <Button
                      type="primary"
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
              <h5 className="modal-title">
                {t("holiday.add")} {t("Timesheetemployee.task")}
              </h5>
              <button type="button" className="close" onClick={closeNewTask}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                form={form2}
                onFinish={(values) => {
                  onFinishAdd({ ...values, description: descValue, dueDate: dueDateValue });
                }}
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
                <div className="row">
                  <div className="col-12">
                    <div className="form-group">
                      <label>
                        {t("Tasks.title")} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="title"
                        className="custom-border"
                        rules={[{
                          whitespace: true,
                          required: true,
                          validator: (_, value) => {
                            if (!value || value.trim() === "") {
                              return Promise.reject(t("Tasks.pleaseentertitle"));
                            } else if (/\s{2,}/.test(value)) {
                              return Promise.reject(t("allEmp.errors.removeConsecutiveSpaces2"));
                            } else if (value.length < 3) {
                              return Promise.reject(t("Tasks.titleLength"));
                            }
                            return Promise.resolve();
                          },
                        }]}
                      >
                        <Input className="form-control" maxLength={50} />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <label>
                        {t("Tasks.tags")} <span className="text-danger">*</span>
                        <Tooltip className="custom-tooltip" placement="rightBottom" title={<label>{t("Tasks.taginstruction")}</label>}>
                          <span style={{ border: '1px solid grey', color: 'grey', fontSize: '12px', borderRadius: '50%', padding: '1.5px 4px 1px', margin: '5px', cursor: 'pointer' }}>
                            {t("Tasks.Qmark")}
                          </span>
                        </Tooltip>
                      </label>
                      <div style={{ position: "relative" }} className="hideDropdownMenu" id="area22">
                        <Form.Item
                          name="tags"
                          className="addTeamHeight"
                          rules={[{ required: true, message: t("Tasks.pleaseentertags") }]}
                        >
                          <Select
                            mode="tags"
                            className="custom-select customselect-height"
                            getPopupContainer={() => document.getElementById("area22")}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>{t('finance.Invoices.description')} <span className="text-danger">*</span></div>
                      </label>
                      <Form.Item
                        name="description"
                        rules={[{
                          required: true,
                          validator: (_, value) => {
                            const plain = descValue.replace(/<(.|\n)*?>/g, '');
                            if (!plain || plain.trim() === '') {
                              return Promise.reject(t('Tasks.pleaseenterdescription'));
                            }
                            if (/\s{2,}/.test(plain)) {
                              return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                            }
                            if (plain.length <= 4) {
                              return Promise.reject(t('Tasks.descriptionLength'));
                            }
                            return Promise.resolve();
                          },
                        }]}
                        className="custom-border"
                      >
                        <ReactQuill value={descValue} onChange={setDescValue} theme="snow" style={{ minHeight: 100 }} />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <label>
                        Assignee :
                      </label>
                      <div style={{ position: "relative" }} id="assigneeAreaTaskboard">
                        <Form.Item
                          name='assignee'
                          className='custom-border'
                        >
                          <Select
                            showSearch
                            placeholder="Select assignee"
                            allowClear
                            optionFilterProp="children"
                            filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("assigneeAreaTaskboard")
                            }
                          >
                            <Select.Option value="">Unassigned</Select.Option>
                            {allEmployees.map(user => (
                              <Select.Option key={user._id} value={user._id}>{user.fullName}</Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <label>
                        Priority :
                      </label>
                      <div style={{ position: "relative" }} id="priorityAreaTaskboard">
                        <Form.Item
                          name='priority'
                          className='custom-border'
                        >
                          <Select
                            placeholder="Select priority"
                            allowClear
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("priorityAreaTaskboard")
                            }
                          >
                            <Select.Option value="Highest">Highest</Select.Option>
                            <Select.Option value="High">High</Select.Option>
                            <Select.Option value="Medium">Medium</Select.Option>
                            <Select.Option value="Low">Low</Select.Option>
                            <Select.Option value="Lowest">Lowest</Select.Option>
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <label>
                        Due date :
                      </label>
                      <div style={{ position: "relative" }} id="dueDateAreaTaskboard">
                        <Form.Item
                          name='dueDate'
                          className='custom-border'
                        >
                          <DatePicker
                            allowClear
                            placeholder="Select due date"
                            className="custom-select custom-normal"
                            style={{ width: '100%' }}
                            getPopupContainer={() =>
                              document.getElementById("dueDateAreaTaskboard")
                            }
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>

                </div>
                <div className="submit-section">
                  <button type="submit" className="btn btn-primary submit-btn" disabled={loader}>
                    {loader ? (
                      <Spin size="small" indicator={antIcon} />
                    ) : (
                      t("submit")
                    )}
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
          getTaskBoard={getTaskBoard}
        />
      )}
    </>
  );
};

export default TaskBoard;
