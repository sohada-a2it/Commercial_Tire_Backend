// components/admin/BlogFormModal.jsx

'use client';
import RichTextEditor from '@/components/blog/richTextEditor';
import { useState, useEffect } from 'react';

export default function BlogFormModal({ blog, onClose, onSubmit, title }) {
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
    coverImageUrl: '',
    galleryImageUrls: []
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (blog) {
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
        coverImageUrl: '',
        galleryImageUrls: []
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
    }
  }, [blog]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (formData.excerpt && formData.excerpt.length > 500) {
      newErrors.excerpt = 'Excerpt must be less than 500 characters';
    }
    
    if (formData.isScheduled && !formData.scheduledDate) {
      newErrors.scheduledDate = 'Scheduled date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
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
    setFormData({
      ...formData,
      faqs: formData.faqs.filter((_, i) => i !== index)
    });
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
      const newFiles = [...galleryImageFiles, ...validFiles];
      setGalleryImageFiles(newFiles);
      
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => setGalleryPreviews(prev => [...prev, reader.result]);
        reader.readAsDataURL(file);
      });
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

  const removeAttachment = (index, isExisting = false, publicId = null) => {
    if (isExisting) {
      setExistingAttachments(prev => prev.filter((_, i) => i !== index));
      if (publicId) {
        setRemovedAttachments(prev => [...prev, publicId]);
      }
    } else {
      setAttachments(prev => prev.filter((_, i) => i !== index));
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
    } else {
      submitData.append('isScheduled', false);
    }
    
    // Video
    if (formData.videoUrl) submitData.append('videoUrl', formData.videoUrl);
    if (formData.videoEmbedCode) submitData.append('videoEmbedCode', formData.videoEmbedCode);
    
    // Audio
    if (formData.audioUrl) submitData.append('audioUrl', formData.audioUrl);
    if (formData.audioTitle) submitData.append('audioTitle', formData.audioTitle);
    
    // FAQs
    if (formData.faqs.length > 0) {
      submitData.append('faqs', JSON.stringify(formData.faqs));
    }
    
    // Tags
    if (formData.tags.length > 0) {
      submitData.append('tags', JSON.stringify(formData.tags));
    }
    
    // Cover image
    if (coverImageFile) {
      submitData.append('coverImage', coverImageFile);
    } else if (formData.coverImageUrl) {
      submitData.append('coverImageUrl', formData.coverImageUrl);
    }
    
    // Gallery images
    if (galleryImageFiles.length > 0) {
      galleryImageFiles.forEach(file => {
        submitData.append('galleryImages', file);
      });
    }
    
    // Attachments
    if (attachments.length > 0) {
      attachments.forEach(file => {
        submitData.append('attachments', file);
      });
    }
    
    // Video file
    if (videoFile) {
      submitData.append('videoFile', videoFile);
    }
    
    // Audio file
    if (audioFile) {
      submitData.append('audioFile', audioFile);
    }
    
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
    setLoading(true);
    try {
      const formDataToSend = prepareFormData();
      await onSubmit(formDataToSend);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save blog: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter blog title"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <RichTextEditor
                    value={formData.content}
                    onChange={(html) => setFormData({ ...formData, content: html })}
                    placeholder="Write your amazing blog content here..."
                  />
                </div>
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description (max 500 characters)"
                  maxLength={500}
                />
                <p className="text-right text-xs text-gray-500 mt-1">{formData.excerpt.length}/500</p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Media Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Media</h3>
                
                {/* Cover Image */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
                  {coverImagePreview && (
                    <div className="mb-2 relative inline-block">
                      <img src={coverImagePreview} alt="Cover preview" className="h-24 w-auto rounded-lg object-cover border" />
                      <button
                        type="button"
                        onClick={() => { setCoverImageFile(null); setCoverImagePreview(blog?.coverImage?.url || ''); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleCoverImageChange} className="w-full text-sm" />
                </div>

                {/* Gallery Images */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Images (Max 6)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {galleryPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img src={preview} alt="" className="h-16 w-16 object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  {(existingGalleryImages.length + galleryImageFiles.length) < 6 && (
                    <input type="file" accept="image/*" multiple onChange={handleGalleryImagesChange} className="w-full text-sm" />
                  )}
                  <p className="text-xs text-gray-500 mt-1">{existingGalleryImages.length + galleryImageFiles.length}/6 images</p>
                </div>

                {/* Video */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
                    placeholder="YouTube/Vimeo URL"
                  />
                  <textarea
                    rows={2}
                    value={formData.videoEmbedCode}
                    onChange={(e) => setFormData({ ...formData, videoEmbedCode: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
                    placeholder="Embed code"
                  />
                  <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="w-full text-sm" />
                </div>

                {/* Audio */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audio</label>
                  <input
                    type="text"
                    value={formData.audioUrl}
                    onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
                    placeholder="Audio URL"
                  />
                  <input
                    type="text"
                    value={formData.audioTitle}
                    onChange={(e) => setFormData({ ...formData, audioTitle: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
                    placeholder="Audio title"
                  />
                  <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} className="w-full text-sm" />
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                  {existingAttachments.map((att, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded mb-1">
                      <span className="truncate flex-1">{att.fileName}</span>
                      <button type="button" onClick={() => removeAttachment(index, true, att.publicId)} className="text-red-500 text-xs">Remove</button>
                    </div>
                  ))}
                  {attachments.map((file, index) => (
                    <div key={`new-${index}`} className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded mb-1">
                      <span className="truncate flex-1">{file.name}</span>
                      <button type="button" onClick={() => removeAttachment(index, false)} className="text-red-500 text-xs">Remove</button>
                    </div>
                  ))}
                  <input type="file" multiple onChange={handleAttachmentsChange} className="w-full text-sm mt-1" />
                  <p className="text-xs text-gray-500 mt-1">Max 50MB per file</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Publish Settings</h3>
                
                <div className="space-y-3">
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
                      className="rounded"
                    />
                    <span className="text-sm">Publish immediately</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">⭐ Featured blog</span>
                  </label>

                  {formData.isFeatured && (
                    <input
                      type="number"
                      value={formData.featuredPriority}
                      onChange={(e) => setFormData({ ...formData, featuredPriority: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                      placeholder="Priority (0-10)"
                      min={0}
                      max={10}
                    />
                  )}
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Schedule</h3>
                
                <label className="flex items-center gap-2 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={formData.isScheduled}
                    onChange={(e) => setFormData({ ...formData, isScheduled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Schedule for future</span>
                </label>

                {formData.isScheduled && (
                  <input
                    type="datetime-local"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3"
                  />
                )}

                <input
                  type="datetime-local"
                  value={formData.customDate}
                  onChange={(e) => setFormData({ ...formData, customDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Custom date"
                />
                <p className="text-xs text-gray-500 mt-1">Override published date</p>
              </div>

              {/* Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Info</h3>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Category"
                  />
                  
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Author name"
                  />
                  
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 1 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Read time (minutes)"
                  />
                </div>
              </div>

              {/* SEO */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">SEO</h3>
                
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
                  placeholder="Meta title"
                />
                
                <textarea
                  rows={2}
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Meta description"
                  maxLength={160}
                />
                <p className="text-right text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160</p>
              </div>

              {/* FAQ */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">FAQ Section</h3>
                
                <div className="bg-white rounded-lg p-3 mb-3">
                  <input
                    type="text"
                    value={faqQuestion}
                    onChange={(e) => setFaqQuestion(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm mb-2"
                    placeholder="Question"
                  />
                  <textarea
                    rows={2}
                    value={faqAnswer}
                    onChange={(e) => setFaqAnswer(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm mb-2"
                    placeholder="Answer"
                  />
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="w-full bg-blue-600 text-white text-sm rounded-lg py-1.5 hover:bg-blue-700"
                  >
                    + Add FAQ
                  </button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {formData.faqs.map((faq, idx) => (
                    <div key={idx} className="text-sm border-b pb-2">
                      <div className="flex justify-between">
                        <p className="font-medium">Q: {faq.question}</p>
                        <button type="button" onClick={() => handleRemoveFaq(idx)} className="text-red-500 text-xs">Remove</button>
                      </div>
                      <p className="text-gray-600 text-xs mt-1">A: {faq.answer}</p>
                    </div>
                  ))}
                  {formData.faqs.length === 0 && (
                    <p className="text-gray-500 text-sm text-center">No FAQs added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 mt-6 pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                blog ? 'Update Blog' : 'Create Blog'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}