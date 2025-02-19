"use client"
import React, { useEffect, useState } from 'react';
import { UserCircle, Mail, Key, Calendar, Edit2, Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import axios from 'axios';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Token check
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      redirect("/login");
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <p className="text-white/70">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-gray-800/50 rounded-2xl p-6 max-w-md w-full mx-4">
          <p className="text-red-400 text-center">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 w-full bg-white text-gray-900 rounded-full py-2 font-medium hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-black pb-16 md:pt-10">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white/90 mb-2">Profile</h1>
          <p className="text-sm md:text-base text-white/70">Manage your account details</p>
        </div>

        {/* Profile Content */}
        <div className="max-w-2xl mx-auto bg-gray-800/50 rounded-2xl p-6 md:p-8">
          {/* Profile Header with Image */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                {userData?.profileImage ? (
                  <img 
                    src={userData.profileImage} 
                    alt={userData.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="w-20 h-20 text-white/50" />
                )}
              </div>
              <button 
                className="absolute bottom-4 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Edit profile picture"
              >
                <Edit2 className="w-4 h-4 text-gray-900" />
              </button>
            </div>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Username */}
            <div className="flex items-start space-x-4">
              <UserCircle className="w-6 h-6 text-white/70 mt-1" />
              <div className="flex-1">
                <label className="block text-sm text-white/50 mb-1">Username</label>
                <div className="flex items-center justify-between">
                  <p className="text-white text-lg">{userData?.username}</p>
                  <button 
                    className="text-white/70 hover:text-white transition-colors"
                    aria-label="Edit username"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start space-x-4">
              <Mail className="w-6 h-6 text-white/70 mt-1" />
              <div className="flex-1">
                <label className="block text-sm text-white/50 mb-1">Email</label>
                <div className="flex items-center justify-between">
                  <p className="text-white text-lg">{userData?.email}</p>
                  <button 
                    className="text-white/70 hover:text-white transition-colors"
                    aria-label="Edit email"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="flex items-start space-x-4">
              <Key className="w-6 h-6 text-white/70 mt-1" />
              <div className="flex-1">
                <label className="block text-sm text-white/50 mb-1">Password</label>
                <div className="flex items-center justify-between">
                  <p className="text-white text-lg">••••••••••</p>
                  <button 
                    className="text-white/70 hover:text-white transition-colors"
                    aria-label="Change password"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-start space-x-4">
              <Calendar className="w-6 h-6 text-white/70 mt-1" />
              <div className="flex-1">
                <label className="block text-sm text-white/50 mb-1">Member Since</label>
                <p className="text-white text-lg">
                  {userData?.createdAt ? formatDate(userData.createdAt) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;