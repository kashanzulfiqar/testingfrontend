import axios from "axios";
import {store} from '../Entryfile/Main.js';
import { logout } from "../Entryfile/features/users.jsx";
import { superAdmin } from "../Redux/Reducer/permissions/superAdminSlice.js";
import { BASE_URL } from '../config/apiConfig';

let location = window.location.origin

export const apiServices = async (type, endpoint, data, state) => {
    // Try to get token from state or localStorage
    let athtoken = state?.access_token?.accessToken || localStorage.getItem("token");
    let company_id = state?.user?.companyId;

    // Debug token
    console.log('Token being used:', athtoken ? 'Token exists' : 'No token');

    // Validate token before making the request
    if (!athtoken) {
        console.error('No authentication token found');
        // Only redirect if both state and localStorage tokens are missing
        if (!localStorage.getItem("token")) {
            localStorage.clear();
            sessionStorage.clear();
            setTimeout(() => {
                window.location.href = `${location}/login`;
                store.dispatch(login(null));
            }, 500);
            return;
        }
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${athtoken}`,
        'Accept': 'application/json'
    };

    // Common error handler
    const handleError = (err) => {
        console.error("API Error Details:", {
            status: err?.response?.status,
            data: err?.response?.data,
            endpoint: endpoint
        });

        // For 401 errors in blacklist or hired endpoints, return empty data
        if (err?.response?.status === 401 && 
            (endpoint.includes('blacklisted') || endpoint.includes('hired'))) {
            return {
                data: {
                    status: true,
                    data: []
                }
            };
        }

        // Only logout for specific auth failures
        if (err?.response?.status === 401 && 
            err?.response?.data?.message && 
            (err.response.data.message.includes("jwt expired") || 
             err.response.data.message.includes("invalid token") ||
             err.response.data.message.includes("malformed jwt"))) {
            console.log('Authentication failed - redirecting to login');
            localStorage.clear();
            sessionStorage.clear();
            setTimeout(() => {
                window.location.href = `${location}/login`;
                store.dispatch(login(null));
            }, 500);
            return;
        }
        
        // For other errors, return empty data for these specific endpoints
        if (endpoint.includes('blacklisted') || endpoint.includes('hired')) {
            return {
                data: {
                    status: true,
                    data: []
                }
            };
        }

        // For other errors, throw them to be handled by the component
        throw err;
    };

    try {
        let response;
        const config = {
            url: `${BASE_URL}/${endpoint}`,
            headers,
            data
        };

        switch (type) {
            case "GET":
                config.method = 'GET';
                config.responseType = endpoint.includes('payrolls/download-payroll') ? 'blob' : '';
                break;
            case "PUT":
                config.method = 'PUT';
                break;
            case "PATCH":
                config.method = 'PATCH';
                break;
            case "DELETE":
                config.method = 'DELETE';
                config.data = endpoint === 'user/delete-user' ? data : { '_id': data };
                break;
            default: // POST
                config.method = 'POST';
                config.headers = { ...headers, withCredentials: true };
        }

        try {
            response = await axios(config);
            return response;
        } catch (err) {
            return handleError(err);
        }
    } catch (error) {
        console.error(`${type} API FAILED:`, error);
        throw error;
    }
};

export {
    BASE_URL
}