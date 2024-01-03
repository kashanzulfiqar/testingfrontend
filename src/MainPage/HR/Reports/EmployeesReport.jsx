
import React, { useState,useEffect } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';
import {Avatar_03,Avatar_04} from "../../../Entryfile/imagepath"
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, ReferenceLine } from 'recharts';
import { Form, Table, Spin } from 'antd';
import 'antd/dist/antd.css';
import {itemRender,onShowSizeChange} from "../../paginationfunction"
import "../../antdstyle.css"
import Offcanvas from '../../../Entryfile/offcanvance';
import { useSelector } from 'react-redux';

const EmployeesReport = () => {

    const moment = require('moment');
    const [form] = Form.useForm();
    const nav = useNavigate();
    const user_state = useSelector((state) => state.user.loginvalue);
    const permissions = useSelector((state) => state?.permissionsSlice?.data);
    const company_id = user_state?.user?.companyId
    const role = user_state?.user?.role

    const [loader, setLoader] = useState(false);
    const [cardLoader, setCardLoader] = useState(false);

    const barData = [
        {
            department: 'HR',
            totalEmployees: 20
        },
        {
            department: 'Web',
            totalEmployees: 80
        },
    ];
    const expData = [
        {
            experience: '0 - 2',
            totalEmployees: 20
        },
        {
            experience: '2 - 4',
            totalEmployees: 80
        },
        {
            experience: '4 - 6',
            totalEmployees: 10
        },
        {
            experience: '6 - 8',
            totalEmployees: 20
        },
        {
            experience: '8 - 10',
            totalEmployees: 3
        },
        {
            experience: '10+',
            totalEmployees: 12
        },
    ];
    const ageData = [
      {
          age: '20 - 25',
          totalEmployees: 18
      },
      {
          age: '25 - 30',
          totalEmployees: 10
      },
      {
          age: '30 - 35',
          totalEmployees: 5
      },
      {
          age: '35 - 40',
          totalEmployees: 3
      },
      {
          age: '40 - 45',
          totalEmployees: 12
      },
      {
          age: '45+',
          totalEmployees: 6
      },
  ];

    const vBarData = [
        {
            department: 'HR',
            totalEmployees: 20
        },
        {
            department: 'Executive Management',
            totalEmployees: 50
        },
        {
            department: 'Web Development',
            totalEmployees: 80
        },
        {
            department: 'BI',
            totalEmployees: 120
        },
        {
            department: 'Designing',
            totalEmployees: 176
        },
        {
            department: 'Marketing',
            totalEmployees: 20
        },
        {
            department: 'System Analyst',
            totalEmployees: 70
        },

        {
          department: 'Designing',
          totalEmployees: 176
        },
        {
            department: 'Marketing',
            totalEmployees: 20
        },
        {
            department: 'System Analyst',
            totalEmployees: 70
        },

        
        {
          department: 'Designing',
          totalEmployees: 176
        },
        {
            department: 'Marketing',
            totalEmployees: 20
        },
        {
            department: 'System Analyst',
            totalEmployees: 70
        },
        {
            department: 'Marketing',
            totalEmployees: 20
        },
        {
            department: 'System Analyst',
            totalEmployees: 70
        },
    ];

    const lineData = [
        {
            month: "Jan",
            employeesJoined: 5,
            employeesLeft: 1,
            totalEmployees: 6
        },
        {
            month: "Feb",
            employeesJoined: 10,
            employeesLeft: 3,
            totalEmployees: 13
        },
        {
            month: "Mar",
            employeesJoined: 100,
            employeesLeft: 10,
            totalEmployees: 110
        },
        {
            month: "Apr",
            employeesJoined: 70,
            employeesLeft: 3,
            totalEmployees: 73
        },
        {
            month: "May",
            employeesJoined: 50,
            employeesLeft: 2,
            totalEmployees: 52
        },
    ];


// Gender Data
let value_male = Math.round((300/700)*100);
let value_female = Math.round((400/700)*100);
const genderData = [
  { name: 'Female', value: value_female },
  { name: 'Male', value: value_male },
];
const Gender_COLORS = ['#FFAB00', '#664DC9'];

// Technical and Non Technical Staff Data
let value_technical = Math.round((200/700)*100);
let value_non_technical = Math.round((500/700)*100);
const techData = [
  { name: 'Technical', value: value_technical },
  { name: 'Non Technical', value: value_non_technical },
];
const Tech_COLORS = ['#3E80EB', '#38CB89'];

// Billed and Unbilled Employees Data
let value_billed = Math.round((450/700)*100);
let value_un_billed = Math.round((250/700)*100);
const billedData = [
  { name: 'Billed', value: value_billed },
  { name: 'Un Billed', value: value_un_billed },
];
const Billed_COLORS = ['#FFAB00', '#44C4FA'];

// Shift Wise Employees Data
let value_morning = Math.round((350/500)*100);
let value_evening = Math.round((150/500)*100);
const shiftData = [
  { name: 'Morning', value: value_morning },
  { name: 'Evening', value: value_evening },
];
const Shift_COLORS = ['#FFAB00', '#664DC9'];


const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const customPieLegend = (value, entry) => (
  <div style={{display: 'flex'}}>
    <span style={{height: '10px', width: '55px', backgroundColor: entry.color, marginRight: '5px', marginTop: '4.6px'}}></span>
    <label style={{color: '#6C757D'}}>{value}</label>
  </div>
)

    return ( 
    <>
    {/* Page Wrapper */}
    <div className="page-wrapper">
        <Helmet>
            <title>Employee Reports - DaftarPro</title>
            <meta name="description" content="Login page"/>					
        </Helmet>
        {/* Page Content */}
        <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
            <div className="row">
            <div className="col">
                <h3 className="page-title">Reports</h3>
                <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>Dashboard</Link></li>
                <li className="breadcrumb-item active">Employee Report</li>
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
                        <label>Total No. of Employees</label>
                        {/* <h4>{singleUser?.casualLeaves} / {compLeaves?.casualLeaves}</h4> */}
                        <h4>10</h4>
                    </div>
                </div>
                <div className="col-sm-6 col-md-3">
                    <div className="report-cards-info" style={{minHeight: '83px'}}>
                        <label>Total Intern</label>
                        <h4>12</h4>
                    </div>
                </div>
                <div className="col-sm-6 col-md-3">
                    <div className="report-cards-info" style={{minHeight: '83px'}}>
                        <label>Total Contractor</label>
                        <h4>15</h4>
                    </div>
                </div>
                <div className="col-sm-6 col-md-3">
                    <div className="report-cards-info" style={{minHeight: '83px'}}>
                        <label>Avg Salary</label>
                        <h4>109,898</h4>
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
                    <h3 className="card-title mb-0">Gender Wise Employees</h3>
                  </div>
                  <div className="card-body">
                    {
                      loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                      genderData?.length > 0 ?
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
                      <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>No Record Found!</label>
                    }

                  </div>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="card" style={{borderRadius: '8px'}}>
                  <div style={{backgroundColor: '#F5F5F5', display: 'flex', padding: '25px', border: '1px solid #E5E5E5', borderRadius: '8px 8px 0px 0px'}}>
                    <h3 className="card-title mb-0">Department Wise Employees</h3>
                  </div>
                  <div className="card-body">
                    {
                      loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                      vBarData?.length > 0 ?
                      <ResponsiveContainer
                        width='100%'
                        height={400}
                      >
                        <BarChart
                          layout="vertical"
                          barCategoryGap={1}
                          data={vBarData}
                          margin={{
                            top: 20, right: 5, left: 15, bottom: 5,
                          }}
                        >
                          <CartesianGrid />
                          <XAxis type="number" />
                          <YAxis dataKey="department" type="category"
                            // scale="band"
                            // tickLine={false}
                            // textOverflow="ellipsis"
                            width={130}
                          />
                          <Tooltip
                            labelFormatter={(value) => <label>Department : {value}</label>}
                            formatter={(value) => <label>{value.toLocaleString()}</label>}
                          />
                          <Legend />
                          <Bar dataKey="totalEmployees" name='Total Employees' fill="#fc6075" maxBarSize={20} />
                          {/* <ReferenceLine x={0} stroke="#CCCCCC" label="" /> */}
                        </BarChart>
                      </ResponsiveContainer> :
                      <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>No Record Found!</label>
                    }

                  </div>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="card" style={{borderRadius: '8px'}}>
                  <div style={{backgroundColor: '#F5F5F5', display: 'flex', padding: '25px', border: '1px solid #E5E5E5', borderRadius: '8px 8px 0px 0px'}}>
                    <h3 className="card-title mb-0">Technical and Non Technical Staff</h3>
                  </div>
                  <div className="card-body">
                    {
                      loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                      techData?.length > 0 ?
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
                      <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>No Record Found!</label>
                    }

                  </div>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="card" style={{borderRadius: '8px'}}>
                  <div style={{backgroundColor: '#F5F5F5', display: 'flex', padding: '25px', border: '1px solid #E5E5E5', borderRadius: '8px 8px 0px 0px'}}>
                    <h3 className="card-title mb-0">Billed and Unbilled Employees</h3>
                  </div>
                  <div className="card-body">
                    {
                      loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                      billedData?.length > 0 ?
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
                      <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>No Record Found!</label>
                    }

                  </div>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="card" style={{borderRadius: '8px'}}>
                  <div style={{backgroundColor: '#F5F5F5', display: 'flex', padding: '25px', border: '1px solid #E5E5E5', borderRadius: '8px 8px 0px 0px'}}>
                    <h3 className="card-title mb-0">Employees Progress</h3>
                  </div>
                  <div className="card-body">
                    {
                      loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                      lineData?.length > 0 ?
                      <ResponsiveContainer width='100%' height={400}>
                        {/* <LineChart data={lineData} */}
                        <ComposedChart data={lineData}
                            margin={{ top: 20, right: 5, left: 5, bottom: 5}}
                            className='showLegend'
                        >
                          <CartesianGrid />
                          <XAxis dataKey="month" interval={0} />
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
                          <Bar dataKey="totalEmployees" name='Total Employees' fill="#ff9b44" maxBarSize={20} />
                          {/* <Line type="monotone" dataKey="employeesJoined" name='Employees Joined' stroke="#ff9b44" fill="#00c5fb" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 7 }} /> */}
                          <Line type="monotone" dataKey="employeesJoined" name='Employees Joined' stroke="#3E80EB" fill="#00c5fb" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 7 }} />
                          {/* <Line type="monotone" dataKey="employeesLeft" name='Employees Left' stroke="#fc6075" fill="#0253cc" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 7 }} /> */}
                          <Line type="monotone" dataKey="employeesLeft" name='Employees Left' stroke="#fc6075" fill="#fc6075" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 7 }} />
                        </ComposedChart>
                      </ResponsiveContainer> :
                      <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>No Record Found!</label>
                    }

                  </div>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="card" style={{borderRadius: '8px'}}>
                  <div style={{backgroundColor: '#F5F5F5', display: 'flex', padding: '25px', border: '1px solid #E5E5E5', borderRadius: '8px 8px 0px 0px'}}>
                    <h3 className="card-title mb-0">Shift Wise Employees</h3>
                  </div>
                  <div className="card-body">
                    {
                      loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                      shiftData?.length > 0 ?
                      <ResponsiveContainer width='100%' height={400}>
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
                          {techData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={Shift_COLORS[index % Shift_COLORS.length]} />
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
                      <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>No Record Found!</label>
                    }

                  </div>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="card" style={{borderRadius: '8px'}}>
                  <div style={{backgroundColor: '#F5F5F5', display: 'flex', padding: '25px', border: '1px solid #E5E5E5', borderRadius: '8px 8px 0px 0px'}}>
                    <h3 className="card-title mb-0">Experience Wise Employees</h3>
                  </div>
                  <div className="card-body">
                    {
                      loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                      expData?.length > 0 ?
                      <ResponsiveContainer width='100%' height={400}>
                        <BarChart
                          data={expData}
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
                            labelFormatter={(value) => `Years : ${value}`}
                            formatter={(value) => <label>{value.toLocaleString()}</label>}
                          />
                          <Legend />
                          <Bar dataKey="totalEmployees" name='Total Employees' fill="#ff9b44" maxBarSize={20} />
                        </BarChart>
                      </ResponsiveContainer> :
                      <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>No Record Found!</label>
                    }

                  </div>
                </div>
              </div>
              <div className="col-md-6 text-center">
                <div className="card" style={{borderRadius: '8px'}}>
                  <div style={{backgroundColor: '#F5F5F5', display: 'flex', padding: '25px', border: '1px solid #E5E5E5', borderRadius: '8px 8px 0px 0px'}}>
                    <h3 className="card-title mb-0">Age Wise Employees</h3>
                  </div>
                  <div className="card-body">
                    {
                      loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                      ageData?.length > 0 ?
                      <ResponsiveContainer width='100%' height={400}>
                        <BarChart
                          data={ageData}
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
                            labelFormatter={(value) => `Age : ${value}`}
                            formatter={(value) => <label>{value.toLocaleString()}</label>}
                          />
                          <Legend />
                          <Bar dataKey="totalEmployees" name='Total Employees' fill="#ff9b44" maxBarSize={20} />
                        </BarChart>
                      </ResponsiveContainer> :
                      <label style={{height: '300px', display: 'grid', placeItems: 'center', color: 'grey'}}>No Record Found!</label>
                    }

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Search Filter */}
        {/* <div className="row filter-row mb-4">
            <div className="col-sm-6 col-md-3">  
            <div className="form-group form-focus">
                <input className="form-control floating" type="text" />
                <label className="focus-label">Employee</label>
            </div>
            </div>
            <div className="col-sm-6 col-md-3"> 
            <div className="form-group form-focus select-focus">
                <select className="select floating"> 
                <option>Select Department</option>
                <option>Designing</option>
                <option>Development</option>
                <option>Finance</option>
                <option>Hr &amp; Finance</option>
                </select>
                <label className="focus-label">Department</label>
            </div>
            </div>
            <div className="col-sm-6 col-md-3">  
            <div className="form-group form-focus select-focus">
                <div>
                <input className="form-control floating datetimepicker" type="date" />
                </div>
                <label className="focus-label">From</label>
            </div>
            </div>
            <div className="col-sm-6 col-md-3">  
            <div className="form-group form-focus select-focus">
                <div>
                <input className="form-control floating datetimepicker" type="date" />
                </div>
                <label className="focus-label">To</label>
            </div>
            </div>
            <div className="col-sm-6 col-md-3">  
            <a href="#" className="btn btn-success btn-block w-100"> Search </a>  
            </div>     
        </div> */}
        {/* /Search Filter */}
        {/* <div className="row">
            <div className="col-md-12">
            <div className="table-responsive">
            <Table className="table-striped"
                    pagination= { {total : data.length,
                        showTotal : (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                        showSizeChanger : true,onShowSizeChange: onShowSizeChange ,itemRender : itemRender } }
                    style = {{overflowX : 'auto'}}
                    columns={columns}                 
                    // bordered
                    dataSource={data}
                    rowKey={record => record.id}
                    // onChange={this.handleTableChange}
                />
            </div>
            </div>
        </div> */}
        {/* /Content End */}
        </div>
        {/* /Page Content */}
    </div>
    {/* /Page Wrapper */}
    <Offcanvas/>
    </>
    );
}

export default EmployeesReport