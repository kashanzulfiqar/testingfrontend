import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  TimePicker,
  message,
  Switch,
  Empty,
} from "antd";
import { apiServices } from "../../Services/apiServices";
import moment from "moment";
import onCloseIcon from "../../assets/iconsRecruitment/x.svg";
import { CloseOutlined } from "@ant-design/icons";

const CreateInterviewModal = ({
  isVisible,
  onCancel,
  onSubmit,
  candidate,
  authState,
  editingInterview,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [sendEmail, setSendEmail] = useState(true);
  const [interviewDate, setInterviewDate] = useState(null);
  const [selectedInterviewers, setSelectedInterviewers] = useState([]);
  const assignSelectRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      fetchEmployees();
      if (editingInterview) {
        console.log("E D I T I N G I N T E R V I E W", editingInterview);

        // Prefill form with existing interview data
        const interviewDate = moment(editingInterview.interviewDate);
        const interviewTime = moment(editingInterview.interviewTime, "HH:mm");

        form.setFieldsValue({
          candidateName: editingInterview.candidateName || candidate?.fullName,
          candidateEmail: editingInterview.candidateEmail || candidate?.email,
          interviewType: editingInterview.interviewType,
          assignTo: editingInterview.assignedTo?.map((emp) => emp._id) || [
            editingInterview.interviewerId?._id,
          ],
          interviewTitle: editingInterview.interviewTitle,
          interviewDate: interviewDate,
          interviewTime: interviewTime,
          sendEmail:
            editingInterview.sendEmail !== undefined
              ? editingInterview.sendEmail
              : true,
          interviewNotes: editingInterview.interviewNotes,
          meetingLink: editingInterview.interviewLink || "",
        });

        setInterviewDate(interviewDate);
        setSelectedInterviewers(
          editingInterview.assignedTo?.map((emp) => emp._id) || [
            editingInterview.interviewerId?._id,
          ]
        );
      } else {
        // Reset form for new interview
        form.resetFields();
        setSelectedInterviewers([]);
        setInterviewDate(null);
      }
    }
  }, [isVisible, editingInterview]);

  useEffect(() => {
    if (!isVisible) {
      setSelectedInterviewers([]);
    }
  }, [isVisible]);

  const handleAssignFocus = () => {
    setTimeout(() => {
      const searchInput = assignSelectRef.current?.querySelector(
        ".ant-select-selection-search-input"
      );
      if (searchInput) {
        searchInput.setSelectionRange(0, 0);
        searchInput.focus();
      }
    }, 0);
  };

  const handleAssignClick = () => {
    setTimeout(() => {
      const searchInput = assignSelectRef.current?.querySelector(
        ".ant-select-selection-search-input"
      );
      if (searchInput) {
        searchInput.setSelectionRange(0, 0);
        searchInput.focus();
      }
    }, 10);
  };

  const fetchEmployees = async () => {
    try {
      const token =
        localStorage.getItem("token") || authState?.access_token?.accessToken;
      const roles = ["employee", "interviewer", "admin"];

      const response = await apiServices(
        "GET",
        `user/all-employees?roles=${JSON.stringify(roles)}`,
        null,
        {
          access_token: { accessToken: token },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data?.success) {
        const sortedData = response.data.User.slice().sort((a, b) =>
          a.fullName.localeCompare(b.fullName)
        );
        setEmployees(sortedData);
        console.log("sorted data od all employees", employees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      message.error("Failed to fetch employees");
    }
  };

  const onReset = () => {
    form.resetFields();
  };

  const handleFormSubmit = async (values) => {
    try {
      setLoading(true);

      // Call the parent's onSubmit function (handleInterviewSubmit)
      await onSubmit(values);

      // If we reach here, the submission was successful
      form.resetFields();
      onCancel();
    } catch (error) {
      // Error handling is done in the parent component (handleInterviewSubmit)
      console.error("Error in modal form submission:", error);
      // Don't close modal on error - let user see the error message and try again
    } finally {
      setLoading(false);
    }
  };

  const getDisabledHours = () => {
    if (!interviewDate) return [];
    const today = moment();
    if (interviewDate.isSame(today, "day")) {
      // Disable all hours up to and including the current hour
      const currentHour = today.hour();
      return Array.from({ length: currentHour + 1 }, (_, i) => i);
    }
    return [];
  };

  return (
    <Modal
      title={editingInterview ? "Reschedule Interview" : "Add New Interview"}
      visible={isVisible}
      onCancel={onCancel}
      footer={null}
      width={800}
      className="custom-modal"
      style={{ zIndex: 2000 }}
      maskStyle={{ zIndex: 1999, background: "rgba(0, 0, 0, 0.5)" }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        initialValues={{
          sendEmail: true,
          candidateName: `${candidate?.firstName} ${candidate?.lastName}`,
          candidateEmail: candidate.email,
        }}
      >
        <div className="row">
          <div
            style={{
              height: "20px",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              borderTop: "1px solid #E2E8F0",
            }}
          ></div>
          <div className="col-md-6">
            <Form.Item
              name="candidateName"
              label={<>Candidate Name</>}
              rules={[
                { required: true, message: "Please enter candidate name" },
              ]}
            >
              <Input placeholder="Enter Name" />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="candidateEmail"
              label={<>Candidate Email</>}
              rules={[
                { required: true, message: "Please enter candidate email" },
              ]}
            >
              <Input placeholder="Enter Email" />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div style={{ position: "relative" }} id="area">
              <Form.Item
                name="interviewType"
                label="Interview Type"
                rules={[
                  { required: true, message: "Please select interview type" },
                ]}
              >
                <Select
                  placeholder="Select interview type"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                  className="customized"
                  dropdownStyle={{ zIndex: 2001 }}
                >
                  <Select.Option value="ONLINE">Online</Select.Option>
                  <Select.Option value="IN_PERSON">In Person</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>
          <div className="col-md-6">
            <div
              style={{ position: "relative" }}
              id="assignArea"
              ref={assignSelectRef}
              onClick={handleAssignClick}
            >
              <Form.Item
                name="assignTo"
                label="Primary Interviewer"
                rules={[
                  { required: true, message: "Please select an interviewer" },
                ]}
              >
                <Select
                  getPopupContainer={() =>
                    document.getElementById("assignArea")
                  }
                  mode="multiple"
                  showSearch
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  optionFilterProp="children"
                  placeholder="Select interviewer"
                  className="customselect-height custom-select"
                  value={selectedInterviewers}
                  onFocus={handleAssignFocus}
                  onChange={(value) => {
                    const limited = value.slice(0, 5);
                    setSelectedInterviewers(limited);
                    form.setFieldsValue({ assignTo: limited });
                  }}
                  onDeselect={(val) => {
                    const current = form.getFieldValue("assignTo") || [];
                    const updated = current.filter((v) => v !== val);
                    setSelectedInterviewers(updated);
                    form.setFieldsValue({ assignTo: updated });
                  }}
                  // allowClear
                >
                  {employees.map((emp) => (
                    <Select.Option
                      key={emp._id}
                      value={emp._id}
                      disabled={
                        selectedInterviewers.length >= 5 &&
                        !selectedInterviewers.includes(emp._id)
                      }
                    >
                      {emp.fullName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>
        </div>

        <div className="row">
          <div class="col-md-6">
            <div style={{ position: "relative" }} id="area">
              <Form.Item
                name="interviewTitle"
                label="Interview Title"
                rules={[
                  { required: true, message: "Please select interview title" },
                ]}
              >
                <Select
                  placeholder="Select interview title"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                  className="customized"
                  dropdownStyle={{ zIndex: 2001 }}
                >
                  <Select.Option value="Initial Interview">
                    Initial Interview
                  </Select.Option>
                  <Select.Option value="Technical Interview">
                    Technical Interview
                  </Select.Option>
                  <Select.Option value="HR Interview">
                    HR Interview
                  </Select.Option>
                  <Select.Option value="Final Interview">
                    Final Interview
                  </Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="interviewDate"
              label="Interview Date"
              rules={[{ required: true, message: "Please select date" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                disabledDate={(current) =>
                  current && current < moment().startOf("day")
                }
                className="custom-datepicker"
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                popupStyle={{ zIndex: 2001 }}
                onChange={(date) => setInterviewDate(date)}
              />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <Form.Item
              name="interviewTime"
              label="Interview Time"
              rules={[{ required: true, message: "Please select time" }]}
            >
              <TimePicker
                style={{ width: "100%" }}
                format="HH:mm"
                minuteStep={5}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                popupStyle={{ zIndex: 2001 }}
                className="custom-timepicker"
                disabledHours={getDisabledHours}
              />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.interviewType !== currentValues.interviewType
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("interviewType") === "ONLINE" && (
                  <Form.Item
                    name="meetingLink"
                    label="Meeting Link"
                    rules={[
                      { required: true, message: "Please enter meeting link" },
                      { type: "url", message: "Please enter a valid URL" },
                    ]}
                  >
                    <Input placeholder="Enter meeting link" />
                  </Form.Item>
                )
              }
            </Form.Item>
          </div>
        </div>

        {/* <Form.Item className="text-right mb-0">
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Schedule Interview
          </Button>
        </Form.Item>  */}
        <Form.Item
          className="text-end mt-3"
          style={{ backgroundColor: "transparent", height: "70px" }}
        >
          <Button
            onClick={onReset}
            style={{
              marginRight: "12px",
              padding: "6px 24px",
              height: "40px",
              borderRadius: "40px",
              background: "#F8F9FA",
              border: "none",
            }}
          >
            Reset
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{
              padding: "6px 24px",
              height: "40px",
              borderRadius: "40px",
              background: "#ff9244",
              border: "none",
              color: "white",
            }}
          >
            Schedule Interview
          </Button>
        </Form.Item>
        {/* <Form.Item
          name="interviewTitle"
          label="Interview Title"
          rules={[{ required: true, message: 'Please select interview title' }]}
        >
          <Select placeholder="Select interview title">
            <Select.Option value="Initial Interview">Initial Interview</Select.Option>
            <Select.Option value="Technical Interview">Technical Interview</Select.Option>
            <Select.Option value="HR Interview">HR Interview</Select.Option>
            <Select.Option value="Final Interview">Final Interview</Select.Option>
          </Select>
        </Form.Item>


        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.interviewType !== currentValues.interviewType}
        >
          {({ getFieldValue }) =>
            getFieldValue('interviewType') === 'ONLINE' && (
              <Form.Item
                name="meetingLink"
                label="Meeting Link"
                rules={[
                  { required: true, message: 'Please enter meeting link' },
                  { type: 'url', message: 'Please enter a valid URL' }
                ]}
              >
                <Input placeholder="Enter meeting link (e.g., Zoom, Google Meet)" />
              </Form.Item>
            )
          }
        </Form.Item>

        <Form.Item
          name="assignedTo"
          label="Primary Interviewer"
          rules={[{ required: true, message: 'Please select an interviewer' }]}
        >
          <Select
            placeholder="Select interviewer"
            showSearch
            optionFilterProp="children"
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            dropdownStyle={{ zIndex: 2001 }}
          >
            {employees.map((emp) => (
              <Select.Option key={emp._id} value={emp._id}>
                {emp.fullName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="assignTo"
          label="Additional Interviewers"
        >
          <Select
            mode="multiple"
            placeholder="Select additional interviewers"
            showSearch
            optionFilterProp="children"
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            dropdownStyle={{ zIndex: 2001 }}
          >
            {employees.map((emp) => (
              <Select.Option key={emp._id} value={emp._id}>
                {emp.fullName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="interviewDate"
          label="Interview Date"
          rules={[{ required: true, message: 'Please select date' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            disabledDate={(current) => current && current < moment().startOf('day')}
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            popupStyle={{ zIndex: 2001 }}
          />
        </Form.Item>

        <Form.Item
          name="interviewTime"
          label="Interview Time"
          rules={[{ required: true, message: 'Please select time' }]}
        >
          <TimePicker
            style={{ width: '100%' }}
            format="HH:mm"
            minuteStep={15}
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            popupStyle={{ zIndex: 2001 }}
          />
        </Form.Item>

        <Form.Item 
          label="Send Email Notification" 
          tooltip="An email with interview details and meeting link will be sent to the candidate"
        >
          <Switch
            checked={sendEmail}
            onChange={setSendEmail}
            checkedChildren="Yes"
            unCheckedChildren="No"
          />
        </Form.Item>*/}
      </Form>
      <style jsx>{`
        .custom-modal .ant-modal-content {
          overflow: visible;
        }
        .custom-modal .ant-modal-body {
          overflow: visible;
        }
        .custom-modal .ant-modal-header {
          border-bottom: none;
          padding: 24px 24px 0;
        }
        .custom-modal .ant-modal-title {
          font-size: 24px;
          font-weight: 600;
        }
        .custom-modal .ant-modal-close {
          background-color: #f8f9fa;
          border-radius: 50%;
          border: "1px solid #F8F9FA";
          margin: 16px 16px 0 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .custom-modal .ant-input,
        .custom-modal .ant-select-selector,
        .custom-modal .ant-input-number {
          border-radius: 8px;
          padding: 8px 12px;
          height: 56px;
          font-size: 16px;
          font-weight: 450;
        }
        .custom-timepicker,
        .custom-datepicker {
          border-radius: 8px;
          padding: 8px 12px;
          height: 56px;
          font-size: 16px;
          font-weight: 450;
        }

        // .search-form {
        //   background: transparent;
        //   margin-bottom: 16px;
        // }

        // .search-btn {
        //   background: #1f1f1f;
        //   border: 1px solid #1f1f1f;
        //   height: 40px;
        //   border-radius: 8px;
        //   width: 80% !important;
        //   font-weight: 500;
        //   font-size: 16px;
        //   display: flex;
        //   align-items: center;
        //   justify-content: center;
        //   justify-self: end;
        // }
        // .search-btn:hover {
        //   background: #333 !important;
        //   border: none
        // }

        .custom-modal .customized .ant-select-selector {
          height: 56px !important;
          border-radius: 8px !important;
          display: flex;
          align-items: center;
          padding-left: 10px;
        }

        .add-candidate-btn {
          border-radius: 40px !important;
          height: 44px !important;
          background-color: #ff9244 !important;
          color: white !important;
          font-weight: 500 !important;
          font-size: 16px !important;
          border: 2px solid #ff9244 !important;
          width: 185px !important;
        }

        .btn-content {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .ant-modal,
        .ant-modal-wrap,
        .ant-modal-mask {
          z-index: 2000 !important;
        }

        body.modal-open {
          overflow: hidden;
        }

        /* Ensure caret starts at beginning for assignTo select (mirror/input normalization) */
        .custom-modal .custom-select .ant-select-selection-search {
          width: 100% !important;
          position: relative !important;
        }
        .custom-modal .custom-select .ant-select-selection-search-input {
          text-indent: 0 !important;
          padding-left: 0 !important;
          margin-left: 0 !important;
          min-width: 1px !important;
          border: none !important;
          outline: none !important;
          background: transparent !important;
          caret-color: inherit !important;
        }
        .custom-modal .custom-select .ant-select-selection-search-mirror {
          text-indent: 0 !important;
          padding-left: 0 !important;
          margin-left: 0 !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          visibility: hidden !important;
        }
        .custom-modal .custom-select .ant-select-selection-placeholder {
          letter-spacing: normal !important;
          padding-left: 0 !important;
          margin-left: 0 !important;
        }
        /* Keep default AntD behavior for placeholder on focus */
        /* Align selector layout similar to skills field */
        .custom-modal .custom-select .ant-select-selector {
          display: flex !important;
          align-items: center !important;
          flex-wrap: wrap !important;
        }

        /* Additional fixes mirroring skillSet field */
        .custom-modal
          .custom-select.ant-select-multiple
          .ant-select-selection-overflow {
          padding-left: 0 !important;
        }
        .custom-modal
          .custom-select.ant-select-multiple
          .ant-select-selection-overflow-item {
          margin-left: 0 !important;
        }
        .custom-modal
          .custom-select.ant-select-multiple
          .ant-select-selection-search {
          margin-left: 0 !important;
          padding-left: 0 !important;
        }
        .custom-modal
          .custom-select
          .ant-select-selection-overflow-item-suffix {
          margin-left: 0 !important;
          padding-left: 0 !important;
        }

        /* Match skillSet: ensure focus keeps caret at start */
        .custom-modal .custom-select .ant-select-selection-search-input:focus {
          text-align: left !important;
          text-indent: 0 !important;
        }
      `}</style>
    </Modal>
  );
};

export default CreateInterviewModal;
