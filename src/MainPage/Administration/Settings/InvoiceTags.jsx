import { Table, Button, Form, Input, message, Empty, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { itemRender, onShowSizeChange } from "../../paginationfunction";
import "antd/dist/antd.css";
import "../../antdstyle.css";
import Modal from "@mui/material/Modal";
// import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { apiServices } from "../../../Services/apiServices";
import { useSelector } from "react-redux";
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const InvoiceTags = () => {
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state.user.loginvalue);

  const [form] = Form.useForm();

  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });
  const [tableLoader, setTableLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getTags();
  }, []);

  const getTags = () => {
    setTableLoader(true);
    apiServices("GET", "invoice-tag", null, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          setData(res?.data?.InvoiceTag);
          setTableLoader(false);
        }
      })
      .catch((err) => {
        setTableLoader(false);
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('settings.InvoiceTags.getInvoiceTagError')
          }!`
        );
      });
  };

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
    form.resetFields();
  };

  const onHandleDelete = (Data) => {
    setLoader(true);
    apiServices("DELETE", "invoice-tag", Data, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // console.log(data);
          setData([...data.filter((Tag) => Tag._id !== Data?._id)]);
          handleClose();
          message.success(t('settings.InvoiceTags.tagDeletedSuccessfully'));
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
              : t('settings.InvoiceTags.deleteTagError')
          }!`
        );
      });
  };

  const onFinish = (values, info) => {
    setLoader(true);
    if (info) {
        let updated_data = {
            ...values,
            companyId: info?.companyId,
            _id: info?._id,
          };
      apiServices("PUT", "invoice-tag", updated_data, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            // console.log(data);
            setData(
              data.map((Tag) => {
                if (Tag._id === info._id) {
                  return {
                    ...Tag,
                    invoiceTag: values?.invoiceTag,
                  };
                } else {
                  return {
                    ...Tag,
                  };
                }
              })
            );
            handleClose();
            message.success(t('settings.InvoiceTags.invoiceTagUpdatedSuccessfully'));
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
                : t('settings.InvoiceTags.updateInvoiceTagError')
            }!`
          );
        });
    } else {
      apiServices("POST", "invoice-tag", values, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            // console.log(data);
            setData([
              ...data,
              {
                ...values,
                _id: res?.data?.InvoiceTag?._id,
              },
            ]);
            handleClose();
            message.success(t('settings.InvoiceTags.invoiceTagAddedSuccessfully'));
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
                : t('settings.InvoiceTags.addInvoiceTagError')
            }!`
          );
        });
    }
  };

  const columns = [
    {
      title: "#",
      dataIndex: "",
      width: 50,
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: t('settings.InvoiceTags.tagName'),
      dataIndex: "invoiceTag",
      // sorter: (a, b) => a.TagName.length - b.TagName.length,
    },
    {
      title: t('holiday.actions'),
      render: (text, record) => (
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
              onClick={() => {
                setOpen({
                  isAddOpen: true,
                  isDelOpen: false,
                  data: record,
                });
              }}
            >
              <i className="fa fa-pencil m-r-5" /> {t('edit')}
            </a>
            <a
              className="dropdown-item"
              href="javascript:void(0)"
              onClick={() => {
                setOpen({
                  isAddOpen: false,
                  isDelOpen: true,
                  data: record,
                });
              }}
            >
              <i className="fa fa-trash-o m-r-5" /> {t('delete')}
            </a>
          </div>
        </div>
      ),
    },
  ];

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
            {t('settings.InvoiceTags.noInvoiceTagAdded')}
          </div>
          <div
            style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
          >
            {t('settings.InvoiceTags.clickAddInvoiceTagButton')} <br /> {t('settings.InvoiceTags.newInvoiceTag')}{" "}
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

  return (
    <div>
      {/* Page Content */}
      <div>
        {/* <div className="content container-fluid"> */}
        {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center pt-3 pb-3">
            <div className="col">
              <h3 className="page-title">{t('settings.invoiceTags')}</h3>
            </div>
            <div className="col-auto float-end ms-auto">
              <a
                href="javascript:void(0)"
                className="btn add-btn"
                onClick={() => {
                  setOpen({
                    isAddOpen: true,
                    isDelOpen: false,
                    data: "",
                  });
                }}
                // data-bs-target="#add_leavetype"
              >
                <i className="fa fa-plus" /> {t('settings.InvoiceTags.addInvoiceTag')}
              </a>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive">
              <Table
                loading={tableLoader}
                className={data?.length > 0 ? "table-striped" : ""}
                style={{
                    minHeight: "200px"
                  }} 
                locale={{
                  emptyText: tableLoader ? null : customEmptyText,
                }}
                pagination={false}
                columns={columns}
                bordered
                dataSource={data}
                rowKey={(record) => record.id}
                // onChange={this.handleTableChange}
                components={i18n.dir()==="rtl" ?
                      {
                      header: {
                        cell: ({ children }) => <th style={{ textAlign: 'right' }}>{children}</th>,
                      },
                    } :
                    null
                    }
                    onRow={ i18n.dir()==="rtl" ?
                      (record, rowIndex) => {
                      return {
                        style: { textAlign: 'right' }, // Align table data to the right
                      };
                    } :
                    null
                    }
              />
            </div>
          </div>
        </div>
      </div>
      {/* /Page Content */}

      <Modal
        open={open.isAddOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        // className="modal custom-modal fade"
        aria-describedby="modal-modal-description"
        disableRestoreFocus
        BackdropProps={{
          style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
        }}
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {open?.data ? t('holiday.update') : t('holiday.add')} {t('settings.InvoiceTags.invoiceTag')}
              </h5>
              <button type="button" className="close" onClick={handleClose}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <Form
                // form={form}
                name="control-hooks"
                onFinish={(val) => onFinish(val, open?.data)}
                onFinishFailed={({errorFields}) => {
                  const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                  if(consecutiveSpacesError){
                    message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                 }else{
                    message.error(t('allEmp.errors.fillRequiredFields'))
                  } 
                }}
                initialValues={{
                  invoiceTag: open?.data ? open?.data?.invoiceTag : "",
                }}
                autoComplete="off"
              >
                <div className="form-group">
                  <label>
                  {t('settings.InvoiceTags.invoiceTagName')} <span className="text-danger">*</span>
                  </label>
                  <Form.Item
                    name="invoiceTag"
                    rules={[
                      {
                        whitespace: true,
                        required: true,
                        validator: (_, value) => {
                          if(value.trim() === ''){
                            return Promise.reject(t('settings.InvoiceTags.pleaseEnterTagName'));
                          }
                          else if (/\s{2,}/.test(value)) {
                            return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                    className="custom-border"
                  >
                    <Input className="form-control" maxLength={50} autoFocus />
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

      {/* delete modall */}
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
                <h3 style={{ marginBottom: "30px" }}>{t('delete')} {t('settings.InvoiceTags.invoiceTag')}</h3>
                <p>
                  <span dangerouslySetInnerHTML={{ __html: t('projectScreen.confirmDeleteProject', { project: open?.data?.invoiceTag }) }} />
                </p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
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

export default InvoiceTags;