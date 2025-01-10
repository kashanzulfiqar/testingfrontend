import React from "react";
import { Modal } from "@mui/material";
import { Button, DatePicker, message } from "antd";
import moment from "moment";

function ConversionDateModal({ openModal, closeModal, onSubmit }) {
  const [conversionDate, setConversionDate] = React.useState(null);

  const handleSubmit = () => {
    if (!conversionDate) {
      message.error("Please select a conversion date");
      return;
    }
    onSubmit(conversionDate.toISOString());
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
            <h5 className="modal-title">Select Conversion Date</h5>
            <button type="button" className="close" onClick={closeModal}>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label>
                Conversion Date <span className="text-danger">*</span>
              </label>
              <div style={{ position: "relative" }}>
                <DatePicker
                  className="form-control"
                  placeholder="Select conversion date"
                  onChange={(date) => setConversionDate(date)}
                  disabledDate={(current) =>
                    current && current > moment().endOf("day")
                  }
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <div className="submit-section">
              <Button
                type="primary"
                onClick={handleSubmit}
                className="btn btn-primary submit-btn"
                disabled={!conversionDate}
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

export default ConversionDateModal;
