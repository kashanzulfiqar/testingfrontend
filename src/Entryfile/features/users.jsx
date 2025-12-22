import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    loginvalue: null,
    isAuthenticated: false,
    loading: false,
    error: null
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, { payload }) => {
            state.loginvalue = payload;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
            
            // Store token in localStorage for persistence
            if (payload?.access_token?.accessToken) {
                localStorage.setItem('token', payload.access_token.accessToken);
            }
        },
        loginFailure: (state, { payload }) => {
            state.loading = false;
            state.error = payload;
        },
        logout: (state) => {
            state.loginvalue = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            
            // Clear stored token
            localStorage.removeItem('token');
            sessionStorage.clear();
        },
        setHasAssignedInterviews: (state, { payload }) => {
            if (state.loginvalue && state.loginvalue.user) {
                state.loginvalue.user.hasAssignedInterviews = !!payload;
            }
        },
        // Initialize auth state from stored token
        initAuth: (state) => {
            const storedToken = localStorage.getItem('token');
            if (storedToken && state.loginvalue?.access_token?.accessToken === storedToken) {
                state.isAuthenticated = true;
            }
        }
    }
});

export const { loginStart, loginSuccess, loginFailure, logout, setHasAssignedInterviews, initAuth } = userSlice.actions;
export default userSlice.reducer;