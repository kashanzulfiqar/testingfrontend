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

function ReachOutModal({ openModal, closeModal, data }) {
  const nav = useNavigate();
  const [form] = Form.useForm();
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state.user.loginvalue);
  const role = user_state?.user?.role;

  const [selectedData, setSelectedData] = useState(null);

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
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {selectedData ? t("holiday.update") : t("holiday.add")} Reach
                Out
              </h5>

              <button type="button" className="close" onClick={closeModal}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                form={form}
                onFinish={(val) => onFinish(val, selectedData)}
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

              </Form>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ReachOutModal;
