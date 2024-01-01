
import React, { useState,useEffect } from 'react';
import { Helmet } from "react-helmet";
import { Link, useNavigate } from 'react-router-dom';
import {Avatar_03,Avatar_04} from "../../../Entryfile/imagepath"
import { BarChart, Bar, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
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

    const lineData = [
        {
            month: "Jan",
            employeesJoined: 5,
            employeesLeft: 1,
        },
        {
            month: "Feb",
            employeesJoined: 10,
            employeesLeft: 3,
        },
        {
            month: "Mar",
            employeesJoined: 100,
            employeesLeft: 10,
        },
        {
            month: "Apr",
            employeesJoined: 70,
            employeesLeft: 3,
        },
        {
            month: "May",
            employeesJoined: 50,
            employeesLeft: 2,
        },
    ];

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
                        <label>Total Employees</label>
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

        {/* Graphs Row 1 */}
        <div className="row">
              <div className="col-md-12">
                <div className="row">
                  <div className="col-md-6 text-center">
                    <div className="card">
                      <div className="card-body">
                        <h3 className="card-title">Department Wise Employees</h3>
                        {
                          loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                          barData?.length > 0 ?
                          <ResponsiveContainer width='100%' height={300}>
                            <BarChart
                              data={barData}
                              margin={{
                                top: 5, right: 5, left: 5, bottom: 5,
                              }}
                            >
                              <CartesianGrid />
                              <XAxis dataKey="department" />
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
                                labelFormatter={(value) => `Department : ${value}`}
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
                    <div className="card">
                      <div className="card-body">
                        <h3 className="card-title">No Of Employees Per Month For Current Year</h3>
                        {
                          loader ? <Spin style={{height: '300px', display: 'grid', placeItems: 'center'}} /> :
                          lineData?.length > 0 ?
                          <ResponsiveContainer width='100%' height={300}>
                            <LineChart data={lineData}
                                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
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
                              <Legend
                                formatter={(value) => {
                                    if (value === 'Employees Joined') {
                                    return <label>Employees Joined</label>;
                                    }else if (value === 'Employees Left') {
                                    return <label>Employees Left</label>;
                                    }else{
                                    return 'Profit/Loss';
                                    }
                                }}
                                />
                              <Line type="monotone" dataKey="employeesJoined" name='Employees Joined' stroke="#ff9b44" fill="#00c5fb" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 7 }} />
                              <Line type="monotone" dataKey="employeesLeft" name='Employees Left' stroke="#fc6075" fill="#0253cc" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 7 }} />
                            </LineChart>
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