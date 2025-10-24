import React, { Suspense, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import config from 'config';

// Lazy load heavy dependencies only when needed
const LandingApp = React.lazy(() => import('./LandingApp.jsx'));
const AppRoutes = React.lazy(() => import('./AppRoutes.jsx'));

// Lazy load Redux store and providers to reduce initial bundle
const ReduxProvider = React.lazy(() => import('./ReduxProvider.jsx'));
const StripeWrapper = React.lazy(() => import('../Components/StripeWrapper.jsx'));
const I18nProvider = React.lazy(() => import('./I18nProvider.jsx'));


// Store setup moved to ReduxProvider.jsx for lazy loading
// Re-export store for backward compatibility
export { store } from './ReduxProvider';



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

// Defer heavy CSS until after first paint for faster landing
function loadBaseStyles() {
  // Only load critical CSS immediately
  import('bootstrap/dist/css/bootstrap.min.css');
  import('../assets/css/bootstrap.min.css');
  
  // Defer heavy CSS to after paint
  if ('requestIdleCallback' in window) {
    // @ts-ignore
    window.requestIdleCallback(() => {
      import('../assets/css/font-awesome.min.css');
      import('../assets/css/line-awesome.min.css');
    });
  } else {
    setTimeout(() => {
      import('../assets/css/font-awesome.min.css');
      import('../assets/css/line-awesome.min.css');
    }, 100);
  }
}

// Load Ant Design CSS only when full app is needed
function loadAntdStyles() {
  import('antd/dist/antd.css');
}

// Load application-wide CSS only when the full app is rendered
function loadFullAppStyles() {
  import('../assets/css/select2.min.css');
  import('../assets/css/material.css');
  import('../assets/plugins/bootstrap-tagsinput/bootstrap-tagsinput.css');
  import('../assets/css/bootstrap-datetimepicker.min.css');
  import('../assets/scss/main.scss');
  import('../assets/css/style.css');
}

// Load JS bundles required only for the full app (dashboards, etc.)
function loadGlobalScripts() {
  import('bootstrap');
  import('bootstrap/dist/js/bootstrap.bundle');
  import('../assets/js/layout');
  import('../assets/js/greedynav');
  import('../assets/js/bootstrap.bundle.js');
  import('../assets/js/app.js');
  import('../assets/js/select2.min.js');
  import('../assets/js/bootstrap-datetimepicker.min.js');
  import('../assets/js/multiselect.min.js');
}

const MainApp = () => {
  const [shouldLoadFullApp, setShouldLoadFullApp] = React.useState(false);

  const checkRoute = () => {
    const currentPath = window.location.pathname;
    const loggedIn = isLoggedInFast();
    
    const landingRoutes = ['/', '/terms-and-conditions', '/privacy-policy', '/refund-policy', '/contact-us', '/live-demo'];
    const isLandingRoute = landingRoutes.includes(currentPath);
    
    // Load minimal CSS for landing pages
    loadBaseStyles();

    if (isLandingRoute && !loggedIn) {
      setShouldLoadFullApp(false);
    } else {
      setShouldLoadFullApp(true);
      // Load Ant Design CSS for full app
      loadAntdStyles();
      loadFullAppStyles();
      loadGlobalScripts();
    }
  };

  useEffect(() => {
    checkRoute();
    
    const handlePopState = () => {
      setTimeout(checkRoute, 0);
    };
    
    const handlePushState = () => {
      setTimeout(checkRoute, 0);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    const originalPushState = history.pushState;
    history.pushState = function() {
      originalPushState.apply(history, arguments);
      handlePushState();
    };
    
    const originalReplaceState = history.replaceState;
    history.replaceState = function() {
      originalReplaceState.apply(history, arguments);
      handlePushState();
    };
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return (
    <Router basename={`${config.publicPath}`}>
      <Suspense fallback={<div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Loading...</div>}>
        {shouldLoadFullApp ? (
          <ReduxProvider>
            <I18nProvider>
              <StripeWrapper>
                <AppRoutes key="full-app" />
              </StripeWrapper>
            </I18nProvider>
          </ReduxProvider>
        ) : (
          <ReduxProvider>
            <I18nProvider>
              <LandingApp key="landing-app" />
            </I18nProvider>
          </ReduxProvider>
        )}
      </Suspense>
    </Router>
  );
};

const root = document.getElementById('app');
if (root && !root._reactRootContainer) {
  const reactRoot = ReactDOM.createRoot(root);
  root._reactRootContainer = reactRoot;
  reactRoot.render(<MainApp />);
}

export default MainApp;
