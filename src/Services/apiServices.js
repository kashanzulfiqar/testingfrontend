import axios from "axios";
import {store} from '../Entryfile/Main.js';
import { logout } from "../Entryfile/features/users.jsx";
import { superAdmin } from "../Redux/Reducer/permissions/superAdminSlice.js";
import { BASE_URL } from '../config/apiConfig';

let location = window.location.origin;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Try to get token from Redux store first
    const state = store.getState();
    let token = state?.user?.loginvalue?.access_token?.accessToken;
    
    // Fallback to localStorage if not in Redux store
    if (!token) {
      token = localStorage.getItem('token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 'application/json';
    config.headers.Accept = 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check for authentication errors (401) or token expiration
    if (
      error?.response?.status === 401 || 
      error?.response?.data?.error?.message === "jwt expired" || 
      error?.response?.data?.err?.message === "jwt expired" ||
      error?.response?.data?.message === "Invalid token" ||
      error?.response?.data?.message === "Token is required"
    ) {
      console.log('Authentication failed - clearing session');
      
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('languagePreference');
      localStorage.removeItem('firstTimeLogin');
      sessionStorage.clear();
      
      // Dispatch logout action to clear Redux state
      store.dispatch(logout());
      
      // Redirect to login page
      const loginPath = `${location}/login`;
      if (window.location.pathname !== '/login') {
        setTimeout(() => {
          window.location.href = loginPath;
        }, 100);
      }
    }
    
    return Promise.reject(error);
  }
);

export const apiServices = async (type, endpoint, data, state) => {
  try {
    const config = {
      url: `/${endpoint}`,
      method: type,
      ...(data && { data }),
      ...(endpoint.includes('payrolls/download-payroll') && { responseType: 'blob' })
    };

    const response = await axiosInstance(config);
    return response;
  } catch (error) {
    console.error(`${type} API FAILED!`);
    throw error;
  }
};

export { BASE_URL };