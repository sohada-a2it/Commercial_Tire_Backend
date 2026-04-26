// app/dashboard/blogs/edit/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import RichTextEditor from '@/components/blog/richTextEditor';
import { fetchBlogById, updateBlog } from '@/services/blogService';
import { 
  FaTimes, FaPlus, FaImage, FaFileAlt, FaVideo, FaHeadphones,
  FaCalendarAlt, FaClock, FaTag, FaFolder, FaUpload, 
  FaArrowLeft, FaSpinner
} from 'react-icons/fa';

export default function EditBlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeMediaTab, setActiveMediaTab] = useState('image');
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
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
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [removedGalleryImages, setRemovedGalleryImages] = useState([]);
  const [removedAttachments, setRemovedAttachments] = useState([]);
  
  // UI states
  const [tagInput, setTagInput] = useState('');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  // Load blog data
  useEffect(() => {
    if (id) {
      loadBlog();
    } else {
      alert('No blog ID provided');
      router.push('/dashboard/blogs');
    }
  }, [id]);

  const loadBlog = async () => {
    try {
      const result = await fetchBlogById(id);
      const blog = result.blog;
      
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        category: blog.category || '',
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
      
      if (blog.coverImage?.url) {
        setCoverImagePreview(blog.coverImage.url);
      }
      
      if (blog.galleryImages?.length) {
        setExistingGalleryImages(blog.galleryImages);
        setGalleryPreviews(blog.galleryImages.map(img => img.url));
      }
      
      if (blog.attachments?.length) {
        setExistingAttachments(blog.attachments);
      }
    } catch (error) {
      console.error('Error loading blog:', error);
      alert('Failed to load blog');
      router.push('/dashboard/blogs');
    } finally {
      setLoading(false);
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
      const reader = new FileReader();
      reader.onloadend = () => setCoverImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingGalleryImages.length + galleryImageFiles.length + files.length;
    
    if (totalImages > 6) {
      alert(`Maximum 6 images allowed. You can only add ${6 - (existingGalleryImages.length + galleryImageFiles.length)} more images.`);
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

  const removeExistingGalleryImage = (imageToRemove) => {
    setExistingGalleryImages(prev => prev.filter(img => img.publicId !== imageToRemove.publicId));
    setRemovedGalleryImages(prev => [...prev, imageToRemove.publicId]);
    setGalleryPreviews(prev => prev.filter((_, idx) => {
      const originalIndex = existingGalleryImages.findIndex(img => img.publicId === imageToRemove.publicId);
      return idx !== originalIndex;
    }));
  };

  const removeNewGalleryImage = (index) => {
    const newFiles = galleryImageFiles.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => {
      return i < existingGalleryImages.length || i !== index + existingGalleryImages.length;
    });
    setGalleryImageFiles(newFiles);
    setGalleryPreviews(newPreviews);
  };

  const removeGalleryImage = (index) => {
    if (index < existingGalleryImages.length) {
      removeExistingGalleryImage(existingGalleryImages[index]);
    } else {
      removeNewGalleryImage(index - existingGalleryImages.length);
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

  const removeExistingAttachment = (index, publicId) => {
    setExistingAttachments(prev => prev.filter((_, i) => i !== index));
    if (publicId) {
      setRemovedAttachments(prev => [...prev, publicId]);
    }
  };

  const removeNewAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const removeAttachment = (index, isExisting = false, publicId = null) => {
    if (isExisting) {
      removeExistingAttachment(index, publicId);
    } else {
      removeNewAttachment(index);
    }
  };

  const prepareFormData = () => {
    const submitData = new FormData();
    
    // Basic fields
    submitData.append('title', formData.title.trim());
    submitData.append('content', formData.content);
    if (formData.excerpt) submitData.append('excerpt', formData.excerpt);
    if (formData.category) submitData.append('category', formData.category);
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
    
    if (galleryImageFiles.length > 0) {
      galleryImageFiles.forEach(file => submitData.append('galleryImages', file));
    }
    
    if (attachments.length > 0) {
      attachments.forEach(file => submitData.append('attachments', file));
    }
    
    if (videoFile) submitData.append('videoFile', videoFile);
    if (audioFile) submitData.append('audioFile', audioFile);
    
    // Removed items
    if (removedGalleryImages.length > 0) {
      submitData.append('removeGalleryImages', JSON.stringify(removedGalleryImages));
    }
    
    if (removedAttachments.length > 0) {
      submitData.append('removeAttachments', JSON.stringify(removedAttachments));
    }
    
    return submitData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      const formDataToSend = prepareFormData();
      const result = await updateBlog(id, formDataToSend);
      if (result.success) {
        alert('Blog updated successfully!');
        router.push('/dashboard/blogs');
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-4xl text-teal-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading blog...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/dashboard/blogs')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back to Blogs
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>
              <p className="text-gray-600 mt-1">Edit your blog content</p>
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
                  <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 transition-all">
                    <RichTextEditor
                      value={formData.content}
                      onChange={(html) => setFormData({ ...formData, content: html })}
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
                      className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                        activeMediaTab === 'image' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-teal-600'
                      }`}
                    >
                      <FaImage /> Images
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMediaTab('video')}
                      className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                        activeMediaTab === 'video' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-teal-600'
                      }`}
                    >
                      <FaVideo /> Video
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMediaTab('audio')}
                      className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                        activeMediaTab === 'audio' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-teal-600'
                      }`}
                    >
                      <FaHeadphones /> Audio
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMediaTab('attachments')}
                      className={`px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 ${
                        activeMediaTab === 'attachments' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-teal-600'
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
                              onClick={() => { setCoverImageFile(null); setCoverImagePreview(''); }}
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
                          {galleryPreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img src={preview} alt="" className="h-16 w-16 object-cover rounded-lg border shadow-sm" />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                              >
                                <FaTimes className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                        {(existingGalleryImages.length + galleryImageFiles.length) < 6 && (
                          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-xl px-4 py-2 text-sm transition-colors w-fit">
                            <FaUpload className="w-3.5 h-3.5 text-gray-500" />
                            Add gallery images
                            <input type="file" accept="image/*" multiple onChange={handleGalleryImagesChange} className="hidden" />
                          </label>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{existingGalleryImages.length + galleryImageFiles.length}/6 images</p>
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
                        Upload video file
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
                        Upload audio file
                        <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} className="hidden" />
                      </label>
                    </div>
                  )}

                  {/* Attachments Tab */}
                  {activeMediaTab === 'attachments' && (
                    <div>
                      {existingAttachments.map((att, index) => (
                        <div key={`existing-${index}`} className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-xl mb-2">
                          <span className="truncate flex-1">{att.fileName}</span>
                          <button type="button" onClick={() => removeAttachment(index, true, att.publicId)} className="text-red-500 text-xs hover:text-red-700">Remove</button>
                        </div>
                      ))}
                      {attachments.map((file, index) => (
                        <div key={`new-${index}`} className="flex items-center justify-between text-sm bg-blue-50 p-3 rounded-xl mb-2">
                          <span className="truncate flex-1">{file.name}</span>
                          <button type="button" onClick={() => removeAttachment(index, false)} className="text-red-500 text-xs hover:text-red-700">Remove</button>
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

                {/* Info */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FaFolder className="w-4 h-4 text-gray-500" />
                    Info
                  </h3>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500"
                      placeholder="Category"
                    />
                    
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
                onClick={() => router.push('/dashboard/blogs')}
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
                  'Update Blog'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}