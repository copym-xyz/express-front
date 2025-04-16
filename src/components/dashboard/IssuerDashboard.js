import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import IssuerWallet from '../wallet/IssuerWallet';
import IssuerKYC from '../kyc/IssuerKYC';

const IssuerDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not authenticated. Please log in again.');
          setLoading(false);
          return;
        }
        
        const response = await api.get('/issuer/profile');
        
        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user data. Please try again later.');
        setLoading(false);
        console.error('Error fetching issuer profile:', err);
      }
    };

    fetchUserData();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white shadow rounded-lg p-4">
              <div className="text-center mb-6">
                <div className="h-24 w-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold mx-auto">
                  {userData?.profile?.company_name?.charAt(0) || 'I'}
                </div>
                <h2 className="mt-2 font-bold text-xl">{userData?.profile?.company_name || 'Issuer'}</h2>
                <p className="text-gray-600 text-sm">{userData?.email}</p>
                <div className="mt-2 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Verified Issuer
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <nav>
                  <button
                    onClick={() => handleTabChange('dashboard')}
                    className={`w-full text-left px-4 py-2 rounded-lg mb-1 flex items-center ${
                      activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="material-icons-outlined mr-3">dashboard</span>
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleTabChange('wallet')}
                    className={`w-full text-left px-4 py-2 rounded-lg mb-1 flex items-center ${
                      activeTab === 'wallet' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="material-icons-outlined mr-3">account_balance_wallet</span>
                    Wallet
                  </button>
                  <button
                    onClick={() => handleTabChange('kyc')}
                    className={`w-full text-left px-4 py-2 rounded-lg mb-1 flex items-center ${
                      activeTab === 'kyc' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="material-icons-outlined mr-3">verified_user</span>
                    KYC Verification
                  </button>
                  <button
                    onClick={() => handleTabChange('offerings')}
                    className={`w-full text-left px-4 py-2 rounded-lg mb-1 flex items-center ${
                      activeTab === 'offerings' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="material-icons-outlined mr-3">storefront</span>
                    Offerings
                  </button>
                  <button
                    onClick={() => handleTabChange('profile')}
                    className={`w-full text-left px-4 py-2 rounded-lg mb-1 flex items-center ${
                      activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="material-icons-outlined mr-3">person</span>
                    Profile
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            {activeTab === 'dashboard' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-6">Issuer Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-600">Active Offerings</h3>
                    <p className="text-3xl font-bold mt-2">2</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-600">Total Raised</h3>
                    <p className="text-3xl font-bold mt-2">$250,000</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-600">Investors</h3>
                    <p className="text-3xl font-bold mt-2">42</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-6">
                  <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                  <ul className="space-y-3">
                    <li className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>New investment in Project Alpha</span>
                        <span className="text-sm text-gray-500">2 hours ago</span>
                      </div>
                      <p className="text-green-600 font-semibold">+$10,000</p>
                    </li>
                    <li className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>Document verification approved</span>
                        <span className="text-sm text-gray-500">Yesterday</span>
                      </div>
                      <p className="text-blue-600">Project Beta prospectus</p>
                    </li>
                    <li className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between">
                        <span>New offering created</span>
                        <span className="text-sm text-gray-500">3 days ago</span>
                      </div>
                      <p className="text-blue-600">Project Beta</p>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'wallet' && (
              <div>
                <IssuerWallet />
              </div>
            )}

            {activeTab === 'kyc' && (
              <IssuerKYC />
            )}

            {activeTab === 'offerings' && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">My Offerings</h1>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow">
                    + New Offering
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="py-3 px-4 text-left">Offering</th>
                        <th className="py-3 px-4 text-left">Status</th>
                        <th className="py-3 px-4 text-left">Target</th>
                        <th className="py-3 px-4 text-left">Raised</th>
                        <th className="py-3 px-4 text-left">Investors</th>
                        <th className="py-3 px-4 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">
                          <div className="font-semibold">Project Alpha</div>
                          <div className="text-sm text-gray-500">Created 2 months ago</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4">$500,000</td>
                        <td className="py-3 px-4">$230,000</td>
                        <td className="py-3 px-4">27</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              View
                            </button>
                            <button className="text-blue-600 hover:text-blue-800">
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">
                          <div className="font-semibold">Project Beta</div>
                          <div className="text-sm text-gray-500">Created 5 days ago</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4">$350,000</td>
                        <td className="py-3 px-4">$20,000</td>
                        <td className="py-3 px-4">15</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              View
                            </button>
                            <button className="text-blue-600 hover:text-blue-800">
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">
                          <div className="font-semibold">Project Gamma</div>
                          <div className="text-sm text-gray-500">Created 6 months ago</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            Completed
                          </span>
                        </td>
                        <td className="py-3 px-4">$200,000</td>
                        <td className="py-3 px-4">$200,000</td>
                        <td className="py-3 px-4">31</td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold mb-6">My Profile</h1>
                <p>Profile management coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssuerDashboard;