import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Empty,
  Form,
  Input,
  Divider,
  Select,
  Spin,
  DatePicker,
  message,
  Modal,
} from "antd";
import PlusOutlined from "@mui/icons-material/Add";
import moment from "moment";
import { DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { apiServices } from "../../Services/apiServices";

function ReachOutModal({ openModal, closeModal, data, leadId, viewLeads, viewFiles, setLoadReachOut}) {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [loader, setLoader] = useState(false);
  const [mediumOptions, setMediumOptions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [open1, setOpen1] = useState(false);
  const [selectedMedium, setSelectedMedium] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const user_state = useSelector((state) => state.user.loginvalue);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  useEffect(() => {
    if (openModal) {
      console.log('Modal opened, fetching data...');
      fetchEmployees();
      viewMediums();
    }
  }, [openModal]);

  useEffect(() => {
    console.log('Employees state updated:', employees);
  }, [employees]);

  const fetchEmployees = async () => {
    try {
      setIsLoadingEmployees(true);
      const response = await apiServices("GET", "api/employees/get-employees", null, user_state);
      console.log('Raw API Response:', response);
      
      if (response?.data?.success === true && response?.data?.users?.docs) {
        const transformedEmployees = response.data.users.docs.map(employee => ({
          value: employee._id,
          label: employee.fullName || employee.employeeName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
        }));
        console.log('Transformed Employees:', transformedEmployees);
        setEmployees(transformedEmployees);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      message.error("Error getting employees");
      setEmployees([]);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const viewMediums = async () => {
    try {
      const token = user_state?.access_token?.accessToken;
      if (!token) {
        message.error("No authentication token found");
        return;
      }

      const response = await apiServices("GET", "leads/view-medium", null, user_state);
      if (response?.data?.success === true) {
        const mediums = response?.data?.Mediums;
        setMediumOptions(mediums);
      }
    } catch (err) {
      let errorMessage = "Error getting mediums";
      if (err?.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again.";
        window.location.href = '/login';
      } else if (err?.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      } else if (err?.response?.data?.validation?.body?.message) {
        errorMessage = err.response.data.validation.body.message;
      }
      message.error(errorMessage);
    }
  };

  const handleAddMedium = (values) => {
    setLoader(true);
    let data = {
      title: values
    }
    apiServices("POST", "leads/add-medium", data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setMediumOptions([
            ...mediumOptions,
            {
              title: values,
              _id: res?.data?.Medium?._id,
            }
          ])
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
              : 'Error adding medium'
          }!`
        );
      });
  };

  const showTeamSearch = (val, type) => {
    if (type === "Team" && Array.isArray(employees)) {
      const dropdownValues = employees.map(emp => emp.fullName?.toLowerCase()).filter(Boolean);
      if (val !== "") {
        return dropdownValues.some(name => name?.includes(val?.toLowerCase()));
      }
    }
    return false;
  };

  const handleAddReachout = (values) => {
    setLoader(true);
    const data = {
      ...values,
      date: moment(values.date).format("YYYY-MM-DD"),
      leadId: leadId
    };

    apiServices("POST", "leads/add-reachout", data, user_state)
      .then((res) => {
        if (res.data.success === true) {
          message.success("Reach out added successfully");
          closeModal();
          viewLeads();
          setLoadReachOut(true);
          form.resetFields();
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error adding reach out"
          }`
        );
      })
      .finally(() => {
        setLoader(false);
      });
  };

  return (
    <>
      <Modal
        title={data ? t("holiday.update") : t("holiday.add") + " Reach Out"}
        open={openModal}
        onCancel={closeModal}
        footer={null}
        width={600}
        maskClosable={false}
        destroyOnClose
        bodyStyle={{ height: '600px', overflowY: 'auto' }}
        closeIcon={<span className="close-modal-icon">&times;</span>}
      >
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
                  <label>Reach Out Date <span className="text-danger">*</span></label>
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
                        disabledDate={(current) => {
                          return current && current > moment().endOf('day');
                        }}
                      />
                    </Form.Item>
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="form-group">
                  <label>Communication Medium <span className="text-danger">*</span></label>
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
                                  icon={<PlusOutlined style={{ fontSize: "20px", marginRight: "5px" }} />}
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
                          </>
                        )}
                        style={{
                          width: "100%",
                        }}
                        placeholder="Select a medium"
                        onDropdownVisibleChange={(open) => setOpen1(open)}
                      >
                        {mediumOptions?.map((item) => (
                          <Select.Option key={item._id} value={item._id}>
                            {item.title}
                            {open1 && (
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
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="form-group">
                  <label>Communicated By <span className="text-danger">*</span></label>
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
                      placeholder="Select a personnel"
                      loading={isLoadingEmployees}
                      options={employees}
                      filterOption={(input, option) => 
                        option?.label?.toLowerCase().includes(input.toLowerCase())
                      }
                      style={{ width: '100%' }}
                      className="custom-select custom-normal"
                      notFoundContent={
                        isLoadingEmployees ? (
                          <Spin size="small" />
                        ) : (
                          <Empty 
                            image={Empty.PRESENTED_IMAGE_SIMPLE} 
                            description="No employees found" 
                          />
                        )
                      }
                      getPopupContainer={() => document.getElementById("area")}
                    />
                  </Form.Item>
                </div>
              </div>

              <div className="form-group">
                <label>Comments</label>
                <Form.Item name="comments">
                  <Input.TextArea className="form-control" rows={5} />
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
            </div>
          </Form>
        </div>
      </Modal>

      <Modal
        title="Confirm Delete"
        visible={isModalVisible}
        onOk={() => {
          // Handle delete medium
          apiServices("DELETE", "leads/delete-medium", selectedMedium?._id, user_state)
            .then((res) => {
              if (res?.data?.success === true) {
                message.success('Medium removed successfully');
                setMediumOptions(prevOptions => prevOptions.filter(proj => proj._id !== selectedMedium?._id))
                setIsModalVisible(false);
                setSelectedMedium(null);
              }
            })
            .catch((err) => {
              message.error(
                `${
                  err?.response?.data?.msg
                    ? err?.response?.data?.msg
                    : err?.response?.data?.validation?.body?.message
                    ? err?.response?.data?.validation?.body?.message
                    : 'Error deleting medium'
                }!`
              );
            });
        }}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedMedium(null);
        }}
      >
        <p>Are you sure you want to delete this medium?</p>
      </Modal>
    </>
  );
}

export default ReachOutModal;
