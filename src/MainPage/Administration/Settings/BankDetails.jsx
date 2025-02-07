import React, { useEffect, useState } from "react";
import {
  Button,
  Empty,
  Form,
  Input,
  InputNumber,
  Pagination,
  Select,
  Spin,
  Table,
  message,
} from "antd";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices";
import { LoadingOutlined } from "@ant-design/icons";
import EmptyTable from "../../../files/Icons/EmptyTable.svg";
import { Modal } from "@mui/material";
import { itemRender } from "../../paginationfunction";
import { useTranslation } from "react-i18next";
import { getCountryCode, countries } from 'countries-list'
import { getCountrySpecifications } from 'ibantools';

const BankDetails = () => {
  const { t, i18n } = useTranslation();
  const user_state = useSelector((state) => state.user.loginvalue);
  let company_id = user_state?.user?.companyId;

  const [form] = Form.useForm();

  const [data, setData] = useState([]);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [bankId, setBankId] = useState();
  const [tableLoader, setTableLoader] = useState(false);
  const [loader, setLoader] = useState(false);
  const [open, setOpen] = useState({
    isAddOpen: false,
    isDelOpen: false,
    data: "",
  });
  const [countryOptions, setCountryOptions] = useState([]);
  const [ibanLength, setIbanLength] = useState(0);
  const [ibanList, setIBANList] = useState([]);

  useEffect(() => {
    getBankDetails();
    const ibanSpecs = getCountrySpecifications()
    const ibanSpecsArray = Object.entries(ibanSpecs).map(([countryCode, specs]) => ({
      countryCode,
      ...specs
    }));
    setIBANList(ibanSpecsArray);
    console.log(ibanSpecsArray)
    setCountryOptions(Object.values(countries)?.map(country => country.name));

  }, []);

  const getBankDetails = () => {
    setTableLoader(true);
    apiServices("GET", "bank-details", null, user_state)
      .then((res) => {
        // console.log(res?.data?.leavePolicies);
        if (res?.data?.success === true) {
          setData(res?.data?.bankDetail);
          setBankId(
            res?.data?.bankDetail?._id ? res?.data?.bankDetail?._id : null
          );
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
              : t('settings.BankDetails.getBankDetailError')
          }!`
        );
      });

    // setData(data1 ? data1 : {})
    // setFirstLeaves(data1)
  };

  //   useEffect(() => {
  //     // When the data state changes, update the form fields with the new data
  //     if (data) {
  //       let d = {
  //         bankName: data?.bankName ? data?.bankName : "",
  //         country: data?.country || "",
  //         city: data?.city || "",
  //         address: data?.address || "",
  //         iban: data?.iban|| "",
  //         swiftCode: data?.swiftCode || "",
  //       };
  //       form.setFieldsValue(d);
  //     }
  //   }, [data]);

  const handleClose = () => {
    setOpen({ isAddOpen: false, isDelOpen: false, data: "" });
    form.resetFields();
    setIbanLength(0);
  };

  const handleIBANLength = (country) => {
    const countryCode = getCountryCode(country);
    const matchedSpec = ibanList.find(spec => spec?.countryCode === countryCode);
    
    if (matchedSpec && matchedSpec.chars) {
      const length = matchedSpec.chars;
      console.log(length)
      setIbanLength(length);
    } else {
      setIbanLength(31);
    }
  };

  const onHandleDelete = (Data) => {
    setLoader(true);
    apiServices("DELETE", "bank-details", Data, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          // console.log(data);
          setData([...data.filter((Bank) => Bank._id !== Data?._id)]);
          handleClose();
          message.success(t('settings.BankDetails.bankDeletedSuccessfully'));
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
              : t('settings.BankDetails.errorDeletingBankDetails')
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
      apiServices("PUT", "bank-details", updated_data, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            setData(
              data.map((Bank) => {
                if (Bank._id === info._id) {
                  return {
                    ...Bank,
                    ...values,
                  };
                } else {
                  return {
                    ...Bank,
                  };
                }
              })
            );
            handleClose();
            message.success(t('settings.BankDetails.bankDetailsUpdatedSuccessfully'));
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
                : t('settings.BankDetails.updatingBankDetailsError')
            }!`
          );
        });
    } else {
      apiServices("POST", "bank-details", values, user_state)
        .then((res) => {
          // console.log(res?.data);
          if (res?.data?.success === true) {
            // console.log(data);
            setData([
              ...data,
              {
                ...values,
                _id: res?.data?.bankDetail?._id,
              },
            ]);
            handleClose();
            message.success(t('settings.BankDetails.bankDetailsAddedSuccessfully'));
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
                : t('settings.BankDetails.addBankDetailsError')
            }!`
          );
        });
    }
  };

  //   const onFinish1 = (values) => {
  //     setLoader(true);
  //     let new_values = {
  //       ...values,
  //       companyId: company_id,
  //     };

  //     // if(!firstLeaves && firstFlag){
  //     if (!bankId) {
  //       apiServices("POST", "bank-details", new_values, user_state)
  //         .then((res) => {
  //           // console.log(res?.data);
  //           if (res?.data?.success === true) {
  //             // setData(res?.data?.leavePolicies || {})
  //             setBankId(res?.data?.bankDetail?._id);
  //             message.success("Bank Details Added Successfully!");
  //             setLoader(false);
  //           }
  //         })
  //         .catch((err) => {
  //           setLoader(false);
  //           // console.log(err);
  //           message.error(
  //             `${
  //               err?.response?.data?.msg
  //                 ? err?.response?.data?.msg
  //                 : err?.response?.data?.validation?.body?.message
  //                 ? err?.response?.data?.validation?.body?.message
  //                 : "Error Adding Bank Details"
  //             }!`
  //           );
  //         });

  //       // console.log("=======onAdding=======", new_values);
  //       // setFirstFlag(false)
  //     } else {
  //       let values_withId = {
  //         ...new_values,
  //         _id: bankId,
  //       };

  //       apiServices("PUT", "bank-details", values_withId, user_state)
  //         .then((res) => {
  //           // console.log(res?.data);
  //           if (res?.data?.success === true) {
  //             message.success("Bank Details Updated Successfully!");
  //             setLoader(false);
  //           }
  //         })
  //         .catch((err) => {
  //           setLoader(false);
  //           // console.log(err);
  //           message.error(
  //             `${
  //               err?.response?.data?.msg
  //                 ? err?.response?.data?.msg
  //                 : err?.response?.data?.validation?.body?.message
  //                 ? err?.response?.data?.validation?.body?.message
  //                 : "Updating Bank Details Error"
  //             }!`
  //           );
  //         });

  //       // console.log("--------Updating--------", values_withId);
  //     }
  //   };

  const columns = [
    {
      title: "#",
      dataIndex: "",
      width: 50,
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: t('settings.BankDetails.bankName'),
      dataIndex: "bankName",
      // sorter: (a, b) => a.TagName.length - b.TagName.length,
    },
    {
      title: t('settings.BankDetails.accountTitle'),
      dataIndex: "accountTitle",
      // sorter: (a, b) => a.TagName.length - b.TagName.length,
    },
    {
      title: t('settings.BankDetails.accountNo'),
      dataIndex: "accountNo",
      // sorter: (a, b) => a.TagName.length - b.TagName.length,
    },
    {
      title: t('settings.BankDetails.country'),
      dataIndex: "country",
      // sorter: (a, b) => a.TagName.length - b.TagName.length,
    },
    {
      title: t('settings.BankDetails.city'),
      dataIndex: "city",
      // sorter: (a, b) => a.TagName.length - b.TagName.length,
    },
    {
      title: t('settings.BankDetails.address'),
      dataIndex: "address",
      render: (text, record) => (
        <label className="longText">
          {record?.address ? record?.address : "-"}
        </label>
      ),
      // sorter: (a, b) => a.TagName.length - b.TagName.length,
    },
    {
      title: "IBAN",
      dataIndex: "iban",
      // sorter: (a, b) => a.TagName.length - b.TagName.length,
    },
    {
      title: t('settings.BankDetails.swiftCode'),
      dataIndex: "swiftCode",
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
                })
                handleIBANLength(record?.country)
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
            {t('settings.BankDetails.noBankAddedYet')}
          </div>
          <div
            style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
          >
            {t('settings.BankDetails.clickToAddBankDetails')} <br /> {t('settings.BankDetails.newInvoiceBank')}{" "}
          </div>
        </div>
      }
    />
  );

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 30,
        color: "#fff",
      }}
      spin
    />
  );

  return (
    <div>
      <div>
        {/* <h6 className="card-title m-b-20">Module Access</h6>
               {/* Page Header */}
        <div className="page-header">
          <div className="row align-items-center pt-3 pb-3">
            <div className="col">
              <h3 className="page-title">{t('settings.bankDetails')}</h3>
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
                <i className="fa fa-plus" /> {t('requests.addModal.add')} {t('settings.bankDetails')}
              </a>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="table-responsive BankTable">
              <Table
                loading={tableLoader}
                className={data?.length > 0 ? "table-striped" : ""}
                style={{ marginBottom:"100px" }}
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
            {/* {
                    data?.length > 0 &&
                    <div>
                      <Pagination
                        style={{display: 'flex', float: 'right'}}
                        total={data?.length}
                        pageSize={pageSize}
                        defaultCurrent={1}
                        current={currentPage}
                        showTotal={(total, range) =>
                          `Showing ${range[0]} to ${range[1]} of ${total} entries`}
                        onChange={(page, size) => {
                            setCurrentPage(page);
                        }}  
                        showSizeChanger={true}
                        onShowSizeChange= {(current, size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                        pageSizeOptions={['10', '20', '40', '50']}
                        
                        itemRender={itemRender}
                      />
                    </div>
                  } */}
          </div>
        </div>
      </div>
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
        sx={{ overflowY: "auto" }}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {open?.data ? t('holiday.update') : t('holiday.add')} {t('settings.bankDetails')}
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
                onFinishFailed={({ errorFields }) => {
                  const consecutiveSpacesError = errorFields.find((field) =>
                    field.errors.toString().includes("consecutive spaces")
                  );
                  if(consecutiveSpacesError){
                    message.error(t('allEmp.errors.removeConsecutiveSpaces'))
                 }else{
                    message.error(t('allEmp.errors.fillRequiredFields'))
                  } 
                }}
                initialValues={{
                  bankName: open?.data ? open?.data?.bankName : "",
                  accountNo: open?.data ? open?.data?.accountNo : "",
                  accountTitle: open?.data ? open?.data?.accountTitle : "",
                  country: open?.data ? open?.data?.country : "",
                  city: open?.data ? open?.data?.city : "",
                  address: open?.data ? open?.data?.address : "",
                  iban: open?.data ? open?.data?.iban : "",
                  swiftCode: open?.data ? open?.data?.swiftCode : "",
                }}
                autoComplete="off"
              >
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="col-form-label">
                      {t('settings.BankDetails.bankName')}  <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="bankName"
                        rules={[
                          {
                            required: true,
                            message: t('settings.BankDetails.pleaseEnterTheBankName'),
                          },
                        ]}
                        validateTrigger="onSubmit"
                        className="custom-border"
                      >
                        <Input className="form-control" placeholder="Enter a Bank Name"/>
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="col-form-label">
                      {t('settings.BankDetails.accountTitle')}  <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="accountTitle"
                        rules={[
                          {
                            required: true,
                            message: t('settings.BankDetails.pleaseEnterAccountTitle'),
                          },
                        ]}
                        validateTrigger="onSubmit"
                        className="custom-border"
                      >
                        <Input className="form-control" placeholder="Enter an Account Title"/>
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      
                    <label className="col-form-label">
                      {t('empProfile.bankAccountNo')} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name='accountNo'
                        className='custom-border'
                        rules={[
                          {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                              if (!value || value.trim() === '') {
                                return Promise.reject(t('empProfile.errors.pleaseEnterBankAccountNumber'));
                              } else if (/\s{2,}/.test(value)) {
                                return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                              } else if (value.length < 3) {
                                return Promise.reject(t('empProfile.errors.accountNumberMinLength'));
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input className='form-control' maxLength={25} placeholder="Enter Account Number"
                          // onKeyPress={(e) => {
                          //   if ((e.which >= 65 && e.which <= 90) || (e.which >= 97 && e.which <= 122) || (e.which >= 33 &&  e.which <= 47) || (e.which >= 58 && e.which <= 64) || (e.which >= 91 && e.which <= 96) || (e.which >= 123 && e.which <= 126) ) {
                          //     e.preventDefault();
                          //   }
                          // }}
                        />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="col-form-label">
                      {t('settings.BankDetails.country')} <span className="text-danger">*</span>
                      </label>
                      <div style={{ position: "relative" }} id="area">
                        <Form.Item
                          name="country"
                          rules={[
                            {
                              required: true,
                              message: 'Please select a country',
                            },
                          ]}
                          className="custom-border"
                        >
                          <Select
                            showSearch
                            className="custom-select custom-normal"
                            getPopupContainer={() =>
                              document.getElementById("area")
                            }
                            placeholder="Select a Country"
                            onChange={(value)=>{handleIBANLength(value)}}
                          >
                            {
                              countryOptions?.map((country, index) => (
                                <Select.Option key={index} value={country}>
                                  {country}
                                </Select.Option>
                              ))
                            }
                          </Select>
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="col-form-label">
                      {t('settings.companySettings.city')} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="city"
                        rules={[
                          {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                              if(value.trim() === ''){
                                return Promise.reject(t('settings.companySettings.pleaseEnterCityName'));
                              }
                              else if (/\s{2,}/.test(value)) {
                                return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                              }
                              return Promise.resolve();
                            },
                          },
                          {
                            min: 3,
                            message: t('settings.minLength2', { name: t('settings.companySettings.city') }),
                          },
                        ]}
                        validateTrigger="onSubmit"
                        className="custom-border"
                      >
                        <Input className="form-control" placeholder="Enter a City Name" maxLength={50} />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="col-form-label">
                      {t('settings.companySettings.address')} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="address"
                        rules={[
                          {
                            whitespace: true,
                            required: true,
                            validator: (_, value) => {
                              if(value.trim() === ''){
                                return Promise.reject(t('settings.companySettings.pleaseEnterAddress'));
                              }
                              else if (/\s{2,}/.test(value)) {
                                return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                              }
                              return Promise.resolve();
                            },
                          },
                          {
                            min: 5,
                            message: t('settings.minLength3', { name: t('settings.companySettings.address') }),
                          },
                        ]}
                        validateTrigger="onSubmit"
                        className="custom-border"
                      >
                        <Input className="form-control" placeholder="Enter the Bank Address" maxLength={150} />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        IBAN <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="iban"
                        rules={[
                          {
                            required: true,
                            message: t('settings.BankDetails.pleaseEnterTheIBANnumber'),
                          },
                          {
                            min: 15,
                            message: t('settings.BankDetails.ibanLengthError'),
                          },
                          {
                            validator: (_, value) => {
                              if (/\s/.test(value)) {
                                return Promise.reject(
                                  t('settings.BankDetails.ibanNoSpacesError')
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        validateTrigger="onSubmit"
                        className="custom-border"
                      >
                        <Input className="form-control" placeholder="Enter an IBAN" maxLength={ibanLength} />
                      </Form.Item>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="col-form-label">
                        {t('settings.BankDetails.swiftCode')} <span className="text-danger">*</span>
                      </label>
                      <Form.Item
                        name="swiftCode"
                        rules={[
                          {
                            required: true,
                            message: t('settings.BankDetails.pleaseEnterTheBankSWIFTCode'),
                          },
                          {
                            min: 8,
                            message: t('settings.BankDetails.swiftCodeLengthError'),
                          },
                          {
                            validator: (_, value) => {
                              if (/\s/.test(value)) {
                                return Promise.reject(
                                  t('settings.BankDetails.swiftCodeNoSpacesError')
                                );
                              }
                              if (/[^A-Za-z0-9]/.test(value)) {
                                return Promise.reject(t('settings.BankDetails.swiftCodeNoSpecialCharsError'));
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                        validateTrigger="onSubmit"
                        className="custom-border"
                      >
                        <Input className="form-control" placeholder="Enter a SWIFT Code" maxLength={11}/>
                      </Form.Item>
                    </div>
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
                        t('settings.saveChanges')
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
                <h3 style={{ marginBottom: "30px" }}>{t('settings.BankDetails.deleteBank')}</h3>
                <p>
                  <span dangerouslySetInnerHTML={{ __html: t('projectScreen.confirmDeleteProject', { project: open?.data?.bankName }) }} />
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

export default BankDetails;
