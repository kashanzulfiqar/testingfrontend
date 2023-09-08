import React, { useEffect, useState } from 'react'
import { DatePicker, Form, Input, InputNumber, Select, Spin, Upload, message } from 'antd';
import Modal from "@mui/material/Modal";
import moment from 'moment';
import { Avatar_02, Avatar_05, Avatar_09, Avatar_10, Avatar_16, eye, user_icon } from '../../../Entryfile/imagepath'

function DetailsModal({ Detailform, openDetail, setOpenDetail }) {
  return (
    <>
              <Modal
            open={openDetail?.open}
            onClose={() => { setOpenDetail({open: false, data: ''}); Detailform.resetFields(); }}
            aria-labelledby="modal-modal-title"
            className="modalScroll"
            aria-describedby="modal-modal-description"
            disableRestoreFocus
            BackdropProps={{
            style: { backgroundColor: "rgb(0 0 0 / 87%)" }, // Set the backdrop color here
            }}
            sx={{
            overflowY: "scroll",
            }}
        >
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content">
                <div className="modal-header">
                {/* <h5 className="modal-title"> Profile Information</h5> */}
                <button type="button" className="close" onClick={() => { setOpenDetail({open: false, data: ''}); Detailform.resetFields(); }}>
                    <span aria-hidden="true">×</span>
                </button>
                </div>
                <div className="modal-body">
                <Form
                form={Detailform}
                initialValues={{
                    // bankName: bankInfo?.bankName ? bankInfo?.bankName : '',
                    // bankAccountNumber: bankInfo?.bankAccountNumber ? bankInfo?.bankAccountNumber : '',
                    // phoneNo: '+92333333',
                    // password: open?.isAddOpen && '1',
                }}
                >
                <div className="row">
                    <div className="col-md-12">
                    <Form.Item
                        name='imageUrl'
                        className='custom-border'
                    >   
                        <div className="profile-img-wrap edit-img" style={{marginBottom: '15px'}}>
                            <img className="inline-block" src={openDetail?.data?.user?.imageUrl || user_icon} alt="user" />
                        </div>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px'}}>
                                <h3>{openDetail?.data?.user?.fullName}</h3>
                                {/* <label style={{fontSize: '13px', color: '#888888', marginTop: '-5px'}}>{openDetail?.data?.role}</label> */}
                            </div>
                    </Form.Item>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Employee ID
                                </label>
                                <Form.Item
                                    name='employeeId'
                                    className='custom-border'
                                >
                                    <Input className='form-control' style={{color: 'black'}} disabled />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Pay Month
                                </label>
                                <Form.Item
                                name='payMonth'
                                className='custom-border'
                                >
                                <DatePicker style={{backgroundColor: '#e9ecef'}} format="MMMM" picker='month' className='dateDisable form-control' disabled />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Pay Year
                                </label>
                                <Form.Item
                                name='payYear'
                                className='custom-border'
                                >
                                <DatePicker style={{backgroundColor: '#e9ecef'}} picker='year' className='dateDisable form-control' disabled />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Salary
                                </label>
                                <Form.Item
                                    name='salary'
                                    className='custom-border'
                                >
                                    <Input className='form-control' style={{color: 'black'}} disabled />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Tax
                                </label>
                                <Form.Item
                                    name='tax'
                                    className='custom-border'
                                >
                                    <Input className='form-control' style={{color: 'black'}} disabled />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Absent Fine
                                </label>
                                <Form.Item
                                    name='absentFine'
                                    className='custom-border'
                                >
                                    <Input className='form-control' style={{color: 'black'}} disabled />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Deduction
                                </label>
                                <Form.Item
                                    name='deduction'
                                    className='custom-border'
                                >
                                    <Input className='form-control' style={{color: 'black'}} disabled />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Total Deduction
                                </label>
                                <Form.Item
                                    name='totalDeduction'
                                    className='custom-border'
                                >
                                    <Input className='form-control' style={{color: 'black'}} disabled />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Deduction Reason
                                </label>
                                <Form.Item
                                    name='deductionReason'
                                    className='custom-border'
                                >
                                    <Input.TextArea rows={1} disabled className='dateDisable form-control' />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Bonus
                                </label>
                                <Form.Item
                                    name='bonus'
                                    className='custom-border'
                                >
                                    <Input className='form-control' style={{color: 'black'}} disabled />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Bonus Reason
                                </label>
                                <Form.Item
                                    name='bonusReason'
                                    className='custom-border'
                                >
                                    <Input.TextArea rows={1} disabled className='dateDisable form-control' />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Total Addition
                                </label>
                                <Form.Item
                                    name='totalAddition'
                                    className='custom-border'
                                >
                                    <Input className='form-control' style={{color: 'black'}} disabled />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Extra Payment
                                </label>
                                <Form.Item
                                    name='extraPayment'
                                    className='custom-border'
                                >
                                    <Input className='form-control' style={{color: 'black'}} disabled />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Extra Payment Reason
                                </label>
                                <Form.Item
                                    name='extraPaymentReason'
                                    className='custom-border'
                                >
                                    <Input.TextArea rows={1} disabled className='dateDisable form-control' />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Credit Salary
                                </label>
                                <Form.Item
                                    name='creditSalary'
                                    className='custom-border'
                                >
                                    <Input className='form-control' style={{color: 'black'}} disabled />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Mode Of Payment
                                </label>
                                <Form.Item
                                    name='modeOfPayment'
                                    className='custom-border'
                                >
                                    <Input className='form-control' style={{color: 'black'}} disabled />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Transaction ID
                                </label>
                                <Form.Item
                                    name='transactionId'
                                    className='custom-border'
                                >
                                    <Input className='form-control' style={{color: 'black'}} disabled />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Payroll Processing Date
                                </label>
                                <Form.Item
                                    name='payrollCreationDate'
                                    className='custom-border'
                                >
                                    <DatePicker style={{backgroundColor: '#e9ecef'}} className='dateDisable form-control' disabled />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label>
                                Status
                                </label>
                                <Form.Item
                                    name='status'
                                    className='custom-border'
                                >
                                    <Input className='form-control' style={{color: 'black'}} disabled />
                                </Form.Item>
                            </div>
                        </div>


                    </div>
                </div>
                </Form>
                </div>
            </div>
            </div>
        </Modal>
    </>
  )
}

export default DetailsModal