import React from 'react';
import { Card, Avatar } from 'antd';
import { StarFilled } from '@ant-design/icons';
import moment from 'moment';
import star from '../../assets/iconsRecruitment/star.svg';

const RatingItem = ({ label, value }) => (
  <div className="rating-item">
    <div className="rating-label">{label}</div>
    <div className="rating-value">
      <StarFilled style={{ color: '#FFD700' }} /> {value.toFixed(1)}
    </div>
  </div>
);

const InterviewFeedbackDisplay = ({ feedback }) => {
  return (
    <Card className="mb-4" style={{background:"#f7f7f8" , marginTop:"20px" ,borderRadius:"4px", padding:"15px 10px 15px 10px"}}>
      <div style={{display:'flex' ,justifyContent:"space-between"}}>
        <div style={{display:'flex', gap:'15px'}}>
          <h3 style={{fontSize:'16px' ,fontWeight:"500" ,color:"#212529" ,marginTop:"3px"}}>Interview Feedback By</h3>
          <img src={feedback.submittedBy?.imageUrl} style={{height:"30px" ,width:"30px", borderRadius:'50%'}}></img>
          <p  style={{fontSize:'12px' ,fontWeight:"500" ,color:"#ff9244", marginBottom:'0px' ,marginTop:"5px"}}>{feedback.submittedBy?.fullName}</p>
        </div>
        <p style={{fontSize:'12px' ,fontWeight:"500" ,color:"#67748e", marginBottom:'0px', marginTop:'5px'}}>{moment(feedback.createdAt).format('ddd, MMM DD @ hh:mm a')}</p>
      </div>
      <div style={{display:'flex' ,gap:"15px" ,marginTop:"15px"}}>
        <p style={{fontSize:'12px' ,fontWeight:"500" ,color:"#212529", marginBottom:'0px' ,marginTop:"5px"}}>Decision:</p>
        <h3 style={{fontSize:'16px' ,fontWeight:"500",color:"#47ac52" ,marginTop:"3px" }}>{feedback.recommendation}</h3>
      </div>
      <div  style={{display:'flex' ,gap:"15px" ,marginTop:"15px"}}>
        <p style={{fontSize:'14px' ,fontWeight:"450" ,color:"#6f7d8a", marginBottom:'0px' ,marginTop:"5px"}}>{feedback.description}</p>
      </div>
      <div  style={{display:'flex' ,gap:"15px" ,marginTop:"20px"}}>
        <div>
          <div style={{background:"#e0e3e6" , padding:'3px 5px 3px 5px'}}>Soft Skills</div>
          <div style={{display:'flex' , gap:"5px", marginTop:"5px"}}>
            <img src={star} style={{height:'14px' ,width:"14px"}}></img>
            <h3  style={{fontSize:"15px" ,fontWeight:'500', paddingBottom:'2px'}}>{feedback.ratings.softSkills}</h3>
          </div>
        </div>

        <div>
          <div style={{background:"#e0e3e6" , padding:'3px 5px 3px 5px'}}>Technical Skills</div>
          <div style={{display:'flex' , gap:"5px", marginTop:"5px"}}>
            <img src={star} style={{height:'14px' ,width:"14px"}}></img>
            <h3  style={{fontSize:"15px" ,fontWeight:'500', paddingBottom:'2px'}}>{feedback.ratings.technicalSkills1}</h3>
          </div>
        </div>

        <div>
          <div style={{background:"#e0e3e6" , padding:'3px 5px 3px 5px'}}>Behaviour</div>
          <div style={{display:'flex' , gap:"5px", marginTop:"5px"}}>
            <img src={star} style={{height:'14px' ,width:"14px"}}></img>
            <h3  style={{fontSize:"15px" ,fontWeight:'500', paddingBottom:'2px'}}>{feedback.ratings.behavior} </h3>
          </div>
        </div>

        <div>
          <div style={{background:"#e0e3e6" , padding:'3px 5px 3px 5px'}}>Technical Skills</div>
          <div style={{display:'flex' , gap:"5px", marginTop:"5px"}}>
            <img src={star} style={{height:'14px' ,width:"14px"}}></img>
            <h3  style={{fontSize:"15px" ,fontWeight:'500', paddingBottom:'2px'}}>{feedback.ratings.technicalSkills2}</h3>
          </div>
        </div>

        <div>
          <div style={{background:"#e0e3e6" , padding:'3px 5px 3px 5px'}}>Technical Skills</div>
          <div style={{display:'flex' , gap:"5px", marginTop:"5px"}}>
            <img src={star} style={{height:'14px' ,width:"14px"}}></img>
            <h3  style={{fontSize:"15px" ,fontWeight:'500', paddingBottom:'2px'}}>{feedback.ratings.technicalSkills3}</h3>
          </div>
        </div>
      </div>
      {/* <div className="d-flex align-items-center gap-2 mb-3">
        <Avatar 
          src={feedback.submittedBy?.imageUrl}
          style={{ backgroundColor: feedback.submittedBy?.imageUrl ? 'transparent' : '#f56a00' }}
        >
          {!feedback.submittedBy?.imageUrl && `${feedback.submittedBy?.firstName?.charAt(0)}${feedback.submittedBy?.lastName?.charAt(0)}`}
        </Avatar>
        <div>
          <div className="d-flex align-items-center gap-2">
            <span>Interview Feedback by</span>
            <strong>{feedback.submittedBy?.firstName} {feedback.submittedBy?.lastName}</strong>
          </div>
          <small className="text-muted">{moment(feedback.createdAt).format('ddd, MMM DD @ hh:mm a')}</small>
        </div>
      </div>

      <div className="mb-3">
        <div className="mb-2">
          <strong>Decision: </strong>
          <span>{feedback.recommendation}</span>
        </div>
        <p>{feedback.description}</p>
      </div>

      <div className="ratings-row">
        <RatingItem label="Soft skills" value={feedback.ratings.softSkills} />
        <RatingItem label="Technical Skills" value={feedback.ratings.technicalSkills1} />
        <RatingItem label="Behavior" value={feedback.ratings.behavior} />
        <RatingItem label="Technical Skills" value={feedback.ratings.technicalSkills2} />
        <RatingItem label="Technical Skills" value={feedback.ratings.technicalSkills3} />
      </div>

      <style jsx>{`
        .ratings-row {
          display: flex;
          gap: 24px;
          padding: 12px 16px;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        .rating-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .rating-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }
        .rating-value {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
        }
      `}</style> */}
    </Card>
  );
};

export default InterviewFeedbackDisplay; 