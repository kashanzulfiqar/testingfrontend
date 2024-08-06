
import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {Applogo} from "../../../Entryfile/imagepath"
import { useSelector } from 'react-redux';
import invoicePDF from './invoicePDF';
import { useTranslation } from 'react-i18next';

const Invoiceview = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const invoice_data = location?.state?.invoice_data;
  const nav = useNavigate();
  const permissions = useSelector((state) => state?.permissionsSlice?.data);

  const user_state = useSelector((state) => state?.user?.loginvalue);
  const role = user_state?.user?.role

  const [invoiceInfo, setInvoiceInfo] = useState()

  useEffect(() => {
    if((role === 'admin' || role === 'client' || permissions?.managePayrolls) && invoice_data) {
      setInvoiceInfo(invoice_data)
      console.log(invoice_data);
    }else{
      nav(`${role === 'client' ? '/client/client-profile' : role === 'focalperson' ? `/client/focal-profile` : role === 'admin' ? `/main/dashboard` : `/employee/dashboard`}`)
    }
  }, [])
  

  const formatDate = (inputDate) => {
    if(inputDate){
      const date = new Date(inputDate);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
  
      // let daySuffix = "th";
      // if (day === 1 || day === 21 || day === 31) {
      //     daySuffix = "st";
      // } else if (day === 2 || day === 22) {
      //     daySuffix = "nd";
      // } else if (day === 3 || day === 23) {
      //     daySuffix = "rd";
      // }
  
      // const formattedDate = `${day}${daySuffix} ${month}, ${year}`;
      const formattedDate = `${month} ${day}, ${year}`;
      return formattedDate;
    }
}

const calculateTotal = () => {
  let sub_total = 0;

  if (invoiceInfo?.teamDetails?.length > 0) {
    invoiceInfo?.teamDetails?.forEach((item) => {
      sub_total += parseFloat(item?.totalAmount) || 0;
    });
  }
  else if (invoiceInfo?.monthlyTeamDetails?.length > 0) {
    invoiceInfo?.monthlyTeamDetails?.forEach((item) => {
      sub_total += parseFloat(item?.totalAmount) || 0;
    });
  }
  else if (invoiceInfo?.servicesDetails?.length > 0) {
    invoiceInfo?.servicesDetails?.forEach((item) => {
      sub_total += parseFloat(item?.totalAmount ? item?.totalAmount : item?.amount) || 0;
    });
  }

  return sub_total?.toFixed(2);
}

