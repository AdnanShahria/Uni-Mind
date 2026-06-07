import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { ThemeProvider } from '../contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

function IndexApp() {
  return (
    <ThemeProvider>
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          border: '1px solid rgba(255,255,255,0.1)',
        }
      }} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* /index.html for direct file access in dev */}
          <Route path="/index.html" element={<LandingPage />} />
          {/* Catch-all fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default IndexApp;
