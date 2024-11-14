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
import { LoadingOutlined, MinusCircleFilled } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { acceptableFormats } from "./Projects/EditProjects";

function LeadNotes({ openModal, closeModal, data }) {
  const nav = useNavigate();
  const [form] = Form.useForm();
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role;

  const [selectedData, setSelectedData] = useState(null);
  const [loader, setLoader] = useState(false);

  const [filesToDelete, setFilesToDelete] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  const onFileUpload = async (files, type) => {
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
  };

  const removeSelectedFile = (index, type) => {
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
  };

  const displaySelectedFiles = (type) => {
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
          className="modal-dialog modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {selectedData ? t("holiday.update") : t("holiday.add")} Notes
              </h5>

              <button type="button" className="close" onClick={closeModal}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
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
                <div className="form-group">
                  <label>
                    Title <span className="text-danger">*</span>
                  </label>
                  <Form.Item
                    name="title"
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        validator: (_, value) => {
                          if (!value || value.trim() === "") {
                            return Promise.reject("please enter title");
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
                <div className="form-group">
                  <label>Note</label>
                  <Form.Item name="notes">
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

export default LeadNotes;
