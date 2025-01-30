import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";

const CreateStoryBasics = () => {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [storyData, setStoryData] = useState({
    name: "",
    synopsis: "",
    category: "",
    coverImage: null,
    coverImagePreview: null
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setError("Failed to load categories");
      console.error(error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      try {
        await validateImageAspectRatio(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setStoryData(prev => ({
            ...prev,
            coverImage: file,
            coverImagePreview: reader.result
          }));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setError(error);
        return;
      }
    }
  };

  const validateImageAspectRatio = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const aspectRatio = img.width / img.height;
        const targetRatio = 16 / 9;
        const tolerance = 0.1; // Allow 10% deviation from target ratio
        
        if (Math.abs(aspectRatio - targetRatio) > tolerance) {
          reject("Image must have a 16:9 aspect ratio (e.g., 1920x1080px)");
        } else {
          resolve();
        }
      };
      img.onerror = () => reject("Failed to load image");
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!storyData.name.trim()) {
      setError("Story name is required");
      return;
    }
    if (!storyData.synopsis.trim()) {
      setError("Story synopsis is required");
      return;
    }
    if (!storyData.category) {
      setError("Please select a category");
      return;
    }
    if (!storyData.coverImage) {
      setError("Please upload a cover image");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', storyData.name);
      formData.append('synopsis', storyData.synopsis);
      formData.append('category', storyData.category);
      formData.append('coverImage', storyData.coverImage);

      const response = await fetch('/api/stories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to create story');

      const responseData = await response.json();
      
      // Navigate to episode creation with new story ID
      router.push(`/create-story/${responseData.storyId}/create-episode`);
    } catch (error) {
      setError("Failed to create story. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 md:pt-28">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create Your Story</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Story Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Story Name</label>
            <input
              type="text"
              value={storyData.name}
              onChange={(e) => setStoryData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 rounded-lg bg-gray-800 focus:ring-2 focus:ring-purple-600"
              placeholder="Enter your story name"
            />
          </div>

          {/* Synopsis */}
          <div>
            <label className="block text-sm font-medium mb-2">Story Synopsis</label>
            <textarea
              value={storyData.synopsis}
              onChange={(e) => setStoryData(prev => ({ ...prev, synopsis: e.target.value }))}
              className="w-full p-3 rounded-lg bg-gray-800 focus:ring-2 focus:ring-purple-600 h-32"
              placeholder="Write a brief synopsis of your story"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Story Category</label>
            <select
              value={storyData.category}
              onChange={(e) => setStoryData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-3 rounded-lg bg-gray-800 focus:ring-2 focus:ring-purple-600"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Cover Image</label>
            <p className="text-sm text-gray-400 mb-2">
              Image must be in 16:9 aspect ratio (Recommended: 1920 x 1080px)
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="coverImageUpload"
                />
                <label 
                  htmlFor="coverImageUpload" 
                  className="w-full p-3 rounded-lg bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition"
                >
                  <Upload className="mr-2" /> Upload Cover Image
                </label>
              </div>
              {storyData.coverImagePreview && (
                <div className="w-32 h-32 relative">
                  <img
                    src={storyData.coverImagePreview}
                    alt="Cover Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setStoryData(prev => ({ 
                      ...prev, 
                      coverImage: null, 
                      coverImagePreview: null 
                    }))}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold text-lg transition"
          >
            Create Story
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateStoryBasics;