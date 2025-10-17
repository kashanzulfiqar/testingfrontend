import React, { Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from '../initialpage/App';
import config from 'config';
import StripeWrapper from '../Components/StripeWrapper.jsx';
import i18n from '../i18n.js';
import { I18nextProvider } from 'react-i18next';

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
import pendingCounterSlice from '../Redux/Reducer/permissions/pendingCounterSlice';
import superAdminSlice from '../Redux/Reducer/permissions/superAdminSlice.js';


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
  counter: pendingCounterSlice,
  superAdmin: superAdminSlice
});
 
 const persistedReducer = persistReducer(persistConfig, rootReducer);
 
 export const store = configureStore({
   reducer: persistedReducer,
   middleware: (getDefaultMiddleware) =>
   getDefaultMiddleware({
     serializableCheck: {
       ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
     },
   }),
 });
 
 const persistor = persistStore(store);



function isLoggedInFast() {
  try {
    const root = localStorage.getItem('persist:root');
    if (!root) return false;
    const parsedRoot = JSON.parse(root);
    if (!parsedRoot?.user) return false;
    const userSlice = JSON.parse(parsedRoot.user);
    return !!userSlice?.loginvalue;
  } catch (_) {
    return false;
  }
}

function loadGlobalAssets() {
  import('bootstrap');
  import('bootstrap/dist/js/bootstrap.bundle');
  import('../assets/css/font-awesome.min.css');
  import('../assets/css/line-awesome.min.css');
  import('bootstrap/dist/css/bootstrap.min.css');
  import('../assets/css/bootstrap.min.css');
  import('../assets/js/layout');
  import('../assets/js/greedynav');
  import('../assets/js/bootstrap.bundle.js');
  import('../assets/css/select2.min.css');
  import('../assets/css/material.css');
  import('../assets/js/app.js');
  import('../assets/js/select2.min.js');
  import('../assets/js/bootstrap-datetimepicker.min.js');
  import('../assets/js/multiselect.min.js');
  import('../assets/plugins/bootstrap-tagsinput/bootstrap-tagsinput.css');
  import('../assets/css/bootstrap-datetimepicker.min.css');
  import('../assets/scss/main.scss');
  import('../assets/css/style.css');
  import('antd/dist/antd.css');
}

const MainApp = () => {
  useEffect(() => {
    const atRoot = window.location.pathname === '/';
    const loggedIn = isLoggedInFast();
    if (!atRoot || loggedIn) {
      loadGlobalAssets();
    } else {
      requestAnimationFrame(() => {
        setTimeout(() => loadGlobalAssets(), 0);
      });
    }
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <I18nextProvider i18n={i18n}>
          <StripeWrapper>
            <Router basename={`${config.publicPath}`}>
              <Suspense fallback={<div/>}>
                <Routes>
                  <Route path="/*" element={<App />} />
                </Routes>
              </Suspense>
            </Router>
          </StripeWrapper>
        </I18nextProvider>
      </PersistGate>
    </Provider>
  );
};

const root = document.getElementById('app');
if (root && !root._reactRootContainer) {
  const reactRoot = ReactDOM.createRoot(root);
  root._reactRootContainer = reactRoot;
  reactRoot.render(<MainApp />);
}

export default MainApp;