const calculateSubTotal = () => {
  let sub_total = 0;

  if (invoiceInfo?.teamDetails?.length > 0) {
    invoiceInfo?.teamDetails?.forEach((item) => {
      sub_total += parseFloat(item?.total) || 0;
    });
  }
  else if (invoiceInfo?.monthlyTeamDetails?.length > 0) {
    invoiceInfo?.monthlyTeamDetails?.forEach((item) => {
      sub_total += parseFloat(item?.total) || 0;
    });
  }
  else if (invoiceInfo?.servicesDetails?.length > 0) {
    invoiceInfo?.servicesDetails?.forEach((item) => {
      sub_total += parseFloat(item?.amount) || 0;
    });
  }

  return sub_total?.toFixed(2);
}
const calculateTaxAmount = () => {
  let tax_amount = 0;
  tax_amount = ((+invoiceInfo?.invoiceTax/100)*calculateTotal())

  return tax_amount?.toFixed(2);
}
const calculateDiscountAmount = () => {
  let disc_amount = 0;
  let total = +calculateTotal() + +calculateTaxAmount();
  disc_amount = ((+invoiceInfo?.discount/100)*total)

  return disc_amount?.toFixed(2);
}
  
      return ( 
            <div className="page-wrapper">
            <Helmet>
                <title>{t('finance.Invoices.invoice')} - {t('header.daftarPro')}</title>
                <meta name="description" content="Login page"/>					
            </Helmet>
              {/* Page Content */}
              <div className="content container-fluid">
                {/* Page Header */}
                <div className="page-header">
                  <div className="row align-items-center">
                    <div className="col">
                      <h3 className="page-title">{t('finance.Invoices.invoice')}</h3>
                      <ul className="breadcrumb">
                        <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>{t('dashboard')}</Link></li>
                        <li className="breadcrumb-item active">{t('finance.Invoices.invoice')}</li>
                      </ul>
                    </div>
                    <div className="col-auto float-end ms-auto">
                      <div className="btn-group btn-group-sm">
                        {/* <button className="btn btn-white">CSV</button> */}
                        <button
                          className="btn btn-white"
                          onClick={() => {
                            invoicePDF(invoiceInfo);
                          }}
                        >
                          <i className="fa fa-download fa-lg m-r-5" /> {t('finance.Invoices.exporttoPdf')}
                        </button>
                        {/* <button className="btn btn-white"><i className="fa fa-print fa-lg" /> Print</button> */}
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Page Header */}
                <div className="row">
                  <div className="col-md-12">
                    <div className="card" dir="ltr">
                      <div className="card-body">
                        <div className="row">
                          {/* <div className="col-sm-6 m-b-20 d-grid"> */}
                          <div className="col-sm-6 m-b-20">
                            <img src={invoiceInfo?.company?.imageUrl} className="inv-logo" alt="" />
                            {/* <img src={invoiceInfo?.clientId?.logo} className="inv-logo" alt="" /> */}
                            <h5><strong>{invoiceInfo?.company?.companyName}</strong></h5>
                            <ul className="list-unstyled">
                              <li>
                              <label style={{maxWidth: '200px'}}>
                                {invoiceInfo?.company?.companyAddress}
                              </label>
                              </li>
                            </ul>
                            {/* <ul className="list-unstyled">
                              <li>Dreamguy's Technologies</li>
                              <li>3864 Quiet Valley Lane,</li>
                              <li>Sherman Oaks, CA, 91403</li>
                              <li>GST No:</li>
                            </ul> */}
                          </div>
                          <div className="col-sm-6 m-b-20">
                            <div className="invoice-details">
                              <h3 className="text-uppercase">Invoice# {invoiceInfo?.invoiceNo}</h3>
                              <ul className="list-unstyled">
                                <li>Invoice Date: <label>{formatDate(invoiceInfo?.invoiceDate)}</label></li>
                                {invoiceInfo?.invoiceStartDate ? <li>Start Date: <label>{formatDate(invoiceInfo?.invoiceStartDate)}</label></li> : null}
                                {invoiceInfo?.invoiceEndDate ? <li>End Date: <label>{formatDate(invoiceInfo?.invoiceEndDate)}</label></li> : null}
                                <li>Due Date: <label>{formatDate(invoiceInfo?.dueDate)}</label></li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-sm-6 col-lg-7 col-xl-8 m-b-20">
                            <label style={{fontWeight: '500', fontSize: '14px', lineHeight: '35px'}}>Invoice to:</label>
                            <ul className="list-unstyled">
                              <li><h5><strong>{invoiceInfo?.client?.clientName}</strong></h5></li>
                              {/* <li><h5><strong>{invoiceInfo?.clientId?.clientName}</strong></h5></li> */}
                              {/* <li><span>Global Technologies</span></li>
                              <li>5754 Airport Rd</li>
                              <li>Coosada, AL, 36020</li>
                              <li>United States</li>
                              <li>888-777-6655</li>
                              <li><a href="#">barrycuda@example.com</a></li> */}
                            </ul>
                            <label style={{maxWidth: '200px'}}>
                             {invoiceInfo?.client?.headOfficeAddress}
                             {/* {invoiceInfo?.clientId?.headOfficeAddress} */}
                            </label>
                            <ul className="list-unstyled">
                              <li>{invoiceInfo?.client?.country}</li>
                              <li>{invoiceInfo?.client?.clientPhoneNo}</li>
                              <li><a href="javascript:void(0)">{invoiceInfo?.client?.invoiceEmail}</a></li>
                              {/* <li>{invoiceInfo?.clientId?.country}</li>
                              <li>{invoiceInfo?.clientId?.clientPhoneNo}</li>
                              <li><a href="javascript:void(0)">{invoiceInfo?.clientId?.clientEmail}</a></li> */}
                            </ul>
                          </div>
                          <div className="col-sm-6 col-lg-5 col-xl-4 m-b-20">
                            <span className="text-muted">Payment Details:</span>
                            <ul className="list-unstyled invoice-payment-details">
                              <li>Total Due: <span className="text-end">{invoiceInfo?.remainingAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {invoiceInfo?.currency}</span></li>
                              <li>Bank name: <label>{invoiceInfo?.bankDetail?.bankName}</label></li>
                              <li>Country: <label>{invoiceInfo?.bankDetail?.country}</label></li>
                              <li>City: <label>{invoiceInfo?.bankDetail?.city}</label></li>
                              <li>Address: <label>{invoiceInfo?.bankDetail?.address}</label></li>
                              <li>Account Title: <label>{invoiceInfo?.bankDetail?.accountTitle}</label></li>
                              <li>Account #: <label>{invoiceInfo?.bankDetail?.accountNo}</label></li>
                              <li>IBAN: <label>{invoiceInfo?.bankDetail?.iban}</label></li>
                              <li>SWIFT code: <label>{invoiceInfo?.bankDetail?.swiftCode}</label></li>
                            </ul>
                          </div>
                        </div>
                        {
                          invoiceInfo?.teamDetails?.length > 0 
                          ?
                          <div className="table-responsive">
                            <table className="table table-striped table-hover">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Resource Name</th>
                                  <th>Hourly Rate</th>
                                  <th>Hours Worked</th>
                                  <th>Amount</th>
                                  <th>Tax %</th>
                                  <th className="text-end">TOTAL</th>
                                </tr>
                              </thead>
                              <tbody>
                              {invoiceInfo?.teamDetails?.map((item, index) => (
                                <tr key={item._id}>
                                  <td>{index + 1}</td>
                                  <td>{item.userName}</td>
                                  <td>{item.cost?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {invoiceInfo?.currency}</td>
                                  <td>{item.hoursWorked}</td>
                                  <td>{item.total?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {invoiceInfo?.currency}</td>
                                  <td>{item.taxPercent}</td>
                                  <td className="text-end">{item.totalAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {invoiceInfo?.currency}</td>
                                </tr>
                              ))}
                                {/* <tr>
                                  <td>1</td>
                                  <td>Android Application</td>
                                  <td className="d-none d-sm-table-cell">Lorem ipsum dolor sit amet, consectetur adipiscing elit</td>
                                  <td>$1000</td>
                                  <td>2</td>
                                  <td className="text-end">$2000</td>
                                </tr> */}
                              </tbody>
                            </table>
                          </div>
                          :
                          invoiceInfo?.monthlyTeamDetails?.length > 0 
                          ?
                          <div className="table-responsive">
                            <table className="table table-striped table-hover">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Resource Name</th>
                                  <th>Monthly Rate</th>
                                  <th>Days Worked</th>
                                  <th>Amount</th>
                                  <th>Tax %</th>
                                  <th className="text-end">TOTAL</th>
                                </tr>
                              </thead>
                              <tbody>
                              {invoiceInfo?.monthlyTeamDetails?.map((item, index) => (
                                <tr key={item._id}>
                                  <td>{index + 1}</td>
                                  <td>{item.userName}</td>
                                  <td>{item.cost?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {invoiceInfo?.currency}</td>
                                  <td>{item.daysWorked}</td>
                                  <td>{item.total?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {invoiceInfo?.currency}</td>
                                  <td>{item.taxPercent}</td>
                                  <td className="text-end">{item.totalAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {invoiceInfo?.currency}</td>
                                </tr>
                              ))}
                                {/* <tr>
                                  <td>1</td>
                                  <td>Android Application</td>
                                  <td className="d-none d-sm-table-cell">Lorem ipsum dolor sit amet, consectetur adipiscing elit</td>
                                  <td>$1000</td>
                                  <td>2</td>
                                  <td className="text-end">$2000</td>
                                </tr> */}
                              </tbody>
                            </table>
                          </div>
                          :
                          invoiceInfo?.servicesDetails?.length > 0 
                          ?
                          <div className="table-responsive">
                            <table className="table table-striped table-hover">
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>ITEM</th>
                                  <th className="d-none d-sm-table-cell">DESCRIPTION</th>
                                  <th>UNIT COST</th>
                                  <th>QUANTITY</th>
                                  <th>Amount</th>
                                  <th>Tax %</th>
                                  <th className="text-end">TOTAL</th>
                                </tr>
                              </thead>
                              <tbody>
                              {invoiceInfo?.servicesDetails?.map((item, index) => (
                                <tr key={item._id}>
                                  <td>{index + 1}</td>
                                  <td>{item.item}</td>
                                  <td className="d-none d-sm-table-cell">{item.description}</td>
                                  <td>{item.unitCost?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {invoiceInfo?.currency}</td>
                                  <td>{item.quantity}</td>
                                  <td>{item.amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {invoiceInfo?.currency}</td>
                                  <td>{item.taxPercent ? item.taxPercent : '0'}</td>
                                  <td className="text-end">{(item?.totalAmount ? item?.totalAmount : item?.amount)?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {invoiceInfo?.currency}</td>
                                </tr>
                              ))}
                                {/* <tr>
                                  <td>1</td>
                                  <td>Android Application</td>
                                  <td className="d-none d-sm-table-cell">Lorem ipsum dolor sit amet, consectetur adipiscing elit</td>
                                  <td>$1000</td>
                                  <td>2</td>
                                  <td className="text-end">$2000</td>
                                </tr> */}
                              </tbody>
                            </table>
                          </div>
                          :
                          null
                        }
                        <div>
                          <div className="row invoice-payment">
                            <div className="col-sm-7">
                            </div>
                            <div className="col-sm-5">
                              <div className="m-b-20">
                                <div className="table-responsive no-border">
                                  <table className="table mb-0">
                                    <tbody>
                                      <tr>
                                        <th>Total (Tax exclusive):</th>
                                        <td className="text-end">{calculateSubTotal()?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {invoiceInfo?.currency}</td>
                                      </tr>
                                      <tr>
                                        <th>Total (Tax inclusive):</th>
                                        <td className="text-end">{calculateTotal()?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {invoiceInfo?.currency}</td>
                                      </tr>
                                      <tr>
                                        <th>Sales Tax: <span className="text-regular">({invoiceInfo?.invoiceTax}%)</span></th>
                                        <td className="text-end">{calculateTaxAmount()?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {invoiceInfo?.currency}</td>
                                      </tr>
                                      <tr>
                                        <th>Discount: <span className="text-regular">({invoiceInfo?.discount}%)</span></th>
                                        <td className="text-end">{calculateDiscountAmount()?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {invoiceInfo?.currency}</td>
                                      </tr>
                                      <tr>
                                        <th>Grand Total:</th>
                                        <td className="text-end text-primary">
                                          {invoiceInfo?.totalAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {invoiceInfo?.currency}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="invoice-info d-grid">
                            <label style={{fontWeight: '500', fontSize: '14px', lineHeight: '35px'}}>Other Information</label>
                            <label className="text-muted">{invoiceInfo?.otherInformation}</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* /Page Content */}
            </div>
      );
   }


export default Invoiceview;
