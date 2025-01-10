import axios from "axios";
import {store} from '../Entryfile/Main.js';
import { login } from "../Entryfile/features/users.jsx";
import { superAdmin } from "../Redux/Reducer/permissions/superAdminSlice.js";
import { BASE_URL } from '../config/apiConfig';

let location = window.location.origin

export const apiServices = async (type, endpoint, data, state) => {
    let athtoken = state?.access_token?.accessToken;
    let company_id = state?.user?.companyId;

    // Debug token
    console.log('Token being used:', athtoken ? 'Token exists' : 'No token');

    // Validate token before making the request
    if (!athtoken) {
        console.error('No authentication token found');
        // Redirect to login if no token is present
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => {
            window.location.href = `${location}/login`;
            store.dispatch(login(null));
        }, 500);
        return;
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

        // Only redirect for actual auth failures, not other types of errors
        if (err?.response?.status === 401 || 
            (err?.response?.data?.errors?.[0]?.field === "auth" && 
             err?.response?.data?.errors?.[0]?.message === "jwt malformed")) {
            console.log('Authentication failed - redirecting to login');
            localStorage.clear();
            sessionStorage.clear();
            setTimeout(() => {
                window.location.href = `${location}/login`;
                store.dispatch(login(null));
            }, 500);
        }
        
        // For other errors, just throw them to be handled by the component
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