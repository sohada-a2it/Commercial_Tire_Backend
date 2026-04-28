// services/blogService.js

import { config } from "@/config/site";
import { auth } from "@/config/firebase";
import { getAuthorizedSession } from "@/lib/sessionAuth";

const buildAuthHeaders = async (isJson = true) => {
  const firebaseToken = await auth.currentUser?.getIdToken();
  const authorizedSessionToken = getAuthorizedSession()?.token;
  const token = firebaseToken || authorizedSessionToken;

  // Add debugging
  if (!token) {
    console.error('⚠️ No authentication token found!');
    console.log('Firebase user:', auth.currentUser);
    console.log('Session token:', getAuthorizedSession());
  } else {
    console.log('✅ Token found, length:', token.length);
  }

  return {
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
};

/**
 * Get all blogs with pagination and filters
 * @param {Object} filters - Filter parameters
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Items per page (default: 10, max: 50)
 * @param {string} filters.category - Category name
 * @param {string} filters.tag - Tag name
 * @param {boolean} filters.isPublished - Published status
 * @param {string} filters.status - Blog status (draft/published/archived/scheduled)
 * @param {boolean} filters.isFeatured - Featured status
 * @param {string} filters.search - Search term
 */
export const fetchBlogs = async (filters = {}) => {
  const params = new URLSearchParams();

  // Pagination
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  // Filters
  if (filters.category && filters.category !== 'all') params.append('category', filters.category);
  if (filters.tag) params.append('tag', filters.tag);
  if (filters.isPublished !== undefined && filters.isPublished !== null) {
    params.append('isPublished', filters.isPublished);
  }
  if (filters.status) params.append('status', filters.status);
  if (filters.isFeatured !== undefined && filters.isFeatured !== null) {
    params.append('isFeatured', filters.isFeatured);
  }
  if (filters.search) params.append('search', filters.search);
  if (filters.showScheduled) params.append('showScheduled', filters.showScheduled);

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/blogs${params.toString() ? `?${params.toString()}` : ""}`,
    { headers, cache: "no-store" }
  );

  const data = await parseResponse(response);

  return {
    success: true,
    blogs: data.data || [],
    count: data.count || 0,
    total: data.total || 0,
    pagination: {
      page: data.page || Number(filters.page || 1),
      limit: Number(filters.limit || 10),
      total: data.total || 0,
      totalPages: data.totalPages || 1,
      hasNextPage: data.page < data.totalPages,
      hasPrevPage: data.page > 1,
    },
    filters: data.filters || {
      categories: [],
      tags: []
    },
  };
};

/**
 * Get single blog by slug (public view)
 * @param {string} slug - Blog slug
 */
export const fetchBlogBySlug = async (slug) => {
  if (!slug) {
    throw new Error("Blog slug is required");
  }

  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/blogs/${slug}`, {
    headers,
    cache: "no-store"
  });
  const data = await parseResponse(response);

  if (!data?.data) {
    throw new Error("Invalid blog response");
  }

  return {
    success: true,
    blog: data.data,
    related: data.related || []
  };
};

/**
 * Get single blog by ID (admin edit view)
 * @param {string} id - Blog ID
 */
export const fetchBlogById = async (id) => {
  if (!id) {
    throw new Error("Blog id is required for edit view");
  }

  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/blogs/id/${id}`, {
    headers,
    cache: "no-store"
  });
  const data = await parseResponse(response);

  if (!data?.data) {
    throw new Error("Invalid blog response for edit view");
  }

  return { success: true, blog: data.data };
};

/**
 * Get featured blogs
 * @param {number} limit - Number of blogs to fetch (default: 6)
 */
export const fetchFeaturedBlogs = async (limit = 6) => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/blogs/featured?limit=${limit}`, {
    headers,
    cache: "no-store"
  });
  const data = await parseResponse(response);
  return { success: true, blogs: data.data || [] };
};

/**
 * Get scheduled blogs
 */
