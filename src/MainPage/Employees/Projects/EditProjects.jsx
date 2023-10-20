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

function EditProjects({ data, editModal, closeEditModal, getprojects, getlistprojects, allCurrencies, allDomain }) {
  const [form] = Form.useForm();

  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role;

  const [selectedData, setSelectedData] = useState(null);
  // const [allDomain, setAllDomain] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [focalPersons, setFocalPersons] = useState([]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [selectedDevelopers, setSelectedDevelopers] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loader, setLoader] = useState(false);

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
    setSelectedLeader(data?.projectLead);
    setSelectedTeamMembers(data?.assignedDevelopers);
    setSelectedData(data);
    fetchFocalPersons(data?.clientId);
    setSelectedFiles(data?.docs);
    setUploadFiles(data?.docs);
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

  const getAllDomain = () => {
    apiServices("GET", "team/view-team", null, user_state)
    .then((res) => {
      // console.log(res?.data);
      if (res?.data?.success === true) {
        // setAllDomain(res?.data?.Team);
        const all_domains = res?.data?.Team;
        const sortedData = all_domains.slice().sort((a, b) => a.teamName.localeCompare(b.teamName));
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
            : "Get Domain Info Error"
        }!`
      );
    });
  }

  const fetchEmployees = () => {
    apiServices("GET", `user/all-employees`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const emps = res?.data?.User;
          const sortedData = emps.slice().sort((a, b) => a.fullName.localeCompare(b.fullName));
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
              : "Get All Employees Error"
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
          const sortedData = clients.slice().sort((a, b) => a.clientName.localeCompare(b.clientName));
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
              : "Get Client Error"
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
          const sortedData = focalperson.slice().sort((a, b) => a.focalPersonName.localeCompare(b.focalPersonName));
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

  const UpdateProject = (values) => {
    setLoader(true);
    //setIsLoading(true);

    let data = {
      _id: selectedData._id,
      projectName: values.projectName,
      projectDescription: values.projectDescription,
      clientId: values.clientId,
      focalPersonId: values.focalPersonId,
      startDate: moment(values.startDate).format("YYYY-MM-DD"),
      endDate: moment(values.endDate).format("YYYY-MM-DD"),
      projectDomain: values.projectDomain,
      currency: values.currency,
      cost: values.cost,
      costType: values.costType,
      priority: values.priority,
      projectLead: values.projectLead,
      assignedDevelopers: values.assignedDevelopers,
      status: values.status,
      docs: uploadFiles,
      paymentSchedule: values?.paymentSchedule,
      deleted: false,
      companyId: selectedData.companyId,
    };

    apiServices("PUT", `project-management/`, data, user_state)
      .then((res) => {
        if (res.data.success === true) {
          message.success(`Project Details Updated Successfully`);
          getprojects();
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
              : "Error Updating Project Details"
          }`
        );
      })
      .finally(() => {
        closeEditModal();
        setLoader(false);
      });
  };

  const acceptableFormats = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "gif", "xls", "xlsx"];

  
  const onFileUpload = async (files) => {
    const uploadPromises = [];
    const validFiles = []; // To store valid files
  
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log("File: ", file);
  
      // Check file format (extension)
      const fileExtension = file.name.split(".").pop().toLowerCase();
      if (!acceptableFormats.includes(fileExtension)) {
        message.error(`File format not supported: ${file.name}`);
        continue; // Skip this file and continue with the next one
      }
  
      // Check file size
      if (file.size > 10485760) {
        message.error(`File size exceeds 10MB: ${file.name}`);
        continue; // Skip this file and continue with the next one
      }
  
      validFiles.push(file); // Add valid files to the array
  
      const uploadPromise = apiUploadToS3(file)
        .then((res) => {
          console.log(res?.data?.result);
          return res?.data?.result;
        })
        .catch((err) => {
          message.error(`File upload error: ${file.name}`);
        });
      uploadPromises.push(uploadPromise);
    }
  
    // Add valid files to selectedFiles
    setSelectedFiles((prevSelectedFiles) => [...prevSelectedFiles, ...validFiles]);
  
    try {
      // Wait for all upload promises to resolve
      const urls = await Promise.all(uploadPromises);
      console.log("these are ",urls)
      // Add the uploaded URLs to the uploadFiles state array
      setUploadFiles((prevUploadFiles) => [...prevUploadFiles, ...urls]);
      e.target.files = null;
    } catch (error) {
      // Handle any errors that occurred during file uploads
      console.error("File upload error:", error);
    }
  };

  const removeSelectedFile = (index) => {
    const updatedSelectedFiles = [...selectedFiles];
    updatedSelectedFiles.splice(index, 1);
    setSelectedFiles(updatedSelectedFiles);

    // Remove the corresponding file from the uploadFiles state array
    const updatedUploadFiles = [...uploadFiles];
    updatedUploadFiles.splice(index, 1);
    setUploadFiles(updatedUploadFiles);
  };

  const openCloudinaryLink = (url) => {
    // Open the Cloudinary link in a new tab
    window.open(url, "_blank");
  };

  const generateCustomFileName = (fileUrl, index) => {
    // Extract the file extension from the URL
    const fileExtension = fileUrl?.split(".").pop();
    return `File ${index + 1}.${fileExtension}`;
  };

  //   const displaySelectedFiles = () => {
  //     return selectedFiles.map((file, index) => (
  //       <div key={index} className="selected-file">
  //         <span>{file.name || generateCustomFileName(file, index)}</span>
  //         <button type="button" onClick={() => removeSelectedFile(index)}>
  //           &times;
  //         </button>
  //       </div>
  //     ));
  //   };

  const displaySelectedFiles = () => {
    return selectedFiles?.map((file, index) => (
      <Space key={index}>
        <Tag
          closable
          onClose={() => removeSelectedFile(index)}
          color="blue" // You can customize the color as needed
          className="custom-tag"
        >
          {file.name || generateCustomFileName(file, index)}
        </Tag>
      </Space>
    ));
  };

  //   const onFileUpload = (file) =>{
  //     console.log("hello",file)
  //     apiUploadToS3(imagedata).then((res) => {
  //         console.log(res?.data?.result);
  //         form.setFieldsValue({imageUrl: res?.data?.result})
  //         setImage(res?.data?.result)
  //         setImageLoader(false)
  //       }
  //       ).catch((err)=>{
  //         setImageLoader(false)
  //         message.error(
  //             `${
  //               err?.response?.data?.msg
  //                 ? err?.response?.data?.msg
  //                 : err?.response?.data?.validation?.body?.message
  //                 ? err?.response?.data?.validation?.body?.message
  //                 : "upload image Error"
  //             }!`
  //           );
  //       })
  //   }

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
        color: "#fff",
      }}
      spin
    />
  );

  const paymentColumns = [
    {
      title: "Payment Title",
      dataIndex: "paymentTitle",
      key: "paymentTitle",
      render: (text, record, index) => (
        <Form.Item
          name={["paymentSchedule", index, "paymentTitle"]}
          className="custom-border"
          rules={[
            {
              required: true,
              message: "Enter a Payment Title",
            },
          ]}
        >
          <Input className="form-control" />
        </Form.Item>
      ),
    },
    {
      title: "Amount in Figure",
      dataIndex: "amountInFigure",
      key: "amountInFigure",
      render: (text, record, index) => (
        <Form.Item
          name={["paymentSchedule", index, "amountInFigure"]}
          className="custom-border"
          rules={[
            {
              required: true,
              message: "Please enter the amount in figure.",
            },
          ]}
        >
          {/* <Input type="number" className="form-control" /> */}
          <InputNumber
            className="form-control"
            formatter={(value) => {
              return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }}
            parser={(value) => {
              return value.replace(/\$\s?|(,*)/g, '');
            }}
          />
        </Form.Item>
      ),
    },
    {
      title: "Amount in Percent",
      dataIndex: "amountInPercent",
      key: "amountInPercent",
      render: (text, record, index) => (
        <Form.Item
          name={["paymentSchedule", index, "amountInPercent"]}
          className="custom-border"
          rules={[
            {
              required: true,
              message: "Please enter the amount in percentage.",
            },
          ]}
        >
          {/* <Input type="number" className="form-control" /> */}
          <InputNumber
            className="form-control"
            max={100}
            min={0}
          />
        </Form.Item>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (text, record, index) => (
        <div style={{ position: "relative" }} id={`dueDate-${index}`}>
          <Form.Item
            name={["paymentSchedule", index, "dueDate"]}
            rules={[
              {
                required: true,
                message: "Select a due date",
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
              className="form-control"
              size="large"
            />
          </Form.Item>
        </div>
      ),
    },
    {
      title: "Paid",
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
      title: "Action",
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
    let dropdownValues = []
    if(type === 'Team'){
      employees.forEach((team)=>{
          dropdownValues.push(team.fullName.toLowerCase())
       })
    }else if (type === 'client'){
      clients.forEach((client)=>{
        dropdownValues.push(client.clientName.toLowerCase())
     })
    }else if (type === 'focal'){
      focalPersons.forEach((focal)=>{
        dropdownValues.push(focal.focalPersonName.toLowerCase())
     })
    }else if (type === 'domain'){
      allDomain.forEach((dom)=>{
        dropdownValues.push(dom.teamName.toLowerCase())
     })
    }

    if(val !== ''){
      dropdownValues.some((team) => {
        if(team.includes(val.toLowerCase())){
          // setNoData(false);
          return true
        }else{
          // setNoData(true);
        }
      })
    }else{
      // setNoData(false)
    }
  }

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
            <h5 className="modal-title">Edit Details</h5>

            <button type="button" className="close" onClick={closeEditModal}>
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div className="modal-body">
            <Form
              form={form}
              onFinish={UpdateProject}
              onFinishFailed={({ errorFields }) => {
                const consecutiveSpacesError = errorFields.find((field) =>
                  field.errors.toString().includes("consecutive spaces")
                );
                if (consecutiveSpacesError) {
                  message.error("Please Remove Consecutive Spaces!");
                } else {
                  message.error("Please Fill Required Fields!");
                }
              }}
              name="control-hooks"
            >
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Project Name</label>
                    <Form.Item
                      name="projectName"
                      className="custom-border"
                      rules={[
                        {
                          required: true,
                          message: "Enter the Project Name.",
                        },
                      ]}
                    >
                      <Input
                        className="form-control"
                        placeholder="Enter Project Name"
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Client</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="clientId"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Choose a Client.",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          onSearch={(val) => {
                            showTeamSearch(val, 'client')
                            // onTeamChange(val)
                          }}
                          filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                          optionFilterProp="children"
                          notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                          dropdownRender={(menu) => (
                            <>
                              {menu}
                            </>
                          )}

                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder="Select a Client"
                          onChange={(value) => {
                            // Set the selected client when it changes
                            setSelectedClient(value);

                            form.setFieldsValue({ focalPersonId: null });
                            // Fetch the focal persons based on the selected client
                            fetchFocalPersons(value);
                          }}
                        >
                          {clients?.map((client) => (
                            <Select.Option key={client._id} value={client._id}>
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
                    <label>Focal Person</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="focalPersonId"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Select a Focal Person",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          onSearch={(val) => {
                            showTeamSearch(val, 'focal')
                            // onTeamChange(val)
                          }}
                          filterOption={(input, option) => option.children[0].toLowerCase().indexOf(input.toLowerCase()) >= 0}
                          optionFilterProp="children"
                          notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                          dropdownRender={(menu) => (
                            <>
                              {menu}
                            </>
                          )}

                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder="Select a Focal Person"
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
                    <label>Project Status</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="status"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Choose a status",
                          },
                        ]}
                      >
                        <Select
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder="Select a Status"
                        >
                          <Select.Option value="Paused">Paused</Select.Option>
                          <Select.Option value="Scheduled">
                            Scheduled
                          </Select.Option>
                          <Select.Option value="On-Going">
                                On-Going
                          </Select.Option>
                          <Select.Option value="Archived">
                            Archived
                          </Select.Option>
                          <Select.Option value="Completed">
                            Completed
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
                    <label>Start Date</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="startDate"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Enter a start date",
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
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>End Date</label>
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
                            message: "Enter an end date",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              // Ensure that the end date is not before the start date
                              const startDate = getFieldValue('startDate');
                              if (!startDate || !value) {
                                // If either date is not selected, do not perform validation
                                return Promise.resolve();
                              }
                              if (!value.isSame(startDate, 'day') && value.isSameOrAfter(startDate)) {
                                // End date is valid
                                return Promise.resolve();
                              }
                              return Promise.reject('End date must not be before or same as start date');
                            },
                          }),
                        ]}
                        className="custom-border"
                      >
                        <DatePicker
                          getPopupContainer={() => document.getElementById("area")}
                          style={{ width: "100%" }}
                          className="form-control"
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
                    <label>Domain</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="projectDomain"
                        className="addTeamHeight"
                        rules={[
                          {
                            required: true,
                            message: "Domain cannot be empty",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          onSearch={(val) => {
                            showTeamSearch(val, 'domain')
                          }}
                          filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                          optionFilterProp="children"
                          notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                          dropdownRender={(menu) => (
                            <>
                              {menu}
                            </>
                          )}

                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          className="customselect-height custom-select"
                          mode="multiple"
                          placeholder="Select Domain"
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
                    <label>Currency</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="currency"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Choose a currency",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder="Select Currency"
                        >
                          {
                            allCurrencies.map((currency, index) => (
                              <Select.Option key={index} value={currency?.currency}>
                                {currency?.currency}
                              </Select.Option>
                            ))
                          }
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                </div>

                <div className="col-sm-3">
                  <div className="form-group">
                    <label>Cost</label>

                    <Form.Item
                      name="cost"
                      className="custom-border"
                      rules={[
                        {
                          required: true,
                          message: "Please enter the cost.",
                        },
                      ]}
                    >
                      {/* <Input type="number" className="form-control" /> */}
                      <InputNumber
                        className="form-control"
                        formatter={(value) => {
                          return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                        }}
                        parser={(value) => {
                          return value.replace(/\$\s?|(,*)/g, '');
                        }}
                      />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="form-group">
                    <label>Cost Type</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="costType"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Choose a cost type",
                          },
                        ]}
                      >
                        <Select
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder="Select a Cost Type"
                        >
                          <Select.Option value="Hourly">Hourly</Select.Option>
                          <Select.Option value="Fixed">Fixed</Select.Option>
                          <Select.Option value="Monthly">Monthly</Select.Option>
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Priority</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="priority"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Choose a priority",
                          },
                        ]}
                      >
                        <Select
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder="Choose a Priority"
                        >
                          <Select.Option value="High Priority">
                            High Priority
                          </Select.Option>
                          <Select.Option value="Normal Priority">
                            Normal Priority
                          </Select.Option>
                          <Select.Option value="Low Priority">
                            Low Priority
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
                    <label>Leader</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="projectLead"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Select a Leader",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          onSearch={(val) => {
                            showTeamSearch(val, 'Team')
                            // onTeamChange(val)
                          }}
                          filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                          optionFilterProp="children"
                          notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                          dropdownRender={(menu) => (
                            <>
                              {menu}
                            </>
                          )}

                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder="Select a Leader"
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
                    <label>Team Leader</label>
                    <div className="project-members">
                      {selectedLeader && (
                        <a
                          data-bs-toggle="tooltip"
                          title={getEmployeeFullName(selectedLeader)}
                          className="avatar"
                        >
                          <img
                            src={getEmployeeImage(selectedLeader) || user_icon}
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
                    <label>Add Team</label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="assignedDevelopers"
                        className="addTeamHeight"
                        rules={[
                          {
                            required: true,
                            message: "Team cannot be empty",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          onSearch={(val) => {
                            showTeamSearch(val, 'Team')
                            // onTeamChange(val)
                          }}
                          filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                          optionFilterProp="children"
                          notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                          dropdownRender={(menu) => (
                            <>
                              {menu}
                            </>
                          )}

                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          className="customselect-height custom-select"
                          mode="multiple"
                          placeholder="Select Team Members"
                          onChange={(values) => setSelectedTeamMembers(values)}
                        >
                          {getTeamMemberOptions()}
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>Team Members</label>
                    <div className="project-members">
                      {selectedTeamMembers?.slice(0, 4).map((teamMember) => (
                        <a
                          key={teamMember}
                          data-bs-toggle="tooltip"
                          title={getEmployeeFullName(teamMember)}
                          className="avatar"
                        >
                          <img
                            src={getEmployeeImage(teamMember) || user_icon}
                            alt=""
                          />
                        </a>
                      ))}
                      {selectedTeamMembers?.length > 4 && (
                        <span className="all-team">
                          +{selectedTeamMembers?.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <Form.Item
                  name="projectDescription"
                  rules={[
                    {
                      required: true,
                      message: "Enter a Project Description",
                    },
                  ]}
                >
                  <Input.TextArea className="form-control" rows={5} />
                </Form.Item>
                {/* <textarea rows={4} className="form-control summernote" placeholder="Enter your message here" defaultValue={""} /> */}
              </div>

              <div className="form-group">
                <label>Upload Files</label>
                <input
                  className="form-control"
                  multiple
                  onChange={(e) => {
                    onFileUpload(e.target.files);
                  }}
                  type="file"
                />
              </div>
              <div className="selected-files">{displaySelectedFiles()}</div>
              <hr
                className="developer-divider"
                style={{ opacity: "0", marginTop: "0px" }}
              />
              <hr
                className="developer-divider"
                style={{ opacity: "0", marginTop: "0px" }}
              />

              <h4
                style={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                }}
              >
                Payment Schedules
              </h4>
              <hr
                className="developer-divider"
                style={{ opacity: "0", marginTop: "0px" }}
              />
              <div className="table-responsive">
                <Table
                  dataSource={paymentSchedules}
                  columns={paymentColumns}
                  rowKey={(record, index) => index}
                  pagination={false}
                  style={{ overflowX: "auto" }}
                />
              </div>

              <div className="submit-section">
                <Form.Item>
                  <Button type="primary" onClick={addPaymentSchedule} className="btn btn-primary submit-btn btn-add" style={{fontSize: '14px', minWidth: '30px', height: '39px', lineHeight: '0px'}}>
                    <i className="fa fa-plus m-r-5" />
                    Add More Payments
                  </Button>
                </Form.Item>
                <hr />
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
  );
}

export default EditProjects;
