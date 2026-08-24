/** Module keys must match backend ADMIN_MODULES / ROLE_MODULES */

import { canAccessModule } from "./modulePermissions";

export { MODULE_CATALOG } from "./modulePermissions";

export const ROLE_MODULE_KEYS = {
  hr: ["career"],
  digital_marketing: ["portfolio", "testimonials", "case_studies", "blog"],
};

/** One tile per section; children only in that section's sidebar */
export const MODULE_SECTIONS = [
  {
    key: "leads",
    label: "Leads",
    href: "/admin/leads/dashboard",
    description: "Inbound enquiries",
    icon: "📋",
    match: (path) => path === "/admin/leads" || path.startsWith("/admin/leads/"),
    children: [
      { label: "Dashboard", href: "/admin/leads/dashboard" },
      { label: "All Leads", href: "/admin/leads" },
    ],
  },
  {
    key: "portfolio",
    label: "Portfolio",
    href: "/admin/portfolio",
    description: "Projects & categories",
    icon: "📁",
    match: (path) => path === "/admin/portfolio" || path.startsWith("/admin/portfolio/"),
    children: [{ label: "Portfolio", href: "/admin/portfolio" }],
  },
  {
    key: "career",
    label: "Career",
    href: "/admin/career/jobs",
    description: "Jobs & applications",
    icon: "💼",
    match: (path) => path.startsWith("/admin/career"),
    children: [
      { label: "Jobs", href: "/admin/career/jobs" },
      { label: "Job Applications", href: "/admin/career/applications" },
    ],
  },
  {
    key: "life",
    label: "Life Gallery",
    href: "/admin/life",
    description: "Culture & events",
    icon: "🖼️",
    match: (path) => path === "/admin/life" || path.startsWith("/admin/life/"),
    children: [{ label: "Life Gallery", href: "/admin/life" }],
  },
  {
    key: "testimonials",
    label: "Testimonials",
    href: "/admin/testimonials",
    description: "Client reviews",
    icon: "✍️",
    match: (path) =>
      path === "/admin/testimonials" || path.startsWith("/admin/testimonials/"),
    children: [{ label: "Testimonials", href: "/admin/testimonials" }],
  },
  {
    key: "case_studies",
    label: "Case Studies",
    href: "/admin/case-studies",
    description: "Stories & categories",
    icon: "📊",
    match: (path) =>
      path === "/admin/case-studies" || path.startsWith("/admin/case-studies/"),
    children: [
      { label: "Case Studies", href: "/admin/case-studies" },
      { label: "Categories", href: "/admin/case-studies/categories" },
    ],
  },
  {
    key: "blog",
    label: "Blog",
    href: "/admin/blog",
    description: "Blog posts & categories",
    icon: "📝",
    match: (path) => path === "/admin/blog" || path.startsWith("/admin/blog/"),
    children: [
      { label: "Blog Posts", href: "/admin/blog" },
      { label: "Add Post", href: "/admin/blog/create" },
      { label: "Blog Agent", href: "/admin/blog/agent" },
    ],
  },
  {
    key: "connect",
    label: "Connect",
    href: "/admin/connect",
    description: "API keys for external tools",
    icon: "🔗",
    superAdminOnly: true,
    match: (path) => path === "/admin/connect" || path.startsWith("/admin/connect/"),
    children: [{ label: "API Keys", href: "/admin/connect" }],
  },
];

export function getAllowedModuleKeys(user) {
  if (!user) return [];
  if (user.role === "super_admin") {
    return MODULE_SECTIONS.map((s) => s.key);
  }
  return MODULE_SECTIONS.filter(
    (s) => !s.superAdminOnly && canAccessModule(user, s.key),
  ).map((s) => s.key);
}

/** Module launcher tiles (replaces old dashboard) */
export function getModuleTiles(user) {
  const keys = getAllowedModuleKeys(user);
  return MODULE_SECTIONS.filter((s) => keys.includes(s.key));
}

export function getActiveSection(pathname) {
  return MODULE_SECTIONS.find((s) => s.match(pathname)) || null;
}

export function getSidebarNav(pathname, user) {
  const section = getActiveSection(pathname);
  if (!section) return [];

  if (user?.role !== "super_admin") {
    if (section.superAdminOnly || !canAccessModule(user, section.key)) {
      return [];
    }
  }

  return section.children;
}

export function canAccessPath(pathname, user) {
  if (!user) return false;

  if (
    pathname === "/admin" ||
    pathname === "/admin/dashboard"
  ) {
    return true;
  }

  if (pathname === "/admin/profile" || pathname.startsWith("/admin/users")) {
    return user.role === "super_admin";
  }

  if (pathname === "/admin/connect" || pathname.startsWith("/admin/connect/")) {
    return user.role === "super_admin";
  }

  if (user.role === "super_admin") return true;

  return MODULE_SECTIONS.some(
    (s) => canAccessModule(user, s.key) && s.match(pathname),
  );
}

/** After login: home launcher, or direct to sole module */
export function getPostLoginPath(user) {
  const tiles = getModuleTiles(user);
  if (tiles.length === 1) return tiles[0].href;
  return "/admin";
}
