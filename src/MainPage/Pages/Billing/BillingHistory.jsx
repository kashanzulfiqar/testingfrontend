import React, { useEffect, useState, useRef } from "react";
import { apiServices } from "../../../Services/apiServices";
import { Helmet } from "react-helmet";
import { t } from "i18next";
import { useSelector } from "react-redux";
import { Pagination, Table } from "antd";
import { itemRender } from "../../paginationfunction";
import { Link } from "react-router-dom";

const BillingHistory = () => {
  const [invoices, setInvoices] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRefs = useRef({});
  const user_state = useSelector((state) => state.user.loginvalue);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const companyId = user_state?.user?.companyId;

  const toggleDropdown = (invoiceId) => {
    setOpenDropdownId((prevId) => (prevId === invoiceId ? null : invoiceId));
  };

  const closeDropdowns = (e) => {
    if (
      !Object.values(dropdownRefs.current).some((ref) =>
        ref?.contains(e.target)
      )
    ) {
      setOpenDropdownId(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeDropdowns);
    return () => document.removeEventListener("mousedown", closeDropdowns);
  }, []);

  useEffect(() => {
    if (companyId) fetchInvoices(pagination.current, pagination.pageSize);
  }, [companyId]);

  const formatAmount = (amount) => {
    return `${(amount / 100).toFixed(2)} $`;
  };

  const columns = [
    {
      title: "Invoice #",
      dataIndex: "number",
      key: "number",
      render: (text) => text || "-",
    },
    {
      title: "Invoice Month",
      dataIndex: "period_start",
      key: "period_start",
      render: (text) =>
        text ? new Date(text * 1000).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }) : "-",
    },
    {
      title: "Payment Date",
      dataIndex: "period_end",
      key: "period_end",
      render: (text) =>
        text ? new Date(text * 1000).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }) : "-",
    },
    {
      title: "Payment Method",
      dataIndex: "card",
      key: "card",
      render: (card) =>
        card ? `${card.brand.toUpperCase()} **** ${card.last4}` : "-",
    },
    {
      title: "Amount",
      dataIndex: "amount_due",
      key: "amount_due",
      render: (amount) => formatAmount(amount),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const mapStatusToLabelAndStyle = (status) => {
          switch (status) {
            case "paid":
              return { label: "Paid", color: "#55CE63", bg: "#EFFAF1" };
            case "open":
              return { label: "Pending", color: "#FFBC34", bg: "#FFF7E5" };
            case "uncollectible":
              return { label: "Failed", color: "#F62D51", bg: "#FEE7Eb" };
            case "void":
              return { label: "Cancelled", color: "#999999", bg: "#F2F2F2" };
            default:
              return {
                label: status.charAt(0).toUpperCase() + status.slice(1),
                color: "#999",
                bg: "#f5f5f5",
              };
          }
        };

        const { label, color, bg } = mapStatusToLabelAndStyle(status);

        return (
          <span
            style={{
              // display: "inline-block",
              padding: "4px 8px",
              borderRadius: "70px",
              color: color,
              backgroundColor: bg,
            }}
          >
            {label}
          </span>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div
          className="dropdown dropdown-action text-end"
          ref={(el) => (dropdownRefs.current[record.id] = el)}
        >
          <a
            href="javascript:void(0)"
            className="action-icon dropdown-toggle"
            onClick={() => toggleDropdown(record.id)}
          >
            <i className="material-icons">more_vert</i>
          </a>
          {openDropdownId === record.id && (
            <div className="dropdown-menu dropdown-menu-right show" style={{inset: "0px 0px auto auto", 
              transform: "translate3d(0px, 35px, 0px)"}}>
              <a
                className="dropdown-item"
                href={record.hosted_invoice_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa fa-eye m-r-5" /> Preview
              </a>
              <a className="dropdown-item" href={record.invoice_pdf} download>
                <i className="fa fa-download m-r-5" /> Download
              </a>
            </div>
          )}
        </div>
      ),
    },
  ];

  const handlePageChange = (page, pageSize) => {
    setPagination({ ...pagination, current: page, pageSize });
    fetchInvoices(page, pageSize);
  };

  const fetchInvoices = async (page, limit) => {
    try {
      setIsLoading(true);

      const url = `payment/history?companyId=${companyId}&page=${page}&limit=${limit}`;

      const response = await apiServices("GET", url, null, user_state);

      const { data, total, page: currentPage, limit: pageSize } = response.data;
      setInvoices(data || []);
      setPagination({
        current: parseInt(currentPage),
        pageSize: parseInt(pageSize),
        total: parseInt(total),
      });
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <Helmet>
        <title>{t("billing.title")}</title>
        <meta name="description" content="Billing page" />
      </Helmet>

      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">{t("Invoice History")}</h3>
                <ul className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link
                    to={
                      "/subscription-details"
                    }
                  >
                    <span className="arrow_routes"></span>
                    {t('Subscription Details')}
                  </Link>
                </li>
                <li className="breadcrumb-item active">{t('Invoice History')}</li>
              </ul>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-12">
              <div className="table-responsive">
                <Table
                  loading={isLoading}
                  className={invoices?.length > 0 ? "table-striped" : ""}
                  pagination={false}
                  style={{ overflowX: "auto" }}
                  columns={columns}
                  dataSource={invoices}
                  rowKey={(record) => record.id}
                />
              </div>
              {invoices?.length > 0 && (
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
                    pageSizeOptions={["10", "20", "30", "40", "50"]}
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
      </div>
    </div>
  );
};

export default BillingHistory;
