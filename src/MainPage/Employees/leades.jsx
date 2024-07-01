import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import {
  Avatar_11,
  Avatar_09,
  Avatar_02,
  Avatar_10,
  Avatar_05,
  Avatar_12,
  Avatar_01,
  Avatar_13,
  Avatar_16,
  user_icon,
} from "../../Entryfile/imagepath";
import {
  Avatar,
  Button,
  Checkbox,
  DatePicker,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Pagination,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import { Modal } from "@mui/material";
import "antd/dist/antd.css";
import { itemRender, onShowSizeChange } from "../paginationfunction";
import "../antdstyle.css";
import EmptyTable from "../../files/Icons/EmptyTable.svg";
import Offcanvas from "../../Entryfile/offcanvance";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { apiServices } from "../../Services/apiServices";
import moment from "moment";
import { DeleteOutlined, LoadingOutlined, MinusCircleFilled, PlusOutlined } from "@ant-design/icons";
import { getAllISOCodes } from "iso-country-currency";

const Leads = () => {
  const { t, i18n } = useTranslation();

  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const user_state = useSelector((state) => state.user.loginvalue);
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  //console.log(permissions)
  const role = user_state?.user?.role;
  const nav = useNavigate();

  const [data, setData] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [loader, setLoader] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [flag, setFlag] = useState(true);

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(20);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 20,
  });
  const [isStatLoading, setIsStatLoading] = useState(true);

  const [filters, setFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    accountManager: "",
    projectType: "",
  });

  const [selectedFilters, setSelectedFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
    accountManager: "",
    projectType: "",
  });

  
  const [leadObj, setLeadObj] = useState();
  const [employees, setEmployees] = useState([]);
  const [accountManagers, setAccountManagers] = useState([]);
  const [stats, setStats] = useState({});
  const [mediumOptions, setMediumOptions] = useState([]);
  const [sourceOptions, setSourceOptions] = useState([]);
  const [addMedium, setAddMedium] = useState(false);
  const [addSource, setAddSource] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [previous, setPrevious] = useState(false);

  const [open, setOpen] = useState({
    isAddOpen: false,
    isEditOpen: false,
    data: "",
  });
  const [open2, setOpen2] = useState({
    isAddOpen: false,
    isEditOpen: false,
    data: "",
  });
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [tempName, setTempName] = useState("");
  const [tempImage, setTempImage] = useState("");
  const [tempSource, setTempSource] = useState("");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMedium, setSelectedMedium] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);

  const handleOk = () => {
    setLoader(true);
    if (selectedMedium) {
      apiServices("DELETE", "leads/delete-medium", selectedMedium?._id, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          message.success('Option removed Successfully');
          setMediumOptions(prevOptions => prevOptions.filter(proj=> proj._id !== selectedMedium?._id))
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
              : 'Error Deleting Option'
          }!`
        );
        setLoader(false);
      });
    }
    if (selectedSource) {
      apiServices("DELETE", "leads/delete-source", selectedSource?._id, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          message.success('Option removed Successfully');
          setSourceOptions(prevOptions => prevOptions.filter(proj=> proj._id !== selectedSource?._id))
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
              : 'Error Deleting Option'
          }!`
        );
        setLoader(false);
      });
    }
    handleCancel();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedMedium(null);
    setSelectedSource(null);
  };

  useEffect(() => {
    if ( role === 'admin' || permissions?.leadsManagement ) {
    setIsLoading(true);
    viewLeads();
    } else {
      nav('/restricted', { state: { unAuthorize: true}})
    }
  }, [filters]);

  useEffect(() => {
    if ( role === 'admin' || permissions?.leadsManagement ) {
    setIsStatLoading(true);
    fetchEmployees();
    viewSources();
    viewMediums();
    } else {
      nav('/restricted', { state: { unAuthorize: true}})
    }
  }, []);

  const getEmployeeImage = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    //setTempImage(employee?.imageUrl || "")
    return employee?.imageUrl || "";
  };

  const getEmployeeFullName = (employeeId) => {
    const employee = employees.find((emp) => emp._id === employeeId);
    //setTempName(employee ? employee.fullName : "")
    return employee ? employee.fullName : "";
  };

  const showTeamSearch = (val, type) => {
    let dropdownValues = [];
    if (type === "Team") {
      employees.forEach((team) => {
        dropdownValues.push(team.fullName.toLowerCase());
      });
    } else if (type === "source") {
      sourceOptions.forEach((source) => {
        dropdownValues.push(source?.title?.toLowerCase());
      });
    } else if (type === "medium") {
      mediumOptions.forEach((medium) => {
        dropdownValues.push(medium?.title?.toLowerCase());
      });
    }
    else if (type === "accountManager") {
      accountManagers.forEach((medium) => {
        dropdownValues.push(medium?.fullName?.toLowerCase());
      });
    }

    if (val !== "") {
      dropdownValues.some((team) => {
        if (team?.includes(val?.toLowerCase())) {
          // setNoData(false);
          return true;
        } else {
          // setNoData(true);
        }
      });
    } else {
      // setNoData(false)
    }
  };

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
    setOpen2({ isAddOpen: false, isDelOpen: false, data: "" });
    form.resetFields();
    setSelectedLeader(null);
    setLoader(false);
    setTempImage("");
    setTempSource("");
    setTempName("");
  };

  const viewLeads = (page, pageSize) => {
    const params = {
      ...filters,
      page: page || pagination.current,
      limit: pageSize || pagination.pageSize,
    };

    apiServices("GET", `leads?status=${filters.status}&projectType=${filters.projectType}&accountManager=${filters.accountManager}&firstReachOut=${filters.startDate}&lastReachOut=${filters.endDate}&page=${params.page}&limit=${params.limit}`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const leads = res?.data?.Lead?.docs;
          setStats(res?.data?.stats);
          if (flag) {
            setAccountManagers(res?.data?.accountManagers);
          }
          setLeadObj(res?.data?.Lead);
          setData(leads);
          // setPagination({
          //   ...pagination,
          //   current: res?.data?.Lead?.page,
          //   total: res?.data?.Lead?.total,
          // });
          setPagination({
            ...pagination,
            current : parseInt(res?.data?.Lead?.page, 10),
            pageSize : parseInt(res?.data?.Lead?.limit, 10),
            total: res?.data?.Lead?.total,
          });
          setPage(parseInt(res?.data?.Lead?.page, 10));
          setSize(parseInt(res?.data?.Lead?.limit, 10));
          setFlag(false);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error getting leads"
          }`
        );
      }).then(()=>{
        setIsLoading(false);
        setIsStatLoading(false);
        //setFlag(false);
      });
  };

  const handlePageChange = (page, pageSize) => {
    // Update the pagination state
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize,
    });
    setIsLoading(true);
    viewLeads(page, pageSize);
  };

  const fetchEmployees = () => {
    apiServices("GET", `user/all-employees`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const emps = res?.data?.User;
          const sortedData = emps
            .slice()
            .sort((a, b) => a.fullName.localeCompare(b.fullName));
          setEmployees(sortedData);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t("aAttend.errors.getEmployeesError")
          }`
        );
      });
  };

  const handleFilterChange = (value, filterType) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value,
    });
  };

  const handleSearch = () => {
    if (!selectedFilters.accountManager && !selectedFilters.endDate && !selectedFilters.projectType && !selectedFilters.startDate && !selectedFilters.status){
      message.warning('No Filter Selected')
    }
    else {
    setFilters(selectedFilters);
    setPagination({
      ...pagination,
      current: 1,
    });
  }
  };

  const handleReset = () => {
    setSelectedFilters({
      status: "",
      startDate: "",
      endDate: "",
      projectType: "",
      accountManager: "",
    });
    setFilters({
      status: "",
      startDate: "",
      endDate: "",
      projectType: "",
      accountManager: "",
    });

    form2.resetFields();
    setPagination({
      current: 1,
      pageSize: 20,
      total: 0,
    });
  };

  const viewSources = () => {
    apiServices("GET", `leads/view-source`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const sources = res?.data?.Sources;
          setSourceOptions(sources);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error getting mediums"
          }`
        );
      });
  };

  const viewMediums = () => {
    apiServices("GET", `leads/view-medium`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const mediums = res?.data?.Mediums;
          setMediumOptions(mediums);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Error getting Medium options"
          }`
        );
      });
  };

  const [reachOuts, setReachOuts] = useState([
    {
      date: null,
      communicationMedium: "",
      communicatedBy: "",
      comments: "",
    },
  ]);
  const [reachOutValues, setReachOutValues] = useState([]);

  const addReachOuts = () => {
    setReachOuts([
      ...reachOuts,
      {
        date: null,
        communicationMedium: "",
        communicatedBy: "",
        comments: "",
      },
    ]);
  };

  const removeReachOuts = (indexToRemove) => {
    const updatedReachOuts = reachOuts.filter(
      (_, index) => index !== indexToRemove
    );
    setReachOuts(updatedReachOuts);
  };

  const onFinish = (values, info) => {
    setLoader(true);
    if (values?.reachOut) {
      values.reachOut = moment(values.reachOut).format("YYYY-MM-DD");
    }
    if (values?.reachOuts && Array.isArray(values?.reachOuts)) {
      values.reachOuts = values.reachOuts.map(reachOut => {
          if (reachOut?.date) {
              reachOut.date = moment(reachOut.date).format("YYYY-MM-DD");
          }
          return reachOut;
      });
  }
    if (info) {
      let updated_data = {
        ...values,
        companyId: info?.companyId,
        _id: info?._id,
      };

      apiServices("PUT", "leads", updated_data, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            //console.log(data);
            viewLeads();
            //getHolidays();
            handleClose();
            message.success("Lead information updated");
            setLoader(false);
          }
        })
        .catch((err) => {
          setLoader(false);
          // console.log(err);
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Error updating lead information"
            }!`
          );
        });
    } else {
      apiServices("POST", "leads", values, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            //console.log(data);
            setData([
              {
                ...values,
                accountManager: {
                  _id: values.accountManager,
                  fullName: tempName,
                  imageUrl: tempImage,
                },
                source: {
                  _id: values.source,
                  title: tempSource,
                },
                reachOut: values.reachOut,
                lastReachOut: values.reachOut,
                reachOuts: res?.data?.Lead?.reachOuts,
                _id: res?.data?.Lead?._id,
              },
              ...data,
            ]);
            handleClose();
            message.success("Lead Added Successfully");
            setLoader(false);
          }
        })
        .catch((err) => {
          setLoader(false);
          // console.log(err);
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Error Adding Lead"
            }!`
          );
        });
    }
  };

  const onFinishReachOuts = (values, info) => {
    setLoader(true);
    if (values?.reachOuts && Array.isArray(values?.reachOuts)) {
      values.reachOuts = values.reachOuts.map(reachOut => {
          if (reachOut?.date) {
              reachOut.date = moment(reachOut.date).format("YYYY-MM-DD");
          }
          return reachOut;
      });
  }
      let updated_data = {
        ...values,
        companyId: info?.companyId,
        _id: info?._id,
      };
      apiServices("PUT", "leads", updated_data, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            //console.log(data);
            viewLeads();
            //getHolidays();
            handleClose();
            message.success("Lead information updated");
            setLoader(false);
          }
        })
        .catch((err) => {
          setLoader(false);
          // console.log(err);
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : "Error updating lead information"
            }!`
          );
        });
  };

  const handleUpdateStatus = (record, newStatus) => {
    const updatedData = {
      _id: record?._id,
      status: newStatus,
    };
    apiServices("PUT", "leads", updatedData, user_state)
      .then((res) => {
        if (res.data.success === true) {
          message.success('Status Updated Successfully');
          viewLeads();
        }
      })
      .catch((error) => {
        console.log("error", error);
        message.error('Error updating status');
      })
  };

  const columns = [
    {
      title: "#",
      dataIndex: "id",
      key: "index",
      render: (text, record, index) => (page - 1) * size + index + 1,
    },
    {
      title: "Name",
      dataIndex: "leadName",
      key: "leadName",
    },
    {
      title: "Client",
      dataIndex: "clientName",
      key: "clientName",
    },

    {
      title: "Status",
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => (
        <div>
          <a
            className="btn btn-white btn-sm btn-rounded dropdown-toggle"
            href="javascript:void(0)"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            onClick={(e) => e.preventDefault()}
          >
            <i
              className={`fa ${
                text === "onHold"
                  ? "fa-dot-circle-o text-purple"
                  : text === "pending"
                  ? "fa-dot-circle-o text-info"
                  : text === "converted"
                  ? "fa-dot-circle-o text-success"
                  : "fa-dot-circle-o text-primary"
              }`}
            />{" "}
            {text === "pending" ? t("aRequests.Pending") : text === "converted" ? "Converted" : text === "notConverted" ? 'Not Converted' : text === "onHold" ? "On Hold" : text}
          </a>
          <div
            className="dropdown-menu dropdown-menu-right"
          >
            <a
              className={`dropdown-item ${text === "pending" && "disabled"}`}
              href="javascript:void(0)"
              onClick={(e) => {
                e.preventDefault();
                handleUpdateStatus(record, "pending");
              }}
            >
              <i className="fa fa-dot-circle-o text-info" /> Pending
            </a>
            <a
              className={`dropdown-item ${text === "onHold" && "disabled"}`}
              href="javascript:void(0)"
              onClick={(e) => {
                e.preventDefault();
                handleUpdateStatus(record, "onHold");
              }}
            >
              <i className="fa fa-dot-circle-o text-purple" /> On Hold
            </a>
            <a
              className={`dropdown-item ${text === "converted" && "disabled"}`}
              href="javascript:void(0)"
              onClick={(e) => {
                e.preventDefault();
                handleUpdateStatus(record, "converted");
              }}
            >
              <i className="fa fa-dot-circle-o text-success" /> Converted
            </a>
            <a
              className={`dropdown-item ${text === "notConverted" && "disabled"}`}
              href="javascript:void(0)"
              onClick={(e) => {
                e.preventDefault();
                handleUpdateStatus(record, "notConverted");
              }}
            >
              <i className="fa fa-dot-circle-o text-primary" /> Not Converted
            </a>
          </div>
        </div>
      ),
    }, 

    {
      title: "Comments",
      dataIndex: "comments",
      key: "comments",
      render: (text, record) => (
        <label className="longText4">
          {text ? text : "-"}
        </label>
      ),
    },

    {
      title: "Account Manager",
      dataIndex: "accountManager",
      key: "accountManager",
      render: (text, record) => (
        <h2 className="table-avatar">
          <label className="avatar">
            <img alt="" src={record?.accountManager?.imageUrl || user_icon} />
          </label>
          <label>{record?.accountManager?.fullName}</label>
          {/* <label>{text} <span>{record?.user?.role}</span></label> */}
        </h2>
      ),
    },
    {
      title: "First Reach Out",
      dataIndex: "reachOut",
      render: (text) => moment(text).format("D MMM YYYY"),
    },
    {
      title: "Last Reach Out",
      dataIndex: "lastReachOut",
      render: (text) => moment(text).format("D MMM YYYY"),
    },
    {
      title: "Project Worth",
      dataIndex: "projectWorth",
      render: (text, record) => (
        <label>
          {record?.projectWorth ? `${record?.projectWorth?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${record?.currency ? record?.currency : ""}` : "-"}
        </label>
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (text, record) => <label>{record?.source?.title}</label>,
    },
    {
      title: "Action",
      render: (text, record) => (
        <div className="dropdown dropdown-action text-end">
          <a
            href="#"
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
              onClick={() => {
                getAllCurrencies();
                setOpen({
                  isAddOpen: true,
                  isDelOpen: false,
                  data: record,
                });
                setReachOutValues(record?.reachOuts)
                form.setFieldsValue({
                  ...record,
                  reachOut: moment(record?.reachOut, "YYYY-MM-DD"),
                  accountManager: record?.accountManager?._id,
                  source: record?.source?._id,
                  communicationMedium: record?.communicationMedium,
                  reachOuts: record?.reachOuts?.map((reachOut) => ({
                    ...reachOut,
                    date: reachOut.date
                    ? moment(reachOut.date, "YYYY-MM-DD")
                    : null,
                  })
                )
                });
                const initialReachouts = Array.from(
                  { length: record?.reachOuts?.length },
                  (_, index) => ({
                    date: null,
                    communicationMedium: "",
                    communicatedBy: "",
                    comments: "",
                  })
                );
                setReachOuts(initialReachouts);
              }}
            >
              <i className="fa fa-pencil m-r-5" /> Edit
            </a>
            <a className="dropdown-item" 
            href="javascript:void(0)"
            onClick={() => {
              setOpen2({
                isAddOpen: true,
                isDelOpen: false,
                data: record,
              });
              form.setFieldsValue({
                ...record,
                reachOut: moment(record?.reachOut, "YYYY-MM-DD"),
                accountManager: record?.accountManager?._id,
                source: record?.source?._id,
                communicationMedium: record?.communicationMedium,
                reachOuts: record?.reachOuts?.map((reachOut) => ({
                  ...reachOut,
                  date: reachOut.date
                  ? moment(reachOut.date, "YYYY-MM-DD")
                  : null,
                })
              )
              });
              const initialReachouts = Array.from(
                { length: record?.reachOuts?.length },
                (_, index) => ({
                  date: null,
                  communicationMedium: "",
                  communicatedBy: "",
                  comments: "",
                })
              );
              setReachOuts(initialReachouts);
            }}
            >
              <i className="fa fa-plus m-r-5" /> Reach Out
            </a>
            <a className="dropdown-item" 
            href="javascript:void(0)"
            onClick={() => {
              setOpen({
                isAddOpen: false,
                isDelOpen: true,
                data: record,
              });
            }}
            >
              <i className="fa fa-trash-o m-r-5" /> Delete
            </a>
          </div>
        </div>
      ),
    },
  ];

  const validateProjectWorth = (rule, value) => {
    const currency = form.getFieldValue("currency");
    if (value && !currency) {
      return Promise.reject(
        new Error(t("projectScreen.Modal.chooseCurrency"))
      );
    }
    return Promise.resolve();
  };

  // Custom validator for Currency
  const validateCurrency = (rule, value) => {
    const projectWorth = form.getFieldValue("projectWorth");
    if (value && !projectWorth) {
      return Promise.reject(
        new Error('Enter a project worth')
      );
    }
    return Promise.resolve();
  };
  const [allCurrencies, setAllCurrencies] = useState([]);

  const getAllCurrencies = () => {
    const isoCodes = getAllISOCodes();
    const uniqueCurrencies = new Set();
    isoCodes.forEach(isoCode => {
        // const currency = isoCode.currency;
        const currency = {
          currency: isoCode?.currency,
          symbol: isoCode?.symbol
        };
        // uniqueCurrencies.add(currency);
        uniqueCurrencies.add(JSON.stringify(currency));
    });
    const currency_d = [...uniqueCurrencies].map(currency => JSON.parse(currency));
    const sorted_data = currency_d.sort((a, b) => a.currency.localeCompare(b.currency));
    // setAllCurrencies([...uniqueCurrencies])
    setAllCurrencies(sorted_data)
  };

  const reachOutColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text, record, index) => (
        <div style={{ position: "relative" }} id={`date-${index}`}>
          <Form.Item
            name={["reachOuts", index, "date"]}
            rules={[
              {
                required: true,
                message: "please enter a date",
              },
            ]}
            className="custom-border"
            style={{ width: "max-content" }}
          >
            <DatePicker
              suffixIcon={null}
              getPopupContainer={() =>
                document.getElementById(`date-${index}`)
              }
              placeholder={t("requests.addModal.selectDate")}
              className="form-control"
              size="large"
            />
          </Form.Item>
        </div>
      ),
    },
    {
      title: "Communication Medium",
      dataIndex: "communicationMedium",
      key: "communicationMedium",
      render: (text, record, index) => (
        <div style={{ position: "relative" }} id={`medium-${index}`}>
        <Form.Item
          name={["reachOuts", index, "communicationMedium"]}
          className="custom-border"
          rules={[
            {
              required: true,
              message: "please select a medium",
            },
          ]}
        >
          <Select
            showSearch
            onSearch={(val) => {
              setSearchValue(val);
              showTeamSearch(val, "medium");
              // onTeamChange(val)
            }}
            filterOption={(input, option) =>
              option.children[0]?.toLowerCase()?.indexOf(input?.toLowerCase()) >= 0
            }
            optionFilterProp="children"
            className="custom-select custom-normal"
            getPopupContainer={() => document.getElementById(`medium-${index}`)}
            notFoundContent={<></>}
            dropdownRender={(menu) => (
              <>
                {menu}
                {searchValue && !mediumOptions?.some(option => option?.title?.toLowerCase() === searchValue?.toLowerCase()) && (
                  <>
                    <Divider style={{ margin: "5px 0" }} />
                    <Button
                      type="button"
                      icon={
                        <PlusOutlined style={{ fontSize: "20px", marginRight: "5px" }} />
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
                      onClick={() => handleAddMedium(searchValue)}
                    >
                      {`Add "${searchValue}"`}
                    </Button>
                  </>
                )}
              </>
            )}
            style={{
              width: "100%",
            }}
            placeholder="Select a Medium"
            onDropdownVisibleChange={(open) => setOpen1(open)}
            // onChange={(value)=>
            //   setReachOutValues((prev) => [...prev, { communicationMedium: value }])
            // }
            onChange={(value)=>{
              setReachOutValues((prev) =>
                prev.filter((reachOut) => reachOut.communicationMedium !== previous)
              );
              setReachOutValues((prev) => [...prev, { communicationMedium: value }])
            }}
          >
            {mediumOptions?.map((item) => {
              setPrevious(form.getFieldValue(['reachOuts',index,'communicationMedium'],));
              const isCommunicationMedium = reachOutValues.some(reachOut => reachOut.communicationMedium === item._id);
              return (
                <Option key={item?._id} value={item?._id}>
                  {item?.title}
                  {
                  //open1 && item?._id !== form.getFieldValue(['reachOuts',index,'communicationMedium'],) && (
                  open1 && !isCommunicationMedium && (
                    <span style={{ float: "right" }}>
                      <DeleteOutlined
                        onClick={(e) => {
                          console.log(item?._id, form.getFieldValue(['reachOuts',index,'communicationMedium'],))
                          e.stopPropagation();
                          setSelectedMedium(item);
                          setIsModalVisible(true);
                        }}
                      />
                    </span>
                  )}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
        </div>
      ),
    },
    {
      title: "Communicated By",
      dataIndex: "communicatedBy",
      key: "communicatedBy",
      render: (text, record, index) => (
        <Form.Item
          name={["reachOuts", index, "communicatedBy"]}
          className="custom-border"
          rules={[
            {
              required: true,
              message: "Enter name of communication person",
            },
          ]}
        >
          <Input
            className="form-control"
            placeholder="Enter a Name"
            maxLength={50}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Comments',
      dataIndex: "comments",
      key: "comments",
      render: (text, record, index) => (
          <Form.Item
            name={["reachOuts", index, "comments"]}
            className="custom-border"
          >
            <Input
            className="form-control"
            placeholder="Enter any comment"
            maxLength={50}
          />
          </Form.Item>
      ),
    },

    {
      title: t('projectScreen.Modal.action'),
      key: "action",
      render: (text, record, index) => (
        <span
          style={{
            color:
              reachOuts?.length > 1
                ? index === reachOuts?.length - 1
                  ? "red"
                  : "#ccc"
                : "#ccc",
            cursor: "pointer",
          }}
        >
          {/* <span style={{ color: index === paymentSchedules?.length - 1 ? 'red' : '#ccc', cursor: 'pointer' }}> */}
          <MinusCircleFilled
            onClick={() => {
              if (
                reachOuts?.length > 1 &&
                index === reachOuts?.length - 1
              ) {
                removeReachOuts(index);
              }
            }}
          />
        </span>
      ),
    },
  ];

  const handleAddMedium = (values) => {
    setLoader(true);
    let data = {
      title: values
    }
      apiServices("POST", "leads/add-medium", data, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            setMediumOptions([
                ...mediumOptions,
                {
                    title: values,
                    _id: res?.data?.Medium?._id,
                }
            ])
            //message.success('Medium added successfully');
            setLoader(false);
          }
        })
        .catch((err) => {
          setLoader(false);
          // console.log(err);
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : 'error adding medium'
            }!`
          );
        });
  };

  const handleAddSource = (values) => {
    setLoader(true);
    let data = {
      title: values
    }
      apiServices("POST", "leads/add-source", data, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            setSourceOptions([
                ...sourceOptions,
                {
                    title: values,
                    _id: res?.data?.Source?._id,
                }
            ])
            //message.success('Source added successfully');
            setLoader(false);
          }
        })
        .catch((err) => {
          setLoader(false);
          // console.log(err);
          message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : 'error adding source'
            }!`
          );
        });
  };

  const customEmptyText = (
    <Empty
      image={<img src={EmptyTable} />}
      // image={<InboxOutlined />}
      imageStyle={
        {
          // fontSize: 48,
          // color: '#1890ff',
        }
      }
      style={{
        height: "300px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
      description={
        <div style={{ display: "" }}>
          <div
            style={{
              color: "#34343F",
              fontWeight: "500",
              fontSize: "14px",
              margin: "7px 0px 4px 0px",
            }}
          >
            No data found
          </div>
          {/* <div
                    style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
                  >
                    Click 'Add Employees' Button To Create <br /> A New Employee{" "}
                  </div> */}
        </div>
      }
    />
  );

  const onHandleDelete = (id) => {
    setLoader(true);
    apiServices("DELETE", "leads", id, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // console.log(data);
          // setCategory([...category.filter((category) => category._id !== id)]);
          // if(categoryObj?.docs?.length === 1){
          //   console.log(categoryObj.totalPages)
          //   viewCategory((categoryObj.totalPages-1),null);
          // }
          // else{
          //}
          if(leadObj?.docs?.length === 1){
            //console.log(holidayObj.totalPages)
            viewLeads((leadObj.pages-1),null);
          }
          else{
            viewLeads()
          }
          handleClose();
          message.success('Lead Deleted Successfully');
          //viewCategory();
          setLoader(false);
        }
      })
      .catch((err) => {
        setLoader(false);
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : 'Error Deleting Lead'
          }!`
        );
      });
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
    <div className="page-wrapper">
      <Helmet>
        <title>Leads - DaftarPro</title>
        <meta name="description" content="Login page" />
      </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col">
              <h3 className="page-title">Leads</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link
                    to={
                      role === "admin"
                        ? "/main/dashboard"
                        : "/employee/dashboard"
                    }
                  >
                    {t("holiday.dashboard")}
                  </Link>
                </li>
                <li className="breadcrumb-item active">Leads</li>
              </ul>
            </div>
            <div className="col-auto float-end ms-auto">
              <a
                href="javascript:void(0)"
                className="btn add-btn"
                onClick={() => {
                  getAllCurrencies();
                  setOpen({
                    isAddOpen: true,
                    isDelOpen: false,
                    data: "",
                  });
                }}
              >
                <i className="fa fa-plus" /> Add Lead
              </a>
            </div>
          </div>
        </div>

        {
            isStatLoading ? 
            <div className="row" style={{minHeight: '83px', display: 'grid', placeItems: 'center', background: '#ebebeb', borderRadius: '5px', marginBottom: '20px', marginInline: '0px'}}>
              <Spin />
            </div> :
        <div className="row" style={{marginBottom:"20px"}}>
          <div className="col-md-3 custom-col-md-3" >
              <div className="stats-info">
              <label className="custom-label">Active Leads</label>
              <div style={{ display: "flex", flexDirection:"row", alignItems: "baseline", justifyContent:"center"}}>
                  <h4 style={{ marginRight: "5px" }}>{stats?.activeLeads ? stats?.activeLeads : "0"}</h4>
              </div>
              </div>
          </div>
          <div className="col-md-3 custom-col-md-3">
            <div className="stats-info" style={{paddingBottom:'20px'}}>
              <label className="custom-label">Pending Leads</label>
              <div style={{ display: "flex", flexDirection:"row", alignItems: "baseline", justifyContent:"center"}}>
                  <h5 style={{ marginRight: "5px" }}>{stats?.pendingPercentage ? `${stats?.pendingPercentage}% (${stats?.pendingLeads ? stats?.pendingLeads : '0'})` : "0"}</h5>
              </div>
            </div>
          </div>
          <div className="col-md-3 custom-col-md-3" >
            <div className="stats-info" style={{paddingBottom:'20px'}}>
              <label className="custom-label">Converted Leads</label>
              <div style={{ display: "flex", flexDirection:"row", alignItems: "baseline", justifyContent:"center"}}>
              <h5 style={{ marginRight: "5px" }}>{stats?.convertedPercentage ? `${stats?.convertedPercentage}% (${stats?.convertedLeads ? stats?.convertedLeads : '0'})` : "0"}</h5>
              </div>
            </div>
          </div>
          <div className="col-md-3 custom-col-md-3" >
            <div className="stats-info" style={{paddingBottom:'20px'}}>
              <label className="custom-label">Not Converted Leads</label>
              <div style={{ display: "flex", flexDirection:"row", alignItems: "baseline", justifyContent:"center"}}>
                  
                  <h5 style={{ marginRight: "5px" }}>{stats?.notConvertedPercentage ? `${stats?.notConvertedPercentage}% (${stats?.notConvertedLeads ? stats?.notConvertedLeads : '0'})` : "0"}</h5>
              </div>
            </div>
          </div>
          <div className="col-md-3 custom-col-md-3" >
            <div className="stats-info" style={{paddingBottom:'20px'}}>
              <label className="custom-label">On-Hold Leads</label>
              <div style={{ display: "flex", flexDirection:"row", alignItems: "baseline", justifyContent:"center"}}>
                  
                  <h5 style={{ marginRight: "5px" }}>{stats?.onHoldPercentage ? `${stats?.onHoldPercentage}% (${stats?.onHoldLeads ? stats?.onHoldLeads : '0'})` : "0"}</h5>
              </div>
            </div>
          </div>
        </div>
        }
        {/* /Page Header */}

        <Form form={form2} onFinish={handleSearch}>
          <div className="row filter-row">
            <div className="col-sm-6 col-md-3 col-lg-2">
              <div className="form-group">
                <Form.Item name="accountManager" className="custom-border">
                <Select
                      showSearch
                      onSearch={(val) => {
                        showTeamSearch(val, "accountManager");
                      }}
                      filterOption={(input, option) =>
                        option.children
                          ?.toLowerCase()
                          ?.indexOf(input?.toLowerCase()) >= 0
                      }
                      optionFilterProp="children"
                      className="custom-select custom-normal"
                      getPopupContainer={() =>
                        document.getElementById("area1")
                      }
                      notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                        </>
                      )}
                      style={{
                        width: "100%",
                      }}
                      placeholder="Select Account Manager"
                      onChange={(value) => {
                        handleFilterChange(value, "accountManager");
                      }}
                    >
                      {accountManagers?.map((item, index) => {
                        return (
                          <Option key={index} value={item?._id}>
                            {item?.fullName}
                          </Option>
                        );
                      })}
                    </Select>
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6 col-md-3 col-lg-2">
              <div className="form-group">
                <div style={{ position: "relative" }} id="area1">
                  <Form.Item
                    name="status"
                    className="custom-border"
                  >
                    <Select
                          placeholder='Select Status'
                          style={{ width: "100%" }}
                          onChange={(value) =>
                            handleFilterChange(value, "status")
                          }
                          className="custom-select custom-normal"
                        >
                          <Select.Option value="pending">Pending</Select.Option>
                          <Select.Option value="onHold">On Hold</Select.Option>
                          <Select.Option value="converted">Converted</Select.Option>
                          <Select.Option value="notConverted">Not Converted</Select.Option>
                        </Select>
                  </Form.Item>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-md-3 col-lg-2">
              <div className="form-group">
                <div style={{ position: "relative" }} id="area1">
                  <Form.Item
                    name="projectType"
                    className="custom-border"
                  >
                    <Select
                      placeholder='Select Type'
                      style={{ width: "100%" }}
                      onChange={(value) =>
                        handleFilterChange(value, "projectType")
                      }
                      className="custom-select custom-normal"
                    >
                      <Select.Option value="staffAugmentation">
                        Staff Augmentation
                      </Select.Option>
                      <Select.Option value="endToEndProject">
                        End to End Project
                      </Select.Option>
                      <Select.Option value="bugFixes">
                        Bug Fixes
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>
            </div>
            <div className="col-sm-6 col-md-3 col-lg-2">
              <div className="form-group">
                <Form.Item name="startDate" className="custom-border">
                  <DatePicker
                    className="form-control"
                    style={{
                      width: "100%",
                    }}
                    placeholder='First Reach-Out Date'
                    size="large"
                    //allowClear={false}
                    onChange={(date, dateString) => {
                      handleFilterChange(dateString, "startDate");
                      //setSelectedMonthYear(dateString);
                    }}
                    allowClear={false}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6 col-md-3 col-lg-2">
              <div className="form-group">
                <Form.Item name="endDate" className="custom-border">
                  <DatePicker
                    className="form-control"
                    style={{
                      width: "100%",
                    }}
                    placeholder='Last Reach-Out Date'
                    size="large"
                    //allowClear={false}
                    onChange={(date, dateString) => {
                      handleFilterChange(dateString, "endDate");
                      //setSelectedMonthYear(dateString);
                    }}
                    allowClear={false}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6 col-md-3 col-lg-2"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "2px",
              }}
            >
              <Button
                type="primary"
                htmlType="submit"
                className="btn-success btn-block w-50"
                style={{ borderRadius: "4px", display: "flex", justifyContent: "center", alignItems: "center" }}
              >
                {t('search')}
              </Button>

              <Button
                htmlType="button"
                className="btn-secondary btn-block w-50"
                onClick={handleReset}
                style={{
                  backgroundColor: "#616161",
                  borderColor: "#616161",
                  borderRadius: "4px",
                  display: "flex", 
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                {t('reset')}
              </Button>
            </div>
          </div>
        </Form>

        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive LeadTable">
              <Table
                className="table-striped"
                locale={{
                  emptyText: isLoading ? null : customEmptyText,
                }}
                style={{ overflowX: "auto", paddingBottom: "95px" }}
                loading={isLoading}
                pagination={false}
                columns={columns}
                // Use columns1 for the first table
                dataSource={data} // Define your data source for the first table
                rowKey={(record) => record?._id}
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
                        return {
                          style: { textAlign: "right" }, // Align table data to the right
                        };
                      }
                    : null
                }
              />
            </div>
            {data?.length > 0 && (
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
                  onChange={handlePageChange}
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
                {open?.data ? t("holiday.update") : t("holiday.add")} Lead
              </h5>

              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="modal-body">
              <Form
                form={form}
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
                name="control-hooks"
              >
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Lead Name</label>
                      <Form.Item
                        name="leadName"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Enter a lead name",
                          },
                        ]}
                      >
                        <Input
                          className="form-control"
                          placeholder="Enter Lead Name"
                          maxLength={50}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Client Name</label>
                      <Form.Item
                        name="clientName"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Enter a client name",
                          },
                        ]}
                      >
                        <Input
                          className="form-control"
                          placeholder="Enter Client Name"
                          maxLength={50}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Status</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="status"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: t("projectScreen.Modal.chooseStatus"),
                            },
                          ]}
                        >
                          <Select
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder={t("projectScreen.Modal.selectStatus")}
                          >
                            <Select.Option value="pending">
                              Pending
                            </Select.Option>
                            <Select.Option value="onHold">
                              On Hold
                            </Select.Option>
                            <Select.Option value="converted">
                              Converted
                            </Select.Option>
                            <Select.Option value="notConverted">
                              Not Converted
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Project Type</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="projectType"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: 'please choose a project type',
                            },
                          ]}
                        >
                          <Select
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder='Select a Project Type'
                          >
                            <Select.Option value="staffAugmentation">
                              Staff Augmentation
                            </Select.Option>
                            <Select.Option value="endToEndProject">
                              End to End Project
                            </Select.Option>
                            <Select.Option value="bugFixes">
                              Bug Fixes
                            </Select.Option>
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                <div className="col-sm-6">
                    <div className="form-group">
                      <label>Source</label>
                      <Form.Item
                        name="source"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Enter a lead source",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          onSearch={(val) => {
                            setSearchValue(val);
                            showTeamSearch(val, "source");
                            // onTeamChange(val)
                          }}
                          filterOption={(input, option) =>
                            option.children[0]
                              ?.toLowerCase()
                              ?.indexOf(input?.toLowerCase()) >= 0
                          }
                          optionFilterProp="children"
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          notFoundContent={<></>}
                          dropdownRender={(menu) => (
                            <>
                              {menu}
                              {searchValue && !sourceOptions?.some(option => option?.title?.toLowerCase() === searchValue?.toLowerCase()) && (
                                  <>
                                    <Divider style={{ margin: "5px 0" }} />
                                    <Button
                                      type="button"
                                      icon={
                                        <PlusOutlined style={{ fontSize: "20px", marginRight: "5px" }} />
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
                                      onClick={() => handleAddSource(searchValue)}
                                    >
                                      {`Add "${searchValue}"`}
                                    </Button>
                                  </>
                                )}
                              {/* {
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
                                    onClick={() => setAddSource(true)}
                                  >
                                    Add Source
                                  </Button>
                                </>
                              } */}
                            </>
                          )}
                          style={{
                            width: "100%",
                          }}
                          placeholder="Select source option"
                          onChange={(value, option) => {
                            setTempSource(option?.children[0] || "");
                          }}
                          onDropdownVisibleChange={(open) => setOpen3(open)}
                        >
                          {sourceOptions?.map((item, index) => {
                            return (
                              <Option key={index} value={item?._id}>
                                {item?.title}
                                {open3 && item?._id !== form.getFieldValue('source') && (
                                    <span style={{ float: "right" }}>
                                      <DeleteOutlined
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedSource(item);
                                          setIsModalVisible(true);
                                        }}
                                      />
                                    </span>
                                  )}
                              </Option>
                            );
                          })}
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Account Manager</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="accountManager"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: "Select an account manager",
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            onSearch={(val) => {
                              showTeamSearch(val, "Team");
                              // onTeamChange(val)
                            }}
                            filterOption={(input, option) =>
                              option.children
                                ?.toLowerCase()
                                ?.indexOf(input?.toLowerCase()) >= 0
                            }
                            optionFilterProp="children"
                            notFoundContent={
                              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            }
                            dropdownRender={(menu) => <>{menu}</>}
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder="Select Account Manager"
                            onChange={(value) => {
                              setSelectedLeader(value);
                              setTempName(getEmployeeFullName(value));
                              setTempImage(getEmployeeImage(value));
                            }}
                          >
                            {employees?.map((employee) => (
                              <Select.Option
                                key={employee._id}
                                value={employee._id}
                              >
                                {employee.fullName}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">     
                <div className="col-sm-3">
                    <div className="form-group">
                      <label>Project Worth</label>

                      <Form.Item name="projectWorth" 
                      className="custom-border"
                      dependencies={['currency']}
                      rules={[
                        {
                          validator: validateProjectWorth,
                        },
                      ]}
                      validateTrigger="onFinish"
                      >
                        {/* <Input type="number" className="form-control" /> */}
                        <InputNumber
                          placeholder={'Enter a cost'}
                          className="form-control"
                          formatter={(value) => {
                            return `${value}`.replace(
                              /\B(?=(\d{3})+(?!\d))/g,
                              ","
                            );
                          }}
                          parser={(value) => {
                            return value.replace(/\$\s?|(,*)/g, "");
                          }}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-3">
                    <div className="form-group">
                      <label>{t('projectScreen.Modal.currency')}</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="currency"
                          className="custom-border"
                          dependencies={['projectWorth']}
                          rules={[
                            {
                              validator: validateCurrency,
                            },
                          ]}
                          validateTrigger="onFinish"
                        >
                          <Select
                            showSearch
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder={t('projectScreen.Modal.selectCurrency')}
                          >
                            {
                              allCurrencies.map((currency, index) => (
                                <Select.Option key={index} value={currency?.currency}>
                                  {currency?.currency}
                                </Select.Option>
                              ))
                            }
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>  

                {
                !open?.data && 
                <>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>First Reach Out</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="reachOut"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: "Enter a reach out date",
                            },
                          ]}
                        >
                          <DatePicker
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            style={{ width: "100%" }}
                            className="form-control"
                            placeholder="Enter reach-out date"
                            size="large"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Communication Medium</label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="communicationMedium"
                          className="custom-border"
                          rules={[
                            {
                              required: true,
                              message: "Choose a communication medium",
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            onSearch={(val) => {
                              setSearchValue(val);
                              showTeamSearch(val, "medium");
                              // onTeamChange(val)
                            }}
                            filterOption={(input, option) =>
                              option.children[0]
                                ?.toLowerCase()
                                ?.indexOf(input?.toLowerCase()) >= 0
                            }
                            optionFilterProp="children"
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            notFoundContent={<></>}
                            dropdownRender={(menu) => (
                              <>
                                {menu}
                                {searchValue && !mediumOptions?.some(option => option?.title?.toLowerCase() === searchValue?.toLowerCase()) && (
                                  <>
                                    <Divider style={{ margin: "5px 0" }} />
                                    <Button
                                      type="button"
                                      icon={
                                        <PlusOutlined style={{ fontSize: "20px", marginRight: "5px" }} />
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
                                      onClick={() => handleAddMedium(searchValue)}
                                    >
                                      {`Add "${searchValue}"`}
                                    </Button>
                                  </>
                                )}
                                {/* {
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
                                      onClick={() => setAddMedium(true)}
                                    >
                                      Add Medium
                                    </Button>
                                  </>
                                } */}
                              </>
                            )}
                            style={{
                              width: "100%",
                            }}
                            placeholder="Select a medium"
                            onDropdownVisibleChange={(open) => setOpen1(open)}
                          >
                            {mediumOptions?.map((item, index) => {
                              return (
                                <Option key={index} value={item?._id}>
                                  {item?.title}
                                  {open1 && item?._id !== form.getFieldValue('communicationMedium') && (
                                    <span style={{ float: "right" }}>
                                      <DeleteOutlined
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedMedium(item);
                                          setIsModalVisible(true);
                                        }}
                                      />
                                    </span>
                                  )}
                                </Option>
                              );
                            })}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>Communicated By</label>
                      <Form.Item
                        name="communicatedBy"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Enter name of communication person",
                          },
                        ]}
                      >
                        <Input
                          className="form-control"
                          placeholder="Enter a name"
                          maxLength={50}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </>
                }
                </div>
                {
                  !open?.data && 
                  <div className="form-group">
                    <label>Comments</label>
                    <Form.Item name="comments">
                      <Input.TextArea className="form-control" rows={5} />
                    </Form.Item>
                    {/* <textarea rows={4} className="form-control summernote" placeholder="Enter your message here" defaultValue={""} /> */}
                  </div>
                }

                {open?.data && (
                  <>
                    <h4
                      style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                      }}
                    >
                      Reach Outs
                    </h4>
                    <hr
                      className="developer-dividerdddd"
                      style={{ opacity: "0", marginTop: "0px" }}
                    />
                    <div className="table-responsive">
                      <Table
                        dataSource={reachOuts}
                        columns={reachOutColumns}
                        rowKey={(record, index) => index}
                        pagination={false}
                        bordered
                        style={{ overflowX: "auto", height: "320px" }}
                        components={
                          i18n.dir() === "rtl"
                            ? {
                                header: {
                                  cell: ({ children }) => (
                                    <th style={{ textAlign: "right" }}>
                                      {children}
                                    </th>
                                  ),
                                },
                              }
                            : null
                        }
                        onRow={
                          i18n.dir() === "rtl"
                            ? (record, rowIndex) => {
                                return {
                                  style: { textAlign: "right" }, // Align table data to the right
                                };
                              }
                            : null
                        }
                      />
                    </div>

                    <div className="submit-section">
                      <Form.Item>
                        <Button
                          type="primary"
                          onClick={addReachOuts}
                          className="btn btn-primary submit-btn btn-add"
                          style={{
                            fontSize: "14px",
                            minWidth: "30px",
                            height: "39px",
                            lineHeight: "0px",
                          }}
                        >
                          <i className="fa fa-plus m-r-5" />
                          Add Reach Out
                        </Button>
                      </Form.Item>
                      <hr />
                    </div>
                  </>
                )}

                <div className="submit-section">
                  <Form.Item>
                    <Button
                      type="primary"
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


      <Modal
        open={open2.isAddOpen}
        onClose={handleClose}
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
                Add Reach Outs
              </h5>

              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>

            <div className="modal-body">
              <Form
                form={form}
                onFinish={(val) => onFinishReachOuts(val, open2?.data)}
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
                  <div>
                    <div className="table-responsive">
                      <Table
                        dataSource={reachOuts}
                        columns={reachOutColumns}
                        rowKey={(record, index) => index}
                        pagination={false}
                        style={{ overflowX: "auto", height: "320px" }}
                        components={
                          i18n.dir() === "rtl"
                            ? {
                                header: {
                                  cell: ({ children }) => (
                                    <th style={{ textAlign: "right" }}>
                                      {children}
                                    </th>
                                  ),
                                },
                              }
                            : null
                        }
                        onRow={
                          i18n.dir() === "rtl"
                            ? (record, rowIndex) => {
                                return {
                                  style: { textAlign: "right" }, // Align table data to the right
                                };
                              }
                            : null
                        }
                      />
                    </div>

                    <div className="submit-section">
                      <Form.Item>
                        <Button
                          type="primary"
                          onClick={addReachOuts}
                          className="btn btn-primary submit-btn btn-add"
                          style={{
                            fontSize: "14px",
                            minWidth: "30px",
                            height: "39px",
                            lineHeight: "0px",
                          }}
                        >
                          <i className="fa fa-plus m-r-5" />
                          Add Row
                        </Button>
                      </Form.Item>
                      <hr />
                    </div>
                  </div>
                <div className="submit-section">
                  <Form.Item>
                    <Button
                      type="primary"
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


      <Modal
        open={open.isDelOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
        }}
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
                <h3 style={{ marginBottom: "30px" }}>Delete Lead</h3>
                <p>
                  <span dangerouslySetInnerHTML={{ __html: t('holiday.confirmDelete', { holiday: open?.data?.leadName }) }} />
                </p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                  <Button
                      htmlType="submit"
                      className="btn btn-primary continue-btn"
                      onClick={() => onHandleDelete(open?.data?._id)}
                      disabled={loader}
                      style={{ width: "100%" }}
                    >
                      {loader ? (
                        <Spin size="small" indicator={antIcon} />
                      ) : (
                        t('delete')
                      )}
                    </Button>
                  </div>
                  <div className="col-6">
                    <Button
                      onClick={handleClose}
                      className="btn btn-primary submit-btn"
                      style={{ width: "100%" }}
                    >
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={isModalVisible}
        onClose={handleCancel}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
      >
        <div className="modal-dialog modal-dialog-centered modal-md">
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
                <h3 style={{ marginBottom: "30px" }}>Delete Option</h3>
                <p>
                  <span dangerouslySetInnerHTML={{ __html: t('holiday.confirmDelete', { holiday: selectedMedium ? selectedMedium?.title : selectedSource ? selectedSource?.title : ""}) }} />
                </p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                  <Button
                      htmlType="submit"
                      className="btn btn-primary continue-btn"
                      onClick={handleOk}
                      disabled={loader}
                      style={{ width: "100%" }}
                    >
                      {loader ? (
                        <Spin size="small" indicator={antIcon} />
                      ) : (
                        t('delete')
                      )}
                    </Button>
                  </div>
                  <div className="col-6">
                    <Button
                      onClick={handleCancel}
                      className="btn btn-primary submit-btn"
                      style={{ width: "100%" }}
                    >
                      {t('cancel')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* {addSource && (
        <AddSource
          addSource={addSource}
          setAddSource={setAddSource}
          sourceOptions={sourceOptions}
          setSourceOptions={setSourceOptions}
          user_state={user_state}
        />
      )}
      {addMedium && (
        <AddMedium
          addMedium={addMedium}
          setAddMedium={setAddMedium}
          mediumOptions={mediumOptions}
          setMediumOptions={setMediumOptions}
          user_state={user_state}
        />
      )} */}
      {/* /Page Content */}
    </div>
  );
};

export default Leads;
