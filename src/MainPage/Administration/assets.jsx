import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Form,
  Input,
  Empty,
  Pagination,
  Spin,
  Select,
  DatePicker,
  InputNumber,
  Upload,
  message,
} from "antd";
import { Modal } from "@mui/material";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import { apiServices } from "../../Services/apiServices";
import { apiUploadToS3 } from "../../Services/uploadImage";
import ImgCrop from "antd-img-crop";
import moment from "moment";
import EmptyTable from "../../files/Icons/EmptyTable.svg";
import { itemRender } from "../paginationfunction";
import { Helmet } from "react-helmet";
import { user_icon } from "../../Entryfile/imagepath";
import { Link } from "react-router-dom";

const Assets = () => {
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state.user.loginvalue);
  const [form] = Form.useForm();

  const [menu, setMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [assetsObj, setAssetsObj] = useState();
  const [loader, setLoader] = useState(false);
  const [flag, setFlag] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });

  const [subCategories, setSubCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [imageLoader, setImageLoader] = useState(false);
  const [image, setImage] = useState("");

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
    setLoader(false);
    setImage("");
    form?.resetFields();
  };

  useEffect(() => {
    if ($(".select").length > 0) {
      $(".select").select2({ minimumResultsForSearch: -1, width: "100%" });
    }
  });

  useEffect(() => {
    // dropdown preloads
    apiServices(
      "GET",
      `assets-sub-category/?page=1&limit=1000`,
      null,
      user_state
    )
      .then((res) => {
        if (res?.data?.success === true) {
          const container =
            res?.data?.SubCategories ||
            res?.data?.subCategories ||
            res?.data?.data;
          setSubCategories(container?.docs || []);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Failed to fetch assets Sub-Categories"
          }`
        );
      });
    apiServices("GET", "user/all-employees", null, user_state).then((res) => {
      if (res?.data?.success === true) {
        setEmployees(res?.data?.User || []);
      }
    });
  }, []);

  useEffect(() => {
    if (!flag) {
      setIsLoading(true);
      fetchAssets();
    }
  }, [pagination.current, pagination.pageSize]);

  const fetchAssets = (page, pageSize) => {
    const params = {
      page: page || pagination.current,
      limit: pageSize ? pageSize : pagination.pageSize,
    };
    apiServices(
      "GET",
      `assets/?page=${params.page}&limit=${params.limit}`,
      null,
      user_state
    )
      .then((res) => {
        if (res?.data?.success === true) {
          const container = res?.data?.Assets || res?.data?.assets || res?.data;
          setAssetsObj(container);
          const docs = container?.docs || container?.data || [];
          setAssets(docs);
          setFlag(true);
          if (container) {
            setPagination({
              ...pagination,
              current: container.page || params.page,
              total: container.totalDocs || docs.length,
            });
          }
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Failed to fetch assets"
          }`
        );
      })
      .then(() => {
        setIsLoading(false);
        setFlag(false);
      });
  };

  const antIcon = (
    <LoadingOutlined style={{ fontSize: 24, color: "#fff" }} spin />
  );

  // Handle form and image state when modal opens
  useEffect(() => {
    if (open.isAddOpen) {
      if (open?.data) {
        // Editing existing asset - set all form values
        const formValues = {
          name: open?.data?.name || "",
          model: open?.data?.model || "",
          price: open?.data?.price || undefined,
          quantity: open?.data?.quantity || 1,
          assetSubCategoryId:
            open?.data?.assetSubCategoryId?._id ||
            open?.data?.assetSubCategoryId ||
            open?.data?.subCategory?._id ||
            undefined,
          isAssignable: open?.data?.isAssignable || false,
          assignedEmployeeId:
            open?.data?.assignedEmployeeId?._id ||
            open?.data?.assignedEmployeeId ||
            undefined,
          manufacturer: open?.data?.manufacturer || "",
          purchasedDate: open?.data?.purchasedDate
            ? moment(open?.data?.purchasedDate)
            : undefined,
          purchasedByEmployeeId:
            open?.data?.purchasedByEmployeeId?._id ||
            open?.data?.purchasedByEmployeeId ||
            undefined,
          condition: open?.data?.condition || undefined,
          warranty: open?.data?.warranty || undefined,
          status: open?.data?.status || "Pending",
          imageUrl: open?.data?.imageUrl || "",
        };

        form.setFieldsValue(formValues);
        const imageUrl = open?.data?.imageUrl || "";
        setImage(imageUrl);
      } else {
        // Adding new asset - reset all form values
        const defaultValues = {
          name: "",
          model: "",
          price: undefined,
          quantity: 1,
          assetSubCategoryId: undefined,
          isAssignable: false,
          assignedEmployeeId: undefined,
          manufacturer: "",
          purchasedDate: undefined,
          purchasedByEmployeeId: undefined,
          condition: undefined,
          warranty: undefined,
          status: "Pending",
          imageUrl: "",
        };

        form.resetFields();
        form.setFieldsValue(defaultValues);
        setImage("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open.isAddOpen, open.data]);

  const allowedFileTypes = ["image/png", "image/jpeg", "image/jpg"];
  const beforeUpload = (file) => {
    const isFileTypeAllowed = allowedFileTypes.includes(file.type);
    if (!isFileTypeAllowed) {
      message.error(
        t("allEmp.errors.fileTypeNotAllowed") || "Only PNG, JPG, JPEG allowed"
      );
      return false;
    }
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    const isSizeAllowed = file.size <= maxSizeInBytes;
    if (!isSizeAllowed) {
      message.error(
        t("allEmp.errors.fileSizeTooLarge") || "File too large (max 5MB)"
      );
      return false;
    }
    return true;
  };

  const onImageUpload = (file) => {
    setImageLoader(true);
    apiUploadToS3(file)
      .then((res) => {
        const url = res?.data?.result?.secure_url;
        if (url) {
          form.setFieldsValue({ imageUrl: url });
          setImage(url);
        }
        setImageLoader(false);
      })
      .catch((err) => {
        setImageLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("allEmp.errors.uploadImageError") || "Failed to upload image"
          }!`
        );
      });
  };

  const onRemoveImage = () => {
    form.setFieldsValue({ imageUrl: "" });
    setImage("");
  };

  const toggleMobileMenu = () => {
    setMenu(!menu);
  };

  const onFinish = (values, info) => {
    setLoader(true);
    const payload = { ...values };
    if (values?.purchasedDate && values?.purchasedDate.format) {
      payload.purchasedDate = values.purchasedDate.format("YYYY-MM-DD");
    }
    if (info) {
      payload._id = info?._id;
      apiServices("PUT", "assets", payload, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            fetchAssets();
            handleClose();
            message.success("Asset updated");
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
                : "Failed to update asset"
            }!`
          );
        });
    } else {
      apiServices("POST", "assets", payload, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            fetchAssets();
            handleClose();
            message.success("Asset added");
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
                : "Failed to add asset"
            }!`
          );
        });
    }
  };

  const onHandleDelete = (rowData) => {
    setLoader(true);
    apiServices("DELETE", "assets", rowData, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          if (assetsObj?.docs?.length === 1) {
            fetchAssets(assetsObj.totalPages - 1, null);
          } else {
            fetchAssets();
          }
          handleClose();
          message.success("Asset deleted");
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
              : "Failed to delete asset"
          }!`
        );
      });
  };

  const customEmptyText = (
    <Empty
      image={<img src={EmptyTable} />}
      style={{
        height: "300px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      description={
        <div>
          <div
            style={{
              color: "#34343F",
              fontWeight: "500",
              fontSize: "14px",
              margin: "7px 0px 4px 0px",
            }}
          >
            No Assets
          </div>
          <div
            style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
          >
            Click to add a new asset.
          </div>
        </div>
      }
    />
  );

  const columns = [
    { title: "Serial Number", dataIndex: "serialNumber" },
    {
      title: "Name",
      dataIndex: "name",
      render: (text, record) => (
        <Link to={`/assets/${record?._id}`} state={{ asset: record }} style={{ color: '#333333' }}>
          <h2  style={{ cursor: 'pointer' }} className="table-avatar">
          <img className="avatar" alt="" src={record?.imageUrl || user_icon} />
            <span>{record?.name}</span>
        </h2>
        </Link>
      ),
    },
    { title: "Model", dataIndex: "model" },
    {
      title: "Sub-Category",
      dataIndex: "subCategoryName",
      render: (_, row) =>
        row?.subCategory?.assetSubCategoryName ||
        row?.assetSubCategoryId?.subcategoryname ||
        row?.assetSubCategoryName,
    },
    { title: "Status", dataIndex: "status" },
    {
      title: t("holiday.actions"),
      render: (record, row) => (
        <div className="dropdown dropdown-action text-end">
          <a
            href="javascript:void(0)"
            className="action-icon dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="material-icons">more_vert</i>
          </a>
          <div className="dropdown-menu dropdown-menu-right">
            <a
              className="dropdown-item"
              href="javascript:void(0)"
              onClick={() =>
                setOpen({ isAddOpen: true, isDelOpen: false, data: row })
              }
            >
              <i className="fa fa-pencil m-r-5" /> {t("edit")}
            </a>
            <a
              className="dropdown-item"
              href="javascript:void(0)"
              onClick={() =>
                setOpen({ isAddOpen: false, isDelOpen: true, data: row })
              }
            >
              <i className="fa fa-trash-o m-r-5" /> {t("delete")}
            </a>
          </div>
        </div>
      ),
    },
  ];

  const subCategoryOptions = useMemo(() => {
    return (subCategories || []).map((sc) => ({
      label: sc?.assetSubCategoryName || sc?.subcategoryname || sc?.name,
      value: sc?._id || sc?.id,
    }));
  }, [subCategories]);

  const employeeOptions = useMemo(() => {
    return (employees || []).map((e) => ({
      label:
        e?.fullName ||
        e?.name ||
        `${e?.firstName || ""} ${e?.lastName || ""}`.trim(),
      value: e?._id || e?.id,
    }));
  }, [employees]);

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>{t("assets.pageTitle")}</title>
        <meta name="description" content="Login page" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center pt-3 pb-3">
            <div className="col">
              <h3 className="page-title">Assets</h3>
            </div>
            <div className="col-auto float-end ms-auto">
              <a
                href="javascript:void(0)"
                className="btn add-btn"
                onClick={() =>
                  setOpen({ isAddOpen: true, isDelOpen: false, data: "" })
                }
              >
                <i className="fa fa-plus" /> Add Asset
              </a>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              <Table
                loading={isLoading}
                className={assets?.length > 0 ? "table-striped" : ""}
                locale={{ emptyText: isLoading ? null : customEmptyText }}
                pagination={false}
                style={{ overflowX: "auto" }}
                columns={columns}
                bordered
                dataSource={assets}
                rowKey={(record) => record._id || record.id}
                components={
                  i18n.dir() === "rtl"
                    ? {
                        header: {
                          cell: ({ children }) => (
                            <th style={{ textAlign: "right" }}>{children}</th>
                          ),
                        },
                      }
                    : null
                }
                onRow={
                  i18n.dir() === "rtl"
                    ? (record, rowIndex) => {
                        return { style: { textAlign: "right" } };
                      }
                    : null
                }
              />
            </div>
            {assets?.length > 0 && (
              <div>
                <Pagination
                  style={{ display: "flex", float: "right" }}
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  showTotal={(total, range) =>
                    t("paginationShow", {
                      range1: range[0],
                      range2: range[1],
                      total: total,
                    })
                  }
                  pageSizeOptions={["20", "30", "40", "50"]}
                  showSizeChanger
                  onChange={(page, pageSize) =>
                    setPagination({ ...pagination, current: page, pageSize })
                  }
                  itemRender={(current, type, originalElement) =>
                    itemRender(current, type, originalElement, t)
                  }
                  disabled={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={open.isAddOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        className="modalScroll"
        sx={{ overflowY: "scroll" }}
        BackdropProps={{ style: { backgroundColor: "rgb(0 0 0 / 87%)" } }}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {open?.data ? t("holiday.update") : t("holiday.add")} Asset
              </h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ position: "relative" }} id="area">
                <Form
                  form={form}
                  name="assets-form"
                  layout="vertical"
                  onFinish={(val) => onFinish(val, open?.data)}
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
                  // initialValues are handled dynamically in useEffect
                  autoComplete="off"
                >
                  <div className="row">
                    <div className="col-md-12">
                      <Form.Item
                        name="imageUrl"
                        className="custom-border"
                        style={{ display: "grid", placeContent: "center" }}
                      >
                        <div>
                          <div className="profile-img-wrap edit-img">
                            {imageLoader ? (
                              <div className="uploadImgSpinContainer">
                                {" "}
                                <Spin />{" "}
                              </div>
                            ) : (
                              <>
                                <img
                                  className="inline-block"
                                  src={image ? image : user_icon}
                                  alt="asset"
                                />
                                <div className="fileupload btn">
                                  <ImgCrop
                                    cropShape="round"
                                    quality={1}
                                    modalTitle="Crop Image"
                                    modalOk="Apply"
                                    modalClassName="CropImageModalStyle"
                                    beforeCrop={beforeUpload}
                                  >
                                    <Upload
                                      customRequest={({ file }) => {
                                        onImageUpload(file);
                                      }}
                                      fileList={null}
                                      maxCount={1}
                                    >
                                      <div
                                        className="btn-text"
                                        style={{
                                          width: "80px",
                                          padding: "4px",
                                        }}
                                      >
                                        edit
                                      </div>
                                    </Upload>
                                  </ImgCrop>
                                </div>
                              </>
                            )}
                          </div>
                          {image && (
                            <a
                              href="javascript:void(0)"
                              onClick={onRemoveImage}
                              className="fa fa-closee file-remove"
                              style={{
                                color: "#fb1612",
                                position: "absolute",
                                top: "-1px",
                                right: "-4px",
                                fontSize: "19px",
                                fontFamily: "cursive",
                                padding: "5px 7px 6px",
                                background: "white",
                                borderRadius: "50%",
                              }}
                            >
                              <i className="fa fa-times" />
                            </a>
                          )}
                        </div>
                      </Form.Item>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Item
                        label="Name"
                        name="name"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Please enter asset name",
                          },
                        ]}
                      >
                        <Input className="form-control" maxLength={80} />
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item
                        label="Model"
                        name="model"
                        className="custom-border"
                      >
                        <Input className="form-control" maxLength={80} />
                      </Form.Item>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-3">
                      <Form.Item
                        label="Price"
                        name="price"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Please enter price",
                          },
                        ]}
                      >
                        <InputNumber
                          className="form-control"
                          style={{ width: "100%" }}
                          min={0}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-md-3">
                      <Form.Item
                        label="Quantity"
                        name="quantity"
                        className="custom-border"
                        initialValue={1}
                        rules={[{ type: "number", min: 1, message: "Min 1" }]}
                      >
                        <InputNumber
                          className="form-control"
                          style={{ width: "100%" }}
                          min={1}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item
                        label="Sub-Category"
                        name="assetSubCategoryId"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Please select sub-category",
                          },
                        ]}
                      >
                        <Select
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          showSearch
                          placeholder="Select sub-category"
                          options={subCategoryOptions}
                          filterOption={(input, option) =>
                            (option?.label || "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        />
                      </Form.Item>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Item
                        label="Assignable"
                        name="isAssignable"
                        className="custom-border"
                        rules={[{ required: true }]}
                      >
                        <Select
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          options={[
                            { label: "No", value: false },
                            { label: "Yes", value: true },
                          ]}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item
                        noStyle
                        shouldUpdate={(prev, cur) =>
                          prev.isAssignable !== cur.isAssignable
                        }
                      >
                        {({ getFieldValue }) =>
                          getFieldValue("isAssignable") ? (
                            <Form.Item
                              label="Assign To"
                              name="assignedEmployeeId"
                              className="custom-border"
                            >
                              <Select
                                className="custom-select custom-normal"
                                getPopupContainer={() =>
                                  document.getElementById("area")
                                }
                                showSearch
                                placeholder="Select employee"
                                options={employeeOptions}
                                filterOption={(input, option) =>
                                  (option?.label || "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                              />
                            </Form.Item>
                          ) : null
                        }
                      </Form.Item>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Item
                        label="Manufacturer"
                        name="manufacturer"
                        className="custom-border"
                      >
                        <Input className="form-control" maxLength={80} />
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item
                        label="Purchased Date"
                        name="purchasedDate"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Please select purchased date",
                          },
                        ]}
                      >
                        <DatePicker
                          className="form-control"
                          style={{ width: "100%", minHeight: "45px" }}
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                        />
                      </Form.Item>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Item
                        label="Purchased By"
                        name="purchasedByEmployeeId"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Please select employee",
                          },
                        ]}
                      >
                        <Select
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          showSearch
                          placeholder="Select employee"
                          options={employeeOptions}
                          filterOption={(input, option) =>
                            (option?.label || "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                        />
                      </Form.Item>
                    </div>
                    <div className="col-md-3">
                      <Form.Item
                        label="Condition"
                        name="condition"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Please select condition",
                          },
                        ]}
                      >
                        <Select
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          options={[
                            { label: "New", value: "New" },
                            { label: "Good", value: "Good" },
                            { label: "Fair", value: "Fair" },
                            { label: "Damaged", value: "Damaged" },
                          ]}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-md-3">
                      <Form.Item
                        label="Warranty (months)"
                        name="warranty"
                        className="custom-border"
                      >
                        <InputNumber
                          className="form-control"
                          style={{ width: "100%" }}
                          min={0}
                        />
                      </Form.Item>
                    </div>
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
        </div>
      </Modal>

      <Modal
        open={open.isDelOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{ style: { backgroundColor: "rgb(0 0 0 / 87%)" } }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ height: "280px" }}>
            <div
              className="modal-body"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div className="form-header">
                <h3 style={{ marginBottom: "30px" }}>{t("delete")} Asset</h3>
                <p>Are you sure you want to delete "{open?.data?.name}"?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <Button
                      onClick={handleClose}
                      className="btn btn-primary submit-btn"
                      style={{ width: "100%" }}
                    >
                      {t("cancel")}
                    </Button>
                  </div>
                  <div className="col-6">
                    <Button
                      htmlType="submit"
                      className="btn btn-primary continue-btn"
                      onClick={() => onHandleDelete(open?.data)}
                      disabled={loader}
                      style={{ width: "100%" }}
                    >
                      {loader ? (
                        <Spin size="small" indicator={antIcon} />
                      ) : (
                        t("delete")
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Assets;
