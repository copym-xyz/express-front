import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IssuerWallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Form state for sending tokens
  const [sendForm, setSendForm] = useState({
    to: '',
    amount: '',
    token: 'eth',
    chain: 'polygon-mumbai'
  });
  const [sendStatus, setSendStatus] = useState(null);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/wallet', {
        withCredentials: true,
      });
      setWalletData(response.data);
      
      // Fetch balance and transactions if wallet exists
      if (response.data && response.data.address) {
        await Promise.all([
          fetchBalanceData(response.data.address),
          fetchTransactions(response.data.address)
        ]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      
      if (error.response) {
        if (error.response.status === 404) {
          // Wallet not found, but not an error
          setWalletData(null);
          setLoading(false);
        } else if (error.response.status === 401) {
          setError('Authentication error. Please sign in again.');
          setLoading(false);
        } else if (error.response.status === 403) {
          setError('You do not have permission to access this wallet. Issuer role required.');
          setLoading(false);
        } else if (error.response.status === 500) {
          // Server error but we still want to allow creating a wallet
          console.warn('Server error but continuing to wallet creation screen');
          setWalletData(null);
          setLoading(false);
        } else {
          setError(`Error: ${error.response.data?.message || 'Unknown error'}`);
          setLoading(false);
        }
      } else {
        setError('Failed to connect to server. Please check your connection.');
        setLoading(false);
      }
    }
  };

  const fetchBalanceData = async (address) => {
    try {
      const response = await axios.get('http://localhost:5000/api/wallet/balance', {
        withCredentials: true,
      });
      setBalanceData(response.data);
    } catch (error) {
      console.error('Error fetching balance data:', error);
      // Don't set error state, just log it
    }
  };

  const fetchTransactions = async (address) => {
    try {
      const response = await axios.get('http://localhost:5000/api/wallet/transactions', {
        withCredentials: true,
      });
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Don't set error state, just log it
    }
  };

  const createWallet = async () => {
    try {
      setIsCreatingWallet(true);
      const response = await axios.post('http://localhost:5000/api/wallet/create', {}, {
        withCredentials: true,
      });
      setWalletData(response.data.wallet);
      setIsCreatingWallet(false);
      // Refresh the data
      fetchWalletData();
    } catch (error) {
      console.error('Error creating wallet:', error);
      setError('Failed to create wallet');
      setIsCreatingWallet(false);
    }
  };

  const handleSendFormChange = (e) => {
    const { name, value } = e.target;
    setSendForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendTokens = async (e) => {
    e.preventDefault();
    try {
      setSendStatus({ status: 'loading', message: 'Sending transaction...' });
      const response = await axios.post('http://localhost:5000/api/wallet/send', sendForm, {
        withCredentials: true,
      });
      setSendStatus({ status: 'success', message: 'Transaction submitted successfully!' });
      // Reset form
      setSendForm({
        to: '',
        amount: '',
        token: 'eth',
        chain: 'polygon-mumbai'
      });
      // Refresh transactions after a short delay
      setTimeout(() => {
        fetchTransactions(walletData.address);
      }, 3000);
    } catch (error) {
      console.error('Error sending tokens:', error);
      setSendStatus({ 
        status: 'error', 
        message: error.response?.data?.message || 'Failed to send transaction' 
      });
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (loading) return <div className="text-center mt-8">Loading wallet...</div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div className={`transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Issuer Wallet</h1>
          <button 
            onClick={toggleDarkMode}
            className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'}`}
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {!walletData ? (
          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-blue-600 to-purple-600 rounded-xl p-10 text-white shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Create Your Issuer Wallet</h2>
            <p className="text-center mb-6">
              Set up your EVM-compatible wallet to securely manage your digital assets on the blockchain.
            </p>
            <button
              onClick={createWallet}
              disabled={isCreatingWallet}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-300 shadow-lg"
            >
              {isCreatingWallet ? 'Creating...' : 'Create Wallet'}
            </button>
          </div>
        ) : (
          <>
            {/* Wallet Card and Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-blue-50'} rounded-xl p-6 h-72 shadow-xl flex flex-col justify-center items-center`}>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg w-80 h-48 shadow-xl flex flex-col justify-between p-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="flex justify-between items-start">
                    <div className="text-white text-xl font-bold">Issuer Wallet</div>
                    <div className="bg-yellow-400 w-12 h-8 rounded-md opacity-80"></div>
                  </div>
                  <div className="text-white font-mono mt-6 break-all text-xs">
                    {walletData.address}
                  </div>
                  <div className="text-white text-xs opacity-80">
                    Created: {new Date(walletData.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-xl`}>
                <h2 className="text-xl font-bold mb-4">Wallet Summary</h2>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chain</p>
                  <p className="font-medium">{walletData.chain.toUpperCase()}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                  <p className="font-medium">{walletData.type}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Custodial</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${walletData.is_custodial ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                    {walletData.is_custodial ? 'Yes' : 'No'}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Available Balance</p>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {balanceData && balanceData.balances && balanceData.balances.length > 0 
                      ? `${balanceData.balances[0].amount} ${balanceData.balances[0].token.toUpperCase()}`
                      : 'No balance data'}
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'overview'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('send')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'send'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Send
                  </button>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'transactions'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Transactions
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-xl`}>
              {activeTab === 'overview' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Token Balances</h2>
                  {balanceData && balanceData.balances && balanceData.balances.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Token
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Chain
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Balance
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {balanceData.balances.map((balance, index) => (
                            <tr key={index} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                                    <span className="text-xs font-bold">{balance.token.slice(0, 2).toUpperCase()}</span>
                                  </div>
                                  <div className="text-sm font-medium">{balance.token.toUpperCase()}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {balance.chain}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {balance.amount}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No tokens found in your wallet.</p>
                      <p className="mt-2">Visit a testnet faucet to get some test tokens.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'send' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Send Tokens</h2>
                  
                  {sendStatus && (
                    <div className={`mb-4 p-4 rounded-lg ${
                      sendStatus.status === 'loading' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      sendStatus.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {sendStatus.message}
                    </div>
                  )}
                  
                  <form onSubmit={handleSendTokens} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Recipient Address</label>
                      <input
                        type="text"
                        name="to"
                        value={sendForm.to}
                        onChange={handleSendFormChange}
                        placeholder="0x..."
                        className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <input
                          type="text"
                          name="amount"
                          value={sendForm.amount}
                          onChange={handleSendFormChange}
                          placeholder="0.01"
                          className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Token</label>
                        <select
                          name="token"
                          value={sendForm.token}
                          onChange={handleSendFormChange}
                          className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                          required
                        >
                          <option value="eth">ETH</option>
                          <option value="usdc">USDC</option>
                          <option value="usdt">USDT</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Chain</label>
                      <select
                        name="chain"
                        value={sendForm.chain}
                        onChange={handleSendFormChange}
                        className={`w-full px-4 py-2 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        required
                      >
                        <option value="polygon-mumbai">Polygon Mumbai</option>
                        <option value="base-sepolia">Base Sepolia</option>
                      </select>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors duration-300"
                      >
                        Send Transaction
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'transactions' && (
                <div>
                  <h2 className="text-xl font-bold mb-4">Transaction History</h2>
                  
                  {transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {transactions.map((tx, index) => (
                            <tr key={index} className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  tx.type === 'send' 
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                }`}>
                                  {tx.type === 'send' ? 'Sent' : 'Received'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {tx.amount} {tx.token.toUpperCase()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  tx.status === 'confirmed' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : tx.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {new Date(tx.timestamp).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">No transactions found.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default IssuerWallet; 