'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  fetchBlogs, 
  deleteBlog, 
  togglePublishStatus,
  toggleFeaturedStatus,
  fetchBlogById,
  bulkUpdateStatus,
  bulkDeleteBlogs, 
  formatBlogForDisplay ,
  fetchBlogCategories 
} from '@/services/blogService';
import DeleteConfirmModal from '@/components/blog/deleteConfirmModal';
import BlogViewModal from '@/components/blog/blogViewModal';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';

export default function AdminBlogManager() {
  const router = useRouter();
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlogs, setSelectedBlogs] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [viewingBlog, setViewingBlog] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    isFeatured: '',
    isPublished: '',
    page: 1,
    limit: 10
  });

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load blogs on mount and filter change
  useEffect(() => {
    loadBlogs();
  }, [filters]);

  const loadCategories = async () => {
  try {
    const result = await fetchBlogCategories();
    if (result.success) {
      setCategories(result.categories);
      console.log('Loaded categories from DB:', result.categories.map(c => ({ name: c.name, displayName: c.displayName })));
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};

  const loadBlogs = async () => {
  setLoading(true);
  try {
    const activeFilters = {};
    
    if (filters.search) activeFilters.search = filters.search;
    if (filters.category) activeFilters.category = filters.category;
    if (filters.status) activeFilters.status = filters.status;
    if (filters.isFeatured) activeFilters.isFeatured = filters.isFeatured;
    if (filters.isPublished !== '') activeFilters.isPublished = filters.isPublished;
    
    const result = await fetchBlogs({
      page: filters.page,
      limit: filters.limit,
      ...activeFilters
    });
    
    // blogs গুলোকে format করুন এবং category মাইগ্রেট করুন
    const formattedBlogs = result.blogs.map(blog => {
      const formatted = formatBlogForDisplay(blog);
      
      // ডিবাগ করার জন্য কনসোল লগ
      console.log('Blog:', formatted.title);
      console.log(' - categories array:', formatted.categories);
      console.log(' - category field:', formatted.category);
      
      // যদি categories array খালি থাকে কিন্তু category ফিল্ডে মান থাকে
      if ((!formatted.categories || formatted.categories.length === 0) && 
          formatted.category && 
          formatted.category !== 'uncategorized') {
        console.log(' - Fixing: adding category to categories array');
        formatted.categories = [formatted.category];
      }
      
      // যদি এখনও categories খালি থাকে
      if (!formatted.categories) {
        formatted.categories = [];
      }
      
      return formatted;
    });
    
    setBlogs(formattedBlogs);
    setPagination(result.pagination);
  } catch (error) {
    console.error('Error loading blogs:', error);
    alert('Failed to load blogs');
  } finally {
    setLoading(false);
  }
};

  // Delete blog handler
  const handleDelete = async () => {
    if (!selectedBlog) return;
    try {
      const result = await deleteBlog(selectedBlog.id);
      if (result.success) {
        await loadBlogs();
        setShowDeleteModal(false);
        setSelectedBlog(null);
        alert('Blog deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog: ' + error.message);
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedBlogs.length === 0) return;
    try {
      const result = await bulkDeleteBlogs(selectedBlogs);
      if (result.success) {
        await loadBlogs();
        setSelectedBlogs([]);
        setShowBulkDeleteModal(false);
        alert(`${selectedBlogs.length} blogs deleted successfully`);
      }
    } catch (error) {
      console.error('Error bulk deleting blogs:', error);
      alert('Failed to delete blogs: ' + error.message);
    }
  };

  // Bulk status update handler
  const handleBulkStatusUpdate = async (status) => {
    if (selectedBlogs.length === 0) return;
    try {
      const result = await bulkUpdateStatus(selectedBlogs, status);
      if (result.success) {
        await loadBlogs();
        setSelectedBlogs([]);
        alert(`${selectedBlogs.length} blogs updated to ${status}`);
      }
    } catch (error) {
      console.error('Error updating blog statuses:', error);
      alert('Failed to update blog statuses: ' + error.message);
    }
  };

  // Toggle publish status handler
  const handleTogglePublish = async (blog) => {
    try {
      const result = await togglePublishStatus(blog.id);
      if (result.success) {
        await loadBlogs();
        alert(`Blog ${result.blog.isPublished ? 'published' : 'unpublished'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update publish status');
    }
  };

  // Toggle featured status handler
  const handleToggleFeatured = async (blog) => {
    try {
      const result = await toggleFeaturedStatus(blog.id);
      if (result.success) {
        await loadBlogs();
        alert(`Blog ${result.blog.isFeatured ? 'featured' : 'unfeatured'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling featured status:', error);
      alert('Failed to update featured status');
    }
  };

  // View blog details handler - format করে দেখান
  const handleViewBlog = async (blog) => {
    try {
      const result = await fetchBlogById(blog.id);
      // format করে নিন
      setViewingBlog(formatBlogForDisplay(result.blog));
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching blog details:', error);
      alert('Failed to load blog details');
    }
  };

  // Edit blog - redirect to edit page
  const handleEditBlog = (blog) => {
    router.push(`/dashboard/blogs/edit?id=${blog.id}`);
  };

  // Create new blog - redirect to create page
  const handleCreateBlog = () => {
    router.push('/dashboard/blogs/create');
  };

  // Select blog for bulk actions
  const handleSelectBlog = (blogId) => {
    setSelectedBlogs(prev => {
      const newSelection = prev.includes(blogId)
        ? prev.filter(id => id !== blogId)
        : [...prev, blogId];
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedBlogs.length === blogs.length && blogs.length > 0) {
      setSelectedBlogs([]);
      setShowBulkActions(false);
    } else {
      const allIds = blogs.map(blog => blog.id);
      setSelectedBlogs(allIds);
      setShowBulkActions(true);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    setSelectedBlogs([]);
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
    setSelectedBlogs([]);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      isFeatured: '',
      isPublished: '',
      page: 1,
      limit: 10
    });
    setSelectedBlogs([]);
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return filters.search || filters.category || filters.status || filters.isFeatured || filters.isPublished;
  };

  // Stats Cards Component
  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div> 
      </div>
    </div>
  );

  // Calculate stats from loaded blogs
  const totalBlogs = pagination.total;
  const publishedBlogs = blogs.filter(b => b.isPublished).length;
  const draftBlogs = blogs.filter(b => b.status === 'draft').length;
  const scheduledBlogs = blogs.filter(b => b.status === 'scheduled').length;
  const featuredBlogs = blogs.filter(b => b.isFeatured).length; 

  // Status badge color mapping
  const getStatusBadge = (status, isPublished) => {
    if (isPublished && status === 'published') {
      return { color: 'bg-green-100 text-green-800', label: 'Published' };
    }
    if (status === 'scheduled') {
      return { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' };
    }
    if (status === 'archived') {
      return { color: 'bg-gray-100 text-gray-800', label: 'Archived' };
    }
    return { color: 'bg-yellow-100 text-yellow-800', label: 'Draft' };
  };

  // Loading state
  if (loading && blogs.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blogs...</p>
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
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
                <p className="mt-2 text-gray-600">Manage your blog posts, create new content, and track performance</p>
              </div>
              <button
                onClick={handleCreateBlog}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Blog
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <StatCard 
              title="Total Blogs" 
              value={totalBlogs} 
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
              color="bg-blue-500"
            />
            <StatCard 
              title="Published" 
              value={publishedBlogs} 
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="bg-green-500"
            />
            <StatCard 
              title="Drafts" 
              value={draftBlogs} 
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="bg-yellow-500"
            />
            <StatCard 
              title="Scheduled" 
              value={scheduledBlogs} 
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              color="bg-blue-500"
            />
            <StatCard 
              title="Featured" 
              value={featuredBlogs} 
              icon={
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              }
              color="bg-purple-500"
            /> 
          </div>

          {/* Bulk Actions Bar */}
          {showBulkActions && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-900">
                  {selectedBlogs.length} blog(s) selected
                </span>
              </div>
              <div className="flex gap-2">
                <select
                  onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                  className="px-3 py-1 text-sm border border-blue-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue=""
                >
                  <option value="" disabled>Change Status</option>
                  <option value="published">Publish</option>
                  <option value="draft">Move to Draft</option>
                  <option value="archived">Archive</option>
                </select>
                <button
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => {
                    setSelectedBlogs([]);
                    setShowBulkActions(false);
                  }}
                  className="px-3 py-1 text-sm border border-blue-300 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
  <select
    value={filters.category}
    onChange={(e) => handleFilterChange('category', e.target.value)}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">All Categories</option>
    {categories.map((cat) => (
      <option key={cat._id} value={cat.name}>
        {cat.displayName}
      </option>
    ))}
  </select>
</div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Published</label>
                <select
                  value={filters.isPublished}
                  onChange={(e) => handleFilterChange('isPublished', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All (Published/Draft)</option>
                  <option value="true">Published Only</option>
                  <option value="false">Draft Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                <select
                  value={filters.isFeatured}
                  onChange={(e) => handleFilterChange('isFeatured', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All (Featured/Not)</option>
                  <option value="true">Featured Only</option>
                  <option value="false">Non-Featured Only</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Items/Page</label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={handleResetFilters}
                  className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {hasActiveFilters() && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-gray-500">Active Filters:</span>
                  {filters.search && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                      Search: {filters.search}
                      <button onClick={() => handleFilterChange('search', '')} className="hover:text-blue-900">×</button>
                    </span>
                  )}
                  {filters.category && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                      Category: {filters.category}
                      <button onClick={() => handleFilterChange('category', '')} className="hover:text-green-900">×</button>
                    </span>
                  )}
                  {filters.status && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                      Status: {filters.status === 'published' ? 'Published' : filters.status === 'draft' ? 'Draft' : filters.status === 'scheduled' ? 'Scheduled' : 'Archived'}
                      <button onClick={() => handleFilterChange('status', '')} className="hover:text-yellow-900">×</button>
                    </span>
                  )}
                  {filters.isPublished === 'true' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                      Published Only
                      <button onClick={() => handleFilterChange('isPublished', '')} className="hover:text-green-900">×</button>
                    </span>
                  )}
                  {filters.isPublished === 'false' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                      Draft Only
                      <button onClick={() => handleFilterChange('isPublished', '')} className="hover:text-orange-900">×</button>
                    </span>
                  )}
                  {filters.isFeatured === 'true' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                      Featured Only
                      <button onClick={() => handleFilterChange('isFeatured', '')} className="hover:text-purple-900">×</button>
                    </span>
                  )}
                  {filters.isFeatured === 'false' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs">
                      Non-Featured Only
                      <button onClick={() => handleFilterChange('isFeatured', '')} className="hover:text-gray-900">×</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Blogs Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedBlogs.length === blogs.length && blogs.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Blog
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th> 
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
  {blogs.map((blog) => {
    const statusBadge = getStatusBadge(blog.status, blog.isPublished);
    return (
      <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={selectedBlogs.includes(blog.id)}
            onChange={() => handleSelectBlog(blog.id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center">
            <div className="h-10 w-10 flex-shrink-0">
              {blog.coverImage?.url ? (
                <img 
                  src={blog.coverImage.url} 
                  alt={blog.title}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs">
                {blog.title}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {blog.customDate || blog.publishedAt ? new Date(blog.customDate || blog.publishedAt).toLocaleDateString() : 'Date not set'} | By {blog.author || 'Admin'}
              </div>
              {blog.isScheduled && blog.scheduledDate && (
                <div className="text-xs text-blue-600 mt-1">
                  Scheduled: {new Date(blog.scheduledDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </td>
        {/* Multiple Categories Column */}
        <td className="px-6 py-4">
  <div className="flex flex-wrap gap-1">
    {/* প্রথমে ডিবাগ করার জন্য */}
    {console.log('Rendering categories for blog:', blog.title, blog.categories, blog.category)}
    
    {/* categories array চেক করুন */}
    {blog.categories && blog.categories.length > 0 ? (
      blog.categories.map((catName, idx) => {
        const cat = categories.find(c => c.name === catName);
        return (
          <span 
            key={idx} 
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
          >
            {cat?.displayName || catName}
          </span>
        );
      })
    ) : blog.category && blog.category !== 'uncategorized' ? (
      /* যদি single category থাকে */
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {blog.category}
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Uncategorized
      </span>
    )}
  </div>
</td>
        <td className="px-6 py-4">
          <div className="flex flex-wrap gap-1">
            {blog.tags?.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                {tag}
              </span>
            ))}
            {blog.tags?.length > 2 && (
              <span className="text-xs text-gray-500">+{blog.tags.length - 2}</span>
            )}
          </div>
        </td> 
        <td className="px-6 py-4 whitespace-nowrap">
          <button
            onClick={() => handleToggleFeatured(blog)}
            className={`p-1 rounded transition-colors ${
              blog.isFeatured 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
            title={blog.isFeatured ? 'Remove from featured' : 'Add to featured'}
          >
            <svg className="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <button
            onClick={() => handleTogglePublish(blog)}
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${statusBadge.color}`}
          >
            {statusBadge.label}
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end gap-2"> 
            <button
              onClick={() => handleViewBlog(blog)}
              className="text-blue-600 hover:text-blue-900 transition-colors p-1"
              title="View Blog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={() => handleEditBlog(blog)}
              className="text-green-600 hover:text-green-900 transition-colors p-1"
              title="Edit Blog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => {
                setSelectedBlog(blog);
                setShowDeleteModal(true);
              }}
              className="text-red-600 hover:text-red-900 transition-colors p-1"
              title="Delete Blog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    );
  })}
</tbody>
              </table>
            </div>

            {/* Empty State */}
            {blogs.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {hasActiveFilters() ? 'Try adjusting your filters to see more results.' : 'Get started by creating your first blog post.'}
                </p>
                {hasActiveFilters() ? (
                  <button
                    onClick={handleResetFilters}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={handleCreateBlog}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create New Blog
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedBlog && (
          <DeleteConfirmModal
            title="Delete Blog"
            message={`Are you sure you want to delete "${selectedBlog.title}"? This action cannot be undone.`}
            onConfirm={handleDelete}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedBlog(null);
            }}
          />
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteModal && (
          <DeleteConfirmModal
            title="Delete Blogs"
            message={`Are you sure you want to delete ${selectedBlogs.length} blog(s)? This action cannot be undone.`}
            onConfirm={handleBulkDelete}
            onClose={() => {
              setShowBulkDeleteModal(false);
            }}
          />
        )}

        {/* View Blog Modal */}
        {showViewModal && viewingBlog && (
          <BlogViewModal
            blog={viewingBlog}
            onClose={() => {
              setShowViewModal(false);
              setViewingBlog(null);
            }}
            onEdit={() => {
              setShowViewModal(false);
              handleEditBlog(viewingBlog);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}