export const fetchScheduledBlogs = async () => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/blogs/scheduled`, {
    headers,
    cache: "no-store"
  });
  const data = await parseResponse(response);
  return { success: true, blogs: data.data || [] };
};

/**
 * Create a new blog with images, videos, audio and attachments
 * @param {FormData} formData - Form data containing blog fields and files
 */
export const createBlog = async (formData) => {
  const headers = await buildAuthHeaders(false);

  const response = await fetch(`${config.email.backendUrl}/api/blogs`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await parseResponse(response);
  return { success: true, blog: data.data };
};

/**
 * Update an existing blog
 * @param {string} id - Blog ID
 * @param {FormData} formData - Form data containing updated blog fields and files
 */
export const updateBlog = async (id, formData) => {
  if (!id) {
    throw new Error("Blog id is required for update");
  }

  const headers = await buildAuthHeaders(false);

  const response = await fetch(`${config.email.backendUrl}/api/blogs/${id}`, {
    method: "PUT",
    headers,
    body: formData,
  });

  const data = await parseResponse(response);
  return { success: true, blog: data.data };
};

/**
 * Delete a blog
 * @param {string} id - Blog ID
 */
export const deleteBlog = async (id) => {
  if (!id) {
    throw new Error("Blog id is required for deletion");
  }

  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/blogs/${id}`, {
    method: "DELETE",
    headers,
  });

  const data = await parseResponse(response);
  return { success: true, message: data.message };
};

/**
 * Toggle blog publish status
 * @param {string} id - Blog ID
 */
export const togglePublishStatus = async (id) => {
  if (!id) {
    throw new Error("Blog id is required");
  }

  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/blogs/${id}/toggle-publish`, {
    method: "PATCH",
    headers,
  });

  const data = await parseResponse(response);
  return { success: true, blog: data.data, message: data.message };
};

/**
 * Toggle blog featured status
 * @param {string} id - Blog ID
 */
export const toggleFeaturedStatus = async (id) => {
  if (!id) {
    throw new Error("Blog id is required");
  }

  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/blogs/${id}/toggle-featured`, {
    method: "PATCH",
    headers,
  });

  const data = await parseResponse(response);
  return { success: true, blog: data.data, message: data.message };
};

/**
 * Get blog statistics (admin dashboard)
 */
export const fetchBlogStats = async () => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/blogs/stats`, {
    headers,
    cache: "no-store"
  });

  const data = await parseResponse(response);
  return {
    success: true,
    stats: data.stats || {
      totalBlogs: 0,
      publishedBlogs: 0,
      draftBlogs: 0,
      totalViews: 0,
      topBlogs: [],
      blogsByMonth: []
    }
  };
};

/**
 * Bulk update blog status
 * @param {string[]} ids - Array of blog IDs
 * @param {string} status - New status
 */
export const bulkUpdateStatus = async (ids, status) => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/blogs/bulk/update-status`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ ids, status }),
  });
  const data = await parseResponse(response);
  return { success: true, message: data.message };
};

/**
 * Bulk delete blogs
 * @param {string[]} ids - Array of blog IDs
 */
