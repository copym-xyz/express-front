import React, { useState } from 'react'
import SumsubVerification from './SumsubVerification'
import { useAuth } from '../../context/AuthContext'

function IssuerKYC() {
  const { user } = useAuth()
  const [showKYC, setShowKYC] = useState(false)
  const [kycStatus, setKycStatus] = useState('pending') // pending, in_progress, completed, failed
  const [statusMessage, setStatusMessage] = useState('')

  const handleStartKYC = () => {
    setShowKYC(true)
    setKycStatus('in_progress')
    setStatusMessage('KYC verification in progress')
  }

  const handleKYCSuccess = (event) => {
    console.log('KYC verification completed successfully:', event)
    setKycStatus('completed')
    setStatusMessage('KYC verification completed successfully')
    
    // In a real application, you would update the user's verification status in your backend
    // Example:
    // axios.post('/api/issuer/kyc/complete', { userId: user.id, verificationData: event })
    //   .then(response => console.log('Backend updated with KYC status'))
    //   .catch(error => console.error('Failed to update backend with KYC status', error))
  }

  const handleKYCError = (error) => {
    console.error('KYC verification failed:', error)
    setKycStatus('failed')
    setStatusMessage(`KYC verification failed: ${error.message || 'Unknown error'}`)
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">KYC Verification</h2>
      
      {!showKYC ? (
        <div className="mb-6">
          <p className="mb-4">
            To comply with regulatory requirements, we need to verify your identity. 
            Please complete the KYC process to continue using all features of the platform.
          </p>
          
          <div className="mt-4">
            <button 
              onClick={handleStartKYC}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
            >
              Start KYC Process
            </button>
          </div>
        </div>
      ) : (
        <div>
          {kycStatus === 'in_progress' && (
            <div className="p-4 mb-4 bg-blue-50 text-blue-700 rounded-lg">
              {statusMessage}
            </div>
          )}
          
          {kycStatus === 'completed' && (
            <div className="p-4 mb-4 bg-green-50 text-green-700 rounded-lg">
              {statusMessage}
            </div>
          )}
          
          {kycStatus === 'failed' && (
            <div className="p-4 mb-4 bg-red-50 text-red-700 rounded-lg">
              {statusMessage}
              <div className="mt-2">
                <button
                  onClick={handleStartKYC}
                  className="text-red-700 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          {kycStatus === 'in_progress' && (
            <SumsubVerification 
              userId={user?.id || 'temp-user-id'} 
              onSuccess={handleKYCSuccess} 
              onError={handleKYCError} 
            />
          )}
        </div>
      )}
      
      <div className="mt-6 border-t border-gray-200 pt-4">
        <h3 className="font-semibold mb-2">Why do we need this?</h3>
        <p className="text-gray-600">
          KYC (Know Your Customer) verification is required for regulatory compliance and to prevent fraud. 
          We use Sumsub, a trusted third-party service, to securely process your identity verification.
          Your information is encrypted and handled according to our privacy policy.
        </p>
      </div>
    </div>
  )
}

export default IssuerKYC 