import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button, Empty, Spin, Table, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { apiServices } from "../../Services/apiServices";
import { user_icon } from "../../Entryfile/imagepath";

const AssetDetails = () => {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const user_state = useSelector((state) => state.user.loginvalue);

  const [asset, setAsset] = useState(location?.state?.asset || null);
  const [isLoading, setIsLoading] = useState(false);

  const antIcon = (
    <LoadingOutlined style={{ fontSize: 24, color: "#fff" }} spin />
  );

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
      title: "From",
      dataIndex: "from",
      key: "from",
      render: (val) => formatDate(val),
    },
    {
      title: "To",
      dataIndex: "to",
      key: "to",
      render: (val) => (val ? formatDate(val) : "Present"),
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
                      <label className="other-title">Category</label>
                      <label>{asset?.assetSubCategoryId?.categoryId?.categoryname || "-"}</label>
                    </li>
                    <li>
                      <label className="other-title">Sub Category</label>
                      <label>{asset?.assetSubCategoryId?.subcategoryname || "-"}</label>
                    </li>
                    <li>
                      <label className="other-title">Manufacturer</label>
                      <label>{asset?.manufacturer || "-"}</label>
                    </li>
                    <li>
                      <label className="other-title">Condition</label>
                      <label>{asset?.condition || "-"}</label>
                    </li>
                    <li>
                      <label className="other-title">Status</label>
                      <label>{asset?.status || "-"}</label>
                    </li>
                    <li>
                      <label className="other-title">Price</label>
                      <label>{asset?.price != null ? asset?.price : "-"}</label>
                    </li>
                    <li>
                      <label className="other-title">Quantity</label>
                      <label>{asset?.quantity != null ? asset?.quantity : "-"}</label>
                    </li>
                    <li>
                      <label className="other-title">Purchased Date</label>
                      <label>{formatDate(asset?.purchasedDate)}</label>
                    </li>
                    <li>
                      <label className="other-title">Purchased By</label>
                      <label>{asset?.purchasedByEmployeeId?.fullName || "-"}</label>
                    </li>
                    <li>
                      <label className="other-title">Assignable</label>
                      <label>{asset?.isAssignable ? "Yes" : "No"}</label>
                    </li>
                    {asset?.assignedEmployeeId && (
                      <li>
                        <label className="other-title">Assigned To</label>
                        <label>{asset?.assignedEmployeeId?.fullName}</label>
                      </li>
                    )}
                    <li>
                      <label className="other-title">Last Updated</label>
                      <label>{formatDate(asset?.updatedAt)}</label>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-xl-9">
              <div className="contact-tab-wrap">
                <div className="contact-tab-view">
                  <div className="tab-content pt-0">
                    <div className="view-header d-flex align-items-center justify-content-between">
                      <h3>Assignment History</h3>
                    </div>
                    <div className="table-responsive">
                      <Table
                        className={asset?.assignmentHistory?.length > 0 ? "table-striped" : ""}
                        locale={{ emptyText: <Empty description="No assignment history" /> }}
                        style={{ overflowX: "auto" }}
                        pagination={false}
                        columns={assignmentColumns}
                        dataSource={asset?.assignmentHistory || []}
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


