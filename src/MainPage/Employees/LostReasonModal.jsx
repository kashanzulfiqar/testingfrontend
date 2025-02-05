import React from "react";
import { Modal } from "@mui/material";
import { Button, Radio, Space, message } from "antd";
import { LOST_REASONS } from "../../constants";

function LostReasonModal({ openModal, closeModal, onSubmit }) {
  const [selectedReason, setSelectedReason] = React.useState(null);

  const handleSubmit = () => {
    if (!selectedReason) {
      message.error("Please select a reason");
      return;
    }
    onSubmit(selectedReason);
  };

  return (
    <Modal
      open={openModal}
      onClose={closeModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      disableRestoreFocus
      BackdropProps={{
        style: { backgroundColor: "rgb(0 0 0 / 87%)" },
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Select Reason for Lost Status</h5>
            <button type="button" className="close" onClick={closeModal}>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="modal-body">
            <Radio.Group
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
            >
              <Space direction="vertical" style={{ width: "100%" }}>
                {LOST_REASONS.map((reason) => (
                  <Radio key={reason.value} value={reason.value}>
                    {reason.label}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </div>
          <div className="modal-footer">
            <div className="submit-section">
              <Button
                type="primary"
                onClick={handleSubmit}
                className="btn btn-primary submit-btn"
                disabled={!selectedReason}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default LostReasonModal;
