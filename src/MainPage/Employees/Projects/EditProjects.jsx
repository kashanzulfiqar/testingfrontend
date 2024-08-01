import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import {
  Avatar_16,
  Avatar_02,
  Avatar_05,
  Avatar_09,
  Avatar_10,
  Avatar_11,
  Avatar_01,
  PlaceHolder,
  user_icon,
} from "../../../Entryfile/imagepath";
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
  Tooltip,
  message,
  Tag,
  Space,
  Popconfirm,
  InputNumber,
} from "antd";
import { Modal } from "@mui/material";
import moment from "moment";
import { apiServices } from "../../../Services/apiServices";
import { apiUploadToS3 } from "../../../Services/uploadImage";
import { LoadingOutlined, MinusCircleFilled } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

function EditProjects({
  data,
  editModal,
  closeEditModal,
  getlistprojects,
  allCurrencies,
  allDomain,
}) {
  const [form] = Form.useForm();
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role;

  const [selectedData, setSelectedData] = useState(null);
  // const [allDomain, setAllDomain] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [focalPersons, setFocalPersons] = useState([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [teamCost, setTeamCost] = useState([]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [selectedDevelopers, setSelectedDevelopers] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadFiles2, setUploadFiles2] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFiles2, setSelectedFiles2] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newAdminFiles, setNewAdminFiles] = useState([]);
  const [loader, setLoader] = useState(false);
  const [projectType, setProjectType] = useState("");
  const [costType, setCostType] = useState(0);
  const [projectCost, setProjectCost] = useState(0);
  const [currencyIs, setCurrencyIs] = useState('');

  const [paymentSchedules, setPaymentSchedules] = useState([
    // Initial payment schedule
    {
      paymentTitle: "",
      dueDate: null,
      amountInPercent: "",
      amountInFigure: "",
      paid: false,
    },
  ]);

  const addPaymentSchedule = () => {
    setPaymentSchedules([
      ...paymentSchedules,
      {
        paymentTitle: "",
        dueDate: null,
        amountInPercent: "",
        amountInFigure: "",
        paid: false,
      },
    ]);
  };

  const removePaymentSchedule = (indexToRemove) => {
    const updatedSchedules = paymentSchedules.filter(
      (_, index) => index !== indexToRemove
    );
    setPaymentSchedules(updatedSchedules);
  };

  useEffect(() => {
    console.log("EDIT MODAL");
    if (data) {
      setSelectedLeader(data?.projectLead);
      setSelectedTeamMembers(data?.assignedDevelopers);
      setCurrencyIs(data?.currency);

      //const initialTeamCost = data?.teamCost?.length > 0
      //   ? data.teamCost
      //   : data?.assignedDevelopers?.length > 0 
      //   ? data?.assignedDevelopers?.map((userId) => ({
      //     userId,
      //     cost: 0,
      //   }))
      //   :
      //   null

      const initialTeamCost = data?.teamCost?.length > 0
        ? data.teamCost
        : data?.assignedDevelopers?.map((userId) => ({
            userId,
            cost: 0,
          }));

      setTeamCost(initialTeamCost);
      setSelectedData(data);
      fetchFocalPersons(data?.clientId);
      setSelectedFiles(data?.docs);
      setSelectedFiles2(data?.adminDocs ? data?.adminDocs : []);
      setUploadFiles(data?.docs);
      setUploadFiles2(data?.adminDocs ? data?.adminDocs : []);
      setProjectType(data?.projectType);
      setCostType(data?.costType);
      setProjectCost(data?.cost);
      // Count the number of payment schedules in the response
      const numPaymentSchedules = data?.paymentSchedule?.length;

      // Initialize the paymentSchedules state with the correct number of payment schedules
      const initialPaymentSchedules = Array.from(
        { length: numPaymentSchedules },
        (_, index) => ({
          paymentTitle: "",
          dueDate: null,
          amountInPercent: "",
          amountInFigure: "",
          paid: false,
        })
      );

      setPaymentSchedules(initialPaymentSchedules);

      form.setFieldsValue({
        ...data,
        startDate: moment(data?.startDate, "YYYY-MM-DD"),
        endDate: moment(data?.endDate, "YYYY-MM-DD"),
        paymentSchedule: data?.paymentSchedule?.map((schedule) => ({
          ...schedule,
          dueDate: schedule.dueDate
            ? moment(schedule.dueDate, "YYYY-MM-DD")
            : null,
        })),
      });
    }
  }, []);

  const getEmployeeImage = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee?.imageUrl || ""; // You may provide a default image URL
  };

  const getEmployeeFullName = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    return employee ? employee.fullName : "None";
  };

  const getTeamMemberOptions = () => {
    return employees?.map((employee) => (
      <Select.Option key={employee._id} value={employee._id}>
        {employee.fullName}
      </Select.Option>
    ));
    // if (!selectedLeader) {
    //   return employees?.map((employee) => (
    //     <Select.Option key={employee._id} value={employee._id}>
    //       {employee.fullName}
    //     </Select.Option>
    //   ));
    // } else {
    //   return employees
    //     ?.filter((employee) => employee._id !== selectedLeader)
    //     ?.map((employee) => (
    //       <Select.Option key={employee._id} value={employee._id}>
    //         {employee.fullName}
    //       </Select.Option>
    //     ));
    // }
  };

  useEffect(() => {
    fetchEmployees();
    ViewClients();
    // getAllDomain();
  }, []);


  const handleChange = (values) => {

    setSelectedTeamMembers(values);

    // Find items to add
    const newMembers = values.filter((value) => !selectedTeamMembers.includes(value));
    // Find items to remove
    const removedMembers = selectedTeamMembers.filter((value) => !values.includes(value));
    
    // Update team members array
    setTeamCost((prevArray) => {
      // Remove the removed items
      const filteredArray = prevArray.filter((item) => !removedMembers.includes(item.userId));
      // Add new items
      return [
        ...filteredArray,
        ...newMembers.map((userId) => ({
          userId,
          cost: 0
        }))
      ];
    });
  };

  const getAllDomain = () => {
    apiServices("GET", "team/view-team", null, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // setAllDomain(res?.data?.Team);
          const all_domains = res?.data?.Team;
          const sortedData = all_domains
            .slice()
            .sort((a, b) => a.teamName.localeCompare(b.teamName));
          setAllDomain(sortedData);
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
              : t("projectScreen.errors.getDomainInfoError")
          }!`
        );
      });
  };

  const fetchEmployees = () => {
    apiServices("GET", `user/all-employees`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const emps = res?.data?.User;
          const sortedData = emps
            .slice()
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
          setEmployees(sortedData);
        }
      })
      .catch((err) => {
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

  const ViewClients = () => {
    apiServices(
      "GET",
      `client/all-client`,
      // `client/view-client?deleted=false&page=1&limit=99999`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          // const clients = res?.data?.clients?.docs;
          const clients = res?.data?.clients;
          const sortedData = clients
            .slice()
            .sort((a, b) => a.clientName.localeCompare(b.clientName));
          setClients(sortedData);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("aDash.errors.getAllClientsError")
          }`
        );
      });
  };

  const fetchFocalPersons = (clientId) => {
    apiServices(
      "GET",
      `focal-person/view-focal-person?deleted=false&clientId=${clientId}`,
      null,
      user_state
    )
      .then((res) => {
        if (res.data.success === true) {
          const focalperson = res?.data?.focalPersons.docs;
          const sortedData = focalperson
            .slice()
            .sort((a, b) => a.focalPersonName.localeCompare(b.focalPersonName));
          setFocalPersons(sortedData);
        }
      })
      .catch((err) => {
        // message.error(
        //   `Get Focal Person Error`
        // );
        console.log("error");
      });
  };

  const DeleteFiles = async (files) => {
    // Create an array of promises for deleting each file
    const deletionPromises = files?.map((file) => {
      let data = {
        resource_type: file?.resource_type,
      };

      if (file?.public_id) {
        data.public_id = file.public_id;
      } else if (file?.imageUrl) {
        data.secure_url = file.imageUrl;
      }
      return apiServices("DELETE", `user/deletefile`, data, user_state)
        .then((res) => {
          if (res.data.success) {
            console.log(`Deleted: ${file.public_id}`);
            return { success: true, public_id: file.public_id };
          } else {
            throw new Error(`Failed to delete: ${file.public_id}`);
          }
        })
        .catch((err) => {
          console.error(`Error deleting ${file.public_id}:`, err);
          // Return an error object instead of throwing to handle it gracefully in Promise.all
          return { success: false, public_id: file.public_id, error: err };
        });
    });

    // Wait for all deletion promises to resolve
    try {
      const results = await Promise.all(deletionPromises);
      // Filter out successful deletions
      const successfulDeletes = results.filter((result) => result.success);
      const failedDeletes = results.filter((result) => !result.success);

      console.log(`Successfully deleted ${successfulDeletes.length} files.`);
      if (failedDeletes.length > 0) {
        console.error(`Failed to delete ${failedDeletes.length} files.`);
        message.error("Some files could not be deleted.");
      }
    } catch (error) {
      message.error("An error occurred while deleting files.");
    }
  };

  const UpdateProject = async (values, selectedProject) => {
    setLoader(true);
    //setIsLoading(true);
    if (selectedProject) {
      const { paymentSchedule, cost } = values;

      // Calculate total amount from payment schedule
      const totalAmountInFigure = paymentSchedule?.reduce(
        (total, schedule) => total + parseFloat(schedule.amountInFigure || 0),
        0
      );

      if (totalAmountInFigure > cost) {
        const errorMessage = "Total amount exceeds the project cost.";
        const errorFields = [];

        paymentSchedule.forEach((schedule, index) => {
          const scheduleAmount = parseFloat(schedule.amountInFigure || 0);

          if (scheduleAmount + totalAmountInFigure - scheduleAmount > cost) {
            errorFields.push({
              name: ["paymentSchedule", index, "amountInFigure"],
              errors: [errorMessage],
            });
          }
        });

        form.setFields(errorFields);
        setLoader(false);
        return; // Prevent submission if total exceeds cost
      }

      let docs = [...uploadFiles],
        admin = [...uploadFiles2];

      let temp1,
        temp2 = [];

      if (newFiles?.length > 0) {
        temp1 = await uploadFunction(newFiles);
        docs = [...docs, ...temp1];
      }
      if (newAdminFiles?.length > 0) {
        temp2 = await uploadFunction(newAdminFiles);
        admin = [...admin, ...temp2];
      }

      if (filesToDelete?.length > 0) {
        await DeleteFiles(filesToDelete);
        console.log("All files deleted successfully");
      }

      let data = {
        _id: selectedData._id,
        projectName: values.projectName,
        projectDescription: values.projectDescription,
        clientId: values.clientId,
        focalPersonId: values.focalPersonId,
        startDate: moment(values.startDate).format("YYYY-MM-DD"),
        endDate: moment(values.endDate).format("YYYY-MM-DD"),
        projectDomain: values.projectDomain,
        projectType: values.projectType,
        currency: values.currency,
        cost: values.cost,
        costType: values.costType,
        priority: values.priority,
        projectLead: values.projectLead,
        assignedDevelopers: values.assignedDevelopers,
        teamCost: teamCost,
        status: values.status,
        docs: docs,
        adminDocs: admin,
        paymentSchedule:
          projectType === "Billed" ? values?.paymentSchedule : [],
        deleted: false,
        companyId: selectedData.companyId,
      };

      apiServices("PUT", `project-management/`, data, user_state)
        .then((res) => {
          if (res.data.success === true) {
            message.success(
              t("projectScreen.errors.projectDetailsUpdatedSuccessfully")
            );
            getlistprojects();
            setLoader(false);
          }
        })
        .catch((err) => {
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : t("projectScreen.errors.errorUpdatingProjectDetails")
            }`
          );
        })
        .finally(() => {
          closeEditModal();
          setLoader(false);
        });
    } else {
      const { paymentSchedule, cost } = values;

      // Calculate total amount from payment schedule
      const totalAmountInFigure = paymentSchedule?.reduce(
        (total, schedule) => total + parseFloat(schedule.amountInFigure || 0),
        0
      );

      if (totalAmountInFigure > cost) {
        const errorMessage = "Total amount exceeds the project cost.";
        const errorFields = [];

        paymentSchedule.forEach((schedule, index) => {
          const scheduleAmount = parseFloat(schedule.amountInFigure || 0);

          if (scheduleAmount + totalAmountInFigure - scheduleAmount > cost) {
            errorFields.push({
              name: ["paymentSchedule", index, "amountInFigure"],
              errors: [errorMessage],
            });
          }
        });

        form.setFields(errorFields);
        setLoader(false);
        return; // Prevent submission if total exceeds cost
      }

      let docs = [...uploadFiles],
        admin = [...uploadFiles2];

      let temp1,
        temp2 = [];

      if (newFiles?.length > 0) {
        temp1 = await uploadFunction(newFiles);
        docs = [...docs, ...temp1];
      }
      if (newAdminFiles?.length > 0) {
        temp2 = await uploadFunction(newAdminFiles);
        admin = [...admin, ...temp2];
      }

      if (filesToDelete?.length > 0) {
        await DeleteFiles(filesToDelete);
        console.log("All files deleted successfully");
      }

      let data = {
        projectName: values.projectName,
        projectDescription: values.projectDescription,
        clientId: values.clientId,
        focalPersonId: values.focalPersonId,
        startDate: moment(values.startDate).format("YYYY-MM-DD"),
        endDate: moment(values.endDate).format("YYYY-MM-DD"),
        projectDomain: values.projectDomain,
        projectType: values.projectType,
        currency: values.currency,
        cost: values.cost,
        costType: values.costType,
        priority: values.priority,
        projectLead: values.projectLead,
        assignedDevelopers: values.assignedDevelopers,
        teamCost: teamCost,
        status: values.status,
        docs: docs,
        adminDocs: admin,
        paymentSchedule: values?.paymentSchedule,
      };

      apiServices("POST", `project-management/`, data, user_state)
        .then((res) => {
          if (res.data.success === true) {
            //const payrolls=res?.data?.payrolls;
            //console.log(payrolls)
            //setData((prevData) => [...prevData, ...payrolls]);
            //setFilters(selectedPayFilters);
            //GetGenPayrolls();
            message.success(t("projectScreen.errors.projectAdded"));
            //setIsLoading(false);
            getlistprojects();
            setLoader(false);
          }
        })
        .catch((err) => {
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : t("projectScreen.errors.addProjectError")
            }`
          );
        })
        .finally(() => {
          closeEditModal();
          setLoader(false);
        });
    }
  };

  const uploadFunction = async (files) => {
    const uploadPromises = files?.map((file) => {
      return apiUploadToS3(file)
        .then((res) => ({
          asset_id: res?.data?.result?.asset_id,
          public_id: res?.data?.result?.public_id,
          fileName: file?.name,
          imageUrl: res?.data?.result?.secure_url,
          resource_type: res?.data?.result?.resource_type,
        }))
        .catch((err) => {
          message.error(
            err?.response?.data?.msg
              ? err.response.data.msg
              : err.response.data.validation?.body?.message
              ? err.response.data.validation.body.message
              : t("projectScreen.errors.fileUploadError", { file: file?.name })
          );
          throw err;
        });
    });

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("File upload error:", error);
    }
  };

  const acceptableFormats = [
    "pdf",
    "doc",
    "docx",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "xls",
    "xlsx",
  ];

  const onFileUpload = async (files, type) => {
    if (type === "normal") {
      const uploadPromises = [];
      const validFiles = []; // To store valid files
      const existingFileNames = selectedFiles?.map((file) => file?.fileName);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        //console.log("File: ", file);

        // Check file format (extension)
        const fileExtension = file?.name?.split(".").pop().toLowerCase();
        if (!acceptableFormats.includes(fileExtension)) {
          message.error(
            t("projectScreen.errors.fileFormatNotSupported", {
              file: file?.name,
            })
          );
          continue; // Skip this file and continue with the next one
        }

        // Check file size
        if (file?.size > 10485760) {
          message.error(
            t("projectScreen.errors.fileSizeExceedsLimit", { file: file?.name })
          );
          continue; // Skip this file and continue with the next one
        }

        if (existingFileNames?.includes(file?.name)) {
          message.error(
            t("projectScreen.errors.fileAlreadySelected", { file: file?.name })
          );
          continue; // Skip this file and continue with the next one
        }
        let fileData = {
          fileName: file?.name,
        };
        validFiles.push(fileData);
        setSelectedFiles((prevSelectedFiles) => {
          const uniqueValidFiles = validFiles.filter((newFile) => {
            // Check if a file with the same name already exists in the selectedFiles
            return !prevSelectedFiles?.some(
              (existingFile) => existingFile?.fileName === newFile?.fileName
            );
          });
          return [...prevSelectedFiles, ...uniqueValidFiles];
        });

        setNewFiles((prev) => [...prev, file]);
      }
    } else if (type === "admin") {
      const uploadPromises = [];
      const validFiles = []; // To store valid files
      const existingFileNames = selectedFiles2?.map((file) => file?.fileName);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        //console.log("File: ", file);

        // Check file format (extension)
        const fileExtension = file?.name?.split(".").pop().toLowerCase();
        if (!acceptableFormats.includes(fileExtension)) {
          message.error(
            t("projectScreen.errors.fileFormatNotSupported", {
              file: file?.name,
            })
          );
          continue; // Skip this file and continue with the next one
        }

        // Check file size
        if (file?.size > 10485760) {
          message.error(
            t("projectScreen.errors.fileSizeExceedsLimit", { file: file?.name })
          );
          continue; // Skip this file and continue with the next one
        }

        if (existingFileNames?.includes(file?.name)) {
          message.error(
            t("projectScreen.errors.fileAlreadySelected", { file: file?.name })
          );
          continue; // Skip this file and continue with the next one
        }
        let fileData = {
          fileName: file?.name,
        };
        validFiles.push(fileData);
        setSelectedFiles2((prevSelectedFiles) => {
          const uniqueValidFiles = validFiles.filter((newFile) => {
            // Check if a file with the same name already exists in the selectedFiles
            return !prevSelectedFiles?.some(
              (existingFile) => existingFile?.fileName === newFile?.fileName
            );
          });
          return [...prevSelectedFiles, ...uniqueValidFiles];
        });
        setNewAdminFiles((prev) => [...prev, file]);
      }
      console.log(validFiles);
    }
  };

  const removeSelectedFile = (index, type) => {
    if (type === "normal") {
      const updatedSelectedFiles = [...selectedFiles];
      const fileToRemove = updatedSelectedFiles[index];
      console.log(fileToRemove);
      updatedSelectedFiles.splice(index, 1);
      setSelectedFiles(updatedSelectedFiles);

      // Remove the corresponding file from the uploadFiles state array
      const updatedUploadFiles = [...uploadFiles];
      updatedUploadFiles.splice(index, 1);
      setUploadFiles(updatedUploadFiles);

      const updatedNewFiles = newFiles?.filter(
        (file) => file.name !== fileToRemove?.fileName
      );
      setNewFiles(updatedNewFiles);

      if (fileToRemove?.imageUrl) {
        setFilesToDelete((prev) => [...prev, fileToRemove]);
      }
      console.log("file", filesToDelete);
      //DeleteFiles(fileToRemove?.public_id)
    } else if (type === "admin") {
      const updatedSelectedFiles = [...selectedFiles2];
      const fileToRemove = updatedSelectedFiles[index];
      updatedSelectedFiles.splice(index, 1);
      setSelectedFiles2(updatedSelectedFiles);

      // Remove the corresponding file from the uploadFiles state array
      const updatedUploadFiles = [...uploadFiles2];
      updatedUploadFiles.splice(index, 1);
      setUploadFiles2(updatedUploadFiles);

      const updatedNewAdminFiles = newAdminFiles?.filter(
        (file) => file.name !== fileToRemove?.fileName
      );
      setNewAdminFiles(updatedNewAdminFiles);

      if (fileToRemove?.imageUrl) {
        setFilesToDelete((prev) => [...prev, fileToRemove]);
      }
      console.log("file", filesToDelete);
    }
  };

  const displaySelectedFiles = (type) => {
    if (type === "normal") {
      return selectedFiles?.map((file, index) => (
        <Space key={index}>
          <Tag
            closable
            onClose={() => removeSelectedFile(index, "normal")}
            color="blue" // You can customize the color as needed
            className="custom-tag"
          >
            {file?.fileName || file?.name}
          </Tag>
        </Space>
      ));
    } else if (type === "admin") {
      return selectedFiles2?.map((file, index) => (
        <Space key={index}>
          <Tag
            closable
            onClose={() => removeSelectedFile(index, "admin")}
            color="blue" // You can customize the color as needed
            className="custom-tag"
          >
            {file?.fileName || file.name}
          </Tag>
        </Space>
      ));
    }
  };

  const handlePaymentRow = (value) => {
    setProjectType(value);
    if (value === "Billed" && paymentSchedules?.length === 0) {
      addPaymentSchedule();
    }
  };

  const handleCostChange = (value) => {
    setProjectCost(value);
    const paymentSchedules = form.getFieldValue("paymentSchedule");

    const updatedPaymentSchedules = paymentSchedules?.map((schedule) => {
      const { amountInFigure } = schedule;
      const percentage = ((amountInFigure / value) * 100).toFixed(2);
      return {
        ...schedule,
        amountInPercent: parseFloat(percentage),
      };
    });

    form.setFieldsValue({
      paymentSchedule: updatedPaymentSchedules,
    });
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

  const handleAmountInFigureChange = (value, index) => {
    const newPaymentSchedules = form.getFieldValue("paymentSchedule");
    newPaymentSchedules[index].amountInFigure = value;

    const percentage = ((value / projectCost) * 100).toFixed(2);
    newPaymentSchedules[index].amountInPercent = parseFloat(percentage);

    setPaymentSchedules(newPaymentSchedules);

    form.setFieldsValue({
      paymentSchedule: newPaymentSchedules,
    });
  };

  const handleAmountInPercentChange = (value, index) => {
    const newPaymentSchedules = form.getFieldValue("paymentSchedule");
    newPaymentSchedules[index].amountInPercent = value;

    const amount = Math.round((value * projectCost) / 100);
    newPaymentSchedules[index].amountInFigure = amount;

    setPaymentSchedules(newPaymentSchedules);

    form.setFieldsValue({
      paymentSchedule: newPaymentSchedules,
    });
  };


  const handleAmountChange = (value, index) => {
    const newArray = [...teamCost];
    newArray[index].cost = value;
    setTeamCost(newArray);
  };


  const teamColumns = [
    {
      title: 'Index',
      key: 'index',
      render: (text, record, index) => index + 1,
    },
    {
      title: 'Employee Name',
      dataIndex: 'userId',
      key: 'userId',
      render: (text) => (
      <h2 className="table-avatar">
        <label className="avatar"><img alt="" src={getEmployeeImage(text) || user_icon} /></label>
        <label>{getEmployeeFullName(text)}</label>
      </h2>
    ),
    },
    {
      title: `${costType === 'Hourly' ? 'Hourly Rate' : costType === 'Monthly' ? 'Monthly Rate' : 'Salary'} (${currencyIs})`,
      dataIndex: 'cost',
      key: 'cost',
      render: (text, record, index) => (
        <Form.Item
          className="custom-border"
          rules={[
            {
              required: true,
              message: t('projectScreen.Modal.pleaseEnterAmountInFigure'),
            },
          ]}
          style={{ width: 'max-content' }}
        >
          <InputNumber
            className="form-control"
            value={record.cost}
            placeholder={t('projectScreen.Modal.enterAmount')}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            onChange={(value) => handleAmountChange(value, index)}
          />
        </Form.Item>
      ),
    },
  ];

  const paymentColumns = [
    {
      title: t("projectScreen.Modal.paymentTitle"),
      dataIndex: "paymentTitle",
      key: "paymentTitle",
      render: (text, record, index) => (
        <Form.Item
          name={["paymentSchedule", index, "paymentTitle"]}
          className="custom-border"
          rules={[
            {
              required: true,
              message: t("projectScreen.Modal.enterPaymentTitle"),
            },
          ]}
        >
          <Input
            className="form-control"
            placeholder={t("projectScreen.Modal.enterTitle")}
          />
        </Form.Item>
      ),
    },
    {
      title: t("projectScreen.Modal.amountInFigure"),
      dataIndex: "amountInFigure",
      key: "amountInFigure",
      render: (text, record, index) => (
        <Form.Item
          name={["paymentSchedule", index, "amountInFigure"]}
          className="custom-border"
          rules={[
            {
              required: true,
              message: t("projectScreen.Modal.pleaseEnterAmountInFigure"),
            },
          ]}
        >
          {/* <Input type="number" className="form-control" /> */}
          <InputNumber
            className="form-control"
            placeholder={t("projectScreen.Modal.enterAmount")}
            formatter={(value) => {
              return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }}
            parser={(value) => {
              return value.replace(/\$\s?|(,*)/g, "");
            }}
            onChange={(value) => handleAmountInFigureChange(value, index)}
          />
        </Form.Item>
      ),
    },
    {
      title: t("projectScreen.Modal.amountInPercent"),
      dataIndex: "amountInPercent",
      key: "amountInPercent",
      render: (text, record, index) => (
        <Form.Item
          name={["paymentSchedule", index, "amountInPercent"]}
          className="custom-border"
          rules={[
            {
              required: true,
              message: t("projectScreen.Modal.pleaseEnterAmountInPercentage"),
            },
          ]}
        >
          {/* <Input type="number" className="form-control" /> */}
          <InputNumber
            className="form-control"
            placeholder={t("projectScreen.Modal.enterPercentage")}
            max={100}
            min={0}
            maxLength={5}
            onChange={(value) => handleAmountInPercentChange(value, index)}
          />
        </Form.Item>
      ),
    },
    {
      title: t("projectScreen.Modal.dueDate"),
      dataIndex: "dueDate",
      key: "dueDate",
      render: (text, record, index) => (
        <div style={{ position: "relative" }} id={`dueDate-${index}`}>
          <Form.Item
            name={["paymentSchedule", index, "dueDate"]}
            rules={[
              {
                required: true,
                message: t("projectScreen.Modal.selectDueDate"),
              },
            ]}
            className="custom-border"
            style={{ width: "max-content" }}
          >
            <DatePicker
              suffixIcon={null}
              getPopupContainer={() =>
                document.getElementById(`dueDate-${index}`)
              }
              placeholder={t("requests.addModal.selectDate")}
              className="form-control"
              size="large"
            />
          </Form.Item>
        </div>
      ),
    },
    {
      title: t("projectScreen.Modal.paid"),
      dataIndex: "paid",
      key: "paid",
      render: (text, record, index) => (
        <Form.Item
          name={["paymentSchedule", index, "paid"]}
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>
      ),
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (text, record, index) => (
    //     <MinusCircleFilled
    //       style={{ color: "red", cursor: "pointer" }}
    //       //disabled={record?.paid}
    //       onClick={() => {
    //         removePaymentSchedule(index);
    //         console.log(record?.paid);
    //       }}
    //     />
    //   ),
    // },
    {
      title: t("projectScreen.Modal.action"),
      key: "action",
      render: (text, record, index) => (
        <span
          style={{
            color:
              paymentSchedules.length > 1
                ? index === paymentSchedules.length - 1
                  ? "red"
                  : "#ccc"
                : "#ccc",
            cursor: "pointer",
          }}
        >
          {/* <span style={{ color: index === paymentSchedules?.length - 1 ? 'red' : '#ccc', cursor: 'pointer' }}> */}
          <MinusCircleFilled
            onClick={() => {
              if (
                paymentSchedules.length > 1 &&
                index === paymentSchedules?.length - 1
              ) {
                removePaymentSchedule(index);
              }
            }}
          />
        </span>
      ),
    },
  ];

  const showTeamSearch = (val, type) => {
    let dropdownValues = [];
    if (type === "Team") {
      employees.forEach((team) => {
        dropdownValues.push(team.fullName.toLowerCase());
      });
    } else if (type === "client") {
      clients.forEach((client) => {
        dropdownValues.push(client.clientName.toLowerCase());
      });
    } else if (type === "focal") {
      focalPersons.forEach((focal) => {
        dropdownValues.push(focal.focalPersonName.toLowerCase());
      });
    } else if (type === "domain") {
      allDomain.forEach((dom) => {
        dropdownValues.push(dom.teamName.toLowerCase());
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

  return (
    <Modal
      open={editModal}
      onClose={closeEditModal}
      aria-labelledby="modal-modal-title"
      className="modalScroll"
      aria-describedby="modal-modal-description"
      disableRestoreFocus
      BackdropProps={{
        style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
      }}
      sx={{ overflowY: "auto" }}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {selectedData ? t("holiday.update") : t("holiday.add")} Project
            </h5>

            <button type="button" className="close" onClick={closeEditModal}>
              <span aria-hidden="true">×</span>
            </button>
          </div>

          {role === "admin" ||
          (permissions?.projectManagement && permissions?.managePayrolls) ? (
            <div className="modal-body">
              <Form
                form={form}
                onFinish={(val) => UpdateProject(val, selectedData)}
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
                name="control-hooks"
              >
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.projectName")}</label>
                      <Form.Item
                        name="projectName"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t("projectScreen.Modal.enterProjectName"),
                          },
                        ]}
                      >
                        <Input
                          className="form-control"
                          placeholder={t(
                            "projectScreen.Modal.enterprojectName"
                          )}
                          maxLength={50}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.client")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="clientId"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: t("projectScreen.Modal.chooseClient"),
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            onSearch={(val) => {
                              showTeamSearch(val, "client");
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
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder={t("projectScreen.Modal.selectClient")}
                            onChange={(value) => {
                              // Set the selected client when it changes
                              setSelectedClient(value);

                              form.setFieldsValue({ focalPersonId: null });
                              // Fetch the focal persons based on the selected client
                              fetchFocalPersons(value);
                            }}
                          >
                            {clients?.map((client) => (
                              <Select.Option
                                key={client._id}
                                value={client._id}
                              >
                                {client.clientName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.focalPerson")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="focalPersonId"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: t(
                                "projectScreen.Modal.selectFocalPerson"
                              ),
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            onSearch={(val) => {
                              showTeamSearch(val, "focal");
                              // onTeamChange(val)
                            }}
                            filterOption={(input, option) =>
                              option.children[0]
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
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
                            placeholder={t(
                              "projectScreen.Modal.selectfocalPerson"
                            )}
                          >
                            {focalPersons?.map((focalPerson) => (
                              <Select.Option
                                key={focalPerson._id}
                                value={focalPerson._id}
                              >
                                {focalPerson?.focalPersonName}{" "}
                                {/* Adjust the field name as needed */}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.projectStatus")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="status"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: t("projectScreen.Modal.chooseStatus"),
                            },
                          ]}
                        >
                          <Select
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder={t("projectScreen.Modal.selectStatus")}
                          >
                            <Select.Option value="Paused">
                              {t("projectScreen.Modal.paused")}
                            </Select.Option>
                            <Select.Option value="Scheduled">
                              {t("projectScreen.Modal.scheduled")}
                            </Select.Option>
                            <Select.Option value="On-Going">
                              {t("projectScreen.Modal.onGoing")}
                            </Select.Option>
                            <Select.Option value="Archived">
                              {t("projectScreen.Modal.archived")}
                            </Select.Option>
                            <Select.Option value="Completed">
                              {t("projectScreen.Modal.completed")}
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.startDate")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="startDate"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: t("projectScreen.Modal.enterStartDate"),
                            },
                          ]}
                        >
                          <DatePicker
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            style={{ width: "100%" }}
                            className="form-control"
                            placeholder={t("requests.addModal.selectDate")}
                            size="large"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.endDate")}</label>
                      <div style={{ position: "relative" }} id="area">
                        {/* <Form.Item
                          name="endDate"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: "Enter an end date",
                            },
                          ]}
                        >
                          <DatePicker
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            style={{ width: "100%" }}
                            className="form-control"
                            size="large"
                          />
                        </Form.Item> */}

                        <Form.Item
                          name="endDate"
                          rules={[
                            {
                              required: true,
                              message: t("projectScreen.Modal.enterEndDate"),
                            },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                // Ensure that the end date is not before the start date
                                const startDate = getFieldValue("startDate");
                                if (!startDate || !value) {
                                  // If either date is not selected, do not perform validation
                                  return Promise.resolve();
                                }
                                if (
                                  !value.isSame(startDate, "day") &&
                                  value.isSameOrAfter(startDate)
                                ) {
                                  // End date is valid
                                  return Promise.resolve();
                                }
                                return Promise.reject(
                                  t(
                                    "projectScreen.errors.endDateMustNotBeBeforeStartDate"
                                  )
                                );
                              },
                            }),
                          ]}
                          className="custom-border"
                        >
                          <DatePicker
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            style={{ width: "100%" }}
                            className="form-control"
                            placeholder={t("requests.addModal.selectDate")}
                            size="large"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.domain")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="projectDomain"
                          className="addTeamHeight"
                          rules={[
                            {
                              required: true,
                              message: t(
                                "projectScreen.Modal.domainCannotBeEmpty"
                              ),
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            onSearch={(val) => {
                              showTeamSearch(val, "domain");
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
                            placeholder={t("projectScreen.Modal.selectDomain")}
                          >
                            {allDomain?.map((domain) => (
                              <Select.Option
                                key={domain._id}
                                value={domain._id}
                              >
                                {domain.teamName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.projectType")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="projectType"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: t(
                                "projectScreen.Modal.chooseProjectType"
                              ),
                            },
                          ]}
                        >
                          <Select
                            // showSearch
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder={t(
                              "projectScreen.Modal.selectProjectType"
                            )}
                            onChange={(value) => handlePaymentRow(value)}
                            //onChange={handlePaymentRow(value)}
                            options={[
                              {
                                value: "Billed",
                                label: t("projectScreen.Modal.billed"),
                              },
                              {
                                value: "nonBilled",
                                label: t("projectScreen.Modal.nonBilled"),
                              },
                            ]}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.currency")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="currency"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: t("projectScreen.Modal.chooseCurrency"),
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder={t(
                              "projectScreen.Modal.selectCurrency"
                            )}
                            onChange={(value)=> {
                              setCurrencyIs(value);
                            }}
                          >
                            {allCurrencies.map((currency, index) => (
                              <Select.Option
                                key={index}
                                value={currency?.currency}
                              >
                                {currency?.currency}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.costType")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="costType"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: t("projectScreen.Modal.chooseCostType"),
                            },
                          ]}
                        >
                          <Select
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder={t(
                              "projectScreen.Modal.selectCostType"
                            )}
                            onChange={(value) => setCostType(value)}
                          >
                            <Select.Option value="Hourly">
                              {t("projectScreen.Modal.hourly")}
                            </Select.Option>
                            <Select.Option value="Monthly">
                              {t("projectScreen.Modal.monthly")}
                            </Select.Option>
                            <Select.Option value="Fixed">
                              {t("projectScreen.Modal.fixed")}
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  {costType === 'Fixed' && (
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.cost")}</label>

                      <Form.Item
                        name="cost"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t("projectScreen.Modal.pleaseEnterCost"),
                          },
                        ]}
                      >
                        {/* <Input type="number" className="form-control" /> */}
                        <InputNumber
                          className="form-control"
                          formatter={(value) => {
                            return `${value}`.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            );
                          }}
                          parser={(value) => {
                            return value.replace(/\$\s?|(,*)/g, "");
                          }}
                          onChange={(value) => handleCostChange(value)}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  )}
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.priority")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="priority"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: t("projectScreen.Modal.choosePriority"),
                            },
                          ]}
                        >
                          <Select
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder={t(
                              "projectScreen.Modal.choosepriority"
                            )}
                          >
                            <Select.Option value="High Priority">
                              {t("projectScreen.Modal.highPriority")}
                            </Select.Option>
                            <Select.Option value="Normal Priority">
                              {t("projectScreen.Modal.normalPriority")}
                            </Select.Option>
                            <Select.Option value="Low Priority">
                              {t("projectScreen.Modal.lowPriority")}
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.leader")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="projectLead"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: t("projectScreen.Modal.selectLeader"),
                            },
                          ]}
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
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder={t("projectScreen.Modal.selectleader")}
                            onChange={(value) => setSelectedLeader(value)}
                          >
                            {employees?.map((employee) => (
                              <Select.Option
                                key={employee._id}
                                value={employee._id}
                              >
                                {employee.fullName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.teamLeader")}</label>
                      <div className="project-members">
                        {selectedLeader && (
                          <a
                            data-bs-toggle="tooltip"
                            title={getEmployeeFullName(selectedLeader)}
                            className="avatar"
                          >
                            <img
                              src={
                                getEmployeeImage(selectedLeader) || user_icon
                              }
                              alt=""
                            />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.addTeam")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="assignedDevelopers"
                          className="addTeamHeight"
                          rules={[
                            {
                              required: true,
                              message: t(
                                "projectScreen.Modal.teamCannotBeEmpty"
                              ),
                            },
                          ]}
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
                                  title={getEmployeeFullName(teamMember)}
                                >
                                  <Avatar
                                    style={{ cursor: "pointer" }}
                                    src={
                                      getEmployeeImage(teamMember) || user_icon
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
                                          title={getEmployeeFullName(
                                            teamMember
                                          )}
                                        >
                                          <Avatar
                                            src={
                                              getEmployeeImage(teamMember) ||
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

                <div className="form-group">
                  <label>{t("projectScreen.Modal.description")}</label>
                  <Form.Item
                    name="projectDescription"
                    rules={[
                      {
                        required: true,
                        message: t(
                          "projectScreen.Modal.enterProjectDescription"
                        ),
                      },
                    ]}
                  >
                    <Input.TextArea className="form-control" rows={5} />
                  </Form.Item>
                  {/* <textarea rows={4} className="form-control summernote" placeholder="Enter your message here" defaultValue={""} /> */}
                </div>

                {(costType === 'Hourly' || costType === 'Monthly') && projectType === "Billed" && (
                <>
                <hr
                  className="developer-dividerdddd"
                  style={{ opacity: "0", marginTop: "0px" }}
                />
                <div className="table-responsive">
                  <Table
                    dataSource={teamCost}
                    columns={teamColumns}
                    rowKey={(record, index) => index}
                    pagination={false}
                    //style={{ overflowX: "auto" }}
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
                  />
                </div>
                <hr
                  className="developer-dividerdddd"
                  style={{ opacity: "0", marginTop: "0px" }}
                />
                </>
                )}

                <div className="form-group">
                  <label>
                    {t("projectScreen.Modal.uploadFiles")}{" "}
                    <small style={{ color: "grey", fontSize: "small" }}>
                      ({t("projectScreen.Modal.allowedFormats")})
                    </small>
                  </label>
                  <input
                    className="form-control"
                    multiple
                    onChange={(e) => {
                      onFileUpload(e.target.files, "normal");
                    }}
                    type="file"
                  />
                </div>
                <div className="selected-files">
                  {displaySelectedFiles("normal")}
                </div>
                <hr
                  className="developer-divider"
                  style={{ opacity: "0", marginTop: "0px" }}
                />
                <hr
                  className="developer-divider"
                  style={{ opacity: "0", marginTop: "0px" }}
                />
                {(role === "admin" ||
                  (permissions?.projectManagement &&
                    permissions?.managePayrolls)) && (
                  <>
                    <div className="form-group">
                      <label>
                        Admin Files{" "}
                        <small style={{ color: "grey", fontSize: "small" }}>
                          ({t("projectScreen.Modal.allowedFormats")})
                        </small>
                        <span
                          className="badge badge-pill bg-custom float-end"
                          style={{ marginLeft: "10px" }}
                        >
                          ADMIN
                        </span>
                      </label>
                      <input
                        className="form-control"
                        multiple
                        onChange={(e) => {
                          onFileUpload(e.target.files, "admin");
                        }}
                        type="file"
                      />
                    </div>
                    <div className="selected-files">
                      {displaySelectedFiles("admin")}
                    </div>
                    <hr
                      className="developer-divider"
                      style={{ opacity: "0", marginTop: "0px" }}
                    />
                    <hr
                      className="developer-divider"
                      style={{ opacity: "0", marginTop: "0px" }}
                    />
                  </>
                )}
                {projectType === "Billed" && costType === "Fixed" && (
                  <>
                    <h4
                      style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                      }}
                    >
                      {t("projectScreen.Modal.paymentSchedules")}
                    </h4>
                    <hr
                      className="developer-dividerdddd"
                      style={{ opacity: "0", marginTop: "0px" }}
                    />
                    <div className="table-responsive">
                      <Table
                        dataSource={paymentSchedules}
                        columns={paymentColumns}
                        rowKey={(record, index) => index}
                        pagination={false}
                        style={{ overflowX: "auto", height: "320px" }}
                        components={
                          i18n.dir() === "rtl"
                            ? {
                                header: {
                                  cell: ({ children }) => (
                                    <th style={{ textAlign: "right" }}>
                                      {children}
                                    </th>
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

                    <div className="submit-section">
                      <Form.Item>
                        <Button
                          type="primary"
                          onClick={addPaymentSchedule}
                          className="btn btn-primary submit-btn btn-add"
                          style={{
                            fontSize: "14px",
                            minWidth: "30px",
                            height: "39px",
                            lineHeight: "0px",
                          }}
                        >
                          <i className="fa fa-plus m-r-5" />
                          {t("projectScreen.Modal.addMorePayments")}
                        </Button>
                      </Form.Item>
                      <hr />
                    </div>
                  </>
                )}

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
                form={form}
                onFinish={(val) => UpdateProject(val, selectedData)}
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
                name="control-hooks"
              >
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.projectName")}</label>
                      <Form.Item
                        name="projectName"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t("projectScreen.Modal.enterProjectName"),
                          },
                        ]}
                      >
                        <Input
                          className="form-control"
                          placeholder={t(
                            "projectScreen.Modal.enterprojectName"
                          )}
                          maxLength={50}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.client")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="clientId"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: t("projectScreen.Modal.chooseClient"),
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            onSearch={(val) => {
                              showTeamSearch(val, "client");
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
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder={t("projectScreen.Modal.selectClient")}
                            onChange={(value) => {
                              // Set the selected client when it changes
                              setSelectedClient(value);

                              form.setFieldsValue({ focalPersonId: null });
                              // Fetch the focal persons based on the selected client
                              fetchFocalPersons(value);
                            }}
                          >
                            {clients?.map((client) => (
                              <Select.Option
                                key={client._id}
                                value={client._id}
                              >
                                {client.clientName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.focalPerson")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="focalPersonId"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: t(
                                "projectScreen.Modal.selectFocalPerson"
                              ),
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            onSearch={(val) => {
                              showTeamSearch(val, "focal");
                              // onTeamChange(val)
                            }}
                            filterOption={(input, option) =>
                              option.children[0]
                                .toLowerCase()
                                .indexOf(input.toLowerCase()) >= 0
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
                            placeholder={t(
                              "projectScreen.Modal.selectfocalPerson"
                            )}
                          >
                            {focalPersons?.map((focalPerson) => (
                              <Select.Option
                                key={focalPerson._id}
                                value={focalPerson._id}
                              >
                                {focalPerson?.focalPersonName}{" "}
                                {/* Adjust the field name as needed */}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.projectStatus")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="status"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: t("projectScreen.Modal.chooseStatus"),
                            },
                          ]}
                        >
                          <Select
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder={t("projectScreen.Modal.selectStatus")}
                          >
                            <Select.Option value="Paused">
                              {t("projectScreen.Modal.paused")}
                            </Select.Option>
                            <Select.Option value="Scheduled">
                              {t("projectScreen.Modal.scheduled")}
                            </Select.Option>
                            <Select.Option value="On-Going">
                              {t("projectScreen.Modal.onGoing")}
                            </Select.Option>
                            <Select.Option value="Archived">
                              {t("projectScreen.Modal.archived")}
                            </Select.Option>
                            <Select.Option value="Completed">
                              {t("projectScreen.Modal.completed")}
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.startDate")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="startDate"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: t("projectScreen.Modal.enterStartDate"),
                            },
                          ]}
                        >
                          <DatePicker
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            style={{ width: "100%" }}
                            className="form-control"
                            placeholder={t("requests.addModal.selectDate")}
                            size="large"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.endDate")}</label>
                      <div style={{ position: "relative" }} id="area">
                        {/* <Form.Item
                          name="endDate"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: "Enter an end date",
                            },
                          ]}
                        >
                          <DatePicker
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            style={{ width: "100%" }}
                            className="form-control"
                            size="large"
                          />
                        </Form.Item> */}

                        <Form.Item
                          name="endDate"
                          rules={[
                            {
                              required: true,
                              message: t("projectScreen.Modal.enterEndDate"),
                            },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                // Ensure that the end date is not before the start date
                                const startDate = getFieldValue("startDate");
                                if (!startDate || !value) {
                                  // If either date is not selected, do not perform validation
                                  return Promise.resolve();
                                }
                                if (
                                  !value.isSame(startDate, "day") &&
                                  value.isSameOrAfter(startDate)
                                ) {
                                  // End date is valid
                                  return Promise.resolve();
                                }
                                return Promise.reject(
                                  t(
                                    "projectScreen.errors.endDateMustNotBeBeforeStartDate"
                                  )
                                );
                              },
                            }),
                          ]}
                          className="custom-border"
                        >
                          <DatePicker
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            style={{ width: "100%" }}
                            className="form-control"
                            placeholder={t("requests.addModal.selectDate")}
                            size="large"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.domain")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="projectDomain"
                          className="addTeamHeight"
                          rules={[
                            {
                              required: true,
                              message: t(
                                "projectScreen.Modal.domainCannotBeEmpty"
                              ),
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            onSearch={(val) => {
                              showTeamSearch(val, "domain");
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
                            placeholder={t("projectScreen.Modal.selectDomain")}
                          >
                            {allDomain?.map((domain) => (
                              <Select.Option
                                key={domain._id}
                                value={domain._id}
                              >
                                {domain.teamName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.priority")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="priority"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: t("projectScreen.Modal.choosePriority"),
                            },
                          ]}
                        >
                          <Select
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder={t(
                              "projectScreen.Modal.choosepriority"
                            )}
                          >
                            <Select.Option value="High Priority">
                              {t("projectScreen.Modal.highPriority")}
                            </Select.Option>
                            <Select.Option value="Normal Priority">
                              {t("projectScreen.Modal.normalPriority")}
                            </Select.Option>
                            <Select.Option value="Low Priority">
                              {t("projectScreen.Modal.lowPriority")}
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.leader")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="projectLead"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: t("projectScreen.Modal.selectLeader"),
                            },
                          ]}
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
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder={t("projectScreen.Modal.selectleader")}
                            onChange={(value) => setSelectedLeader(value)}
                          >
                            {employees?.map((employee) => (
                              <Select.Option
                                key={employee._id}
                                value={employee._id}
                              >
                                {employee.fullName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.teamLeader")}</label>
                      <div className="project-members">
                        {selectedLeader && (
                          <a
                            data-bs-toggle="tooltip"
                            title={getEmployeeFullName(selectedLeader)}
                            className="avatar"
                          >
                            <img
                              src={
                                getEmployeeImage(selectedLeader) || user_icon
                              }
                              alt=""
                            />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>{t("projectScreen.Modal.addTeam")}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="assignedDevelopers"
                          className="addTeamHeight"
                          rules={[
                            {
                              required: true,
                              message: t(
                                "projectScreen.Modal.teamCannotBeEmpty"
                              ),
                            },
                          ]}
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
                            placeholder={t('projectScreen.Modal.selectTeamMembers')}
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
                                  title={getEmployeeFullName(teamMember)}
                                >
                                  <Avatar
                                    style={{ cursor: "pointer" }}
                                    src={
                                      getEmployeeImage(teamMember) || user_icon
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
                                          title={getEmployeeFullName(
                                            teamMember
                                          )}
                                        >
                                          <Avatar
                                            src={
                                              getEmployeeImage(teamMember) ||
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

                <div className="form-group">
                  <label>{t("projectScreen.Modal.description")}</label>
                  <Form.Item
                    name="projectDescription"
                    rules={[
                      {
                        required: true,
                        message: t(
                          "projectScreen.Modal.enterProjectDescription"
                        ),
                      },
                    ]}
                  >
                    <Input.TextArea className="form-control" rows={5} />
                  </Form.Item>
                  {/* <textarea rows={4} className="form-control summernote" placeholder="Enter your message here" defaultValue={""} /> */}
                </div>

                <div className="form-group">
                  <label>
                    {t("projectScreen.Modal.uploadFiles")}{" "}
                    <small style={{ color: "grey", fontSize: "small" }}>
                      ({t("projectScreen.Modal.allowedFormats")})
                    </small>
                  </label>
                  <input
                    className="form-control"
                    multiple
                    onChange={(e) => {
                      onFileUpload(e.target.files, "normal");
                    }}
                    type="file"
                  />
                </div>
                <div className="selected-files">
                  {displaySelectedFiles("normal")}
                </div>

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
  );
}

export default EditProjects;
