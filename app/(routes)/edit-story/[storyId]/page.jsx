"use client"
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Upload, X, Move } from "lucide-react";
import ReactCrop from 'react-image-crop';
import { Alert, AlertDescription } from "@/components/ui/alert";
import 'react-image-crop/dist/ReactCrop.css';

const EditStoryBasics = () => {
  const router = useRouter();
  const params = useParams();
//   const storyId = params.storyId;
  const { storyId } = useParams();
  const BASE_IMAGE_URL = 'https://wowfy.in/testusr/images/';

  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({
    name: "",
    synopsis: "",
    category: "",
    coverImage: "",
    general: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [originalStoryData, setOriginalStoryData] = useState(null);
  const [changedFields, setChangedFields] = useState({});
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);

  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    aspect: 16 / 9
  });

  const [storyData, setStoryData] = useState({
    name: "",
    synopsis: "",
    category: "",
    coverImage: null,
    coverImagePreview: null,
    coverImagePath: null,
    storyType: "chat"
  });
  
  useEffect(() => {
    fetchCategories();
    fetchStoryDetails();
  }, [storyId]);

  const resetError = (field) => {
    setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      setErrors(prev => ({ ...prev, general: "Failed to load categories" }));
      console.error(error);
    }
  };

  const fetchStoryDetails = async () => {
    try {
      const response = await fetch(`/api/stories/${storyId}/get-edit-storyData`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch story details');
      
      const data = await response.json();
      
      // Construct full image URL from path
      const coverImageUrl = data.coverImagePath ? 
        `${BASE_IMAGE_URL}${data.coverImagePath}` : null;
      
      setStoryData({
        name: data.name,
        synopsis: data.synopsis,
        category: data.category_id,
        coverImage: null,
        coverImagePreview: coverImageUrl, // Use constructed URL
        coverImagePath: data.coverImagePath,
        storyType: data.storyType || "chat"
      });

      setOriginalStoryData({
        name: data.name,
        synopsis: data.synopsis,
        category: data.category_id,
        coverImagePath: data.coverImagePath,
        coverImageUrl: coverImageUrl, // Store the URL in original data too
        storyType: data.storyType || "chat"
      });
      
    } catch (error) {
      setErrors(prev => ({ ...prev, general: "Failed to load story details" }));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackChanges = (field, value) => {
    if (originalStoryData && value !== originalStoryData[field]) {
      setChangedFields(prev => ({ ...prev, [field]: true }));
    } else {
      // Remove field from changedFields if it matches original value
      const updatedChangedFields = { ...changedFields };
      delete updatedChangedFields[field];
      setChangedFields(updatedChangedFields);
    }
  };

  const onImageLoad = (image) => {
    imgRef.current = image.target;
    const { width, height } = image.target;
    const crop = {
      unit: '%',
      width: 90,
      x: 5,
      y: 5,
      aspect: 16 / 9
    };
    setCrop(crop);
  };
  
  const getCroppedImg = async () => {
    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;
      const ctx = canvas.getContext('2d');
  
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );
  
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error('Canvas is empty');
              return;
            }
            blob.name = 'cropped.jpeg';
            resolve(blob);
          },
          'image/jpeg',
          0.95
        );
      });
    } catch (e) {
      console.error('Error creating cropped image:', e);
      return null;
    }
  };

  const handleImageUpload = (e) => {
    resetError('coverImage');
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoryData(prev => ({
          ...prev,
          coverImage: file,
          coverImagePreview: reader.result
        }));

        // Mark image as changed
        setChangedFields(prev => ({ ...prev, coverImage: true }));
        
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset the file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async () => {
    try {
      if (completedCrop?.width && completedCrop?.height) {
        const croppedBlob = await getCroppedImg();
        if (croppedBlob) {
          const croppedFile = new File([croppedBlob], 'cropped-image.jpg', { 
            type: 'image/jpeg' 
          });
          const previewUrl = URL.createObjectURL(croppedBlob);
          setStoryData(prev => ({
            ...prev,
            coverImage: croppedFile,
            coverImagePreview: previewUrl
          }));
        }
      }
    } catch (e) {
      console.error('Error completing crop:', e);
      setErrors(prev => ({ 
        ...prev, 
        coverImage: "Failed to crop image. Please try again." 
      }));
    }
    setShowCropModal(false);
  };

  // const handleModalClose = () => {
  //   setShowCropModal(false);
    
  //   // If we're editing and had a previous image, restore it
  //   if (originalStoryData?.coverImagePath) {
  //     setStoryData(prev => ({
  //       ...prev,
  //       coverImage: null,
  //       coverImagePreview: originalStoryData.coverImageUrl || null,
  //       coverImagePath: originalStoryData.coverImagePath
  //     }));
      
  //     // Remove from changed fields
  //     const updatedChangedFields = { ...changedFields };
  //     delete updatedChangedFields.coverImage;
  //     setChangedFields(updatedChangedFields);
  //   } else {
  //     // Otherwise clear the image
  //     setStoryData(prev => ({
  //       ...prev,
  //       coverImage: null,
  //       coverImagePreview: null
  //     }));
  //   }
    
  //   // Reset the file input
  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = '';
  //   }
  // };


  const handleModalClose = () => {
    setShowCropModal(false);
    
    // If we're editing and had a previous image, restore it
    if (originalStoryData?.coverImagePath) {
      setStoryData(prev => ({
        ...prev,
        coverImage: null,
        coverImagePreview: originalStoryData.coverImageUrl, // Use the stored URL
        coverImagePath: originalStoryData.coverImagePath
      }));
      
      // Remove from changed fields
      const updatedChangedFields = { ...changedFields };
      delete updatedChangedFields.coverImage;
      setChangedFields(updatedChangedFields);
    } else {
      // Otherwise clear the image
      setStoryData(prev => ({
        ...prev,
        coverImage: null,
        coverImagePreview: null
      }));
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!storyData.name.trim()) {
      newErrors.name = "Story name is required";
      isValid = false;
    }

    if (!storyData.synopsis.trim()) {
      newErrors.synopsis = "Story synopsis is required";
      isValid = false;
    }

    if (!storyData.category) {
      newErrors.category = "Please select a category";
      isValid = false;
    }

    if (!storyData.coverImage && !storyData.coverImagePath) {
      newErrors.coverImage = "Please upload a cover image";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const uploadImageToCPanel = async (file) => {
    const formData = new FormData();
    formData.append('coverImage', file);
    
    try {
      const response = await fetch('https://wowfy.in/testusr/upload.php', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      return data.filePath; // This should be the filename returned from PHP
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  };

  const prepareUpdateData = () => {
    const updateData = {};

    // Only include fields that have actually changed
    if (changedFields.name) updateData.name = storyData.name;
    if (changedFields.synopsis) updateData.synopsis = storyData.synopsis;
    if (changedFields.category) updateData.category = storyData.category;
    if (changedFields.storyType) updateData.storyType = storyData.storyType;
    if (changedFields.coverImage) updateData.coverImagePath = storyData.coverImagePath;
    
    return updateData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // Check if anything has been changed
    if (Object.keys(changedFields).length === 0) {
      router.push(`/stories/${storyId}`);
      return;
    }
    
    setIsUploading(true);
    try {
      // Only upload the image if it has changed
      let uploadedFileName = storyData.coverImagePath;
      if (changedFields.coverImage && storyData.coverImage) {
        uploadedFileName = await uploadImageToCPanel(storyData.coverImage);
      }
      
      if (uploadedFileName !== storyData.coverImagePath) {
        storyData.coverImagePath = uploadedFileName;
      }
      
      const updateData = prepareUpdateData();
      
      const response = await fetch(`/api/stories/${storyId}/update-story`, {
        method: 'PATCH', // or PUT depending on your API
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) throw new Error('Failed to update story');

      router.push(`/your-stories`);
    } catch (error) {
      setErrors(prev => ({ ...prev, general: error.message }));
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8 md:pt-28">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-gray-700">
          <h1 className="text-3xl font-bold mb-8">Edit Your Story</h1>

          {errors.general && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Story Type</h2>
            <div className="flex gap-4">
              {["chat", "game"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setStoryData(prev => ({ ...prev, storyType: type }));
                    trackChanges('storyType', type);
                  }}
                  className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                    storyData.storyType === type
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {type === "chat" ? "Normal Story" : "Interactive Game Story"}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Story Name</label>
                <input
                  type="text"
                  value={storyData.name}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setStoryData(prev => ({ ...prev, name: newValue }));
                    trackChanges('name', newValue);
                    resetError('name');
                  }}
                  className={`w-full p-3 rounded-lg bg-gray-800 border focus:ring-2 focus:ring-purple-600 transition-colors ${
                    errors.name ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="Enter your story name"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Story Synopsis</label>
                <textarea
                  value={storyData.synopsis}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setStoryData(prev => ({ ...prev, synopsis: newValue }));
                    trackChanges('synopsis', newValue);
                    resetError('synopsis');
                  }}
                  className={`w-full p-3 rounded-lg bg-gray-800 border focus:ring-2 focus:ring-purple-600 transition-colors h-32 ${
                    errors.synopsis ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="Write a brief synopsis of your story"
                />
                {errors.synopsis && (
                  <p className="mt-2 text-sm text-red-500">{errors.synopsis}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Story Category</label>
                <select
                  value={storyData.category}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setStoryData(prev => ({ ...prev, category: newValue }));
                    trackChanges('category', newValue);
                    resetError('category');
                  }}
                  className={`w-full p-3 rounded-lg bg-gray-800 border focus:ring-2 focus:ring-purple-600 transition-colors ${
                    errors.category ? 'border-red-500' : 'border-gray-700'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                  
                </select>
                {errors.category && (
                  <p className="mt-2 text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cover Image</label>
                <p className="text-sm text-gray-400 mb-2">
                  Recommended size: 1920 x 1080px (16:9) for best quality
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="coverImageUpload"
                      disabled={isUploading}
                    />
                    <label 
                      htmlFor="coverImageUpload" 
                      className={`w-full p-3 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition ${
                        isUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload className="mr-2" /> {storyData.coverImagePreview ? 'Change Cover Image' : 'Upload Cover Image'}
                    </label>
                  </div>
                  {storyData.coverImagePreview && (
                    <div className="w-32 h-32 relative">
                      <img
                        src={storyData.coverImagePreview}
                        alt="Cover Preview"
                        className="w-full h-full object-cover rounded-lg border border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setStoryData(prev => ({ 
                            ...prev, 
                            coverImage: null, 
                            coverImagePreview: null,
                            coverImagePath: null
                          }));
                          
                          // Mark as changed only if there was an original image
                          if (originalStoryData?.coverImagePath) {
                            setChangedFields(prev => ({ ...prev, coverImage: true }));
                          }
                          
                          resetError('coverImage');
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                {errors.coverImage && (
                  <p className="mt-2 text-sm text-red-500">{errors.coverImage}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.push(`/stories/${storyId}`)}
                disabled={isUploading}
                className="flex-1 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || Object.keys(changedFields).length === 0}
                className={`flex-1 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  (isUploading || Object.keys(changedFields).length === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-purple-500/20'
                }`}
              >
                {isUploading ? 'Updating Story...' : 'Update Story'}
              </button>
            </div>
          </form>
        </div>
      </div>
      {showCropModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-4xl w-full">
            <h3 className="text-xl font-semibold mb-4">Adjust Image Crop</h3>
            <div className="relative max-h-[60vh] overflow-auto mb-4">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => setCompletedCrop(c)}
                aspect={16/9}
              >
                <img
                  ref={imgRef}
                  src={storyData.coverImagePreview}
                  alt="Crop Preview"
                  onLoad={onImageLoad}
                  className="max-w-full"
                />
              </ReactCrop>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropComplete}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditStoryBasics;