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
import { ProfileSettingsPage } from './pages/settings/ProfileSettingsPage';
import { EmailSettingsPage } from './pages/settings/EmailSettingsPage';
import { PasswordSettingsPage } from './pages/settings/PasswordSettingsPage';
import { ApiKeysPage } from './pages/settings/ApiKeysPage';
import { AppearanceSettingsPage } from './pages/settings/AppearanceSettingsPage';
import { NotificationsSettingsPage } from './pages/settings/NotificationsSettingsPage';
import { LanguageSettingsPage } from './pages/settings/LanguageSettingsPage';
import { AccessibilitySettingsPage } from './pages/settings/AccessibilitySettingsPage';
import { DataManagementPage } from './pages/settings/DataManagementPage';
import { StorageUsagePage } from './pages/settings/StorageUsagePage';
import { PrivacySettingsPage } from './pages/settings/PrivacySettingsPage';
import { PreferencesHubPage } from './pages/settings/PreferencesHubPage';
import { DataStorageHubPage } from './pages/settings/DataStorageHubPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { MyPostsPage } from './pages/settings/MyPostsPage';
import { MyLikesPage } from './pages/settings/MyLikesPage';
import { MyCommentsPage } from './pages/settings/MyCommentsPage';
import { MySharesPage } from './pages/settings/MySharesPage';
import { AdminPanel } from './pages/admin/AdminPanel';

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
            <Route path="admin" element={<AdminPanel />} />
            <Route path="settings">
              <Route index element={<SettingsPage />} />
              <Route path="profile" element={<ProfileSettingsPage />} />
              <Route path="email" element={<EmailSettingsPage />} />
              <Route path="password" element={<PasswordSettingsPage />} />
              <Route path="api-keys" element={<ApiKeysPage />} />
              <Route path="appearance" element={<AppearanceSettingsPage />} />
              <Route path="notifications" element={<NotificationsSettingsPage />} />
              <Route path="language" element={<LanguageSettingsPage />} />
              <Route path="accessibility" element={<AccessibilitySettingsPage />} />
              <Route path="data" element={<DataManagementPage />} />
              <Route path="storage" element={<StorageUsagePage />} />
              <Route path="privacy" element={<PrivacySettingsPage />} />
              <Route path="preferences" element={<PreferencesHubPage />} />
              <Route path="data-storage" element={<DataStorageHubPage />} />
              <Route path="my-posts" element={<MyPostsPage />} />
              <Route path="my-likes" element={<MyLikesPage />} />
              <Route path="my-comments" element={<MyCommentsPage />} />
              <Route path="my-shares" element={<MySharesPage />} />
            </Route>
            <Route path="profile/:id" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
