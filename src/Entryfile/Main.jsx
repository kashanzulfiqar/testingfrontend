import PublicInterviewPage from '../MainPage/Recruitment/PublicInterviewPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/interview/public/:token" element={<PublicInterviewPage />} />
      </Routes>
    </Router>
  );
} 