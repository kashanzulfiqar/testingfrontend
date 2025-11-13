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
  Divider,
} from "antd";
import { Modal } from "@mui/material";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { LoadingOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { apiServices } from "../../Services/apiServices";
import { apiUploadToS3 } from "../../Services/uploadImage";
import ImgCrop from "antd-img-crop";
import moment from "moment";
import EmptyTable from "../../files/Icons/EmptyTable.svg";
import { itemRender } from "../paginationfunction";
import { Helmet } from "react-helmet";
import { user_icon } from "../../Entryfile/imagepath";
import { useNavigate } from "react-router-dom";
import AssetsSubCategoryModal from "./Settings/AssetsSubCategoryModal";
import AssetsCategoryModal from "./Settings/AssetsCategoryModal";

const Assets = () => {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const user_state = useSelector((state) => state.user.loginvalue);
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();

  const [menu, setMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  const [assetsObj, setAssetsObj] = useState();
  const [loader, setLoader] = useState(false);
  const [flag, setFlag] = useState(false);
  const [filterValues, setFilterValues] = useState(null);
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

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [imageLoader, setImageLoader] = useState(false);
  const [image, setImage] = useState("");
  const [serialNumberLoading, setSerialNumberLoading] = useState(false);
  const [isSubCatModalOpen, setIsSubCatModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const assignedEmployeeWatch = Form.useWatch("assignedEmployeeId", form);

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
    setLoader(false);
    setImage("");
    setSerialNumberLoading(false);
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
      `assets-category/?page=1&limit=1000`,
      null,
      user_state
    )
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
              : "Failed to fetch assets Categories"
          }`
        );
      });
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

  // Keep status in sync with assignment
  useEffect(() => {
    const currentStatus = form.getFieldValue("status");
    const currentNote = form.getFieldValue("assignmentNote");
    if (assignedEmployeeWatch) {
      const updates = {};
      if (currentStatus !== "assigned") {
        updates.status = "assigned";
      }
      if (Object.keys(updates).length) {
        form.setFieldsValue(updates);
      }
    } else {
      const updates = {};
      if (currentStatus === "assigned") {
        updates.status = "available";
      }
      if (currentNote) {
        updates.assignmentNote = undefined;
      }
      updates.assignedDate = undefined;
      updates.expectedReturnDate = undefined;
      if (Object.keys(updates).length) {
        form.setFieldsValue(updates);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedEmployeeWatch]);

  const fixedStatusOptions = [
    // { label: "Assigned", value: "assigned" },
    { label: "Available", value: "available" },
    { label: "Sold", value: "sold" },
    { label: "Lost", value: "lost" },
    { label: "Damaged", value: "damaged" },
    { label: "Under Maintenance", value: "undermaintenance" },
  ];

  useEffect(() => {
    if (!flag) {
      setIsLoading(true);
      fetchAssets(filterValues);
    }
  }, [pagination.current, pagination.pageSize]);

  const fetchAssets = (values, page, pageSize) => {
    setIsLoading(true);
    const params = {
      page: page || pagination.current,
      limit: pageSize ? pageSize : pagination.pageSize,
    };
    const nameParam =
      values === ""
        ? ""
        : values?.name === ""
        ? ""
        : values?.name
        ? `&name=${encodeURIComponent(values?.name)}`
        : filterValues?.name
        ? `&name=${encodeURIComponent(filterValues?.name)}`
        : "";
    const categoryParam =
      values === ""
        ? ""
        : values?.assetCategoryId === ""
        ? ""
        : values?.assetCategoryId
        ? `&assetCategoryId=${encodeURIComponent(values?.assetCategoryId)}`
        : filterValues?.assetCategoryId
        ? `&assetCategoryId=${encodeURIComponent(filterValues?.assetCategoryId)}`
        : "";
    const statusParam =
      values === ""
        ? ""
        : values?.status === ""
        ? ""
        : values?.status
        ? `&status=${encodeURIComponent(values?.status)}`
        : filterValues?.status
        ? `&status=${encodeURIComponent(filterValues?.status)}`
        : "";

    apiServices(
      "GET",
      `assets/?page=${params.page}&limit=${params.limit}${nameParam}${categoryParam}${statusParam}`,
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

  const onFilterFinish = (values) => {
    console.log("values !!!! !", values);
    
    // Only trigger when some value is present (mirrors employees logic)
    for (const key in values) {
      if (values[key] !== undefined && values[key] !== null && values[key] !== "") {
        setFilterValues(values);
        setPagination({ ...pagination, current: 1 });
        fetchAssets(values, 1, pagination.pageSize);
        return;
      }
    }
    // If all empty, still apply empty filter
    setFilterValues(null);
    setPagination({ ...pagination, current: 1 });
    fetchAssets("", 1, pagination.pageSize);
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
          assetCategoryId: open?.data?.assetCategoryId?._id || undefined,
          assetSubCategoryId: open?.data?.assetSubCategoryId?._id || undefined,
          isAssignable: open?.data?.isAssignable || false,
          assignedEmployeeId:
            open?.data?.assignedEmployeeId?._id ||
            open?.data?.assignedEmployeeId ||
            undefined,
          assignmentNote: open?.data?.assignmentNote || "",
          assignedDate: open?.data?.assignmentHistory[0]?.assignedDate
            ? moment(open?.data?.assignmentHistory[0]?.assignedDate)
            : undefined,
          expectedReturnDate: open?.data?.assignmentHistory[0]?.expectedReturnDate
            ? moment(open?.data?.assignmentHistory[0]?.expectedReturnDate)
            : undefined,
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
          status: open?.data?.status || "available",
          imageUrl: open?.data?.imageUrl || "",
          supplier: open?.data?.supplier || "",
          serialNumber: open?.data?.serialNumber || "",
          description: open?.data?.description || "",
        };

        setSerialNumberLoading(false);
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
          assetCategoryId: undefined,
          assetSubCategoryId: undefined,
          isAssignable: false,
          assignedEmployeeId: undefined,
          manufacturer: "",
          purchasedDate: undefined,
          purchasedByEmployeeId: undefined,
          condition: undefined,
          warranty: undefined,
          status: "available",
          supplier: "",
          imageUrl: "",
          serialNumber: "",
          assignmentNote: "",
          assignedDate: undefined,
          expectedReturnDate: undefined,
          description: "",
        };

        form.resetFields();
        form.setFieldsValue(defaultValues);
        const fetchSerialNumber = async () => {
          setSerialNumberLoading(true);
          try {
            const res = await apiServices(
              "GET",
              "assets/serial-number",
              null,
              user_state
            );
            const serial =
              res?.data?.serialNumber ||
              res?.data?.data?.serialNumber ||
              res?.data?.data ||
              res?.data?.result?.serialNumber ||
              res?.data?.SerialNumber;
            if (serial) {
              form.setFieldsValue({ serialNumber: serial });
            } else {
              form.setFieldsValue({ serialNumber: "" });
              message.warning("Serial number not provided by server");
            }
          } catch (err) {
            message.error(
              `${
                err?.response?.data?.msg
                  ? err?.response?.data?.msg
                  : err?.response?.data?.validation?.body?.message
                  ? err?.response?.data?.validation?.body?.message
                  : "Failed to fetch serial number"
              }`
            );
            form.setFieldsValue({ serialNumber: "" });
          } finally {
            setSerialNumberLoading(false);
          }
        };
        fetchSerialNumber();
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
        <h2 className="table-avatar">
          <img className="avatar" alt="" src={record?.imageUrl || user_icon} />
          <span>{record?.name}</span>
        </h2>
      ),
    },
    { title: "Model", dataIndex: "model" },
    {
      title: "Category",
      dataIndex: "categoryName",
      render: (_, row) =>
        row?.category?.assetCategoryName ||
        row?.assetCategoryId?.categoryname ||
        row?.assetCategoryName,
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
            {/* <a
              className="dropdown-item"
              href="javascript:void(0)"
              onClick={() =>
                setOpen({ isAddOpen: false, isDelOpen: true, data: row })
              }
            >
              <i className="fa fa-trash-o m-r-5" /> {t("delete")}
            </a> */}
          </div>
        </div>
      ),
    },
  ];

  const categoryOptions = useMemo(() => {
    return (categories || []).map((c) => ({
      label: c?.categoryname || c?.name,
      value: c?._id || c?.id,
    }));
  }, [categories]);


  const employeeOptions = useMemo(() => {
    return (employees || []).map((e) => ({
      label:
        e?.fullName ||
        e?.name ||
        `${e?.firstName || ""} ${e?.lastName || ""}`.trim(),
      value: e?._id || e?.id,
    }));
  }, [employees]);

  const statusOptions = useMemo(() => {
    const unique = Array.from(new Set((assets || []).map((a) => a?.status).filter(Boolean)));
    return unique.map((s) => ({ label: s, value: s }));
  }, [assets]);

  const handleAlphabeticInput = (e) => {
    const val = e?.target?.value || "";
    const cleaned = val.replace(/[^a-zA-Z ]/g, "");
    filterForm.setFieldsValue({ name: cleaned });
  };

  const handleAlphabetInput = (e) => {
    const val = e?.target?.value || "";
    const cleaned = val.replace(/[^a-zA-Z ]/g, "");
    form.setFieldsValue({ name: cleaned });
  };
  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Assets - {t("header.daftarPro")}</title>
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

      {/* Search Filter */}
      <Form form={filterForm} onFinish={onFilterFinish}>
        <div className="row filter-row">
          <div className="col-sm-6 col-md-3 col-lg-3 col-xl-3 col-12">
            <div className="form-group">
              <Form.Item name="name" className="custom-border">
                <Input
                  className="form-control"
                  style={{ height: "50px" }}
                  placeholder={"Asset Name"}
                  onChange={handleAlphabeticInput}
                />
              </Form.Item>
            </div>
          </div>
          <div className="col-sm-6 col-md-3 col-lg-3 col-xl-3 col-12">
            <div style={{ position: "relative" }} id="assetsFilterArea1">
              <Form.Item name="assetCategoryId" className="custom-border">
                <Select
                  className="custom-select"
                  style={{ width: "100%" }}
                  placeholder={"Category"}
                  size="large"
                  showSearch
                  options={categoryOptions}
                  getPopupContainer={() => document.getElementById("assetsFilterArea1")}
                  filterOption={(input, option) =>
                    (option?.label || "").toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </div>
          </div>
          <div className="col-sm-6 col-md-3 col-lg-3 col-xl-3 col-12">
            <div style={{ position: "relative" }} id="assetsFilterArea2">
              <Form.Item name="status" className="custom-border">
                <Select
                  className="custom-select"
                  style={{ width: "100%" }}
                  placeholder={"Status"}
                  size="large"
                  showSearch
                  options={statusOptions}
                  getPopupContainer={() => document.getElementById("assetsFilterArea2")}
                  filterOption={(input, option) =>
                    (option?.label || "").toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </div>
          </div>
          <div
            className="col-sm-6 col-md-3 col-lg-3 col-xl-3 col-12"
            style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: "2px" }}
          >
            <button
              href="javascript:void(0)"
              type="submit"
              className="btn btn-success btn-block w-100"
              disabled={isLoading}
            >
              {t("search")}
            </button>
            <button
              href="javascript:void(0)"
              type="reset"
              onClick={() => {
                filterForm.resetFields();
                setFilterValues(null);
                setPagination({ ...pagination, current: 1 });
                fetchAssets("", 1, pagination.pageSize);
              }}
              className="btn btn-success btn-block w-100 resetButton"
              style={{ backgroundColor: "#616161", color: "white", borderColor: "#aeaeae" }}
              disabled={isLoading}
            >
              {t("reset")}
            </button>
          </div>
        </div>
      </Form>
      {/* /Search Filter */}

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
                onRow={(record, rowIndex) => {
                  const baseProps = {
                    style: {
                      cursor: "pointer",
                      ...(i18n.dir() === "rtl" ? { textAlign: "right" } : {}),
                    },
                    onClick: (e) => {
                      // Don't navigate if clicking on the actions dropdown or its trigger
                      if (
                        e.target.closest(".dropdown-action") ||
                        e.target.closest(".dropdown-toggle") ||
                        e.target.closest(".dropdown-menu") ||
                        e.target.closest(".dropdown-item")
                      ) {
                        return;
                      }
                      nav(`/assets/${record?._id}`, { state: { asset: record } });
                    },
                  };
                  return baseProps;
                }}
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
                onChange={(page, pageSize) => {
                    setPagination({ ...pagination, current: page, pageSize });
                    fetchAssets(filterValues, page, pageSize);
                  }}
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
                        label="SerialNumber"
                        name="serialNumber"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Serial number is required",
                          },
                        ]}
                      >
                        {serialNumberLoading ? (
                          <div
                            style={{
                              width: "100%",
                              height: 40,
                              backgroundColor: "#f5f5f5",
                              border: "1px solid #d9d9d9",
                              borderRadius: 6,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Spin size="small" />
                          </div>
                        ) : (
                          <Input
                            className="form-control"
                            maxLength={50}
                            readOnly
                            style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                          />
                        )}
                      </Form.Item>
                    </div>
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
                        <Input className="form-control" maxLength={50} onChange={handleAlphabetInput}/>
                      </Form.Item>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Item
                        label="Model"
                        name="model"
                        className="custom-border"
                      >
                        <Input className="form-control" maxLength={15} />
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item
                        label="Manufacturer"
                        name="manufacturer"
                        className="custom-border"
                      >
                        <Input className="form-control" maxLength={80} />
                      </Form.Item>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
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
                          maxLength={10}
                          onKeyPress={(e) => {
                            if (!/[0-9]/.test(e.key)) {
                              e.preventDefault(); // block letters or symbols
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault(); // Stop default paste
                            const paste = (e.clipboardData || window.clipboardData).getData("text");
                            const onlyNumbers = paste.replace(/\D/g, ""); // Remove non-digits
                            if (onlyNumbers) {
                              // Insert the cleaned number into the field
                              const input = e.target;
                              const currentValue = input.value?.toString() || "";
                              let newValue = currentValue + onlyNumbers;
                              newValue = newValue.slice(0, 10);
                              form.setFieldsValue({price: newValue})
                            }
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item
                        label="Quantity"
                        name="quantity"
                        className="custom-border"
                        initialValue={1}
                        // rules={[{ type: "number", min: 1, message: "Min 1" }]}
                      >
                        <InputNumber
                          className="form-control"
                          style={{ width: "100%" }}
                          min={1}
                          maxLength={10}
                          onKeyPress={(e) => {
                            if (!/[0-9]/.test(e.key)) {
                              e.preventDefault(); // block letters or symbols
                            }
                          }}
                          onPaste={(e) => {
                            e.preventDefault();
                            const paste = (e.clipboardData || window.clipboardData).getData("text");
                            const onlyNumbers = paste.replace(/\D/g, ""); // Keep only digits
                            if (onlyNumbers) {
                              const input = e.target;
                              const currentValue = input.value?.toString() || "";
                              let newValue = currentValue + onlyNumbers;
                              newValue = newValue.slice(0, 10);
                              form.setFieldsValue({quantity: newValue})
                            }
                          }}
                        />
                      </Form.Item>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Item
                        label="Category"
                        name="assetCategoryId"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Please select category",
                          },
                        ]}
                      >
                        <Select
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
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
                              <>
                                <Divider style={{ margin: '5px 0' }} />
                                <Button
                                  type="button"
                                  icon={<PlusOutlined style={{ fontSize: '20px', marginRight: '5px' }} />}
                                  className="addButtonStyles"
                                  style={{ width: '100%', height: '40px', background: '#efefef', borderColor: '#efefef', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                  onClick={() => setIsCategoryModalOpen(true)}
                                >
                                  Add Category
                                </Button>
                              </>
                            </>
                          )}
                          onChange={() => {
                            form.setFieldsValue({ assetSubCategoryId: undefined });
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item
                        noStyle
                        shouldUpdate={(prev, cur) =>
                          prev.assetCategoryId !== cur.assetCategoryId
                        }
                      >
                        {({ getFieldValue }) => {
                          const selectedCategoryId = getFieldValue("assetCategoryId");
                          const filteredSubCategories = selectedCategoryId
                            ? (subCategories || []).filter(
                                (sc) =>
                                  sc?.assetCategoryId?._id === selectedCategoryId ||
                                  sc?.assetCategoryId === selectedCategoryId ||
                                  sc?.categoryId?._id === selectedCategoryId ||
                                  sc?.categoryId === selectedCategoryId
                              )
                            : subCategories || [];
                          const filteredSubCategoryOptions = filteredSubCategories.map((sc) => ({
                            label: sc?.assetSubCategoryName || sc?.subcategoryname || sc?.name,
                            value: sc?._id || sc?.id,
                          }));

                          return (
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
                                options={filteredSubCategoryOptions}
                                filterOption={(input, option) =>
                                  (option?.label || "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                                disabled={!selectedCategoryId}
                                dropdownRender={(menu) => (
                            <>
                              {menu}
                              {
                                  <>
                                    <Divider
                                      style={{
                                        margin: '5px 0',
                                      }}
                                    />
                                    <Button
                                      type="button" icon={<PlusOutlined style={{fontSize: '20px', marginRight: '5px'}} />}
                                      className="addButtonStyles"
                                      style={{width: '100%', height: '40px', background: '#efefef', borderColor: '#efefef', display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                                      onClick={() => setIsSubCatModalOpen(true)}
                                    >
                                      Add Sub-Category
                                    </Button>
                                  </>
                              }
                            </>
                          )}
                        />
                            </Form.Item>
                          );
                        }}
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
                                allowClear
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
                  {assignedEmployeeWatch ? (
                    <div className="row">
                      <div className="col-md-6">
                        <Form.Item
                          label="Assigned Date"
                          name="assignedDate"
                          className="custom-border"
                        >
                          <DatePicker
                            className="form-control"
                            style={{ width: "100%", minHeight: "45px" }}
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            disabledDate={(current) =>
                              current && current > moment().endOf("day")
                            }
                          />
                        </Form.Item>
                      </div>
                      <div className="col-md-6">
                        <Form.Item
                          label="Expected Return Date"
                          name="expectedReturnDate"
                          className="custom-border"
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
                  ) : null}
                  {assignedEmployeeWatch ? (
                    <div className="row">
                      <div className="col-md-12">
                        <Form.Item
                          label="Assignment Note"
                          name="assignmentNote"
                          className="custom-border"
                        >
                          <Input.TextArea
                            className="form-control"
                            rows={2}
                            maxLength={500}
                            placeholder="Add assignment note"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  ) : null}
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Item
                        label="Supplier"
                        name="supplier"
                        className="custom-border"
                      >
                        <Input className="form-control" maxLength={80} />
                      </Form.Item>
                    </div>
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
                  </div>

                  <div className="row">
                    <div className="col-md-3">
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
                          disabledDate={(current) => current && current > moment().endOf('day')}
                          getPopupContainer={() =>
                            document.getElementById("area")
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
                            { label: "Used", value: "Used" },
                            { label: "Refurbished", value: "Refurbished" },
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
                    <div className="col-md-3">
                      <Form.Item
                        label="Status"
                        name="status"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Please select status",
                          },
                        ]}
                      >
                        <Select
                          className="custom-select custom-normal"
                          options={fixedStatusOptions}
                          disabled={!!assignedEmployeeWatch}
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <Form.Item
                        label="Description"
                        name="description"
                        className="custom-border"
                      >
                        <Input.TextArea
                          className="form-control"
                          rows={3}
                          maxLength={500}
                          placeholder="Add description"
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

      <AssetsSubCategoryModal
        open={isSubCatModalOpen}
        onClose={() => setIsSubCatModalOpen(false)}
        onSuccess={() => {
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
            .catch(() => {});
        }}
      />

      <AssetsCategoryModal
        open={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={() => {
          apiServices(
            "GET",
            `assets-category/?page=1&limit=1000`,
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

      {/* <Modal
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
      </Modal> */}
    </div>
  );
};

export default Assets;