export const bulkDeleteBlogs = async (ids) => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/blogs/bulk/delete`, {
    method: "DELETE",
    headers,
    body: JSON.stringify({ ids }),
  });
  const data = await parseResponse(response);
  return { success: true, message: data.message };
};

// ==================== HELPER FUNCTIONS FOR FRONTEND ====================

/**
 * Prepare FormData for blog creation/update with all new features
 * @param {Object} blogData - Blog data object
 * @param {File} coverImage - Cover image file (optional)
 * @param {File[]} galleryImages - Array of gallery image files (max 6)
 * @param {string[]} removeGalleryImages - Array of publicIds to remove (for update)
 * @param {File[]} attachments - Array of attachment files (max 10)
 * @param {File} videoFile - Video file (optional)
 * @param {File} audioFile - Audio file (optional)
 */
export const prepareBlogFormData = (
  blogData,
  coverImage = null,
  galleryImages = [],
  removeGalleryImages = [],
  attachments = [],
  videoFile = null,
  audioFile = null
) => {
  const formData = new FormData();

  // Basic fields
  if (blogData.title) formData.append('title', blogData.title);
  if (blogData.content) formData.append('content', blogData.content);
  if (blogData.excerpt) formData.append('excerpt', blogData.excerpt);
  if (blogData.category) formData.append('category', blogData.category);
  if (blogData.metaTitle) formData.append('metaTitle', blogData.metaTitle);
  if (blogData.metaDescription) formData.append('metaDescription', blogData.metaDescription);
  if (blogData.author) formData.append('author', blogData.author);
  if (blogData.readTime) formData.append('readTime', blogData.readTime);
  if (blogData.isPublished !== undefined) formData.append('isPublished', blogData.isPublished);
  if (blogData.publishedAt) formData.append('publishedAt', blogData.publishedAt);

  // New fields
  if (blogData.status) formData.append('status', blogData.status);
  if (blogData.isFeatured !== undefined) formData.append('isFeatured', blogData.isFeatured);
  if (blogData.featuredPriority) formData.append('featuredPriority', blogData.featuredPriority);
  if (blogData.customDate) formData.append('customDate', blogData.customDate);
  if (blogData.isScheduled !== undefined) formData.append('isScheduled', blogData.isScheduled);
  if (blogData.scheduledDate) formData.append('scheduledDate', blogData.scheduledDate);

  // Video fields
  if (blogData.videoUrl) formData.append('videoUrl', blogData.videoUrl);
  if (blogData.videoEmbedCode) formData.append('videoEmbedCode', blogData.videoEmbedCode);

  // Audio fields
  if (blogData.audioUrl) formData.append('audioUrl', blogData.audioUrl);
  if (blogData.audioTitle) formData.append('audioTitle', blogData.audioTitle);

  // FAQs (send as JSON string)
  if (blogData.faqs && Array.isArray(blogData.faqs) && blogData.faqs.length > 0) {
    formData.append('faqs', JSON.stringify(blogData.faqs));
  }

  // Tags (send as JSON string)
  if (blogData.tags && Array.isArray(blogData.tags)) {
    formData.append('tags', JSON.stringify(blogData.tags));
  } else if (typeof blogData.tags === 'string') {
    formData.append('tags', blogData.tags);
  }

  // Gallery images URLs (for URL-based uploads)
  if (blogData.galleryImageUrls && Array.isArray(blogData.galleryImageUrls)) {
    formData.append('galleryImages', JSON.stringify(blogData.galleryImageUrls));
  }

  // Cover image URL (for URL-based upload)
  if (blogData.coverImageUrl) {
    formData.append('coverImageUrl', blogData.coverImageUrl);
  }

  // Cover image file
  if (coverImage) {
    formData.append('coverImage', coverImage);
  }

  // Gallery images files (max 6)
  if (galleryImages && galleryImages.length > 0) {
    const imagesToUpload = galleryImages.slice(0, 6);
    imagesToUpload.forEach((image) => {
      formData.append('galleryImages', image);
    });
  }

  // Attachment files (max 10)
  if (attachments && attachments.length > 0) {
    const attachmentsToUpload = attachments.slice(0, 10);
    attachmentsToUpload.forEach((attachment) => {
      formData.append('attachments', attachment);
    });
  }

  // Video file
  if (videoFile) {
    formData.append('videoFile', videoFile);
  }

  // Audio file
  if (audioFile) {
    formData.append('audioFile', audioFile);
  }

  // Images to remove (for update)
  if (removeGalleryImages && removeGalleryImages.length > 0) {
    formData.append('removeGalleryImages', JSON.stringify(removeGalleryImages));
  }

  // Replace entire gallery flag
  if (blogData.replaceGallery) {
    formData.append('replaceGallery', 'true');
  }

  return formData;
};

/**
 * Format blog data for display
 * @param {Object} blog - Raw blog data from API
 */
export const formatBlogForDisplay = (blog) => {
  if (!blog) return null;

  return {
    id: blog._id || blog.id,
    title: blog.title || '',
    slug: blog.slug || '',
    content: blog.content || '',
    excerpt: blog.excerpt || '',
    category: blog.category || 'uncategorized',
    categories: blog.categories || [],
    tags: blog.tags || [],
    coverImage: blog.coverImage || { url: '', publicId: '', alt: '' },
    galleryImages: blog.galleryImages || [],
    // New fields
    status: blog.status || 'draft',
    isFeatured: blog.isFeatured || false,
    featuredPriority: blog.featuredPriority || 0,
    customDate: blog.customDate,
    isScheduled: blog.isScheduled || false,
    scheduledDate: blog.scheduledDate,
    videoUrl: blog.videoUrl || '',
    videoEmbedCode: blog.videoEmbedCode || '',
    audioUrl: blog.audioUrl || '',
    audioTitle: blog.audioTitle || '',
    attachments: blog.attachments || [],
    faqs: blog.faqs || [],
    enableFaq: blog.enableFaq || false,
    // SEO
    metaTitle: blog.metaTitle || blog.title || '',
    metaDescription: blog.metaDescription || blog.excerpt || '',
    // Meta
    author: blog.author || 'Admin',
    readTime: blog.readTime || 5,
    isPublished: blog.isPublished || false,
    publishedAt: blog.publishedAt,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
    views: blog.views || 0,
  };
};

/**
 * Get image URL with optimization options
 * @param {Object|string} image - Image object or URL string
 * @param {Object} options - Cloudinary transformation options
 */
export const getBlogImageUrl = (image, options = {}) => {
  if (!image) return '';

  const imageUrl = typeof image === 'string' ? image : image.url || '';
  if (!imageUrl) return '';

  // If it's a Cloudinary URL, we can add transformations
  if (imageUrl.includes('cloudinary.com')) {
    const baseUrl = imageUrl.split('/upload/')[0];
    const path = imageUrl.split('/upload/')[1];

    const transforms = [];
    if (options.width) transforms.push(`w_${options.width}`);
    if (options.height) transforms.push(`h_${options.height}`);
    if (options.quality) transforms.push(`q_${options.quality}`);
    if (options.crop) transforms.push(`c_${options.crop}`);
    if (options.format) transforms.push(`f_${options.format}`);

    const transformString = transforms.length ? `${transforms.join(',')}/` : '';
    return `${baseUrl}/upload/${transformString}${path}`;
  }

  return imageUrl;
};

/**
 * Get cover image URL
 * @param {Object} blog - Blog object
 * @param {Object} options - Image options
 */
export const getCoverImageUrl = (blog, options = {}) => {
  if (!blog) return '';
  return getBlogImageUrl(blog.coverImage, { quality: 'auto', ...options });
};

/**
 * Get first gallery image URL
 * @param {Object} blog - Blog object
 * @param {Object} options - Image options
 */
export const getFirstGalleryImageUrl = (blog, options = {}) => {
  if (!blog?.galleryImages?.length) return '';
  return getBlogImageUrl(blog.galleryImages[0], { quality: 'auto', ...options });
};

/**
 * Get all gallery images URLs
 * @param {Object} blog - Blog object
 * @param {Object} options - Image options
 */
export const getAllGalleryImagesUrls = (blog, options = {}) => {
  if (!blog?.galleryImages?.length) return [];
  return blog.galleryImages.map(img => getBlogImageUrl(img, options));
};

/**
 * Get video embed HTML (for YouTube/Vimeo)
 * @param {Object} blog - Blog object
 * @param {Object} options - Video options
 */
export const getVideoEmbedHtml = (blog, options = {}) => {
  if (!blog) return '';

  if (blog.videoEmbedCode) {
    return blog.videoEmbedCode;
  }

  if (blog.videoUrl) {
    const url = blog.videoUrl;
    const width = options.width || '100%';
    const height = options.height || '400';

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      }
      if (videoId) {
        return `<iframe width="${width}" height="${height}" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
      }
    }

    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) {
        return `<iframe width="${width}" height="${height}" src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen></iframe>`;
      }
    }
  }

  return '';
};

/**
 * Get audio player HTML
 * @param {Object} blog - Blog object
 */
export const getAudioPlayerHtml = (blog) => {
  if (!blog?.audioUrl) return '';

  return `<audio controls style="width: 100%;">
    <source src="${blog.audioUrl}" type="audio/mpeg">
    Your browser does not support the audio element.
  </audio>`;
};

/**
 * Get file download link
 * @param {Object} attachment - Attachment object
 */
export const getFileDownloadUrl = (attachment) => {
  if (!attachment?.fileUrl) return '';
  return attachment.fileUrl;
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ==================== BLOG COMMENT FUNCTIONS ====================

/**
 * Add comment to blog
 * @param {string} blogId - Blog ID
 * @param {Object} commentData - Comment data
 */
export const addBlogComment = async (blogId, commentData) => {
  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/blogs/${blogId}/comments`, {
    method: "POST",
    headers,
    body: JSON.stringify(commentData),
  });
  const data = await parseResponse(response);
  return { success: true, comment: data.comment };
};

/**
 * Get blog comments
 * @param {string} blogId - Blog ID
 * @param {Object} filters - Pagination filters
 */
export const fetchBlogComments = async (blogId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/blogs/${blogId}/comments${params.toString() ? `?${params.toString()}` : ""}`,
    { headers }
  );
  const data = await parseResponse(response);
  return {
    success: true,
    comments: data.comments || [],
    pagination: data.pagination || {}
  };
};

