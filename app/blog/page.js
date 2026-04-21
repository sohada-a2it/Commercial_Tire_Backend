// app/blogs/page.jsx - Frontend Blog Listing Page

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Calendar, 
  Clock, 
  Tag, 
  Folder, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Eye,
  Star,
  ArrowRight,
  Filter,
  X,
  FileText
} from 'lucide-react';
import { fetchBlogs, formatBlogForDisplay } from '@/services/blogService';
import toast from 'react-hot-toast';

export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    page: 1,
    limit: 9
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);

  // Load blogs on mount and filter change
  useEffect(() => {
    loadBlogs();
  }, [filters]);

  // Extract unique categories from blogs
  useEffect(() => {
    if (blogs.length > 0) {
      const uniqueCategories = [...new Set(blogs.map(blog => blog.category).filter(Boolean))];
      setCategories(uniqueCategories);
    }
  }, [blogs]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const result = await fetchBlogs({
        ...filters,
        isPublished: 'true', // Only show published blogs
        status: 'published'
      });
      
      const formattedBlogs = (result.blogs || []).map(formatBlogForDisplay);
      setBlogs(formattedBlogs);
      setPagination(result.pagination || {
        page: filters.page,
        limit: filters.limit,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
      });
    } catch (error) {
      console.error('Error loading blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handleCategoryFilter = (category) => {
    setFilters({ ...filters, category: category === filters.category ? '' : category, page: 1 });
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', page: 1, limit: 9 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Recent';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  // Get reading time display
  const getReadTimeDisplay = (minutes) => {
    if (!minutes) return '5 min read';
    return `${minutes} min read`;
  };

  // Blog Card Component
  const BlogCard = ({ blog }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
      <article className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-teal-200">
        {/* Cover Image */}
        <Link href={`/blog/${blog.slug || blog.id}`} className="block overflow-hidden">
          <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            {blog.coverImage?.url && !imageError ? (
              <img
                src={blog.coverImage.url}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-2">
                    <FileText className="w-8 h-8 text-teal-500" />
                  </div>
                  <p className="text-sm text-gray-400">No image</p>
                </div>
              </div>
            )}
            
            {/* Featured Badge */}
            {blog.isFeatured && (
              <div className="absolute top-3 left-3 bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                <Star className="w-3 h-3 fill-current" /> Featured
              </div>
            )}
            
            {/* Category Tag */}
            {blog.category && (
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                {blog.category}
              </div>
            )}
          </div>
        </Link>
        
        {/* Content */}
        <div className="p-5">
          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(blog.customDate || blog.publishedAt || blog.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{getReadTimeDisplay(blog.readTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{blog.views || 0} views</span>
            </div>
          </div>
          
          {/* Title */}
          <Link href={`/blog/${blog.slug || blog.id}`}>
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
              {blog.title}
            </h3>
          </Link>
          
          {/* Excerpt */}
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {blog.excerpt || (blog.content?.replace(/<[^>]*>/g, '').slice(0, 150) + '...')}
          </p>
          
          {/* Author & Read More */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                {(blog.author || 'A')[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-700">{blog.author || 'Admin'}</span>
            </div>
            <Link 
              href={`/blog/${blog.id}`}
              className="text-teal-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
            >
              Read More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3 pt-2">
              {blog.tags.slice(0, 3).map((tag, idx) => (
                <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  #{tag}
                </span>
              ))}
              {blog.tags.length > 3 && (
                <span className="text-xs text-gray-400">+{blog.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </article>
    );
  };

  // Skeleton Card Component
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
      <div className="h-56 bg-gray-200"></div>
      <div className="p-5">
        <div className="flex gap-3 mb-3">
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Insights & Updates
          </h1>
          <p className="text-lg md:text-xl text-teal-100 max-w-2xl mx-auto">
            Explore our latest articles, industry insights, and company news
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Search and Filter Bar */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles by title, category, or tags..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                {filters.search && (
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, search: '', page: 1 })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
            
            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                showFilters || filters.category
                  ? 'bg-teal-50 border-teal-200 text-teal-600'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              {filters.category && (
                <span className="ml-1 px-1.5 py-0.5 bg-teal-100 rounded-full text-xs">
                  1
                </span>
              )}
            </button>
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Folder className="w-4 h-4 text-teal-500" />
                  Filter by Category
                </h3>
                {filters.category && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      filters.category === cat
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-gray-400">No categories available</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Info */}
        {!loading && blogs.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{blogs.length}</span> of{' '}
              <span className="font-medium text-gray-700">{pagination.total}</span> articles
            </p>
            {filters.search && (
              <p className="text-sm text-gray-500">
                Search results for: <span className="font-medium text-gray-700">"{filters.search}"</span>
              </p>
            )}
          </div>
        )}

        {/* Blog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No articles found</h3>
            <p className="text-gray-500 mb-6">
              {filters.search || filters.category
                ? "Try adjusting your search or filter criteria"
                : "Check back later for new content"}
            </p>
            {(filters.search || filters.category) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}