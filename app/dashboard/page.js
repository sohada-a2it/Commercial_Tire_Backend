"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/config/dashboardRoutes";
import { fetchProducts, fetchCategories } from "@/services/catalogService";
import { fetchBlogs, fetchBlogStats } from "@/services/blogService";
import { fetchDealers } from "@/services/dealerServices";
import { getAllUsers } from "@/services/userService";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Newspaper,
  Truck,
  Eye,
  Clock,
  CheckCircle,
  ArrowRight,
  ChevronRight,
  Tag,
  Calendar,
  User,
  MapPin,
  Phone,
  Users,
  Mail,
  Shield,
  Star
} from "lucide-react";
import toast from "react-hot-toast";

const formatNumber = (value) => new Intl.NumberFormat().format(value || 0);
const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const StatCard = ({ icon: Icon, label, value, color, link, loading }) => (
  <Link href={link} className="block group">
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 tracking-wide">{label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {loading ? (
              <span className="inline-block w-20 h-8 bg-slate-200 rounded animate-pulse" />
            ) : (
              formatNumber(value)
            )}
          </p>
        </div>
        <div className={`${color} grid h-14 w-14 place-items-center rounded-2xl shadow-lg shadow-slate-200/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-sm text-amber-600 opacity-0 transition-opacity group-hover:opacity-100">
        <span>View all</span>
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>
  </Link>
);

const SectionHeader = ({ title, icon: Icon, link, count, linkText = "View all" }) => (
  <div className="mb-5 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="h-6 w-1 rounded-full bg-gradient-to-b from-amber-500 to-amber-600" />
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-amber-600" />}
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        {count !== undefined && (
          <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
            {formatNumber(count)}
          </span>
        )}
      </div>
    </div>
    {link && (
      <Link href={link} className="group flex items-center gap-1 text-sm font-medium text-amber-600 transition-all hover:text-amber-700">
        {linkText}
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    )}
  </div>
);

const ProductCard = ({ product }) => (
  <Link href={`/dashboard/products/${product.id || product._id}`} className="block group">
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-amber-200 hover:shadow-md hover:shadow-amber-100/30">
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden shrink-0">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate group-hover:text-amber-600 transition">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <Tag className="w-3 h-3" />
            <span>{product.brand || "No brand"}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{product.pattern || "No pattern"}</span>
          </div>
          {product.price && (
            <div className="mt-2 font-bold text-slate-800">
              ${parseFloat(product.price).toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </div>
  </Link>
);

const CategoryCard = ({ category }) => (
  <Link href={`/dashboard/categories/${category.id || category._id}`} className="block group">
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-amber-200 hover:shadow-md hover:shadow-amber-100/30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
          <FolderTree className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate group-hover:text-amber-600 transition">
            {category.displayName || category.name}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {category.slug || category.name?.toLowerCase().replace(/\s+/g, '-')}
          </p>
        </div>
        {category.productCount > 0 && (
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            {formatNumber(category.productCount)} products
          </span>
        )}
      </div>
    </div>
  </Link>
);

const BlogCard = ({ blog }) => (
  <Link href={`/dashboard/blogs/${blog.id || blog._id}`} className="block group">
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-amber-200 hover:shadow-md hover:shadow-amber-100/30">
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden shrink-0">
          {blog.coverImage?.url ? (
            <img src={blog.coverImage.url} alt={blog.title} className="w-full h-full object-cover" />
          ) : (
            <Newspaper className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-amber-600 transition">
            {blog.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(blog.createdAt)}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <Eye className="w-3 h-3" />
            <span>{formatNumber(blog.views)} views</span>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            {blog.isPublished ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" />
                Published
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                Draft
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  </Link>
);

const DealerCard = ({ dealer }) => (
  <Link href={`/dashboard/dealers/${dealer.id || dealer._id}`} className="block group">
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-amber-200 hover:shadow-md hover:shadow-amber-100/30">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center shrink-0">
          <Truck className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate group-hover:text-teal-600 transition">
            {dealer.companyName || dealer.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <User className="w-3 h-3" />
            <span>{dealer.contactPerson || dealer.owner || "N/A"}</span>
          </div>
          {dealer.city && (
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />
              <span>{dealer.city}, {dealer.country || "Bangladesh"}</span>
            </div>
          )}
          {dealer.phone && (
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <Phone className="w-3 h-3" />
              <span>{dealer.phone}</span>
            </div>
          )}
        </div>
        {dealer.isActive && (
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        )}
      </div>
    </div>
  </Link>
);

const UserCard = ({ user }) => (
  <Link href={`/dashboard/users/${user.id}`} className="block group">
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-amber-200 hover:shadow-md hover:shadow-amber-100/30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition">
            {user.fullName || user.displayName || "N/A"}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <Mail className="w-3 h-3" />
            <span className="truncate">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <Shield className="w-3 h-3" />
            <span className="capitalize">{user.role || "customer"}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{formatDate(user.createdAt)}</span>
          </div>
        </div>
        {user.isActive !== false && (
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        )}
      </div>
    </div>
  </Link>
);

const SummaryCard = ({ title, value, icon: Icon, color, link }) => (
  <Link href={link} className="block">
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
        <div className={`${color} p-2 rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  </Link>
);

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const role = normalizeRole(userProfile?.role);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    products: [],
    categories: [],
    blogs: [],
    dealers: [],
    users: [],
    productCount: 0,
    categoryCount: 0,
    blogCount: 0,
    dealerCount: 0,
    userCount: 0,
    productStats: {},
    blogStats: {}
  });

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [
          productsRes,
          categoriesRes,
          blogsRes,
          dealersRes,
          blogStatsRes,
          usersRes
        ] = await Promise.all([
          fetchProducts({ limit: 100 }),
          fetchCategories(),
          fetchBlogs({ limit: 100 }),
          fetchDealers({ limit: 100 }),
          fetchBlogStats().catch(() => ({ stats: {} })),
          getAllUsers({ limit: 200 }).catch(() => ({ users: [] }))
        ]);

        let categories = [];
        if (categoriesRes.categories) {
          categories = categoriesRes.categories;
        } else if (categoriesRes.data) {
          categories = categoriesRes.data;
        } else if (Array.isArray(categoriesRes)) {
          categories = categoriesRes;
        }

        setData({
          products: productsRes.products || [],
          productCount: productsRes.pagination?.total || (productsRes.products || []).length,
          categories: categories,
          categoryCount: categories.length,
          blogs: blogsRes.blogs || [],
          blogCount: blogsRes.total || (blogsRes.blogs || []).length,
          dealers: dealersRes.dealers || [],
          dealerCount: dealersRes.count || (dealersRes.dealers || []).length,
          users: usersRes.users || [],
          userCount: (usersRes.users || []).length,
          productStats: productsRes.filters || {},
          blogStats: blogStatsRes.stats || {}
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const {
    products,
    productCount,
    categories,
    categoryCount,
    blogs,
    blogCount,
    dealers,
    dealerCount,
    users,
    userCount,
    blogStats
  } = data;

  const recentProducts = products.slice(0, 4);
  const recentCategories = categories.slice(0, 4);
  const recentBlogs = blogs.slice(0, 4);
  const recentDealers = dealers.slice(0, 4);
  const recentUsers = users.slice(0, 4);

  const publishedBlogs = blogs.filter(b => b.isPublished).length;
  const draftBlogs = blogs.filter(b => !b.isPublished).length;
  const activeDealers = dealers.filter(d => d.isActive !== false).length;
  const activeUsers = users.filter(u => u.isActive !== false).length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const customerUsers = users.filter(u => u.role === 'customer').length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-600 to-amber-600 p-8 shadow-2xl ">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm mb-4">
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                <span>Management Dashboard</span>
              </div>
              <h1 className="text-4xl font-bold text-white lg:text-5xl">
                Welcome back, {userProfile?.fullName?.split(' ')[0] || "Admin"}!
              </h1>
              <p className="mt-3 text-slate-300 max-w-xl">
                Manage your products, categories, blogs, dealers, and users from one central dashboard.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-400">Last updated</p>
                <p className="text-sm font-medium text-white">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main Stats Cards - 5 items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard 
            icon={Package} 
            label="Total Products" 
            value={productCount} 
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            link="/dashboard/products"
            loading={loading}
          />
          <StatCard 
            icon={FolderTree} 
            label="Total Categories" 
            value={categoryCount} 
            color="bg-gradient-to-br from-amber-500 to-amber-600"
            link="/dashboard/categories"
            loading={loading}
          />
          <StatCard 
            icon={Newspaper} 
            label="Total Blogs" 
            value={blogCount} 
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            link="/dashboard/blogs"
            loading={loading}
          />
          <StatCard 
            icon={Truck} 
            label="Total Dealers" 
            value={dealerCount} 
            color="bg-gradient-to-br from-teal-500 to-teal-600"
            link="/dashboard/dealers"
            loading={loading}
          />
          <StatCard 
            icon={Users} 
            label="Total Users" 
            value={userCount} 
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            link="/dashboard/users"
            loading={loading}
          />
        </div> 

        {/* Users Section - Full Width */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <SectionHeader 
            title="Recent Users" 
            icon={Users}
            link="/dashboard/users" 
            count={userCount}
          />
          
          {loading ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2 animate-pulse" />
                      <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No users found</p>
              <Link href="/dashboard/users/new" className="inline-flex items-center gap-1 mt-2 text-sm text-amber-600 hover:text-amber-700">
                Add your first user
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {recentUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>

        {/* Quick Links Footer */}
        {/* <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-1 rounded-full bg-gradient-to-b from-amber-500 to-amber-600" />
            <h2 className="text-lg font-semibold text-slate-800">Quick Access</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Link href="/dashboard/products/new" className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/30 transition">
              <Package className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Add Product</span>
            </Link>
            <Link href="/dashboard/categories/new" className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/30 transition">
              <FolderTree className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">Add Category</span>
            </Link>
            <Link href="/dashboard/blogs/new" className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/30 transition">
              <Newspaper className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium">Write Blog</span>
            </Link>
            <Link href="/dashboard/dealers/new" className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/30 transition">
              <Truck className="w-4 h-4 text-teal-500" />
              <span className="text-sm font-medium">Add Dealer</span>
            </Link>
            <Link href="/dashboard/users/new" className="flex items-center gap-2 p-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/30 transition">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Add User</span>
            </Link>
          </div>
        </div> */}
      </div>
    </DashboardLayout>
  );
}