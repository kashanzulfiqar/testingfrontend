import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import Modal from "@mui/material/Modal";
import {
  Form,
  Select,
  Table,
  Empty,
  message,
  TimePicker,
  Button,
  Input,
  Spin,
  Pagination,
} from "antd";
import { apiServices } from "../../../Services/apiServices";
import PencilIcon from "../../../files/Icons/pencilIcon.png";
import { itemRender } from "../../paginationfunction";
import { useTranslation } from "react-i18next";

function WeekViewTimeSheet({
  tableStartDate,
  setTableStartDate,
  selectedDate,
  setSelectedDate,
  open,
  setOpen,
  allProjects,
  getAllProjects,
  allTaskboards,
  getAllTaskBoards,
  currentWeekDates,
  setShowCalendar,
}) {
  const { t, i18n } = useTranslation();
  const moment = require("moment");

  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [formduration] = Form.useForm();
  const nav = useNavigate();
  const location = useLocation();

  const permissions = useSelector((state) => state?.permissionsSlice?.data);

  const user_state = useSelector((state) => state?.user?.loginvalue);

  const [allData, setAllData] = useState([]);
  const [workingData, setWorkingData] = useState([]); //local state changes
  const [pendingChanges, setPendingChanges] = useState({}); //changes to push into data store
  const [allTasks, setAllTasks] = useState([]);
  const [loader, setLoader] = useState(false);
  const [taskLoader, setTaskLoader] = useState(false);
  const [tableLoader, setTableLoader] = useState(true);
  const [saveButton, setSaveButton] = useState(true);
  const [descLength, setDescLength] = useState(0);
  const [cardReason, setCardReason] = useState("");
  const [oldDurationValue, setOldDurationValue] = useState("");
  const [updatedDuration, setUpdatedDuration] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isProjectAssociated, setIsProjectAssociated] = useState(false);
  const [paginationDetail, setPaginationDetail] = useState();
  const [showCard, setShowCard] = useState({
    isShown: false,
    data: "",
  });
  const [delOpen, setDelOpen] = useState({
    isDelOpen: false,
    data: "",
  });
  const [openTimePickers, setOpenTimePickers] = useState({});
  // Build a stable key for a row (project or board + task + date)
  const rowKey = (e) =>
    `${moment(e.date).format('YYYY-MM-DD')}::${e.projectId?._id || e.projectId || ''}::${e.boardId?._id || e.boardId || ''}::${e.taskId?._id || e.taskId || ''}`;

  // Upsert into workingData by key
  const upsertWorking = (arr, patch) => {
    const k = rowKey(patch);
    const i = arr.findIndex(x => rowKey(x) === k);
    if (i === -1) return [...arr, patch];
    const merged = { ...arr[i], ...patch };

    // preserve server-only flags unless explicitly overridden
    if (arr[i]?.submittedForApproval && merged.submittedForApproval === undefined) {
      merged.submittedForApproval = arr[i].submittedForApproval;
    }
    if (arr[i]?.status && merged.status === undefined) {
      merged.status = arr[i].status;
    }
    const next = [...arr];
    next[i] = merged;
    return next;
  };

    // Convert id or object to id string
    // Handles: null, undefined, string IDs, and objects with _id property
    const idOf = (x) => {
      if (!x) return '';
      if (typeof x === 'string') return x;
      if (x._id) return x._id;
      return '';
    };

    // Find a project name by id or object
    const nameOfProject = (x) => {
      if (x?.projectName) return x.projectName;
      const id = idOf(x);
      return allProjects.find(p => p._id === id)?.projectName || '';
    };

    // Find a board title by id or object
    const titleOfBoard = (x) => {
      if (x?.boardTitle) return x.boardTitle;
      const id = idOf(x);
      return allTaskboards.find(b => b._id === id)?.boardTitle || '';
    };

    // Find a task title by id or object
    const titleOfTask = (x) => {
      if (x?.title) return x.title;
      const id = idOf(x);
      return allTasks.find(t => t._id === id)?.title || '';
    };



  useEffect(() => {
    getData();
    setCurrentPage(1);
    // setPageSize(20);
    formduration.resetFields();
    setShowCard({ isShown: false, data: "" });
    setCardReason("");
    setDescLength(0);
    setOldDurationValue("");
  }, [currentWeekDates]);

  useEffect(() => {
    if (showCard?.isShown && showCard?.data) {
      const dateStr = moment(showCard.data.date).format('YYYY-MM-DD');
      const projectId = idOf(showCard.data.projectId);
      const boardId = idOf(showCard.data.boardId);
      const taskId = idOf(showCard.data.taskId);
      
      const draftEntry = workingData.find(
        (e) =>
          moment(e.date).format('YYYY-MM-DD') === dateStr &&
          idOf(e.projectId) === projectId &&
          idOf(e.boardId) === boardId &&
          idOf(e.taskId) === taskId
      );
      
      const notes = draftEntry?.notes ?? showCard.data.notes ?? "";
      const hours = draftEntry?.hoursWorked ?? showCard.data.hoursWorked ?? "";
      
      setCardReason(notes);
      setUpdatedDuration(hours);
      setDescLength(notes.length || 0);
      setOldDurationValue(hours);
    } else if (!showCard?.isShown) {
      setCardReason("");
      setUpdatedDuration("");
      setDescLength(0);
      setOldDurationValue("");
    }
  }, [
    showCard?.isShown ? `${moment(showCard?.data?.date).format('YYYY-MM-DD')}_${idOf(showCard?.data?.projectId)}_${idOf(showCard?.data?.boardId)}_${idOf(showCard?.data?.taskId)}` : null,
  ]);


  const getData = async (current_page, page_size) => {
  const from_data = currentWeekDates[0];
  const to_data = currentWeekDates[currentWeekDates.length - 1];

  // Calculate the current week's start date for filtering
  const currentWeekStart = new Date(tableStartDate);
  currentWeekStart.setDate(currentWeekStart.getDate() - ((currentWeekStart.getDay() + 6) % 7));
  const currentWeekStartStr = moment(currentWeekStart).format('YYYY-MM-DD');

  setTableLoader(true);
  
  const currentDrafts = workingData.filter(item => {
    // Include boardId in key to properly identify taskboard entries
    const key = `${moment(item.date).format('YYYY-MM-DD')}_${idOf(item.projectId)}_${idOf(item.boardId)}_${idOf(item.taskId)}`;
    const hasPendingChanges = pendingChanges[key] || item.isDirty;
    
    // Only keep drafts that belong to this week (check by date or weekStart)
    const itemDate = item.date ? moment(item.date).format('YYYY-MM-DD') : null;
    const belongsToCurrentWeek = 
      (itemDate && currentWeekDates.includes(itemDate)) ||
      (item.weekStart === currentWeekStartStr);
    
    return hasPendingChanges && belongsToCurrentWeek;
  });

  try {
    const res = await apiServices(
      "GET",
      `timesheet?page=${
        current_page ? current_page : currentPage ? currentPage : 1
      }&limit=${page_size ? page_size : pageSize ? pageSize : 99999}${
        from_data ? `&timesheetFrom=${from_data}` : ""
      }${to_data ? `&timesheetTo=${to_data}` : ""}&employeeOnly=true`,
      null,
      user_state
    );

    if (res?.data?.success === true) {
      const fetched = res?.data?.Timesheet?.docs || [];

      // ✅ Keep API version in allData for reference
      setAllData(fetched);

      
      setWorkingData(() => {
        const merged = [...fetched];
        
        currentDrafts.forEach(draft => {
          const key = rowKey(draft);
          const existingIndex = merged.findIndex(e => rowKey(e) === key);
          if (existingIndex >= 0) {
            merged[existingIndex] = { ...merged[existingIndex], ...draft };
          } else {
            merged.push(draft);
          }
        });

        return merged;
      });

      setPaginationDetail(res?.data?.Timesheet);
    }
  } catch (err) {
    console.error(err);
    message.error(
      `${
        err?.response?.data?.msg
          ? err?.response?.data?.msg
          : err?.response?.data?.validation?.body?.message
          ? err?.response?.data?.validation?.body?.message
          : t("Timesheetemployee.viewTimesheetError")
      }!`
    );
  } finally {
    setTableLoader(false);
  }
};


  const getAllTasks = (id) => {
    setTaskLoader(true);
    apiServices(
      "GET",
      `tasks?id=${id}&page=${1}&limit=${99999}`,
      null,
      user_state
    )
      .then((res) => {
        if (res?.data?.success === true) {
          const sortedData = res?.data?.Task?.docs
            ?.slice()
            .sort((a, b) => a.title.localeCompare(b.title));
          setAllTasks(sortedData);
          setTaskLoader(false);
        }
      })
      .catch((err) => {
        setTaskLoader(false);
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

  const searchHandler = (val, type) => {
    let dropdownValues = [];
    if (type === "project") {
          // Combined project and taskboard search handling
          const combinedValues = [
            ...allProjects.map(proj => proj.projectName?.toLowerCase()),
            ...allTaskboards.map(taskboard => taskboard.boardTitle?.toLowerCase())
        ];
        dropdownValues = combinedValues;
    } else if (type === "task") {
      allTasks.forEach((proj) => {
        dropdownValues.push(proj.title?.toLowerCase());
      });
    }

    if (val !== "") {
      dropdownValues.some((team) => {
        if (team.includes(val?.toLowerCase())) {
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

  const onFinishAdd = (values) => {
    // Determine whether user selected a project or a taskboard
    const isProject = allProjects?.some(proj => proj?._id === values?.selectedId);

    // Calculate the current week's start date (Monday)
    const currentWeekStart = new Date(tableStartDate);
    currentWeekStart.setDate(currentWeekStart.getDate() - ((currentWeekStart.getDay() + 6) % 7));
    const weekStartStr = moment(currentWeekStart).format('YYYY-MM-DD');

    // Build the base row for our data arrays
    const d = {
      projectId: isProject
        ? {
            _id: values?.selectedId,
            projectName: allProjects.find(p => p._id === values?.selectedId)?.projectName,
          }
        : null,
      boardId: !isProject
        ? {
            _id: values?.selectedId,
            boardTitle: allTaskboards.find(b => b._id === values?.selectedId)?.boardTitle,
          }
        : null,
      taskId: {
        _id: values?.taskId,
        title: allTasks.find(task => task._id === values?.taskId)?.title,
      },
      // Associate this row with the current week
      weekStart: weekStartStr,
    };

    // Always add to allData for server persistence
    setAllData(prev => [d, ...prev]);

    // Insert an empty row into workingData if it doesn't exist
    setWorkingData(prev => {
      const exists = prev.some(
        item =>
          idOf(item.projectId) === idOf(d.projectId) &&
          idOf(item.boardId) === idOf(d.boardId) &&
          idOf(item.taskId) === idOf(d.taskId) &&
          item.weekStart === weekStartStr,
      );
      if (exists) return prev;

      return [
        ...prev,
        {
          ...d,
          date: '',           // no day/time yet
          hoursWorked: '',    // blank entry until user inputs time
          notes: '',
          submittedForApproval: false,
          status: 'No-Status',
        },
      ];
    });

    // Close modal and reset form
    handleClose();
    formduration.resetFields();
  };


  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekStartDate = new Date(tableStartDate);
  weekStartDate.setDate(
    weekStartDate.getDate() - ((weekStartDate.getDay() + 6) % 7)
  );

  const handleClose = (type) => {
    if (type === "update") {
      setOpen({
        isAddOpen: false,
        isAddWeekOpen: false,
        isDelOpen: false,
        data: "",
      });
      form2.resetFields();
      //   getAllTasks(filterValues, currentPage, pageSize)
    } else if (type === "delete") {
      setDelOpen({
        isDelOpen: false,
        data: "",
      });
    } else {
      setOpen({
        isAddOpen: false,
        isAddWeekOpen: false,
        isDelOpen: false,
        data: "",
      });
      form2.resetFields();
    }
  };

  const handleTimePickerChange = (date, project, board, task, time, type) => {
    const dateStr = moment(date).format('YYYY-MM-DD');
    
    const isFuture = moment(dateStr).isAfter(moment(), 'day');
    if (isFuture) return;

    setUpdatedDuration(time);
    // Include boardId in key to properly identify taskboard entries
    const key = `${dateStr}_${idOf(project)}_${idOf(board)}_${idOf(task)}`;

    const patch = {
      date: dateStr,
      projectId: idOf(project),
      boardId: idOf(board),
      taskId: idOf(task),
      hoursWorked: time,
      // Keep live card notes if editing the same row
      ...(showCard?.isShown &&
      moment(showCard?.data?.date).format('YYYY-MM-DD') === dateStr &&
      idOf(showCard?.data?.projectId) === idOf(project) &&
      idOf(showCard?.data?.boardId) === idOf(board) &&
      idOf(showCard?.data?.taskId) === idOf(task)
        ? { notes: cardReason }
        : {}),
      submittedForApproval: false,
      status: 'No-Status',
      isDirty: true,
    };

    // Upsert into workingData without hitting the server
    setWorkingData(prev => upsertWorking(prev, patch));
    setPendingChanges(prev => ({ ...prev, [key]: patch }));
    setSaveButton(false); // indicate unsaved local changes
  };


const handleNoteChange = (date, project, board, task, note) => {
  const dateStr = moment(date).format('YYYY-MM-DD');
  
  // block future dates
  const isFuture = moment(dateStr).isAfter(moment(), 'day');
  // Include boardId in key to properly identify taskboard entries
  const key = `${dateStr}_${idOf(project)}_${idOf(board)}_${idOf(task)}`;

  if (isFuture) return;

  const patch = {
    date: dateStr,
    projectId: idOf(project),
    boardId: idOf(board),
    taskId: idOf(task),
    notes: note,
    ...(showCard?.isShown &&
    moment(showCard?.data?.date).format('YYYY-MM-DD') === dateStr &&
    idOf(showCard?.data?.projectId) === idOf(project) &&
    idOf(showCard?.data?.boardId) === idOf(board) &&
    idOf(showCard?.data?.taskId) === idOf(task)
      ? { hoursWorked: updatedDuration }
      : {}),
    submittedForApproval: false,
    status: 'No-Status',
    isDirty: true,
  };

  setWorkingData(prev => upsertWorking(prev, patch));
  setPendingChanges(prev => ({ ...prev, [key]: patch }));
  setCardReason(note);
  setSaveButton(false); // mark unsaved edits
};



const handleUpdate = () => {
  if (!showCard?.data) return;
  const dateStr = moment(showCard.data.date).format('YYYY-MM-DD');
  const patch = {
    date: dateStr,
    projectId: showCard.data.projectId?._id || showCard.data.projectId,
    boardId: showCard.data.boardId?._id || showCard.data.boardId,
    taskId: showCard.data.taskId?._id || showCard.data.taskId,
    hoursWorked: updatedDuration,
    notes: cardReason,
    submittedForApproval: false,
    status: 'No-Status',
    isDirty: true,
  };

  setWorkingData(prev => upsertWorking(prev, patch));
  
  // Include boardId in key to properly identify taskboard entries
  const key = `${dateStr}_${idOf(patch.projectId)}_${idOf(patch.boardId)}_${idOf(patch.taskId)}`;
  setPendingChanges(prev => ({ ...prev, [key]: patch }));
  
  setShowCard({ isShown: false, data: null });
  setSaveButton(true);
};

const handleCreate = () => {
  if (!showCard?.data) return;
  const dateStr = moment(showCard.data.date).format('YYYY-MM-DD');
  const patch = {
    date: dateStr,
    projectId: showCard.data.projectId?._id || showCard.data.projectId,
    boardId: showCard.data.boardId?._id || showCard.data.boardId,
    taskId: showCard.data.taskId?._id || showCard.data.taskId,
    hoursWorked: updatedDuration,
    notes: cardReason,
    submittedForApproval: false,
    status: 'No-Status',
    isDirty: true,
  };

  setWorkingData(prev => upsertWorking(prev, patch));
  
  // Include boardId in key to properly identify taskboard entries
  const key = `${dateStr}_${idOf(patch.projectId)}_${idOf(patch.boardId)}_${idOf(patch.taskId)}`;
  setPendingChanges(prev => ({ ...prev, [key]: patch }));
  
  setShowCard({ isShown: false, data: null });
  formduration.resetFields();
  setSaveButton(false);
};


  const onHandleDelete = (id) => {
    setLoader(true);
    const data = {
      _id: id,
    };
    apiServices("DELETE", "timesheet", data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          if (allData?.length > 1) {
            getData(currentPage, pageSize);
            setShowCard({ isShown: false, data: "" });
          } else {
            if (currentPage === 1) {
              getData(currentPage, pageSize);
              setShowCard({ isShown: false, data: "" });
            } else {
              getData(currentPage - 1, pageSize);
              setCurrentPage((prev) => prev - 1);
              setShowCard({ isShown: false, data: "" });
            }
          }
          handleClose("delete");
          message.success(t("Timesheetemployee.timesheetDeletedSuccessfully"));
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
              : t("Timesheetemployee.deleteTimesheetError")
          }!`
        );
      });
  };

  const handleSubmitApproval = () => {
    let data = {
      submittedForApproval: true,
      status: "Pending",
    };
    setLoader(true);

    allData.map((item, index) => {
      let updated_data = {
        ...data,
        _id: item?._id,
      };

      apiServices("PUT", "timesheet", updated_data, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            if (index === allData?.length - 1) {
              getData(currentPage, pageSize);
              message.success(
                t("Timesheetemployee.timesheetSubmittedSuccessfully")
              );
              setLoader(false);
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
                : t("Timesheetemployee.submitTimesheetError")
            }!`
          );
        });
    });
  };

const handleSaveAll = async () => {
  const unsaved = Object.values(pendingChanges);

  if (!unsaved.length) {
    message.info("No new or modified entries to save.");
    return;
  }

  setLoader(true);
  try {
    await Promise.all(
      unsaved.map(entry => {
        const payload = {
          date: entry.date,
          projectId: entry.projectId?._id || entry.projectId,
          boardId: entry.boardId?._id || entry.boardId || null,
          taskId: entry.taskId?._id || entry.taskId,
          hoursWorked: entry.hoursWorked || "00:00",
          notes: entry.notes || "",
          status: entry.status || "No-Status",
          submittedForApproval: false,
        };
        const method = entry._id ? "PUT" : "POST";
        console.log("saving entry", payload);
        return apiServices(method, "timesheet", payload, user_state);
      })
    );
    console.log("Check 1.", unsaved);
    message.success("Saved all pending changes successfully!");
    setPendingChanges({}); // ✅ clear only unsaved items
    console.log("Check 2.", pendingChanges);
    getData(currentPage, pageSize);
  } catch (err) {
    console.error(err);
    message.error("Error saving changes!");
  } finally {
    setLoader(false);
  }
};
const handleCancel = () => {
  if (!showCard?.data) return;

  const dateStr = moment(showCard.data.date).format('YYYY-MM-DD');
  const key = rowKey({
    date: dateStr,
    projectId: showCard.data.projectId?._id || showCard.data.projectId,
    boardId: showCard.data.boardId?._id || showCard.data.boardId,
    taskId: showCard.data.taskId?._id || showCard.data.taskId,
  });

  const originalEntry = allData.find(
    (e) =>
      moment(e.date).format('YYYY-MM-DD') === dateStr &&
      idOf(e.projectId) === idOf(showCard.data.projectId) &&
      idOf(e.boardId) === idOf(showCard.data.boardId) &&
      idOf(e.taskId) === idOf(showCard.data.taskId)
  );

  // Include boardId in key to properly identify taskboard entries
  const pendingKey = `${dateStr}_${idOf(showCard.data.projectId)}_${idOf(showCard.data.boardId)}_${idOf(showCard.data.taskId)}`;
  setPendingChanges(prev => {
    const next = { ...prev };
    delete next[pendingKey];
    return next;
  });

  if (originalEntry) {
    setWorkingData(prev =>
      prev.map(item =>
        rowKey(item) === key ? { ...originalEntry } : item,
      ),
    );
  } else {
    setWorkingData(prev => prev.filter(item => rowKey(item) !== key));
  }

  // reset card and state
  setShowCard({ isShown: false, data: null });
  setUpdatedDuration(oldDurationValue);
  setCardReason(originalEntry?.notes || "");
};


  const handleCancel2 = () => {
    formduration.resetFields();
  };

  const Dayscolumns = daysOfWeek.map((day, index) => {
    const currentDate1 = new Date();
    const cellDate1 = new Date(
      weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index
    );
    const isToday1 = currentDate1.toDateString() === cellDate1.toDateString();
    const isFuture1 = currentDate1 < cellDate1;
    const backgroundColor1 = isToday1 ? "green" : isFuture1 ? "red" : "white";

    return {
      title: (
        <div
          style={{
            display: "grid",
            placeContent: "center",
            padding: "9px 0px",
          }}
        >
          <label
            style={{
              textAlign: "center",
              fontWeight: "700",
              lineHeight: "20px",
              color: isFuture1 ? "#cfcfcf" : "#262626",
            }}
          >
            {day}
          </label>
          <label
            style={{
              color: isFuture1 ? "#cfcfcf" : "#666",
              lineHeight: "20px",
            }}
          >
            {new Date(
              weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index
            ).getDate()}{" "}
            {new Date(
              weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index
            ).toLocaleDateString("en-US", { month: "short" })}
          </label>
        </div>
      ),
      dataIndex: "",
      key: day,
      render: (text, record, index2) => {
        if (record?.projectId || record?.boardId) {
          const cellDate = moment(
            new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index)
          ).format("YYYY-MM-DD");
          
          const d = record?.data?.filter(
            (rec) =>
              moment(rec?.date).format("YYYY-MM-DD") === cellDate
          );
          const [specific_date_data] = d;
          
          const draftEntry = workingData.find(
            (e) =>
              moment(e.date).format("YYYY-MM-DD") === cellDate &&
              idOf(e.projectId) === idOf(record?.projectId) &&
              idOf(e.boardId) === idOf(record?.boardId) &&
              idOf(e.taskId) === idOf(record?.taskId)
          );
          
          const displayData = draftEntry || specific_date_data;
          const status = draftEntry?.status || specific_date_data?.status;
          
          return (
            <>
              {

                displayData?.date || draftEntry ? (
                  <TimePicker
                    allowClear={false}
                    disabled={isFuture1}
                    className={`form-control timePickerWithData ${
                      status === "Pending"
                        ? "timePickerPending"
                        : status === "Approved"
                        ? "timePickerApproved"
                        : status === "Declined"
                        ? "timePickerDeclined"
                        : ""
                    }`}
                    placeholder="00:00"
                    format="HH:mm"
                    value={
                      displayData?.hoursWorked
                        ? moment(displayData?.hoursWorked, "HH:mm")
                        : null
                    }
                    open={openTimePickers[`${cellDate}_${idOf(record?.projectId)}_${idOf(record?.boardId)}_${idOf(record?.taskId)}`] || false}
                    onOpenChange={(open) => {
                      const pickerKey = `${cellDate}_${idOf(record?.projectId)}_${idOf(record?.boardId)}_${idOf(record?.taskId)}`;
                      setOpenTimePickers(prev => ({ ...prev, [pickerKey]: open }));
                    }}
                    onSelect={(value) => {
                      handleTimePickerChange(
                        cellDate,
                        record?.projectId,
                        record?.boardId,
                        record?.taskId,
                        moment(value).format("HH:mm"),
                        "Update"
                      );
                      setSaveButton(false);
                      const pickerKey = `${cellDate}_${idOf(record?.projectId)}_${idOf(record?.boardId)}_${idOf(record?.taskId)}`;
                      setOpenTimePickers(prev => ({ ...prev, [pickerKey]: false }));
                    }}
                    onClick={() => {
                      if (!isFuture1) {
                        const cardData = draftEntry || specific_date_data;
                        
                        const currentCardDate = showCard?.data?.date 
                          ? moment(showCard.data.date).format("YYYY-MM-DD")
                          : null;
                        const isSameCell = currentCardDate === cellDate &&
                          idOf(showCard?.data?.projectId) === idOf(record?.projectId) &&
                          idOf(showCard?.data?.taskId) === idOf(record?.taskId);
                        
                        setShowCard({
                          isShown: true,
                          data: {
                            ...(cardData || {}),
                            projectId: cardData?.projectId || record?.projectId,
                            boardId: cardData?.boardId || record?.boardId,
                            taskId: cardData?.taskId || record?.taskId,
                            date: cellDate,
                            _id: cardData?._id,
                          },
                        });

                        if (isSameCell) {
                          const dateStr = cellDate;
                          const projectId = idOf(record?.projectId);
                          const boardId = idOf(record?.boardId);
                          const taskId = idOf(record?.taskId);
                          
                          const entry = workingData.find(
                            (e) =>
                              moment(e.date).format('YYYY-MM-DD') === dateStr &&
                              idOf(e.projectId) === projectId &&
                              idOf(e.boardId) === boardId &&
                              idOf(e.taskId) === taskId
                          );
                          
                          const notes = entry?.notes ?? cardData?.notes ?? "";
                          const hours = entry?.hoursWorked ?? cardData?.hoursWorked ?? "";
                          
                          setCardReason(notes);
                          setUpdatedDuration(hours);
                          setDescLength(notes.length || 0);
                          setOldDurationValue(hours);
                        }
                        
                        formduration.resetFields(); // optional reset for card form only
                      }
                    }}
                    onChange={(value) => {
                      
                      handleTimePickerChange(
                        cellDate,
                        record?.projectId,
                        record?.boardId,
                        record?.taskId,
                        moment(value).format("HH:mm"),
                        "Update"
                      );
                      setSaveButton(false);
                    }}
                    suffixIcon={false}
                  />

                ) : (
                  <Form form={formduration} className="formDurationInput">
                    <Form.Item
                      name={`${index}${index2}`}
                    >
                      {(() => {
                        const cellDate = moment(
                          new Date(weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index)
                        ).format("YYYY-MM-DD");
                        const pickerKey = `${cellDate}_${idOf(record?.projectId)}_${idOf(record?.boardId)}_${idOf(record?.taskId)}_${index}${index2}`;
                        
                        return (
                          <TimePicker
                            disabled={isFuture1}
                            allowClear={false}
                            className="form-control timePickerWithData"
                            placeholder="00:00"
                            format="HH:mm"
                            value={
                              record?.hoursWorked
                                ? moment(record?.hoursWorked, "HH:mm")
                                : null
                            }
                            open={openTimePickers[pickerKey] || false}
                            onOpenChange={(open) => {
                              setOpenTimePickers(prev => ({ ...prev, [pickerKey]: open }));
                            }}
                            onSelect={(value) => {
                              handleTimePickerChange(
                                cellDate,
                                record?.projectId,
                                record?.boardId,
                                record?.taskId,
                                moment(value).format("HH:mm"),
                                "Add"
                              );
                              setSaveButton(false);
                              setOpenTimePickers(prev => ({ ...prev, [pickerKey]: false }));
                            }}
                            onClick={() => {
                              if (!isFuture1) {
                                // Properly handle null projectId for taskboard entries
                                const d = {
                                  projectId: record?.projectId ? {
                                    _id: record?.projectId?._id,
                                    projectName: record?.projectId?.projectName,
                                  } : null,
                                  boardId: record?.boardId ? {
                                    _id: record?.boardId?._id,
                                    boardTitle: record?.boardId?.boardTitle,
                                  } : null,
                                  taskId: record?.taskId ? {
                                    _id: record?.taskId?._id,
                                    title: record?.taskId?.title,
                                  } : null,
                                  date: cellDate,
                                  indexId: `${index}${index2}`,
                                };

                                const currentCardDate = showCard?.data?.date 
                                  ? moment(showCard.data.date).format("YYYY-MM-DD")
                                  : null;
                                const isSameCell = currentCardDate === cellDate &&
                                  idOf(showCard?.data?.projectId) === idOf(record?.projectId) &&
                                  idOf(showCard?.data?.taskId) === idOf(record?.taskId);

                                setShowCard({ isShown: true, data: d });
                                
                                if (isSameCell) {
                                  const entry = workingData.find(
                                    (e) =>
                                      moment(e.date).format('YYYY-MM-DD') === cellDate &&
                                      idOf(e.projectId) === idOf(record?.projectId) &&
                                      idOf(e.boardId) === idOf(record?.boardId) &&
                                      idOf(e.taskId) === idOf(record?.taskId)
                                  );
                                  
                                  const notes = entry?.notes ?? "";
                                  const hours = entry?.hoursWorked ?? "";
                                  
                                  setCardReason(notes);
                                  setUpdatedDuration(hours);
                                  setDescLength(notes.length || 0);
                                  setOldDurationValue(hours);
                                }
                                
                                setSaveButton(true);
                              }
                            }}
                            onChange={(value) => {
                              handleTimePickerChange(
                                cellDate,
                                record?.projectId,
                                record?.boardId,
                                record?.taskId,
                                moment(value).format("HH:mm"),
                                "Add"
                              );

                              setSaveButton(false);
                            }}
                            suffixIcon={false}
                          />
                        );
                      })()}

                    </Form.Item>
                  </Form>
                )
              }
            </>
          );
        } else {
          const totalMinutes = workingData
            ?.filter(
              (item) =>
                moment(item?.date).format("YYYY-MM-DD") ===
                moment(
                  new Date(
                    weekStartDate.getTime() + 24 * 60 * 60 * 1000 * index
                  )
                ).format("YYYY-MM-DD")
            )
            ?.reduce(
              (acc, item) =>
                acc +
                item?.hoursWorked
                  ?.split(":")
                  ?.reduce(
                    (acc, val, idx) =>
                      acc + parseInt(val ? val : 0, 10) * (idx === 0 ? 60 : 1),
                    0
                  ),
              0
            );

          const hours = Math.floor(totalMinutes / 60) || 0;
          const minutes = totalMinutes % 60 || 0;
          const formattedHours = hours.toString().padStart(2, "0");
          const formattedMinutes = minutes.toString().padStart(2, "0");

          return (
            <label
              style={{ fontSize: "17px", fontWeight: "500", width: "76px" }}
            >
              {formattedHours}:{formattedMinutes}
            </label>
          );
        }
      },
    };
  });

  //     let t_data = [
  //     {
  //         _id: 1,
  //         projectId: {
  //             _id: "652e535c13934c8ecc420eea",
  //             projectName: 'Monndaine'
  //         },
  //         taskId: {
  //             _id: "65361fcb4215f750c657235aX",
  //             title: 'ADS 1213'
  //         },
  //         hoursWorked: "",
  //         date: "2023-11-06",
  //         reason: "lkklklj444 lkjlkjlk lkjlkj lklkjl lkjlkj lkjklj lkjlkj jhg h gf jhk hkj iuy kj kjh iuy uiyiuyiu yuiiy ytytrytryt yttyryt rytrytry ytytrty ygjhh kj444."
  //     },
  //     {
  //         _id: 11,
  //         projectId: {
  //             _id: "652e535c13934c8ecc420eea",
  //             projectName: 'Monndaine'
  //         },
  //         taskId: {
  //             _id: "65361fcb4215f750c657235aX",
  //             title: 'ADS 1213'
  //         },
  //         hoursWorked: "",
  //         date: "2023-11-07",
  //         reason: "lkklklj444 lkjlkjlk lkjlkj lklkjl lkjlkj lkjklj lkjlkj jhg h gf jhk hkj iuy kj kjh iuy uiyiuyiu yuiiy ytytrytryt yttyryt rytrytry ytytrty ygjhh kj444."
  //     },
  //     {
  //         _id: 4,
  //         projectId: {
  //             _id: "652e535c13934c8ecc420eea",
  //             projectName: 'Monndaine'
  //         },
  //         taskId: {
  //             _id: "65361fcb4215f750c657235aX",
  //             title: 'ADS 1213'
  //         },
  //         hoursWorked: "02:00",
  //         date: "2023-11-14",
  //         reason: "lkklklj444 lkjlkjlk lkjlkj lklkjl lkjlkj lkjklj lkjlkj jhg h gf jhk hkj iuy kj kjh iuy uiyiuyiu yuiiy ytytrytryt yttyryt rytrytry ytytrty ygjhh kj444."
  //     },
  //     {
  //         _id: 2,
  //         projectId: {
  //             _id: "652e535c13934c8ecc420eea",
  //             projectName: 'Monndaine3'
  //         },
  //         taskId: {
  //             _id: "65361fcb4215f750c657235aX1",
  //             title: 'ADS 1213'
  //         },
  //         hoursWorked: "03:00",
  //         date: "2023-11-07",
  //         reason: "lkklklj333"
  //     },
  //     {
  //         _id: 22,
  //         projectId: {
  //             _id: "652e535c13934c8ecc420eea",
  //             projectName: 'Monndaine3'
  //         },
  //         taskId: {
  //             _id: "65361fcb4215f750c657235aX1",
  //             title: 'ADS 1213'
  //         },
  //         hoursWorked: "",
  //         date: "2023-11-06",
  //         reason: "lkklklj333"
  //     },
  //     {
  //         _id: 3,
  //         projectId: {
  //             _id: "652e535c13934c8ecc420eea",
  //             projectName: 'Monndaine 2'
  //         },
  //         taskId: {
  //             _id: "65361fcb4215f750c657235a",
  //             title: 'ADS 1213 2'
  //         },
  //         hoursWorked: "10:00",
  //         date: "2023-11-07",
  //         reason: "lkklklj33310000"
  //     },
  // ]

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
        color: "#fff",
      }}
      spin
    />
  );
  const antIcon2 = (
    <LoadingOutlined
      style={{
        fontSize: 22,
        // color: '#fff'
      }}
      spin
    />
  );
  const antIcon3 = (
    <LoadingOutlined
      style={{
        fontSize: 22,
        color: "#FF9B44",
        width: "148px",
      }}
      spin
    />
  );
  const antIcon4 = (
    <LoadingOutlined
      style={{
        fontSize: 22,
        color: "#FF9B44",
        width: "120px",
      }}
      spin
    />
  );

