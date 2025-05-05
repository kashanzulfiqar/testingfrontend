import React, { useEffect, useState, useRef } from "react";
import { apiServices } from "../../../Services/apiServices";
import { Helmet } from "react-helmet";
import { t } from "i18next";
import { useSelector } from "react-redux";
import { Pagination, Table } from "antd";
import { itemRender } from "../../paginationfunction";

const BillingHistory = () => {
  const [invoices, setInvoices] = useState([]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRefs = useRef({});
  const user_state = useSelector((state) => state.user.loginvalue);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const companyId = user_state?.user?.companyId;

  const toggleDropdown = (invoiceId) => {
    setOpenDropdownId((prevId) => (prevId === invoiceId ? null : invoiceId));
  };

   const closeDropdowns = (e) => {
    if (
      !Object.values(dropdownRefs.current).some(ref => ref?.contains(e.target))
    ) {
      setOpenDropdownId(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeDropdowns);
    return () => document.removeEventListener("mousedown", closeDropdowns);
  }, []);

  useEffect(() => {
    if (companyId) {
      setInvoices([]);
      setPagination({ current: 1, pageSize: 10 });
      fetchInvoices(null, true);
    }
  }, [companyId]);

  const formatAmount = (amount, currency) => {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  };

  const columns = [
    {
      title: "Invoice #",
      dataIndex: "number",
      key: "number",
      render: (text) => text || "-",
    },
    {
      title: "Date",
      dataIndex: "created",
      key: "created",
      render: (text) => 
        text ? new Date(text * 1000).toLocaleDateString() : "-",
    },
    {
      title: "Amount",
      dataIndex: "amount_due",
      key: "amount_due",
      render: (amount, record) => formatAmount(amount, record.currency),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div
          className="dropdown"
          ref={(el) => (dropdownRefs.current[record.id] = el)}
        >
          <button
            onClick={() => toggleDropdown(record.id)}
            className="dropdown-toggle"
          >
            ⋮
          </button>
          {openDropdownId === record.id && (
            <ul className="dropdown-menu">
              <li>
                <a
                  href={record.invoice_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Preview
                </a>
              </li>
              <li>
                <a href={record.invoice_pdf} download>
                  Download
                </a>
              </li>
            </ul>
          )}
        </div>
      ),
    },
  ];

  const handlePageChange = (page, pageSize) => {
    const isNextPage = page > pagination.current;

    setPagination({
      current: page,
      pageSize,
    });

    if (isNextPage && hasMore) {
      fetchInvoices(lastInvoiceId);
    }
  };

  const fetchInvoices = async (startAfter = null, reset = false) => {
    try {
      setIsLoading(true);
      const limit = pagination.pageSize;

      const url = `payment/history?companyId=${companyId}&limit=${limit}${startAfter ? `&starting_after=${startAfter}` : ""}`;

      const response = await apiServices("GET", url, null, user_state);
      const fetched = response.data.data || [];

      if (reset) {
        setInvoices(fetched);
      } else {
        setInvoices((prev) => [...prev, ...fetched]);
      }

      setHasMore(response.data.has_more);
      setLastInvoiceId(response.data.last_invoice_id);
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
                <h3 className="page-title">{t("billing.title")}</h3>
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
                  columns={columns}
                  dataSource={invoices}
                  rowKey={(record) => record.id}
                />
              </div>
              {invoices?.length > 0 && (
                <div>
                  <Pagination
                    style={{display: 'flex', float: 'right'}}
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={invoices.length}
                    showTotal={(total, range) =>
                      t('paginationShow', { range1: range[0], range2: range[1], total: total })}
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
