import React, { useEffect, useMemo, useState } from "react";
import { Table, Spin, Empty, message, Pagination } from "antd";
import { itemRender } from "../../paginationfunction";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";

const ClientReport = () => {
  const userState = useSelector((state) => state?.user?.loginvalue);
  const { t, i18n } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [preferredCurrency, setPreferredCurrency] = useState("USD");

  const columns = useMemo(
    () => [
      {
        title: "Client",
        key: "clientName",
        width: '33.33%',
        render: (_, record) => record?.clientName || "--",
      },
      {
        title: "Total Projects",
        key: "projectCount",
        align: "center",
        width: '33.33%',
        render: (_, record) => Number(record?.projectCount || 0),
      },
      {
        title: "Revenue",
        key: "revenue",
        align: "right",
        width: '33.33%',
        render: (_, record) => {
          const revenue = (record?.invoices || []).reduce((sum, inv) => {
            const amt = Number(inv?.convertedAmount || 0);
            return sum + (isNaN(amt) ? 0 : amt);
          }, 0);
          const currencyCode = preferredCurrency || "USD";
          try {
            const amountFormatted = new Intl.NumberFormat(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(revenue);
            return `${amountFormatted} ${currencyCode}`;
          } catch (e) {
            return `${revenue.toLocaleString()} ${currencyCode}`;
          }
        },
      },
    ],
    [preferredCurrency]
  );

  useEffect(() => {
    let cancelled = false;
    const fetchReport = async () => {
      setLoading(true);
      try {
        // Attempt to fetch from backend if available
        const res = await apiServices("GET", "client/clients-summary", null, userState);
        const list = res?.data?.success ? res?.data?.clients || [] : [];
        const apiPreferredCurrency = res?.data?.preferredCurrency;
        if (apiPreferredCurrency) setPreferredCurrency(apiPreferredCurrency);
        if (!cancelled) setRows(Array.isArray(list) ? list : []);
        if (!res?.data?.success) message.info("Showing empty client report (no data)");
      } catch (e) {
        // Fallback to empty data if endpoint is not available
        if (!cancelled) setRows([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchReport();
    return () => {
      cancelled = true;
    };
  }, [userState]);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return rows.slice(start, end);
  }, [rows, currentPage, pageSize]);

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Client Report</h3>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              <Table
                loading={loading}
                className={rows?.length > 0 ? "table-striped" : ""}
                locale={{ emptyText: loading ? null : <Empty description="No client data" /> }}
                pagination={false}
                style={{ overflowX: 'auto' }}
                tableLayout="fixed"
                columns={columns}
                dataSource={pagedRows}
                rowKey={(r, i) => r?._id || r?.clientId || r?.client?.id || String(i)}
              />
              {rows?.length > 0 && (
                <div>
                  <Pagination
                    style={{ display: 'flex', float: 'right' }}
                    total={rows.length}
                    pageSize={pageSize}
                    defaultCurrent={1}
                    current={currentPage}
                    showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
                    onChange={(page, size) => {
                      setPageSize(size);
                      setCurrentPage(page);
                    }}
                    showSizeChanger={true}
                    pageSizeOptions={['20', '30', '40', '50']}
                    itemRender={(current, type, originalElement) =>
                      itemRender(current, type, originalElement, t)
                    }
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

export default ClientReport;


