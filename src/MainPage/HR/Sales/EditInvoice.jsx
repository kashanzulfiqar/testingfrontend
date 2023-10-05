
import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DatePicker, Form, Input, InputNumber, Select, message, Empty, Spin } from 'antd';
import { apiServices } from '../../../Services/apiServices';
import { getAllISOCodes } from 'iso-country-currency';
import moment from 'moment';
import { LoadingOutlined } from "@ant-design/icons";


const EditInvoice = () => {
  const [form] = Form.useForm();

  const location = useLocation();
  const edit_invoice_data = location?.state?.edit_invoice_data;
  const nav = useNavigate();
  const permissions = useSelector((state) => state?.permissionsSlice?.data);

  const user_state = useSelector((state) => state?.user?.loginvalue);
  const role = user_state?.user?.role

  const [taxValue, setTaxValue] = useState('')
  const [saveType, setSaveType] = useState('')
  const [subTotal, setSubTotal] = useState('0.00')
  const [grandTotal, setGrandTotal] = useState('0.00')
  const [allClients, setAllClients] = useState([])
  const [allProjects, setAllProjects] = useState([])
  const [allTaxSlabs, setAllTaxSlabs] = useState([])
  const [projectsLoader, setProjectsLoader] = useState(false)
  const [email, setEmail] = useState('')
  const [billingEmail, setBillingEmail] = useState('')
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [currencyIs, setCurrencyIs] = useState('');
  const [sendLoader, setSendLoader] = useState(false);
  const [saveLoader, setSaveLoader] = useState(false);

  useEffect(() => {
    if(edit_invoice_data) {
        getAllClients();
        getClientInfo(edit_invoice_data?.clientId?._id)
        getAllProjects(edit_invoice_data?.clientId?._id)
        getAllCurrencies();
        getAllTaxSlabs();
        calculateTotal()
        console.log(edit_invoice_data);
        let data = {
            ...edit_invoice_data,
            clientId: edit_invoice_data?.clientId?._id,
            invoiceTaxSlabId: edit_invoice_data?.invoiceTaxSlabId.map(item => item._id),
            invoiceDate: moment(edit_invoice_data?.invoiceDate, 'YYYY-MM-DD'),
            dueDate: moment(edit_invoice_data?.dueDate, 'YYYY-MM-DD'),
        }
        form.setFieldsValue(data);
        setCurrencyIs(edit_invoice_data?.currency)
      }else{
        nav('/restricted', { state: { unAuthorize: true}})
      }
  }, [])



  const getAllClients = () => {
    apiServices("GET", `client/all-client`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const clients = res?.data?.clients;
          const sortedData = clients.slice().sort((a, b) => a.clientName.localeCompare(b.clientName));
          setAllClients(sortedData);
        }
      }).catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Get Client Error"
          }`
        );
      });
  };

  const getAllCurrencies = () => {
    const isoCodes = getAllISOCodes();
    const uniqueCurrencies = new Set();
    isoCodes.forEach(isoCode => {
        // const currency = isoCode.currency;
        const currency = {
          currency: isoCode?.currency,
          symbol: isoCode?.symbol
        };
        // uniqueCurrencies.add(currency);
        uniqueCurrencies.add(JSON.stringify(currency));
    });
    const currency_d = [...uniqueCurrencies].map(currency => JSON.parse(currency));
    const sorted_data = currency_d.sort((a, b) => a.currency.localeCompare(b.currency));
    // setAllCurrencies([...uniqueCurrencies])
    setAllCurrencies(sorted_data)
  };

  const getAllTaxSlabs = () => {
    apiServices("GET", `invoices-tax-slab`, null, user_state)
    .then((res) => {
      if (res?.data?.success === true) {
        const taxes = res?.data?.invoicesTaxSlab;
        const sortedData = taxes.slice().sort((a, b) => a.title.localeCompare(b.title));
        setAllTaxSlabs(sortedData);
      }
    })
    .catch((err) => {
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : "Get Tax Slabs Error"
        }!`
      );
    });
  }

  const getClientInfo = (id) => {
    apiServices("GET", `client/get-client-info?_id=${id}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          setEmail(res?.data?.Client?.clientEmail);
          setBillingEmail(res?.data?.Client?.invoiceEmail);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Get Single Client Error"
          }!`
        );
      });
  }

  const getAllProjects = (isID) => {
    setProjectsLoader(true)
    apiServices("GET", `project-management/project-by-id?role=${'client'}&id=${isID}&page=${1}&limit=${99999}`, null, user_state )
      .then((res) => {
        if (res?.data?.success === true) {
          // console.log(res?.data);
          setAllProjects(res?.data?.projects?.docs);
          setProjectsLoader(false)
        }
      }).catch((err) => {
        setProjectsLoader(false)
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Get All Projects Error"
          }!`
        );
      });
  };

  const calculateAmount = (e, index, field) => {
    const updatedData = form.getFieldsValue().servicesDetails;
    const item = updatedData[index];
    
    if (field === 'unitCost') {
      item.unitCost =   item.unitCost !== null ? `${item.unitCost}` : '';
      const t_amount = (parseFloat(e) || 0) * (parseFloat(item?.quantity) || 0);
      item.amount =   `${t_amount?.toFixed(2)}`;
    } else if (field === 'quantity') {
      item.quantity =   item.quantity !== null ? `${item.quantity}` : '';
      const t_amount =  (parseFloat(item?.unitCost) || 0) * (parseFloat(e) || 0);
      item.amount =   `${t_amount?.toFixed(2)}`;
    }
    
    calculateTotal()
    
    updatedData[index] = item;
    form.setFieldsValue({ servicesDetails: updatedData });
  };

  const calculateTotal = () => {
    const updatedData = form.getFieldsValue().servicesDetails;
    let sub_total = 0;
    let grand_total = 0;
  
    updatedData?.forEach((item) => {
      sub_total += parseFloat(item?.amount) || 0;
    });

    // sub total
    setSubTotal(sub_total?.toFixed(2))

    // grand total
    const discout_value = form.getFieldsValue().discount;
    const invoice_tax = form.getFieldsValue().invoiceTax;
    if(invoice_tax){
      grand_total = ( sub_total + ( (+invoice_tax/100)*sub_total ) );
    }else {
      grand_total = sub_total;
    }
    if(discout_value){
      // grand_total = discout_value ? ( grand_total - ( (+discout_value/100)*grand_total ) ) : grand_total;
      grand_total = ( grand_total - ( (+discout_value/100)*grand_total ) );
    }

    setGrandTotal(grand_total?.toFixed(2))
    form.setFieldsValue({ totalAmount: `${grand_total?.toFixed(2)}`});

    // return total.toFixed(2);
  };

  const searchHandler = (val, type) => {
    let dropdownValues = []
    if (type === 'client'){
      allClients.forEach((client)=>{
        dropdownValues.push(client.clientName.toLowerCase())
     })
    }else if (type === 'project'){
      allProjects.forEach((project)=>{
        dropdownValues.push(project.projectName.toLowerCase())
     })
    }else if (type === 'tax'){
      allTaxSlabs.forEach((tax)=>{
        dropdownValues.push(tax.title.toLowerCase())
     })
    }

    if(val !== ''){
      dropdownValues.some((team) => {
        if(team.includes(val.toLowerCase())){
          // setNoData(false);
          return true
        }else{
          // setNoData(true);
        }
      })
    }else{
      // setNoData(false)
    }
  }

  const onFinishHandle = (values, actionType) => {
    const replacer = (key, value) => {
      if(value === undefined){
        return ''
      }
      else if (key === 'dueDate' || key === 'invoiceDate') {
        return moment(value).format('YYYY-MM-DD');
      }
      return value;
    };
    const d = JSON.parse(JSON.stringify(values, replacer));

    if (actionType === "send") {
      const new_data = {
        ...d,
        _id: edit_invoice_data?._id,
        sendInvoice: false,
        paidAmount: '0',
        remainingAmount: '0'
      }
      setSendLoader(true)
      apiServices("PUT", "invoices", new_data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          nav('/invoices')
          message.success("Invoice Updated Successfully!");
          setSendLoader(false)
        }
      })
      .catch((err) => {
        setSaveLoader(false)
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Update Invoice Error"
          }`
        );
      });
    } else if (actionType === "save") {
      const new_data = {
        ...d,
        _id: edit_invoice_data?._id,
        sendInvoice: false,
        paidAmount: '0',
        remainingAmount: '0'
      }
      setSaveLoader(true)
      apiServices("PUT", "invoices", new_data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          nav('/invoices')
          message.success("Invoice Updated Successfully!");
          setSaveLoader(false)
        }
      })
      .catch((err) => {
        setSaveLoader(false)
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : "Update Invoice Error"
          }`
        );
      });
    }

  }
  
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
        
      <div className="page-wrapper">
        <Helmet>
            <title>Create Invoice - DaftarPro</title>
            <meta name="description" content="Login page"/>					
        </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">Create Invoice</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>Dashboard</Link></li>
                <li className="breadcrumb-item active">Create Invoice</li>
              </ul>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        <div className="row">
          <div className="col-sm-12">
            <Form
              form={form}
              onFinish={(val) => onFinishHandle(val, saveType)}
              onFinishFailed={({errorFields}) => {
                const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
                if(consecutiveSpacesError){
                  message.error("Please Remove Consecutive Spaces!")
                }else{
                  message.error("Please Fill Required Fields!")
                }
              }}
              initialValues={{
                // itemsTable: allData?.education?.length > 0 ? allData?.education : [{}],
                servicesDetails: [{}],
                // invoiceTax: '0',
                // discount: '0',
              }}
            >
              <div className="row">
                <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <label>Invoice No <span className="text-danger">*</span></label>
                    <Form.Item
                      name="invoiceNo"
                      className="custom-border"
                      rules={[
                        {
                          required: true,
                          message: "please enter invoice no",
                        },
                      ]}
                    >
                      <Input className="form-control" />
                    </Form.Item>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <label>Client <span className="text-danger">*</span></label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="clientId"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "please select client",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          onSearch={(val) => {
                            searchHandler(val, 'client')
                          }}
                          filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                          optionFilterProp="children"
                          notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                          dropdownRender={(menu) => (
                            <>
                              {menu}
                            </>
                          )}

                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder="Select client"
                          onChange={(value) => {
                            getAllProjects(value);
                            getClientInfo(value);
                            form.setFieldsValue({ projectId: null })
                          }}
                        >
                          {allClients?.map((client) => (
                            <Select.Option
                              key={client._id}
                              value={client._id}
                            >
                              {client.clientName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <label>Project <span className="text-danger">*</span></label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="projectId"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "please select project",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          onSearch={(val) => {
                            searchHandler(val, 'project')
                          }}
                          filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                          optionFilterProp="children"
                          notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                          dropdownRender={(menu) => (
                            <>
                              {
                                projectsLoader ? <Spin style={{height: '130px', display: 'grid', placeItems: 'center'}} />
                                : menu
                              }
                            </>
                          )}

                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder="Select project"
                        >
                          {allProjects?.map((project) => (
                            <Select.Option
                              key={project._id}
                              value={project._id}
                            >
                              {project.projectName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                  <label>Currency <span className="text-danger">*</span></label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="currency"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "Choose a currency",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder="Select Currency"
                          onChange={(value) => setCurrencyIs(value)}
                        >
                          {
                            allCurrencies.map((currency, index) => (
                              <Select.Option key={index} value={currency?.currency}>
                                {currency?.currency}
                              </Select.Option>
                            ))
                          }
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <label>Tax <span className="text-danger">*</span></label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="invoiceTaxSlabId"
                        className="addTeamHeight"
                        // className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: "please select tax",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          onSearch={(val) => {
                            searchHandler(val, 'tax')
                          }}
                          className="customselect-height custom-select"
                          mode='multiple'
                          filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                          optionFilterProp="children"
                          notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                          dropdownRender={(menu) => (
                            <>
                              {menu}
                            </>
                          )}
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder="Select tax"
                          onChange={(value) => {
                            const totalTaxPercent = allTaxSlabs
                            .filter(item => value.includes(item._id))
                            .reduce((total, item) => total + parseFloat(item.taxPercent), 0);
                            form.setFieldsValue({ invoiceTax: `${totalTaxPercent}` });
                            calculateTotal();
                          }}
                        >
                          {allTaxSlabs?.map((tax) => (
                            <Select.Option
                              key={tax._id}
                              value={tax._id}
                            >
                              {tax.title}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <label>Email</label>
                      {/* <Form.Item
                        name="email"
                        className="custom-border"
                      > */}
                        <Input className="form-control" value={email} disabled style={{color: '#212529'}} />
                      {/* </Form.Item> */}
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <label>Billing Email</label>
                      {/* <Form.Item
                        name="billingEmail"
                        className="custom-border"
                      > */}
                        <Input className="form-control" value={billingEmail} disabled style={{color: '#212529'}} />
                      {/* </Form.Item> */}
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  {/* <div className="form-group">
                    <label>Invoice date <span className="text-danger">*</span></label>
                    <div>
                      <input className="form-control datetimepicker" type="date" />
                    </div>
                  </div> */}
                    <div className="form-group">
                      <label>
                        Invoice Date <span className="text-danger">*</span>
                      </label>
                      <div style={{ position: 'relative' }} id='area'>
                          <Form.Item
                          name='invoiceDate'
                          className='custom-border'
                          rules={[
                              {
                                required: true,
                                message: "please enter invoice date",
                              },
                            ]}
                          >
                            <DatePicker className='form-control' getPopupContainer={() => document.getElementById('area')} />
                          </Form.Item>
                      </div>
                    </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  {/* <div className="form-group">
                    <label>Due Date <span className="text-danger">*</span></label>
                    <div>
                      <input className="form-control datetimepicker" type="date" />
                    </div>
                  </div> */}
                  <div className="form-group">
                    <label>
                      Due Date <span className="text-danger">*</span>
                    </label>
                    <div style={{ position: 'relative' }} id='area'>
                        <Form.Item
                        name='dueDate'
                        className='custom-border'
                        rules={[
                            {
                              required: true,
                              message: "please enter due date",
                            },
                          ]}
                        >
                            <DatePicker className='form-control' getPopupContainer={() => document.getElementById('area')} />
                        </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 col-sm-12">
                  <div className="table-responsive">
                    <table className="table table-hover table-white">
                      <thead>
                        <tr>
                          <th style={{width: '20px'}}>#</th>
                          <th className="col-sm-2" style={{minWidth: '245px'}}>Item</th>
                          <th className="col-md-6" style={{minWidth: '295px'}}>Description</th>
                          <th style={{minWidth: '162px'}}>Unit Cost</th>
                          <th style={{minWidth: '162px'}}>Quantity</th>
                          <th>Amount</th>
                          <th> </th>
                        </tr>
                      </thead>
                      <tbody>

                      <Form.List name="servicesDetails">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map((field, index) => (
                              <tr key={field.key}>
                                <td>{index+1}</td>
                                <td>
                                  {/* <input className="form-control" type="text" style={{minWidth: '150px'}} /> */}
                                  <Form.Item
                                      {...field}
                                      name={[field.name, 'item']}
                                      className='custom-border'
                                      style={{ marginTop: '19px', marginBottom: '22px'}}
                                      fieldKey={[field.fieldKey, 'item']}
                                      rules={[
                                        {
                                          whitespace: true,
                                          required: true,
                                          validator: (_, value) => {
                                            if (!value || value.trim() === '') {
                                              return Promise.reject('please enter item');
                                            } else if (/\s{2,}/.test(value)) {
                                              return Promise.reject('please remove consecutive spaces');
                                            } else if (value.length < 3) {
                                              return Promise.reject('length must be 3 characters long');
                                            }
                                            return Promise.resolve();
                                          },
                                        },
                                      ]}
                                    >
                                      <Input className='form-control' maxLength={50} />
                                    </Form.Item>
                                </td>
                                <td>
                                  {/* <input className="form-control" type="text" style={{minWidth: '150px'}} /> */}
                                  <Form.Item
                                      {...field}
                                      name={[field.name, 'description']}
                                      className='custom-border'
                                      style={{ marginTop: '19px', marginBottom: '22px'}}
                                      fieldKey={[field.fieldKey, 'description']}
                                      rules={[
                                        {
                                          whitespace: true,
                                          required: true,
                                          validator: (_, value) => {
                                            if (!value || value.trim() === '') {
                                              return Promise.reject('please enter description');
                                            } else if (/\s{2,}/.test(value)) {
                                              return Promise.reject('please remove consecutive spaces');
                                            } else if (value.length < 3) {
                                              return Promise.reject('length must be 3 characters long');
                                            }
                                            return Promise.resolve();
                                          },
                                        },
                                      ]}
                                    >
                                      <Input className='form-control' maxLength={150} />
                                    </Form.Item>
                                </td>
                                <td>
                                  {/* <input className="form-control" style={{width: '100px'}} type="text" /> */}
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'unitCost']}
                                    className='custom-border'
                                    style={{ marginTop: '19px', marginBottom: '22px'}}
                                    fieldKey={[field.fieldKey, 'unitCost']}
                                    rules={[
                                      {
                                        // whitespace: true,
                                        required: true,
                                        message: 'please enter unit cost'
                                      },
                                    ]}
                                  >
                                    <InputNumber
                                      className='form-control hideHandlerIcon'
                                      onChange={(e) => calculateAmount(e, index, 'unitCost')}
                                      onKeyPress={(e) => {
                                        if (
                                        e.key === '.' &&
                                        e.target.value.includes('.')
                                        ) {
                                        e.preventDefault();
                                        } else if (
                                        e.which !== 46 &&
                                        (e.which < 48 || e.which > 57)
                                        ) {
                                        e.preventDefault();
                                        }
                                      }}
                                      formatter={(value) => {
                                        return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                      }}
                                      parser={(value) => {
                                        return value.replace(/\$\s?|(,*)/g, '');
                                      }}
                                    />
                                  </Form.Item>
                                </td>
                                <td>
                                  {/* <input className="form-control" style={{width: '80px'}} type="text" /> */}
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'quantity']}
                                    className='custom-border'
                                    style={{ marginTop: '19px', marginBottom: '22px'}}
                                    fieldKey={[field.fieldKey, 'quantity']}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'please enter quantity'
                                      },
                                    ]}
                                  >
                                    <InputNumber
                                      className='form-control'
                                      onChange={(e) => calculateAmount(e, index, 'quantity')}
                                      onKeyPress={(e) => {
                                        if ((e.which >= 65 && e.which <= 90) || (e.which >= 97 && e.which <= 122) || (e.which >= 33 &&  e.which <= 47) || (e.which >= 58 && e.which <= 64) || (e.which >= 91 && e.which <= 96) || (e.which >= 123 && e.which <= 126) ) {
                                          e.preventDefault();
                                        }
                                      }}
                                      min={0}
                                    />
                                  </Form.Item>
                                </td>
                                <td>
                                  {/* <input className="form-control" readOnly style={{width: '120px'}} type="text" /> */}
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'amount']}
                                    className='custom-border'
                                    style={{ marginTop: '19px', marginBottom: '22px'}}
                                    fieldKey={[field.fieldKey, 'amount']}
                                  >
                                    <InputNumber
                                      className='form-control hideHandlerIcon'
                                      disabled
                                      style={{width: '120px', color: 'black', background: '#E9ECEF'}}
                                      formatter={(value) => {
                                        return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                      }}
                                      parser={(value) => {
                                        return value.replace(/\$\s?|(,*)/g, '');
                                      }}
                                    />
                                  </Form.Item>
                                </td>
                                <td>
                                  {
                                    index > 0 ? 
                                    <a href="javascript:void(0)" className="text-danger font-18" onClick={() => {remove(field.name); calculateTotal();}} title="Remove"><i className="fa fa-trash-o" /></a>
                                    :
                                    <a href="javascript:void(0)" className="text-success font-18" onClick={() => add()} title="Add"><i className="fa fa-plus" /></a>
                                  }
                                </td>
                              </tr>
                            ))}
                          </>
                        )}
                      </Form.List>

                        {/* <tr>
                          <td>1</td>
                          <td>
                            <input className="form-control" type="text" style={{minWidth: '150px'}} />
                          </td>
                          <td>
                            <input className="form-control" type="text" style={{minWidth: '150px'}} />
                          </td>
                          <td>
                            <input className="form-control" style={{width: '100px'}} type="text" />
                          </td>
                          <td>
                            <input className="form-control" style={{width: '80px'}} type="text" />
                          </td>
                          <td>
                            <input className="form-control" readOnly style={{width: '120px'}} type="text" />
                          </td>
                          <td><a href="javascript:void(0)" className="text-success font-18" title="Add"><i className="fa fa-plus" /></a></td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>
                            <input className="form-control" type="text" style={{minWidth: '150px'}} />
                          </td>
                          <td>
                            <input className="form-control" type="text" style={{minWidth: '150px'}} />
                          </td>
                          <td>
                            <input className="form-control" style={{width: '100px'}} type="text" />
                          </td>
                          <td>
                            <input className="form-control" style={{width: '80px'}} type="text" />
                          </td>
                          <td>
                            <input className="form-control" readOnly style={{width: '120px'}} type="text" />
                          </td>
                          <td><a href="javascript:void(0)" className="text-danger font-18" title="Remove"><i className="fa fa-trash-o" /></a></td>
                        </tr> */}
                      </tbody>
                    </table>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover table-white">
                      <tbody>
                        <tr>
                          <td colSpan={5} className="text-end" style={{fontSize: '15px', fontWeight: '400'}}>Total</td>
                          <td style={{textAlign: 'right', paddingRight: '30px', width: '230px'}}>
                            {subTotal?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currencyIs}
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={5} className="text-end" style={{fontSize: '15px', fontWeight: '400'}}>Tax %</td>
                          <td style={{textAlign: 'right', paddingRight: '30px', width: '230px'}}>
                          <Form.Item
                            name='invoiceTax'
                            className='custom-border'
                            style={{marginBottom: '0px'}}
                          >
                              <Input className="form-control text-end" readOnly />
                          </Form.Item>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={5} className="text-end" style={{fontSize: '15px', fontWeight: '400'}}>
                            Discount %
                          </td>
                          <td style={{textAlign: 'right', paddingRight: '30px', width: '230px'}}>
                          <Form.Item
                            name="discount"
                            className='custom-border'
                            style={{marginBottom: '0px', width: '194px'}}
                            rules={[
                              {
                                validator: (_, value) => {
                                  if (value > 100) {
                                    return Promise.reject('Value must be between 0-100');
                                  }
                                  return Promise.resolve();
                                },
                              },
                            ]}
                          >
                            <Input
                              className="form-control text-end"
                              onChange={(e) => {
                                if(e.target.value <= 100){
                                  calculateTotal();
                                }
                              }}
                              onKeyPress={(e) => {
                                if (
                                e.key === '.' &&
                                e.target.value.includes('.')
                                ) {
                                e.preventDefault();
                                } else if (
                                e.which !== 46 &&
                                (e.which < 48 || e.which > 57)
                                ) {
                                e.preventDefault();
                                }
                              }}
                            />
                          </Form.Item>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={5} style={{textAlign: 'right', fontWeight: 'bold', fontSize: '15px', fontWeight: '700'}}>
                            Grand Total
                          </td>
                          <td style={{textAlign: 'right', paddingRight: '30px', fontWeight: 'bold', fontSize: '16px', width: '230px'}}>
                          <Form.Item name="totalAmount" style={{marginBottom: '0px'}}>
                            {grandTotal?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currencyIs}
                          </Form.Item>
                          </td>
                        </tr>
                      </tbody>
                    </table>                               
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      {/* <div className="form-group">
                        <label>Other Information</label>
                        <textarea className="form-control" defaultValue={""} />
                      </div> */}
                      <div className="form-group">
                        <label>
                          Other Information <span className="text-danger">*</span>
                        </label>
                        <Form.Item
                          name='otherInformation'
                          className='custom-border'
                          rules={[
                              {
                                required: true,
                                message: "please enter other information",
                              },
                            ]}
                        >
                          <Input.TextArea className="form-control" />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="submit-section" style={{display: 'flex', justifyContent: 'center', gap: '10px'}}>
                <button className="btn btn-primary submit-btn" onClick={() => setSaveType('send') } disabled={sendLoader}>
                    {
                        sendLoader ? <Spin size="small" indicator={antIcon} />
                        : 'Save & Send'
                    }
                </button>
                <button className="btn btn-primary submit-btn" onClick={() => setSaveType('save') } disabled={saveLoader}>
                    {
                        saveLoader ? <Spin size="small" indicator={antIcon} />
                        : 'Save'
                    }
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
      {/* /Page Content */}
    </div>
      );
   
}

export default EditInvoice