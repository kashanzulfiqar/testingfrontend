import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Tabs, Spin, message, Tag, Button, Modal, Select } from 'antd';
import { apiServices } from '../../Services/apiServices';
import { useSelector } from 'react-redux';
import { 
  ArrowLeftOutlined, 
  FacebookOutlined, 
  LinkedinOutlined, 
  InstagramOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined
} from '@ant-design/icons';
import moment from 'moment';
import CreateCandidateModal from './CreateCandidateModal';
import circle from '../../assets/iconsRecruitment/circle.svg';
import backBtn from '../../assets/iconsRecruitment/arrow-left.svg';
import { title } from 'process';
import target from '../../assets/iconsRecruitment/target.svg';
import calander from '../../assets/iconsRecruitment/calander.svg';
import department from '../../assets/iconsRecruitment/department.svg';
import facebook from '../../assets/iconsRecruitment/Facebook.svg';
import indeed from '../../assets/iconsRecruitment/indeed.svg';
import linkdin from '../../assets/iconsRecruitment/linkedin-icon.svg';
import website from '../../assets/iconsRecruitment/websiteGlobe.svg';
import instagram from '../../assets/iconsRecruitment/insta.svg';
import Timeline from '../../assets/iconsRecruitment/Timeline.svg';
import candidate from '../../assets/iconsRecruitment/candidate.svg';
import description from '../../assets/iconsRecruitment/description.svg'
import interview from '../../assets/iconsRecruitment/interview.svg'


