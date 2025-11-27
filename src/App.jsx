import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Recruitment from './MainPage/Recruitment';
import Dashboard from './MainPage/Recruitment/Dashboard';
import Interviews from './MainPage/Recruitment/Interviews';
import Candidates from './MainPage/Recruitment/Candidates';
import Jobs from './MainPage/Recruitment/Jobs';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/recruitment" element={<Recruitment />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="interviews" element={<Interviews />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="jobs" element={<Jobs />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
