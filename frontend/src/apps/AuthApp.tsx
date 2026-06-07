import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthPageRoute } from '../pages/AuthPageRoute';
import { ThemeProvider } from '../contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

function AuthApp() {
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
          {/* auth.html is served at /auth.html in dev, so BrowserRouter sees /auth.html */}
          <Route path="/auth.html" element={<AuthPageRoute />} />
          {/* /auth for production Cloudflare Pages routing */}
          <Route path="/auth" element={<AuthPageRoute />} />
          {/* Catch-all fallback — renders on any path this entry point loads at */}
          <Route path="*" element={<AuthPageRoute />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default AuthApp;
