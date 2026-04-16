import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';

// Existing pages (untouched)
import LoginPage                 from './pages/LoginPage';
import RoleSelectionPage         from './pages/RoleSelectionPage';
import UserInstructionsPage      from './pages/user/UserInstructionsPage';
import UploadPage                from './pages/user/UploadPage';
import PurposePage               from './pages/user/PurposePage';
import ConfigurePage             from './pages/user/ConfigurePage';
import AnnotatorInstructionsPage from './pages/annotator/AnnotatorInstructionsPage';
import AnnotationPage            from './pages/annotator/AnnotationPage';
import DonePage                  from './pages/annotator/DonePage';

// New pages
import LoginUserPage             from './pages/LoginUserPage';
import LoginAnnotatorPage        from './pages/LoginAnnotatorPage';
import LoginAdminPage            from './pages/LoginAdminPage';
import ProjectSelectionPage      from './pages/user/ProjectSelectionPage';
import UserDashboard             from './pages/user/UserDashboard';
import ProlificEntryPage         from './pages/annotator/ProlificEntryPage';
import AdminDashboard            from './pages/admin/AdminDashboard';

// ── Guards ─────────────────────────────────────────────────────────────────────

/** Generic auth guard — redirects to /login-user if not logged in */
function RequireAuth({ children }) {
  const { state } = useApp();
  const loc = useLocation();
  if (!state.isLoggedIn) return <Navigate to="/login-user" state={{ from: loc }} replace />;
  return children;
}

/** Role-specific guard — also checks role matches */
function RequireRole({ role, children }) {
  const { state } = useApp();
  const loc = useLocation();
  if (!state.isLoggedIn)    return <Navigate to={`/login-${role}`} state={{ from: loc }} replace />;
  if (state.role !== role)  return <Navigate to={`/login-${role}`} replace />;
  return children;
}

/** Data guard — redirects to upload if no dataset in context */
function RequireData({ children }) {
  const { state } = useApp();
  if (!state.uploadedData) return <Navigate to="/user/upload" replace />;
  return children;
}

// ── Routes ─────────────────────────────────────────────────────────────────────
function AppRoutes() {
  const { state } = useApp();
  return (
    <Routes>

      {/* ── Login pages ── */}
      <Route path="/login"           element={<LoginPage />} />          {/* kept for backward compat */}
      <Route path="/login-user"      element={state.isLoggedIn && state.role === 'user' ? <Navigate to="/user/dashboard" replace /> : <LoginUserPage />} />
      <Route path="/login-annotator" element={<LoginAnnotatorPage />} />
      <Route path="/login-admin"     element={state.isLoggedIn && state.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <LoginAdminPage />} />
      <Route path="/role-select"     element={<RequireAuth><RoleSelectionPage /></RequireAuth>} />

      {/* ── User (Uploader) flow ── */}
      <Route path="/user"                   element={<Navigate to="/user/dashboard" replace />} />
      <Route path="/user/dashboard"         element={<RequireRole role="user"><UserDashboard /></RequireRole>} />
      <Route path="/user/project-selection" element={<RequireRole role="user"><ProjectSelectionPage /></RequireRole>} />  {/* STEP 1 */}
      <Route path="/user/instructions"      element={<RequireRole role="user"><UserInstructionsPage /></RequireRole>} />     {/* STEP 2 */}
      <Route path="/user/upload"            element={<RequireRole role="user"><UploadPage /></RequireRole>} />               {/* STEP 3 */}
      <Route path="/user/purpose"           element={<RequireRole role="user"><RequireData><PurposePage /></RequireData></RequireRole>} />
      <Route path="/user/configure"         element={<RequireRole role="user"><RequireData><ConfigurePage /></RequireData></RequireRole>} />

      {/* ── Annotator flow ── */}
      <Route path="/annotator"              element={<Navigate to="/annotator/instructions" replace />} />
      <Route path="/annotator/prolific"     element={<ProlificEntryPage />} />                                          {/* NEW — no auth guard, auto-auth */}
      <Route path="/annotator/instructions" element={<RequireRole role="annotator"><AnnotatorInstructionsPage /></RequireRole>} />
      <Route path="/annotator/annotate"     element={<RequireRole role="annotator"><AnnotationPage /></RequireRole>} />
      <Route path="/annotator/task"         element={<RequireRole role="annotator"><AnnotationPage /></RequireRole>} />  {/* alias — improvement #3 */}
      <Route path="/annotator/done"         element={<RequireRole role="annotator"><DonePage /></RequireRole>} />

      {/* ── Admin flow ── */}
      <Route path="/admin"           element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<RequireRole role="admin"><AdminDashboard /></RequireRole>} />

      {/* ── Default / 404 ── */}
      <Route path="/" element={
        state.isLoggedIn 
          ? <Navigate to={state.role === 'admin' ? '/admin/dashboard' : state.role === 'annotator' ? '/annotator/instructions' : '/user/dashboard'} replace />
          : <Navigate to="/login-user" replace />
      } />
      <Route path="*"  element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
