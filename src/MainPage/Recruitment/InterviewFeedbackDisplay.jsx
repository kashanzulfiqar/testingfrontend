import React from 'react';
import { Card, Row, Col } from 'antd';
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
    <Card className="mb-4" style={{ background: "#f7f7f8", marginTop: "20px", borderRadius: "4px", padding: "15px 10px", flexWrap:"wrap" }}>
      <Row gutter={[16, 16]} justify="space-between" align="middle">
        <Col xs={24} md={18} style={{ display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap", overflow: "hidden", flexWrap:"wrap" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "500", color: "#212529", margin: 0 }}>Interview Feedback By</h3>
          <img src={feedback.submittedBy?.imageUrl} style={{ height: "28px", width: "28px", borderRadius: "50%" }} alt="Reviewer" />
          <p style={{ fontSize: "12px", fontWeight: "500", color: "#ff9244", margin: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
            {feedback.submittedBy?.fullName}
          </p>
        </Col>
        <Col xs={24} md={6} className='date-time-styles'>
          <p style={{ fontSize: "12px", fontWeight: "500", color: "#67748e", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {moment(feedback.createdAt).format("ddd, MMM DD @ hh:mm a")}
          </p>
        </Col>
      </Row>
      <Row gutter={[8, 8]} align="middle" style={{ marginTop: "15px", whiteSpace: "nowrap" }}>
        <Col>
          <p style={{ fontSize: "12px", fontWeight: "500", color: "#212529", margin: 0 }}>Decision:</p>
        </Col>
        <Col>
          <h3 style={{ fontSize: "16px", fontWeight: "500", color: "#47ac52", margin: 0 }}>{feedback.recommendation}</h3>
        </Col>
      </Row>
      <Row style={{ marginTop: "15px" }}>
        <Col span={24} style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
          <p style={{ fontSize: "14px", fontWeight: "450", color: "#6f7d8a", margin: 0 }}>{feedback.description}</p>
        </Col>
      </Row>
      <Row gutter={[8, 8]} wrap={true} style={{ marginTop: "20px", display: "flex", flexWrap: "wrap" }}>
      {[
        { label: "Soft Skills", value: feedback.ratings.softSkills },
        { label: "Technical Skills 1", value: feedback.ratings.technicalSkills1 },
        { label: "Behaviour", value: feedback.ratings.behavior },
        { label: "Technical Skills 2", value: feedback.ratings.technicalSkills2 },
        { label: "Technical Skills 3", value: feedback.ratings.technicalSkills3 },
      ].map((rating, index) => (
        <Col key={index} xs={12} sm={12} md={8} style={{ minWidth: "130px" }}>
          <div style={{ background: "#e0e3e6", padding: "3px 5px", borderRadius: "4px", textAlign: "center", whiteSpace: "nowrap" }}>
            {rating.label}
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "5px", gap: "5px" }}>
            <img src={star} style={{ height: "14px", width: "14px" }} alt="Star" />
            <h3 style={{ fontSize: "15px", fontWeight: "500", margin: 0 }}>{rating.value}</h3>
          </div>
        </Col>
      ))}
    </Row>
    <style jsx global>{`
    .date-time-style{
      text-align: right;
      min-width: 190px;
    }

    @media (max-width: 946px){
      .date-time-style{
        text-align: left;
      }
    }
    `}</style>
  </Card>
    // <Card className="mb-4" style={{background:"#f7f7f8" , marginTop:"20px" ,borderRadius:"4px", padding:"15px 10px 15px 10px"}}>
    //   <div style={{display:'flex' ,justifyContent:"space-between"}}>
    //     <div style={{display:'flex', gap:'15px'}}>
    //       <h3 style={{fontSize:'16px' ,fontWeight:"500" ,color:"#212529" ,marginTop:"3px"}}>Interview Feedback By</h3>
    //       <img src={feedback.submittedBy?.imageUrl} style={{height:"30px" ,width:"30px", borderRadius:'50%'}}></img>
    //       <p  style={{fontSize:'12px' ,fontWeight:"500" ,color:"#ff9244", marginBottom:'0px' ,marginTop:"5px"}}>{feedback.submittedBy?.fullName}</p>
    //     </div>
    //     <p style={{fontSize:'12px' ,fontWeight:"500" ,color:"#67748e", marginBottom:'0px', marginTop:'5px'}}>{moment(feedback.createdAt).format('ddd, MMM DD @ hh:mm a')}</p>
    //   </div>
    //   <div style={{display:'flex' ,gap:"15px" ,marginTop:"15px"}}>
    //     <p style={{fontSize:'12px' ,fontWeight:"500" ,color:"#212529", marginBottom:'0px' ,marginTop:"5px"}}>Decision:</p>
    //     <h3 style={{fontSize:'16px' ,fontWeight:"500",color:"#47ac52" ,marginTop:"3px" }}>{feedback.recommendation}</h3>
    //   </div>
    //   <div  style={{display:'flex' ,gap:"15px" ,marginTop:"15px"}}>
    //     <p style={{fontSize:'14px' ,fontWeight:"450" ,color:"#6f7d8a", marginBottom:'0px' ,marginTop:"5px"}}>{feedback.description}</p>
    //   </div>
    //   <div  style={{display:'flex' ,gap:"15px" ,marginTop:"20px"}}>
    //     <div>
    //       <div style={{background:"#e0e3e6" , padding:'3px 5px 3px 5px'}}>Soft Skills</div>
    //       <div style={{display:'flex' , gap:"5px", marginTop:"5px"}}>
    //         <img src={star} style={{height:'14px' ,width:"14px"}}></img>
    //         <h3  style={{fontSize:"15px" ,fontWeight:'500', paddingBottom:'2px'}}>{feedback.ratings.softSkills}</h3>
    //       </div>
    //     </div>

    //     <div>
    //       <div style={{background:"#e0e3e6" , padding:'3px 5px 3px 5px'}}>Technical Skills</div>
    //       <div style={{display:'flex' , gap:"5px", marginTop:"5px"}}>
    //         <img src={star} style={{height:'14px' ,width:"14px"}}></img>
    //         <h3  style={{fontSize:"15px" ,fontWeight:'500', paddingBottom:'2px'}}>{feedback.ratings.technicalSkills1}</h3>
    //       </div>
    //     </div>

    //     <div>
    //       <div style={{background:"#e0e3e6" , padding:'3px 5px 3px 5px'}}>Behaviour</div>
    //       <div style={{display:'flex' , gap:"5px", marginTop:"5px"}}>
    //         <img src={star} style={{height:'14px' ,width:"14px"}}></img>
    //         <h3  style={{fontSize:"15px" ,fontWeight:'500', paddingBottom:'2px'}}>{feedback.ratings.behavior} </h3>
    //       </div>
    //     </div>

    //     <div>
    //       <div style={{background:"#e0e3e6" , padding:'3px 5px 3px 5px'}}>Technical Skills</div>
    //       <div style={{display:'flex' , gap:"5px", marginTop:"5px"}}>
    //         <img src={star} style={{height:'14px' ,width:"14px"}}></img>
    //         <h3  style={{fontSize:"15px" ,fontWeight:'500', paddingBottom:'2px'}}>{feedback.ratings.technicalSkills2}</h3>
    //       </div>
    //     </div>

    //     <div>
    //       <div style={{background:"#e0e3e6" , padding:'3px 5px 3px 5px'}}>Technical Skills</div>
    //       <div style={{display:'flex' , gap:"5px", marginTop:"5px"}}>
    //         <img src={star} style={{height:'14px' ,width:"14px"}}></img>
    //         <h3  style={{fontSize:"15px" ,fontWeight:'500', paddingBottom:'2px'}}>{feedback.ratings.technicalSkills3}</h3>
    //       </div>
    //     </div>
    //   </div>

    // </Card>
  );
};

export default InterviewFeedbackDisplay; 