// Calculate the current week's start date for filtering displayed rows
const displayWeekStart = new Date(tableStartDate);
displayWeekStart.setDate(displayWeekStart.getDate() - ((displayWeekStart.getDay() + 6) % 7));
const displayWeekStartStr = moment(displayWeekStart).format('YYYY-MM-DD');

// Filter workingData to only show items belonging to the current week
const filteredWorkingData = workingData?.filter(item => {
  // If item has a date, check if it's within current week dates
  if (item.date) {
    const itemDate = moment(item.date).format('YYYY-MM-DD');
    return currentWeekDates.includes(itemDate);
  }
  // If item has no date but has weekStart, check if it matches current week
  if (item.weekStart) {
    return item.weekStart === displayWeekStartStr;
  }
  // Items without date or weekStart (shouldn't happen) - exclude them
  return false;
});

const groupedData = filteredWorkingData?.reduce((result, item) => {
  // Include boardId in key to properly group taskboard entries
  const key = `${idOf(item.projectId)}-${idOf(item.boardId)}-${idOf(item.taskId)}`;

  if (!result[key]) {
    result[key] = {
      boardId: item.boardId,
      projectId: item.projectId,
      taskId: item.taskId,
      _display: {
        projectName: nameOfProject(item.projectId),
        boardTitle: titleOfBoard(item.boardId),
        taskTitle: titleOfTask(item.taskId),
      },
      data: [],
      totalDuration: 0,
    };
  }

  result[key].data.push(item);
  result[key].totalDuration += durationToMinutes(item.hoursWorked || '00:00');

  return result;
}, {});



  function durationToMinutes(duration) {
    const [hours, minutes] = duration?.split(":").map(Number);
    return hours * 60 + minutes || 0;
  }
  console.log("grouped Data :: ", groupedData);

  // const rows = Object.values(groupedData);
  const rows1 = Object.values(groupedData);
  const rows = [...rows1, {}];

  const columns = [
  {
    title: t("Timesheetemployee.title"),
    dataIndex: "Title",
    key: "Title",
    render: (text, record) => (
      <>
        {record?._display?.projectName ? (
          <label style={{ textWrap: "nowrap", fontWeight: 500 }}>
            {record._display.projectName}
          </label>
        ) : record?._display?.boardTitle ? (
          <label style={{ textWrap: "nowrap", fontWeight: 500 }}>
            {record._display.boardTitle}
            <span
              style={{
                marginLeft: "8px",
                backgroundColor: "#7460EE",
                color: "#fff",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            >
              {t("Taskboard")}
            </span>
          </label>
        ) : null}
        <br />
        <label
          style={{
            textWrap: "no-wrap",
            color: "#0409217D",
            fontWeight: "450",
          }}
        >
          {record?._display?.taskTitle}
        </label>
      </>
    ),
  },
    ...Dayscolumns,
    {
      title: t("Timesheetemployee.total"),
      dataIndex: "Total",
      key: "Total",
      render: (text, record) => {
        if (record?.projectId || record?.boardId) {
          const hours = Math.floor(record?.totalDuration / 60) || 0;
          const remainingMinutes = record?.totalDuration % 60 || 0;

          const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
          const formattedMinutes =
            remainingMinutes < 10
              ? `0${remainingMinutes}`
              : `${remainingMinutes}`;

          return (
            <label style={{ fontSize: "17px", fontWeight: "500" }}>
              {formattedHours}:{formattedMinutes}
            </label>
          );
        } else {
          function getColumnData(data, columnName) {
            return data.map((item) =>
              item[columnName] ? item[columnName] : 0
            );
          }

          const totalDurationArray = getColumnData(rows, "totalDuration");
          let popped = totalDurationArray.pop();
          const totalMinutes = totalDurationArray.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0
          );

          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;

          const formattedHours = hours.toString().padStart(2, "0");
          const formattedMinutes = minutes.toString().padStart(2, "0");

          return (
            <label
              style={{ fontSize: "17px", fontWeight: "500", width: "76px" }}
            >
              {formattedHours}:{formattedMinutes}
            </label>
          );
        }
      },
    },
  ];

  return (
    <div>
      <>
        <div
          className="table-responsive timeSheetWeekTable"
          style={{ borderRadius: "10px" }}
        >
          {/* payrollHistoryTable */}
          {/* height: '485px' */}
          <Table
            loading={tableLoader}
            className={rows?.length > 0 ? "table-striped" : ""}
            pagination={false}
            // style={{ overflowX: "auto" }}
            style={{ maxHeight: "409px" }}
            columns={columns}
            dataSource={rows}
            components={
              i18n.dir() === "rtl"
                ? {
                    header: {
                      cell: ({ children }) => (
                        <th style={{ textAlign: "right" }}>{children}</th>
                      ),
                    },
                  }
                : null
            }
            onRow={
              i18n.dir() === "rtl"
                ? (record, rowIndex) => {
                    return {
                      style: { textAlign: "right" }, // Align table data to the right
                    };
                  }
                : null
            }
          />
        </div>
        {!showCard?.isShown &&
          rows?.length > 1 &&
          !allData.some((item) => item?.submittedForApproval === true) && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={Object.keys(pendingChanges).length ? handleSaveAll : handleSubmitApproval}
                className="SubmitForApprovalButton"
                disabled={loader}
                
                style={{
                  border: "2px solid #FF9B44",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#FF9B44",
                  minWidth: "90px",
                  height: "42px",
                  marginRight: "20px",
                  paddingTop: "3px",
                  margin: "30px 0px 15px 0px",
                  paddingInline: "18px",
                }}
              >
                {loader ? (
                  <Spin size="small" indicator={antIcon3} />
                ) : (
                  <span style={{ fontSize: "16px", fontWeight: "500" }}>
                    {Object.keys(pendingChanges).length ? "Save Changes" : t("Timesheetemployee.submitForApproval")}
                  </span>
                )}
                {/* <span style={{fontSize: '16px', fontWeight: '500'}}>Submit for Approval</span> */}
              </button>
               {/* New Save button */} 
              {/* <button
                onClick={handleSaveAll}
                className="SaveAllButton"
                disabled={loader || Object.keys(pendingChanges).length === 0}
                style={{
                  border: "2px solid #FF9B44",
                  borderRadius: "8px",
                  marginLeft: "6px",
                  background: "#fff",
                  color: "#FF9B44",
                  minWidth: "90px",
                  height: "42px",
                  paddingTop: "3px",
                  margin: "30px 0px 15px 0px",
                  paddingInline: "18px",
                }}
              >
                  <span style={{ fontSize: "16px", fontWeight: "500" }}>
                    {t("Save All")}
                  </span>
                
              </button> */}
            </div>
          )}
        {allData.some((item) => item?.status === "Approved") ? (
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "15px" }}
          >
            {!showCard?.isShown &&
              rows?.length > 1 &&
              allData.some((item) => item?.submittedForApproval === false) && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={handleSubmitApproval}
                    className="SubmitForApprovalButton"
                    disabled={loader}
                    style={{
                      border: "2px solid #FF9B44",
                      borderRadius: "8px",
                      background: "#fff",
                      color: "#FF9B44",
                      minWidth: "90px",
                      height: "42px",
                      paddingTop: "3px",
                      margin: "30px 0px 15px 0px",
                      paddingInline: "18px",
                    }}
                  >
                    {loader ? (
                      <Spin size="small" indicator={antIcon4} />
                    ) : (
                      <span style={{ fontSize: "16px", fontWeight: "500" }}>
                        {t("Timesheetemployee.submitUpdates")}
                      </span>
                    )}
                  </button>
                </div>
              )}
            {allData.every((item) => item?.status === "Approved") && (
              <button
                disabled
                style={{
                  border: "2px solid #00B112",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#00B112",
                  minWidth: "90px",
                  height: "42px",
                  paddingTop: "3px",
                  margin: "30px 0px 15px 0px",
                  paddingInline: "18px",
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: "500" }}>
                  {t("Timesheetemployee.approved")}
                </span>
              </button>
            )}
            {allData.some((item) => item?.status === "Pending") && (
              <button
                disabled
                style={{
                  border: "2px solid #00B112",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#00B112",
                  minWidth: "90px",
                  height: "42px",
                  paddingTop: "3px",
                  margin: "30px 0px 15px 0px",
                  paddingInline: "18px",
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: "500" }}>
                  {t("Timesheetemployee.submittedForApproval")}
                </span>
              </button>
            )}
          </div>
        ) : allData.some((item) => item?.status === "Declined") ? (
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "15px" }}
          >
            {!showCard?.isShown &&
              rows?.length > 1 &&
              allData.some((item) => item?.submittedForApproval === false) && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={handleSubmitApproval}
                    className="SubmitForApprovalButton"
                    disabled={loader}
                    style={{
                      border: "2px solid #FF9B44",
                      borderRadius: "8px",
                      background: "#fff",
                      color: "#FF9B44",
                      minWidth: "90px",
                      height: "42px",
                      paddingTop: "3px",
                      margin: "30px 0px 15px 0px",
                      paddingInline: "18px",
                    }}
                  >
                    {loader ? (
                      <Spin size="small" indicator={antIcon4} />
                    ) : (
                      <span style={{ fontSize: "16px", fontWeight: "500" }}>
                        {t("Timesheetemployee.submitUpdates")}
                      </span>
                    )}
                  </button>
                </div>
              )}
            {allData.every((item) => item?.status === "Declined") && (
              <button
                disabled
                style={{
                  border: "2px solid #DD0000",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#DD0000",
                  minWidth: "90px",
                  height: "42px",
                  paddingTop: "3px",
                  margin: "30px 0px 15px 0px",
                  paddingInline: "18px",
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: "500" }}>
                  {t("Timesheetemployee.declined")}
                </span>
              </button>
            )}
            {allData.some((item) => item?.status === "Pending") && (
              <button
                disabled
                style={{
                  border: "2px solid #00B112",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#00B112",
                  minWidth: "90px",
                  height: "42px",
                  paddingTop: "3px",
                  margin: "30px 0px 15px 0px",
                  paddingInline: "18px",
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: "500" }}>
                  {t("Timesheetemployee.submittedForApproval")}
                </span>
              </button>
            )}
          </div>
        ) : (
          !showCard?.isShown &&
          rows?.length > 1 &&
          allData.some((item) => item?.submittedForApproval === true) && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "15px",
              }}
            >
              {!showCard?.isShown &&
                rows?.length > 1 &&
                allData.some(
                  (item) => item?.submittedForApproval === false
                ) && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      onClick={handleSubmitApproval}
                      className="SubmitForApprovalButton"
                      disabled={loader}
                      style={{
                        border: "2px solid #FF9B44",
                        borderRadius: "8px",
                        background: "#fff",
                        color: "#FF9B44",
                        minWidth: "90px",
                        height: "42px",
                        paddingTop: "3px",
                        margin: "30px 0px 15px 0px",
                        paddingInline: "18px",
                      }}
                    >
                      {loader ? (
                        <Spin size="small" indicator={antIcon4} />
                      ) : (
                        <span style={{ fontSize: "16px", fontWeight: "500" }}>
                          {t("Timesheetemployee.submitUpdates")}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              <button
                disabled
                style={{
                  border: "2px solid #00B112",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#00B112",
                  minWidth: "90px",
                  height: "42px",
                  paddingTop: "3px",
                  margin: "30px 0px 15px 0px",
                  paddingInline: "18px",
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: "500" }}>
                  {t("Timesheetemployee.submittedForApproval")}
                </span>
              </button>
            </div>
          )
        )}

        {/* {
          allData?.length > 0 &&
          <div>
            <Pagination
              style={{display: 'flex', float: 'right'}}
              total={paginationDetail?.total}
              pageSize={pageSize}
              defaultCurrent={1}
              current={currentPage}
              showTotal={(total, range) =>
                `Showing ${range[0]} to ${range[1]} of ${total} entries`}
              onChange={(page, size) => {
                setPageSize(size); setCurrentPage(page);
                getData(page, size)
              }}
              showSizeChanger={true}
              pageSizeOptions={['20', '30', '40', '50']}
              itemRender={itemRender}
            />
          </div>
        } */}

        {/* Bottom info card */}
        {showCard?.isShown && (
          <>
            <div
              className="col-12"
              style={{
                background: "#fff",
                border: "1px solid #DEE2E6",
                borderRadius: "7px",
                display: "flex",
                minHeight: "190px",
                margin: "76px 0px 20px 0px",
                padding: "30px 40px",
                flexDirection: "column",
                gap: "17px",
              }}
            >
              <h4
                className="project-title"
                style={{
                  color: "#333",
                  display: "flex",
                  alignItems: "center",
                  gap: "13px",
                }}
              >
                <img src={PencilIcon} width="25px" />
                <label>
                  Notes-{" "}
                  <label style={{ marginLeft: "3px", fontWeight: "400" }}>
                    {moment(showCard?.data?.date).format("ddd, MMM DD")},{" "}
                    {showCard?.data?.projectId?.projectName} and{" "}
                    {showCard?.data?.taskId?.title} |{" "}
                    {moment(showCard?.data?.date).format("YYYY")}
                  </label>
                </label>
              </h4>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: "14px",
                    width: "100%",
                  }}
                >
                  <div style={{ marginRight: "25px" }}>
                    <Form>
                      <Form.Item
                        name="reasonInCard"
                        // rules={[
                        // {
                        //     whitespace: true,
                        //     // required: true,
                        //     validator: (_, value) => {
                        //     if(!value || value.trim() === ''){
                        //         // return Promise.reject("please enter notes");
                        //         return Promise.resolve();
                        //     }
                        //     else if (/\s{2,}/.test(value)) {
                        //         return Promise.reject("please remove consecutive spaces");
                        //     }
                        //     else if (value.length <= 4) {
                        //         return Promise.reject("notes length must be at least 5 characters long");
                        //     }
                        //     return Promise.resolve();
                        //     },
                        // },
                        // ]}
                        className="custom-border"
                        style={{ margin: "0px" }}
                      >
                        <div>
                          <Input.TextArea
                            key={`${moment(showCard?.data?.date).format("YYYY-MM-DD")}_${idOf(showCard?.data?.projectId)}_${idOf(showCard?.data?.boardId)}_${idOf(showCard?.data?.taskId)}`}
                            rows={2}
                            value={cardReason}
                            style={{ resize: "none" }}
                            className="form-control"
                            onChange={(e) => {
                              setCardReason(e.target.value);
                              setSaveButton(false);
                              handleNoteChange(
                                showCard.data.date,
                                showCard.data.projectId,
                                showCard.data.boardId,
                                showCard.data.taskId,
                                e.target.value
                              );
                            }}
                          />
                        </div>
                      </Form.Item>
                    </Form>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "30px",
                    marginLeft: "15px",
                  }}
                >
                  {/* <h3>{showCard?.data?.hoursWorked}</h3> */}
                  <h3>{updatedDuration}</h3>
                  <div className="dropdown dropdown-action text-end">
                    {showCard?.data?._id && (
                      <>
                        <a
                          onClick={() => setShowCalendar(false)}
                          href="javascript:void(0)"
                          className="action-icon dropdown-toggle"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <i
                            className="material-icons"
                            style={{ fontSize: "28px", marginTop: "-3px" }}
                          >
                            more_vert
                          </i>
                        </a>
                        <div className="dropdown-menu dropdown-menu-right">
                          <a
                            className="dropdown-item"
                            href="javascript:void(0)"
                            onClick={() => {
                              setDelOpen({
                                isDelOpen: true,
                                data: showCard?.data,
                              });
                            }}
                          >
                            <i className="fa fa-trash-o m-r-5" /> {t("Delete")}
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  if (updatedDuration !== "00:00") {
                    if (showCard?.data?._id) {
                      handleUpdate();
                    } else {
                      handleCreate();
                    }
                  } else {
                    message.error(t("Timesheetemployee.taskDurationZeroError"));
                  }
                }}
                disabled={loader || saveButton}
                className="NextPrevButtons"
                style={{
                  border: "2px solid #DEE2E6",
                  borderRadius: "8px",
                  background: "#fff",
                  color: "#666",
                  minWidth: "90px",
                  height: "42px",
                  paddingTop: "3px",
                  margin: "0px 0px 25px 0px",
                }}
              >
                {loader ? (
                  <Spin size="small" indicator={antIcon2} />
                ) : (
                  <span style={{ fontSize: "16px", fontWeight: "500" }}>
                    {t("Save")}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  if (showCard?.data?._id) {
                    handleCancel();
                    setShowCard({ isShown: false, data: "" });
                  } else {
                    handleCancel2();
                    setShowCard({ isShown: false, data: "" });
                  }
                }}
                className="NextPrevButtons1"
                disabled={loader}
                style={{
                  border: "2px solid #FF9B44",
                  borderRadius: "8px",
                  background: "#FF9B44",
                  color: "#fff",
                  minWidth: "90px",
                  height: "42px",
                  paddingTop: "3px",
                  margin: "0px 0px 25px 0px",
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: "500" }}>
                  Cancel
                </span>
              </button>
            </div>
          </>
        )}
      </>

      {/* Add Modal */}
      <Modal
        open={open?.isAddWeekOpen}
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
                {open?.data ? t("holiday.edit") : t("holiday.add")}{" "}
                {t("Timesheetemployee.row")}
              </h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                form={form2}
                onFinish={(values) => {
                  open?.data ? onFinishEdit(values) : onFinishAdd(values);
                }}
                onFinishFailed={({ errorFields }) => {
                  const phoneErrorExists = errorFields.find((field) =>
                    field.errors
                      .toString()
                      .includes("please enter phone number")
                  );
                  if (phoneErrorExists) {
                    setPhoneLengthError({ emp: true });
                  }
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
                  {/* <div className="col-12">
                    <div className="form-group">
                      <label>
                        {t("Associate with")}{" "}
                        <span className="text-danger">*</span>
                      </label>
                      <Form.Item className="custom-border">
                        <Select
                          value={isProjectAssociated ? "project" : "taskboard"}
                          onChange={(value) => handleSelectionChange(value)}
                          className="custom-select custom-normal"
                        >
                          <Select.Option value="project">
                            {t("Project")}
                          </Select.Option>
                          <Select.Option value="taskboard">
                            {t("TaskBoard")}
                          </Select.Option>
                        </Select>
                      </Form.Item>
                    </div>
                  </div> */}
                  <div className="col-12">
                    <div className="form-group">
                      {/* {isProjectAssociated ? ( */}
                        <>
                          <label>
                            Associate with <span className="text-danger">*</span>
                          </label>
                          <div style={{ position: "relative" }} id="area">
                            <Form.Item
                              name="selectedId"
                              className="custom-border"
                              rules={[
                                {
                                  whitespace: true,
                                  required: true,
                                  message: t("please select project or taskboard"),
                                },
                              ]}
                            >
                              <Select
                                showSearch
                                onSearch={(val) => {
                                  searchHandler(val, "project");
                                }}
                                filterOption={(input, option) =>
                                  String(option.children)?.toLowerCase().indexOf(input?.toLowerCase()) >= 0
                                }
                                optionFilterProp="children"
                                notFoundContent={
                                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                }
                                dropdownRender={(menu) => <>{menu}</>}
                                onChange={(val) => {
                                  setAllTasks([]);
                                  getAllTasks(val);
                                  form2.setFieldsValue({ taskId: "" });
                                }}
                                className="custom-select custom-normal"
                                getPopupContainer={() =>
                                  document.getElementById("area")
                                }
                                placeholder={t("select project or taskboard")}
                              >
                                {allProjects.map((project) => (
                                  <Select.Option
                                    key={`project-${project._id}`}
                                    value={project._id}
                                  >
                                    {project.projectName}
                                  </Select.Option>
                                ))}
                                {allTaskboards.map((taskBoard) => (
                                  <Select.Option
                                    key={`taskboard-${taskBoard._id}`}
                                    value={taskBoard._id}
                                  >
                                    {taskBoard.boardTitle}{" "}
                                    <span
                                      style={{
                                        marginLeft: "8px",
                                        backgroundColor: "#7460EE",
                                        color: "#fff",
                                        padding: "2px 8px",
                                        borderRadius: "12px",
                                        fontSize: "12px",
                                      }}
                                    >
                                      {t("Taskboard")}
                                    </span>
                                  </Select.Option>
                                ))}
                              </Select>
                            </Form.Item>
                          </div>
                        </>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <label>
                        Task <span className="text-danger">*</span>
                      </label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="taskId"
                          className="custom-border"
                          rules={[
                            {
                              whitespace: true,
                              required: true,
                              message: t("Timesheetemployee.pleaseselecttask"),
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
                                ?.toLowerCase()
                                .indexOf(input?.toLowerCase()) >= 0
                            }
                            optionFilterProp="children"
                            notFoundContent={
                              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            }
                            dropdownRender={(menu) => <>{menu}</>}
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder={t("Timesheetemployee.selecttask")}
                          >
                            {allTasks.map((task, index) => (
                              <Select.Option key={index} value={task._id}>
                                {task.title}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="submit-section">
                  <button
                    type="submit"
                    className="btn btn-primary submit-btn"
                    disabled={loader}
                  >
                    {loader ? (
                      <Spin size="small" indicator={antIcon} />
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Modal>
      {/* Add Modal */}

      {/* Delete Task Modal */}
      <Modal
        open={delOpen.isDelOpen}
        onClose={() => handleClose("delete")}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
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
                <h3 style={{ marginBottom: "30px" }}>
                  {t("Timesheetemployee.deleteTimesheet")}
                </h3>
                <p>
                  {t("Timesheetemployee.confirmDeleteTimesheet")}{" "}
                  {/* <b>{open?.data?.title}?</b> */}
                </p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <Button
                      htmlType="submit"
                      className="btn btn-primary continue-btn"
                      onClick={() => onHandleDelete(delOpen?.data?._id)}
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
                      onClick={() => handleClose("delete")}
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
      {/* Delete Task Modal */}
    </div>
  );
}

export default WeekViewTimeSheet;
