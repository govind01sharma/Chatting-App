import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { authUser, deleteAccount, logout } = useAuthStore();

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    // Confirm deletion with user
    const confirmed = window.confirm(
      `Are you sure you want to delete your account (${authUser.email})? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await deleteAccount(password);
      toast.success('Account deleted successfully');
      logout();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      
      {/* Danger Zone Section */}
      <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
        <p className="font-bold">Danger Zone</p>
        <p className="text-sm mt-1">
          Deleting your account will permanently remove all your data, including messages and profile information.
        </p>
      </div>

      <form onSubmit={handleDeleteAccount} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your password to confirm"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={isDeleting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? 'Deleting...' : `Delete Account (${authUser.email})`}
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;