
import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { DatePicker, Form, Input, InputNumber, Select, message, Empty, Spin, Tooltip } from 'antd';
import { apiServices } from '../../../Services/apiServices';
import { getAllISOCodes } from 'iso-country-currency';
import moment from 'moment';
import { LoadingOutlined } from "@ant-design/icons";
import { useTranslation } from 'react-i18next';
import EmptyTable from "../../../files/Icons/EmptyTable.svg";


const EditInvoice = () => {
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const edit_invoice_data = location?.state?.edit_invoice_data;
  const nav = useNavigate();
  const permissions = useSelector((state) => state?.permissionsSlice?.data);

  const user_state = useSelector((state) => state?.user?.loginvalue);
  const role = user_state?.user?.role

  const [projectId, setProjectId] = useState(edit_invoice_data?.projectId)
  const [wordCount, setWordCount] = useState('')
  const [taxValue, setTaxValue] = useState('')
  const [saveType, setSaveType] = useState('')
  const [subTotal, setSubTotal] = useState('0.00')
  const [subTotalEx, setSubTotalEx] = useState('0.00')
  const [grandTotal, setGrandTotal] = useState('0.00')
  const [allClients, setAllClients] = useState([])
  const [allProjects, setAllProjects] = useState([])
  const [allTaxSlabs, setAllTaxSlabs] = useState([])
  const [allBanks, setAllBanks] = useState([])
  const [projectsLoader, setProjectsLoader] = useState(false)
  const [email, setEmail] = useState(edit_invoice_data?.client?.clientEmail)
  const [billingEmail, setBillingEmail] = useState(edit_invoice_data?.client?.invoiceEmail)
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [currencyIs, setCurrencyIs] = useState('');
  const [tableLoader, setTableLoader] = useState(false);
  const [sendLoader, setSendLoader] = useState(false);
  const [saveLoader, setSaveLoader] = useState(false);
  const [monthlyTeam, setMonthlyTeam] = useState(false);
  const [hourlyTeam, setHourlyTeam] = useState(false);
  const [teamArray, setTeamArray] = useState([])
  const [taxes, setTaxes] = useState({});
  const [serviceDetailsList, setServiceDetailsList] = useState([
    {
      amount: '',
      description: '',
      invoiceTax: [],
      item: '',
      quantity: '',
      taxPercent: '',
      totalAmount: '',
      unitCost: '',
    }
  ]);

  useEffect(() => {
    if((role === 'admin' || permissions?.managePayrolls) && edit_invoice_data) {
      console.log(edit_invoice_data)
      let initialTaxes = {};
      if (edit_invoice_data?.monthlyTeamDetails?.length > 0) {
        setMonthlyTeam(true);
        setTeamArray(edit_invoice_data?.monthlyTeamDetails);

        edit_invoice_data?.monthlyTeamDetails.forEach((item, index) => {
          initialTaxes[index] = item.taxSlabIds || [];
        });
  
        setTaxes(initialTaxes);
        console.log('taxes',initialTaxes)
      }
      if (edit_invoice_data?.teamDetails?.length > 0) {
        setHourlyTeam(true);
        setTeamArray(edit_invoice_data?.teamDetails);

        edit_invoice_data?.teamDetails.forEach((item, index) => {
          initialTaxes[index] = item.taxSlabIds || [];
        });
  
        setTaxes(initialTaxes);
        console.log('taxes',initialTaxes)
      }
      getAllClients();
        getClientInfo(edit_invoice_data?.client?._id)
        getAllProjects(edit_invoice_data?.client?._id)
        // getClientInfo(edit_invoice_data?.clientId?._id)
        // getAllProjects(edit_invoice_data?.clientId?._id)
        getAllCurrencies();
        getAllTaxSlabs();
        //calculateTotal()
        getAllBanks();
        let data = {
            ...edit_invoice_data,
            clientId: edit_invoice_data?.client?._id,
            // clientId: edit_invoice_data?.clientId?._id,
            // invoiceTaxSlabId: edit_invoice_data?.invoiceTaxSlabId.map(item => item._id),
            invoiceDate: edit_invoice_data?.invoiceDate ? moment(edit_invoice_data?.invoiceDate, 'YYYY-MM-DD') : '',
            invoiceStartDate: edit_invoice_data?.invoiceStartDate ? moment(edit_invoice_data?.invoiceStartDate, 'YYYY-MM-DD') : '',
            invoiceEndDate: edit_invoice_data?.invoiceEndDate ? moment(edit_invoice_data?.invoiceEndDate, 'YYYY-MM-DD') : '',
            dueDate: edit_invoice_data?.dueDate ? moment(edit_invoice_data?.dueDate, 'YYYY-MM-DD') : '',
        }
        form.setFieldsValue(data);
        calculateTotal();
        setCurrencyIs(edit_invoice_data?.currency)
        setWordCount(edit_invoice_data?.otherInformation)
    }else{
      nav(`${role === 'client' ? '/client/client-profile' : role === 'focalperson' ? `/client/focal-profile` : role === 'admin' ? `/main/dashboard` : `/employee/dashboard`}`)
    }
  }, [])

  useEffect(() => {
    calculateTotal();
  }, [teamArray, taxes, allTaxSlabs]);

  const getAllBanks = () => {
    apiServices("GET", `bank-details`, null, user_state)
    .then((res) => {
      if (res.data.success === true) {
        const banks = res?.data?.bankDetail;
        const sortedData = banks.slice().sort((a, b) => a.bankName.localeCompare(b.bankName));
        setAllBanks(sortedData);
      }
    }).catch((err) => {
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : t('finance.Invoices.getAllBanksError')
        }`
      );
    });
  }

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
              : t('Timesheetadmin.getClientError')
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
    apiServices("GET", `invoices-tax-slab?status=Active`, null, user_state)
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
            : t('allEmp.errors.getTaxSlabsInfoError')
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
              : t('Timesheetadmin.getClientError')
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
              : t('aDash.errors.getProjectError')
          }!`
        );
      });
  };

  const getProjectInvoice = (id, invoiceStartDate, invoiceEndDate) => {
    setTableLoader(true);
    apiServices("GET", `project-management/projectInvoice?projectId=${id}&invoiceStartDate=${invoiceStartDate}&invoiceEndDate=${invoiceEndDate}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          console.log("success")
          setMonthlyTeam(false);
          setHourlyTeam(true);
          setTeamArray(res?.data?.teamCost);
          setTaxes({});
          setTableLoader(false);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : 'Error getting project details'
          }!`
        );
        setTableLoader(false);
      });
  }

  const getMonthlyProjectInvoice = (id, invoiceStartDate, invoiceEndDate) => {
    setTableLoader(true);
    console.log("Monthly")
    apiServices("GET", `project-management/monthlyProjectInvoice?projectId=${id}&invoiceStartDate=${invoiceStartDate}&invoiceEndDate=${invoiceEndDate}`, null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          console.log("success")
          setHourlyTeam(false);
          setMonthlyTeam(true);
          setTeamArray(res?.data?.teamCost);
          setTaxes({});
          setTableLoader(false);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : 'Error getting project details'
          }!`
        );
        setTableLoader(false);
      });
  }

  const handleDateChange = (field, value) => {
    const dateValue = value ? value.format('YYYY-MM-DD') : null;
    const formValues = form.getFieldsValue();
    const invoiceStartDate = formValues.invoiceStartDate ? formValues.invoiceStartDate.format('YYYY-MM-DD') : null;
    const invoiceEndDate = formValues.invoiceEndDate ? formValues.invoiceEndDate.format('YYYY-MM-DD') : null;

    if (invoiceStartDate && invoiceEndDate && invoiceEndDate < invoiceStartDate) {
      return;
    }
  
    if (invoiceStartDate && invoiceEndDate) {
      hourlyTeam ? getProjectInvoice(projectId, invoiceStartDate, invoiceEndDate) 
      :
      monthlyTeam ? getMonthlyProjectInvoice(projectId, invoiceStartDate, invoiceEndDate) 
      : 
      null
    }
  };

  const handleProjectChange = (value) => {
    setProjectId(value);
    const selectedProject = allProjects?.find(project => project._id === value);

    if (selectedProject) {
      const { costType } = selectedProject;
      const { invoiceStartDate, invoiceEndDate } = form.getFieldsValue(['invoiceStartDate', 'invoiceEndDate']);
      setCurrencyIs(selectedProject?.currency)
      form.setFieldsValue({ currency: selectedProject?.currency });

      if (costType === 'Hourly' && invoiceStartDate && invoiceEndDate) {
        getProjectInvoice(value, invoiceStartDate, invoiceEndDate);
        //console.log('XYZ type project with start and end dates:', invoiceStartDate, invoiceEndDate);
      } else if (costType === 'Monthly' && invoiceStartDate && invoiceEndDate) {
        getMonthlyProjectInvoice(value, invoiceStartDate, invoiceEndDate)
        //console.log('ABC type project with start and end dates:', invoiceStartDate, invoiceEndDate);
      } else {
        setHourlyTeam(false);
        setMonthlyTeam(false);
        setTeamArray([]);
        setTaxes({});
        form.setFieldsValue({ servicesDetails: serviceDetailsList });
      }
    }
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
    
    const selectedTaxes = item.invoiceTax || [];
    console.log("TAXES", item.invoiceTax)
    const taxAmounts = selectedTaxes.map(taxId => {
      const tax = allTaxSlabs.find(t => t._id === taxId);
      return tax ? (parseFloat(tax.taxPercent) / 100) * parseFloat(item.amount) : 0;
    });
    const totalTax = taxAmounts.reduce((acc, val) => acc + val, 0);
    item.totalAmount = (parseFloat(item.amount) + totalTax).toFixed(2);
    
    updatedData[index] = item;
    form.setFieldsValue({ servicesDetails: updatedData });
    calculateTotal()
  };

  const calculateTotal = () => {
    if (teamArray.length > 0) {
      console.log("HERE")
      let subTotal = 0;
      let prevTotal = 0;
      let grandTotal = 0;
  
      teamArray.forEach((member, index) => {
        console.log(member.total)
        // Calculate total for each row including tax
        const totalAmount = calculateTotalAmount(member.total, taxes[index] || []);
        console.log("after",totalAmount)
        member.totalAmount = parseFloat(totalAmount);
        subTotal += member.totalAmount;
        prevTotal += parseFloat(member.total); 
      });
  
      setSubTotal(subTotal.toFixed(2));
      setSubTotalEx(prevTotal.toFixed(2)); 

      console.log(subTotal, prevTotal)
  
      const discountValue = form.getFieldsValue().discount;
      const invoiceTax = form.getFieldsValue().invoiceTax;
  
      grandTotal = subTotal;

      if (discountValue) {
        grandTotal -= (discountValue / 100) * subTotal;
      }
  
      if (invoiceTax) {
        grandTotal += (invoiceTax / 100) * subTotal;
      }
  
      setGrandTotal(grandTotal.toFixed(2));
      form.setFieldsValue({ totalAmount: grandTotal.toFixed(2) });
    }
    else {
      
      console.log("in else")
      const updatedData = form.getFieldsValue().servicesDetails;
      let sub_total = 0;
      let total = 0;
      let grand_total = 0;
    
      updatedData?.forEach((item) => {
        sub_total += parseFloat(item?.amount) || 0;
        total += parseFloat(item?.totalAmount ? item?.totalAmount : item?.amount) || 0;
      });

      // sub total
      setSubTotal(total?.toFixed(2))
      setSubTotalEx(sub_total?.toFixed(2))

      // grand total
      const discout_value = form.getFieldsValue().discount;
      const invoice_tax = form.getFieldsValue().invoiceTax;

      grand_total = total;
      
      if(discout_value){
        // grand_total = discout_value ? ( grand_total - ( (+discout_value/100)*grand_total ) ) : grand_total;
        grand_total = ( grand_total - ( (+discout_value/100)*total ) );
      }
      if(invoice_tax){
        grand_total = ( grand_total + ( (+invoice_tax/100)*total ) );
      }

      setGrandTotal(grand_total?.toFixed(2))
      form.setFieldsValue({ totalAmount: `${grand_total?.toFixed(2)}`});
    }

    // return total.toFixed(2);
  };

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
            No Data
          </div>
          {/* <div
            style={{ color: "#464665", fontWeight: "300", fontSize: "13px" }}
          >
            Click 'Add Department' Button To Create <br /> A New Department{" "}
          </div> */}
        </div>
      }
    />
  );

  const handleTaxChange = (value, index) => {
    setTaxes(prev => {
      const updatedTaxes = { ...prev, [index]: value };
      calculateTotal(updatedTaxes);
      return updatedTaxes;
    });
    setTimeout(() => {
      if (!teamArray.length) {
        const serviceDetails = form.getFieldsValue().servicesDetails;
        const item = serviceDetails[index];
        const updatedTaxes = form.getFieldsValue().servicesDetails[index].invoiceTax || [];
        
        // Calculate the tax percent based on the latest taxes value
        const taxPercent = calculateTotalTaxPercent(updatedTaxes);
        item.taxPercent = taxPercent;
  
        // Update the serviceDetails array with the new taxPercent
        serviceDetails[index] = item;
  
        // Set the updated serviceDetails back to the form
        form.setFieldsValue({ servicesDetails: serviceDetails });
      } else {
        const updatedTeamArray = [...teamArray];
        updatedTeamArray[index].taxSlabIds = value;
        setTeamArray(updatedTeamArray);
      }
    }, 0);
  };

  const calculateTotalAmount = (total, selectedTaxes) => {
    let totalAmount = parseFloat(total);
    let taxValue = 0;
    console.log("selected ",selectedTaxes)
    selectedTaxes.forEach(taxId => {
      const tax = allTaxSlabs.find(t => t._id === taxId);
      if (tax) {
        console.log(tax.taxPercent)
        taxValue += totalAmount * (parseFloat(tax.taxPercent) / 100);
      }
    });
    totalAmount += taxValue;
    console.log("calculateTotalAmount",totalAmount)
    return totalAmount.toFixed(2);
  };

  const calculateTotalTaxPercent = (selectedTaxes) => {
    let totalTaxPercent = 0;
    selectedTaxes.forEach(taxId => {
      const tax = allTaxSlabs.find(t => t._id === taxId);
      if (tax) {
        totalTaxPercent += parseFloat(tax.taxPercent);
      }
    });
    return totalTaxPercent > 0 ? totalTaxPercent.toFixed(2) : totalTaxPercent;
  };

  const removeRow = (index) => {
    setTeamArray(prevTeamArray => prevTeamArray.filter((_, i) => i !== index));
    calculateTotal();
  };

  const handleHoursWorkedChange = (e, index) => {
    const updatedTeamArray = [...teamArray];
    updatedTeamArray[index].hoursWorked = e.target.value;
    updatedTeamArray[index].total = (e.target.value * updatedTeamArray[index].cost).toFixed(2);
    setTeamArray(updatedTeamArray);
    
    calculateTotal();
  };

  const handleDaysWorkedChange = (e, index) => {
    const updatedTeamArray = [...teamArray];
    updatedTeamArray[index].daysWorked = e.target.value;
    updatedTeamArray[index].total = (e.target.value * updatedTeamArray[index]?.perDayCost).toFixed(2);
    setTeamArray(updatedTeamArray);

    calculateTotal();
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
    }else if (type === 'bank'){
      allBanks.forEach((bank)=>{
        dropdownValues.push(bank.bankName.toLowerCase())
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
      else if (key === 'dueDate' || key === 'invoiceStartDate' || key === 'invoiceEndDate' || key === 'invoiceDate') {
        return moment(value).format('YYYY-MM-DD');
      }
      return value;
    };
    const d = JSON.parse(JSON.stringify(values, replacer));
    let teamDetails = [];
    let monthlyTeamDetails = [];

    if (monthlyTeam) {
      monthlyTeamDetails = teamArray?.map((member, index) => ({
        userId: member.userId,
        userName: member.userName,
        cost: member.cost,
        perDayCost: member.perDayCost,
        daysWorked: member.daysWorked,
        total: member.total,
        taxSlabIds: taxes[index]?.map(tax => tax),
        taxPercent: calculateTotalTaxPercent(taxes[index] || []),
        totalAmount: calculateTotalAmount(member.total, taxes[index] || [])
      }));
    }

    if (hourlyTeam) {
      teamDetails = teamArray?.map((member, index) => ({
        userId: member.userId,
        userName: member.userName,
        cost: member.cost,
        hoursWorked: member.hoursWorked,
        total: member.total,
        taxSlabIds: taxes[index]?.map(tax => tax),
        taxPercent: calculateTotalTaxPercent(taxes[index] || []),
        totalAmount: calculateTotalAmount(member.total, taxes[index] || [])
      }));
    }

    if (actionType === "send") {
      const new_data = {
        ...d,
        _id: edit_invoice_data?._id,
        monthlyTeamDetails,
        teamDetails,
        sendInvoice: true,
        paidAmount: '0',
        remainingAmount: `${d?.totalAmount}`
      }
      setSendLoader(true)
      apiServices("PUT", "invoices", new_data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          nav('/invoices')
          message.success(t('finance.Invoices.invoiceUpdatedSuccessfully'));
          setSendLoader(false)
        }
      })
      .catch((err) => {
        //setSaveLoader(false)
        setSendLoader(false)
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('finance.Invoices.updateInvoiceError')
          }`
        );
      });
    } else if (actionType === "save") {
      const new_data = {
        ...d,
        _id: edit_invoice_data?._id,
        monthlyTeamDetails,
        teamDetails,
        sendInvoice: false,
        paidAmount: '0',
        remainingAmount: `${d?.totalAmount}`
      }
      setSaveLoader(true)
      apiServices("PUT", "invoices", new_data, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          nav('/invoices')
          message.success(t('finance.Invoices.invoiceUpdatedSuccessfully'));
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
              : t('finance.Invoices.updateInvoiceError')
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
            <title>{t('holiday.update')} {t('finance.Invoices.invoice')} - {t('header.daftarPro')}</title>
            <meta name="description" content="Login page"/>					
        </Helmet>
      {/* Page Content */}
      <div className="content container-fluid">
        {/* Page Header */}
        <div className="page-header">
          <div className="row">
            <div className="col-sm-12">
              <h3 className="page-title">{t('holiday.update')} {t('finance.Invoices.invoice')}</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item"><Link to={role === 'admin' ? '/main/dashboard' : '/employee/dashboard'}>{t('dashboard')}</Link></li>
                <li className="breadcrumb-item active">{t('holiday.update')} {t('finance.Invoices.invoice')}</li>
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
                  message.error(t('allEmp.errors.removeConsecutiveSpaces'))
               }else{
                  message.error(t('allEmp.errors.fillRequiredFields'))
                } 
              }}
              initialValues={{
                invoiceTaxSlabId: [],
                // itemsTable: allData?.education?.length > 0 ? allData?.education : [{}],
                servicesDetails: [{}],
                // invoiceTax: '0',
                // discount: '0',
              }}
            >
              <div className="row">
                {/* <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <label>Invoice No <span className="text-danger">*</span></label>
                    <Form.Item
                      name="invoiceNo"
                      className="custom-border"
                      rules={[
                        {
                          whitespace: true,
                          required: true,
                          validator: (_, value) => {
                            if(!value || value.trim() === ''){
                              return Promise.reject("please enter invoice no");
                            }
                            else if (/\s{2,}/.test(value)) {
                              return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <Input className="form-control" maxLength={18} />
                    </Form.Item>
                  </div>
                </div> */}
                <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <label>{t('projectScreen.Modal.client')} <span className="text-danger">*</span></label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="clientId"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('finance.Invoices.pleaseselectclient'),
                          },
                        ]}
                      >
                        <Select
                          disabled
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
                          placeholder={t('finance.Invoices.selectClient')}
                          // onChange={(value) => {
                          //   getAllProjects(value);
                          //   getClientInfo(value);
                          //   form.setFieldsValue({ projectId: null })
                          // }}
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
                    <label>{t('finance.Invoices.project')} <span className="text-danger">*</span></label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="projectId"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('finance.Invoices.pleaseselectproject'),
                          },
                        ]}
                      >
                        <Select
                          disabled
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
                          placeholder={t('Tasks.selectproject')}
                          //onChange={handleProjectChange}
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
                  <label>{t('finance.Invoices.currency')} <span className="text-danger">*</span></label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="currency"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('finance.Invoices.Chooseacurrency'),
                          },
                        ]}
                      >
                        <Select
                          disabled
                          showSearch
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder={t('projectScreen.Modal.selectCurrency')}
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
                    <label>{t('finance.Invoices.email')}</label>
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
                    <label>{t('finance.Invoices.billingemail')}</label>
                      {/* <Form.Item
                        name="billingEmail"
                        className="custom-border"
                      > */}
                        <Input className="form-control" value={billingEmail} disabled style={{color: '#212529'}} />
                      {/* </Form.Item> */}
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                  <div className="form-group">
                    <label>{t('finance.Invoices.bank')} <span className="text-danger">*</span></label>
                    <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="bankDetailId"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('finance.Invoices.pleaseselectbank'),
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          onSearch={(val) => {
                            searchHandler(val, 'bank')
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
                          placeholder={t('finance.Invoices.selectBank')}
                        >
                          {allBanks?.map((bank) => (
                            <Select.Option
                              key={bank._id}
                              value={bank._id}
                            >
                              {bank.bankName}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-3">
                    <div className="form-group">
                      <label>
                      {t('finance.Invoices.invoicedate')} <span className="text-danger">*</span>
                      </label>
                      <div style={{ position: 'relative' }} id='area'>
                          <Form.Item
                          name='invoiceDate'
                          className='custom-border'
                          rules={[
                              {
                                required: true,
                                message: t('finance.Invoices.pleaseenterinvoicedate'),
                              },
                            ]}
                          >
                            <DatePicker placeholder={t('requests.addModal.selectDate')} className='form-control' getPopupContainer={() => document.getElementById('area')} />
                          </Form.Item>
                      </div>
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
                      Invoice Start Date <span className="text-danger">*</span>
                      </label>
                      <div style={{ position: 'relative' }} id='area'>
                          <Form.Item
                          name='invoiceStartDate'
                          className='custom-border'
                          rules={[
                              {
                                required: true,
                                message: 'please enter invoice start date',
                              },
                              // ({ getFieldValue }) => ({
                              //   validator(_, value) {
                              //     const endDate = getFieldValue('invoiceEndDate');
                              //     if (!value || !endDate || value.isSameOrBefore(endDate)) {
                              //       return Promise.resolve();
                              //     }
                              //     return Promise.reject(new Error('Invoice Start Date cannot be before End Date'));
                              //   },
                              // }),
                            ]}
                          >
                            <DatePicker placeholder={t('requests.addModal.selectDate')} className='form-control' getPopupContainer={() => document.getElementById('area')}
                            onChange={(date) => {
                              const endDate = form.getFieldValue('invoiceEndDate');
                              if (endDate && date.isAfter(endDate)) {
                                form.setFields([
                                  {
                                    name: 'invoiceEndDate',
                                    errors: ['Invoice End Date cannot be before Start Date'],
                                  },
                                ]);
                              } else {
                                form.setFields([
                                  {
                                    name: 'invoiceEndDate',
                                    errors: [],
                                  },
                                ]);
                              }
                              //form.validateFields(['invoiceEndDate']);
                              handleDateChange('invoiceStartDate', date)
                            }}
                            />
                          </Form.Item>
                      </div>
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
                      Invoice End Date <span className="text-danger">*</span>
                      </label>
                      <div style={{ position: 'relative' }} id='area'>
                          <Form.Item
                          name='invoiceEndDate'
                          className='custom-border'
                          rules={[
                              {
                                required: true,
                                message: 'please enter invoice end date',
                              },
                              ({ getFieldValue }) => ({
                                validator(_, value) {
                                  const startDate = getFieldValue('invoiceStartDate');
                                  if (!value || !startDate || value.isSameOrAfter(startDate)) {
                                    return Promise.resolve();
                                  }
                                  return Promise.reject(new Error('Invoice End Date cannot be before Start Date'));
                                },
                              }),
                            ]}
                          >
                            <DatePicker placeholder={t('requests.addModal.selectDate')} className='form-control' getPopupContainer={() => document.getElementById('area')}
                            onChange={(date) => {
                              //form.validateFields(['invoiceStartDate']);
                              handleDateChange('invoiceEndDate', date)
                            }}
                            />
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
                    {t('finance.Invoices.duedate')} <span className="text-danger">*</span>
                    </label>
                    <div style={{ position: 'relative' }} id='area'>
                        <Form.Item
                        name='dueDate'
                        className='custom-border'
                        rules={[
                            {
                              required: true,
                              message: t('finance.Invoices.pleaseenterduedate'),
                            },
                            ({ getFieldValue }) => ({
                              validator(_, value) {
                                const invoiceDate = getFieldValue('invoiceDate');
                                if (!value || !invoiceDate || value.isSameOrAfter(invoiceDate)) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(new Error('Invoice Due Date cannot be before Invoice Date'));
                              },
                            }),
                          ]}
                        >
                            <DatePicker placeholder={t('requests.addModal.selectDate')} className='form-control' getPopupContainer={() => document.getElementById('area')}
                            onChange={()=>
                              form.validateFields(['dueDate'])} 
                            />
                        </Form.Item>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-12 col-sm-12">
                  {
                    tableLoader ?
                      <div className="col-md-12 text-center">
                        <Spin size="large" tip="Loading..." />
                      </div> :
                    (hourlyTeam ? 
                      <div className="table-responsive">
                        <table className="table table-hover table-white">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Resource Name</th>
                            <th>Hourly Rate</th>
                            <th>Hours Worked</th>
                            <th>Amount</th>
                            <th>Tax</th>
                            <th>Tax %</th>
                            <th>Total Amount</th>
                            <th> </th>
                          </tr>
                        </thead>
                          <tbody>

                          {
                            teamArray?.length > 0 
                            ?
                              teamArray.map((member, index) => (
                                <tr key={member.userId}>
                                  <td>{index + 1}</td>
                                  <td>{member.userName}</td>
                                  <td>{member.cost?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currencyIs}</td>
                                  <td>
                                    {/* {member.hoursWorked} */}
                                    <Form.Item
                                    //name={`tax-${index}`}
                                    className="addTeamHeight"
                                    style={{marginBottom: '0px', width: '120px' }}
                                  >
                                    <Input
                                      className="form-control text-end"
                                      value={member.hoursWorked}
                                      onChange={(e) => handleHoursWorkedChange(e, index)}
                                      onKeyPress={(e) => {
                                        if (
                                          e.key !== '.' &&
                                          (e.which < 48 || e.which > 57) &&
                                          e.which !== 8 // Allow backspace
                                        ) {
                                          e.preventDefault();
                                        }
                                        if (e.key === '.' && e.target.value.includes('.')) {
                                          e.preventDefault();
                                        }
                                      }}
                                    />
                                  </Form.Item>
                                  </td>
                                  <td>{member.total?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currencyIs}</td>
                                  <td>
                                  <Form.Item
                                    //name={`tax-${index}`}
                                    className="addTeamHeight"
                                    style={{marginBottom: '0px', width: '194px' }}
                                  >
                                    <Select
                                      showSearch
                                      onSearch={(val) => {
                                        searchHandler(val, 'tax')
                                      }}
                                      value={member?.taxSlabIds}
                                      onChange={(value) => handleTaxChange(value, index)}
                                      className="customselect-height custom-select"
                                      mode='multiple'
                                      placeholder="Select Tax"
                                      filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                      optionFilterProp="children"
                                      notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                      dropdownRender={(menu) => (
                                        <>
                                          {menu}
                                        </>
                                      )}
                                    >
                                      {allTaxSlabs?.map((tax) => (
                                        <Option key={tax._id} value={tax._id}>
                                          {tax.title}
                                        </Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item //name={`totalTaxPercent-${index}`} 
                                  style={{ marginBottom: '0px' }}>
                                    {calculateTotalTaxPercent(taxes[index] || [])}
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item //name={`totalAmount-${index}`} 
                                  style={{ marginBottom: '0px' }}>
                                    {calculateTotalAmount(member.total, taxes[index] || [])?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currencyIs}
                                  </Form.Item>
                                </td>
                                <td>
                                  {teamArray.length > 1 ? (
                                    <a href="javascript:void(0)" className="text-danger font-18" onClick={() => {removeRow(index); calculateTotal();}} title="Remove">
                                      <i className="fa fa-trash-o" />
                                    </a>
                                  ) : (
                                    <a href="javascript:void(0)" className="text-muted font-18" style={{ cursor: 'not-allowed' }} title="Cannot remove">
                                      <i className="fa fa-trash-o" />
                                    </a>
                                  )}
                                </td>
                                </tr>
                              ))
                            :
                            <tr>
                              <td colSpan="9" className="text-center">
                                {customEmptyText}
                              </td>
                            </tr>
                          }
                          </tbody>
                        </table>
                      </div>
                    : 
                    monthlyTeam ?
                      <div className="table-responsive">
                        <table className="table table-hover table-white">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Resource Name</th>
                            <th>Monthly Rate</th>
                            <th>Per Day Cost</th>
                            <th>Days Worked</th>
                            <th>Amount</th>
                            <th>Tax</th>
                            <th>Tax %</th>
                            <th>Total Amount</th>
                            <th> </th>
                          </tr>
                        </thead>
                          <tbody>

                          {
                            teamArray?.length > 0 
                            ?
                              teamArray.map((member, index) => (
                                <tr key={member.userId}>
                                  <td>{index + 1}</td>
                                  <td>{member.userName}</td>
                                  <td>{member.cost?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currencyIs}</td>
                                  <td>{member.perDayCost?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currencyIs}</td>
                                  <td>
                                    {/* {member.daysWorked} */}
                                    <Form.Item
                                    //name={`tax-${index}`}
                                    className="addTeamHeight"
                                    style={{marginBottom: '0px', width: '120px' }}
                                  >
                                    <Input
                                      className="form-control text-end"
                                      value={member.daysWorked}
                                      onChange={(e) => handleDaysWorkedChange(e, index)}
                                      onKeyPress={(e) => {
                                        if (e.which < 48 || e.which > 57) {
                                          e.preventDefault();
                                        }
                                      }}
                                    />
                                  </Form.Item>
                                  </td>
                                  <td>{member.total?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currencyIs}</td>
                                  <td>
                                  <Form.Item
                                    //name={`tax-${index}`}
                                    className="addTeamHeight"
                                    style={{marginBottom: '0px', width: '194px' }}
                                  >
                                    <Select
                                      showSearch
                                      onSearch={(val) => {
                                        searchHandler(val, 'tax')
                                      }}
                                      value={member?.taxSlabIds}
                                      onChange={(value) => handleTaxChange(value, index)}
                                      className="customselect-height custom-select"
                                      mode='multiple'
                                      placeholder="Select Tax"
                                      filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                      optionFilterProp="children"
                                      notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                      dropdownRender={(menu) => (
                                        <>
                                          {menu}
                                        </>
                                      )}
                                    >
                                      {allTaxSlabs?.map((tax) => (
                                        <Option key={tax._id} value={tax._id}>
                                          {tax.title}
                                        </Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item //name={`totalTaxPercent-${index}`} 
                                  style={{ marginBottom: '0px' }}>
                                    {calculateTotalTaxPercent(taxes[index] || [])}
                                  </Form.Item>
                                </td>
                                <td>
                                  <Form.Item //name={`totalAmount-${index}`} 
                                  style={{ marginBottom: '0px' }}>
                                    {calculateTotalAmount(member.total, taxes[index] || [])?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currencyIs}
                                  </Form.Item>
                                </td>
                                <td>
                                  {teamArray.length > 1 ? (
                                    <a href="javascript:void(0)" className="text-danger font-18" onClick={() => {removeRow(index); calculateTotal();}} title="Remove">
                                      <i className="fa fa-trash-o" />
                                    </a>
                                  ) : (
                                    <a href="javascript:void(0)" className="text-muted font-18" style={{ cursor: 'not-allowed' }} title="Cannot remove">
                                      <i className="fa fa-trash-o" />
                                    </a>
                                  )}
                                </td>
                                </tr>
                              ))
                            :
                              <tr>
                                <td colSpan="9" className="text-center">
                                  {customEmptyText}
                                </td>
                              </tr>
                          }
                          </tbody>
                        </table>
                      </div>
                    :
                    <div className="table-responsive">
                      <table className="table table-hover table-white">
                        <thead>
                          <tr>
                            <th style={{width: '20px'}}>#</th>
                            <th className="col-sm-2" style={{minWidth: '245px'}}>{t('finance.Invoices.item')}</th>
                            <th className="col-md-6" style={{minWidth: '295px'}}>{t('finance.Invoices.description')}</th>
                            <th style={{minWidth: '162px'}}>{t('finance.Invoices.unitcost')}</th>
                            <th style={{minWidth: '162px'}}>{t('finance.Invoices.quantity')}</th>
                            <th>{t('finance.Invoices.amount')}</th>
                            <th>Tax</th>
                            <th>Tax %</th>
                            <th>Total Amount</th>
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
                                                return Promise.reject(t('finance.Invoices.pleaseenteritem'));
                                              } else if (/\s{2,}/.test(value)) {
                                                return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                                              } else if (value.length < 2) {
                                                return Promise.reject(t('finance.Invoices.lengthMustBeTwoCharactersLong'));
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
                                                return Promise.reject(t('finance.Invoices.pleaseenterdescription'));
                                              } else if (/\s{2,}/.test(value)) {
                                                return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                                              } else if (value.length < 3) {
                                                return Promise.reject(t('finance.Invoices.lengthMustBeThreeCharactersLong'));
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
                                          message: t('finance.Invoices.pleaseenterunitcost')
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
                                          message: t('finance.Invoices.pleaseenterquantity')
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
                                    {/* <input className="form-control" readOnly style={{width: '120px'}} type="text" /> */}
                                    <Form.Item
                                      {...field}
                                      name={[field.name, 'invoiceTax']}
                                      className="addTeamHeight"
                                      style={{ width: '140px', marginTop: '19px', marginBottom: '22px'}}
                                      fieldKey={[field.fieldKey, 'invoiceTax']}
                                      initialValue={[]} 
                                    >
                                      <Select
                                        showSearch
                                        //onChange={(value) => handleTaxChange(value, index)}
                                        className="customselect-height custom-select"
                                        mode='multiple'
                                        placeholder="Select Tax"
                                        filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        optionFilterProp="children"
                                        notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
                                        dropdownRender={(menu) => (
                                          <>
                                            {menu}
                                          </>
                                        )}
                                        onChange={(e) => {
                                          calculateAmount(e, index, 'invoiceTax')
                                          handleTaxChange(e, index)
                                        }}
                                      >
                                        {allTaxSlabs?.map((tax) => (
                                          <Option key={tax._id} value={tax._id}>
                                            {tax.title}
                                          </Option>
                                        ))}
                                      </Select>
                                    </Form.Item>
                                  </td>
                                  <td>
                                    <Form.Item
                                      {...field}
                                      name={[field.name, 'taxPercent']}
                                      className='custom-border'
                                      style={{ marginTop: '19px', marginBottom: '22px'}}
                                      fieldKey={[field.fieldKey, 'taxPercent']}
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
                                      {/* {calculateTotalTaxPercent(taxes[index] || [])} % */}
                                    </Form.Item>
                                  </td>
                                  <td>
                                    {/* <input className="form-control" readOnly style={{width: '120px'}} type="text" /> */}
                                    <Form.Item
                                      {...field}
                                      name={[field.name, 'totalAmount']}
                                      className='custom-border'
                                      style={{ marginTop: '19px', marginBottom: '22px'}}
                                      fieldKey={[field.fieldKey, 'totalAmount']}
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
                    </div>)
                  }
                  {
                    tableLoader ?
                    null :
                    <div className="table-responsive">
                      <table className="table table-hover table-white">
                        <tbody>
                          <tr>
                            <td colSpan={5} className="text-end" style={{fontSize: '15px', fontWeight: '400'}}>
                              <Tooltip className="custom-tooltip" placement="rightBottom" title={(
                                <label>This amount is the sum of 'Amount' column of all the above rows before adding the Tax</label>
                              )}>
                                <span style={{border: '1px solid grey', color: 'grey', fontSize: '12px', borderRadius: '50%', padding: '1.5px 4px 1px', margin: '5px', cursor: 'pointer'}}>
                                {t('Tasks.Qmark')}
                                </span>
                              </Tooltip>
                              Total (Tax exclusive)</td>
                            <td style={{textAlign: 'right', paddingRight: '30px', width: '230px'}}>
                              {subTotalEx?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currencyIs}
                            </td>
                          </tr>
                          <tr>
                          <td colSpan={5} className="text-end" style={{fontSize: '15px', fontWeight: '400'}}>
                            <Tooltip className="custom-tooltip" placement="rightBottom" title={(
                              <label>This amount is the sum of 'Total Amount' column of all the above rows after adding the Tax</label>
                            )}>
                              <span style={{border: '1px solid grey', color: 'grey', fontSize: '12px', borderRadius: '50%', padding: '1.5px 4px 1px', margin: '5px', cursor: 'pointer'}}>
                              {t('Tasks.Qmark')}
                              </span>
                            </Tooltip>
                            Total (Tax inclusive)</td>
                            <td style={{textAlign: 'right', paddingRight: '30px', width: '230px'}}>
                              {subTotal?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} {currencyIs}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={5} className="text-end" style={{fontSize: '15px', fontWeight: '400'}}>Sales Tax</td>
                            <td style={{textAlign: 'right', paddingRight: '30px', width: '230px'}}>
                              <Form.Item
                                name="invoiceTaxSlabId"
                                className="addTeamHeight"
                                style={{marginBottom: '0px'}}
                                // className="custom-border"
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
                                  placeholder={t('finance.Invoices.selectTax')}
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
                            </td>
                          </tr>
                          <tr>
                            <td colSpan={5} className="text-end" style={{fontSize: '15px', fontWeight: '400'}}>Sales Tax %</td>
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
                            {t('finance.Invoices.discount')} %
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
                                      return Promise.reject(t('finance.Invoices.valueMustBeBetweenZeroAndHundred'));
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
                            {t('finance.Invoices.grandtotal')}
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
                  }
                  <div className="row">
                    <div className="col-md-12">
                      {/* <div className="form-group">
                        <label>Other Information</label>
                        <textarea className="form-control" defaultValue={""} />
                      </div> */}
                      <div className="form-group">
                        <label>
                        {t('finance.Invoices.otherinformation')} <span className="text-danger">{'* '}</span>
                          <span className="time" style={{fontSize: '12px', color: '#9e9e9e'}}>( {wordCount?.length} / 150 ) </span>
                        </label>
                        <Form.Item
                          name='otherInformation'
                          className='custom-border'
                          rules={[
                            {
                              whitespace: true,
                              required: true,
                              validator: (_, value) => {
                                if(!value || value.trim() === ''){
                                  return Promise.reject(t('finance.Invoices.pleaseenterotherinformation'));
                                }
                                else if (/\s{2,}/.test(value)) {
                                  return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                                }
                                return Promise.resolve();
                              },
                            },
                            ]}
                        >
                          <Input.TextArea className="form-control" maxLength={150} onChange={(e) => setWordCount(e.target.value)} />
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
                      : t('finance.Invoices.saveAndSend')
                  }
                </button>
                <button className="btn btn-primary submit-btn" onClick={() => setSaveType('save') } disabled={saveLoader}>
                  {
                    saveLoader ? <Spin size="small" indicator={antIcon} />
                      : t('holiday.save')
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
