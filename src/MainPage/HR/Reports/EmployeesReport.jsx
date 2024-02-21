
import React, { useState,useEffect } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, ReferenceLine } from 'recharts';
import { Form, Spin } from 'antd';
import 'antd/dist/antd.css';
import "../../antdstyle.css"
import { useSelector } from 'react-redux';
import { apiServices } from '../../../Services/apiServices';
import { useTranslation } from 'react-i18next';

const EmployeesReport = () => {
  const { t, i18n } = useTranslation();
    const moment = require('moment');
    const [form] = Form.useForm();
    const nav = useNavigate();
    const user_state = useSelector((state) => state.user.loginvalue);
    const permissions = useSelector((state) => state?.permissionsSlice?.data);
    const company_id = user_state?.user?.companyId
    const role = user_state?.user?.role

    const [allData, setAllData] = useState();
    const [loader, setLoader] = useState(false);
    const [cardLoader, setCardLoader] = useState(false);

    useEffect(() => {
      if(role === 'admin' || permissions?.reportManagement) {
        getEmployeeReport();
      }else{
        nav(`${role === 'client' ? '/client/client-profile' : role === 'focalperson' ? `/client/focal-profile` : role === 'admin' ? `/main/dashboard` : `/employee/dashboard`}`)
      }
    }, [])

    const getEmployeeReport = () => {
      setLoader(true);
      setCardLoader(true);
      apiServices("GET", "report/employee", null, user_state)
      .then((res) => {
        // console.log(res?.data);
        if (res?.data?.success === true) {
          console.log(res?.data);
          setAllData(res?.data);
          setLoader(false);
          setCardLoader(false);
        }
      })
      .catch((err) => {
        setLoader(false);
        setCardLoader(false);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('reports.employeeReport.getEmployeeReportError')
          }!`
        );
      });
    }


// Gender Data
let gender_total = allData?.totalMale + allData?.totalFemale + allData?.totalOtherGender;
let value_male = Math.round((allData?.totalMale/gender_total)*100);
let value_female = Math.round((allData?.totalFemale/gender_total)*100);
let value_others = Math.round((allData?.totalOtherGender/gender_total)*100);
const genderData = [
  { name: t('reports.employeeReport.male'), value: value_male },
  { name: t('reports.employeeReport.female'), value: value_female },
  { name: t('reports.employeeReport.others'), value: value_others },
];
const Gender_COLORS = ['#44C4FA', '#3E80EB', '#FFAB00'];

// Technical and Non Technical Staff Data
let tech_total =  allData?.totalTechEmployees + allData?.totalNonTechEmployees;
let value_technical = Math.round((allData?.totalTechEmployees/tech_total)*100);
let value_non_technical = Math.round((allData?.totalNonTechEmployees/tech_total)*100);
const techData = [
  { name: t('reports.employeeReport.technical'), value: value_technical },
  { name: t('reports.employeeReport.nonTechnical'), value: value_non_technical },
];
const Tech_COLORS = ['#3E80EB', '#38CB89'];

// Billed and Unbilled Employees Data
let bill_total =  allData?.billedResources + allData?.nonBilledResources;
let value_billed = Math.round((allData?.billedResources/bill_total)*100);
let value_non_billed = Math.round((allData?.nonBilledResources/bill_total)*100);
const billedData = [
  { name: t('reports.employeeReport.billed'), value: value_billed },
  { name: t('reports.employeeReport.unBilled'), value: value_non_billed },
];
const Billed_COLORS = ['#FFAB00', '#44C4FA'];

// Shift Wise Employees Data
const totalEmployeesSum = allData?.shiftWiseTotalEmployees?.reduce((sum, entry) => sum + entry.totalEmployees, 0);
const shiftData = allData?.shiftWiseTotalEmployees?.map(entry => ({
  // ...entry,
  name: entry?.shiftTitle,
  value: Math.round((entry.totalEmployees / totalEmployeesSum) * 100),
}));
const Shift_COLORS = ['#FFAB00', '#664DC9', '#44C4FA', '#38CB89', '#3E80EB', '#FC6075', '#dc3545', '#198754', '#607d8b'];


const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    // <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
    <text x={x} y={y} fill="white" textAnchor={'middle'} dominantBaseline="central">
      {percent !== 0 && `${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const customPieLegend = (value, entry) => (
  <div style={{display: 'flex'}}>
    <span style={{height: '10px', width: '35px', backgroundColor: entry.color, marginRight: '5px', marginTop: '4.6px'}}></span>
    <label style={{color: '#6C757D'}}>{value}</label>
  </div>
)

const customPieLegendShift = (value, entry) => (
  <div style={{display: 'flex'}}>
    <span style={{height: '10px', width: '35px', backgroundColor: entry.color, marginRight: '5px', marginTop: '4.6px'}}></span>
    <label className='pieChartLegendLongText' style={{color: '#6C757D'}}>{value}</label>
  </div>
)

const deptYAxisTick = ({ payload, x, y, width }) => {
  const maxLength = 7;
  const label = payload.value.length > maxLength ? `${payload.value.substring(0, maxLength)}...` : payload.value;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#666" transform="rotate(0)" style={{fontSize: '12px', lineHeight: '0px'}}>
        {label}
      </text>
    </g>
  );
};

    return ( 
    <>
    {/* Page Wrapper */}
    <div className="page-wrapper">
        <Helmet>
            <title>{t('reports.employeeReport.employeeReport')} - {t('header.daftarPro')}</title>
            <meta name="description" content="Login page"/>					
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
            <div className="row">
            <div className="col">
                <h3 className="page-title">{t('reports.employeeReport.reports')}</h3>
                <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>{t('dashboard')}</Link></li>
                <li className="breadcrumb-item active">{t('reports.employeeReport.employeeReport')}</li>
                </ul>
            </div>
            </div>
        </div>
        {/* /Page Header */}

        {/* Content Starts */}

        {/* Leave Statistics */}
        {
            cardLoader ?
            <div className="row" style={{marginInline: '0px'}}>
                <div className="card dash-widget" style={{background: '#ededed', boxShadow: 'none', borderRadius: '4px'}}>
                    <div className="card-body" style={{height: '79px', display: 'grid', placeItems: 'center'}}>
                    <Spin />
                    </div>
                </div>
            </div> :
            <div className="row">
                <div className="col-sm-6 col-md-3">
                    <div className="report-cards-info" style={{minHeight: '83px'}}>
                        <label>{t('reports.employeeReport.totalEmployees')}</label>
                        {/* <h4>{singleUser?.casualLeaves} / {compLeaves?.casualLeaves}</h4> */}
                        <h4>{allData?.totalEmployees}</h4>
                    </div>
                </div>
                <div className="col-sm-6 col-md-3">
                    <div className="report-cards-info" style={{minHeight: '83px'}}>
                        <label>{t('reports.employeeReport.totalIntern')}</label>
                        <h4>{allData?.totalIntern}</h4>
                    </div>
                </div>
                <div className="col-sm-6 col-md-3">
                    <div className="report-cards-info" style={{minHeight: '83px'}}>
                        <label>{t('reports.employeeReport.totalContractor')}</label>
                        <h4>{allData?.totalContractor}</h4>
                    </div>
                </div>
                <div className="col-sm-6 col-md-3">
                    <div className="report-cards-info" style={{minHeight: '83px'}}>
                        <label>{t('reports.employeeReport.avgSalary')}</label>
                        <h4>{allData?.averageSalary?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</h4>
                    </div>
                </div>
            </div>
        }
        {/* /Leave Statistics */}

        {/* Graphs Row */}
        <div className="row">
          <div className="col-md-12">
            <div className="row">
              <div className="col-md-6 text-center">
                <div className="card" style={{borderRadius: '8px'}}>
                  <div style={{backgroundColor: '#F5F5F5', display: 'flex', padding: '25px', border: '1px solid #E5E5E5', borderRadius: '8px 8px 0px 0px'}}>
                    <h3 className="card-title mb-0">{t('reports.employeeReport.genderWiseEmployees')}</h3>
                  </div>
                  <div className="card-body">
                    {
                      loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                      // genderData?.length > 0 ?
                      (allData?.totalMale || allData?.totalFemale) ?
                      <ResponsiveContainer width='100%' height={400}>
                      <PieChart 
                        className='showLegend'
                      >
                        <Pie
                          data={genderData}
                          // cx="50%"
                          cy="51.7%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          fill="#8884d8"
                          dataKey="value"
                          startAngle={90}
                          endAngle={450}
                        >
                          {genderData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={Gender_COLORS[index % Gender_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend
                          verticalAlign='top'
                          iconSize={0}
                          formatter={customPieLegend}
                        />
                        <Tooltip
                          formatter={
                            (value, label) => <label>{value?.toLocaleString()}%</label>
                            // (value, label) => label === 'Female' ? 
                            //   <label style={{color: '#FFAB00'}}>{value?.toLocaleString()}%</label> : 
                            //   <label style={{color: '#664DC9'}}>{value?.toLocaleString()}%</label>
                            } 
                        />
                      </PieChart>
                    </ResponsiveContainer> :
                      <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>{t('finance.Profit&loss.noRecordFound')}</label>
                    }

                  </div>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="card" style={{borderRadius: '8px'}}>
                  <div style={{backgroundColor: '#F5F5F5', display: 'flex', padding: '25px', border: '1px solid #E5E5E5', borderRadius: '8px 8px 0px 0px'}}>
                    <h3 className="card-title mb-0">{t('reports.employeeReport.departmentWiseEmployees')}</h3>
                  </div>
                  <div className="card-body">
                    {
                      loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                      allData?.departWiseEmployees?.length > 0 ?
                      <ResponsiveContainer
                        width='98%'
                        height={400}
                      >
                        <BarChart
                          layout="vertical"
                          barCategoryGap={1}
                          data={allData?.departWiseEmployees}
                          margin={{
                            top: 20, right: 5, left: 15, bottom: 5,
                          }}
                        >
                          <CartesianGrid />
                          <XAxis type="number" />
                          <YAxis dataKey="department" type="category"
                            // scale="band"
                            width={110}
                            // width={80}
                            // tick={deptYAxisTick}
                            interval={allData?.departWiseEmployees?.length > 13 ? 1 : 0}
                          />
                          <Tooltip
                            labelFormatter={(value) => <label>{t('allEmp.Modal.department')} : {value}</label>}
                            formatter={(value) => <label>{value.toLocaleString()}</label>}
                          />
                          <Legend />
                          <Bar dataKey="totalEmployees" name={t('reports.employeeReport.totalEmployees')} fill="#fc6075" maxBarSize={17} />
                          <ReferenceLine x={0} stroke="#CCCCCC" label="" />
                        </BarChart>
                      </ResponsiveContainer> :
                      <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>{t('finance.Profit&loss.noRecordFound')}</label>
                    }

                  </div>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="card" style={{borderRadius: '8px'}}>
                  <div style={{backgroundColor: '#F5F5F5', display: 'flex', padding: '25px', border: '1px solid #E5E5E5', borderRadius: '8px 8px 0px 0px'}}>
                    <h3 className="card-title mb-0">{t('reports.employeeReport.technicalAndNonTechnicalStaff')}</h3>
                  </div>
                  <div className="card-body">
                    {
                      loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                      // techData?.length > 0 ?
                      (allData?.totalTechEmployees || allData?.totalNonTechEmployees) ?
                      <ResponsiveContainer width='100%' height={400}>
                      <PieChart 
                        className='showLegend'
                      >
                        <Pie
                          data={techData}
                          // cx="50%"
                          cy="51.7%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          // outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          startAngle={90}
                          endAngle={450}
                        >
                          {techData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={Tech_COLORS[index % Tech_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend
                          verticalAlign='top'
                          iconSize={0}
                          formatter={customPieLegend}
                        />
                        <Tooltip
                          formatter={
                            (value, label) => <label>{value?.toLocaleString()}%</label>
                            // (value, label) => label === 'Female' ? 
                            //   <label style={{color: '#FFAB00'}}>{value?.toLocaleString()}%</label> : 
                            //   <label style={{color: '#664DC9'}}>{value?.toLocaleString()}%</label>
                            } 
                        />
                      </PieChart>
                    </ResponsiveContainer> :
                      <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>{t('finance.Profit&loss.noRecordFound')}</label>
                    }

                  </div>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="card" style={{borderRadius: '8px'}}>
                  <div style={{backgroundColor: '#F5F5F5', display: 'flex', padding: '25px', border: '1px solid #E5E5E5', borderRadius: '8px 8px 0px 0px'}}>
                    <h3 className="card-title mb-0">{t('reports.employeeReport.billedAndUnbilledEmployees')}</h3>
                  </div>
                  <div className="card-body">
                    {
                      loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                      // billedData?.length > 0 ?
                      (allData?.billedResources || allData?.nonBilledResources) ?
                      <ResponsiveContainer width='100%' height={400}>
                      <PieChart 
                        className='showLegend'
                      >
                        <Pie
                          data={billedData}
                          // cx="50%"
                          cy="51.7%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          // outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          startAngle={90}
                          endAngle={450}
                        >
                          {techData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={Billed_COLORS[index % Billed_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend
                          verticalAlign='top'
                          iconSize={0}
                          formatter={customPieLegend}
                        />
                        <Tooltip
                          formatter={
                            (value, label) => <label>{value?.toLocaleString()}%</label>
                            // (value, label) => label === 'Female' ? 
                            //   <label style={{color: '#FFAB00'}}>{value?.toLocaleString()}%</label> : 
                            //   <label style={{color: '#664DC9'}}>{value?.toLocaleString()}%</label>
                            } 
                        />
                      </PieChart>
                    </ResponsiveContainer> :
                      <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>{t('finance.Profit&loss.noRecordFound')}</label>
                    }

                  </div>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="card" style={{borderRadius: '8px'}}>
                  <div style={{backgroundColor: '#F5F5F5', display: 'flex', padding: '25px', border: '1px solid #E5E5E5', borderRadius: '8px 8px 0px 0px'}}>
                    <h3 className="card-title mb-0">{t('reports.employeeReport.monthlyEmployeeReport')}</h3>
                  </div>
                  <div className="card-body">
                    {
                      loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                      allData?.annualEmployeeReview?.length > 0 ?
                      <ResponsiveContainer width='100%' height={400}>
                        {/* <LineChart data={lineData} */}
                        <ComposedChart data={allData?.annualEmployeeReview?.sort((a, b) => 'JanFebMarAprMayJunJulAugSepOctNovDec'.indexOf(a.monthName) - 'JanFebMarAprMayJunJulAugSepOctNovDec'.indexOf(b.monthName))}
                            margin={{ top: 20, right: 5, left: 5, bottom: 5}}
                            className='showLegend'
                        >
                          <CartesianGrid />
                          <XAxis dataKey="monthName" interval={0} />
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
                            // formatter={(value) => <label>{value === 0 ? 'N/A' : value?.toLocaleString()}</label>}
                            formatter={(value) => <label>{value?.toLocaleString()}</label>}
                          />
                          {/* <Legend /> */}
                          {/* <Legend
                            formatter={(value) => {
                                if (value === 'Employees Joined') {
                                return <label>Employees Joined</label>;
                                }else if (value === 'Employees Left') {
                                return <label>Employees Left</label>;
                                }else{
                                return 'Profit/Loss';
                                }
                            }}
                            /> */}
                          <Bar dataKey="totalEmployee" name={t('reports.employeeReport.totalEmployees')} fill="#ff9b44" maxBarSize={20} />
                          {/* <Line type="monotone" dataKey="employeesJoined" name='Employees Joined' stroke="#ff9b44" fill="#00c5fb" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 7 }} /> */}
                          <Line type="linear" dataKey="employeeJoined" name={t('reports.employeeReport.employeesJoined')} stroke="#3E80EB" fill="#00c5fb" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 7 }} />
                          {/* <Line type="monotone" dataKey="employeesLeft" name='Employees Left' stroke="#fc6075" fill="#0253cc" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 7 }} /> */}
                          <Line type="linear" dataKey="employeeExited" name={t('reports.employeeReport.employeesLeft')} stroke="#FC6075" fill="#FC6075" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 7 }} />
                        </ComposedChart>
                      </ResponsiveContainer> :
                      <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>{t('finance.Profit&loss.noRecordFound')}</label>
                    }

                  </div>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="card" style={{borderRadius: '8px'}}>
                  <div style={{backgroundColor: '#F5F5F5', display: 'flex', padding: '25px', border: '1px solid #E5E5E5', borderRadius: '8px 8px 0px 0px'}}>
                    <h3 className="card-title mb-0">{t('reports.employeeReport.shiftWiseEmployees')}</h3>
                  </div>
                  <div className="card-body shiftLegendStyle" style={{display: 'flex', justifyContent: 'center'}}>
                    {
                      loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                      shiftData?.length > 0 ?
                      <ResponsiveContainer width='106%' height={400}>
                      <PieChart 
                        className='showLegend'
                      >
                        <Pie
                          data={shiftData}
                          // cx="50%"
                          cy="51.7%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          // outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          startAngle={90}
                          endAngle={450}
                        >
                          {shiftData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={Shift_COLORS[index % Shift_COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend
                          verticalAlign='top'
                          iconSize={0}
                          formatter={customPieLegendShift}
                        />
                        <Tooltip
                          formatter={
                            (value, label) => <label>{value?.toLocaleString()}%</label>
                            // (value, label) => label === 'Female' ? 
                            //   <label style={{color: '#FFAB00'}}>{value?.toLocaleString()}%</label> : 
                            //   <label style={{color: '#664DC9'}}>{value?.toLocaleString()}%</label>
                            } 
                        />
                      </PieChart>
                    </ResponsiveContainer> :
                      <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>{t('finance.Profit&loss.noRecordFound')}</label>
                    }

                  </div>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="card" style={{borderRadius: '8px'}}>
                  <div style={{backgroundColor: '#F5F5F5', display: 'flex', padding: '25px', border: '1px solid #E5E5E5', borderRadius: '8px 8px 0px 0px'}}>
                    <h3 className="card-title mb-0">{t('reports.employeeReport.yearWiseEmployeesExperience')}</h3>
                  </div>
                  <div className="card-body">
                    {
                      loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                      allData?.experienceWiseEmployees?.length > 0 ?
                      <ResponsiveContainer width='100%' height={400}>
                        <BarChart
                          data={allData?.experienceWiseEmployees?.sort((a, b) => parseInt(a.experience) - parseInt(b.experience))}
                          margin={{
                            top: 20, right: 5, left: 5, bottom: 5,
                          }}
                        >
                          <CartesianGrid />
                          <XAxis dataKey="experience" />
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
                            labelFormatter={(value) => `${t('reports.employeeReport.years')} : ${value}`}
                            formatter={(value) => <label>{value.toLocaleString()}</label>}
                          />
                          <Legend />
                          <Bar dataKey="totalEmployees" name={t('reports.employeeReport.totalEmployees')} fill="#ff9b44" maxBarSize={20} />
                        </BarChart>
                      </ResponsiveContainer> :
                      <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>{t('finance.Profit&loss.noRecordFound')}</label>
                    }

                  </div>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="card" style={{borderRadius: '8px'}}>
                  <div style={{backgroundColor: '#F5F5F5', display: 'flex', padding: '25px', border: '1px solid #E5E5E5', borderRadius: '8px 8px 0px 0px'}}>
                    <h3 className="card-title mb-0">{t('reports.employeeReport.ageWiseEmployees')}</h3>
                  </div>
                  <div className="card-body">
                    {
                      loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                      allData?.ageWiseEmployees?.length > 0 ?
                      <ResponsiveContainer width='100%' height={400}>
                        <BarChart
                          data={allData?.ageWiseEmployees?.sort((a, b) => parseInt(a.age) - parseInt(b.age))}
                          margin={{
                            top: 20, right: 5, left: 5, bottom: 5,
                          }}
                        >
                          <CartesianGrid />
                          <XAxis dataKey="age" />
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
                            labelFormatter={(value) => `${t('reports.employeeReport.age')} : ${value}`}
                            formatter={(value) => <label>{value.toLocaleString()}</label>}
                          />
                          <Legend />
                          <Bar dataKey="totalEmployees" name={t('reports.employeeReport.totalEmployees')} fill="#ff9b44" maxBarSize={20} />
                        </BarChart>
                      </ResponsiveContainer> :
                      <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>{t('finance.Profit&loss.noRecordFound')}</label>
                    }

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Graphs Row */}


        {/* /Content End */}
        </div>
        {/* /Page Content */}
    </div>
    {/* /Page Wrapper */}
    </>
    );
}

export default EmployeesReport