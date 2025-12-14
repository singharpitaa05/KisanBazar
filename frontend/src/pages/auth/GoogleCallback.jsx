// GOGGLE CALL BACK PAGE

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Loader from '../../components/common/Loader.jsx';
import useAuthStore from '../../store/authStore.js';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useAuthStore();
  const [error, setError] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get token from URL
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError('Google authentication failed. Please try again.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        if (!token) {
          setError('Authentication token not found.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        // Handle Google callback
        await handleGoogleCallback(token);

        // Redirect to dashboard
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('Google callback error:', err);
        setError('Authentication failed. Please try again.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    processCallback();
  }, [searchParams, handleGoogleCallback, navigate]);

  return (
    <div className="min-h-screen bg-linear-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </>
        ) : (
          <>
            <Loader size="lg" />
            <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Completing Sign In</h2>
            <p className="text-gray-600">Please wait while we verify your account...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;