import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Avatar,
  Button,
  Checkbox,
  DatePicker,
  Empty,
  Form,
  Input,
  Divider,
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
import PlusOutlined from "@mui/icons-material/Add";
import { getAllISOCodes } from "iso-country-currency";
import moment from "moment";
import { DeleteOutlined, LoadingOutlined, MinusCircleFilled } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { acceptableFormats } from "./Projects/EditProjects";
import { apiServices } from "../../Services/apiServices";
import { DeleteFiles, uploadFunction } from "./Projects/UploadAndDeleteFunc";

function ReachOutModal({ openModal, closeModal, data, leadId, viewLeads, viewFiles }) {
  const nav = useNavigate();
  const [form] = Form.useForm();
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role;

  const [loader, setLoader] = useState(false);
  const [fileFlag, setFileFlag] = useState(false);
  const [employees, setEmployees] = useState([]);

  const [filesToDelete, setFilesToDelete] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [mediumOptions, setMediumOptions] = useState([]);  
  const [open1, setOpen1] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMedium, setSelectedMedium] = useState(null);

  useEffect(() => {      
    fetchEmployees();
    viewMediums();
    console.log("EDIT MODAL");
    if (data) {
      console.log("data",data)
      form.setFieldsValue({
        ...data,        
        date: moment(data?.date, "YYYY-MM-DD"),
        communicatedBy: data?.communicatedBy?._id,
        communicationMedium: data?.communicationMedium?._id,
      });
    }
  }, []);

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

  const showTeamSearch = (val, type) => {
    let dropdownValues = [];
    if (type === "Team") {
      employees.forEach((team) => {
        dropdownValues.push(team.fullName.toLowerCase());
      });
    } else if (type === "medium") {
      mediumOptions.forEach((medium) => {
        dropdownValues.push(medium?.title?.toLowerCase());
      });
    }

    if (val !== "") {
      dropdownValues.some((team) => {
        if (team?.includes(val?.toLowerCase())) {
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

  const handleAddReachout = async (val, existing) => {
    setLoader(true);

    if (existing) {
      const updatedData = {
        reachOut: {
          ...val,
          date: moment(val.date).format("YYYY-MM-DD"),
          _id: existing?._id,
        },
        leadId: leadId,
      };
      apiServices("PUT", "leads/editReachOut", updatedData, user_state)
        .then((res) => {
          if (res.data.success === true) {
            message.success('Reachout Record Updated Successfully');
            viewLeads();
            closeModal();
            setLoader(false);
          }
        })
        .catch((error) => {
          console.log("error", error);
          message.error('Error updating Reachout');
          setLoader(false);
        })
    }
    else {
      const updatedData = {
        reachOut: {
          ...val,
          date: moment(val.date).format("YYYY-MM-DD"),
        },
        leadId: leadId,
      };
      apiServices("PUT", "leads/addReachOut", updatedData, user_state)
        .then((res) => {
          if (res.data.success === true) {
            message.success('Reachout Record Added Successfully');
            viewLeads();
            closeModal();
            setLoader(false);
          }
        })
        .catch((error) => {
          console.log("error", error);
          message.error('Error Adding Reachout');
          setLoader(false);
        })
    }
  };

  const handleOk = () => {
    setLoader(true);
    if (selectedMedium) {
      apiServices("DELETE", "leads/delete-medium", selectedMedium?._id, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          message.success('Option removed Successfully');
          setMediumOptions(prevOptions => prevOptions.filter(proj=> proj._id !== selectedMedium?._id))
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
              : 'Error Deleting Option'
          }!`
        );
        setLoader(false);
      });
    }
    handleCancel();
  };

  const viewMediums = () => {
    apiServices("GET", `leads/view-medium`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const mediums = res?.data?.Mediums;
          setMediumOptions(mediums);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error getting Medium options"
          }`
        );
      });
  };

  const handleAddMedium = (values) => {
    setLoader(true);
    let data = {
      title: values
    }
      apiServices("POST", "leads/add-medium", data, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            setMediumOptions([
                ...mediumOptions,
                {
                    title: values,
                    _id: res?.data?.Medium?._id,
                }
            ])
            //message.success('Medium added successfully');
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
                : 'error adding medium'
            }!`
          );
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

  return (
    <>
      <Modal
        open={openModal}
        onClose={closeModal}
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
          className="modal-dialog modal-dialog-centered modal-md"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {data ? t("holiday.update") : t("holiday.add")} Reach Out
              </h5>

              <button type="button" className="close" onClick={closeModal}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                form={form}
                onFinish={(val) => handleAddReachout(val, data)}
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
                      <label>Reach Out Date{" "}
                      <span className="text-danger">*</span></label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="date"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: "Enter a reach out date",
                            },
                          ]}
                        >
                          <DatePicker
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            style={{ width: "100%" }}
                            className="form-control"
                            placeholder="Enter reach-out date"
                            size="large"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Communication Medium{" "}
                      <span className="text-danger">*</span></label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="communicationMedium"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: "Choose a communication medium",
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            onSearch={(val) => {
                              setSearchValue(val);
                              showTeamSearch(val, "medium");
                              // onTeamChange(val)
                            }}
                            filterOption={(input, option) =>
                              option.children[0]
                                ?.toLowerCase()
                                ?.indexOf(input?.toLowerCase()) >= 0
                            }
                            optionFilterProp="children"
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            notFoundContent={<></>}
                            dropdownRender={(menu) => (
                              <>
                                {menu}
                                {searchValue && !mediumOptions?.some(option => option?.title?.toLowerCase() === searchValue?.toLowerCase()) && (
                                  <>
                                    <Divider style={{ margin: "5px 0" }} />
                                    <Button
                                      type="button"
                                      icon={
                                        <PlusOutlined style={{ fontSize: "20px", marginRight: "5px" }} />
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
                                      }}
                                      onClick={() => handleAddMedium(searchValue)}
                                    >
                                      {`Add "${searchValue}"`}
                                    </Button>
                                  </>
                                )}
                                {/* {
                                  <>
                                    <Divider
                                      style={{
                                        margin: "5px 0",
                                      }}
                                    />
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
                                      }}
                                      onClick={() => setAddMedium(true)}
                                    >
                                      Add Medium
                                    </Button>
                                  </>
                                } */}
                              </>
                            )}
                            style={{
                              width: "100%",
                            }}
                            placeholder="Select a medium"
                            onDropdownVisibleChange={(open) => setOpen1(open)}
                          >
                            {mediumOptions?.map((item, index) => {
                              return (
                                <Option key={index} value={item?._id}>
                                  {item?.title}
                                  {open1 && item?._id !== form.getFieldValue('communicationMedium') && (
                                    <span style={{ float: "right" }}>
                                      <DeleteOutlined
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedMedium(item);
                                          setIsModalVisible(true);
                                        }}
                                      />
                                    </span>
                                  )}
                                </Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Communicated By{" "}
                      <span className="text-danger">*</span></label>
                      <Form.Item
                        name="communicatedBy"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Select a communication person",
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
                                ?.toLowerCase()
                                ?.indexOf(input?.toLowerCase()) >= 0
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
                            placeholder="Select a personnel"
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

                  <div className="form-group">
                    <label>Comments</label>
                    <Form.Item name="comments">
                      <Input.TextArea className="form-control" rows={5} />
                    </Form.Item>
                    {/* <textarea rows={4} className="form-control summernote" placeholder="Enter your message here" defaultValue={""} /> */}
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
    </>
  );
}

export default ReachOutModal;