const JobDetails = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobDetails, setJobDetails] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const authState = useSelector((state) => state.user.loginvalue);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [active, setActive] = useState('candidates');
  const [jobStatus, setJobStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [isOpen ,setisOpen] = useState(false);

  console.log('JobDetails component mounted with jobId:', jobId);

  useEffect(() => {
    console.log('Fetching job details for jobId:', jobId);
    fetchJobDetails();
    fetchJobCandidates();
  }, [jobId]);

  useEffect(() => {
    // Set job status from job details when data is loaded
    if (jobDetails && jobDetails.status) {
      setJobStatus(jobDetails.status);
    }
  }, [jobDetails]);

  const fetchJobDetails = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      console.error('No authentication token found');
      message.error('Authentication required');
      navigate('/login');
      return;
    }

    try {
      console.log('Making API request to fetch job details...');
      const response = await apiServices(
        "GET",
        `job/${jobId}`,
        null,
        {
          access_token: {
            accessToken: token
          }
        }
      );

      console.log('Job details API response:', response);

      if (response?.data?.status) {
        console.log('Job details fetched successfully:', response.data.data);
        setJobDetails(response.data.data);
      } else {
        console.error('Failed to fetch job details:', response?.data);
        message.error(response?.data?.message || 'Failed to fetch job details');
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      message.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobCandidates = async () => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      console.error('No authentication token found for candidates fetch');
      return;
    }

    try {
      console.log('Making API request to fetch job candidates for jobId:', jobId);
      const response = await apiServices(
        "GET",
        `candidate/list?appliedFor=${jobId}&page=1&limit=50`,
        null,
        {
          access_token: {
            accessToken: token
          }
        }
      );

      console.log('Job candidates API response:', response);

      if (response?.data?.status) {
        const candidatesList = response.data.data.docs || [];
        console.log('Job candidates fetched successfully:', candidatesList);
        setCandidates(candidatesList);
      } else {
        console.error('Failed to fetch candidates:', response?.data);
        message.error('Failed to fetch candidates');
      }
    } catch (error) {
      console.error('Error fetching job candidates:', error);
      message.error('Failed to load candidates');
    }
  };


  const handleAddCandidate = () => {
    setIsModalVisible(true);
    // Add modal-open class to body to prevent scrolling
    document.body.classList.add('modal-open');
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    // Remove modal-open class from body when modal is closed
    document.body.classList.remove('modal-open');
  };

  const handleModalSuccess = () => {
    setIsModalVisible(false);
    // Remove modal-open class from body when modal is closed after success
    document.body.classList.remove('modal-open');
    fetchJobCandidates();
  };


  
  const items = [
    // {
    //   key: 'timeline',
    //   label: (
    //     <div className='tab-container-items' style={{padding:"8px 0"}}>
    //       <img className= 'tab-image' src={Timeline}></img>
    //       <span style={{ fontSize: '16px', fontWeight: 500, marginLeft:"5px" }}>Timeline</span>
    //     </div>
    //   ),
    //   children : (
    //     <div>
    //       <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa nisi 
    //        ex id expedita error eum delectus consequuntur vero, at, ab dolores
    //        quisquam quibusdam deserunt consequatur?
    //       </p>
    //     </div>
    //   )
    // },
    {
      key: 'candidates',
      label: (
        <div  className='tab-container-items'  style={{ padding: '8px 0'}}>
          <img className='tab-image' src={candidate}></img>
          <span style={{ fontSize: '16px', fontWeight: 500, marginLeft:"5px" }}>Candidates({candidates.length})</span>
        </div>
      ),
      children: (
        <div className="candidates-list">
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <div key={candidate._id} className="candidate-card">
                <div className="candidate-info">
                  <div className='candidate-info-container'>
                    <div>
                      <h4>
                        <Link to={`/recruitment/candidates/${candidate._id}`} style={{fontWeight:"500", color:"#212529"}}>
                          {candidate.firstName} {candidate.lastName}
                        </Link>
                      </h4>
                      <p className="text-muted mb-1">{candidate.email}</p>
                      <p className="text-muted mb-1">Experience: {candidate.experience} years</p>
                      <p className="text-muted mb-2">Expected Salary: {candidate.expectedSalary}</p>
                      <Tag color={
                        candidate.status === 'PENDING' ? 'orange' :
                        candidate.status === 'SHORTLISTED' ? 'green' :
                        candidate.status === 'REJECTED' ? 'red' :
                        'default'
                      } style={{borderRadius:"70px"}}>
                        {candidate.status?.charAt(0) + candidate.status?.slice(1).toLowerCase()}
                      </Tag>
                    </div>
                    <Button onClick={() => navigate(`/recruitment/candidates/${candidate._id}`)} className='view-details-btn'>
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-5">
              <h4 className="text-muted">No candidates have applied for this position yet</h4>
              <p className="mb-0">Share this job posting to attract potential candidates</p>
            </div>
          )}
        </div>
      ),
    },
    // {
    //   key: 'interview',
    //   label: (
    //     <div  className='tab-container-items'  style={{padding:"8px 0"}}>
    //       <img className='tab-image' src={interview}></img>
    //       <span style={{ fontSize: '16px', fontWeight: 500, marginLeft:"5px" }}>Interview</span>
    //     </div>
    //   ),
    //   children:(
    //     <div>
    //       <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni culpa nobis
    //         doloribus voluptatum dolorum eveniet, eligendi accusamus! Assumenda quos,
    //         expedita harum aliquid voluptate, ipsam odio est sit eveniet nihil rerum!
    //       </p>
    //     </div>
    //   )
    // },
    {
      key: 'description',
      label: (
        <div  className='tab-container-items'  style={{ padding: '8px 0'}}>
          <img className='tab-image' src={description}></img>
          <span style={{ fontSize: '16px', fontWeight: 500, marginLeft:"5px"  }}>Description</span>
        </div>
      ),
      children: (
        <div className="job-description">
          {jobDetails?.description && (
            <div dangerouslySetInnerHTML={{ __html: jobDetails.description }} />
          )}
        </div>
      ),
    }
  ];

  const activeItem = items.find((item)=> item.key === active);

  const handleStatus = (status)=>{
    setJobStatus(status);
    setisOpen(false);
  }

  const menuToggler = ()=>{
    setisOpen(!isOpen);
  }

  const handleStatusChange = async (value) => {
    const token = localStorage.getItem('token') || authState?.access_token?.accessToken;
    
    if (!token) {
      console.error('No authentication token found');
      message.error('Authentication required');
      return;
    }

    setStatusLoading(true);
    
    try {
      const response = await apiServices(
        "PUT",
        `job/${jobId}`,
        { status: value,
          jobId: jobId
        },
        {
          access_token: {
            accessToken: token
          }
        }
      );

      if (response?.data?.status) {
        setJobStatus(value);
        setJobDetails({...jobDetails, status: value});
        message.success('Job status updated successfully');
      } else {
        message.error(response?.data?.message || 'Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      message.error('Failed to update job status');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="content container-fluid">
      {/* Header */}
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <div className="d-flex align-items-center">
              <div>
                <h3 className="page-title">Jobs</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/recruitment/dashboard">Dashboard</Link></li>
                  <li className="breadcrumb-item"><Link to="/recruitment/jobs">Jobs</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="col-auto">
            <Button 
              className='add-candidate-btn'
              onClick={handleAddCandidate}
            >
              <div className='btn-content'>
                <img src={circle} style={{marginRight:'8px', marginBottom:'20px'}}></img>
                <p>Add Candidate</p>  
              </div>
            </Button>
          </div>
        </div>
      </div>
      <div style={{width:'100%',borderTop:'1px solid #CFD4D8', display:'flex', justifySelf:'center', height:'50px', alignItems:'flex-end', marginBottom:'15px'}}>
        <div style={{display:'flex', marginBottom:'6px'}}>
          <div>
            <button onClick={()=>navigate('/recruitment/jobs')} style={{marginRight: '16px' ,padding:'0', border:'none', background:'transparent'}}>
              <img src={backBtn}></img>
            </button>
          </div>
          <div>
            <ul className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/recruitment/jobs">Jobs</Link></li>
              <li className="breadcrumb-item active">{jobDetails?.title || 'Job Details'}</li>
            </ul>
          </div>
        </div>
        <div>
          {/* new-section*/}
        </div>
      </div>
      <div style={{height:'130px', background:'#ffffff' ,border:'1px solid transparent' , borderRadius:'8px', marginBottom:"20px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <div style={{display:"flex", alignItems:'center'}}>
          <div style={{height:'80px' ,width:"80px", border:"1px solid transparent" , borderRadius:"50%", background:'#f5f1fd', color:'#9368e9', display:"flex", justifyContent:"center", alignItems:'center', marginLeft:"20px"}}>{jobDetails?.title.split(' ').map(word=>word.charAt(0).toUpperCase()).join('')}</div>
          <div>
          <h3 className="ms-3 mt-2 mb-0">{jobDetails?.title.split(' ').map(word=>word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</h3>
          <Tag color="success" className="ms-3 mt-1" style={{background:'#f5f1fd', borderRadius:"70px"}}>{jobDetails?.status?.charAt(0) + jobDetails?.status?.slice(1).toLowerCase()}</Tag>
          </div>
        </div>
        <div className='me-4' style={{position:'relative'}}>
          <Select
            placeholder="Job Status"
            loading={statusLoading}
            className='custom'
            value={jobDetails?.status}
            onChange={handleStatusChange}
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'CLOSED', label: 'Closed' },
              { value: 'DRAFT', label: 'Draft' },
            ]}
          />
        </div>      
      </div>

      <div className="row">
        {/* Left Panel */}
        <div className="col-md-4">
          <div className="card mb-4"   style={{border:"1px solid transparent", borderRadius:"8px"}}>
            <div className="card-body">

              <div className="info-section mb-4">
                <h5 className="mb-3" style={{fontSize:'18px', fontWeight:"500", color:'#212529'}}>Basic Information</h5>
                <div className="info-item">
                  <div className="me-2 mb-1" style={{height:"32px", width:'32px', background:'#f7f7f8', border:"1px solid transparent" , borderRadius:'50%', display:"flex", justifyContent:"center", alignItems:"center"}}><img src={target}></img></div>
                  <span>{jobDetails?.positions} Positions</span>
                </div>
                <div className="info-item">
                  <div className="me-2 mb-1" style={{height:"32px", width:'32px', background:'#f7f7f8', border:"1px solid transparent" , borderRadius:'50%', display:"flex", justifyContent:"center", alignItems:"center"}}><img src={department}></img></div>
                  <span>{jobDetails?.department}</span>
                </div>
                <div className="info-item">
                  <div className="me-2 mb-1" style={{height:"32px", width:'32px', background:'#f7f7f8', border:"1px solid transparent" , borderRadius:'50%', display:"flex", justifyContent:"center", alignItems:"center"}}><img src={calander}></img></div>
                  <span>{new Date(jobDetails?.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="applications-received-container mt-3 mb-0 pt-3 pb-3 ps-2 pe-3" style={{height:'60px', width:"100%", borderTop:'1px solid #E0E3E6' ,borderBottom:'1px solid #E0E3E6', display:'flex', justifyContent:"space-between"}}>
                  <span style={{fontSize:"16px", fontweight:'450'}}>Applications Received</span>
                  <span  className="applications-received" style={{fontSize:"28px", fontweight:"'500", color:'#FF9244', display:'flex', alignSelf:'center', justifySelf:'center', marginLeft:'25px'}}>{candidates.length}</span>
                </div>

              </div>

              <div className="info-section mb-4">
                <h5 className="mb-3"  style={{fontSize:'18px', fontWeight:"500", color:'#212529'}}>Other Information</h5>
                <div className="info-item">
                  <span className='other-info-content-left'  style={{fontSize:'14px', fontWeight:"450", color:'#212529', width:"32%"}}>Job Type</span>
                  <span className='other-info-content-right' style={{fontSize:'14px', fontWeight:"450", color:'#56616B', width:"32%"}}>{jobDetails?.jobType?.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}</span>
                </div>
                <div className="info-item">
                <span className='other-info-content-left' style={{fontSize:'14px', fontWeight:"450", color:'#212529', width:"32%"}}>Location</span>
                <span className='other-info-content-right' style={{fontSize:'14px', fontWeight:"450", color:'#56616B', width:"32%"}}>{jobDetails?.workSetup?.charAt(0) + jobDetails?.workSetup?.slice(1).toLowerCase()}</span>
                </div>
                <div className="info-item">
                  <span className='other-info-content-left' style={{fontSize:'14px', fontWeight:"450", color:'#212529', width:"32%"}}>Salary</span>
                  <span className='other-info-content-right' style={{fontSize: '14px', fontWeight: '450', color: '#56616B', width: '32%'}}>
                  {jobDetails?.salaryRange
                    ? jobDetails.salaryRange.includes(' - ')
                    ? jobDetails.salaryRange.split(' - ')
                    .map(salary => salary >= 1_000 ? Math.round(salary / 1_000) + 'K' : salary)
                    .join(' - ')
                    : (jobDetails.salaryRange >= 1_000 
                    ? Math.round(jobDetails.salaryRange / 1_000) + 'K': jobDetails.salaryRange)
                  : 'N/A'}
                  </span>
                </div>
                <div className="mb-0 ps-2 pe-3" style={{ width:"100%" ,borderBottom:'1px solid #E0E3E6'}}>
                </div>
              </div>

              <div className="info-section">
                <h5 className="mb-3" style={{fontSize:'18px', fontWeight:"500", color:'#212529'}}>Posted on</h5>
                <div className="d-flex gap-2">
                  {jobDetails?.postingPlatforms.includes("WEBSITE") && (
                    <img src={website}></img>
                  )}
                  {jobDetails?.postingPlatforms.includes("LINKEDIN") && (
                    <img src={linkdin}></img>
                  )}
                  {jobDetails?.postingPlatforms.includes("FACEBOOK") && (
                    <img src={facebook}></img>
                  )}
                  {jobDetails?.postingPlatforms.includes("INDEED") && (
                    <img src={indeed}></img>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-md-8">
          <div className="card pt-4 pb-4" style={{border:"1px solid transparent" ,borderRadius:"8px", display:"flex", flexDirection:"row", justifyContent:"space-between"}}>
            <div className='tab-container'>
              {items.map((item)=>(
                <div key={item.key} className={`tab-label ${active === item.key ? 'active' : ''}`} style={{}} onClick={()=>{setActive(item.key)}}>{item.label}</div>
              ))}
            </div>
            
          </div>
          <div className='card p-4' style={{border:'1px solid transparent' , borderRadius:'8px'}}>
            <div>
              {activeItem?.children}
            </div>
          </div>
        </div>
      </div>

      {/* Add Candidate Modal */}
      <CreateCandidateModal
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onSuccess={handleModalSuccess}
        initialValues={{
          appliedFor: jobId,
          appliedDate: moment()
        }}
      />

      <style jsx>{`
        .tab-container{
          display: flex;
          gap: 10px;
          justify-content: flex-start;
          flex-wrap: wrap;
          width: 100%;
        }
        
        .job-details-tabs .ant-tabs-nav {
          margin-bottom: 24px;
        }
        .job-details-tabs .ant-tabs-tab {
          padding: 12px 0;
          margin: 0 32px 0 0;
        }
        .job-details-tabs .ant-tabs-tab-active {
          font-weight: 600;
        }
        .job-description {
          font-size: 16px;
          line-height: 1.6;
          color: #333;
        }
        .info-section:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .info-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          color: #666;
        }
        .info-item:last-child {
          margin-bottom: 0;
        }
        .candidates-list {
          display: grid;
          gap: 16px;
        }
        .candidate-card {
          padding: 16px;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        .candidate-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .candidate-info h4 {
          margin: 0 0 8px;
        }
        .candidate-info p {
          margin: 0 0 8px;
          color: #666;
        }
        .custom-modal .ant-modal-header {
          border-bottom: none;
          padding: 24px 24px 0;
        }
        .custom-modal .ant-modal-title {
          font-size: 24px;
          font-weight: 600;
        }
        .custom-modal .ant-form-item-label > label {
          font-weight: 500;
        }
        .custom-modal .ant-input,
        .custom-modal .ant-select-selector,
        .custom-modal .ant-picker,
        .custom-modal .ant-input-number {
          border-radius: 8px;
          padding: 8px 12px;
          height: 40px;
        }
        .custom-modal .ant-select-selection-placeholder,
        .custom-modal .ant-input::placeholder {
          color: #6C757D;
        }
        .upload-resume {
          background: #F8F9FA;
          padding: 16px;
          border-radius: 8px;
        }
        .upload-resume p {
          margin-bottom: 12px;
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


        .custom  .ant-select-selector {
        height: 40px !important;
        border-radius: 8px !important;
        display: flex;
        align-items: center;
        padding-left: 10px;
        }

        .custom .ant-select-placeholder {
        color: white !important;
        }

        .tab-label {
          margin-left: 25px;
          margin-right: 25px;
          cursor: pointer;
          color: #a5adb6;
          transition: color 0.5s ease, border-bottom 0.5s ease;
        }

        .tab-label.active {
          color:#ff9244;
          border-bottom: 2px solid #ff9244;
        }

        .tab-image {
         color: #a5adb6;
         height:20px; 
         width:20px; 
         margin-bottom:7px;
        }

        .candidate-info-container{
          display:flex;
          justify-content: space-between;
          align-items:center;
        }

        .tab-image .active{
         color: #ff9244;
        }

        .view-details-btn{
          background-color:#ff9244;
          color:#ffffff;
          border-radius:12px;
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .dropdown-btn{
            height: 30px !important;
          }
        }

        @media (max-width: 450px){
        .candidate-info-container{
          display:flex;
          flex-direction: column;
          align-items:flex-start;
        }
        }
        
        @media (min-width: 300px) and (max-width: 450px) {
          .dropdown-btn{
            margin-left: 15px;
            height: 30px !important;
            width: 60px !important;
            font-size: 10px !important;
          }
          .view-details-btn{
            margin-top: 20px;
          }
        }

        @media (min-width: 993px) and (max-width: 1199px) {
          .applications-received-container{
            padding-top: 8px !important;
            padding-bottom: 8px !important;
          }
        }
        @media (min-width: 768px) and (max-width: 970px) {
          .applications-received-container{
            padding-top: 8px !important;
            padding-bottom: 8px !important;
          }
        }
        @media (min-width: 250px) and (max-width: 332px) {
          .applications-received-container{
            padding-top: 8px !important;
            padding-bottom: 8px !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1250px) {
          .other-info-content-left{
            width: 50% !important;
        
          };
        }
        @media (min-width: 990px) and (max-width: 1200px) {
          .other-info-content-right{
            width: 50% !important;
          };
        }
        @media (min-width: 768px) and (max-width: 960px) {
          .other-info-content-right{
            width: 50% !important;
          };
        }
        @media (min-width: 300px) and (max-width: 350px) {
          .other-info-content-right{
            margin-left: 20px !important;
          };
        }

        @media (min-width: 768px) and (max-width: 1305px) {
          .tab-container{
            gap: 25%;
          };
        }

        @media (min-width: 535px) and (max-width: 736px) {
          .tab-container{
            gap: 25%;
          };
        }

        @media (min-width: 350px) and (max-width: 384px) {
          .tab-container{
            gap: 45%;
          };
        }









      `}</style>
    </div>
  );
};

export default JobDetails; 

