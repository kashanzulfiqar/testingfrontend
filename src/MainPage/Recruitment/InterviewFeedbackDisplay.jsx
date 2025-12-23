import React from 'react';
import { Card } from 'antd';
import { StarFilled } from '@ant-design/icons';
import moment from 'moment';
import star from '../../assets/iconsRecruitment/star.svg';
import editIcon from '../../assets/iconsRecruitment/editIcon.svg';
import { user_icon } from '../../Entryfile/imagepath';
const InterviewFeedbackDisplay = ({ feedback, onEdit, loggedInUser }) => {
  const r = feedback?.ratings || {};
  const hasLegacy =
    r?.softSkillRating !== undefined ||
    r?.technicalRating !== undefined ||
    r?.behaviorRating !== undefined ||
    r?.leadershipRating !== undefined ||
    r?.teamworkRating !== undefined;

  const hasTask =
    r?.EfficientWorkingSkills !== undefined ||
    r?.ProblemSolvingSkills !== undefined ||
    r?.PresentationSkills !== undefined;

  // Check if current user can edit this feedback
  const canEditFeedback = 
    loggedInUser &&
    (loggedInUser?.role === "admin" || 
     (loggedInUser?._id && feedback?.submittedBy?._id === loggedInUser._id));

  const data = hasLegacy
    ? [
        { label: "Soft Skills", value: r.softSkillRating },
        { label: "Technical Skills", value: r.technicalRating },
        { label: "Behaviour", value: r.behaviorRating },
        { label: "Leadership Skills", value: r.leadershipRating },
        { label: "Teamwork Skills", value: r.teamworkRating },
      ]
    : hasTask
    ? [
        { label: "Efficient Working Skills", value: r.EfficientWorkingSkills },
        { label: "Problem Solving Skills", value: r.ProblemSolvingSkills },
        { label: "Presentation Skills", value: r.PresentationSkills },
      ]
    : [];

  const calculateAverage = () => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
    return (sum / data.length).toFixed(1);
  };

  const averageRating = calculateAverage();

  return (
    <Card className="mb-4 feedback-card-outer" style={{ background: "#f7f7f8", marginTop: "20px", borderRadius: "4px", padding: "15px 10px" }}>
      {/* Header Row */}
      <div className="feedback-header-row">
        <div className="feedback-reviewer">
          <span className="feedback-title">Interview Feedback by</span>
          {feedback.submittedBy && (
            <img src={feedback.submittedBy?.imageUrl || user_icon} className="feedback-avatar" alt="Reviewer" />
          )}
          {feedback?.reviewerId && (
            <img src={feedback.reviewerId?.imageUrl || user_icon} className="feedback-avatar" alt="Reviewer" />
          )}
          <span className="feedback-reviewer-name">{feedback.submittedBy?.fullName}</span>
          <span className="feedback-reviewer-name">{feedback.reviewerId?.fullName}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
          <div className="feedback-date">
            {moment(feedback.createdAt).format("ddd, MMM DD @ hh:mm a")}
          </div>
          {onEdit && canEditFeedback && (
            <a
              href="javascript:void(0)"
              className="edit-icon"
              style={{ cursor: "pointer" }}
              onClick={() => onEdit(feedback)}
            >
              <i className="fa fa-pencil" />
            </a>
          )}
        </div>
      </div>
      {/* Decision Row */}
      <div className="feedback-decision-row">
        <span className="feedback-decision-label">Decision :</span>
        <span className="feedback-decision-value">{feedback.recommendation} {feedback.decision}</span>
      </div>
      
      {/* Average Rating Row */}
      <div className="feedback-decision-row" style={{ marginTop: '5px' }}>
         <span className="feedback-decision-label">Average Rating :</span>
         <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img src={star} style={{ height: "14px", width: "14px" }} alt="Star" />
            <span className="feedback-decision-value">{averageRating}</span>
         </div>
      </div>

      {/* Description */}
      <div className="feedback-description">
        {feedback.description}
      </div>
      {/* Ratings Grid */}
      <div className="feedback-ratings-row">
        {data.map((rating, index) => (
            <div className="feedback-rating-card" key={index}>
              <div className="feedback-rating-label">{rating.label}</div>
              <div className="feedback-rating-value-row">
                <img src={star} style={{ height: "14px", width: "14px" }} alt="Star" />
                <span className="feedback-rating-value">{Number(rating.value || 0).toFixed(1)}</span>
              </div>
            </div>
          ))}
      </div>
      <style>{`
.feedback-card-outer {
  box-shadow: none;
}
.feedback-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.feedback-reviewer {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.feedback-title {
  font-size: 14px;
  font-weight: 500;
  color: #212529;
}
.feedback-avatar {
  height: 28px;
  width: 28px;
  border-radius: 50%;
  object-fit: cover;
}
.feedback-reviewer-name {
  font-size: 12px;
  font-weight: 500;
  color: #ff9244;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.feedback-date {
  font-size: 12px;
  font-weight: 500;
  color: #67748e;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
.feedback-decision-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
}
.feedback-decision-label {
  font-size: 12px;
  font-weight: 500;
  color: #212529;
}
.feedback-decision-value {
  font-size: 16px;
  font-weight: 500;
  color: #47ac52;
}
.feedback-description {
  font-size: 14px;
  font-weight: 450;
  color: #6f7d8a;
  margin-top: 15px;
  margin-bottom: 0;
  word-break: break-word;
}
.feedback-ratings-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
  justify-content: flex-start;
}
.feedback-rating-card {
  background: #e0e3e6;
  padding: 8px 12px;
  border-radius: 8px;
  text-align: center;
  min-width: 110px;
  flex: 1 1 110px;
  max-width: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}
.feedback-rating-label {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  margin-bottom: 4px;
}
.feedback-rating-value-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}
.feedback-rating-value {
  font-size: 15px;
  font-weight: 500;
  margin: 0;
}
@media (max-width: 1023.98px) {
  .feedback-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .feedback-ratings-row {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  .feedback-rating-card {
    max-width: 100%;
    width: 100%;
    min-width: 0;
  }
}
`}</style>
    </Card>
  );
};

export default InterviewFeedbackDisplay;