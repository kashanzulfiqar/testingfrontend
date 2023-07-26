/**
 * Signin Firebase
 */

import React, {useEffect, useState} from 'react';
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';
import {Applogo} from '../Entryfile/imagepath.jsx'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup';
import  { alphaNumericPattern, emailrgx } from '../constant'
import { Button, Steps, message } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import DaftarProLogo from '../files/Icons/DaftraProLogo.svg'
import SuccessIcon from '../files/Icons/SuccessIcon.svg'
import PhoneNoInput from '../Components/PhoneNoInput/index.jsx';

import Select from 'react-select';
import styled from 'styled-components';

const options = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];


const schema = yup
  .object({
  
    email: yup
      .string()
      .matches(emailrgx, 'Email is required')
      .required('Email is required')
      .trim(),
	  password: yup.string() .min(6)
	  .max(6) .required ('Password is required')
	  .trim(),

	  repeatPassword:  yup.string() .required('ConfirmPassword is required').trim(),
  })
  .required()

const Registrationpage = (props) => {

	/**
	 * On User Login
	 */
   const[eye,seteye]=useState(true);
   const [emailerror,setEmailError] = useState("");
  const [nameerror,setNameError] = useState("");
   const [passworderror,setPasswordError] = useState("");
   const [formgroup,setFormGroup] = useState("");
   const [inputValues,setInputValues] = useState({
   email:"admin@dreamguys.co.in",
   password:"123456",
   });

    const {
      handleSubmit,
      control,
      setError,
      clearErrors,
      formState: { errors },
      } = useForm({
      resolver: yupResolver(schema),
      })
      
    const  onSubmit = (data) => {
    console.log("data", data)
      
    if(data.password != "123456") {
    setError('password', {
      message: 'password is mismatch',
    })
    } else {
    clearErrors('password')
    props.history.push('login') 
    
    }
    }
    const onEyeClick = () =>{
    seteye(!eye)
    }
      const onUserLogin = e => {
          e.preventDefault();
          
          if (this.state.email !== '' && this.state.password !== '') {
            this.props.signinUserInFirebase(this.state, this.props.history);

            
          }
        }

    const onApplyJob = e => {
        e.preventDefault();
        localStorage.removeItem('jobview')
        this.props.history.push('/applyjob/joblist')
    }
    const CompanyRegisterHandler = (e) => {
      e.preventDefault();
      console.log('e======',e);
    }

    const [adminRegister, setAdminRegister] = useState({ password: ''})
    const onInputChange = (val, type) => {
      setAdminRegister({ ...adminRegister, [type]: val })
    }

    const calculateStrength = () => {
      // const strengthPercentage = (adminRegister?.password?.length / 10) * 100; // Example: Assume maximum strength is achieved when the password length is 10 characters
      // return strengthPercentage;
      let stre = 0;
    const regexUpper = /[A-Z]/;
    const regexLower = /[a-z]/;
    const regexSpecialChar = /[!@#$%^&*()\-=_+[\]{};':"\\|,.<>/?]/;
    const regexNum = /\d/;

    if(adminRegister?.password.length >= 8){
      stre += 20;
    }
    if(regexLower.test(adminRegister?.password)){
      stre += 10;
    }
    if(regexUpper.test(adminRegister?.password)){
      stre += 20;
    }
    if(regexSpecialChar.test(adminRegister?.password)){
      stre += 30;
    }
    if(regexNum.test(adminRegister?.password)){
      stre += 20;
    }
    return stre;
    };

    // ----------------- custom select ------------------
    const [selectedOption, setSelectedOption] = useState(null);

    const handleSelectChange = (selectedOption) => {
      setSelectedOption(selectedOption);
      console.log('selectedOption', selectedOption.value);
    };

    const customStyles = {
      control: (provided) => ({
        ...provided,
        backgroundColor: '#fbfbfb',
        border: '1px solid #e3e3e3',
        height: '46px',
        borderRadius: '4px',
        paddingInline: '2px',
        boxShadow: 'none',
        cursor: 'pointer'
      }),
      option: (provided, { isFocused, isSelected }) => ({
        ...provided,
        backgroundColor: isSelected ? '#ff9b44' : isFocused ? 'white' : 'white',
        color: isSelected ? 'white' : 'black',
        ':hover': {
          backgroundColor: '#ffdbbb',
          color: 'black',
          cursor: 'pointer',
        },
      }),
      singleValue: (provided) => ({
        ...provided,
        // padding: '70px',
      }),
      indicatorSeparator: () => ({ display: 'none' }),
      // Add any other custom styles as needed
    };



    const steps = [
      {
        title: 'Enter Company Details',
        content: 
          <form className='mt-5' onSubmit={(e) => {
            e.preventDefault();
            console.log('clicked');
          }}>
            <div className="row">
              <div className="col-sm-6">
                <div className="form-group">
                  <label className="col-form-label">Company Name <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label className="col-form-label">Legal Name <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label className="col-form-label">Contact Person <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label className="col-form-label">Address <span className="text-danger">*</span></label>
                  <input className="form-control" type="email" />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label className="col-form-label">Postal Code <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label className="col-form-label">City <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label className="col-form-label">State <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label className="col-form-label">Country <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label className="col-form-label">Company Email <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label className="col-form-label">Registration No <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label className="col-form-label">Phone Number <span className="text-danger">*</span></label>
                  <PhoneNoInput
                    // onChangePhone={(value) => {
                    //   onHandleChange("contactNo", value)
                    // }}
                    // onCountryChange={(val) => {
                    //   onHandleChange("contactNo", `${val}`);
                    // }}
                    // phone={state ? formData.contactNo : postformData.contactNo}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label className="col-form-label">Mobile Number <span className="text-danger">*</span></label>
                  <PhoneNoInput
                    // onChangePhone={(value) => {
                    //   onHandleChange("contactNo", value)
                    // }}
                    // onCountryChange={(val) => {
                    //   onHandleChange("contactNo", `${val}`);
                    // }}
                    // phone={state ? formData.contactNo : postformData.contactNo}
                  />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label className="col-form-label">Website <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" />
                </div>
              </div>
              <div className="col-sm-6">
                <div className="form-group">
                  <label className="col-form-label">Fax <span className="text-danger">*</span></label>
                  <input className="form-control" type="text" />
                </div>
              </div>
            </div>
            {/* <div className="submit-section">
              <button className="btn btn-primary submit-btn">Submit</button>
            </div> */}
            <div className="form-group text-center mt-2">                  
              <button className="btn btn-primary account-btn" type="submit" onClick={(e) => {
                  e.preventDefault();
                  console.log('clicked2');
                  next()
                }}>Next</button>
            </div> 
          </form>  
      },
      {
        title: 'Create Admin Account',
        content: 
        <form className='mt-5'>
                   <div className="row">
                     <div className="col-sm-6">
                       <div className="form-group">
                         <label className="col-form-label">Full Name <span className="text-danger">*</span></label>
                         <input className="form-control" type="text" />
                       </div>
                     </div>
                     <div className="col-sm-6">  
                       <div className="form-group">
                         <label className="col-form-label">Date Of Birth <span className="text-danger">*</span></label>
                         <div><input className="form-control datetimepicker" type="date" /></div>
                       </div>
                     </div>
                     <div className="col-sm-6">
                       <div className="form-group d-grid">
                         <label className="col-form-label">Gender <span className="text-danger">*</span></label>
                         {/* <select className="form-control"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23333333'%3E%3Cpath d='M10 14l6-6H4l6 6z'/%3E%3C/svg%3E")`, // Replace with the URL of your custom arrow icon or use a data URI
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right center',
                            backgroundSize: '35px 17px',
                            appearance: 'none', // Remove default select arrow icon
                            cursor: 'pointer',
                          }}
                         >
                           <option value="male">Male</option>
                           <option value='female'>Female</option>
                         </select> */}
                         {/* <Select
                          value={selectedOption}
                          // className='form-control'
                          onChange={handleSelectChange}
                          options={options}
                          isSearchable={false}
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              padding: '10px',
                              // Add other custom styles for the control component
                            }),
                            option: (provided) => ({
                              ...provided,
                              // Add custom styles for the options
                            }),
                            singleValue: (provided) => ({
                              ...provided,
                              // Add custom styles for the selected value
                              // padding: '70px',
                            }),
                          }}
                        /> */}
                        <Select
                          value={selectedOption}
                          onChange={handleSelectChange}
                          options={options}
                          isSearchable={false}
                          styles={customStyles}
                          placeholder="Select"
                        />
                       </div>
                     </div>
                     <div className="col-sm-6">
                       <div className="form-group">
                         <label className="col-form-label">Phone Number <span className="text-danger">*</span></label>
                         <PhoneNoInput
                          // onChangePhone={(value) => {
                          //   onHandleChange("contactNo", value)
                          // }}
                          // onCountryChange={(val) => {
                          //   onHandleChange("contactNo", `${val}`);
                          // }}
                          // phone={state ? formData.contactNo : postformData.contactNo}
                        />
                       </div>
                     </div>
                     <div className="col-sm-6">
                       <div className="form-group">
                         <label className="col-form-label">Email Address <span className="text-danger">*</span></label>
                        <input className="form-control" type="email" />
                       </div>
                     </div>
                     <div className="col-sm-6">
                       <div className="form-group">
                         <label className="col-form-label">Password <span className="text-danger">*</span></label>
                         <div className="pass-group password-eye">
                            <input
                              type={eye ? "password" : "text"}
                              className={`form-control passwordStyle ${passworderror ? 'is-invalid' : ''}`}
                              onChange={(e) => onInputChange(e.target.value, 'password')}
                              value={adminRegister?.password}
                            />
                            {/* <input type={eye ? "password" : "text"} className={`form-control  ${errors?.password ? "error-input" : ""}`} value={password} onChange={e => SetPassword(e.target.value)} autoComplete="false" /> */}
                            <span onClick={onEyeClick} style={{cursor: 'pointer', top: '12px'}} className={`toggles-password fa toggle-password`}>
                            {
                              eye ? <EyeInvisibleOutlined style={{color: '#666666', fontSize: '20px'}} /> :
                              <EyeOutlined style={{color: '#666666', fontSize: '20px'}} />
                            }
                            </span>
                            {/* <span onClick={onEyeClick} style={{cursor: 'pointer'}} className={`toggles-password fa toggle-password ${eye ? "fa-light fa-eye-slash" : "fa-light fa-eye"} `} /> */}
                          </div>
                          <div className="strength-bar-back"></div>
                          <div className="strength-bar-main" style={{ width: `${calculateStrength() > 100 ? 100 : calculateStrength()}%`, backgroundImage: `linear-gradient(to right, #F3C652 0%, #F3C652 94%, transparent 50%)` }}></div>
                          {/* <div className="strength-bar" style={{ width: `${calculateStrength()}%`, backgroundImage: 'linear-gradient(to right, #F3C652 0%, #F3C652 94%, transparent 50%)' }}></div> */}
                       </div>
                     </div>

                     <div className="col-sm-12">
                       <div className="form-group d-flex gap-3" style={{marginBottom: '15px', marginTop: '-10px'}}>
                         <input className="form-check-input customCheckbox" type="checkbox" value="agreement" id="flexCheckChecked" style={{width: '23px', height: '23px'}}></input>
                         <p style={{marginTop: '5px'}}>I agree to the term of services and privacy policy</p>
                       </div>
                     </div>
                     
                   </div>
                   {/* <div className="submit-section">
                     <button className="btn btn-primary submit-btn">Submit</button>
                   </div> */}
                   <div className="form-group text-center">                  
                      <button className="btn btn-primary account-btn" type="submit">Register</button>
                    </div> 
                 </form>
      },
    ];
  
    const [current, setCurrent] = useState(0);
    const [successSection, setSuccessSection] = useState(false);
    const next = () => {
      setCurrent(current + 1);
    };
    const prev = () => {
      setCurrent(current - 1);
    };

    const items = steps.map((item, index) => ({
      key: item.title,
      title: item.title,
      description: item.content,
      status: index === current ? 'process' : index < current ? 'finish' : 'wait',
    }));

      const { loading } = props;
      return (
            
            <>
              <Helmet>
                  <title>Register - DaftarPro</title>
                  <meta name="description" content="Login page"/>					
            </Helmet> 
        <div className="account-content">
          {/* <Link to="/applyjob/joblist" className="btn btn-primary apply-btn">Apply Job</Link> */}
          <div className="container">
            {/* Account Logo */}
            <div className="account-logo pt-3 pb-2">
              <Link to="/"><img src={DaftarProLogo} alt="DaftarPro" /></Link>
            </div>
            {/* /Account Logo */}
            {
              !successSection ? 
              <div className="account-box" style={{width: '100%',maxWidth: '850px', height: 'auto', paddingInline: '55px'}}>
                <div className="account-wrapper">
                  <h3 className="account-title" style={{padding: '17px 0px 40px 0px'}}>Register</h3>
                  {/* <p className="account-subtitle">Access to our dashboard</p> */}
                  {/* Account Form */}
                  <div>

                  <Steps current={current} labelPlacement="vertical" size='small'> 
                    {items.map((step, index) => (
                      <Steps.Step key={step.title} title={step.title} className={step.status === 'process' ? 'process-step' : ''} />
                    ))}
                  </Steps>
                  <div>{steps[current].content}</div>

                  {/* <div
                    style={{
                      marginTop: 24,
                    }}
                  >
                    {current < steps.length - 1 && (
                      <Button type="primary" onClick={() => next()}>
                        Next
                      </Button>
                    )}
                    {current === steps.length - 1 && (
                      <Button type="primary" onClick={() => message.success('Processing complete!')}>
                        Done
                      </Button>
                    )}
                    {current > 0 && (
                      <Button
                        style={{
                          margin: '0 8px',
                        }}
                        onClick={() => prev()}
                      >
                        Previous
                      </Button>
                    )}
                  </div> */}


                  {/* <form onSubmit={handleSubmit(onSubmit)}>
                      <div className="form-group">
                        <label>Email</label>
                        <Controller
                            name="email"
                            control={control}
                            render={({ field: { value, onChange } }) => (
                              <input   className={`form-control  ${errors?.email ? "error-input" : "" }`} type="text" value={value} onChange={onChange} autoComplete="false"  />

                            )}
                            defaultValue="admin@dreamguys.co.in"
                            />
                          
                          <small>{errors?.email?.message}</small>
                      </div>
                      <div className="form-group">
                        <label>Password</label>
                        <Controller
                        name="password"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                          <div className="pass-group">
                            <input  type={eye ? "password" : "text"}  className={`form-control  ${errors?.password? "error-input" : "" }`}  value={value} onChange={onChange} autoComplete="false"  />
                            <span onClick={onEyeClick} className={`fa toggle-password" ${eye ? "fa-eye-slash" : "fa-eye" }`}/>
                          </div>
                        )}
                        defaultValue="123456"
                        />
                          
                        <small>{errors?.password?.message}</small>                   
                      </div>
                      <div className="form-group">
                        <label>Repeat Password</label>
                        <Controller
                          name="repeatPassword"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <input   className={`form-control  ${errors?.repeatPassword? "error-input" : "" }`} type="text" value={value} onChange={onChange} autoComplete="false"  />
                          )}
                          defaultValue=""
                          />											
                        <small>{errors?.repeatPassword?.message}</small>
                      </div>
                      <div className="form-group text-center">                  
                        <button className="btn btn-primary account-btn" type="submit">Register</button>
                      </div>                 
                  </form>                   */}
                  <div className="account-footer">
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                  </div>
                </div>
                {/* /Account Form */}
              </div>
              </div>
              : 
              <div className="account-box" style={{width: '100%', maxWidth: '630px', height: '505px', paddingInline: '20px'}}>
                  <div className="account-wrapper">
                    <h3 className="account-title" style={{padding: '30px 0px 20px 0px', fontSize: '32px'}}>Congratulations!</h3>
                    {/* <p className="account-subtitle">Enter your email to get a password reset link</p> */}
                    {/* Account Form */}
                      <div className="account-footer">
                        <p style={{color: '#444444', fontSize: '18px'}}>Your Company Registered Successfully. Admin Account Created.</p>
                        <p style={{color: '#6F6F6F', fontSize: '18px'}}>Confirm your email address. we have sent a verification email to</p>
                        <p style={{fontWeight: '700', fontSize: '18px'}}>demo@gmail.com</p>
                        <p style={{color: '#0097C7', fontSize: '18px'}}>Not your email address?</p>
                        {/* <p style={{fontSize: '18px'}}>Please <a onClick={() => {setEmailNotVerified(false); setLoginValues({})}} style={{color: '#0097C7'}}>Click-Here</a> to Login again with the correct email address.</p> */}
                        <p style={{color: '#6F6F6F', fontSize: '18px'}}>Make sure to check your inbox and your spam folder if you can't find the email.</p>
                        <p style={{color: '#6F6F6F ', fontSize: '18px'}}>Still not Received? <a style={{color: '#0097C7'}}>Contact Us</a></p>
                      </div>
                    {/* /Account Form */}
                  </div>
              </div>
              // <div className="account-box" style={{width: '100%',maxWidth: '560px', height: 'auto', paddingInline: '55px'}}>
              //     <div className="account-wrapper">
              //       <div style={{display: 'grid', justifyItems: 'center'}}>
              //         <img style={{padding: '17px 0px 30px 0px'}} src={SuccessIcon} alt="Success" />
              //         <h3 className="account-title" style={{padding: '0px 0px 15px 0px'}}>Congratulations!</h3>
              //         <div className="account-footer">
              //           <p style={{color: '#444444', padding: '0px 0px 20px 0px'}}>Your Company Registered Successfully. Admin Account Created.</p>
              //         </div>

              //       </div>


              //       <div className="form-group text-center">
              //         <Link to='/login'><span className="account-btn" style={{color: 'white'}}>Login Now</span></Link>
              //       </div>  
              //   </div>
              // </div>
            }

        </div>
      </div>
    </>
      );
   }



export default Registrationpage;
