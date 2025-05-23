import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser, signInWithGoogle, signInWithApple } from '../firebase/auth';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';

/**
 * Login page component
 * @returns {JSX.Element} LoginPage component
 */
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Redirect if already logged in
  if (currentUser) {
    const from = location.state?.from || '/';
    navigate(from, { replace: true });
    return null; // Prevent rendering the form while navigating
  }
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await loginUser(email, password);
      
      // currentUser state will update via AuthContext,
      // and the redirect logic at the top of the component will handle navigation.
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle specific Firebase auth errors
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else {
        setError('Failed to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      // Redirect logic at the top will handle navigation after currentUser updates
    } catch (err) {
      console.error('Google Sign-In error:', err);
      setError(err.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithApple();
      // Redirect logic at the top will handle navigation
    } catch (err) {
      console.error('Apple Sign-In error:', err);
      setError(err.message || 'Failed to sign in with Apple. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    // Navigate to the home page or a specific guest area
    // For now, we assume guest access means limited functionality on the main app
    // No user object is set, so AuthContext will reflect no logged-in user
    const from = location.state?.from || '/';
    navigate(from, { replace: true });
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-8">
        <p className="mt-2 text-2xl font-semibold text-gray-700">
          Your source for the latest financial insights.
        </p>
        <p className="mt-4 text-gray-600">
          Please log in or register to access your personalized news feed and market updates.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Log In to Your Account</h2>
        {error && <ErrorMessage error={error} className="mb-4" />}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </Link>
            </div>
          </div>
          
          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <div>
              <Button
                onClick={handleGoogleSignIn}
                variant="secondary" // Assuming you have a secondary variant or will style it
                fullWidth
                disabled={loading}
                className="bg-red-500 hover:bg-red-600 text-white" // Example styling
              >
                {/* Add Google Icon here if available */}
                Sign in with Google
              </Button>
            </div>
            <div>
              <Button
                onClick={handleAppleSignIn}
                variant="secondary"
                fullWidth
                disabled={loading}
                className="bg-black hover:bg-gray-800 text-white" // Example styling
              >
                {/* Add Apple Icon here if available */}
                Sign in with Apple
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Button
            onClick={handleContinueAsGuest}
            variant="link" // Assuming a link-like button variant
            className="text-primary-600 hover:text-primary-500 font-medium"
            disabled={loading}
          >
            Continue without logging in
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;