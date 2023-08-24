import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from '../initialpage/App';
import config from 'config';
import 'bootstrap'

import 'bootstrap/dist/js/bootstrap.bundle';
// import 'font-awesome/css/font-awesome.min.css';

import '../assets/css/font-awesome.min.css';
import '../assets/css/line-awesome.min.css';

import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/css/bootstrap.min.css";

import "../assets/js/layout";
import "../assets/js/greedynav"
// import "../assets/js/theme-settings.js";
// Custom Style File
import '../assets/js/bootstrap.bundle.js';
import '../assets/css/select2.min.css';
import '../assets/css/material.css';

//  import '../assets/js/popper.min.js';
import '../assets/js/app.js';
import '../assets/js/select2.min.js';


import "../assets/js/bootstrap-datetimepicker.min.js";

import "../assets/js/multiselect.min.js";
import "../assets/plugins/bootstrap-tagsinput/bootstrap-tagsinput.css";
import "../assets/css/bootstrap-datetimepicker.min.css";
import '../assets/css/style.css';
// window.Popper = require("popper.js").default;
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
// import userReducer from "./features/users"
import userReducer from './features/users'
import storage from 'redux-persist/lib/storage';
import { PersistGate } from 'redux-persist/integration/react';
import {  persistStore, 
          persistReducer,
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER, } from 'redux-persist';
import { getDefaultMiddleware } from '@reduxjs/toolkit';
import permissionsSlice from '../Redux/Reducer/permissions/permissionSlice';


// const store =configureStore({
//    reducer:{
//       user:userReducer
//    }
// })

const persistConfig = {
   key: 'root',
   storage
 };

 const rootReducer = combineReducers({
  user: userReducer,
  permissionsSlice: permissionsSlice,
});
 
 const persistedReducer = persistReducer(persistConfig, rootReducer);
 
 const store = configureStore({
   reducer: persistedReducer,
   middleware: (getDefaultMiddleware) =>
   getDefaultMiddleware({
     serializableCheck: {
       ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
     },
   }),
 });
 
 const persistor = persistStore(store);

const MainApp = () => (
  // <Router basename={`${config.publicPath}`}>
  //    <Routes>
  //       <Provider store={store}>
  //          <Route path="/" component={App} />
  //       </Provider>

  //    </Routes>
  // </Router>
  <React.StrictMode>
    {/* <Router basename={`${process.env.REACT_APP_API_BASE_URL}`}> */}
    <Router basename={`${config.publicPath}`}>
      {/* <Router basename={config.publicPath}> */}
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Suspense fallback="...loading">
            <Routes>
              <Route path="/*" element={<App />} />
            </Routes>
          </Suspense>
        </PersistGate>
      </Provider>
    </Router>
  </React.StrictMode>
);

export default MainApp;