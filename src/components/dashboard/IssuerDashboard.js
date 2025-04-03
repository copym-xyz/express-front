import React, { useState, useEffect } from 'react';
import axios from 'axios';
import IssuerWallet from '../wallet/IssuerWallet';

const IssuerDashboard = () => {
  const [issuerData, setIssuerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchIssuerData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/issuer/dashboard', {
          withCredentials: true,
        });
        setIssuerData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch issuer data');
        setLoading(false);
      }
    };

    fetchIssuerData();
  }, []);

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;
  if (!issuerData) return <div className="text-center mt-8">No data available</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Issuer Dashboard</h1>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'wallet'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Wallet
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Company Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Company Name</p>
                <p className="text-lg font-medium">{issuerData.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Registration Number</p>
                <p className="text-lg font-medium">{issuerData.company_registration_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Jurisdiction</p>
                <p className="text-lg font-medium">{issuerData.jurisdiction}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Verification Status</p>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${issuerData.verification_status ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {issuerData.verification_status ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button className="bg-indigo-600 text-white p-4 rounded-lg hover:bg-indigo-700 transition-colors">
              Create New Offering
            </button>
            <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors">
              View Active Offerings
            </button>
            <button 
              className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setActiveTab('wallet')}
            >
              Manage Wallet
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-indigo-500 pl-4">
                <p className="text-sm text-gray-600">Today</p>
                <p className="text-base">Document verification completed</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="text-sm text-gray-600">Yesterday</p>
                <p className="text-base">New investor application received</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-sm text-gray-600">2 days ago</p>
                <p className="text-base">Offering documents updated</p>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'wallet' && (
        <IssuerWallet />
      )}
    </div>
  );
};

export default IssuerDashboard; 