// components/admin/BlogFormModalEnhanced.jsx
'use client';
import RichTextEditor from '@/components/blog/richTextEditor';
import { useState, useEffect, useCallback } from 'react';
import { FileText, Image, Link as LinkIcon, Code, Eye, EyeOff, Save, Zap, Clock, X, Plus, Trash2, Download, AlertCircle } from 'lucide-react';

export default function BlogFormModalEnhanced({ blog, onClose, onSubmit, title }) {
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
    galleryImageUrls: [],
    relatedArticles: [],
    slug: '',
    showInHomepage: false,
    allowComments: true,
    seoKeywords: []
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
  const [keywordInput, setKeywordInput] = useState('');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [contentLength, setContentLength] = useState(0);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title && formData.content) {
        localStorage.setItem(`blog_draft_${blog?.id || 'new'}`, JSON.stringify(formData));
        setAutoSaveStatus('Draft saved');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [formData, blog?.id]);

  // Update content length
  useEffect(() => {
    const textLength = formData.content.replace(/<[^>]*>/g, '').length;
    setContentLength(textLength);
  }, [formData.content]);

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
        galleryImageUrls: [],
        relatedArticles: blog.relatedArticles || [],
        slug: blog.slug || '',
        showInHomepage: blog.showInHomepage || false,
        allowComments: blog.allowComments !== false,
        seoKeywords: blog.seoKeywords || []
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
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (formData.excerpt && formData.excerpt.length > 500) newErrors.excerpt = 'Excerpt must be less than 500 characters';
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

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.seoKeywords.includes(keywordInput.trim())) {
      setFormData({ ...formData, seoKeywords: [...formData.seoKeywords, keywordInput.trim()] });
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setFormData({ ...formData, seoKeywords: formData.seoKeywords.filter(k => k !== keyword) });
  };

  const handleInsertLink = () => {
    if (linkUrl && linkText) {
      const editorElement = document.querySelector('[contenteditable="true"]');
      if (editorElement) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const link = document.createElement('a');
        link.href = linkUrl;
        link.textContent = linkText;
        link.className = 'text-blue-600 underline';
        range.insertNode(link);
        setLinkUrl('');
        setLinkText('');
      }
    }
  };

  const handleInsertCode = () => {
    const language = prompt('Enter language (javascript, python, html, etc.):', 'javascript');
    if (language) {
      setFormData({
        ...formData,
        content: formData.content + `\n\n<pre><code class="language-${language}">// Your code here\n</code></pre>\n\n`
      });
    }
  };

  const handleInsertImage = (imageUrl) => {
    if (imageUrl) {
      setFormData({
        ...formData,
        content: formData.content + `\n\n<img src="${imageUrl}" alt="image" class="max-w-full h-auto rounded-lg" />\n\n`
      });
    }
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
    
    if (totalImages > 12) {
      alert(`Maximum 12 images allowed. You can only add ${12 - (existingGalleryImages.length + galleryImageFiles.length)} more images.`);
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

  const removeGalleryImage = (index) => {
    if (index < existingGalleryImages.length) {
      const imageToRemove = existingGalleryImages[index];
      setExistingGalleryImages(prev => prev.filter(img => img.publicId !== imageToRemove.publicId));
      setRemovedGalleryImages(prev => [...prev, imageToRemove.publicId]);
    } else {
      const newIndex = index - existingGalleryImages.length;
      setGalleryImageFiles(prev => prev.filter((_, i) => i !== newIndex));
    }
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
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

  const prepareFormData = () => {
    const submitData = new FormData();
    
    submitData.append('title', formData.title.trim());
    submitData.append('content', formData.content);
    submitData.append('excerpt', formData.excerpt);
    submitData.append('category', formData.category);
    submitData.append('metaTitle', formData.metaTitle);
    submitData.append('metaDescription', formData.metaDescription);
    submitData.append('author', formData.author);
    submitData.append('readTime', formData.readTime);
    submitData.append('isPublished', formData.isPublished);
    submitData.append('status', formData.status);
    submitData.append('isFeatured', formData.isFeatured);
    submitData.append('featuredPriority', formData.featuredPriority);
    submitData.append('showInHomepage', formData.showInHomepage);
    submitData.append('allowComments', formData.allowComments);
    submitData.append('slug', formData.slug);
    
    if (formData.customDate) submitData.append('customDate', formData.customDate);
    if (formData.isScheduled && formData.scheduledDate) {
      submitData.append('isScheduled', true);
      submitData.append('scheduledDate', formData.scheduledDate);
    }
    
    if (formData.videoUrl) submitData.append('videoUrl', formData.videoUrl);
    if (formData.videoEmbedCode) submitData.append('videoEmbedCode', formData.videoEmbedCode);
    if (formData.audioUrl) submitData.append('audioUrl', formData.audioUrl);
    if (formData.audioTitle) submitData.append('audioTitle', formData.audioTitle);
    
    if (formData.faqs.length > 0) submitData.append('faqs', JSON.stringify(formData.faqs));
    if (formData.tags.length > 0) submitData.append('tags', JSON.stringify(formData.tags));
    if (formData.seoKeywords.length > 0) submitData.append('seoKeywords', JSON.stringify(formData.seoKeywords));
    if (formData.relatedArticles.length > 0) submitData.append('relatedArticles', JSON.stringify(formData.relatedArticles));
    
    if (coverImageFile) submitData.append('coverImage', coverImageFile);
    if (galleryImageFiles.length > 0) {
      galleryImageFiles.forEach(file => submitData.append('galleryImages', file));
    }
    if (attachments.length > 0) {
      attachments.forEach(file => submitData.append('attachments', file));
    }
    if (videoFile) submitData.append('videoFile', videoFile);
    if (audioFile) submitData.append('audioFile', audioFile);
    
    if (removedGalleryImages.length > 0) submitData.append('removeGalleryImages', JSON.stringify(removedGalleryImages));
    if (removedAttachments.length > 0) submitData.append('removeAttachments', JSON.stringify(removedAttachments));
    
    return submitData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const formDataToSend = prepareFormData();
      await onSubmit(formDataToSend);
      localStorage.removeItem(`blog_draft_${blog?.id || 'new'}`);
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full mx-4 my-8 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl z-20">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            {autoSaveStatus && (
              <p className="text-sm text-blue-100 flex items-center gap-1 mt-1">
                <Save className="w-3 h-3" /> {autoSaveStatus}
              </p>
            )}
          </div>
          <button onClick={onClose} className="hover:bg-blue-500 p-2 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50 sticky top-14 z-10">
          <div className="flex gap-0 px-6">
            {[
              { id: 'content', label: '✏️ Content', icon: FileText },
              { id: 'media', label: '🖼️ Media', icon: Image },
              { id: 'seo', label: '🔍 SEO', icon: Zap },
              { id: 'settings', label: '⚙️ Settings', icon: Clock }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className={`w-full border-2 ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter an engaging blog title"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">⚠️ {errors.title}</p>}
                  <p className="text-xs text-gray-500 mt-1">Used as page heading</p>
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="auto-generated-from-title"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used in URL</p>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Excerpt</label>
                  <textarea
                    rows={2}
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief summary displayed in listings..."
                    maxLength={500}
                  />
                  <p className="text-right text-xs text-gray-500 mt-1">{formData.excerpt.length}/500 characters</p>
                </div>

                {/* Rich Text Editor with Toolbar */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Content <span className="text-red-500">*</span>
                  </label>
                  
                  {/* Editor Toolbar */}
                  <div className="bg-gray-100 border-2 border-gray-300 rounded-t-lg p-3 flex flex-wrap gap-2 items-center border-b-0">
                    <button
                      type="button"
                      onClick={handleInsertCode}
                      className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-xs flex items-center gap-1"
                      title="Insert code block"
                    >
                      <Code className="w-4 h-4" /> Code
                    </button>

                    <div className="flex items-center gap-1 px-2 border-r border-gray-300">
                      <input
                        type="text"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="URL"
                        className="px-2 py-1 text-xs border border-gray-300 rounded w-32"
                      />
                      <input
                        type="text"
                        value={linkText}
                        onChange={(e) => setLinkText(e.target.value)}
                        placeholder="Text"
                        className="px-2 py-1 text-xs border border-gray-300 rounded w-24"
                      />
                      <button
                        type="button"
                        onClick={handleInsertLink}
                        className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-xs flex items-center gap-1"
                        title="Insert link"
                      >
                        <LinkIcon className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const imageUrl = prompt('Enter image URL:');
                        if (imageUrl) handleInsertImage(imageUrl);
                      }}
                      className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-xs flex items-center gap-1"
                      title="Insert image URL"
                    >
                      <Image className="w-4 h-4" /> Image
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreview(!preview)}
                      className="ml-auto px-3 py-1 bg-blue-600 text-white border border-blue-600 rounded hover:bg-blue-700 text-xs flex items-center gap-1"
                    >
                      {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {preview ? 'Edit' : 'Preview'}
                    </button>
                  </div>

                  {/* Content Info */}
                  <div className="bg-blue-50 border-2 border-gray-300 border-t-0 px-4 py-2 flex justify-between items-center text-xs">
                    <span className="text-gray-600">
                      📊 {contentLength} characters • ~{Math.ceil(contentLength / 200)} min read
                    </span>
                  </div>

                  {/* Editor or Preview */}
                  {!preview ? (
                    <div className="border-2 border-gray-300 border-t-0 rounded-b-lg overflow-hidden">
                      <RichTextEditor
                        value={formData.content}
                        onChange={(html) => setFormData({ ...formData, content: html })}
                        placeholder="Write your amazing blog content here... Use the toolbar above to insert code, links, and images."
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-gray-300 border-t-0 rounded-b-lg p-6 bg-white prose prose-sm max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: formData.content }} />
                    </div>
                  )}
                  {errors.content && <p className="text-red-500 text-xs mt-1">⚠️ {errors.content}</p>}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a tag and press Enter"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <div key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        #{tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                {/* Cover Image */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-2 border-purple-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Image className="w-5 h-5 text-purple-600" /> Cover Image
                  </h3>
                  {coverImagePreview && (
                    <div className="mb-3 relative inline-block">
                      <img src={coverImagePreview} alt="Cover" className="h-40 w-auto rounded-lg object-cover border-2 border-purple-300" />
                      <button
                        type="button"
                        onClick={() => { setCoverImageFile(null); setCoverImagePreview(''); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleCoverImageChange} className="w-full text-sm" />
                  <p className="text-xs text-gray-600 mt-2">Recommended: 1200x600px, Max 5MB</p>
                </div>

                {/* Gallery Images */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border-2 border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Gallery Images (Max 12)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-3">
                    {galleryPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img src={preview} alt="" className="h-24 w-full object-cover rounded-lg border-2 border-blue-300" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {(existingGalleryImages.length + galleryImageFiles.length) < 12 && (
                    <input type="file" accept="image/*" multiple onChange={handleGalleryImagesChange} className="w-full text-sm" />
                  )}
                  <p className="text-xs text-gray-600 mt-2">{existingGalleryImages.length + galleryImageFiles.length}/12 images</p>
                </div>

                {/* Video */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border-2 border-red-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Video</h3>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full border-2 border-red-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="YouTube/Vimeo URL"
                  />
                  <textarea
                    rows={2}
                    value={formData.videoEmbedCode}
                    onChange={(e) => setFormData({ ...formData, videoEmbedCode: e.target.value })}
                    className="w-full border-2 border-red-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Embed code (optional)"
                  />
                  <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} className="w-full text-sm" />
                  <p className="text-xs text-gray-600 mt-2">MP4, WebM - Max 100MB</p>
                </div>

                {/* Audio */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Audio/Podcast</h3>
                  <input
                    type="text"
                    value={formData.audioUrl}
                    onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                    className="w-full border-2 border-green-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Audio URL"
                  />
                  <input
                    type="text"
                    value={formData.audioTitle}
                    onChange={(e) => setFormData({ ...formData, audioTitle: e.target.value })}
                    className="w-full border-2 border-green-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Audio title"
                  />
                  <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} className="w-full text-sm" />
                  <p className="text-xs text-gray-600 mt-2">MP3, WAV - Max 50MB</p>
                </div>

                {/* Attachments */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border-2 border-yellow-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Attachments (PDFs, Docs, etc.)</h3>
                  <div className="space-y-2 mb-3">
                    {existingAttachments.map((att, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-yellow-300">
                        <span className="text-sm truncate flex items-center gap-2">
                          <Download className="w-4 h-4 text-yellow-600" /> {att.fileName}
                        </span>
                        <button type="button" onClick={() => removeAttachment(index, true, att.publicId)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {attachments.map((file, index) => (
                      <div key={`new-${index}`} className="flex items-center justify-between bg-blue-50 p-2 rounded border border-yellow-300">
                        <span className="text-sm truncate flex items-center gap-2">
                          <Download className="w-4 h-4 text-blue-600" /> {file.name}
                        </span>
                        <button type="button" onClick={() => removeAttachment(index, false)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input type="file" multiple onChange={handleAttachmentsChange} className="w-full text-sm" />
                  <p className="text-xs text-gray-600 mt-2">Max 50MB per file</p>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Title (SEO)</label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optimized title for search engines"
                    maxLength={60}
                  />
                  <p className="text-right text-xs text-gray-500 mt-1">{formData.metaTitle.length}/60 characters</p>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Meta Description</label>
                  <textarea
                    rows={2}
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description shown in search results"
                    maxLength={160}
                  />
                  <p className="text-right text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160 characters</p>
                </div>

                {/* SEO Keywords */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">SEO Keywords</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                      className="flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add SEO keyword"
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.seoKeywords.map((keyword) => (
                      <div key={keyword} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        🔍 {keyword}
                        <button type="button" onClick={() => handleRemoveKeyword(keyword)} className="hover:text-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Publish Settings */}
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" /> Publish Settings
                  </h3>
                  
                  <div className="space-y-3">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">📝 Draft</option>
                      <option value="published">🚀 Published</option>
                      <option value="archived">📦 Archived</option>
                    </select>

                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                        className="rounded w-5 h-5"
                      />
                      <span className="text-sm font-medium">Publish immediately</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="rounded w-5 h-5"
                      />
                      <span className="text-sm font-medium">⭐ Feature this blog</span>
                    </label>

                    {formData.isFeatured && (
                      <input
                        type="number"
                        value={formData.featuredPriority}
                        onChange={(e) => setFormData({ ...formData, featuredPriority: parseInt(e.target.value) || 0 })}
                        className="w-full border-2 border-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Priority (higher number = more prominent)"
                        min={0}
                        max={100}
                      />
                    )}

                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded">
                      <input
                        type="checkbox"
                        checked={formData.showInHomepage}
                        onChange={(e) => setFormData({ ...formData, showInHomepage: e.target.checked })}
                        className="rounded w-5 h-5"
                      />
                      <span className="text-sm font-medium">🏠 Show on homepage</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white rounded">
                      <input
                        type="checkbox"
                        checked={formData.allowComments}
                        onChange={(e) => setFormData({ ...formData, allowComments: e.target.checked })}
                        className="rounded w-5 h-5"
                      />
                      <span className="text-sm font-medium">💬 Allow comments</span>
                    </label>
                  </div>
                </div>

                {/* Schedule */}
                <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                  <h3 className="font-semibold text-gray-900 mb-4">📅 Schedule</h3>
                  
                  <label className="flex items-center gap-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={formData.isScheduled}
                      onChange={(e) => setFormData({ ...formData, isScheduled: e.target.checked })}
                      className="rounded w-5 h-5"
                    />
                    <span className="text-sm font-medium">Schedule for future publishing</span>
                  </label>

                  {formData.isScheduled && (
                    <input
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      className="w-full border-2 border-purple-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Publish Date</label>
                    <input
                      type="datetime-local"
                      value={formData.customDate}
                      onChange={(e) => setFormData({ ...formData, customDate: e.target.value })}
                      className="w-full border-2 border-purple-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <p className="text-xs text-gray-600 mt-1">Overrides the actual published date</p>
                  </div>
                </div>

                {/* Blog Info */}
                <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200">
                  <h3 className="font-semibold text-gray-900 mb-4">📚 Blog Info</h3>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full border-2 border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Category (e.g., Technology, Lifestyle)"
                    />
                    
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full border-2 border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Author name"
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reading Time (minutes)</label>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={formData.readTime}
                        onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 1 })}
                        className="w-full border-2 border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-cyan-50 rounded-lg p-4 border-2 border-cyan-200">
                  <h3 className="font-semibold text-gray-900 mb-4">❓ FAQ Section</h3>
                  
                  <div className="bg-white rounded-lg p-3 mb-3">
                    <input
                      type="text"
                      value={faqQuestion}
                      onChange={(e) => setFaqQuestion(e.target.value)}
                      className="w-full border-2 border-cyan-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Question"
                    />
                    <textarea
                      rows={2}
                      value={faqAnswer}
                      onChange={(e) => setFaqAnswer(e.target.value)}
                      className="w-full border-2 border-cyan-300 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="Answer"
                    />
                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="w-full bg-cyan-600 text-white text-sm rounded-lg py-2 hover:bg-cyan-700 flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add FAQ
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {formData.faqs.map((faq, idx) => (
                      <div key={idx} className="text-sm border-l-4 border-cyan-500 bg-white p-3 rounded">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-gray-800">Q: {faq.question}</p>
                          <button
                            type="button"
                            onClick={() => handleRemoveFaq(idx)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-gray-600 text-xs mt-2">A: {faq.answer}</p>
                      </div>
                    ))}
                    {formData.faqs.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">No FAQs added yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer with Buttons */}
        <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 px-6 py-4 flex justify-between items-center rounded-b-2xl">
          <p className="text-xs text-gray-500">
            {formData.isPublished ? '✅ Published' : formData.status === 'draft' ? '📝 Draft' : '📦 Archived'}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 flex items-center gap-2 font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {blog ? '✏️ Update Blog' : '🚀 Publish Blog'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
