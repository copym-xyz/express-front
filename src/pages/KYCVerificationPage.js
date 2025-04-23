import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';

function KYCVerificationPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sdkInstance, setSdkInstance] = useState(null);
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const returnUrl = location.state?.returnUrl || '/';
  const userRole = user?.role?.toLowerCase() || 'investor';

  // Function to get access token from the backend
  const getAccessToken = async () => {
    try {
      console.log('Requesting Sumsub token...');
      const response = await api.post('/sumsub/token', {
        userId: user.id,
        levelName: 'id-and-liveness'
      });
      
      if (!response.data.token) {
        throw new Error('Token not found in server response');
      }
      return response.data.token;
    } catch (err) {
      console.error('Error fetching Sumsub token:', err);
      setError(`Failed to initialize verification: ${err.response?.data?.error || err.message}`);
      return null;
    }
  };

  // Initialize the Sumsub SDK
  const initSumsubSdk = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get initial token
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error('Failed to get access token');
      }

      console.log('Initializing Sumsub SDK');
      
      // Check if SDK is loaded
      const sdkObject = window.snsWebSdk;
      if (!sdkObject) {
        throw new Error('Sumsub SDK not loaded - global object not found');
      }
      
      // Initialize the WebSDK
      const sdk = sdkObject
        .init(accessToken, async () => {
          // Token refresh callback
          console.log('Refreshing Sumsub token...');
          return await getAccessToken();
        })
        .withConf({
          lang: 'en'
        })
        .withOptions({ 
          addViewportTag: false, 
          adaptIframeHeight: true
        })
        .on('onError', (error) => {
          console.error('Sumsub error:', error);
          setError(`Verification error: ${error.message || 'Unknown error'}`);
        })
        .onMessage((type, payload) => {
          console.log('Sumsub message:', type, payload);
          
          // Handle verification completion
          if (type === 'idCheck.applicantStatus' && 
              (payload.reviewStatus === 'completed' || payload.reviewStatus === 'approved' || 
               type === 'idCheck.stepCompleted')) {
            setVerificationCompleted(true);
            
            // After a short delay, redirect back to the return URL
            setTimeout(() => {
              navigate(returnUrl, { 
                state: { 
                  kycCompleted: true,
                  kycStatus: 'completed' 
                } 
              });
            }, 2000);
          }
        })
        .build();

      setSdkInstance(sdk);
      
      // Launch the SDK in the container
      sdk.launch('#sumsub-websdk-container');
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing Sumsub SDK:', err);
      setError(`Failed to initialize verification: ${err.message || 'Unknown error'}`);
      setIsLoading(false);
    }
  };

  // Load Sumsub SDK script
  useEffect(() => {
    // Clear any existing script first
    const existingScript = document.getElementById('sumsub-sdk-script');
    if (existingScript) {
      existingScript.remove();
    }

    // Create and load the Sumsub WebSDK script
    const script = document.createElement('script');
    script.id = 'sumsub-sdk-script';
    script.src = 'https://static.sumsub.com/idensic/static/sns-websdk-builder.js';
    script.async = true;
    script.onload = () => {
      console.log('Sumsub SDK script loaded successfully');
      initSumsubSdk();
    };
    script.onerror = (error) => {
      console.error('Failed to load Sumsub SDK script:', error);
      setError('Failed to load Sumsub SDK');
      setIsLoading(false);
    };
    
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById('sumsub-sdk-script');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
      
      if (sdkInstance) {
        try {
          sdkInstance.close();
        } catch (err) {
          console.error('Error closing Sumsub SDK:', err);
        }
      }
    };
  }, []);

  // Handle cancellation - go back to the return URL
  const handleCancel = () => {
    navigate(returnUrl);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Identity Verification</h1>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
            <p className="mt-2 text-gray-600">
              Complete the verification process below to verify your identity.
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
                <div className="mt-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="underline text-red-700"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <span className="ml-3">Loading verification module...</span>
              </div>
            )}
            
            {verificationCompleted && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <p className="font-bold">Verification Completed Successfully!</p>
                <p className="mt-1">Redirecting you back...</p>
              </div>
            )}
            
            <div 
              id="sumsub-websdk-container" 
              className="w-full min-h-[650px] border border-gray-200 rounded-lg"
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KYCVerificationPage; 