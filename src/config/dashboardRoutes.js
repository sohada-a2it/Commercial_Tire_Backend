import {
  LayoutDashboard,
  Users,
  Package,
  Settings,
  FileText,
  ClipboardList,
  Receipt,
  UserCog,
  UserPlus,
  Shapes,
  Newspaper,
  Images,
} from "lucide-react";

export const normalizeRole = (role) => {
  if (!role || role === "user") {
    return "customer";
  }
  return role;
};

export const sidebarRoutesByRole = {
  admin: [
    { icon: LayoutDashboard, label: "Admin Dashboard", href: "/dashboard" },
    { icon: FileText, label: "Created Invoices", href: "/dashboard/invoices" },
    { icon: ClipboardList, label: "All Inquiries", href: "/dashboard/inquiries" },
    { icon: Shapes, label: "Category Management", href: "/dashboard/categories" },
    { icon: Package, label: "Product Management", href: "/dashboard/products" },
    { icon: Images, label: "Media Library", href: "/dashboard/media" },
    { icon: Users, label: "Customer A-Z", href: "/dashboard/users" },
        { icon: UserCog, label: "Authorized Persons", href: "/dashboard/authorized-persons" },

  ],
  moderator: [
    { icon: LayoutDashboard, label: "Moderator Dashboard", href: "/dashboard" },
    { icon: FileText, label: "Invoice List", href: "/dashboard/invoices" },
    { icon: ClipboardList, label: "All Inquiries", href: "/dashboard/inquiries" },
    { icon: Shapes, label: "Category Management", href: "/dashboard/categories" },
    { icon: Package, label: "Product Management", href: "/dashboard/products" },
    { icon: Images, label: "Media Library", href: "/dashboard/media" },
  ],
  customer: [
    { icon: LayoutDashboard, label: "Customer Dashboard", href: "/dashboard" },
    { icon: ClipboardList, label: "My Inquiries", href: "/dashboard/my-inquiries" },
    { icon: FileText, label: "My Invoices", href: "/dashboard/my-invoices" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ],
};

export const roleAllowedRoutePrefixes = {
  admin: ["/dashboard"],
  moderator: [
    "/dashboard",
    "/dashboard/invoices",
    "/dashboard/categories",
    "/dashboard/products",
    "/dashboard/media",
    "/dashboard/inquiries",
    "/dashboard/blogs",
    "/dashboard/settings",
  ],
  customer: [
    "/dashboard",
    "/dashboard/my-inquiries",
    "/dashboard/my-invoices",
    "/dashboard/settings",
  ],
};

const disallowedRootChildrenByRole = {
  moderator: [
    "/dashboard/users",
    "/dashboard/moderators",
    "/dashboard/authorized-persons",
    "/dashboard/new-customer",
    "/dashboard/create-invoice",
    "/dashboard/my-inquiries",
    "/dashboard/my-invoices",
  ],
  customer: [
    "/dashboard/users",
    "/dashboard/authorized-persons",
    "/dashboard/new-customer",
    "/dashboard/create-invoice",
    "/dashboard/categories",
    "/dashboard/products",
    "/dashboard/media",
    "/dashboard/inquiries",
    "/dashboard/blogs",
  ],
};

export const canAccessDashboardPath = (role, pathname) => {
  const normalizedRole = normalizeRole(role);

  if (!pathname?.startsWith("/dashboard")) {
    return true;
  }

  if (normalizedRole === "admin") {
    return true;
  }

  const blockedPaths = disallowedRootChildrenByRole[normalizedRole] || [];

  if (blockedPaths.some((path) => pathname.startsWith(path))) {
    return false;
  }

  const allowedPrefixes = roleAllowedRoutePrefixes[normalizedRole] || ["/dashboard"];

  if (pathname === "/dashboard") {
    return true;
  }

  return allowedPrefixes
    .filter((prefix) => prefix !== "/dashboard")
    .some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};
