import {
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Empty,
  Select,
  Spin,
  Radio,
  DatePicker,
  Tooltip,
  Tag,
} from "antd";
import React, { useEffect, useState, useRef } from "react";
import { itemRender } from "../../paginationfunction";
import "antd/dist/antd.css";
import "../../antdstyle.css";
import Modal from "@mui/material/Modal";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

const { Option } = Select;

// Deduction type options
const DEDUCTION_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed'
};

// Timeline type options
const TIMELINE_TYPES = {
  ALWAYS: 'always',
  RANGE: 'range'
};

// Common currency options
const CURRENCY_OPTIONS = [
  { code: 'PKR', label: 'PKR - Pakistani Rupee' },
  { code: 'USD', label: 'USD - US Dollar' },
  { code: 'EUR', label: 'EUR - Euro' },
  { code: 'GBP', label: 'GBP - British Pound' },
  { code: 'AED', label: 'AED - UAE Dirham' },
  { code: 'SAR', label: 'SAR - Saudi Riyal' },
  { code: 'INR', label: 'INR - Indian Rupee' },
];

const AutoDeductions = () => {
  const user_state = useSelector((state) => state.user.loginvalue);
  const comp_id = user_state?.user?.companyId;
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();

  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: null,
  });
  const [tableLoader, setTableLoader] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  // Form state
  const [deductionType, setDeductionType] = useState(DEDUCTION_TYPES.PERCENTAGE);
  const [timelineType, setTimelineType] = useState(TIMELINE_TYPES.ALWAYS);

  useEffect(() => {
    getDeductions();
    fetchEmployees();
  }, []);

  // Fetch all auto deductions
  const getDeductions = () => {
    setTableLoader(true);
    apiServices("GET", "auto-deductions", null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setData(res?.data?.deductions || []);
        }
        setTableLoader(false);
      })
      .catch((err) => {
        setTableLoader(false);
        message.error(
          err?.response?.data?.msg ||
          err?.response?.data?.validation?.body?.message ||
          t('settings.autoDeductions.errors.getDeductionsError')
        );
      });
  };

  // Fetch active employees
  const fetchEmployees = () => {
    setEmployeesLoading(true);
    apiServices("GET", "user/all-employees", null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          const emps = res?.data?.User || [];
          // Filter only active employees and sort by name
          const activeEmployees = emps
            .filter(emp => emp.status !== 'disabled')
            .sort((a, b) => a.fullName?.localeCompare(b.fullName));
          setEmployees(activeEmployees);
        }
        setEmployeesLoading(false);
      })
      .catch((err) => {
        setEmployeesLoading(false);
        message.error(
          err?.response?.data?.msg ||
          t('aAttend.errors.getEmployeesError')
        );
      });
  };

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: null });
    form.resetFields();
    setDeductionType(DEDUCTION_TYPES.PERCENTAGE);
    setTimelineType(TIMELINE_TYPES.ALWAYS);
  };

  const handleOpenAdd = () => {
    setOpen({
      isAddOpen: true,
      isDelOpen: false,
      data: null,
    });
    form.resetFields();
    setDeductionType(DEDUCTION_TYPES.PERCENTAGE);
    setTimelineType(TIMELINE_TYPES.ALWAYS);
  };

  const handleOpenEdit = (record) => {
    setOpen({
      isAddOpen: true,
      isDelOpen: false,
      data: record,
    });
    
    // Set form values
    const type = record.type || DEDUCTION_TYPES.PERCENTAGE;
    const timeline = record.startDate ? TIMELINE_TYPES.RANGE : TIMELINE_TYPES.ALWAYS;
    
    setDeductionType(type);
    setTimelineType(timeline);
    
    form.setFieldsValue({
      title: record.title,
      type: type,
      percentage: type === DEDUCTION_TYPES.PERCENTAGE ? record.value : undefined,
      currency: type === DEDUCTION_TYPES.FIXED ? record.currency : undefined,
      amount: type === DEDUCTION_TYPES.FIXED ? record.value : undefined,
      employees: record.employees?.map(e => e._id || e) || [],
      timelineType: timeline,
      startDate: record.startDate ? dayjs(record.startDate) : undefined,
      endDate: record.endDate ? dayjs(record.endDate) : undefined,
    });
  };

  const handleOpenDelete = (record) => {
    setOpen({
      isAddOpen: false,
      isDelOpen: true,
      data: record,
    });
  };

  // Handle delete (soft delete on backend)
  const onHandleDelete = () => {
    setLoader(true);
    apiServices("DELETE", `auto-deductions/${open.data?._id}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          // Remove from local state (soft deleted on backend)
          setData(data.filter((item) => item._id !== open.data?._id));
          handleClose();
          message.success(res?.data?.msg || t('settings.autoDeductions.deductionDeleted'));
        }
        setLoader(false);
      })
      .catch((err) => {
        setLoader(false);
        message.error(
          err?.response?.data?.msg ||
          err?.response?.data?.validation?.body?.message ||
          t('settings.autoDeductions.errors.deleteDeductionError')
        );
      });
  };

  // Handle form submit
  const onFinish = (values) => {
    setLoader(true);

    const payload = {
      title: values.title?.trim(),
      type: deductionType,
      value: deductionType === DEDUCTION_TYPES.PERCENTAGE ? values.percentage : values.amount,
      currency: deductionType === DEDUCTION_TYPES.FIXED ? values.currency : undefined,
      employees: values.employees,
      startDate: timelineType === TIMELINE_TYPES.RANGE ? values.startDate?.startOf('month').toISOString() : null,
      endDate: timelineType === TIMELINE_TYPES.RANGE ? values.endDate?.endOf('month').toISOString() : null,
    };

    if (open.data) {
      // Update existing deduction
      apiServices("PUT", `auto-deductions/${open.data._id}`, payload, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            // Refresh list to get properly populated data
            getDeductions();
            handleClose();
            message.success(res?.data?.msg || t('settings.autoDeductions.deductionUpdated'));
          }
          setLoader(false);
        })
        .catch((err) => {
          setLoader(false);
          message.error(
            err?.response?.data?.msg ||
            err?.response?.data?.validation?.body?.message ||
            t('settings.autoDeductions.errors.updateDeductionError')
          );
        });
    } else {
      // Create new deduction
      apiServices("POST", "auto-deductions", payload, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            // Refresh list to get properly populated data
            getDeductions();
            handleClose();
            message.success(res?.data?.msg || t('settings.autoDeductions.deductionAdded'));
          }
          setLoader(false);
        })
        .catch((err) => {
          setLoader(false);
          message.error(
            err?.response?.data?.msg ||
            err?.response?.data?.validation?.body?.message ||
            t('settings.autoDeductions.errors.addDeductionError')
          );
        });
    }
  };

  // Format value for display
  const formatValue = (record) => {
    if (record.type === DEDUCTION_TYPES.PERCENTAGE) {
      return `${record.value}%`;
    }
    const formattedValue = record.value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${record.currency || ''} ${formattedValue}`;
  };

  // Format timeline for display
  const formatTimeline = (record) => {
    if (!record.startDate && !record.endDate) {
      return t('settings.autoDeductions.always');
    }
    const start = record.startDate ? dayjs(record.startDate).format('MMM YYYY') : '';
    const end = record.endDate ? dayjs(record.endDate).format('MMM YYYY') : '';
    return `${start} → ${end}`;
  };

  // Get employee names for tooltip
  const getEmployeeTooltip = (employeeList) => {
    if (!employeeList || employeeList.length === 0) return '';
    
    const employeeNames = employeeList
      .map(emp => {
        // Handle both populated objects and plain IDs
        if (typeof emp === 'object' && emp?.fullName) {
          return emp.fullName;
        }
        // Fallback: lookup from employees list
        const found = employees.find(e => e._id === (emp._id || emp));
        return found?.fullName || 'Unknown';
      })
      .slice(0, 10);
    
    if (employeeList.length > 10) {
      employeeNames.push(`+${employeeList.length - 10} more`);
    }
    
    return employeeNames.join(', ');
  };

  // Table columns
  const columns = [
    {
      title: "#",
      dataIndex: "",
      width: 50,
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: t('settings.autoDeductions.title'),
      dataIndex: "title",
      ellipsis: true,
    },
    {
      title: t('settings.autoDeductions.type'),
      dataIndex: "type",
      width: 120,
      render: (type) => (
        <Tag color={type === DEDUCTION_TYPES.PERCENTAGE ? 'blue' : 'green'}>
          {type === DEDUCTION_TYPES.PERCENTAGE 
            ? t('settings.autoDeductions.percentage') 
            : t('settings.autoDeductions.fixed')}
        </Tag>
      ),
    },
    {
      title: t('settings.autoDeductions.value'),
      dataIndex: "value",
      width: 150,
      render: (_, record) => formatValue(record),
    },
    {
      title: t('settings.autoDeductions.employees'),
      dataIndex: "employees",
      width: 120,
      render: (employeeList) => (
        <Tooltip title={getEmployeeTooltip(employeeList)}>
          <span style={{ cursor: 'pointer' }}>
            {employeeList?.length || 0} {t('settings.autoDeductions.employeesCount')}
          </span>
        </Tooltip>
      ),
    },
    {
      title: t('settings.autoDeductions.timeline'),
      dataIndex: "startDate",
      width: 180,
      render: (_, record) => formatTimeline(record),
    },
    {
      title: t('holiday.actions'),
      width: 100,
      render: (_, record) => (
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
              onClick={() => handleOpenEdit(record)}
            >
              <i className="fa fa-pencil m-r-5" /> {t('edit')}
            </a>
            <a
              className="dropdown-item"
              href="javascript:void(0)"
              onClick={() => handleOpenDelete(record)}
            >
              <i className="fa fa-trash-o m-r-5" /> {t('delete')}
            </a>
          </div>
        </div>
      ),
    },
  ];

  // Empty state
  const customEmptyText = (
    <Empty
      image={<img src={EmptyTable} alt="No data" />}
      imageStyle={{}}
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
            {t('settings.autoDeductions.noDeductionsYet')}
          </div>
          <div
            style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
          >
            {t('settings.autoDeductions.clickToAddDeduction')}
          </div>
        </div>
      }
    />
  );

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 24,
        color: "#fff",
      }}
      spin
    />
  );

  // Handle Select All employees
  const handleSelectAll = () => {
    const allEmployeeIds = employees.map(emp => emp._id);
    form.setFieldsValue({ employees: allEmployeeIds });
  };

  // Handle Unselect All employees
  const handleUnselectAll = () => {
    form.setFieldsValue({ employees: [] });
  };

  return (
    <div>
      <div>
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center pt-3 pb-3">
            <div className="col">
              <h3 className="page-title">{t('settings.autoDeductions.autoDeductions')}</h3>
            </div>
            <div className="col-auto float-end ms-auto">
              <a
                href="javascript:void(0)"
                className="btn add-btn"
                onClick={handleOpenAdd}
              >
                <i className="fa fa-plus" /> {t('settings.autoDeductions.addDeduction')}
              </a>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              <Table
                loading={tableLoader}
                className={data?.length > 0 ? "table-striped antTableResponsive" : ""}
                locale={{
                  emptyText: tableLoader ? null : customEmptyText,
                }}
                pagination={{
                  total: data?.length,
                  pageSize: pageSize,
                  defaultCurrent: 1,
                  current: currentPage,
                  showTotal: (total, range) =>
                    t('paginationShow', { range1: range[0], range2: range[1], total: total }),
                  showSizeChanger: true,
                  onShowSizeChange: (current, size) => {
                    setPageSize(size);
                    setCurrentPage(1);
                  },
                  pageSizeOptions: ["20", "30", "40", "50"],
                  onChange: (page) => setCurrentPage(page),
                  itemRender: (current, type, originalElement) =>
                    itemRender(current, type, originalElement, t),
                }}
                columns={columns}
                bordered
                dataSource={data}
                rowKey={(record) => record._id}
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
                    ? () => ({
                        style: { textAlign: "right" },
                      })
                    : null
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={open.isAddOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" },
        }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {open.data 
                  ? t('settings.autoDeductions.editDeduction')
                  : t('settings.autoDeductions.addDeduction')}
              </h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                form={form}
                name="auto-deduction-form"
                onFinish={onFinish}
                onFinishFailed={({ errorFields }) => {
                  message.error(t('allEmp.errors.fillRequiredFields'));
                }}
                layout="vertical"
              >
                {/* Title */}
                <div className="row">
                  <div className="col-12">
                    <div className="form-group">
                      <label>
                        {t('settings.autoDeductions.deductionTitle')}{' '}
                        <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="title"
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: t('settings.autoDeductions.errors.enterTitle'),
                          },
                          {
                            min: 3,
                            message: t('settings.minLength', { name: t('settings.autoDeductions.deductionTitle') }),
                          },
                        ]}
                        className="custom-border"
                      >
                        <Input
                          className="form-control"
                          maxLength={100}
                          autoFocus
                          placeholder={t('settings.autoDeductions.titlePlaceholder')}
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>

                {/* Deduction Type */}
                <div className="row">
                  <div className="col-12">
                    <div className="form-group">
                      <label>
                        {t('settings.autoDeductions.deductionType')}{' '}
                        <span className="text-danger">*</span>
                      </label>
                      <Form.Item name="type" className="custom-border">
                        <Radio.Group
                          value={deductionType}
                          onChange={(e) => {
                            setDeductionType(e.target.value);
                            // Clear the other type's values
                            if (e.target.value === DEDUCTION_TYPES.PERCENTAGE) {
                              form.setFieldsValue({ currency: undefined, amount: undefined });
                            } else {
                              form.setFieldsValue({ percentage: undefined });
                            }
                          }}
                          optionType="button"
                          buttonStyle="solid"
                          style={{ width: '100%' }}
                        >
                          <Radio.Button 
                            value={DEDUCTION_TYPES.PERCENTAGE}
                            style={{ width: '50%', textAlign: 'center' }}
                          >
                            {t('settings.autoDeductions.percentage')}
                          </Radio.Button>
                          <Radio.Button 
                            value={DEDUCTION_TYPES.FIXED}
                            style={{ width: '50%', textAlign: 'center' }}
                          >
                            {t('settings.autoDeductions.fixedAmount')}
                          </Radio.Button>
                        </Radio.Group>
                      </Form.Item>
                    </div>
                  </div>
                </div>

                {/* Percentage Input */}
                {deductionType === DEDUCTION_TYPES.PERCENTAGE && (
                  <div className="row">
                    <div className="col-12">
                      <div className="form-group">
                        <label>
                          {t('settings.autoDeductions.percentageValue')}{' '}
                          <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                          name="percentage"
                          rules={[
                            {
                              required: true,
                              message: t('settings.autoDeductions.errors.enterPercentage'),
                            },
                            {
                              type: 'number',
                              min: 0.01,
                              max: 100,
                              message: t('settings.autoDeductions.errors.percentageRange'),
                            },
                          ]}
                          className="custom-border"
                        >
                          <InputNumber
                            className="form-control"
                            style={{ width: '100%' }}
                            min={0.01}
                            max={100}
                            step={0.01}
                            precision={2}
                            addonAfter="%"
                            placeholder="e.g., 5"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fixed Amount Input */}
                {deductionType === DEDUCTION_TYPES.FIXED && (
                  <div className="row">
                    <div className="col-sm-4">
                      <div className="form-group">
                        <label>
                          {t('settings.autoDeductions.currency')}{' '}
                          <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                          name="currency"
                          rules={[
                            {
                              required: true,
                              message: t('settings.autoDeductions.errors.selectCurrency'),
                            },
                          ]}
                          className="custom-border"
                        >
                          <Select
                            placeholder={t('settings.autoDeductions.selectCurrency')}
                            style={{ width: '100%' }}
                            showSearch
                            optionFilterProp="children"
                          >
                            {CURRENCY_OPTIONS.map((currency) => (
                              <Option key={currency.code} value={currency.code}>
                                {currency.code}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                    <div className="col-sm-8">
                      <div className="form-group">
                        <label>
                          {t('settings.autoDeductions.amount')}{' '}
                          <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                          name="amount"
                          rules={[
                            {
                              required: true,
                              message: t('settings.autoDeductions.errors.enterAmount'),
                            },
                            {
                              type: 'number',
                              min: 1,
                              message: t('settings.autoDeductions.errors.amountPositive'),
                            },
                          ]}
                          className="custom-border"
                        >
                          <InputNumber
                            className="form-control"
                            style={{ width: '100%' }}
                            min={1}
                            step={1}
                            precision={2}
                            placeholder="e.g., 2000"
                            formatter={(value) =>
                              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            }
                            parser={(value) => value.replace(/,/g, '')}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                )}

                {/* Employees Selection */}
                <div className="row">
                  <div className="col-12">
                    <div className="form-group">
                      <label>
                        {t('settings.autoDeductions.selectEmployees')}{' '}
                        <span className="text-danger">*</span>
                        <Button
                          type="link"
                          size="small"
                          onClick={handleSelectAll}
                          style={{ padding: '0 8px', height: 'auto' }}
                        >
                          {t('settings.autoDeductions.selectAll')}
                        </Button>
                        <span style={{ color: '#d9d9d9' }}>|</span>
                        <Button
                          type="link"
                          size="small"
                          onClick={handleUnselectAll}
                          style={{ padding: '0 8px', height: 'auto', color: '#ff4d4f' }}
                        >
                          {t('settings.autoDeductions.unselectAll')}
                        </Button>
                      </label>
                        <Form.Item
                          name="employees"
                          rules={[
                            {
                              required: true,
                              type: 'array',
                              min: 1,
                              message: t('settings.autoDeductions.errors.selectAtLeastOneEmployee'),
                            },
                          ]}
                          className="custom-border"
                        >
                        <Select
                          mode="multiple"
                          placeholder={t('settings.autoDeductions.employeesPlaceholder')}
                          style={{ width: '100%' }}
                          loading={employeesLoading}
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option?.children?.toLowerCase().includes(input.toLowerCase())
                          }
                          maxTagCount={5}
                          maxTagPlaceholder={(omittedValues) =>
                            `+${omittedValues.length} more`
                          }
                        >
                          {employees.map((emp) => (
                            <Option key={emp._id} value={emp._id}>
                              {emp.fullName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="row">
                  <div className="col-12">
                    <div className="form-group">
                      <label>
                        {t('settings.autoDeductions.timeline')}{' '}
                        <span className="text-danger">*</span>
                      </label>
                      <Form.Item name="timelineType" className="custom-border">
                        <Radio.Group
                          value={timelineType}
                          onChange={(e) => {
                            setTimelineType(e.target.value);
                            if (e.target.value === TIMELINE_TYPES.ALWAYS) {
                              form.setFieldsValue({ startDate: undefined, endDate: undefined });
                            }
                          }}
                        >
                          <Radio value={TIMELINE_TYPES.ALWAYS}>
                            {t('settings.autoDeductions.alwaysDeduct')}
                          </Radio>
                          <Radio value={TIMELINE_TYPES.RANGE}>
                            {t('settings.autoDeductions.selectTimeRange')}
                          </Radio>
                        </Radio.Group>
                      </Form.Item>
                    </div>
                  </div>
                </div>

                {/* Date Range */}
                {timelineType === TIMELINE_TYPES.RANGE && (
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>
                          {t('settings.autoDeductions.startMonth')}{' '}
                          <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                          name="startDate"
                          rules={[
                            {
                              required: timelineType === TIMELINE_TYPES.RANGE,
                              message: t('settings.autoDeductions.errors.selectStartMonth'),
                            },
                          ]}
                          className="custom-border"
                        >
                          <DatePicker
                            picker="month"
                            style={{ width: '100%' }}
                            placeholder={t('settings.autoDeductions.selectStartMonth')}
                            format="MMM YYYY"
                          />
                        </Form.Item>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="form-group">
                        <label>
                          {t('settings.autoDeductions.endMonth')}{' '}
                          <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                          name="endDate"
                          dependencies={['startDate']}
                          rules={[
                            {
                              required: timelineType === TIMELINE_TYPES.RANGE,
                              message: t('settings.autoDeductions.errors.selectEndMonth'),
                            },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const startDate = getFieldValue('startDate');
                                if (!startDate || !value) {
                                  return Promise.resolve();
                                }
                                if (value.isBefore(startDate)) {
                                  return Promise.reject(
                                    t('settings.autoDeductions.errors.endAfterStart')
                                  );
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                          className="custom-border"
                        >
                          <DatePicker
                            picker="month"
                            style={{ width: '100%' }}
                            placeholder={t('settings.autoDeductions.selectEndMonth')}
                            format="MMM YYYY"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
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
                        t('submit')
                      )}
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        open={open.isDelOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" },
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
                <h3 style={{ marginBottom: "30px" }}>
                  {t('settings.autoDeductions.deleteDeduction')}
                </h3>
                <p>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('settings.autoDeductions.confirmDelete', {
                        title: open.data?.title,
                      }),
                    }}
                  />
                </p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <Button
                      className="btn btn-primary continue-btn"
                      onClick={onHandleDelete}
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
    </div>
  );
};

export default AutoDeductions;

