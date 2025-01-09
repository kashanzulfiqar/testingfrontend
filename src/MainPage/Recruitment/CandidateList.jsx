import React from 'react';
import { Tag } from 'antd';
import moment from 'moment';

const getCurrentStage = (candidate) => {
  const today = moment();
  
  // Check upcoming interviews
  const upcomingInterview = candidate.interviews?.find(interview => 
    interview.status === 'scheduled' && 
    moment(interview.interviewDate).isAfter(today)
  );
  
  if (upcomingInterview) {
    return {
      text: `Interview scheduled on ${moment(upcomingInterview.interviewDate).format('DD MMM')}`,
      type: 'upcoming-interview'
    };
  }

  // Check pending tasks
  const pendingTask = candidate.tasks?.find(task => 
    task.status === 'PENDING' && 
    moment(task.lastDateOfSubmission).isAfter(today)
  );
  
  if (pendingTask) {
    return {
      text: `Task due on ${moment(pendingTask.lastDateOfSubmission).format('DD MMM')}`,
      type: 'pending-task'
    };
  }

  // Check latest completed interview
  const latestCompletedInterview = candidate.interviews
    ?.filter(interview => interview.status === 'completed')
    .sort((a, b) => moment(b.interviewDate).diff(moment(a.interviewDate)))[0];
  
  if (latestCompletedInterview) {
    return {
      text: `Interview completed on ${moment(latestCompletedInterview.interviewDate).format('DD MMM')}`,
      type: 'completed-interview'
    };
  }

  // Check latest submitted task
  const latestSubmittedTask = candidate.tasks
    ?.filter(task => task.status === 'SUBMITTED' || task.status === 'COMPLETED')
    .sort((a, b) => moment(b.lastDateOfSubmission).diff(moment(a.lastDateOfSubmission)))[0];
  
  if (latestSubmittedTask) {
    return {
      text: `Task ${latestSubmittedTask.status.toLowerCase()} on ${moment(latestSubmittedTask.lastDateOfSubmission).format('DD MMM')}`,
      type: 'completed-task'
    };
  }

  // Default case
  return {
    text: 'New Application',
    type: 'new'
  };
};

export { getCurrentStage }; 