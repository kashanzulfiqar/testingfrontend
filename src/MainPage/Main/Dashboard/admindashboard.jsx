/**
 * Signin Firebase
 */

import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';
// import { Link, withRouter } from 'react-router-dom';
import { User, Avatar_19, Avatar_07, Avatar_06, Avatar_14, user_icon } from '../../../Entryfile/imagepath.jsx'
import {
  BarChart, Bar, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import "../../index.css"
import { useSelector } from 'react-redux';
import { Button, Spin, message } from 'antd';
import { apiServices } from '../../../Services/apiServices.js';
import { getAllISOCodes } from 'iso-country-currency';
import { LoadingOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';


const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const nav = useNavigate();
  const permissions = useSelector((state) => state?.permissionsSlice?.data);
  const user_state = useSelector((state) => state.user.loginvalue);
  const role1 = user_state?.user?.role
  const admin_name = user_state?.user?.fullName
  
  const [menu, setMenu] = useState(false)
  const [allDomain, setAllDomain] = useState([]);
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [loader, setLoader] = useState(true)
  const [delLoader, setDelLoader] = useState(false)
  const [allData, setAllData] = useState({})
  const [tableYearData, setTableYearData] = useState([])
  const [tableMonthData, setTableMonthData] = useState([])
  const [year, setYear] = useState('')
  const [allInvoices, setAllInvoices] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [tableLoader, setTableLoader] = useState({
    invoice: true,
    payment: true,
    client: true,
    project: true,
    request: true,
  });
  const [perm, setPerm] = useState({
    invoice: false,
    payment: false,
    client: false,
    project: false,
    request: false,
  });
  const [open, setOpen] = useState({
    isAddOpen: false,
    data: ''
  });
  const [open2, setOpen2] = useState({
    editOpen: false,
    delOpen: false,
    data: "",
  });
  const [allCountries, setAllCountries] = useState([]);
  const [paginationDetail, setPaginationDetail] = useState();



  useEffect(() => {
    if(role1 === 'admin' || permissions?.companyManagement) {
      getDahsboardData();
      // --------------------------
      if(role1 === 'admin' || permissions?.managePayrolls){
        getAllInvoices();
        getAllPayments();
        setPerm(prev => {
          return { ...prev, invoice: true, payment: true }
        })
      }else{
        setPerm(prev => {
          return { ...prev, invoice: false, payment: false }
        })
        setTableLoader(prev => { 
          return {...prev, invoice: false, payment: false}
        });
      }
      // --------------------------
      if(role1 === 'admin' || permissions?.clientManagement){
        getAllClients();
        setPerm(prev => {
          return { ...prev, client: true }
        })
      }else{
        setPerm(prev => {
          return { ...prev, client: false }
        })
        setTableLoader(prev => { 
          return {...prev, client: false}
        });
      }
      // --------------------------
      if(role1 === 'admin' || permissions?.projectManagement){
        getAllProjects();
        setPerm(prev => {
          return { ...prev, project: true }
        })
      }else{
        setPerm(prev => {
          return { ...prev, project: false }
        })
        setTableLoader(prev => { 
          return {...prev, project: false}
        });
      }
      // --------------------------
      if(role1 === 'admin' || permissions?.viewAllRequest){
        getAllRequests();
        setPerm(prev => {
          return { ...prev, request: true }
        })
      }else{
        setPerm(prev => {
          return { ...prev, request: false }
        })
        setTableLoader(prev => { 
          return {...prev, request: false}
        });
      }
      
    }else{
      nav(`${role1 === 'client' ? '/client/client-profile' : role1 === 'focalperson' ? `/client/focal-profile` : role1 === 'admin' ? `/main/dashboard` : `/employee/dashboard`}`)
    }
  }, [])

  const getDahsboardData = () => {
    setLoader(true);
    apiServices("GET", 'user/admin-dashboard', null, user_state)
      .then((res) => {
        // if (res?.data?.success === true) {
          setAllData(res?.data);

          const d = res?.data?.revenue;
          const latestYearData = d?.reduce((max, obj) => (obj?.year > max?.year ? obj : max), d[0]);
          monthHandler(latestYearData)

          const recentYear = Math.max(...d?.map(item => item?.year));
          const sortedYears = d?.filter(item => item?.year >= recentYear - 9)?.sort((a, b) => a?.year - b?.year);
          const yearsToInclude = Array.from({ length: 10 }, (_, index) => recentYear - 9 + index);
          yearsToInclude?.forEach(year => {
            if (!sortedYears?.some(item => item?.year === year)) {
              sortedYears?.push({ year });
            }
          });
          const sortedYears1 = sortedYears?.filter(item => item?.year >= recentYear - 9)?.sort((a, b) => a?.year - b?.year);
          setTableYearData(sortedYears1)
          setLoader(false);
        // }
      })
      .catch((err) => {
        setLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('aDash.errors.getDashboardDataError')
          }!`
        );
      });
  }

  const getAllInvoices = () => {
    apiServices("GET", `invoices?page=${1}&limit=${3}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setAllInvoices(res?.data?.Invoices?.docs);
          setTableLoader(prev => { 
            return {...prev, invoice: false}
          });
        }
      })
      .catch((err) => {
        setTableLoader(prev => { 
          return {...prev, invoice: false}
        });
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('aDash.errors.getAllInvoicesError')
          }!`
        );
      });
  }

  const getAllPayments = () => {
    apiServices("GET", `invoices?status=${'Paid'}&page=${1}&limit=${3}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setAllPayments(res?.data?.Invoices?.docs);
          setTableLoader(prev => { 
            return {...prev, payment: false}
          });
        }
      })
      .catch((err) => {
        setTableLoader(prev => { 
          return {...prev, payment: false}
        });
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('aDash.errors.getAllPaymentsError')
          }!`
        );
      });
  }

  const getAllClients = () => {
    setTableLoader(prev => { 
      return {...prev, client: true}
    });
    apiServices("GET", `client/view-client?deleted=false&page=${1}&limit=${5}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setAllClients(res?.data?.clients?.docs);
          setTableLoader(prev => { 
            return {...prev, client: false}
          });
        }
      })
      .catch((err) => {
        setTableLoader(prev => { 
          return {...prev, client: false}
        });
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('aDash.errors.getAllClientsError')
          }!`
        );
      });
  }

  const getAllProjects = () => {
    setTableLoader(prev => { 
      return {...prev, project: true}
    });
    apiServices("GET", `project-management?page=${1}&limit=${5}`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          setAllProjects(res?.data?.projects?.docs);
          setTableLoader(prev => { 
            return {...prev, project: false}
          });
        }
      })
      .catch((err) => {
        setTableLoader(prev => { 
          return {...prev, project: false}
        });
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('aDash.errors.getProjectError')
          }`
        );
      });
  };

  const getAllRequests = async () => {
    setTableLoader(prev => { 
      return {...prev, request: true}
    });
    apiServices("GET", `requests/view-all-request?page=${1}&limit=${2}`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          setAllRequests(res?.data?.Requests?.docs);
          setTableLoader(prev => { 
            return {...prev, request: false}
          });
        }
      })
      .catch((err) => {
        setTableLoader(prev => { 
          return {...prev, request: false}
        });
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('aDash.errors.getAllRequestsError')
          }!`
        );
      });
  };

  const monthHandler = (data) => {
    const allMonths = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    function fillMissingMonths(data) {
      const monthMap = {};
      data?.forEach(item => (monthMap[item?.month] = item));
    
      const result = allMonths?.map(month => {
        return monthMap[month] || { month, totalRevenue: 0 };
        // return monthMap[month] || { month };
      });
    
      return result;
    }
    
    const filledData = fillMissingMonths(data?.months);
    setTableMonthData(filledData)
    setYear(data?.year)
  }

  const formatDate = (inputDate) => {
    if(inputDate){
      const date = new Date(inputDate);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
  
      const formattedDate = `${day} ${month} ${year}`;
      return formattedDate;
    }
}

const getAllCountries = () => {
  const isoCodes = getAllISOCodes();
  const sorted_data = isoCodes.sort((a, b) => a.countryName.localeCompare(b.countryName));
  setAllCountries(sorted_data)
};
const antIcon = (
  <LoadingOutlined
    style={{
      fontSize: 24,
      color: '#fff'
    }}
    spin
  />
);
  return (
    <>
      <div className={`main-wrapper ${menu ? 'slide-nav' : ''}`}>
        <div className="page-wrapper">
          <Helmet>
            <title>{t('aDash.pageTitle')}</title>
            <meta name="description" content="Dashboard" />
          </Helmet>
          {/* Page Content */}
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <h3 className="page-title">{t('aDash.welcome', { name: admin_name })}</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item active">{t('dashboard')}</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            {
              loader ?
              <div className="row" style={{marginInline: '0px'}}>
                <div className="card dash-widget" style={{background: '#ededed', boxShadow: 'none'}}>
                    <div className="card-body" style={{height: '100px', display: 'grid', placeItems: 'center'}}>
                      <Spin />
                    </div>
                </div>
              </div> :
            <div className="row">
              <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                <div className="card dash-widget">
                  <div className="card-body">
                    <span className="dash-widget-icon"><i className="fa fa-cubes" /></span>
                    <div className="dash-widget-info">
                      <h3>{allData?.projectsCount}</h3>
                      <span>{t('projects')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                <div className="card dash-widget">
                  <div className="card-body">
                    <span className="dash-widget-icon"><i className="fa fa-usd" /></span>
                    <div className="dash-widget-info">
                      <h3>{allData?.clientsCount}</h3>
                      <span>{t('aDash.clients')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                <div className="card dash-widget">
                  <div className="card-body">
                    <span className="dash-widget-icon"><i className="fa fa-diamond" /></span>
                    <div className="dash-widget-info">
                      <h3>{allData?.tasksCount}</h3>
                      <span>{t('aDash.tasks')}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-sm-6 col-lg-6 col-xl-3">
                <div className="card dash-widget">
                  <div className="card-body">
                    <span className="dash-widget-icon"><i className="fa fa-user" /></span>
                    <div className="dash-widget-info">
                      <h3>{allData?.employeeCount}</h3>
                      <span>{t('aDash.employees')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            }
            <div className="row">
              <div className="col-md-12">
                <div className="row">
                  <div className="col-md-6 text-center">
                    <div className="card" dir="ltr">
                      <div className="card-body">
                        <h3 className="card-title">{t('aDash.totalRevenue')}</h3>
                        {/* <button onClick={() => {}}>SVG</button> */}

                        {
                          loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                          allData?.revenue?.length > 0 ?
                          <ResponsiveContainer width='100%' height={300}>
                            <BarChart
                              data={tableYearData}
                              margin={{
                                top: 5, right: 5, left: 5, bottom: 5,
                              }}
                              onClick={(value) => {
                                if(value?.activePayload[0]?.payload?.months){
                                  monthHandler(value?.activePayload[0]?.payload)
                                }
                              }}
                            >
                              <CartesianGrid />
                              <XAxis dataKey="year" />
                              {/* <YAxis tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value} /> */}
                              <YAxis 
                                tickFormatter={(value) => {
                                if (value >= 1e9) {
                                  return `${(value / 1e9).toFixed(1)}B`;
                                } else if (value >= 1e6) {
                                  return `${(value / 1e6).toFixed(1)}M`;
                                } else if (value >= 1e3) {
                                  return `${(value / 1e3).toFixed(1)}K`;
                                } else {
                                  return value;
                                }
                              }} />
                              <Tooltip
                                labelFormatter={(value) => `${t('empProfile.year')} : ${value}`}
                                formatter={(value) => <label>{value.toLocaleString()}</label>}
                                contentStyle={{ direction: i18n.dir() }}
                              />
                              <Legend />
                              <Bar dataKey="totalRevenue" name={t('finance.Profit&loss.totalRevenue')} fill="#ff9b44" maxBarSize={20} />
                            </BarChart>
                          </ResponsiveContainer> :
                          <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>{t('aRequests.errors.noRecordFound')}</label>
                        }

                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 text-center">
                    <div className="card" dir="ltr">
                      <div className="card-body">
                        <h3 className="card-title">{t('aDash.salesOverview')} {year ? ` - ${year}` : ''}</h3>
                        {
                          loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                          allData?.revenue?.length > 0 ?
                          <ResponsiveContainer width='100%' height={300}>
                            {/* <LineChart data={linechartdata} */}
                            <LineChart data={tableMonthData}
                              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                              <CartesianGrid />
                              <XAxis dataKey="month" interval={0} />
                              {/* <YAxis tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value} /> */}
                              <YAxis tickFormatter={(value) => {
                                if (value >= 1e9) {
                                  return `${(value / 1e9).toFixed(1)}B`;
                                } else if (value >= 1e6) {
                                  return `${(value / 1e6).toFixed(1)}M`;
                                } else if (value >= 1e3) {
                                  return `${(value / 1e3).toFixed(1)}K`;
                                } else {
                                  return value;
                                }
                              }} />
                              <Tooltip
                                formatter={(value) => <label>{value === 0 ? 'N/A' : value?.toLocaleString()}</label>}
                                contentStyle={{ direction: i18n.dir() }}
                              />
                              <Legend />
                              <Line type="monotone" dataKey="totalRevenue" name={t('finance.Profit&loss.totalRevenue')} stroke="#ff9b44" fill="#00c5fb" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 7 }} />
                              {/* <Line type="monotone" dataKey="Total Sales" stroke="#ff9b44" fill="#00c5fb" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 7 }} /> */}
                              {/* <Line type="monotone" dataKey="Total Revenue" stroke="#fc6075" fill="#0253cc" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 7 }} /> */}
                            </LineChart>
                          </ResponsiveContainer> :
                          <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>{t('aRequests.errors.noRecordFound')}</label>
                        }

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="card-group m-b-30">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-3">
                        <div>
                          <span className="d-block">{t('aDash.newEmployees')}</span>
                        </div>
                        <div>
                          <span className="text-success">+10%</span>
                        </div>
                      </div>
                      <h3 className="mb-3">10</h3>
                      <div className="progress mb-2" style={{ height: '5px' }}>
                        <div className="progress-bar bg-primary" role="progressbar" style={{ width: '70%' }} aria-valuenow={40} aria-valuemin={0} aria-valuemax={100} />
                      </div>
                      <p className="mb-0">{t('aDash.overallEmployees')} 218</p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-3">
                        <div>
                          <span className="d-block">{t('aDash.earnings')}</span>
                        </div>
                        <div>
                          <span className="text-success">+12.5%</span>
                        </div>
                      </div>
                      <h3 className="mb-3">$1,42,300</h3>
                      <div className="progress mb-2" style={{ height: '5px' }}>
                        <div className="progress-bar bg-primary" role="progressbar" style={{ width: '70%' }} aria-valuenow={40} aria-valuemin={0} aria-valuemax={100} />
                      </div>
                      <p className="mb-0">{t('aDash.previousMonth')} <span className="text-muted">$1,15,852</span></p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-3">
                        <div>
                          <span className="d-block">{t('aDash.expenses')}</span>
                        </div>
                        <div>
                          <span className="text-danger">-2.8%</span>
                        </div>
                      </div>
                      <h3 className="mb-3">$8,500</h3>
                      <div className="progress mb-2" style={{ height: '5px' }}>
                        <div className="progress-bar bg-primary" role="progressbar" style={{ width: '70%' }} aria-valuenow={40} aria-valuemin={0} aria-valuemax={100} />
                      </div>
                      <p className="mb-0">{t('aDash.previousMonth')} <span className="text-muted">$7,500</span></p>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-3">
                        <div>
                          <span className="d-block">{t('aDash.profit')}</span>
                        </div>
                        <div>
                          <span className="text-danger">-75%</span>
                        </div>
                      </div>
                      <h3 className="mb-3">$1,12,000</h3>
                      <div className="progress mb-2" style={{ height: '5px' }}>
                        <div className="progress-bar bg-primary" role="progressbar" style={{ width: '70%' }} aria-valuenow={40} aria-valuemin={0} aria-valuemax={100} />
                      </div>
                      <p className="mb-0">{t('aDash.previousMonth')} <span className="text-muted">$1,42,000</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Statistics Widget */}
            <div className="row">
              <div className="col-md-12 col-lg-12 col-xl-4 d-flex">
                <div className="card flex-fill dash-statistics">
                  <div className="card-body">
                    <h5 className="card-title">{t('aDash.statistics')}</h5>
                    <div className="stats-list">
                      <div className="stats-info">
                        <p>{t('aDash.todayLeave')} <strong>{allData?.statistics?.todayLeaves} <small>/ {allData?.employeeCount}</small></strong></p>
                        <div className="progress">
                          <div className="progress-bar bg-primary" role="progressbar" style={{ width: `${allData?.statistics?.todayLeaves / allData?.employeeCount * 100}%` }} aria-valuenow={allData?.statistics?.todayLeaves / allData?.employeeCount * 100} aria-valuemin={0} aria-valuemax={100} />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>{t('aDash.pendingInvoice')} <strong>{allData?.statistics?.pendingInvoices} <small>/ {allData?.statistics?.totalInvoices}</small></strong></p>
                        <div className="progress">
                          <div className="progress-bar bg-warning" role="progressbar" style={{ width: `${allData?.statistics?.pendingInvoices / allData?.statistics?.totalInvoices * 100}%` }} aria-valuenow={31} aria-valuemin={0} aria-valuemax={100} />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>{t('aDash.completedProjects')} <strong>{allData?.statistics?.completedProject} <small>/ {allData?.projectsCount}</small></strong></p>
                        <div className="progress">
                          <div className="progress-bar bg-success" role="progressbar" style={{ width: `${allData?.statistics?.completedProject / allData?.projectsCount * 100}%` }} aria-valuenow={allData?.statistics?.completedProject / allData?.projectsCount * 100} aria-valuemin={0} aria-valuemax={100} />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>{t('aDash.openTickets')} <strong>190 <small>/ 212</small></strong></p>
                        <div className="progress">
                          <div className="progress-bar bg-danger" role="progressbar" style={{ width: '62%' }} aria-valuenow={62} aria-valuemin={0} aria-valuemax={100} />
                        </div>
                      </div>
                      <div className="stats-info">
                        <p>{t('aDash.closedTickets')} <strong>22 <small>/ 212</small></strong></p>
                        <div className="progress">
                          <div className="progress-bar bg-info" role="progressbar" style={{ width: '22%' }} aria-valuenow={22} aria-valuemin={0} aria-valuemax={100} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-12 col-lg-6 col-xl-4 d-flex">
                <div className="card flex-fill">
                  <div className="card-body">
                    <h4 className="card-title">{t('aDash.taskStatistics')}</h4>
                    <div className="statistics">
                      <div className="row">
                        <div className="col-md-6 col-6 text-center">
                          <div className="stats-box mb-4">
                            <p>{t('totalTasks')}</p>
                            <h3>385</h3>
                          </div>
                        </div>
                        <div className="col-md-6 col-6 text-center">
                          <div className="stats-box mb-4">
                            <p>{t('aDash.overdueTasks')}</p>
                            <h3>19</h3>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="progress mb-4">
                      <div className="progress-bar bg-purple" role="progressbar" style={{ width: '30%' }} aria-valuenow={30} aria-valuemin={0} aria-valuemax={100}>30%</div>
                      <div className="progress-bar bg-warning" role="progressbar" style={{ width: '22%' }} aria-valuenow={18} aria-valuemin={0} aria-valuemax={100}>22%</div>
                      <div className="progress-bar bg-success" role="progressbar" style={{ width: '24%' }} aria-valuenow={12} aria-valuemin={0} aria-valuemax={100}>24%</div>
                      <div className="progress-bar bg-danger" role="progressbar" style={{ width: '26%' }} aria-valuenow={14} aria-valuemin={0} aria-valuemax={100}>21%</div>
                      <div className="progress-bar bg-info" role="progressbar" style={{ width: '10%' }} aria-valuenow={14} aria-valuemin={0} aria-valuemax={100}>10%</div>
                    </div>
                    <div>
                      <p><i className={`fa fa-dot-circle-o text-purple ${i18n.dir() === 'rtl' ? 'ms-2' : 'me-2'}`} />{t('aDash.completedTasks')} <span className={`${i18n.dir() === 'rtl' ? 'float-start' : 'float-end'}`}>166</span></p>
                      <p><i className={`fa fa-dot-circle-o text-warning ${i18n.dir() === 'rtl' ? 'ms-2' : 'me-2'}`} />{t('aDash.inprogressTasks')} <span className={`${i18n.dir() === 'rtl' ? 'float-start' : 'float-end'}`}>115</span></p>
                      <p><i className={`fa fa-dot-circle-o text-success ${i18n.dir() === 'rtl' ? 'ms-2' : 'me-2'}`} />{t('aDash.onHoldTasks')} <span className={`${i18n.dir() === 'rtl' ? 'float-start' : 'float-end'}`}>31</span></p>
                      <p><i className={`fa fa-dot-circle-o text-danger ${i18n.dir() === 'rtl' ? 'ms-2' : 'me-2'}`} />{t('aDash.pendingTasks')} <span className={`${i18n.dir() === 'rtl' ? 'float-start' : 'float-end'}`}>47</span></p>
                      <p className="mb-0"><i className={`fa fa-dot-circle-o text-info ${i18n.dir() === 'rtl' ? 'ms-2' : 'me-2'}`} />{t('aDash.reviewTasks')} <span className={`${i18n.dir() === 'rtl' ? 'float-start' : 'float-end'}`}>5</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-12 col-lg-6 col-xl-4 d-flex">
                <div className="card flex-fill">
                  <div className="card-body">
                    <h4 className="card-title">{t('aDash.todayAbsent')} <span className="badge bg-inverse-danger ml-2">5</span></h4>
                    {
                      tableLoader?.request ? <Spin style={{display: 'grid', placeItems: 'center', height: '263px'}} /> :
                      !perm?.request ? <label style={{display: 'grid', placeItems: 'center', color: 'grey', height: '285px', textAlign: 'center'}}>You don't have permission to view <br /> Requests!</label> :
                      allRequests?.length > 0 ?
                      allRequests?.map((req) => (
                        <div className="leave-info-box">
                          <div className="media d-flex align-items-center">
                            {/* <Link to="/app/profile/employee-profile" className="avatar"><img alt="" src={User} /></Link> */}
                            <img className="avatar" alt="" src={req?.user?.imageUrl || user_icon} />
                            <div className="media-body">
                              <div className="text-sm my-0">{req?.user?.fullName}</div>
                            </div>
                          </div>
                          <div className="row align-items-center mt-3">
                            <div className="col-6 d-grid">
                              <label className="mb-0" style={{fontWeight: '500', fontSize: '12px'}}>{formatDate(req?.startDate || '')}</label>
                              <label className="text-sm text-muted mt-1">{t('aDash.leaveDate')}</label>
                            </div>
                            <div className={`col-6 ${i18n.dir() === 'rtl' ? 'text-start' : 'text-end'}`}>
                              <span className={req?.status==="Approved" ? "badge bg-inverse-success" : req?.status==="Pending" ? "badge bg-inverse-warning" : (req?.status==="Declined" || req?.status==="Cancelled") ? "badge bg-inverse-danger" : ''}>
                                {req?.status==="Approved" ? t('aRequests.Approved') : req?.status==="Declined" ? t('aRequests.Declined') : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )) : <label style={{display: 'grid', placeItems: 'center', color: 'grey', height: '290px'}}>{t('aRequests.errors.noRecordFound')}</label>
                    }
                    {
                      (allRequests?.length > 0 && perm?.request) && 
                      <div className="load-more text-center">
                        <Link to="/employee/request-admin" className="text-dark">{t('aDash.seeMore')}</Link>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
            {/* /Statistics Widget */}
            <div className="row">
              <div className="col-md-6 d-flex">
                <div className="card card-table flex-fill">
                  <div className="card-header">
                    <h3 className="card-title mb-0">{t('aDash.invoices')}</h3>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive" style={{minHeight: '203px'}}>
                      {
                        tableLoader?.invoice ? <Spin style={{display: 'grid', placeItems: 'center', height: '203px'}} /> :
                        !perm?.invoice ? <label style={{display: 'grid', placeItems: 'center', color: 'grey', height: '241px'}}>You don't have permission to view Invoices!</label> :
                        allInvoices?.length > 0 ?
                        <table className="table table-nowrap custom-table mb-0">
                          <thead>
                            <tr>
                              <th>{t('aDash.invoiceNumber')}</th>
                              <th>{t('aDash.client')}</th>
                              <th>{t('aDash.dueDate')}</th>
                              <th>{t('aDash.total')}</th>
                              <th>{t('status')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                              allInvoices?.map((invoice) => (
                                <tr>
                                  <td><Link to="/invoices/view-invoice" state={{invoice_data: invoice}}>{invoice?.invoiceNo}</Link></td>
                                  <td>
                                    <h2><a href="#">{invoice?.client?.clientName}</a></h2>
                                  </td>
                                  <td>{formatDate(invoice?.dueDate || '')}</td>
                                  <td>{invoice?.totalAmount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {invoice?.currency}</td>
                                  <td>
                                    <label className={invoice?.status==="Paid" ? "badge bg-inverse-success" : invoice?.status==="Partially Paid" ? "badge bg-inverse-info" : invoice?.status==="Pending" ? "badge bg-inverse-warning" : invoice?.status==="Cancelled" ? "badge bg-inverse-danger" : ''}>
                                      {invoice?.status==="Paid" ? t('aDash.paid') : invoice?.status==="Partially Paid" ? t('aDash.partiallyPaid') : invoice?.status==="Pending" ? t('aDash.pending') : invoice?.status==="Cancelled" ? t('aDash.cancelled') : '-'}
                                    </label>
                                  </td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </table>  :
                          <label style={{display: 'grid', placeItems: 'center', color: 'grey', height: '241px'}}>{t('aRequests.errors.noRecordFound')}</label>
                      }
                    </div>
                  </div>
                  {
                    (allInvoices?.length > 0 && perm?.invoice) && 
                    <div className="card-footer">
                      <Link to="/invoices">{t('aDash.viewAllInvoices')}</Link>
                    </div>
                  }
                </div>
              </div>
              <div className="col-md-6 d-flex">
                <div className="card card-table flex-fill">
                  <div className="card-header">
                    <h3 className="card-title mb-0">{t('aDash.payments')}</h3>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive" style={{minHeight: '203px'}}>
                    {
                      tableLoader?.payment ? <Spin style={{display: 'grid', placeItems: 'center', height: '203px'}} /> :
                      !perm?.payment ? <label style={{display: 'grid', placeItems: 'center', color: 'grey', height: '241px'}}>You don't have permission to view Payments!</label> :
                      allPayments?.length > 0 ?
                      <table className="table custom-table table-nowrap mb-0">
                        <thead>
                          <tr>
                            <th>{t('aDash.invoiceNumber')}</th>
                            <th>{t('aDash.client')}</th>
                            <th>{t('aDash.paymentType')}</th>
                            <th>{t('aDash.dueDate')}</th>
                            <th>{t('aDash.paidAmount')}</th>
                          </tr>
                        </thead>
                        <tbody>
                        {
                          allPayments?.map((payment) => (
                            <tr>
                              <td><Link to="/invoices/view-invoice" state={{invoice_data: payment}}>{payment?.invoiceNo}</Link></td>
                              <td>
                                <h2><a href="#">{payment?.client?.clientName}</a></h2>
                              </td>
                              <td>{payment?.paymentType==="Cash" ? t('cash') : payment?.paymentType==="Cheque" ? t('cheque') : payment?.paymentType==="Bank Transfer" ? t('bankTransfer') : '-'}</td>
                              <td>{formatDate(payment?.paymentDate || '')}</td>
                              <td>{payment?.paidAmountInPreferredCurrency?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {payment?.company?.preferredCurrency}</td>
                            </tr>
                          ))
                        }
                        </tbody>
                      </table> :
                        <label style={{display: 'grid', placeItems: 'center', color: 'grey', height: '241px'}}>{t('aRequests.errors.noRecordFound')}</label>
                      }
                    </div>
                  </div>
                  {
                    (allPayments?.length > 0 && perm?.payment) && 
                    <div className="card-footer">
                      <Link to="/payments">{t('aDash.viewAllPayments')}</Link>
                    </div>
                  }
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6 d-flex">
                <div className="card card-table flex-fill">
                  <div className="card-header">
                    <h3 className="card-title mb-0">{t('aDash.clients')}</h3>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive" style={{minHeight: '385px'}}>
                    {
                      tableLoader?.client ? <Spin style={{display: 'grid', placeItems: 'center', height: '402px'}} /> :
                      !perm?.client ? <label style={{display: 'grid', placeItems: 'center', color: 'grey', height: '402px'}}>You don't have permission to view Clients!</label> :
                      allClients?.length > 0 ?
                      <table className="table custom-table mb-0">
                        <thead>
                          <tr>
                            <th style={{paddingLeft: '20px'}}>{t('aDash.name')}</th>
                            <th>{t('aDash.email')}</th>
                            <th>{t('aDash.phoneNo')}</th>
                            {/* <th className="text-end">Action</th> */}
                          </tr>
                        </thead>
                        <tbody>
                        {
                          allClients?.map((client) => (
                          <tr style={{height: '62px'}}>
                            <td>
                              <h2 className="table-avatar">
                                {/* <a href="#" className="avatar"><img alt="" src={Avatar_19} /></a>
                                <Link to="/app/profile/client-profile">Barry Cuda <span>CEO</span></Link> */}
                                <Link to="/client/client-profile" state={{client_data: client}} onClick={() => sessionStorage.setItem(`clients_tab`, 'projects')} className="avatar"><img alt="" src={client?.logo || user_icon} /></Link>
                                <Link to="/client/client-profile" state={{client_data: client}} onClick={() => sessionStorage.setItem(`clients_tab`, 'projects')}>{client?.clientName}</Link>
                              </h2>
                            </td>
                            <td>{client?.clientEmail}</td>
                            <td>{client?.clientPhoneNo}</td>
                            {/* <td>
                              <div className="dropdown action-label">
                                <a className="btn btn-white btn-sm btn-rounded dropdown-toggle" href="#" data-bs-toggle="dropdown" aria-expanded="false">
                                  <i className="fa fa-dot-circle-o text-success" /> Active
                                </a>
                                <div className="dropdown-menu dropdown-menu-right">
                                  <a className="dropdown-item" href="#"><i className="fa fa-dot-circle-o text-success" /> Active</a>
                                  <a className="dropdown-item" href="#"><i className="fa fa-dot-circle-o text-danger" /> Inactive</a>
                                </div>
                              </div>
                            </td> */}
                            {/* <td className="text-end">
                              <div className="dropdown dropdown-action">
                                <a href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
                                <div className="dropdown-menu dropdown-menu-right">
                                  <a className="dropdown-item" href="javascript:void(0)" onClick={() => { setOpen({ isAddOpen: true, data: client }); getAllCountries() }}><i className="fa fa-pencil m-r-5" /> Edit</a>
                                  <a className="dropdown-item" href="javascript:void(0)" onClick={() => { setOpen({ isDelOpen: true, data: client }) }}><i className="fa fa-trash-o m-r-5" /> Delete</a>
                                </div>
                              </div>
                            </td> */}
                          </tr>
                          ))
                        }
                        </tbody>
                      </table> :
                        <label style={{display: 'grid', placeItems: 'center', color: 'grey', height: '402px'}}>{t('aRequests.errors.noRecordFound')}</label>
                      }
                    </div>
                  </div>
                  {
                    (allClients?.length > 0 && perm?.client) && 
                    <div className="card-footer">
                      <Link to="/clients">{t('aDash.viewAllClients')}</Link>
                    </div>
                  }
                </div>
              </div>
              <div className="col-md-6 d-flex">
                <div className="card card-table flex-fill">
                  <div className="card-header">
                    <h3 className="card-title mb-0">{t('aDash.recentProjects')}</h3>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive" style={{minHeight: '385px'}}>
                    {
                      tableLoader?.project ? <Spin style={{display: 'grid', placeItems: 'center', height: '402px'}} /> :
                      !perm?.project ? <label style={{display: 'grid', placeItems: 'center', color: 'grey', height: '402px'}}>You don't have permission to view Projects!</label> :
                      allProjects?.length > 0 ?
                      <table className="table custom-table mb-0">
                        <thead>
                          <tr>
                            <th>{t('aDash.projectName')} </th>
                            {/* <th>Progress</th> */}
                            <th>{t('status')}</th>
                            {/* <th className="text-end">Action</th> */}
                          </tr>
                        </thead>
                        <tbody>
                        {
                          allProjects?.map((project) => (
                          <tr style={{height: '62px'}}>
                            <td>
                              <h2><Link to={`/projects/projects-view/${project?._id}`}>{project?.projectName}</Link></h2>
                              {/* <small className="block text-ellipsis">
                                <span>1</span> <span className="text-muted">open tasks, </span>
                                <span>9</span> <span className="text-muted">tasks completed</span>
                              </small> */}
                            </td>
                            {/* <td>
                              <div className="progress progress-xs progress-striped">
                                <div className="progress-bar" role="progressbar" data-bs-toggle="tooltip" title="65%" style={{ width: '65%' }} />
                              </div>
                            </td> */}
                            <td>
                              <label className={project?.status==="Completed" ? "badge bg-inverse-success" : project?.status==="Paused" ? "badge bg-inverse-warning" : project?.status==="Archived" ? "badge bg-inverse-danger" : "badge bg-inverse-info"}>
                                {project?.status === "Scheduled"
                                  ? ` ${t('projectScreen.Modal.scheduled')}`
                                  : project?.status === "On-Going"
                                  ? ` ${t('projectScreen.Modal.onGoing')}`
                                  : project?.status === "Paused"
                                  ? ` ${t('projectScreen.Modal.paused')}`
                                  : project?.status === "Archived"
                                  ? ` ${t('projectScreen.Modal.archived')}`
                                  : project?.status === "Completed"
                                  ? ` ${t('projectScreen.Modal.completed')}`
                                  : ""
                                }
                              </label>
                            </td>
                            {/* <td className="text-end">
                              <div className="dropdown dropdown-action">
                                <a href="javascript:void(0)" className="action-icon dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i className="material-icons">more_vert</i></a>
                                <div className="dropdown-menu dropdown-menu-right">
                                  <a
                                    className="dropdown-item"
                                    href="javascript:void(0)"
                                    onClick={() => {
                                      getAllDomain();
                                      getAllCurrencies();
                                      setOpen2({
                                        editOpen: true,
                                        delOpen: false,
                                        data: project,
                                      });
                                    }}
                                  >
                                    <i className="fa fa-pencil m-r-5" /> Edit
                                  </a>
                                  <a
                                    className="dropdown-item"
                                    href="javascript:void(0)"
                                    onClick={() => {
                                      setOpen2({
                                        editOpen: false,
                                        delOpen: true,
                                        data: project,
                                      });
                                    }}
                                  >
                                    <i className="fa fa-trash-o m-r-5" /> Delete
                                  </a>
                                </div>
                              </div>
                            </td> */}
                          </tr>
                          ))
                        }
                        </tbody>
                      </table> :
                       <label style={{display: 'grid', placeItems: 'center', color: 'grey', height: '402px'}}>{t('aRequests.errors.noRecordFound')}</label>
                     }
                    </div>
                  </div>
                  {
                    (allProjects?.length > 0 && perm?.project) && 
                    <div className="card-footer">
                      <Link to="/projects/project_dashboard">{t('aDash.viewAllProjects')}</Link>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
          {/* /Page Content */}


        </div>
      </div>
      {/* <Offcanvas /> */}
    </>
  );
}

export default AdminDashboard;
