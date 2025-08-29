import axios from 'axios';
import { BASE_URL } from '../config/apiConfig';
import { handleApiError } from '../utils/errorHandler';

// Helper function to get headers with auth token
const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
  Accept: 'application/json',
});

export const jobsService = {
  // Create a new job
  createJob: async (jobData, token, navigate) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/job/create`,
        jobData,
        { headers: getHeaders(token) }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, navigate);
    }
  },

  // Get list of jobs with pagination and filters
  listJobs: async ({ page = 1, limit = 10, ...filters } = {}, token, navigate) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      }).toString();

      const response = await axios.get(
        `${BASE_URL}/job/list?${queryParams}`,
        { headers: getHeaders(token) }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, navigate);
    }
  },

  // Get job details by ID
  getJobDetails: async (jobId, token, navigate) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/job/${jobId}`,
        { headers: getHeaders(token) }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, navigate);
    }
  },

  // Update job details
  updateJob: async (jobId, jobData, token, navigate) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/job/${jobId}/update`,
        jobData,
        { headers: getHeaders(token) }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, navigate);
    }
  },

  // Delete a job
  deleteJob: async (jobId, token, navigate) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/job/${jobId}/delete`,
        { headers: getHeaders(token) }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, navigate);
    }
  },

  // Change job status
  changeJobStatus: async (jobId, status, token, navigate) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/job/${jobId}/status`,
        { status },
        { headers: getHeaders(token) }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, navigate);
    }
  },

  // Post job to social media
  postToSocialMedia: async (jobId, platforms, token, navigate) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/job/${jobId}/share`,
        { platforms },
        { headers: getHeaders(token) }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error, navigate);
    }
  }
};