// ==================== BLOG CATEGORY FUNCTIONS ====================

/**
 * Get all blog categories
 */
export const fetchBlogCategories = async () => {
  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/blog-categories`,
    { headers, cache: "no-store" }
  );
  const data = await parseResponse(response);
  return {
    success: true,
    categories: data.data || [],
    count: data.count || 0
  };
};

/**
 * Get all blog categories with blog count
 */
export const fetchBlogCategoriesWithCount = async () => {
  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/blog-categories/with-count`,
    { headers, cache: "no-store" }
  );
  const data = await parseResponse(response);
  return {
    success: true,
    categories: data.data || [],
    count: data.count || 0
  };
};

/**
 * Get single blog category by ID
 * @param {string} id - Category ID
 */
export const fetchBlogCategoryById = async (id) => {
  if (!id) {
    throw new Error("Category ID is required");
  }

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/blog-categories/id/${id}`,
    { headers }
  );
  const data = await parseResponse(response);
  return { success: true, category: data.data };
};

/**
 * Get single blog category by slug
 * @param {string} slug - Category slug
 */
export const fetchBlogCategoryBySlug = async (slug) => {
  if (!slug) {
    throw new Error("Category slug is required");
  }

  const headers = await buildAuthHeaders();
  const response = await fetch(
    `${config.email.backendUrl}/api/blog-categories/slug/${slug}`,
    { headers }
  );
  const data = await parseResponse(response);
  return { success: true, category: data.data };
};

/**
 * Create a new blog category
 * @param {Object} categoryData - Category data
 * @param {string} categoryData.name - Category internal name (lowercase, unique)
 * @param {string} categoryData.displayName - Category display name
 * @param {string} categoryData.description - Category description (optional)
 * @param {string} categoryData.metaTitle - SEO meta title (optional)
 * @param {string} categoryData.metaDescription - SEO meta description (optional)
 */
export const createBlogCategory = async (categoryData) => {
  if (!categoryData.name || !categoryData.displayName) {
    throw new Error("Category name and display name are required");
  }

  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/blog-categories`, {
    method: "POST",
    headers,
    body: JSON.stringify(categoryData),
  });

  const data = await parseResponse(response);
  return {
    success: true,
    category: data.data,
    message: data.message
  };
};

/**
 * Update an existing blog category
 * @param {string} id - Category ID
 * @param {Object} categoryData - Updated category data
 */
export const updateBlogCategory = async (id, categoryData) => {
  if (!id) {
    throw new Error("Category ID is required");
  }

  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/blog-categories/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(categoryData),
  });

  const data = await parseResponse(response);
  return {
    success: true,
    category: data.data,
    message: data.message
  };
};

/**
 * Delete a blog category
 * @param {string} id - Category ID
 */
export const deleteBlogCategory = async (id) => {
  if (!id) {
    throw new Error("Category ID is required");
  }

  const headers = await buildAuthHeaders();
  const response = await fetch(`${config.email.backendUrl}/api/blog-categories/${id}`, {
    method: "DELETE",
    headers,
  });

  const data = await parseResponse(response);
  return {
    success: true,
    message: data.message
  };
};