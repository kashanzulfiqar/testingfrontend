import React, { useEffect, useState } from "react";
import { Modal } from "@mui/material";
import { Form, Select, Input, Button, Spin, message, Divider } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { apiServices } from "../../../Services/apiServices";
import AssetsCategoryModal from "./AssetsCategoryModal";

const antIcon = (
  <LoadingOutlined style={{ fontSize: 24, color: "#fff" }} spin />
);

const AssetsSubCategoryModal = ({ open, onClose, onSuccess, initialData }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const user_state = useSelector((state) => state.user.loginvalue);
  const [loader, setLoader] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      apiServices("GET", `assets-category/?page=1&limit=9999`, null, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            setCategories(res?.data?.data?.docs || []);
          }
        })
        .catch((err) => {
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Failed to fetch categories"
            }`
          );
        });

      if (initialData) {
        console.log("initialData", initialData);
        form.setFieldsValue({
          assetCategoryId:
            initialData?.assetCategoryId ||
            initialData?.categoryId?._id ||
            initialData?.categoryId?.categoryname ||
            undefined,
          assetSubCategoryName:
            initialData?.assetSubCategoryName ||
            initialData?.subcategoryname ||
            initialData?.name ||
            "",
        });
      } else {
        form.resetFields();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData]);

  const categoryOptions = (categories || []).map((c) => ({
    label: c?.categoryname || c?.name,
    value: c?._id || c?.id,
  }));

  const handleSubmit = (values) => {
    setLoader(true);
    if (initialData) {
      const payload = {
        ...values,
        companyId: initialData?.companyId,
        _id: initialData?._id,
      };
      apiServices("PUT", "assets-sub-category", payload, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            onSuccess && onSuccess();
            onClose && onClose();
            message.success("Asset sub-category updated");
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
                : "Failed to update asset sub-category"
            }!`
          );
        });
    } else {
      apiServices("POST", "assets-sub-category", values, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            onSuccess && onSuccess();
            onClose && onClose();
            message.success("Asset sub-category added");
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
                : "Failed to add asset sub-category"
            }!`
          );
        });
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{ style: { backgroundColor: "rgb(0 0 0 / 87%)" } }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {initialData ? t("holiday.update") : t("holiday.add")} Assets
                Sub-Category
              </h5>
              <button type="button" className="close" onClick={onClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                form={form}
                name="assets-sub-category-form"
                onFinish={handleSubmit}
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
                autoComplete="off"
              >
                <div className="form-group">
                  <label>
                    Category <span className="text-danger">*</span>
                  </label>
                  <Form.Item
                    name="assetCategoryId"
                    rules={[
                      { required: true, message: "Please select category" },
                    ]}
                    className="custom-border"
                  >
                    <Select
                      disabled={!!initialData}
                      showSearch
                      placeholder="Select category"
                      options={categoryOptions}
                      filterOption={(input, option) =>
                        (option?.label || "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                          {
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
                                onClick={() => setIsCategoryModalOpen(true)}
                                disabled={!!initialData}
                              >
                                Add Category
                              </Button>
                            </>
                          }
                        </>
                      )}
                    />
                  </Form.Item>
                </div>
                <div className="form-group">
                  <label>
                    Sub-Category Name <span className="text-danger">*</span>
                  </label>
                  <Form.Item
                    name="assetSubCategoryName"
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        validator: (_, value) => {
                          if (!value || value.trim() === "") {
                            return Promise.reject(
                              "Please enter sub-category name"
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
                    <Input className="form-control" maxLength={50} />
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
      <AssetsCategoryModal
        open={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={() => {
          apiServices(
            "GET",
            `assets-category/?page=1&limit=9999`,
            null,
            user_state
          )
            .then((res) => {
              if (res?.data?.success === true) {
                setCategories(res?.data?.data?.docs || []);
              }
            })
            .catch(() => {});
        }}
      />
    </>
  );
};

export default AssetsSubCategoryModal;
