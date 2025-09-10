import React, { useEffect, useState } from "react";
import PhoneNoInput from "../../../Components/PhoneNoInput/index.jsx";
import { Button, Form, Input, Spin, Upload, message, Select, Empty, Tooltip } from "antd";
import { useSelector } from "react-redux";
import { apiServices } from "../../../Services/apiServices.js";
import { LoadingOutlined } from '@ant-design/icons';
import ImgCrop from "antd-img-crop";
import { apiUploadToS3 } from "../../../Services/uploadImage.js";
import { user_icon } from "../../../Entryfile/imagepath.jsx";
import { getAllISOCodes } from 'iso-country-currency';
import { useTranslation } from "react-i18next";

const Company = () => {
  const user_state = useSelector((state) => state.user.loginvalue);
  const { t, i18n } = useTranslation();
  const [form] = Form.useForm();
  const [allValues, setAllValues] = useState({});
  const [data, setData] = useState({});
  const [loader, setLoader] = useState(false)
  const [imageLoader, setImageLoader] = useState(false)
  const [image, setImage] = useState('')
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [absentDeduction, setAbsentDeduction] = useState();
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [loadingLocations, setLoadingLocations] = useState(false);

  useEffect(() => {
    getCompanyData();
    getAllCurrencies();
    fetchEmployees();
    fetchCountries();
  }, []);

  const getCompanyData = () => {
    apiServices("GET", "company/viewmycompanyinfo", null, user_state)
      .then((res) => {
        if (res?.data?.success === true) {
          form.setFieldsValue(res?.data?.companyInfo);
          setData(res?.data?.companyInfo);
          setAbsentDeduction(
            res?.data?.companyInfo?.absentDeduction === true ? true : false
          );
          //setAbsentDeduction(res?.data?.companyInfo?.absentDeduction && res?.data?.companyInfo?.absentDeduction == true ? true : false)
        }
      })
      .catch((err) => {
        // console.log(err);
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('settings.companySettings.companyInfoError')
          }`
        );
      });
  };

  const fetchEmployees = () => {
    apiServices("GET", `user/all-employees`, null, user_state)
      .then((res) => {
        if (res.data.success === true) {
          const emps = res?.data?.User;
          const sortedData = emps?.slice().sort((a, b) => a.fullName.localeCompare(b.fullName));
          setEmployees(sortedData);
        }
      })
      .catch((err) => {
        message.error(
          `${
            err?.response?.data?.msg
              ? err?.response?.data?.msg
              : err?.response?.data?.validation?.body?.message
              ? err?.response?.data?.validation?.body?.message
              : t('aAttend.errors.getEmployeesError')
          }`
        );
      });
  };

  const getTeamMemberOptions = () => {
    return employees?.map((employee) => (
      <Select.Option key={employee._id} value={employee._id}>
        {employee.fullName}
      </Select.Option>
    ));
  };

  const onHandleChange = (type, value) => {
    if (type === "companyPhoneNo" || type === "mobileNumber" || type === "fax") {
      let newvalue = value ? "+" + value : "";

      const updatedValues = {
        [type]: `${newvalue}`,
      };

      form.setFieldsValue(updatedValues);
      setAllValues({
        ...allValues,
        [type]: `${newvalue}`,
      });
    } else {
      const updatedValues = {
        [type]: `${value}`,
      };

      form.setFieldsValue(updatedValues);
      setAllValues({
        ...allValues,
        [type]: `${value}`,
      });
    }
  };

  const onFinish = (values) => {
    setLoader(true)
    let new_data = {
      ...values,
      _id: data?._id,
      agreeTermsAndConditions: true,
      absentDeduction : absentDeduction
    };

    apiServices("PUT", "company/updatecompany", new_data, user_state)
    .then((res) => {
      if (res?.data?.success === true) {
        setLoader(false)
        message.success(t('settings.companySettings.companySettingsUpdated'));
      }
    })
    .catch((err) => {
      // console.log(err);
      setLoader(false)
      message.error(
        `${
          err?.response?.data?.msg
            ? err?.response?.data?.msg
            : err?.response?.data?.validation?.body?.message
            ? err?.response?.data?.validation?.body?.message
            : t('settings.companySettings.updateCompanyInfoError')
        }`
      );
    });
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

  const numericPattern = new RegExp(/^[0-9]*$/);

  const isValidEmail = (email) => {
    // Regular expression to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  const allowedFileTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const beforeUpload = (file) => {
    const isFileTypeAllowed = allowedFileTypes.includes(file.type);

    if (!isFileTypeAllowed) {
      message.error(t('allEmp.errors.fileTypeNotAllowed'));
      return false;
    }

    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    const isSizeAllowed = file.size <= maxSizeInBytes;

    if (!isSizeAllowed) {
      message.error(t('allEmp.errors.fileSizeTooLarge'));
      return false;
    }

    return true;

    // const isFileTypeAllowed = allowedFileTypes.includes(file.type);
    // if (!isFileTypeAllowed) {
    //   message.error('You can only upload PNG, JPG, or JPEG files!');
    // }
    // return isFileTypeAllowed;
  };

  const onImageUpload = (imagedata) => {
    setImageLoader(true)
    apiUploadToS3(imagedata).then((res) => {
        console.log(res?.data?.result);
        form.setFieldsValue({imageUrl: res?.data?.result?.secure_url})
        setImage(res?.data?.result?.secure_url)
        setImageLoader(false)
      }
      ).catch((err)=>{
        setImageLoader(false)
        message.error(
            `${
              err?.response?.data?.msg
                ? err?.response?.data?.msg
                : err?.response?.data?.validation?.body?.message
                ? err?.response?.data?.validation?.body?.message
                : t('allEmp.errors.uploadImageError')
            }!`
          );
      })
  }

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

  const fetchCountries = async () => {
    setLoadingLocations(true);
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries');
      const data = await response.json();
      if (data.data) {
        const formattedCountries = data.data.map(country => ({
          value: country.country,
          label: country.country
        }));
        setCountries(formattedCountries);
      }
    } catch (error) {
      message.error(t('settings.companySettings.errorFetchingCountries'));
    }
    setLoadingLocations(false);
  };

  const fetchStates = async (country) => {
    setLoadingLocations(true);
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country }),
      });
      const data = await response.json();
      if (data.data?.states) {
        const formattedStates = data.data.states.map(state => ({
          value: state.name,
          label: state.name
        }));
        setStates(formattedStates);
      }
    } catch (error) {
      message.error(t('settings.companySettings.errorFetchingStates'));
    }
    setLoadingLocations(false);
  };

  const fetchCities = async (country, state) => {
    setLoadingLocations(true);
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ country, state }),
      });
      const data = await response.json();
      if (data.data) {
        const formattedCities = data.data.map(city => ({
          value: city,
          label: city
        }));
        setCities(formattedCities);
      }
    } catch (error) {
      message.error(t('settings.companySettings.errorFetchingCities'));
    }
    setLoadingLocations(false);
  };

  const handleCountryChange = (value) => {
    form.setFieldsValue({ state: undefined, city: undefined });
    setSelectedCountry(value);
    setSelectedState(null);
    setStates([]);
    setCities([]);
    if (value) {
      fetchStates(value);
    }
  };

  const handleStateChange = (value) => {
    form.setFieldsValue({ city: undefined });
    setSelectedState(value);
    setCities([]);
    if (value && selectedCountry) {
      fetchCities(selectedCountry, value);
    }
  };

  // Add this new effect to handle initial data loading
  useEffect(() => {
    if (data?.country) {
      setSelectedCountry(data.country);
      fetchStates(data.country).then(() => {
        if (data?.state) {
          setSelectedState(data.state);
          fetchCities(data.country, data.state);
        }
      });
    }
  }, [data]);

  return (
    <div>
      <div>
        {/* <h6 className="card-title m-b-20">Module Access</h6>
               {/* Page Header */}
        <div className="page-header">
          <div className="row pt-3 pb-3">
            <div className="col-sm-12">
              <h3 className="page-title">{t('settings.companySettings.companySettings')}</h3>
            </div>
          </div>
        </div>
        <Form
          form={form}
          name="control-hooks"
          onFinish={onFinish}
          onFinishFailed={({errorFields}) => {
            const consecutiveSpacesError = errorFields.find(field => field.errors.toString().includes('consecutive spaces'));
            if(consecutiveSpacesError){
              message.error(t('allEmp.errors.removeConsecutiveSpaces'))
           }else{
              message.error(t('allEmp.errors.fillRequiredFields'))
            } 
          }}
        >
          <div className="row">
          <Form.Item
                        name='imageUrl'
                        className='custom-border'
                    >   
                        <div className="profile-img-wrap edit-img">
                            {
                                imageLoader ? <div className="uploadImgSpinContainer"> <Spin /> </div> :
                                <>
                                    <img className="inline-block" src={image ? image : data?.imageUrl ? data?.imageUrl : user_icon} alt="user" />
                                    <div className="fileupload btn">
                                    <ImgCrop
                                        cropShape='round'
                                        quality={1}
                                        modalTitle='Crop Image'
                                        modalOk='Apply'
                                        modalClassName='CropImageModalStyle'
                                        beforeCrop={beforeUpload}
                                    >
                                        <Upload
                                            // action={(image) => onImageUpload(image)}
                                            customRequest={({ file, onSuccess, onError }) => {
                                              onImageUpload(file)
                                            }}
                                            fileList={null}
                                            maxCount={1}
                                        >
                                            <div className="btn-text" style={{width: '80px', padding: '4px'}}>{t('edit1')}</div>
                                        </Upload>
                                    </ImgCrop>
                                    </div>
                                </>
                            }
                        </div>
                    </Form.Item>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                {t('settings.companySettings.companyName')} <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="companyName"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if (value.trim() === '') {
                          return Promise.reject(t('settings.companySettings.pleaseEnterCompanyName'));
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                        } else if (value.length < 3) {
                          return Promise.reject(t('settings.minLength', { name: t('settings.companySettings.companyName') }));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.companyName}
                  />
                  <input
                    className="form-control inputWordSpacing"
                    defaultValue={data ? data?.companyName : ""}
                    onInput={(e) => {
                      onHandleChange("companyName", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                {t('settings.companySettings.legalName')} <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="legalName"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if(value.trim() === ''){
                          return Promise.reject(t('settings.companySettings.pleaseEnterLegalName'));
                        }
                        else if (/\s{2,}/.test(value)) {
                          return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message: t('settings.minLength2', { name: t('settings.companySettings.legalName') }),
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.legalName}
                  />
                  <input
                    className="form-control inputWordSpacing"
                    defaultValue={data ? data?.legalName : ""}
                    onInput={(e) => {
                      onHandleChange("legalName", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                {t('settings.companySettings.contactPerson')} <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="contactPerson"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if(value.trim() === ''){
                          return Promise.reject(t('settings.companySettings.pleaseEnterContactName'));
                        }
                        else if (/\s{2,}/.test(value)) {
                          return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message: t('settings.minLength2', { name: t('settings.companySettings.contactPerson') }),
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.contactPerson}
                  />
                  <input
                    className="form-control inputWordSpacing"
                    defaultValue={data ? data?.contactPerson : ""}
                    onInput={(e) => {
                      onHandleChange("contactPerson", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                {t('settings.companySettings.finance')} <span className="text-danger">*</span>
                  <Tooltip className="custom-tooltip" placement="rightBottom" title={(
                      <label>{t('settings.companySettings.financeInstruction')}</label>
                  )}>
                      <span style={{border: '1px solid grey', color: 'grey', fontSize: '12px', borderRadius: '50%', padding: '1.5px 4px 1px', margin: '5px', cursor: 'pointer'}}>
                      {t('Tasks.Qmark')}
                      </span>
                  </Tooltip>
                </label>
                <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="financeHead"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('finance.expenses.pleaseSelectFinanceHead'),
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          // onSearch={(val) => {
                          //   showTeamSearch(val, 'Team')
                          //   // onTeamChange(val)
                          // }}
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
                          className="custom-select custom-normal"
                          placeholder={t('selectFinanceHead')}
                          //onChange={(values) => setSelectedTeamMembers(values)}
                        >
                          {getTeamMemberOptions()}
                        </Select>
                      </Form.Item>
                    </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                STRN/TRN/NTN
                </label>
                <Form.Item
                  name="taxRegNo"
                  rules={[
                    {
                      whitespace: false,
                      required: false,
                      validator: (_, value) => {
                        if (/\s{2,}/.test(value)) {
                          return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 2,
                      message: 'STRN/TRN must be atleast 2 characters long',
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.taxRegNo}
                  />
                  <input
                    className="form-control inputWordSpacing"
                    defaultValue={data ? data?.taxRegNo : ""}
                    onInput={(e) => {
                      onHandleChange("taxRegNo", e.target.value);
                    }}
                    maxLength={20}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                {t('settings.companySettings.address')} <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="companyAddress"
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
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.companyAddress}
                  />
                  <input
                    className="form-control inputWordSpacing"
                    defaultValue={data ? data?.companyAddress : ""}
                    onInput={(e) => {
                      onHandleChange("companyAddress", e.target.value);
                    }}
                    maxLength={150}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                {t('settings.companySettings.preferredCurrency')} <span className="text-danger">*</span>
                </label>
                <div style={{ position: "relative" }} id="area">
                      <Form.Item
                        name="preferredCurrency"
                        className="custom-border"
                        rules={[
                          {
                            required: true,
                            message: t('finance.expenses.pleaseSelectCurrency'),
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          className="custom-select custom-normal"
                          getPopupContainer={() =>
                            document.getElementById("area")
                          }
                          placeholder={t('projectScreen.Modal.selectCurrency')}
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
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                {t('settings.companySettings.postalCode')} <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="postalCode"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: t('settings.companySettings.pleaseEnterPostalCode'),
                    },
                    // ({ getFieldValue }) => ({
                    //   validator(rule, value) {
                    //     if (getFieldValue("postalCode")?.length <= 2) {
                    //       if(numericPattern.test(getFieldValue("postalCode"))){
                    //         return Promise.reject(
                    //           "postal code length must be at least 3 characters long"
                    //         );
                    //       }
                    //       return Promise.reject(
                    //         "Please enter only numbers"
                    //       );
                    //     }else if(numericPattern.test(getFieldValue("postalCode"))) {
                    //       return Promise.resolve();
                    //     }
                    //     return Promise.reject(
                    //       "Please enter only numbers"
                    //     );
                    //   },
                    // }),
                    {
                      min: 3,
                      message: t('settings.digitLength', { name: t('settings.companySettings.postalCode') }),
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.postalCode}
                  />
                  <input
                    className="form-control inputWordSpacing"
                    defaultValue={data ? data?.postalCode : ""}
                    onInput={(e) => {
                      onHandleChange("postalCode", e.target.value);
                    }}
                    onKeyPress={(e) => {
                      if ( ((e.which < 48 || e.which > 57)) ) {
                        e.preventDefault();
                      }
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                {t('settings.companySettings.country')} <span className="text-danger">*</span>
                </label>
                <div style={{ position: "relative" }} id="area">
                <Form.Item
                  name="country"
                  className="custom-border"
                  rules={[
                    {
                      required: true,
                      message: t('settings.companySettings.pleaseSelectCountry')
                    }
                  ]}
                >
                  <Select
                    showSearch
                    placeholder={t('settings.companySettings.selectCountry')}
                    loading={loadingLocations}
                    onChange={handleCountryChange}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    options={countries}
                    style={{ width: '100%' }}
                    className="custom-select custom-normal"
                  />
                </Form.Item>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                {t('settings.companySettings.state')} <span className="text-danger">*</span>
                </label>
                <div style={{ position: "relative" }} id="area">
                <Form.Item
                  name="state"
                  className="custom-border"
                  rules={[
                    {
                      required: true,
                      message: t('settings.companySettings.pleaseSelectState')
                    }
                  ]}
                >
                  <Select
                    showSearch
                    placeholder={t('settings.companySettings.selectState')}
                    loading={loadingLocations}
                    onChange={handleStateChange}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    options={states}
                    disabled={!selectedCountry}
                    style={{ width: '100%' }}
                    className="custom-select custom-normal"
                    onFocus={() => {
                      if (selectedCountry && states.length === 0) {
                        fetchStates(selectedCountry);
                      }
                    }}
                  />
                </Form.Item>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                {t('settings.companySettings.city')} <span className="text-danger">*</span>
                </label>
                <div style={{ position: "relative" }} id="area">
                <Form.Item
                  name="city"
                  className="custom-border"
                  rules={[
                    {
                      required: true,
                      message: t('settings.companySettings.pleaseSelectCity')
                    }
                  ]}
                >
                  <Select
                    showSearch
                    placeholder={t('settings.companySettings.selectCity')}
                    loading={loadingLocations}
                    filterOption={(input, option) =>
                      option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    options={cities}
                    disabled={!selectedState}
                    style={{ width: '100%' }}
                    className="custom-select custom-normal"
                    onFocus={() => {
                      if (selectedCountry && selectedState && cities.length === 0) {
                        fetchCities(selectedCountry, selectedState);
                      }
                    }}
                  />
                </Form.Item>
                </div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                {t('settings.companySettings.companyEmail')} <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="companyEmail"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if (value.trim() === '') {
                          return Promise.reject(t('settings.companySettings.pleaseEnterCompanyEmail'));
                        } else if (/\s{2,}/.test(value)) {
                          return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                        } else if (!isValidEmail(value)) {
                          return Promise.reject(t('settings.companySettings.validEmail'));
                        }
                        return Promise.resolve();
                      },
                    },
                    // {
                    //   whitespace: true,
                    //   required: true,
                    //   validator: (_, value) => {
                    //     if(value.trim() === ''){
                    //       return Promise.reject("please enter company email");
                    //     }
                    //     else if (/\s{2,}/.test(value)) {
                    //       return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                    //     }
                    //     return Promise.resolve();
                    //   },
                    // },
                    // {
                    //   type: "email",
                    //   message: "Please enter a valid email",
                    // },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.companyEmail}
                  />
                  <input
                    className="form-control inputWordSpacing"
                    defaultValue={data ? data?.companyEmail : ""}
                    onInput={(e) => {
                      onHandleChange("companyEmail", e.target.value);
                    }}
                    maxLength={60}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                {t('settings.companySettings.registrationNo')} <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="companyRegistrationNo"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if(value.trim() === ''){
                          return Promise.reject(t('settings.companySettings.pleaseEnterRegistrationNo'));
                        }
                        else if (/\s{2,}/.test(value)) {
                          return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message: t('settings.minLength', { name: t('settings.companySettings.registrationNo') }),
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.companyRegistrationNo}
                  />
                  <input
                    className="form-control inputWordSpacing"
                    defaultValue={data ? data?.companyRegistrationNo : ""}
                    onInput={(e) => {
                      onHandleChange("companyRegistrationNo", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                {t('settings.companySettings.phoneNumber')} <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="companyPhoneNo"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: t('settings.companySettings.pleaseEnterPhoneNumber'),
                    },
                    {
                      min: 5,
                      message: t('settings.phoneLength', { name: t('settings.companySettings.phoneNumber') }),
                    },
                  ]}
                >
                  <Input style={{ display: "none" }} />
                  <PhoneNoInput
                    onChangePhone={(value) => {
                      onHandleChange("companyPhoneNo", value);
                    }}
                    phone={data ? data?.companyPhoneNo : ""}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                {t('settings.companySettings.mobileNumber')} <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="mobileNumber"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      message: t('settings.companySettings.pleaseEnterMobileNumber'),
                    },
                    {
                      min: 5,
                      message: t('settings.phoneLength', { name: t('settings.companySettings.mobileNumber') }),
                    },
                  ]}
                >
                  <Input style={{ display: "none" }} />
                  <PhoneNoInput
                    onChangePhone={(value) => {
                      onHandleChange("mobileNumber", value);
                    }}
                    phone={data ? data?.mobileNumber : ""}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                {t('settings.companySettings.website')} <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="website"
                  rules={[
                    {
                      whitespace: true,
                      required: true,
                      validator: (_, value) => {
                        if(value.trim() === ''){
                          return Promise.reject(t('settings.companySettings.pleaseEnterWebsite'));
                        }
                        else if (/\s{2,}/.test(value)) {
                          return Promise.reject(t('allEmp.errors.removeConsecutiveSpaces2'));
                        }
                        return Promise.resolve();
                      },
                    },
                    {
                      min: 3,
                      message: t('settings.minLength2', { name: t('settings.companySettings.website') }),
                    },
                  ]}
                >
                  <Input
                    style={{ display: "none" }}
                    value={allValues?.website}
                  />
                  <input
                    className="form-control inputWordSpacing"
                    defaultValue={data ? data?.website : ""}
                    onInput={(e) => {
                      onHandleChange("website", e.target.value);
                    }}
                    maxLength={50}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                {t('settings.companySettings.fax')} <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="fax"
                  rules={[
                    {
                      min: 5,
                      message: t('settings.phoneLength', { name: t('settings.companySettings.fax') }),
                    },
                  ]}
                >
                  <Input style={{ display: "none" }} />
                  <PhoneNoInput
                    onChangePhone={(value) => {
                      onHandleChange("fax", value);
                    }}
                    phone={data ? data?.fax : ""}
                  />
                </Form.Item>
              </div>
            </div>
            <div
              className="col-sm-12"
            >
              <div
                className="form-group"
                style={{ marginBottom: "6px", marginTop: "0px" }}
              >
                <Form.Item name="absentDeduction">
                  <div style={{ display: "flex", height: "25px" }}>
                    <Input style={{ display: "none" }} value={absentDeduction} />
                    <input
                      className="form-check-input customCheckbox"
                      type="checkbox"
                      checked={absentDeduction} // Control the checkbox using state
                      onChange={(e) => {
                        setAbsentDeduction(e.target.checked); // Update the state when the checkbox is checked/unchecked
                      }}
                      id="flexCheckChecked"
                      style={{ width: "23px", height: "23px" }}
                    />
                    <label style={{ marginTop: "5px", marginLeft: "15px", fontSize: "15px" }}>
                      Absent Fine Deduction
                    </label>
                  </div>
                </Form.Item>
              </div>
            </div>
          </div>
          {/* <div className="submit-section">
              <button className="btn btn-primary submit-btn">Submit</button>
            </div> */}
          <div className="submit-section">
            {/* <button className="btn btn-primary submit-btn">Save</button> */}
            <Form.Item>
              <Button htmlType="submit" className="btn btn-primary submit-btn" disabled={loader}>
                {
                  loader ? <Spin size="small" indicator={antIcon} />
                    : t('settings.saveChanges')
                }
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Company;