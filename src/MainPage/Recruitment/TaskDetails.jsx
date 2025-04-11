import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Card, Spin, message, Tag, Button, Descriptions, Timeline, Row, Col,
  Modal, Form, Input, Rate, DatePicker, Radio, Upload, Select
} from 'antd';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import { 
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  UploadOutlined,
  PlusOutlined
} from '@ant-design/icons';
import moment from 'moment';
import backBtn from '../../assets/iconsRecruitment/arrow-left.svg';
import RightArrow from '../../assets/iconsRecruitment/RightArrow.svg';
import description from '../../assets/iconsRecruitment/description.svg';
import colored from '../../assets/iconsRecruitment/Colored.svg';
import starIcon from '../../assets/iconsRecruitment/star.svg';




const { TextArea } = Input;

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const authState = useSelector((state) => state.user.loginvalue);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);


  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const fetchTaskDetails = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      message.error('Authentication required');
      navigate('/login');
      return;
    }

    try {
      console.log('Fetching task details for ID:', id);
      const response = await apiServices(
        "GET",
        `task/${id}`,
        null,
        {
          access_token: {
            accessToken: token
          },
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      console.log('Task details API response:', response);
      
      if (response?.data?.success) {
        console.log('Task details data:', response.data.data);
        console.log('Current user:', authState?.user);
        console.log('Task reviewers:', response.data.data.taskReviewers);
        setTask(response.data.data);
      } else {
        console.error('Failed to fetch task details:', response?.data);
        message.error(response?.data?.message || 'Failed to fetch task details');
      }
    } catch (error) {
      console.error('Error fetching task details:', error);
      console.error('Error response:', error.response); 
      if (error.response?.status === 401) {
        message.error('Unauthorized access. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 404) {
        message.error('Task not found');
        navigate('/recruitment/tasks');
      } else if (error.response?.status === 400) {
        message.error('Invalid task ID');
        navigate('/recruitment/tasks');
      } else {
        message.error('Error fetching task details. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'orange';
      case 'SUBMITTED':
        return 'blue';
      case 'COMPLETED':
        return 'green';
      case 'OVERDUE':
        return 'red';
      default:
        return 'default';
    }
  };

  const handleAddFeedback = () => {
    setFeedbackModalVisible(true);
    feedbackForm.setFieldsValue({
      evaluationDate: moment(),
      evaluatorName: authState?.user?.fullName || '',
      candidateName: `${task.candidateId.firstName} ${task.candidateId.lastName}`,
      jobTitle: task.candidateId.appliedFor?.title || ''
    });
  };

  const handleFeedbackSubmit = async (values) => {
    setSubmitting(true);
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;

    // Check if user is a task reviewer
    if (!isUserTaskReviewer()) {
      message.error('Only assigned reviewers can submit feedback');
      setSubmitting(false);
      return;
    }

    try {
      const response = await apiServices(
        "POST",
        `task/${id}/feedback`,
        {
          rating: Number(values.rating),
          comment: values.comments,
          decision: values.decision,
          evaluationDate: values.evaluationDate.format('YYYY-MM-DD')
        },
        {
          access_token: {
            accessToken: token
          }
        }
      );

      if (response?.data?.success) {
        message.success('Feedback submitted successfully');
        setFeedbackModalVisible(false);
        feedbackForm.resetFields();
        fetchTaskDetails(); // Refresh task details to show new feedback
      } else {
        throw new Error(response?.data?.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      if (error.response?.status === 401) {
        message.error('Unauthorized access. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        message.error('You are not authorized to provide feedback for this task');
      } else if (error.response?.status === 404) {
        message.error('Task not found');
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errorMessage = error.response.data.errors
          .map(err => `${err.field}: ${err.message}`)
          .join(', ');
        message.error(errorMessage);
      } else {
        message.error(error.response?.data?.message || 'Error submitting feedback. Please try again');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isUserTaskReviewer = () => {
    if (!task?.taskReviewers || !authState?.user?._id) return false;
    return task.taskReviewers.some(reviewer => reviewer._id === authState.user._id);
  };

  const handleStatusUpdate = async (newStatus) => {
    setStatusUpdateLoading(true);
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;

    try {
      const response = await apiServices(
        "PATCH",
        `task/${id}/status`,
        {
          status: newStatus
        },
        {
          access_token: {
            accessToken: token
          }
        }
      );

      if (response?.data?.success) {
        message.success('Task status updated successfully');
        fetchTaskDetails(); // Refresh task details
      } else {
        throw new Error(response?.data?.message || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      message.error(error.response?.data?.message || 'Error updating task status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="content container-fluid">
        <Spin size="large" />
      </div>
    );
  }

  const FirstName = task?.candidateId.firstName;
  const LastName = task?.candidateId.lastName;
  const FullName = FirstName + LastName;

  
  return (
    <div className="content container-fluid">
      {/* Header */}
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <div className="d-flex align-items-center">
              <div>
                <h3 className="page-title mb-0">
                  Tasks
                </h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/recruitment/dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/recruitment/tasks">Tasks</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
      <div style={{width:'100%',borderTop:'1px solid #CFD4D8', display:'flex', justifySelf:'center', height:'50px', alignItems:'flex-end', marginBottom:'15px'}}>
        <div style={{display:'flex', marginBottom:'6px'}}>
          <div>
            <button onClick={()=>navigate("/recruitment/tasks")} style={{marginRight: '16px' ,padding:'0', border:'none', background:'transparent'}}>
              <img src={backBtn}></img>
            </button>
          </div>
          <div>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/tasks">Tasks</Link></li>
              <li className="breadcrumb-item active">{FullName.split(' ').map(word=>word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</li>
            </ul>
          </div>
        </div>
        <div></div>
      </div>

      <div className='initials-div'>
        <div style={{display:"flex", alignItems:'center'}}>
          <div className='initials-details'>{task?.candidateId.firstName?.[0].toUpperCase()}{task?.candidateId.lastName?.[0].toUpperCase()}</div>
          <div>
            <h3 className="ms-3 mt-2 mb-0" style={{fontSize:'20px', fontweight:'500', color:"#000000"}}>{FirstName.charAt(0).toUpperCase() + FirstName.slice(1).toLowerCase() + ' ' + LastName.charAt(0).toUpperCase() + LastName.slice(1).toLowerCase()} </h3>
            <h5 className='ms-3' style={{fontSize:'14px', fontweight:'450', color:"#444444"}} >{task?.candidateId?.appliedFor?.title. split(' ').map(word=>word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</h5> 
            <div style={{paddingLeft:"10px"}}>
              <img src={starIcon}></img>
              <span style={{ marginLeft:'10px'}}>{task?.feedback.rating}</span>
            </div>   
          </div>
          <Tag className='tag-style'style={{borderRadius:"70px"}}>{task?.candidateId?.appliedFor.status[0] + task?.candidateId?.appliedFor.status.slice(1).toLowerCase()}</Tag>
        </div>
        <div className="custom">
          <div
            onClick={() => navigate(`/recruitment/candidates/${task.candidateId._id}`)}
            className= 'select-btn'
          >
            <h3 style={{fontSize:"16px" , fontWeight: '500', marginTop:"8px"}}>Go to Profile</h3>
            <div className='imageRightArrow'><img src={RightArrow} style={{height:"20px", width:'20px'}}></img></div>
          </div>
        </div>
      </div>

      <div className='AddFeedback-screen' >
        <div className='AddFeedback-innerScreen'>
          <div style={{display: "flex", gap: "10px" ,flexWrap:'wrap'}}>
            <div style={{height: "40px", width: "40px",  borderRadius: "50%", background: "#f7f7f8", display: "flex", justifyContent: "center", alignItems: "center"}}>
              <img 
                src={description} 
                alt="Task Icon" 
                style={{ maxWidth: "80%", maxHeight: "80%" }}
              />
            </div>
            <div style={{fontSize: "18px", fontWeight: "500", color: "#000000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{task?.taskName}</div> 
              <div>
                <Tag 
                  color={getStatusColor(task?.status)} 
                  style={{ borderRadius: "60px", fontSize: "14px", padding: "2px 8px" }} // Adjust padding for smaller screens
                >
                  {task?.status[0] + task?.status.slice(1).toLowerCase()}
                </Tag>
              </div>
            </div>
            {task?.status !== "PENDING" && (
              <div className='btn-div'> 
                <button
                  onClick={handleAddFeedback}
                  className='feedback-btn'>
                  <img 
                    src={colored} 
                    alt="Feedback Icon" 
                    style={{ height: "16px", width: "16px" }} 
                  />
                    Add Feedback
                </button>
              </div>
            )}
          </div>
        <Row gutter={[24, 16]} wrap={true} style={{ marginTop: "10px", display: 'flex', flexWrap: 'wrap' }}>
          <Col xs={12} sm={12} md={8} lg={6} style={{ paddingTop: "10px" }}>
            <p className="text-muted mb-1" style={{ fontSize: "14px", fontWeight: "450", color: '#212529' }}>Task Type</p>
            <p style={{ fontSize: "16px", fontWeight: "500", color: '#3b4249' }}>{task?.taskName.split(' ').map(word=>word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</p>
          </Col>
          <Col xs={12} sm={12} md={8} lg={6} style={{ paddingTop: "10px" }}>
            <p className="text-muted mb-1" style={{ fontSize: "14px", fontWeight: "450", color: '#212529' }}>Duration</p>
            <p style={{ fontSize: "16px", fontWeight: "500", color: '#3b4249' }}>{task?.taskDuration} Days</p>
          </Col>
          <Col xs={12} sm={12} md={8} lg={6} style={{ paddingTop: "10px" }}>
            <p className="text-muted mb-1" style={{ fontSize: "14px", fontWeight: "450", color: '#212529' }}>Deadline Date</p>
            <p style={{ fontSize: "16px", fontWeight: "500", color: '#3b4249' }}>{moment(task?.lastDateOfSubmission).format('DD-MMM-YYYY')}</p>
          </Col>
          <Col xs={12} sm={12} md={8} lg={6} style={{ paddingTop: "10px" }}>
            <p className="text-muted mb-1" style={{ fontSize: "14px", fontWeight: "450", color: '#212529' }}>Task Reviewers</p>
            <div>
              {task?.taskReviewers.map((reviewer, index) => (
                <Link key={index} to="#" className="social-icon-two" style={{ marginLeft: "-10px" }}>
                  <img src={reviewer?.imageUrl} style={{ height: "30px", width: "30px", borderRadius: "50%", border: '2px solid white' }} />
                </Link>
              ))}
            </div>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6} style={{ paddingTop: "10px" }}>
            <p className="text-muted mb-1" style={{ fontSize: "14px", fontWeight: "450", color: '#212529' }}>Created By</p>
            <p style={{ fontSize: "16px", fontWeight: "500", color: '#3b4249' }}>{task?.createdBy?.fullName}</p>
          </Col>
        </Row>

        
        {task.status === 'task-reviewed' && (
          <div>
            {task?.feedback.map((feedback, index) => (
                  <Card className="mb-4" style={{background:"#f7f7f8" , marginTop:"20px" ,borderRadius:"4px", padding:"15px 10px 15px 10px"}}>
                  <div style={{display:'flex' ,justifyContent:"space-between"}}>
                    <div style={{display:'flex', gap:'15px'}}>
                      <h3 style={{fontSize:'16px' ,fontWeight:"500" ,color:"#212529" ,marginTop:"3px"}}>Task Feedback By</h3>
                      <img src={feedback.reviewerId?.imageUrl} style={{height:"30px" ,width:"30px", borderRadius:'50%'}}></img>
                      <p  style={{fontSize:'12px' ,fontWeight:"500" ,color:"#ff9244", marginBottom:'0px' ,marginTop:"5px"}}>{feedback?.reviewerId.fullName}</p>
                    </div>
                    <p style={{fontSize:'12px' ,fontWeight:"500" ,color:"#67748e", marginBottom:'0px', marginTop:'5px'}}>{moment(feedback.createdAt).format('ddd, MMM DD @ hh:mm a')}</p>
                  </div>
                  <div style={{display:'flex' ,gap:"15px" ,marginTop:"15px"}}>
                    <p style={{fontSize:'12px' ,fontWeight:"500" ,color:"#212529", marginBottom:'0px' ,marginTop:"5px"}}>Decision:</p>
                    <h3 style={{fontSize:'16px' ,fontWeight:"500",color:"#47ac52" ,marginTop:"3px" }}>{feedback.decision}</h3>
                  </div>
                  <div  style={{display:'flex' ,gap:"15px" ,marginTop:"15px"}}>
                    <p style={{fontSize:'14px' ,fontWeight:"450" ,color:"#6f7d8a", marginBottom:'0px' ,marginTop:"5px"}}>{feedback.comment}</p>
                  </div>
                  <div  style={{display:'flex' ,gap:"15px" ,marginTop:"20px"}}>
                    <div>
                      <div style={{background:"#e0e3e6" , padding:'3px 5px 3px 5px'}}>Soft Skills</div>
                      <div style={{display:'flex' , gap:"5px", marginTop:"5px"}}>
                        <img src={star} style={{height:'14px' ,width:"14px"}}></img>
                        <h3  style={{fontSize:"15px" ,fontWeight:'500', paddingBottom:'2px'}}>{feedback.ratings.softSkills}</h3>
                      </div>
                    </div>
            
                    {/* <div>
                      <div style={{background:"#e0e3e6" , padding:'3px 5px 3px 5px'}}>Technical Skills</div>
                      <div style={{display:'flex' , gap:"5px", marginTop:"5px"}}>
                        <img src={star} style={{height:'14px' ,width:"14px"}}></img>
                        <h3  style={{fontSize:"15px" ,fontWeight:'500', paddingBottom:'2px'}}>{feedback.ratings.technicalSkills1}</h3>
                      </div>
                    </div> */}
            
                    {/* <div>
                      <div style={{background:"#e0e3e6" , padding:'3px 5px 3px 5px'}}>Behaviour</div>
                      <div style={{display:'flex' , gap:"5px", marginTop:"5px"}}>
                        <img src={star} style={{height:'14px' ,width:"14px"}}></img>
                        <h3  style={{fontSize:"15px" ,fontWeight:'500', paddingBottom:'2px'}}>{feedback.ratings.behavior} </h3>
                      </div>
                    </div> */}
            
                    {/* <div>
                      <div style={{background:"#e0e3e6" , padding:'3px 5px 3px 5px'}}>Technical Skills</div>
                      <div style={{display:'flex' , gap:"5px", marginTop:"5px"}}>
                        <img src={star} style={{height:'14px' ,width:"14px"}}></img>
                        <h3  style={{fontSize:"15px" ,fontWeight:'500', paddingBottom:'2px'}}>{feedback.ratings.technicalSkills2}</h3>
                      </div>
                    </div> */}
            
                    {/* <div>
                      <div style={{background:"#e0e3e6" , padding:'3px 5px 3px 5px'}}>Technical Skills</div>
                      <div style={{display:'flex' , gap:"5px", marginTop:"5px"}}>
                        <img src={star} style={{height:'14px' ,width:"14px"}}></img>
                        <h3  style={{fontSize:"15px" ,fontWeight:'500', paddingBottom:'2px'}}>{feedback.ratings.technicalSkills3}</h3>
                      </div>
                    </div> */}
                  </div>
                </Card>
            ))}
          </div>
        )}
      </div>

      {/* comments if needed! */}
      {/* <div style={{display:'flex',gap:'15px'}}>
        <div>
          <img src={MainInterviewer} style={{height:'40px' ,width:"40px" ,borderRadius:'50%' ,border:"1px solid transparent"}}></img>
        </div>
        <div style={{background:'#ffffff' ,border:'1px solid transparent' , borderRadius:'8px',padding:'10px 20px 15px 10px' , width:'100%'}}>
          <TextArea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter Comment and hit enter"
            autoSize={{ minRows: 1 }}
            style={{border:"none", fontSize:"16px" ,fontWeight:"450"}}
          />
          <div style={{display:'flex' ,justifyContent:"space-between",alignItems:'center' ,marginTop:"10px"}}>
            <div className="d-flex gap-1 ms-3">
              <button style={{border:"2px solid #f7f7f8" ,borderRadius:"4px" ,height:"35px" ,width:"35px"}}><img src={media}></img></button>
              <button style={{border:"2px solid #f7f7f8" ,borderRadius:"4px" ,height:"35px" ,width:"35px"}}><img src={gallery}></img></button>
              <button style={{border:"2px solid #f7f7f8" ,borderRadius:"4px" ,height:"35px" ,width:"35px"}}><img src={emoji}></img></button>
              <button style={{border:"2px solid #f7f7f8" ,borderRadius:"4px" ,height:"35px" ,width:"35px"}}><img src={copyLink}></img></button>
            </div>
            <div>
              <Button onClick={handleCommentSubmit} style={{color:"#ff9244", border:'1px solid #ff9244', borderRadius:"8px", fontSize:"16px" ,fontWeight:"450"}}>
                Comment
              </Button>
            </div>
          </div>
        </div>
      </div> */}

<Modal
  title="Add Feedback"
  open={feedbackModalVisible}
  onCancel={() => setFeedbackModalVisible(false)}
  footer={null}
  width={450}
  className='custom-modal'
>
  <Form
    form={feedbackForm}
    layout="vertical"
    onFinish={handleFeedbackSubmit}
  >
    <Form.Item
      name="description"
      label="Description"
      rules={[{ required: true, message: 'Please provide feedback description' }]}
    >
      <TextArea rows={5} placeholder="Enter Description" style={{borderRadius:"8px"}}/>
    </Form.Item>

    <div style={{background:'#f7f7f8' , borderRadius:"12px"}}>
      <div style={{display:'flex' ,justifyContent:'space-between',alignItems:"center" ,borderBottom:"1px solid #e0e3e6", padding:'12px 12px 8px 12px' ,fontWeight:"450" ,color:"black"}}>
        <span>Rating</span>
        <div style={{display:"flex" ,gap:'23px' ,fontSize:"10px" ,fontWeight:"450" ,color:"#6f7d8a",paddingLeft:'5px' ,paddingRight:'5px'}}>
          <div>1</div>
          <div>2</div>
          <div>3</div>
          <div>4</div>
          <div>5</div>
        </div>
      </div>
      <div style={{ padding:'6px 12px 12px 12px'}}>
        <div style={{display:'flex' ,justifyContent:'space-between' ,borderBottom:'1px solid #eef0f1' , alignItems:"center" , height:"45px"}}>
          <label>Technical Skill:</label> 
          <Form.Item
            name="technicalRating"
            rules={[{ required: true, message: 'Please provide technical rating' }]}
            style={{marginTop:"22px"}}
          >
            <Rate count={5}/>
          </Form.Item>
        </div>

        <div style={{display:'flex' ,justifyContent:'space-between',borderBottom:'1px solid #eef0f1', alignItems:"center" , height:"45px"}}>
          <label>Behavior</label>
          <Form.Item
            name="behaviorRating"
            rules={[{ required: true, message: 'Please provide a behavior rating' }]}
            style={{marginTop:"22px"}}
          >
            <Rate count={5}/>
          </Form.Item>
        </div>

        <div style={{display:'flex' ,justifyContent:'space-between' ,borderBottom:'1px solid #eef0f1',alignItems:"center" , height:'45px'}}>
          <label>Soft Skills</label>
          <Form.Item
          name="softSkillRating"
          rules={[{ required: true, message: 'Please provide soft skill rating' }]}
          style={{marginTop:"22px"}}
          >
            <Rate count={5}/>
          </Form.Item>
        </div>  
      </div>
    </div>

    <Form.Item
      name="decision"
      rules={[{ required: true, message: 'Please select a decision' }]}
      style={{marginTop:"15px"}}
    >
      <div style={{display:'flex' , border:'1px solid transparent' ,background:'#f7f7f8' ,borderRadius:'8px',display:"flex" ,justifyContent:"space-between"}}>
        <Button onClick={()=>{feedbackForm.setFieldValue('decision' , 'STRONG YES')}} style={{border:"none" ,background:"transparent"}}>Strong Yes</Button>
        <Button onClick={()=>{feedbackForm.setFieldValue('decision' , 'YES')}} style={{border:"none" ,background:"transparent"}}>Yes</Button>
        <Button onClick={()=>{feedbackForm.setFieldValue('decision' , 'NO')}} style={{border:"none" ,background:"transparent"}}>No</Button>
        <Button onClick={()=>{feedbackForm.setFieldValue('decision' , 'STRONG NO')}} style={{border:"none" ,background:"transparent"}}>Strong No</Button>
      </div>
    </Form.Item>

    <Form.Item style={{display:'flex' ,justifyContent:"flex-end"}} className='pt-3 pb-3'>
      <Button 
        onClick={() => setFeedbackModalVisible(false)} 
        style={{ marginRight:'8px' , borderRadius:'32px' ,fontSize:"16px" ,fontWeight:"500" ,color:"#a5adb6" ,background:"#f7f7f8" ,border:"1px solid transparent"}}
      >
        Cancel
      </Button>
      <Button 
        type="primary" 
        htmlType="submit"
        loading={submitting}
        style={{borderRadius:'32px' ,fontSize:"16px" ,fontWeight:"500" ,color:"#white" ,background:"#ff9244",border:"1px solid transparent"}}
      >
        Submit Feedback
      </Button>
    </Form.Item>
  </Form>
</Modal>

  

    
      <style jsx>{`
        .btn-style{
          width:50%;
          font-size:14px; 
          font-weight: 500;
          color: #A5ADB6 ;
          border: 1px solid transparent;
        }
        .info-card {
          background: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }
        .profile-img {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
        }
        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 500;
          color: #666;
          border: 1px solid #e8e8e8;
        }
        .section-title {
          color: #333;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .info-section {
          padding-top: 20px;
          border-top: 1px solid #e8e8e8;
          margin-top: 20px;
        }
        .info-section:first-child {
          padding-top: 0;
          border-top: none;
          margin-top: 0;
        }
        .info-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .info-icon {
          font-size: 16px;
          margin-right: 12px;
          color: #666;
          margin-top: 3px;
        }
        .info-content {
          flex: 1;
        }
        .info-label {
          display: block;
          font-size: 12px;
          margin-bottom: 4px;
          color: #666;
        }
        .info-value {
          display: block;
          font-size: 14px;
          color: #333;
          font-weight: 500;
          line-height: 1.4;
        }
        .info-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .info-row {
          display: none;
        }

        .nav-tabs-custom .ant-tabs-nav {
          margin-bottom: 20px;
        }
        .nav-tabs-custom .ant-tabs-tab {
          padding: 12px 0;
          margin: 0 0 0 32px;
          font-size: 15px;
        }

        .nav-tabs-custom .ant-tabs-tab-active {
          font-weight: 600;
        }
        .timeline-item {
          padding-bottom: 20px;
          border-left: 2px solid #e8e8e8;
          margin-left: 16px;
          padding-left: 20px;
          position: relative;
        }
        .timeline-item::before {
          content: "";
          position: absolute;
          left: -7px;
          top: 0;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #f4a261;
        }
        .time {
          color: #666;
          font-size: 13px;
          margin-bottom: 8px;
        }
        .event {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .files-content,
        .interview-content {
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }
        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: #f9f9f9;
          border-radius: 4px;
          border: 1px solid #e8e8e8;
        }

        .tag-style{
          border-radius: 70px;
          margin-left: 9px;
          margin-top: -35px;
        }
        .ant-tag {
          border-radius: 4px;
          padding: 2px 8px;
          font-size: 12px;
          font-weight: 500;
        }
        .interview-modal .ant-modal-content {
          border-radius: 3px;
          overflow: hidden;
        }

        .interview-modal .ant-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .interview-modal .ant-modal-body {
          padding: 24px;
        }

        .interview-modal .ant-form-item-label > label {
          font-weight: 500;
        }

        .interview-modal .ant-input,
        .interview-modal .ant-select-selector,
        .interview-modal .ant-picker {
          border-radius: 3px;
          border-color: #e3e3e3;
        }

        .interview-modal .ant-input::placeholder,
        .interview-modal .ant-select-selection-placeholder,
        .interview-modal .ant-picker-input > input::placeholder {
          color: #999;
        }

        .interview-modal .ant-tag {
          margin-right: 3px;
          background: #f4f4f4;
          border: none;
          border-radius: 3px;
          padding: 4px 8px;
        }


        .ant-select-dropdown {
          z-index: 1050;
        }


        .status-scheduled .ant-select-selector,
        .status-scheduled  {
          background-color: #e6f7ff !important;
          border-color: #91d5ff !important;
          color: #1890ff !important;
        }

        .status-completed .ant-select-selector,
        .status-completed{
          background-color: #f6ffed !important;
          border-color: #b7eb8f !important;
          color: #52c41a !important;
        }

        .status-cancelled .ant-select-selector,
        .status-cancelled {
          background-color: #fff1f0 !important;
          border-color: #ffa39e !important;
          color: #f5222d !important;
        }

        .status-rescheduled .ant-select-selector,
        .status-rescheduled {
          background-color: #fff7e6 !important;
          border-color: #ffd591 !important;
          color: #fa8c16 !important;
        }

        .status-new .ant-select-selector,
        .status-new {
          background-color: #e6f7ff !important;
          border-color: #91d5ff !important;
          color: #1890ff !important;
        }

        .status-new .ant-select-arrow {
          color: #1890ff !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }

        .status-screening .ant-select-selector,
        .status-screening {
          background-color: #fff7e6 !important;
          border-color: #ffd591 !important;
          color: #fa8c16 !important;
        }

        .status-screening .ant-select-arrow {
          color: #fa8c16 !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }

        .status-offer_sent .ant-select-selector,
        .status-offer_sent {
          background-color: #d3d3d3 !important;
          border-color: #5e716a !important;
          color: #5e716a !important;
        }

        .status-offer_sent .ant-select-arrow {
          color: #5e716a !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }
        

        .status-shortlisted .ant-select-selector,
        .status-shortlisted {
          background-color: #f6ffed !important;
          border-color: #b7eb8f !important;
          color: #52c41a !important;
        }

        .status-shortlisted .ant-select-arrow {
          color: #52c41a !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }

        .status-hired .ant-select-selector,
        .status-hired {
          background-color: #f9f0ff !important;
          border-color: #d3adf7 !important;
          color: #722ed1 !important;
        }

        .status-hired .ant-select-arrow {
          color: #722ed1 !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }

        .status-rejected .ant-select-selector,
        .status-rejected {
          background-color: #fff1f0 !important;
          border-color: #ffa39e !important;
          color: #f5222d !important;
        }

        .status-rejected .ant-select-arrow {
          color: #f5222d !important;
          font-size: 14px !important;
          padding-top: 5px !important;
        }


        .task-card {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
        }

        .task-card .task-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
        }

        .status-pending .ant-select-selector {
          background-color: #fff7e6 !important;
          border-color: #ffd591 !important;
          color: #fa8c16 !important;
        }

        .status-submitted .ant-select-selector {
          background-color: #e6f7ff !important;
          border-color: #91d5ff !important;
          color: #1890ff !important;
        }

        .status-completed .ant-select-selector {
          background-color: #f6ffed !important;
          border-color: #b7eb8f !important;
          color: #52c41a !important;
        }

        .status-cancelled .ant-select-selector {
          background-color: #fff1f0 !important;
          border-color: #ffa39e !important;
          color: #f5222d !important;
        }

        .file-card {
          margin: 16px;
        }

        .file-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .file-details {
          display: flex;
          flex-direction: column;
        }

        .file-actions {
          display: flex;
          align-items: center;
        }

        .no-files-message {
          text-align: center;
          padding: 40px 0;
        }


        /* Offer Modal Styles */
        :global(.offer-modal .ant-modal-content) {
          border-radius: 8px;
          overflow: hidden;
        }

        :global(.offer-modal .ant-modal-header) {
          padding: 20px 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        :global(.offer-modal .ant-modal-body) {
          padding: 24px;
        }

        :global(.offer-modal .ant-form-item-label > label) {
          font-weight: 500;
        }

        :global(.offer-modal .ant-input),
        :global(.offer-modal .ant-select-selector),
        :global(.offer-modal .ant-picker) {
          border-radius: 8px;
          padding: 8px 12px;
          height: 40px;
          border-color: #e3e3e3;
        }


        :global(.offer-modal .ant-upload-drag) {
          border: 2px dashed #e3e3e3;
          border-radius: 4px;
          background: #fafafa;
          transition: all 0.3s;
        }


        :global(.offer-modal .ant-upload-drag-icon) {
          color: #ff9b44;
          font-size: 48px;
          margin-bottom: 16px;
        }

        :global(.offer-modal .ant-upload-text) {
          color: #666;
          font-size: 16px;
          margin-bottom: 8px;
        }

        :global(.offer-modal .ant-upload-hint) {
          color: #999;
        }

        :global(.offer-modal .ant-btn-primary) {
          background: #ff9b44;
          border-color: #ff9b44;
        }


        .active-tab-styles{
           display: flex ;
            width: 60%;
            justify-content: space-between;
        }

        .active-tab-timeline{
          padding: 0 10px 15px 0px ;
          font-size: 16px; 
          font-weight: 500;
        }
        .active-tab-files{
          padding: 0 10px 15px 0px ;
          font-size: 16px; 
          font-weight: 500;
          color: activeTab === 'files' ? #ff9244 : #a5adb6;
          cursor: pointer;
          border-bottom: activeTab === 'files' ? 2px solid #ff9244: none;
        }
        .active-tab-interview{
          padding: 0 10px 15px 0px ;
          font-size: 16px; 
          font-weight: 500;
          color: activeTab === 'interview' ?  #ff9244  : #a5adb6;
          cursor: pointer;
          border-bottom: activeTab === 'interview' ?  2px solid #ff9244 : none;
        }
        .info-items-children{
          display: flex ;
        }

        .select-btn{
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          border: 1px solid #ff9244;
          border-radius: 8px;
          background: #ff9244;
          height: 45px;
          width: 160px;
          font-size: 16px;
          font-weight: 500;
          color: #ffffff;
          cursor: pointer;
        }

      .customized .ant-select-selector{
        height: 45px !important;
        border-radius: 8px !important;
        display: flex;
        align-items: center;
        font-size: 16px;
        font-weight: 450;
      }

      .custom-modal .ant-modal-close {
        background-color: #F8F9FA;
        border-radius: 50%;
        border:"1px solid #F8F9FA";
        margin:16px 16px 0 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .add-candidate-btn{
          border-radius: 40px !important;
          height: 44px !important;
          background-color: #ff9244 !important;
          color: white !important;
          font-weight: 500 !important;
          font-size: 16px !important;
          border: 2px solid #ff9244 !important;
          width: 185px !important;
      }
        
      .btn-content{
          display: flex;
          justify-content: center;
          align-items: center;
      }

      .search-btn {
          background: #1f1f1f;
          border: 1px solid #1f1f1f;
          height: 40px;
          border-radius: 8px;
          width: 80% !important;
          font-weight: 500;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          justify-self: end;
        }

        .initials-div{
          height: 130px;
          background: #ffffff;
          border: 1px solid transparent;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .custom{
          display: flex;
          float : end;
          margin-right: 12px 
        }

        .initials-details{
          height: 80px;
          width: 80px;
          border: 1px solid transparent;
          border-radius: 50%;
          background: #f5f1fd;
          color: #9368e9;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-left: 20px;
          font-size: 28px;
          fontweight: 500;
        }

        .AddFeedback-screen{
          background: #ffffff ;
          border: 1px solid transparent;
          border-radius: 8px;
          margin-bottom: 20px;
          padding: 25px;
        }

        .feedback-btn{
          background: transparent;
          border: none;
          font-size: 16px;
          font-weight: 450;
          color: #ff9244;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .btn-div{
          padding-top: 8px;
          flex-shrink: 0;
        }

        .AddFeedback-innerScreen{
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        @media (max-width: 630px){
          .tag-style{
            display: none !important;
          }
        }

        @media (max-width: 500px){
          .select-btn{
            width: 130px !important;
            gap: 4px !important;
          }
        }

        @media (max-width: 500px){
          .custom{
            margin-right: 7px !important; 
          }
        }

        @media (max-width: 500px){
          .initials-details{
            margin-left: 7px !important; 
          }
        }

        @media (min-width: 420px) and (max-width: 500px){
          .select-btn{
            margin-left: 30px !important;
          }
        }

        @media (max-width: 400px){
          .imageRightArrow{
            display : none !important;
          }
        }

        @media (max-width: 400px){
          .select-btn{
            width: 95px !important;
          }
        }

        @media (min-width: 450px) and (max-width: 553px){
         .btn-div{
          display: flex;
          }
        }








      `}</style>
    </div>
  );
};

export default TaskDetails; 