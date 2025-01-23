"use client";

import React, { useState, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { Loader2, PlusCircle, BookOpen, MessageSquare, Folder, Edit } from "lucide-react";
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

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
  </div>
);

const YourStoriesPage = () => {
  const router = useRouter();
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;    
    if(!token) {
      redirect("/login");
    }
  fetchStories();
  }, []);

  const fetchStories = async () => {
    // const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;    
    try {
      const response = await fetch('/api/stories/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch stories');
      const data = await response.json();
      setStories(data.stories);
    } catch (error) {
      setError("Failed to load stories. Please try again.");
      console.error("Error fetching stories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishToggle = async (story) => {
    setSelectedStory(story);
    setPublishDialogOpen(true);
  };

  const navigateToContent = (story) => {
    if (story.type === 'chat') {
      router.push(`/create-story/${story.id}/chat-content`); // Route for chat stories
    } else {
      router.push(`/create-story/${story.id}/normal-content`); // Route for normal stories
    }
  };

  // Helper function to get story type label and style
  const getStoryTypeStyle = (type) => {
    return type === 'chat' 
      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
  };

  const confirmPublishToggle = async () => {
    try {
      const response = await fetch(`/api/stories/${selectedStory.id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isPublished: !selectedStory.isPublished 
        }),
      });

      if (!response.ok) throw new Error('Failed to update story status');

      // Update local state
      setStories(stories.map(story => 
        story.id === selectedStory.id 
          ? { ...story, isPublished: !story.isPublished }
          : story
      ));

      setPublishDialogOpen(false);
    } catch (error) {
      setError("Failed to update story status. Please try again.");
      console.error("Error updating story status:", error);
    }
  };

  const navigateToAddContent = (storyId) => {
    router.push(`/create-story/${storyId}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Stories</h1>
            <button
              onClick={() => router.push('/create-story')}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg 
                flex items-center gap-2 transition duration-200"
            >
              <PlusCircle className="h-5 w-5" />
              Create New Story
            </button>
        </div>
        {isLoading ? (
          <LoadingSpinner />
        ) : stories.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl text-gray-400 mb-4">You haven&apos;t created any stories yet</h2>
            <button
              onClick={() => router.push('/create-story')}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg 
                inline-flex items-center gap-2 transition duration-200"
            >
              <PlusCircle className="h-5 w-5" />
              Create Your First Story
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg 
                  transition duration-200 hover:transform hover:-translate-y-1"
              >
                {/* Cover Image */}
                <div className="aspect-[16/9] relative">
                  <img
                    src={`https://wowfy.in/testusr/images/${story.coverImage}`}
                    alt={story.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{story.title}</h2>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {story.synopsis}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {/* Category Tag - Softer, more neutral style */}
                    <div className="flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-gray-400" />
                      <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                        {story.category}
                      </span>
                    </div>

                    {/* Story Type Tag - More distinctive style */}
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                      <span className={`px-3 py-1 rounded-full text-sm ${getStoryTypeStyle(story.type)}`}>
                        {story.type === 'chat' ? 'Chat Story' : 'Normal Story'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigateToContent(story)}
                          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-2xl
                            flex items-center gap-2 text-xs"
                        >
                          {story.type === 'chat' ? (
                            <>
                              <MessageSquare className="h-4 w-4" />
                              Add Chat
                            </>
                          ) : (
                            <>
                              <BookOpen className="h-4 w-4" />
                              Add Story
                            </>
                          )}
                        </button>

                        {/* New Edit Story Button */}
                        <button
                          onClick={() => router.push(`/create-story?storyId=${story.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-2xl 
                            flex items-center gap-2 text-xs me-4"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                      </div>

                      <label className="inline-flex items-center cursor-pointer">
                        <span className="mr-3 text-sm font-medium">
                          {story.isPublished ? "Published" : "Draft"}
                        </span>
                        <div
                          onClick={() => handlePublishToggle(story)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 
                            ${story.isPublished ? 'bg-green-600' : 'bg-gray-600'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                              ${story.isPublished ? 'translate-x-6' : 'translate-x-1'}`}
                          />
                        </div>
                      </label>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Publish Confirmation Dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent className="bg-gray-800 text-white border border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedStory?.isPublished ? "Unpublish Story?" : "Publish Story?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {selectedStory?.isPublished
                ? "This will make your story private and only visible to you."
                : "This will make your story public and visible to other users."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white border-none">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmPublishToggle}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default YourStoriesPage;