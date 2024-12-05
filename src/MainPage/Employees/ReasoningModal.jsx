import { Modal} from "@mui/material";
import { Button, Form, Input, message, Spin } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function ReasoningModal({ openModal, closeModal, onSubmit }) {
  const { t } = useTranslation();
  const [loader, setLoader] = useState(false);
  const [reason, setReason] = useState(""); // Local state to store the reason

  const handleSubmit = (values) => {
    // Call the onSubmit function passed from the parent
    onSubmit(values.reason);
    setLoader(true);
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
            <h5 className="modal-title">
                {t('Conversion Reason')}
            </h5>
            <button type="button" className="close" onClick={closeModal}>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="modal-body">
            <Form
              name="reasoning-form"
              onFinish={handleSubmit}
              onFinishFailed={({ errorFields }) => {
                message.error(t("allEmp.errors.fillRequiredFields"));
              }}
            >
              <div className="form-group">
                <label>
                  {t("Reason")} <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="reason"
                  rules={[{ required: true, message: t("Please enter a Reason") }]}
                >
                  <Input.TextArea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)} // Update local reason state
                    className="form-control"
                    placeholder="Enter reason for status 'Not Converted'"
                    rows={5}
                  />
                </Form.Item>
              </div>
              <div className="submit-section">
                <Form.Item>
                  <Button
                    htmlType="submit"
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
