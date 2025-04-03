import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InvestorDashboard = () => {
  const [investorData, setInvestorData] = useState(null);
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [investorResponse, offeringsResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/investor/profile', {
            withCredentials: true,
          }),
          axios.get('http://localhost:5000/api/investor/offerings', {
            withCredentials: true,
          }),
        ]);

        setInvestorData(investorResponse.data);
        setOfferings(offeringsResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch investor data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;
  if (!investorData) return <div className="text-center mt-8">No data available</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Investor Dashboard</h1>

      {/* Investor Profile */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Investor Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="text-lg font-medium">{investorData.first_name} {investorData.last_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Accreditation Status</p>
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
              ${investorData.accreditation_status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {investorData.accreditation_status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Investment Capacity</p>
            <p className="text-lg font-medium">${investorData.investment_capacity?.toLocaleString() || 'Not specified'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Risk Profile</p>
            <p className="text-lg font-medium">{investorData.risk_profile || 'Not specified'}</p>
          </div>
        </div>
      </div>

      {/* Investment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Investments</h3>
          <p className="text-3xl font-bold text-indigo-600">
            ${investorData.total_investments?.toLocaleString() || '0'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Active Investments</h3>
          <p className="text-3xl font-bold text-green-600">
            {investorData.active_investments || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Available Balance</h3>
          <p className="text-3xl font-bold text-blue-600">
            ${investorData.available_balance?.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* Available Offerings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Available Investment Opportunities</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offering Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issuer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {offerings.map((offering, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{offering.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{offering.issuer_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${offering.target_amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${offering.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {offering.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard; 