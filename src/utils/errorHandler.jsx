import { message } from 'antd';
import { store } from '../Entryfile/Main';
import { logout } from '../Entryfile/features/users';

export const handleApiError = (error, navigate) => {
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400:
        // Handle validation errors
        if (data.errors) {
          Object.entries(data.errors).forEach(([field, errorMessage]) => {
            message.error(`${field}: ${errorMessage}`);
          });
        } else {
          message.error(data.message || 'Invalid request. Please check your input.');
        }
        break;

      case 401:
        // Handle unauthorized access
        message.error('Your session has expired. Please log in again.');
        store.dispatch(logout());
        if (navigate) {
          navigate('/login');
        }
        break;

      case 403:
        // Handle forbidden access
        message.error('You do not have permission to perform this action.');
        break;

      case 404:
        // Handle not found
        message.error('The requested resource was not found.');
        if (navigate) {
          navigate(-1); // Go back to previous page
        }
        break;

      case 429:
        // Handle rate limiting
        message.error('Too many requests. Please try again later.');
        break;

      case 500:
        // Handle server errors
        message.error('An internal server error occurred. Please try again later.');
        break;

      default:
        message.error('An unexpected error occurred. Please try again.');
    }
  } else if (error.request) {
    // Network error
    message.error('Unable to connect to the server. Please check your internet connection.');
  } else {
    // Other errors
    message.error(error.message || 'An unexpected error occurred.');
  }

  // Log error for debugging
  console.error('API Error:', {
    status: error.response?.status,
    data: error.response?.data,
    message: error.message,
    stack: error.stack
  });

  return error;
};

// Form-specific error handler
export const handleFormErrors = (error) => {
  if (error.response?.data?.errors) {
    const fieldErrors = {};
    Object.entries(error.response.data.errors).forEach(([field, message]) => {
      fieldErrors[field] = message;
    });
    return fieldErrors;
  }
  return null;
};

// Network error checker
export const isNetworkError = (error) => {
  return !error.response && error.request;
};

// Rate limit checker
export const isRateLimitError = (error) => {
  return error.response?.status === 429;
};

// Session expiry checker
export const isSessionExpired = (error) => {
  return error.response?.status === 401;
};
