import { Modal } from "@mui/material";
import { Button, Form, Input, message, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function ReasoningModal({ openModal, closeModal, onSubmit, data }) {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [loader, setLoader] = useState(false);

  // Populate the form with data when the modal opens
  useEffect(() => {
    if (data) {
      console.log("Modal received data:", data);
      form.setFieldsValue({
        reason: data || "", // Set the initial value of reason
      });
    }
  }, [data, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields(); // Validate form fields
      setLoader(true);
      onSubmit(values.reason); // Send reason back to parent
      setLoader(false);
      closeModal(); // Close modal after successful submission
    } catch (error) {
      // Handle form validation error
      message.error(t("allEmp.errors.fillRequiredFields"));
    }
  };

  return (
    <Modal
      open={openModal}
      onClose={closeModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      BackdropProps={{
        style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color
      }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{t("Conversion Reason")}</h5>
            <button type="button" className="close" onClick={closeModal}>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="modal-body">
            <Form form={form} name="reasoning-form">
              <div className="form-group">
                <label>
                  {t("Reason")} <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="reason"
                  rules={[{ required: true, message: t("Please enter a Reason") }]}
                >
                  <Input.TextArea
                    className="form-control"
                    placeholder="Enter reason for status 'Not Converted'"
                    rows={5}
                  />
                </Form.Item>
              </div>
              <div className="submit-section">
                <Form.Item>
                  <Button
                    onClick={handleSubmit}
                    className="btn btn-primary submit-btn"
                    disabled={loader}
                  >
                    {loader ? <Spin size="small" /> : t("submit")}
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

export default ReasoningModal;
