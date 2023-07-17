import { useContext } from "react";
import AuthContext from "../context/AuthProvider";
const useAuth =()=>{
    return useContext(AuthContext);
}
export default useAuth


// import React from 'react';
// import { Route, Navigate } from 'react-router-dom';
// // import { Route, Redirect, Navigate } from 'react-router-dom';

// const AuthRoute = ({ component: Component, isAuthenticated, ...rest }) => (
//   <Route
//     {...rest}
//     render={(props) =>
//       isAuthenticated ? (
//         <Component {...props} />
//       ) : (
//         <Navigate to="/login" />
//         // <Redirect to="/login" />
//       )
//     }
//   />
// );

// export default AuthRoute;