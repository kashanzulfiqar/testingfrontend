import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button, Empty, Spin, Table, Tooltip, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { apiServices } from "../../Services/apiServices";
import { user_icon } from "../../Entryfile/imagepath";

const HISTORY_TABS = {
  ASSIGNMENT: "assignment",
  ASSET: "asset",
};

const AssetDetails = () => {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const user_state = useSelector((state) => state.user.loginvalue);

  const [asset, setAsset] = useState(location?.state?.asset || null);

  const [isLoading, setIsLoading] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState(HISTORY_TABS.ASSIGNMENT);

  const antIcon = (
    <LoadingOutlined style={{ fontSize: 24, color: "#fff" }} spin />
  );

  useEffect(() => {
    console.log("asset !!!! !", asset);
  }, [asset]);
  useEffect(() => {
    if (!asset && id) {
      setIsLoading(true);
      // Try fetching a single asset by id; fall back to list and filter
      apiServices("GET", `assets/${id}`, null, user_state)
        .then((res) => {
          if (res?.data?.success === true) {
            setAsset(res?.data?.asset || res?.data?.Asset || res?.data);
          }
        })
        .catch(() => {
          // Fallback to listing and filtering if direct endpoint not available
          apiServices("GET", `assets/?page=1&limit=1&_id=${id}`, null, user_state)
            .then((res2) => {
              const container = res2?.data?.Assets || res2?.data?.assets || res2?.data;
              const docs = container?.docs || container?.data || [];
              const found = docs?.find((a) => a?._id === id);
              if (found) setAsset(found);
            })
            .finally(() => setIsLoading(false));
        })
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return moment(dateString).format("DD MMM YYYY");
  };
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return moment(dateString).format("DD MMM YYYY, HH:mm");
  };

  const NOTE_ELLIPSIS_STYLE = {
    maxWidth: 220,
    display: "inline-block",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    verticalAlign: "middle",
  };

  const assignmentColumns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: 60,
      render: (text, record, index) => index + 1,
    },
    {
      title: "Employee",
      dataIndex: "employeeId",
      render: (text, record) => (
        record?.employeeId ? (
          <h2 className="table-avatar">
            <img className="avatar" alt="" src={record?.employeeId?.imageUrl || user_icon} />
            <span>{record?.employeeId?.fullName}</span>
          </h2>
        ) : (
          "-"
        )
      ),
    },
    {
      title: "Assigned Date",
      dataIndex: "assignedDate",
      key: "assignedDate",
      render: (_, record) => {
        const assignedDate = record?.assignedDate;
        return assignedDate ? moment(assignedDate).format("DD-MM-YYYY") : "-";
      },
    },
    {
      title: "Expected Return Date",
      dataIndex: "expectedReturnDate",
      key: "expectedReturnDate",
      render: (_, record) => {
        const expectedReturnDate = record?.expectedReturnDate;
        return expectedReturnDate ? moment(expectedReturnDate).format("DD-MM-YYYY") : "-";
      },
    },
    {
      title: "Return Date",
      dataIndex: "returnDate",
      key: "returnDate",
      render: (_, record) => {
        const returnDate = record?.returnedDate;
        return returnDate ? moment(returnDate).format("DD-MM-YYYY") : "-";
      },
    },
    {
      title: "Assignment Note",
      dataIndex: "assignmentNote",
      key: "assignmentNote",
      render: (_, record) => {
        const assignmentNote = record?.assignmentNote;
        if (!assignmentNote) {
          return "-";
        }
        return (
          <Tooltip title={assignmentNote} placement="topLeft">
            <span style={NOTE_ELLIPSIS_STYLE}>{assignmentNote}</span>
          </Tooltip>
        );
      },
    },
  ];
  const assetHistoryColumns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (val) => val || "-",
    },
    {
      title: "Date & Time",
      dataIndex: "date",
      key: "date",
      render: (val) => (
        <span style={{ whiteSpace: "nowrap" }}>{formatDateTime(val)}</span>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>Asset Details - {t("header.daftarPro")}</title>
        <meta name="description" content="Asset Details" />
      </Helmet>
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col-md-4">
              <h3 className="page-title">Asset Details</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to={"/assets"}>Assets</Link>
                </li>
                <li className="breadcrumb-item active">Details</li>
              </ul>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
            <Spin indicator={antIcon} />
          </div>
        ) : !asset ? (
          <Empty description="No Asset Found" />
        ) : (
          <div className="row">
            {/* Header card similar to leadsDetails */}
            <div className="col-md-12">
              <div className="contact-wrap">
                <div className="contact-profile">
                  <div className="avatar company-avatar" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <img src={asset?.imageUrl || user_icon} alt="asset" style={{ width: 80, height: 80, borderRadius: "50%"}} />
                  </div>
                  <div className="name-user">
                    <h4>{asset?.name}</h4>
                    {asset?.serialNumber && (
                      <p className="mb-0">
                        <i className="las la-hashtag" /> <label>{asset?.serialNumber}</label>
                      </p>
                    )}
                    {asset?.model && (
                      <p className="mb-0">
                        <i className="las la-microchip" /> <label>{asset?.model}</label>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Info cards */}
            <div className="col-xl-3">
              <div className="stickybar">
                <div className="card contact-sidebar">
                  <h5>
                    <label>Asset Information</label>
                  </h5>
                  <ul className="other-info">
                  <li>
                      <h5 className="other-title">Category</h5>
                      <label>{asset?.assetCategoryId?.categoryname || "-"}</label>
                    </li>
                    <li>
                      <h5 className="other-title">Sub Category</h5>
                      <label>{asset?.assetSubCategoryId?.subcategoryname || "-"}</label>
                    </li>
                    <li>
                      <h5 className="other-title">Manufacturer</h5>
                      <label>{asset?.manufacturer || "-"}</label>
                    </li>
                    <li>
                      <h5 className="other-title">Condition</h5>
                      <label>{asset?.condition || "-"}</label>
                    </li>
                    <li>
                      <h5 className="other-title">Status</h5>
                      <label>{asset?.status || "-"}</label>
                    </li>
                    <li>
                      <h5 className="other-title">Price</h5>
                      <label>{asset?.price != null ? asset?.price : "-"}</label>
                    </li>
                    <li>
                      <h5 className="other-title">Quantity</h5>
                      <label>{asset?.quantity != null ? asset?.quantity : "-"}</label>
                    </li>
                    <li>
                      <h5 className="other-title">Purchased Date</h5>
                      <label>{formatDate(asset?.purchasedDate)}</label>
                    </li>
                    <li>
                      <h5 className="other-title">Purchased By</h5>
                      <label>{asset?.purchasedByEmployeeId?.fullName || "-"}</label>
                    </li>
                    <li>
                      <h5 className="other-title">Assignable</h5>
                      <label>{asset?.isAssignable ? "Yes" : "No"}</label>
                    </li>
                    {asset?.assignedEmployeeId && (
                      <li>
                        <h5 className="other-title">Assigned To</h5>
                        <label>{asset?.assignedEmployeeId?.fullName}</label>
                      </li>
                    )}
                    <li>
                      <h5 className="other-title">Last Updated</h5>
                      <label>{formatDate(asset?.updatedAt)}</label>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-xl-9">
              <div className="contact-tab-wrap">
                <div className="contact-tab-view">
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginBottom: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    <Button
                      type={activeHistoryTab === HISTORY_TABS.ASSIGNMENT ? "primary" : "default"}
                      onClick={() => setActiveHistoryTab(HISTORY_TABS.ASSIGNMENT)}
                    >
                      Assignment History
                    </Button>
                    <Button
                      type={activeHistoryTab === HISTORY_TABS.ASSET ? "primary" : "default"}
                      onClick={() => setActiveHistoryTab(HISTORY_TABS.ASSET)}
                    >
                      Asset History
                    </Button>
                  </div>
                  <div className="tab-content pt-0">
                    <div className="view-header d-flex align-items-center justify-content-between">
                      <h3>
                        {activeHistoryTab === HISTORY_TABS.ASSIGNMENT
                          ? "Assignment History"
                          : "Asset History"}
                      </h3>
                    </div>
                    <div className="table-responsive">
                      <Table
                        className={
                          (activeHistoryTab === HISTORY_TABS.ASSIGNMENT
                            ? asset?.assignmentHistory
                            : asset?.assetsHistory)?.length > 0
                            ? "table-striped"
                            : ""
                        }
                        locale={{
                          emptyText:
                            activeHistoryTab === HISTORY_TABS.ASSIGNMENT ? (
                              <Empty description="No assignment history" />
                            ) : (
                              <Empty description="No asset history" />
                            ),
                        }}
                        style={{ overflowX: "auto" }}
                        pagination={false}
                        columns={
                          activeHistoryTab === HISTORY_TABS.ASSIGNMENT
                            ? assignmentColumns
                            : assetHistoryColumns
                        }
                        dataSource={
                          activeHistoryTab === HISTORY_TABS.ASSIGNMENT
                            ? asset?.assignmentHistory || []
                            : asset?.assetsHistory || []
                        }
                        rowKey={(record, index) => record?._id || index}
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetDetails;


