'app/dashboard/blogs/edit/page.js'
'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import {
  FaTimes,
  FaPlus,
  FaImage,
  FaFileAlt,
  FaVideo,
  FaHeadphones,
  FaCalendarAlt,
  FaClock,
  FaTag,
  FaFolder,
  FaUpload,
  FaArrowLeft,
  FaSave,
  FaTrash,
  FaCheck,
  FaSpinner
} from 'react-icons/fa';
import { 
  fetchBlogById, 
  updateBlog, 
  fetchBlogCategories, 
  createBlogCategory, 
  deleteBlogCategory 
} from '@/services/blogService';

// Dynamically import the rich text editor wrapper
const RichTextEditorWrapper = dynamic(
  () => import('@/components/blog/richTextEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="border border-gray-300 rounded-xl overflow-hidden">
        <div className="h-[450px] bg-gray-50 animate-pulse" />
      </div>
    )
  }
);

export default function EditBlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const blogId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeMediaTab, setActiveMediaTab] = useState('image');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categories: [],
    tags: [],
    metaTitle: '',
    metaDescription: '',
    author: '',
    readTime: 5,
    isPublished: false,
    status: 'draft',
    isFeatured: false,
    featuredPriority: 0,
    customDate: '',
    isScheduled: false,
    scheduledDate: '',
    videoUrl: '',
    videoEmbedCode: '',
    audioUrl: '',
    audioTitle: '',
    faqs: [],
  });

  // File states
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  // Preview states
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [existingCoverImage, setExistingCoverImage] = useState('');
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);

  // UI states
  const [tagInput, setTagInput] = useState('');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  // Category management states
  const [allCategories, setAllCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', displayName: '', description: '' });
  const [categoryCreating, setCategoryCreating] = useState(false);
  const [categoryError, setCategoryError] = useState('');
  const [categoryDeleting, setCategoryDeleting] = useState(null);

  // Load blog data and categories on mount
  useEffect(() => {
    if (!blogId) {
      router.push('/dashboard/blogs');
      return;
    }
    loadBlogData();
    loadCategories();
  }, [blogId]);

  const loadBlogData = async () => {
    try {
      setLoading(true);
      const response = await fetchBlogById(blogId);
      if (response.success && response.blog) {
        const blog = response.blog;
        
        // Handle categories - ensure it's an array
        let categoriesArray = [];
        if (blog.categories && Array.isArray(blog.categories)) {
          categoriesArray = blog.categories;
        } else if (blog.category && blog.category !== 'uncategorized') {
          categoriesArray = [blog.category];
        }
        
        setFormData({
          title: blog.title || '',
          content: blog.content || '',
          excerpt: blog.excerpt || '',
          categories: categoriesArray,
          tags: blog.tags || [],
          metaTitle: blog.metaTitle || '',
          metaDescription: blog.metaDescription || '',
          author: blog.author || '',
          readTime: blog.readTime || 5,
          isPublished: blog.isPublished || false,
          status: blog.status || 'draft',
          isFeatured: blog.isFeatured || false,
          featuredPriority: blog.featuredPriority || 0,
          customDate: blog.customDate ? new Date(blog.customDate).toISOString().slice(0, 16) : '',
          isScheduled: blog.isScheduled || false,
          scheduledDate: blog.scheduledDate ? new Date(blog.scheduledDate).toISOString().slice(0, 16) : '',
          videoUrl: blog.videoUrl || '',
          videoEmbedCode: blog.videoEmbedCode || '',
          audioUrl: blog.audioUrl || '',
          audioTitle: blog.audioTitle || '',
          faqs: blog.faqs || [],
        });
        
        // Set existing images
        if (blog.coverImage?.url) {
          setExistingCoverImage(blog.coverImage.url);
          setCoverImagePreview(blog.coverImage.url);
        }
        
        if (blog.galleryImages && blog.galleryImages.length > 0) {
          setExistingGalleryImages(blog.galleryImages.map(img => img.url));
          setGalleryPreviews(blog.galleryImages.map(img => img.url));
        }
      } else {
        alert('Blog not found');
        router.push('/dashboard/blogs');
      }
    } catch (error) {
      console.error('Error loading blog:', error);
      alert('Failed to load blog data');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetchBlogCategories();
      if (response.success) {
        setAllCategories(response.categories || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Handle category selection/deselection
  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const currentCategories = prev.categories;
      if (currentCategories.includes(category.name)) {
        return {
          ...prev,
          categories: currentCategories.filter(c => c !== category.name)
        };
      } else {
        return {
          ...prev,
          categories: [...currentCategories, category.name]
        };
      }
    });
  };

  // Remove category from selected list
  const handleRemoveCategory = (categoryName) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== categoryName)
    }));
  };

  const handleCreateCategory = async () => {
    try {
      setCategoryError('');

      if (!newCategory.name.trim() || !newCategory.displayName.trim()) {
        setCategoryError('Category name and display name are required');
        return;
      }

      setCategoryCreating(true);
      const response = await createBlogCategory({
        name: newCategory.name.toLowerCase().trim(),
        displayName: newCategory.displayName.trim(),
        description: newCategory.description.trim()
      });

      if (response.success) {
        await loadCategories();
        // Auto-select the new category
        setFormData(prev => ({
          ...prev,
          categories: [...prev.categories, response.category.name]
        }));
        setNewCategory({ name: '', displayName: '', description: '' });
        setShowCategoryForm(false);
        alert('Blog category created successfully!');
      }
    } catch (error) {
      console.error('Error details:', error);
      setCategoryError(error.message || 'Failed to create category');
    } finally {
      setCategoryCreating(false);
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
      return;
    }

    try {
      setCategoryDeleting(categoryId);
      const response = await deleteBlogCategory(categoryId);

      if (response.success) {
        await loadCategories();
        // Remove category from selected categories if it was selected
        setFormData(prev => ({
          ...prev,
          categories: prev.categories.filter(c => c !== categoryName)
        }));
        alert('Blog category deleted successfully!');
      }
    } catch (error) {
      alert(`Error deleting category: ${error.message}`);
      console.error('Error deleting category:', error);
    } finally {
      setCategoryDeleting(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (formData.isScheduled && !formData.scheduledDate) newErrors.scheduledDate = 'Scheduled date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleAddFaq = () => {
    if (faqQuestion.trim() && faqAnswer.trim()) {
      setFormData({
        ...formData,
        faqs: [...formData.faqs, { question: faqQuestion.trim(), answer: faqAnswer.trim(), order: formData.faqs.length }]
      });
      setFaqQuestion('');
      setFaqAnswer('');
    }
  };

  const handleRemoveFaq = (index) => {
    setFormData({ ...formData, faqs: formData.faqs.filter((_, i) => i !== index) });
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Cover image must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      setCoverImageFile(file);
      setExistingCoverImage(''); // Clear existing when new file selected
      const reader = new FileReader();
      reader.onloadend = () => setCoverImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImageFile(null);
    setExistingCoverImage('');
    setCoverImagePreview('');
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = galleryImageFiles.length + existingGalleryImages.length + files.length;

    if (totalImages > 6) {
      alert(`Maximum 6 images allowed. You can only add ${6 - (galleryImageFiles.length + existingGalleryImages.length)} more images.`);
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is larger than 5MB and will be skipped`);
        continue;
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file and will be skipped`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length) {
      setGalleryImageFiles([...galleryImageFiles, ...validFiles]);
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setGalleryPreviews(prev => [...prev, reader.result]);
        reader.readAsDataURL(file);
      });
    }
  };

  const removeGalleryImage = (index, isExisting = false, existingIndex = null) => {
    if (isExisting) {
      setExistingGalleryImages(existingGalleryImages.filter((_, i) => i !== existingIndex));
      setGalleryPreviews(galleryPreviews.filter((_, i) => i !== existingIndex));
    } else {
      setGalleryImageFiles(galleryImageFiles.filter((_, i) => i !== index));
      setGalleryPreviews(galleryPreviews.filter((_, i) => i !== (existingGalleryImages.length + index)));
    }
  };

  const handleAttachmentsChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 50 * 1024 * 1024;

    const validFiles = [];
    for (const file of files) {
      if (file.size > maxSize) {
        alert(`${file.name} is larger than 50MB and will be skipped`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length) {
      setAttachments(prev => [...prev, ...validFiles]);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const prepareFormData = () => {
    const submitData = new FormData();

    // Basic fields
    submitData.append('title', formData.title.trim());
    submitData.append('content', formData.content);
    if (formData.excerpt) submitData.append('excerpt', formData.excerpt);
    if (formData.categories.length > 0) {
      submitData.append('categories', JSON.stringify(formData.categories));
    }
    if (formData.metaTitle) submitData.append('metaTitle', formData.metaTitle);
    if (formData.metaDescription) submitData.append('metaDescription', formData.metaDescription);
    if (formData.author) submitData.append('author', formData.author);
    submitData.append('readTime', formData.readTime);
    submitData.append('isPublished', formData.isPublished);
    submitData.append('status', formData.status);
    submitData.append('isFeatured', formData.isFeatured);
    submitData.append('featuredPriority', formData.featuredPriority);

    // Dates
    if (formData.customDate) submitData.append('customDate', formData.customDate);
    if (formData.isScheduled && formData.scheduledDate) {
      submitData.append('isScheduled', true);
      submitData.append('scheduledDate', formData.scheduledDate);
    }

    // Video & Audio
    if (formData.videoUrl) submitData.append('videoUrl', formData.videoUrl);
    if (formData.videoEmbedCode) submitData.append('videoEmbedCode', formData.videoEmbedCode);
    if (formData.audioUrl) submitData.append('audioUrl', formData.audioUrl);
    if (formData.audioTitle) submitData.append('audioTitle', formData.audioTitle);

    // FAQs
    if (formData.faqs.length > 0) submitData.append('faqs', JSON.stringify(formData.faqs));

    // Tags
    if (formData.tags.length > 0) submitData.append('tags', JSON.stringify(formData.tags));

    // Files
    if (coverImageFile) submitData.append('coverImage', coverImageFile);
    if (existingCoverImage && !coverImageFile) {
      submitData.append('keepExistingCoverImage', 'true');
    }
    
    if (galleryImageFiles.length > 0) {
      galleryImageFiles.forEach(file => submitData.append('galleryImages', file));
    }
    if (existingGalleryImages.length > 0) {
      submitData.append('keepExistingGalleryImages', JSON.stringify(existingGalleryImages));
    }
    
    if (attachments.length > 0) {
      attachments.forEach(file => submitData.append('attachments', file));
    }
    if (videoFile) submitData.append('videoFile', videoFile);
    if (audioFile) submitData.append('audioFile', audioFile);

    return submitData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstError = document.querySelector('.border-red-500');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSaving(true);
    try {
      if (typeof window !== 'undefined' && window.__richTextEditorSave) {
        const savedContent = window.__richTextEditorSave();
        if (savedContent) {
          setFormData(prev => ({ ...prev, content: savedContent }));
        }
      }

      const formDataToSend = prepareFormData();
      const result = await updateBlog(blogId, formDataToSend);
      if (result.success) {
        alert('Blog updated successfully!');
        router.push('/dashboard/blogs');
      } else {
        alert('Failed to update blog: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      alert('Failed to update blog: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FaSpinner className="animate-spin h-12 w-12 text-teal-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading blog data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back to Blogs
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
              <p className="text-gray-600 mt-1">Update your blog content with rich formatting, images, tables, and more!</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Main Content */}
              <div className="space-y-6">
                {/* Title */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all`}
                    placeholder="Enter blog title"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700 flex items-center gap-2">
                      <span className="font-semibold">💡 Tip:</span>
                      Use the rich editor below to format your content with colors, images, links, tables, and more! Content auto-saves every 2 seconds.
                    </p>
                  </div>
                  <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 transition-all">
                    <RichTextEditorWrapper
                      value={formData.content}
                      onChange={(html) => {
                        setFormData({ ...formData, content: html });
                      }}
                      placeholder="Write your amazing blog content here..."
                    />
                  </div>
                  {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
                </div>

                {/* Excerpt */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                  <textarea
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Brief description (max 500 characters)"
                    maxLength={500}
                  />
                  <p className="text-right text-xs text-gray-500 mt-1">{formData.excerpt.length}/500</p>
                </div>

                {/* Tags */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FaTag className="w-3.5 h-3.5 text-gray-400" />
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                      placeholder="Add a tag"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm hover:bg-teal-700 transition-colors flex items-center gap-1"
                    >
                      <FaPlus className="w-3 h-3" /> Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded-md text-xs border border-teal-200">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Media Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex gap-2 border-b border-gray-200 mb-4">
                    <button
                      type="button"
                      onClick={() => setActiveMediaTab('image')}
                      className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${activeMediaTab === 'image' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-teal-600'
                        }`}
                    >
                      <FaImage /> Images
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMediaTab('video')}
                      className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${activeMediaTab === 'video' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-teal-600'
                        }`}
                    >
                      <FaVideo /> Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMediaTab('audio')}
                      className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${activeMediaTab === 'audio' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-teal-600'
                        }`}
                    >
                      <FaHeadphones /> Audio
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMediaTab('attachments')}
                      className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${activeMediaTab === 'attachments' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-teal-600'
                        }`}
                    >
                      <FaFileAlt /> Files
                    </button>
                  </div>

                  {/* Images Tab */}
                  {activeMediaTab === 'image' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                        {coverImagePreview && (
                          <div className="mb-2 relative inline-block">
                            <img src={coverImagePreview} alt="Cover preview" className="h-28 w-auto rounded-xl object-cover border shadow-sm" />
                            <button
                              type="button"
                              onClick={removeCoverImage}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <FaTimes className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl px-4 py-2 text-sm transition-colors w-fit">
                          <FaUpload className="w-3.5 h-3.5 text-gray-500" />
                          {coverImagePreview ? 'Change cover image' : 'Choose cover image'}
                          <input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG/WebP</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Images (Max 6)</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {/* Existing gallery images */}
                          {existingGalleryImages.map((preview, index) => (
                            <div key={`existing-${index}`} className="relative">
                              <img src={preview} alt="" className="h-16 w-16 object-cover rounded-lg border shadow-sm" />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index, true, index)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                              >
                                <FaTimes className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                          {/* New gallery images */}
                          {galleryPreviews.slice(existingGalleryImages.length).map((preview, index) => (
                            <div key={`new-${index}`} className="relative">
                              <img src={preview} alt="" className="h-16 w-16 object-cover rounded-lg border shadow-sm" />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index, false)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                              >
                                <FaTimes className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        {(galleryImageFiles.length + existingGalleryImages.length) < 6 && (
                          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl px-4 py-2 text-sm transition-colors w-fit">
                            <FaUpload className="w-3.5 h-3.5 text-gray-500" />
                            Add gallery images
                            <input type="file" accept="image/*" multiple onChange={handleGalleryImagesChange} className="hidden" />
                          </label>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{galleryImageFiles.length + existingGalleryImages.length}/6 images</p>
                      </div>
                    </div>
                  )}

                  {/* Video Tab */}
                  {activeMediaTab === 'video' && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500"
                        placeholder="YouTube/Vimeo URL"
                      />
                      <textarea
                        rows={2}
                        value={formData.videoEmbedCode}
                        onChange={(e) => setFormData({ ...formData, videoEmbedCode: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500"
                        placeholder="Embed code (optional)"
                      />
                      <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl px-4 py-2 text-sm transition-colors w-fit">
                        <FaUpload className="w-3.5 h-3.5 text-gray-500" />
                        Upload new video file
                        <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="hidden" />
                      </label>
                    </div>
                  )}

                  {/* Audio Tab */}
                  {activeMediaTab === 'audio' && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={formData.audioUrl}
                        onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500"
                        placeholder="Audio URL"
                      />
                      <input
                        type="text"
                        value={formData.audioTitle}
                        onChange={(e) => setFormData({ ...formData, audioTitle: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500"
                        placeholder="Audio title"
                      />
                      <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl px-4 py-2 text-sm transition-colors w-fit">
                        <FaUpload className="w-3.5 h-3.5 text-gray-500" />
                        Upload new audio file
                        <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} className="hidden" />
                      </label>
                    </div>
                  )}

                  {/* Attachments Tab */}
                  {activeMediaTab === 'attachments' && (
                    <div>
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between text-sm bg-blue-50 p-3 rounded-xl mb-2">
                          <span className="truncate flex-1">{file.name}</span>
                          <button type="button" onClick={() => removeAttachment(index)} className="text-red-500 text-xs hover:text-red-700">Remove</button>
                        </div>
                      ))}
                      <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl px-4 py-2 text-sm transition-colors w-fit">
                        <FaUpload className="w-3.5 h-3.5 text-gray-500" />
                        Add attachments
                        <input type="file" multiple onChange={handleAttachmentsChange} className="hidden" />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Max 50MB per file (PDF, DOC, etc.)</p>
                    </div>
                  )}
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-2">FAQ Section</label>
                  <div className="bg-gray-50 rounded-xl p-4 mb-3">
                    <input
                      type="text"
                      value={faqQuestion}
                      onChange={(e) => setFaqQuestion(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:ring-2 focus:ring-teal-500"
                      placeholder="Question"
                    />
                    <textarea
                      rows={2}
                      value={faqAnswer}
                      onChange={(e) => setFaqAnswer(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2 focus:ring-2 focus:ring-teal-500"
                      placeholder="Answer"
                    />
                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="w-full bg-teal-600 text-white text-sm rounded-lg py-2 hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaPlus className="w-3 h-3" /> Add FAQ
                    </button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {formData.faqs.map((faq, idx) => (
                      <div key={idx} className="text-sm border-b pb-2">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-gray-800 flex-1">Q: {faq.question}</p>
                          <button type="button" onClick={() => handleRemoveFaq(idx)} className="text-red-500 text-xs hover:text-red-700 ml-2">Remove</button>
                        </div>
                        <p className="text-gray-600 text-xs mt-1">A: {faq.answer}</p>
                      </div>
                    ))}
                    {formData.faqs.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-2">No FAQs added yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Settings */}
              <div className="space-y-6">
                {/* Publish Settings */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
                    Publish Settings
                  </h3>

                  <div className="space-y-3">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="draft">📝 Draft</option>
                      <option value="published">🚀 Published</option>
                      <option value="archived">📦 Archived</option>
                    </select>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-sm">Publish immediately</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-sm flex items-center gap-1">⭐ Featured blog</span>
                    </label>

                    {formData.isFeatured && (
                      <input
                        type="number"
                        value={formData.featuredPriority}
                        onChange={(e) => setFormData({ ...formData, featuredPriority: parseInt(e.target.value) || 0 })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                        placeholder="Priority (0-10)"
                        min={0}
                        max={10}
                      />
                    )}
                  </div>
                </div>

                {/* Schedule */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                    Schedule
                  </h3>

                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={formData.isScheduled}
                      onChange={(e) => setFormData({ ...formData, isScheduled: e.target.checked })}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm">Schedule for future</span>
                  </label>

                  {formData.isScheduled && (
                    <input
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm mb-3 focus:ring-2 focus:ring-teal-500"
                    />
                  )}

                  <input
                    type="datetime-local"
                    value={formData.customDate}
                    onChange={(e) => setFormData({ ...formData, customDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Override published date</p>
                </div>

                {/* Categories Section */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FaFolder className="w-4 h-4 text-gray-500" />
                    Categories
                  </h3>

                  <div className="space-y-3">
                    {/* Category Selection - Multiple */}
                    <div>
                      <label className="block text-xs text-gray-600 font-medium mb-2">
                        Select Categories (Multiple)
                      </label>

                      {/* Selected Categories Display */}
                      {formData.categories.length > 0 && (
                        <div className="mb-3 p-3 bg-teal-50 rounded-xl border border-teal-200">
                          <div className="text-xs text-teal-700 mb-2 font-medium">Selected Categories:</div>
                          <div className="flex flex-wrap gap-2">
                            {formData.categories.map((catName) => {
                              const cat = allCategories.find(c => c.name === catName);
                              return (
                                <span
                                  key={catName}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-sm font-medium border border-teal-300"
                                >
                                  {cat?.displayName || catName}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCategory(catName)}
                                    className="hover:text-red-600 ml-1"
                                  >
                                    <FaTimes className="w-2.5 h-2.5" />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Category Checkboxes */}
                      <div className="border border-gray-300 rounded-xl p-3 max-h-48 overflow-y-auto">
                        <div className="text-xs text-gray-500 mb-2 flex justify-between items-center">
                          <span>Click to select multiple categories:</span>
                          {allCategories.length > 0 && (
                            <span className="text-red-500 text-xs">⚠️ Delete will remove category permanently</span>
                          )}
                        </div>
                        {loadingCategories ? (
                          <div className="text-center py-4">
                            <FaSpinner className="animate-spin h-5 w-5 text-teal-600 mx-auto" />
                          </div>
                        ) : (
                          allCategories.map((cat) => (
                            <div
                              key={cat._id}
                              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-colors ${formData.categories.includes(cat.name) ? 'bg-teal-50' : 'hover:bg-gray-50'
                                }`}
                            >
                              <label className="flex items-center gap-2 flex-1 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.categories.includes(cat.name)}
                                  onChange={() => handleCategoryToggle(cat)}
                                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm">
                                  {cat.displayName}
                                  {cat.description && (
                                    <span className="text-xs text-gray-400 ml-1">({cat.description})</span>
                                  )}
                                </span>
                              </label>
                              <button
                                type="button"
                                onClick={() => handleDeleteCategory(cat._id, cat.displayName)}
                                disabled={categoryDeleting === cat._id}
                                className="text-red-400 hover:text-red-600 transition-colors p-1 disabled:opacity-50"
                                title="Delete category"
                              >
                                {categoryDeleting === cat._id ? (
                                  <FaSpinner className="animate-spin h-3.5 w-3.5" />
                                ) : (
                                  <FaTrash className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          ))
                        )}
                        {!loadingCategories && allCategories.length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No categories available. Create one first.
                          </div>
                        )}
                      </div>

                      {/* Create New Category Button */}
                      <button
                        type="button"
                        onClick={() => setShowCategoryForm(!showCategoryForm)}
                        className="mt-2 w-full px-3 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded-xl text-teal-600 font-medium transition-colors flex items-center justify-center gap-1 text-sm"
                      >
                        <FaPlus className="w-3.5 h-3.5" /> Create New Category
                      </button>

                      {/* Create Category Form */}
                      {showCategoryForm && (
                        <div className="mt-3 p-4 bg-teal-50 border border-teal-200 rounded-xl">
                          <h4 className="font-medium text-gray-900 mb-3">Create New Category</h4>
                          {categoryError && (
                            <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded-lg text-red-700 text-xs">
                              {categoryError}
                            </div>
                          )}
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Category name (e.g., tire-maintenance)"
                              value={newCategory.name}
                              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                            />
                            <input
                              type="text"
                              placeholder="Display name (e.g., Tire Maintenance)"
                              value={newCategory.displayName}
                              onChange={(e) => setNewCategory({ ...newCategory, displayName: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                            />
                            <textarea
                              placeholder="Description (optional)"
                              value={newCategory.description}
                              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 resize-none"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleCreateCategory}
                                disabled={categoryCreating}
                                className="flex-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1"
                              >
                                <FaCheck className="w-3 h-3" /> {categoryCreating ? 'Creating...' : 'Create'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCategoryForm(false);
                                  setCategoryError('');
                                  setNewCategory({ name: '', displayName: '', description: '' });
                                }}
                                className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium text-sm transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500"
                      placeholder="Author name"
                    />

                    <div>
                      <label className="block text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <FaClock className="w-3 h-3" /> Read time (minutes)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={formData.readTime}
                        onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 1 })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-3">SEO</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Meta Title</label>
                      <input
                        type="text"
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500"
                        placeholder="Meta title"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Meta Description</label>
                      <textarea
                        rows={2}
                        value={formData.metaDescription}
                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500"
                        placeholder="Meta description"
                        maxLength={160}
                      />
                      <p className="text-right text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 mt-8 pt-4 pb-4 flex justify-end gap-3 rounded-lg shadow-lg">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2 font-medium shadow-sm"
              >
                {saving ? (
                  <>
                    <FaSpinner className="animate-spin h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    Update Blog
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}