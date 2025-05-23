import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage'; // Added ProfilePage import
import Header from './components/layout/Header';
// import Footer from './components/layout/Footer'; // Footer removed as per request
import Navigation from './components/layout/Navigation';
import './App.css';

/**
 * Main App component
 * @returns {JSX.Element} App component
 */
function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading application...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow pb-14">
        <Routes>
            {/* Routes accessible to all users (guests and authenticated) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:id" element={<ArticleDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated user routes */}
            {currentUser && (
              <>
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/profile" element={<ProfilePage />} /> {/* Added ProfilePage route */}
                {/* Add other authenticated routes here */}
              </>
            )}

            {/*
              Redirect logic:
              - If a user is logged in and tries to access /login or /register, redirect to home.
              - If a user is NOT logged in and tries to access a protected route (e.g., /admin),
                they will be handled by the LoginPage's redirect logic if they try to access it directly,
                or this setup allows guest access to public pages.
                For truly protected routes, you'd add a ProtectedRoute component.
                For now, /admin is implicitly protected by its content checking for admin role.
            */}
            {currentUser && (
              <>
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/register" element={<Navigate to="/" replace />} />
              </>
            )}
            
            {/* Fallback for any other unmatched routes - can be a 404 page */}
            {/* For now, redirecting to home. Guests will see public pages, logged-in users their home. */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      
      {<Navigation />} {/* Show navigation for both logged-in users and guests */}
      {/* <Footer /> Footer removed */}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
