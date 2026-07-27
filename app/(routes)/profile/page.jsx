"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserCircle,
  Mail,
  Calendar,
  Edit2,
  Loader2,
  X,
  PlusCircle,
  Search,
  Trash2,
  Edit
} from 'lucide-react';
import { toast } from "sonner";
import axios from 'axios';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';

const getImageUrl = (imgName) => {
  if (!imgName) return '/placeholder-cover.png';
  if (imgName.startsWith('http://') || imgName.startsWith('https://')) {
    return imgName;
  }
  return `${BASE_IMAGE_URL}${imgName}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function ProfilePage() {
  const router = useRouter();

  // Core Data States
  const [profileSummary, setProfileSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Main Perspective Tab: 'reader' | 'creator'
  const [mainTab, setMainTab] = useState('reader');

  // Reader Sub-tabs: 'history' | 'saved' | 'liked' | 'subscriptions'
  const [readerTab, setReaderTab] = useState('history');

  // Tab Content Data States
  const [historyList, setHistoryList] = useState([]);
  const [savedList, setSavedList] = useState([]);
  const [likedList, setLikedList] = useState([]);
  const [subscriptionsList, setSubscriptionsList] = useState([]);
  const [creatorStoriesList, setCreatorStoriesList] = useState([]);

  // Data Loading States
  const [tabLoading, setTabLoading] = useState(false);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [creatorStatusFilter, setCreatorStatusFilter] = useState('all');
  const [creatorSort, setCreatorSort] = useState('newest');

  // Modal / Dialog States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [storyToTogglePublish, setStoryToTogglePublish] = useState(null);
  const [clearHistoryDialogOpen, setClearHistoryDialogOpen] = useState(false);

  // Account Settings Form States
  const [activeEditField, setActiveEditField] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({ email: '', password: '' });
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  // 1. Initial Load: Fetch Profile Summary
  const fetchProfileSummary = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await axios.get('/api/user/profile-summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileSummary(res.data);
      setFormData(prev => ({
        ...prev,
        username: res.data.user.username,
        email: res.data.user.email
      }));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile summary:', err);
      setError(err.response?.data?.error || 'Failed to load profile');
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfileSummary();
  }, [fetchProfileSummary]);

  // 2. Fetch Tab Content Data
  const fetchTabContent = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setTabLoading(true);

    try {
      if (mainTab === 'reader') {
        if (readerTab === 'history') {
          const res = await axios.get(`/api/user/history?search=${encodeURIComponent(searchQuery)}&type=${typeFilter}&sort=${sortOrder}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setHistoryList(res.data.history || []);
        } else if (readerTab === 'saved') {
          const res = await axios.get(`/api/user/saved-stories?search=${encodeURIComponent(searchQuery)}&type=${typeFilter}&sort=${sortOrder}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSavedList(res.data.savedStories || []);
        } else if (readerTab === 'liked') {
          const res = await axios.get(`/api/user/liked-stories?search=${encodeURIComponent(searchQuery)}&type=${typeFilter}&sort=${sortOrder}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setLikedList(res.data.likedStories || []);
        } else if (readerTab === 'subscriptions') {
          const res = await axios.get('/api/user/subscriptions', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSubscriptionsList(res.data.subscriptions || []);
        }
      } else if (mainTab === 'creator') {
        const res = await axios.get(`/api/user/creator-stories?search=${encodeURIComponent(searchQuery)}&status=${creatorStatusFilter}&type=${typeFilter}&sort=${creatorSort}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCreatorStoriesList(res.data.stories || []);
      }
    } catch (err) {
      console.error('Error fetching tab content:', err);
      toast.error('Failed to load content');
    } finally {
      setTabLoading(false);
    }
  }, [mainTab, readerTab, searchQuery, typeFilter, sortOrder, creatorStatusFilter, creatorSort]);

  useEffect(() => {
    if (!loading && profileSummary) {
      fetchTabContent();
    }
  }, [loading, profileSummary, fetchTabContent]);

  // Account Info Updates
  const handleUpdateProfileField = async (field) => {
    setFormErrors({ email: '', password: '' });
    const token = localStorage.getItem("token");
    setIsUpdatingUser(true);

    try {
      let updateData = {};
      let endpoint = '/api/user/profile/update';

      if (field === 'password') {
        if (!formData.currentPassword || !formData.newPassword) {
          toast.error("Please fill in all password fields");
          setIsUpdatingUser(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setFormErrors(prev => ({ ...prev, password: "Passwords don't match" }));
          toast.error("New passwords don't match");
          setIsUpdatingUser(false);
          return;
        }
        updateData = {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        };
        endpoint = '/api/user/profile/update-password';
      } else {
        updateData = { [field]: formData[field] };
      }

      const res = await axios.put(endpoint, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        window.dispatchEvent(new Event("auth-change"));
      }

      setProfileSummary(prev => ({
        ...prev,
        user: { ...prev.user, [field]: formData[field] }
      }));

      setActiveEditField(null);
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);

      if (field === 'password') {
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || `Failed to update ${field}`;
      setFormErrors(prev => ({ ...prev, [field]: msg }));
      toast.error(msg);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // History Removal
  const handleRemoveHistoryItem = async (storyId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/user/history?storyId=${storyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistoryList(prev => prev.filter(item => item.story_id !== storyId));
      setProfileSummary(prev => ({
        ...prev,
        readerStats: { ...prev.readerStats, historyCount: Math.max(0, prev.readerStats.historyCount - 1) }
      }));
      toast.success('Removed from reading history');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove item');
    }
  };

  // Clear All History
  const handleClearAllHistory = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete('/api/user/history?clearAll=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistoryList([]);
      setProfileSummary(prev => ({
        ...prev,
        readerStats: { ...prev.readerStats, historyCount: 0 }
      }));
      setClearHistoryDialogOpen(false);
      toast.success('Reading history cleared');
    } catch (err) {
      console.error(err);
      toast.error('Failed to clear history');
    }
  };

  // Unsave Item
  const handleRemoveSavedItem = async (storyId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/user/saved-stories?storyId=${storyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedList(prev => prev.filter(item => item.story_id !== storyId));
      setProfileSummary(prev => ({
        ...prev,
        readerStats: { ...prev.readerStats, savedCount: Math.max(0, prev.readerStats.savedCount - 1) }
      }));
      toast.success('Removed from saved stories');
    } catch (err) {
      console.error(err);
      toast.error('Failed to unsave story');
    }
  };

  // Toggle Subscribe Author
  const handleToggleSubscribeAuthor = async (authorId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");
    try {
      await axios.post(`/api/author/${authorId}/subscribe`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubscriptionsList(prev => prev.filter(sub => sub.author_id !== authorId));
      setProfileSummary(prev => ({
        ...prev,
        readerStats: { ...prev.readerStats, subscriptionsCount: Math.max(0, prev.readerStats.subscriptionsCount - 1) }
      }));
      toast.success('Unsubscribed from author');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update subscription');
    }
  };

  // Creator Story Publish Toggle
  const handleConfirmPublishToggle = async () => {
    if (!storyToTogglePublish) return;
    const token = localStorage.getItem("token");
    try {
      const newStatus = !storyToTogglePublish.is_published;
      await axios.patch(`/api/stories/${storyToTogglePublish.id}/publish`, {
        isPublished: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCreatorStoriesList(prev =>
        prev.map(s => (s.id === storyToTogglePublish.id ? { ...s, is_published: newStatus } : s))
      );

      toast.success(`Story ${newStatus ? 'published' : 'unpublished'} successfully`);
      setPublishDialogOpen(false);
      setStoryToTogglePublish(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update story status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-neutral-400 text-sm font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full text-center">
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-full py-2.5 text-sm font-semibold transition-all"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const { user, isCreator, readerStats, creatorStats } = profileSummary;

  return (
    <div className="min-h-screen bg-black text-white pb-24 md:pt-8">
      <div className="w-full max-w-6xl mx-auto px-6 md:px-12 space-y-8">

        {/* Page Title Section */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">Profile</h1>
          <p className="text-sm md:text-base text-neutral-400">Manage your reading library, preferences, and creator activities</p>
        </div>

        {/* Profile Hero Card */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

            {/* Left: User Avatar & Info */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-purple-600 to-purple-800 text-white font-extrabold text-3xl shadow-lg shadow-purple-950/50 flex items-center justify-center shrink-0">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">{user?.username}</h2>
                  {isCreator && (
                    <span className="bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs px-3 py-1 rounded-full font-semibold">
                      Creator
                    </span>
                  )}
                </div>
                <p className="text-neutral-400 text-sm">{user?.email}</p>
                <p className="text-neutral-500 text-xs">Member since {formatDate(user?.createdAt)}</p>
              </div>
            </div>

            {/* Right: Account Settings */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-purple-900/30 transition-all self-start md:self-auto"
            >
              Account Settings
            </button>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-6 pt-6 border-t border-neutral-800">
            <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800/80 text-center">
              <div className="text-neutral-400 text-xs font-medium">History</div>
              <div className="text-xl font-extrabold text-white mt-0.5">{readerStats.historyCount}</div>
            </div>
            <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800/80 text-center">
              <div className="text-neutral-400 text-xs font-medium">Saved</div>
              <div className="text-xl font-extrabold text-white mt-0.5">{readerStats.savedCount}</div>
            </div>
            <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800/80 text-center">
              <div className="text-neutral-400 text-xs font-medium">Liked</div>
              <div className="text-xl font-extrabold text-white mt-0.5">{readerStats.likedCount}</div>
            </div>
            <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800/80 text-center">
              <div className="text-neutral-400 text-xs font-medium">Subscribed</div>
              <div className="text-xl font-extrabold text-white mt-0.5">{readerStats.subscriptionsCount}</div>
            </div>

            {/* Creator Stats */}
            {isCreator && creatorStats && (
              <>
                <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800/80 text-center">
                  <div className="text-neutral-400 text-xs font-medium">Total Views</div>
                  <div className="text-xl font-extrabold text-white mt-0.5">{creatorStats.totalViews}</div>
                </div>
                <div className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800/80 text-center">
                  <div className="text-neutral-400 text-xs font-medium">Subscribers</div>
                  <div className="text-xl font-extrabold text-white mt-0.5">{creatorStats.totalSubscribers}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Main Perspective Selector (Reader Library vs Creator Studio) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setMainTab('reader'); setSearchQuery(''); }}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                mainTab === 'reader'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                  : 'bg-neutral-900 text-white/80 border border-neutral-800 hover:border-purple-500/50'
              }`}
            >
              Reader Library
            </button>

            {/* Creator Studio Tab (ONLY rendered if user is a creator) */}
            {isCreator && (
              <button
                onClick={() => { setMainTab('creator'); setSearchQuery(''); }}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  mainTab === 'creator'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                    : 'bg-neutral-900 text-white/80 border border-neutral-800 hover:border-purple-500/50'
                }`}
              >
                Creator Studio
              </button>
            )}
          </div>

          {mainTab === 'creator' && (
            <button
              onClick={() => router.push('/create-story')}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" /> Create Story
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* READER SECTION                                                            */}
        {/* ========================================================================= */}
        {mainTab === 'reader' && (
          <div className="space-y-6">

            {/* Reader Sub-Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => { setReaderTab('history'); setSearchQuery(''); }}
                  className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                    readerTab === 'history'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-neutral-900 text-white/80 border border-neutral-800 hover:border-purple-500/50'
                  }`}
                >
                  History ({readerStats.historyCount})
                </button>
                <button
                  onClick={() => { setReaderTab('saved'); setSearchQuery(''); }}
                  className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                    readerTab === 'saved'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-neutral-900 text-white/80 border border-neutral-800 hover:border-purple-500/50'
                  }`}
                >
                  Saved ({readerStats.savedCount})
                </button>
                <button
                  onClick={() => { setReaderTab('liked'); setSearchQuery(''); }}
                  className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                    readerTab === 'liked'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-neutral-900 text-white/80 border border-neutral-800 hover:border-purple-500/50'
                  }`}
                >
                  Liked ({readerStats.likedCount})
                </button>
                <button
                  onClick={() => { setReaderTab('subscriptions'); setSearchQuery(''); }}
                  className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all ${
                    readerTab === 'subscriptions'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-neutral-900 text-white/80 border border-neutral-800 hover:border-purple-500/50'
                  }`}
                >
                  Subscribed Authors ({readerStats.subscriptionsCount})
                </button>
              </div>

              {readerTab === 'history' && historyList.length > 0 && (
                <button
                  onClick={() => setClearHistoryDialogOpen(true)}
                  className="text-xs text-red-400 hover:text-red-300 font-medium px-4 py-2 rounded-full border border-red-900/40 hover:bg-red-950/30 transition-all ml-auto"
                >
                  Clear History
                </button>
              )}
            </div>

            {/* Reader Search & Controls */}
            {readerTab !== 'subscriptions' && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search stories by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-900/90 text-white border border-neutral-800 focus:border-purple-500 rounded-full py-2.5 pl-10 pr-4 outline-none transition-all placeholder:text-neutral-500 text-sm"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-neutral-900 text-white text-xs md:text-sm font-medium px-4 py-2.5 rounded-full border border-neutral-800 hover:border-purple-500/50 focus:border-purple-500 outline-none transition-all"
                  >
                    <option value="all">All Formats</option>
                    <option value="chat">Chat Story</option>
                    <option value="game">Interactive Game</option>
                  </select>

                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-neutral-900 text-white text-xs md:text-sm font-medium px-4 py-2.5 rounded-full border border-neutral-800 hover:border-purple-500/50 focus:border-purple-500 outline-none transition-all"
                  >
                    <option value="desc">Most Recent</option>
                    <option value="asc">Oldest</option>
                  </select>
                </div>
              </div>
            )}

            {/* Tab Content Loader */}
            {tabLoading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : (
              <>
                {/* READING HISTORY CONTENT */}
                {readerTab === 'history' && (
                  historyList.length === 0 ? (
                    <div className="text-center py-16 bg-neutral-950/50 rounded-2xl border border-neutral-900 p-6">
                      <h3 className="text-white font-semibold text-lg mb-1">No reading history yet</h3>
                      <p className="text-neutral-500 text-sm mb-4">Start exploring stories to build your history!</p>
                      <button
                        onClick={() => router.push('/stories')}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-purple-900/30 transition-all"
                      >
                        Explore Stories
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {historyList.map((item) => (
                        <div
                          key={item.history_id}
                          onClick={() => router.push(`/stories/${item.story_id}/story-overview`)}
                          className="bg-neutral-900/80 border border-neutral-800 hover:border-purple-500/50 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col justify-between shadow-lg hover:-translate-y-1"
                        >
                          <div className="p-4 flex gap-4">
                            <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 bg-neutral-950">
                              <img
                                src={getImageUrl(item.cover_img)}
                                alt={item.title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover rounded-xl border-[3px] border-white/90 group-hover:border-purple-500 transition-colors"
                              />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <span className="inline-block bg-neutral-800 text-neutral-300 border border-neutral-700 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                                {item.story_type === 'game' ? 'Interactive Game' : 'Chat Story'}
                              </span>
                              <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                                {item.title}
                              </h3>
                              <p className="text-neutral-400 text-xs line-clamp-2">{item.synopsis || 'No synopsis'}</p>
                              <div className="text-neutral-500 text-[11px] pt-1">
                                Read {formatDate(item.last_read_at)}
                              </div>
                            </div>
                          </div>

                          <div className="px-4 py-3 bg-neutral-950/60 border-t border-neutral-800 flex items-center justify-between">
                            <span className="text-xs text-purple-400 font-semibold group-hover:underline">
                              Continue Reading
                            </span>
                            <button
                              onClick={(e) => handleRemoveHistoryItem(item.story_id, e)}
                              className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
                              title="Remove from history"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* SAVED STORIES CONTENT */}
                {readerTab === 'saved' && (
                  savedList.length === 0 ? (
                    <div className="text-center py-16 bg-neutral-950/50 rounded-2xl border border-neutral-900 p-6">
                      <h3 className="text-white font-semibold text-lg mb-1">No saved stories</h3>
                      <p className="text-neutral-500 text-sm">Save stories while browsing to read them anytime from your profile!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {savedList.map((item) => (
                        <div
                          key={item.save_id}
                          onClick={() => router.push(`/stories/${item.story_id}/story-overview`)}
                          className="bg-neutral-900/80 border border-neutral-800 hover:border-purple-500/50 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col justify-between shadow-lg hover:-translate-y-1"
                        >
                          <div className="p-4 flex gap-4">
                            <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 bg-neutral-950">
                              <img
                                src={getImageUrl(item.cover_img)}
                                alt={item.title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover rounded-xl border-[3px] border-white/90 group-hover:border-purple-500 transition-colors"
                              />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <span className="inline-block bg-neutral-800 text-neutral-300 border border-neutral-700 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                                {item.story_type === 'game' ? 'Interactive Game' : 'Chat Story'}
                              </span>
                              <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                                {item.title}
                              </h3>
                              <p className="text-neutral-400 text-xs line-clamp-2">{item.synopsis || 'No synopsis'}</p>
                              <div className="text-neutral-500 text-[11px] pt-1">
                                Saved {formatDate(item.saved_at)}
                              </div>
                            </div>
                          </div>

                          <div className="px-4 py-3 bg-neutral-950/60 border-t border-neutral-800 flex items-center justify-between">
                            <span className="text-xs text-purple-400 font-semibold group-hover:underline">
                              Read Story
                            </span>
                            <button
                              onClick={(e) => handleRemoveSavedItem(item.story_id, e)}
                              className="text-xs text-neutral-400 hover:text-red-400 px-3 py-1 rounded-full border border-neutral-800 hover:border-red-900/40 transition-colors"
                            >
                              Unsave
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* LIKED STORIES CONTENT */}
                {readerTab === 'liked' && (
                  likedList.length === 0 ? (
                    <div className="text-center py-16 bg-neutral-950/50 rounded-2xl border border-neutral-900 p-6">
                      <h3 className="text-white font-semibold text-lg mb-1">No liked stories yet</h3>
                      <p className="text-neutral-500 text-sm">Stories you like will show up here!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {likedList.map((item) => (
                        <div
                          key={item.like_id}
                          onClick={() => router.push(`/stories/${item.story_id}/story-overview`)}
                          className="bg-neutral-900/80 border border-neutral-800 hover:border-purple-500/50 rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 flex flex-col justify-between shadow-lg hover:-translate-y-1"
                        >
                          <div className="p-4 flex gap-4">
                            <div className="w-20 h-28 rounded-xl overflow-hidden shrink-0 bg-neutral-950">
                              <img
                                src={getImageUrl(item.cover_img)}
                                alt={item.title}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover rounded-xl border-[3px] border-white/90 group-hover:border-purple-500 transition-colors"
                              />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <span className="inline-block bg-neutral-800 text-neutral-300 border border-neutral-700 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                                {item.story_type === 'game' ? 'Interactive Game' : 'Chat Story'}
                              </span>
                              <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors truncate">
                                {item.title}
                              </h3>
                              <p className="text-neutral-400 text-xs line-clamp-2">{item.synopsis || 'No synopsis'}</p>
                              <div className="text-neutral-500 text-[11px] pt-1">
                                Liked {formatDate(item.liked_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* SUBSCRIBED AUTHORS CONTENT */}
                {readerTab === 'subscriptions' && (
                  subscriptionsList.length === 0 ? (
                    <div className="text-center py-16 bg-neutral-950/50 rounded-2xl border border-neutral-900 p-6">
                      <h3 className="text-white font-semibold text-lg mb-1">No subscribed authors</h3>
                      <p className="text-neutral-500 text-sm">Subscribe to creators to stay updated on their stories!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {subscriptionsList.map((sub) => (
                        <div
                          key={sub.subscription_id}
                          className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-lg"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-purple-800 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
                              {sub.author_username ? sub.author_username.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-white truncate">{sub.author_username}</h3>
                              <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                                <span>{sub.publishedStoriesCount} stories</span>
                                <span>•</span>
                                <span>{sub.subscribersCount} subscribers</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => handleToggleSubscribeAuthor(sub.author_id, e)}
                            className="bg-neutral-800 hover:bg-red-950/30 text-neutral-300 hover:text-red-400 border border-neutral-700 hover:border-red-900/40 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0"
                          >
                            Subscribed
                          </button>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* CREATOR STUDIO SECTION                                                    */}
        {/* ========================================================================= */}
        {mainTab === 'creator' && isCreator && (
          <div className="space-y-6">

            {/* Creator Overview Analytics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl shadow-lg">
                <div className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Uploaded Stories</div>
                <div className="text-2xl font-extrabold text-white mt-1">{creatorStats?.totalStories || 0}</div>
                <div className="text-xs text-neutral-500 mt-1">
                  {creatorStats?.publishedStories || 0} Published • {creatorStats?.draftStories || 0} Drafts
                </div>
              </div>

              <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl shadow-lg">
                <div className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Total Views</div>
                <div className="text-2xl font-extrabold text-white mt-1">{creatorStats?.totalViews || 0}</div>
                <div className="text-xs text-neutral-500 mt-1">Across all uploaded stories</div>
              </div>

              <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl shadow-lg">
                <div className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Total Likes</div>
                <div className="text-2xl font-extrabold text-white mt-1">{creatorStats?.totalLikes || 0}</div>
                <div className="text-xs text-neutral-500 mt-1">Reader appreciation</div>
              </div>

              <div className="bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl shadow-lg">
                <div className="text-neutral-400 text-xs font-medium uppercase tracking-wider">Subscribers</div>
                <div className="text-2xl font-extrabold text-white mt-1">{creatorStats?.totalSubscribers || 0}</div>
                <div className="text-xs text-neutral-500 mt-1">Following author profile</div>
              </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search your stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900/90 text-white border border-neutral-800 focus:border-purple-500 rounded-full py-2.5 pl-10 pr-4 outline-none transition-all placeholder:text-neutral-500 text-sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={creatorStatusFilter}
                  onChange={(e) => setCreatorStatusFilter(e.target.value)}
                  className="bg-neutral-900 text-white text-xs md:text-sm font-medium px-4 py-2.5 rounded-full border border-neutral-800 hover:border-purple-500/50 focus:border-purple-500 outline-none transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published Only</option>
                  <option value="draft">Drafts Only</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-neutral-900 text-white text-xs md:text-sm font-medium px-4 py-2.5 rounded-full border border-neutral-800 hover:border-purple-500/50 focus:border-purple-500 outline-none transition-all"
                >
                  <option value="all">All Formats</option>
                  <option value="chat">Chat Story</option>
                  <option value="game">Interactive Game</option>
                </select>

                <select
                  value={creatorSort}
                  onChange={(e) => setCreatorSort(e.target.value)}
                  className="bg-neutral-900 text-white text-xs md:text-sm font-medium px-4 py-2.5 rounded-full border border-neutral-800 hover:border-purple-500/50 focus:border-purple-500 outline-none transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="views_desc">Most Viewed</option>
                  <option value="likes_desc">Most Liked</option>
                </select>
              </div>
            </div>

            {/* Uploaded Stories List */}
            {tabLoading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            ) : creatorStoriesList.length === 0 ? (
              <div className="text-center py-16 bg-neutral-950/50 rounded-2xl border border-neutral-900 p-6">
                <h3 className="text-white font-semibold text-lg mb-1">No stories match your filter</h3>
                <p className="text-neutral-500 text-sm mb-4">Try adjusting filters or create a new story!</p>
                <button
                  onClick={() => router.push('/create-story')}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg shadow-purple-900/30 transition-all"
                >
                  Create Story
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {creatorStoriesList.map((story) => (
                  <div
                    key={story.id}
                    className="bg-neutral-900/80 border border-neutral-800 hover:border-purple-500/50 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-lg hover:-translate-y-1"
                  >
                    <div>
                      {/* Cover & Badges */}
                      <div className="aspect-[16/9] relative bg-neutral-950">
                        <img
                          src={getImageUrl(story.cover_img)}
                          alt={story.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                            story.is_published ? 'bg-emerald-600' : 'bg-neutral-700'
                          }`}>
                            {story.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="bg-neutral-900/90 border border-neutral-700 text-neutral-200 text-xs px-3 py-1 rounded-full font-medium">
                            {story.story_type === 'game' ? 'Game' : 'Chat'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="text-base font-bold text-white line-clamp-1">{story.title}</h3>
                          <p className="text-neutral-400 text-xs line-clamp-2 mt-1">{story.synopsis || 'No synopsis'}</p>
                        </div>

                        {/* Metrics */}
                        <div className="flex items-center justify-between text-xs text-neutral-400 pt-3 border-t border-neutral-800">
                          <div className="flex items-center gap-4">
                            <span className="font-semibold text-neutral-300">{story.views_count} Views</span>
                            <span className="font-semibold text-neutral-300">{story.likes_count} Likes</span>
                          </div>
                          <span>{story.episodes_count} Episodes</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="p-4 bg-neutral-950/60 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/create-story/${story.id}/create-episode`)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md transition-all"
                        >
                          Add Content
                        </button>
                        <button
                          onClick={() => router.push(`/edit-story/${story.id}`)}
                          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3.5 py-1.5 rounded-full text-xs font-medium border border-neutral-700 transition-all flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setStoryToTogglePublish(story);
                          setPublishDialogOpen(true);
                        }}
                        className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all ${
                          story.is_published
                            ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {story.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* ACCOUNT SETTINGS MODAL                                                    */}
      {/* ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h2 className="text-lg font-extrabold text-white">Account Settings</h2>
              <button
                onClick={() => { setIsEditModalOpen(false); setActiveEditField(null); }}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Username */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-medium">Username</span>
                  {activeEditField !== 'username' && (
                    <button
                      onClick={() => setActiveEditField('username')}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {activeEditField === 'username' ? (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="w-full bg-neutral-900 text-white border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setActiveEditField(null)}
                        className="px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={isUpdatingUser}
                        onClick={() => handleUpdateProfileField('username')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-md"
                      >
                        {isUpdatingUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-white">{user?.username}</p>
                )}
              </div>

              {/* Email */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-medium">Email</span>
                  {activeEditField !== 'email' && (
                    <button
                      onClick={() => setActiveEditField('email')}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                    >
                      Edit
                    </button>
                  )}
                </div>
                {activeEditField === 'email' ? (
                  <div className="space-y-2 pt-1">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-neutral-900 text-white border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                    />
                    {formErrors.email && <p className="text-xs text-red-400">{formErrors.email}</p>}
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setActiveEditField(null)}
                        className="px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={isUpdatingUser}
                        onClick={() => handleUpdateProfileField('email')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-md"
                      >
                        {isUpdatingUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-white">{user?.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-medium">Password</span>
                  {activeEditField !== 'password' && (
                    <button
                      onClick={() => setActiveEditField('password')}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                    >
                      Change Password
                    </button>
                  )}
                </div>
                {activeEditField === 'password' ? (
                  <div className="space-y-2 pt-1">
                    <input
                      type="password"
                      placeholder="Current Password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full bg-neutral-900 text-white border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full bg-neutral-900 text-white border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full bg-neutral-900 text-white border border-neutral-800 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                    />
                    {formErrors.password && <p className="text-xs text-red-400">{formErrors.password}</p>}
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => setActiveEditField(null)}
                        className="px-3 py-1.5 text-xs font-semibold text-neutral-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={isUpdatingUser}
                        onClick={() => handleUpdateProfileField('password')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-md"
                      >
                        {isUpdatingUser ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Update Password'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-bold text-white">••••••••••••</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOGS */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent className="bg-neutral-900 text-white border border-neutral-800 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">
              {storyToTogglePublish?.is_published ? "Unpublish Story?" : "Publish Story?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400 text-sm">
              {storyToTogglePublish?.is_published
                ? `Unpublishing "${storyToTogglePublish?.title}" will move it back to draft and make it private to you.`
                : `Publishing "${storyToTogglePublish?.title}" will make it visible to all readers on the platform.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border-none rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPublishToggle}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearHistoryDialogOpen} onOpenChange={setClearHistoryDialogOpen}>
        <AlertDialogContent className="bg-neutral-900 text-white border border-neutral-800 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Clear Reading History?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400 text-sm">
              Are you sure you want to delete all reading history? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border-none rounded-full">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAllHistory}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full"
            >
              Clear All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}