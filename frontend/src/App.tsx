import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPageRoute } from './pages/AuthPageRoute';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { FeedPage } from './pages/FeedPage';
import { NotesPage } from './pages/notes/NotesPage';
import { AITutorPage } from './pages/ai-tutor/AITutorPage';
import { CommunitiesPage } from './pages/communities/CommunitiesPage';
import { MessagesPage } from './pages/messages/MessagesPage';
import { PlannerPage } from './pages/planner/PlannerPage';
import { ResearchPage } from './pages/research/ResearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/profile/ProfilePage';

// Layout
import { AppLayout } from './components/app/AppLayout';

// Context
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

function App() {
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
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPageRoute />} />

          {/* Authenticated App Routes (wrapped in AppLayout with sidebar + topbar) */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="ai" element={<AITutorPage />} />
            <Route path="communities" element={<CommunitiesPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="planner" element={<PlannerPage />} />
            <Route path="research" element={<ResearchPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile/:id" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
