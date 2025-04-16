import React, { useState, useEffect } from 'react'
import api from '../../utils/axios'

function AdminKYCVerifications({ userId = null }) {
  const [verifications, setVerifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedVerification, setSelectedVerification] = useState(null)
  const [detailedView, setDetailedView] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(userId || '')
  const [users, setUsers] = useState([])
  const [dataSource, setDataSource] = useState('sumsub') // 'local' or 'sumsub'

  useEffect(() => {
    // Update selectedUserId if the prop changes
    if (userId !== null) {
      setSelectedUserId(userId.toString());
    }
    
    if (dataSource === 'local') {
      fetchLocalVerifications()
    } else {
      fetchSumsubVerifications()
    }
    fetchUsers()
  }, [userId, selectedUserId, dataSource])

  const fetchLocalVerifications = async () => {
    try {
      setLoading(true)
      const url = selectedUserId 
        ? `/admin/kyc-verifications?userId=${selectedUserId}`
        : '/admin/kyc-verifications'
      
      const response = await api.get(url)
      setVerifications(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching local KYC verifications:', err)
      setError('Failed to load local KYC verifications. Please try again later.')
      setLoading(false)
    }
  }
  
  const fetchSumsubVerifications = async () => {
    try {
      setLoading(true)
      // Get applicants directly from Sumsub API through our backend endpoint
      const response = await api.get('/admin/sumsub/applicants')
      setVerifications(response.data.items || [])
      setLoading(false)
    } catch (err) {
      console.error('Error fetching Sumsub verifications:', err)
      setError('Failed to load Sumsub verification data. Please try again later.')
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users')
      // Filter to only include users with issuer role
      const issuerUsers = response.data.filter(user => 
        user.roles.some(role => role.role === 'ISSUER')
      )
      setUsers(issuerUsers)
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  const handleViewDetails = async (verification) => {
    try {
      setLoading(true)
      
      if (dataSource === 'local') {
        const response = await api.get(`/admin/kyc-verifications/${verification.id}`)
        setSelectedVerification(response.data)
      } else {
        // Fetch the detailed applicant data from Sumsub
        const response = await api.get(`/admin/sumsub/applicant/${verification.id}`)
        setSelectedVerification(response.data)
      }
      
      setDetailedView(true)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching verification details:', err)
      setError('Failed to load verification details. Please try again later.')
      setLoading(false)
    }
  }

  const handleBackToList = () => {
    setDetailedView(false)
    setSelectedVerification(null)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'PENDING':
      case 'QUEUED':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
      case 'RED':
      case 'DECLINED':
        return 'bg-red-100 text-red-800'
      case 'GREEN':
      case 'VERIFIED':
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'init':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) return <div className="text-center mt-8">Loading...</div>
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {!detailedView ? (
        <>
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold">KYC Verifications</h2>
            <div className="flex items-center">
              <select
                className="block w-48 mr-2 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value)}
              >
                <option value="sumsub">Sumsub API</option>
                <option value="local">Local Database</option>
              </select>
              <select
                className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">All Users</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
              <button
                onClick={dataSource === 'local' ? fetchLocalVerifications : fetchSumsubVerifications}
                className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Refresh
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {verifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No KYC verification records found</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {verifications.map((verification) => {
                    // Handle different data structures based on source
                    const userData = dataSource === 'local' 
                      ? verification.user
                      : verification.user || {};
                      
                    const applicantId = dataSource === 'local'
                      ? verification.applicantId
                      : verification.id;
                      
                    const status = dataSource === 'local'
                      ? verification.reviewStatus
                      : verification.review?.reviewStatus || 'init';
                      
                    const createdAt = dataSource === 'local'
                      ? verification.createdAt
                      : verification.createdAt;
                      
                    const type = dataSource === 'local'
                      ? verification.type
                      : verification.type || 'individual';
                      
                    return (
                      <tr key={applicantId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {userData?.email || verification.externalUserId || 'Unknown User'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {userData?.first_name} {userData?.last_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{applicantId}</div>
                          <div className="text-xs text-gray-500">
                            External ID: {verification.externalUserId || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(status)}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleViewDetails(verification)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <div className="p-6">
          <div className="flex items-center mb-6">
            <button
              onClick={handleBackToList}
              className="flex items-center text-blue-600 hover:text-blue-900"
            >
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to List
            </button>
          </div>
          
          {selectedVerification && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Verification Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Applicant Information</h3>
                  <div className="space-y-2">
                    {dataSource === 'local' ? (
                      <>
                        <p><span className="font-medium">Applicant ID:</span> {selectedVerification.applicantId}</p>
                        <p><span className="font-medium">External User ID:</span> {selectedVerification.externalUserId}</p>
                        <p><span className="font-medium">User Email:</span> {selectedVerification.user?.email || 'N/A'}</p>
                        <p><span className="font-medium">User Name:</span> {selectedVerification.user?.first_name} {selectedVerification.user?.last_name}</p>
                      </>
                    ) : (
                      <>
                        <p><span className="font-medium">Applicant ID:</span> {selectedVerification.id}</p>
                        <p><span className="font-medium">External User ID:</span> {selectedVerification.externalUserId}</p>
                        <p><span className="font-medium">Email:</span> {selectedVerification.info?.email || selectedVerification.user?.email || 'N/A'}</p>
                        <p><span className="font-medium">Name:</span> {selectedVerification.info?.firstName} {selectedVerification.info?.lastName}</p>
                        <p><span className="font-medium">Country:</span> {selectedVerification.info?.country || 'N/A'}</p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3">Verification Status</h3>
                  <div className="space-y-2">
                    {dataSource === 'local' ? (
                      <>
                        <p>
                          <span className="font-medium">Status:</span> 
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedVerification.reviewStatus)}`}>
                            {selectedVerification.reviewStatus}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium">Result:</span> 
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedVerification.reviewResult)}`}>
                            {selectedVerification.reviewResult || 'N/A'}
                          </span>
                        </p>
                        <p><span className="font-medium">Created:</span> {formatDate(selectedVerification.createdAt)}</p>
                        <p><span className="font-medium">Type:</span> {selectedVerification.type}</p>
                        {selectedVerification.parsedRawData?.levelName && (
                          <p><span className="font-medium">Level:</span> {selectedVerification.parsedRawData.levelName}</p>
                        )}
                      </>
                    ) : (
                      <>
                        <p>
                          <span className="font-medium">Status:</span> 
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedVerification.review?.reviewStatus)}`}>
                            {selectedVerification.review?.reviewStatus || 'N/A'}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium">Result:</span> 
                          <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedVerification.review?.reviewResult?.reviewAnswer)}`}>
                            {selectedVerification.review?.reviewResult?.reviewAnswer || 'N/A'}
                          </span>
                        </p>
                        <p><span className="font-medium">Created:</span> {formatDate(selectedVerification.createdAt)}</p>
                        <p><span className="font-medium">Level:</span> {selectedVerification.review?.levelName || 'N/A'}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Rejection reasons */}
              {dataSource === 'local' ? (
                selectedVerification.parsedRawData?.rejectLabels && 
                selectedVerification.parsedRawData.rejectLabels.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold text-red-700 mb-3">Rejection Reasons</h3>
                    <ul className="list-disc pl-5 text-red-700">
                      {selectedVerification.parsedRawData.rejectLabels.map((label, index) => (
                        <li key={index}>{label}</li>
                      ))}
                    </ul>
                  </div>
                )
              ) : (
                selectedVerification.review?.reviewResult?.rejectLabels &&
                selectedVerification.review.reviewResult.rejectLabels.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold text-red-700 mb-3">Rejection Reasons</h3>
                    <ul className="list-disc pl-5 text-red-700">
                      {selectedVerification.review.reviewResult.rejectLabels.map((label, index) => (
                        <li key={index}>{label}</li>
                      ))}
                    </ul>
                  </div>
                )
              )}
              
              {/* Document information */}
              {dataSource === 'sumsub' && selectedVerification.info?.idDocs && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-3">Identity Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedVerification.info.idDocs.map((doc, index) => (
                      <div key={index} className="border p-3 rounded">
                        <p><span className="font-medium">Type:</span> {doc.idDocType}</p>
                        <p><span className="font-medium">Country:</span> {doc.country}</p>
                        {doc.imageIds && doc.imageIds.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium">Images:</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {doc.imageIds.map((imageId, idx) => (
                                <div key={idx} className="border p-1 rounded bg-gray-100">
                                  <p className="text-xs">{imageId}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Raw data */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Raw Response Data</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-xs h-96 overflow-y-auto">
                  {JSON.stringify(dataSource === 'local' ? selectedVerification.parsedRawData : selectedVerification, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminKYCVerifications 