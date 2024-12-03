import { Modal } from "@mui/material";
import { Button, Form, Input } from "antd";
import React from "react";

function ReasoningModal() {
  return (
    <>
      <Modal
        open={open.isAddOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        // className="modal custom-modal fade"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
        }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {open?.data ? t("holiday.update") : t("holiday.add")}{" "}
                {t("allEmp.Modal.designationName")}
              </h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                // form={form}
                name="control-hooks"
                onFinish={(val) => onFinish(val, open?.data)}
                onFinishFailed={({ errorFields }) => {
                  console.log(
                    errorFields.map((field) =>
                      field.errors.toString().includes("consecutive")
                    )
                  );
                  console.log(errorFields);
                  const consecutiveSpacesError = errorFields.find((field) =>
                    field.errors.toString().includes("consecutive spaces")
                  );
                  if (consecutiveSpacesError) {
                    message.error(t("allEmp.errors.removeConsecutiveSpaces"));
                  } else {
                    message.error(t("allEmp.errors.fillRequiredFields"));
                  }
                }}
                initialValues={{
                  designationName: open?.data
                    ? open?.data?.designationName
                    : "",
                }}
              >
                <div className="form-group">
                  <label>
                    {t("allEmp.Modal.designationName")}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <Form.Item
                    name="designationName"
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        validator: (_, value) => {
                          if (!value || value.trim() === "") {
                            return Promise.reject(
                              t("allEmp.errors.enterDesignationName")
                            );
                          } else if (/\s{2,}/.test(value)) {
                            return Promise.reject(
                              t("allEmp.errors.removeConsecutiveSpaces2")
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    className="custom-border"
                  >
                    <Input className="form-control" maxLength={50} autoFocus />
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
              </Form>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ReasoningModal;
