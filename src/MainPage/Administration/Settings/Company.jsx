import React, { useEffect, useState } from "react";
import PhoneNoInput from "../../../Components/PhoneNoInput/index.jsx";
import { Button, Form, Input, message } from "antd";

const Company = () => {
  
  const data1 = {
    _id: 1, companyName: 'companyy', legalName: 'legalll', phoneNumber: '+92303000'
  }

  const [form] = Form.useForm();
  const [allValues, setAllValues] = useState({})
  const [data, setData] = useState(data1)

  useEffect(() => {
    form.setFieldsValue(data1);
  }, [])
  

  const onHandleChange = (type, value) => {
      if (type === "phoneNumber" || type === "mobileNumber") {
      let newvalue = value ? "+" + value : "";
      console.log(newvalue);

      const updatedValues = {
        [type]: `${newvalue}`, // Replace 'New Value' with the desired new value
      };
  
      // Set the updated values back to the form
      form.setFieldsValue(updatedValues);
      setAllValues({
        ...allValues,
        [type]: `${newvalue}`,
      })

      // let newvalue = "+" + value

      // if (!state) {
      //   postdata[`${id}`] = newvalue
      //   setPostformData(postdata)
      //   localStorage.setItem(`${id}`, JSON.stringify(newvalue));
      // } else {
      //   newdata[`${id}`] = newvalue
      //   setformData(newdata)
      // }
    }else{
      const updatedValues = {
        [type]: `${value}`, // Replace 'New Value' with the desired new value
      };
  
      // Set the updated values back to the form
      form.setFieldsValue(updatedValues);
      setAllValues({
        ...allValues,
        [type]: `${value}`,
      })
    }
  };

  const onFinish = (values) => {
    console.log("onFinsish===", values);
    console.log("All Values===", allValues);
    // handleClose();
    message.success("Company Settings Updated Successfully!");
  };

  // const phoneError = form.isFieldValidating("phoneNumber");

  return (
    <>
      <>
        {/* <h6 className="card-title m-b-20">Module Access</h6>
               {/* Page Header */}
        <div className="page-header">
          <div className="row pt-3 pb-3">
            <div className="col-sm-12">
              <h3 className="page-title">Company Settings</h3>
            </div>
          </div>
        </div>
        {/* /Page Header */}
        {/* <form>
          <div className="row">
            <div className="col-sm-6">
              <div className="form-group">
                <label>
                  Company Name <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="text"
                  defaultValue="Dreamguy's Technologies"
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Contact Person</label>
                <input
                  className="form-control "
                  defaultValue="Daniel Porter"
                  type="text"
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <div className="form-group">
                <label>Address</label>
                <input
                  className="form-control "
                  defaultValue="3864 Quiet Valley Lane, Sherman Oaks, CA, 91403"
                  type="text"
                />
              </div>
            </div>
            <div className="col-sm-6 col-md-6 col-lg-3">
              <div className="form-group">
                <label>Country</label>
                <select className="form-control select">
                  <option>USA</option>
                  <option>United Kingdom</option>
                </select>
              </div>
            </div>
            <div className="col-sm-6 col-md-6 col-lg-3">
              <div className="form-group">
                <label>City</label>
                <input
                  className="form-control"
                  defaultValue="Sherman Oaks"
                  type="text"
                />
              </div>
            </div>
            <div className="col-sm-6 col-md-6 col-lg-3">
              <div className="form-group">
                <label>State/Province</label>
                <select className="form-control select">
                  <option>California</option>
                  <option>Alaska</option>
                  <option>Alabama</option>
                </select>
              </div>
            </div>
            <div className="col-sm-6 col-md-6 col-lg-3">
              <div className="form-group">
                <label>Postal Code</label>
                <input
                  className="form-control"
                  defaultValue={91403}
                  type="text"
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <div className="form-group">
                <label>Email</label>
                <input
                  className="form-control"
                  defaultValue="danielporter@example.com"
                  type="email"
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  className="form-control"
                  defaultValue="818-978-7102"
                  type="text"
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  className="form-control"
                  defaultValue="818-635-5579"
                  type="text"
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Fax</label>
                <input
                  className="form-control"
                  defaultValue="818-978-7102"
                  type="text"
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <div className="form-group">
                <label>Website Url</label>
                <input
                  className="form-control"
                  defaultValue="https://www.example.com"
                  type="text"
                />
              </div>
            </div>
          </div>
          <div className="submit-section">
            <button className="btn btn-primary submit-btn">Save</button>
          </div>
        </form> */}
        {/* <form onSubmit={(e) => {
            e.preventDefault();
            console.log('clicked');
          }}> */}
        <Form
          // {...layout}
          form={form}
          name="control-hooks"
          onFinish={onFinish}
          onFinishFailed={() => message.error('Please Enter Required Fields!')}
        >
          <div className="row">
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Company Name <span className="text-danger">*</span>
                </label>
                {/* <input className="form-control" type="text" /> */}
                <Form.Item
                  name="companyName"
                  rules={[
                    {
                      required: true,
                      message: "please enter company name",
                    },
                  ]}
                >
                  <Input style={{display: 'none'}} value={allValues?.companyName} />
                  <input className="form-control"
                    defaultValue={data ? data?.companyName : ''}
                    onChange={(e) => {
                      onHandleChange("companyName", e.target.value);
                    }}
                    autoFocus
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Legal Name <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="legalName"
                  rules={[
                    {
                      required: true,
                      message: "please enter legal name",
                    },
                  ]}
                >
                  <Input style={{display: 'none'}} value={allValues?.legalName} />
                  <input className="form-control"
                    defaultValue={data ? data?.legalName : ''}
                    onChange={(e) => {
                      onHandleChange("legalName", e.target.value);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Contact Person <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="contactName"
                  rules={[
                    {
                      required: true,
                      message: "please enter contact name",
                    },
                  ]}
                >
                  <Input style={{display: 'none'}} value={allValues?.contactName} />
                  <input className="form-control"
                    onChange={(e) => {
                      onHandleChange("contactName", e.target.value);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Address <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="address"
                  rules={[
                    {
                      required: true,
                      message: "please enter address name",
                    },
                  ]}
                >
                  <Input style={{display: 'none'}} value={allValues?.address} />
                  <input className="form-control"
                    onChange={(e) => {
                      onHandleChange("address", e.target.value);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Postal Code <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="postalCode"
                  rules={[
                    {
                      required: true,
                      message: "please enter postal code",
                    },
                  ]}
                >
                  <Input style={{display: 'none'}} value={allValues?.postalCode} />
                  <input className="form-control"
                    onChange={(e) => {
                      onHandleChange("postalCode", e.target.value);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  City <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="city"
                  rules={[
                    {
                      required: true,
                      message: "please enter city name",
                    },
                  ]}
                >
                  <Input style={{display: 'none'}} value={allValues?.city} />
                  <input className="form-control"
                    onChange={(e) => {
                      onHandleChange("city", e.target.value);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  State <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="state"
                  rules={[
                    {
                      required: true,
                      message: "please enter state name",
                    },
                  ]}
                >
                  <Input style={{display: 'none'}} value={allValues?.state} />
                  <input className="form-control"
                    onChange={(e) => {
                      onHandleChange("state", e.target.value);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Country <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="country"
                  rules={[
                    {
                      required: true,
                      message: "please enter country name",
                    },
                  ]}
                >
                  <Input style={{display: 'none'}} value={allValues?.country} />
                  <input className="form-control"
                    onChange={(e) => {
                      onHandleChange("country", e.target.value);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Company Email <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="companyEmail"
                  rules={[
                    {
                      required: true,
                      message: "please enter company email",
                    },
                  ]}
                >
                  <Input style={{display: 'none'}} value={allValues?.companyEmail} />
                  <input className="form-control"
                    onChange={(e) => {
                      onHandleChange("companyEmail", e.target.value);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Registration No <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="registrationNo"
                  rules={[
                    {
                      required: true,
                      message: "please enter registration no",
                    },
                  ]}
                >
                  <Input style={{display: 'none'}} value={allValues?.registrationNo} />
                  <input className="form-control"
                    onChange={(e) => {
                      onHandleChange("registrationNo", e.target.value);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="phoneNumber"
                  rules={[
                    {
                      required: true,
                      message: "please enter phone number",
                    },
                  ]}
                >
                  <Input style={{ display: "none"}} />
                  <PhoneNoInput
                    onChangePhone={(value) => {
                      onHandleChange("phoneNumber", value);
                    }}
                    phone={data ? data?.phoneNumber : ''}
                    // onCountryChange={(val) => {
                    //   onHandleChange("contactNo", `${val}`);
                    // }}
                    // phone={state ? formData.contactNo : postformData.contactNo}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Mobile Number <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="mobileNumber"
                  rules={[
                    {
                      required: true,
                      message: "please enter mobile number",
                    },
                  ]}
                >
                  <Input style={{ display: "none" }} />
                  <PhoneNoInput
                    onChangePhone={(value) => {
                      onHandleChange("mobileNumber", value);
                    }}
                    // phone={state ? formData.contactNo : postformData.contactNo}
                    // onChangePhone={(value) => {
                    //   onHandleChange("contactNo", value)
                    // }}
                    // onCountryChange={(val) => {
                    //   onHandleChange("contactNo", `${val}`);
                    // }}
                    // phone={state ? formData.contactNo : postformData.contactNo}
                    // phoneError={phoneError}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Website <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="website"
                  rules={[
                    {
                      required: true,
                      message: "please enter website",
                    },
                  ]}
                >
                  <Input style={{display: 'none'}} value={allValues?.website} />
                  <input className="form-control"
                    onChange={(e) => {
                      onHandleChange("website", e.target.value);
                    }}
                  />
                </Form.Item>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label className="col-form-label">
                  Fax <span className="text-danger">*</span>
                </label>
                <Form.Item
                  name="fax"
                  rules={[
                    {
                      required: true,
                      message: "please enter fax",
                    },
                  ]}
                >
                  <Input style={{display: 'none'}} value={allValues?.fax} />
                  <input className="form-control"
                    onChange={(e) => {
                      onHandleChange("fax", e.target.value);
                    }}
                  />
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
              <Button htmlType="submit" className="btn btn-primary submit-btn">
                Save
              </Button>
            </Form.Item>
          </div>
        </Form>
        {/* </form>  */}
      </>
      {/* Add Role Modal */}
      <div id="add_role" className="modal custom-modal fade" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Role</h5>
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label>
                    Role Name <span className="text-danger">*</span>
                  </label>
                  <input className="form-control" type="text" />
                </div>
                <div className="submit-section">
                  <button className="btn btn-primary submit-btn">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Add Role Modal */}
      {/* Edit Role Modal */}
      <div id="edit_role" className="modal custom-modal fade" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content modal-md">
            <div className="modal-header">
              <h5 className="modal-title">Edit Role</h5>
              {/* <h5 className="modal-title">Edit Role {editModal}</h5> */}
              <button
                type="button"
                className="close"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="form-group">
                  <label>
                    Role Name <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    // defaultValue={editModal ? editModal : ""}
                    type="text"
                  />
                </div>
                <div className="submit-section">
                  <button className="btn btn-primary submit-btn">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Edit Role Modal */}
      {/* Delete Role Modal */}
      <div className="modal custom-modal fade" id="delete_role" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Delete Role</h3>
                <p>Are you sure want to delete?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <a href="" className="btn btn-primary continue-btn">
                      Delete
                    </a>
                  </div>
                  <div className="col-6">
                    <a
                      href=""
                      data-bs-dismiss="modal"
                      className="btn btn-primary cancel-btn"
                    >
                      Cancel
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Company;
