import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Spin, Alert, Row, Col, Tag, Button } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { apiServices } from '../../Services/apiServices';
import moment from 'moment';

const { Title, Text } = Typography;

const PublicInterviewPage = () => {
  const { token } = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInterviewDetails();
  }, [token]);

  const fetchInterviewDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiServices(
        'GET',
        `interview/public/${token}`,
        null,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response?.data?.status) {
        setInterview(response.data.data);
      } else {
        setError(response?.data?.message || 'Failed to fetch interview details');
      }
    } catch (error) {
      console.error('Error fetching interview details:', error);
      setError(
        error.response?.data?.message || 
        'An error occurred while fetching the interview details. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip="Loading interview details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  if (!interview) {
    return (
      <div style={{ padding: '2rem' }}>
        <Alert
          message="Interview Not Found"
          description="The interview details you're looking for could not be found. Please check the URL and try again."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <Card>
        <Title level={2} style={{ marginBottom: '2rem', color: '#1890ff' }}>
          {interview.title}
        </Title>

        <Row gutter={[16, 24]}>
          <Col span={24}>
            <Card type="inner" title="Interview Details">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text strong><CalendarOutlined /> Date: </Text>
                  <Text>{moment(interview.date).format('MMMM D, YYYY')}</Text>
                </Col>
                <Col span={12}>
                  <Text strong><ClockCircleOutlined /> Time: </Text>
                  <Text>{moment(interview.date).format('h:mm A')}</Text>
                </Col>
                <Col span={24}>
                  <Text strong><UserOutlined /> Interviewer: </Text>
                  <Text>{interview.interviewer?.name || 'TBD'}</Text>
                </Col>
                {interview.meetingLink && (
                  <Col span={24}>
                    <Text strong><VideoCameraOutlined /> Meeting Link: </Text>
                    <Button type="link" href={interview.meetingLink} target="_blank">
                      Join Meeting
                    </Button>
                  </Col>
                )}
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card type="inner" title="Status">
              <Tag color={interview.status === 'SCHEDULED' ? 'green' : 'blue'}>
                {interview.status}
              </Tag>
            </Card>
          </Col>

          {interview.notes && (
            <Col span={24}>
              <Card type="inner" title="Additional Notes">
                <Text>{interview.notes}</Text>
              </Card>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
};

export default PublicInterviewPage;
