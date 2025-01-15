import React from 'react';
import { Card, Avatar } from 'antd';
import { StarFilled } from '@ant-design/icons';
import moment from 'moment';

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
    <Card className="mb-4">
      <div className="d-flex align-items-center gap-2 mb-3">
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
      `}</style>
    </Card>
  );
};

export default InterviewFeedbackDisplay; 