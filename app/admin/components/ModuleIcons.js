const icons = {
  leads: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" strokeLinecap="round" />
    </svg>
  ),
  portfolio: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" strokeLinejoin="round" />
    </svg>
  ),
  career: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeLinecap="round" />
      <path d="M12 12v2M8 12h8" strokeLinecap="round" />
    </svg>
  ),
  life: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none" />
      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  testimonials: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M7 8h10M7 12h6" strokeLinecap="round" />
      <path d="M6 3h12a3 3 0 013 3v11l-3-2H6a3 3 0 01-3-3V6a3 3 0 013-3z" strokeLinejoin="round" />
    </svg>
  ),
  case_studies: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 19V5a2 2 0 012-2h12a2 2 0 012 2v14" strokeLinecap="round" />
      <path d="M8 17v-4M12 17V9M16 17v-6" strokeLinecap="round" />
    </svg>
  ),
};

export function ModuleIcon({ moduleKey, className }) {
  return (
    <span className={className} aria-hidden>
      {icons[moduleKey] || icons.leads}
    </span>
  );
}

export const MODULE_THEMES = {
  leads: {
    accent: "#0ea5e9",
    glow: "rgba(14, 165, 233, 0.35)",
    bg: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)",
  },
  portfolio: {
    accent: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.35)",
    bg: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)",
  },
  career: {
    accent: "#10b981",
    glow: "rgba(16, 185, 129, 0.35)",
    bg: "linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)",
  },
  life: {
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.35)",
    bg: "linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)",
  },
  testimonials: {
    accent: "#ec4899",
    glow: "rgba(236, 72, 153, 0.35)",
    bg: "linear-gradient(135deg, #fce7f3 0%, #fdf2f8 100%)",
  },
  case_studies: {
    accent: "#6366f1",
    glow: "rgba(99, 102, 241, 0.35)",
    bg: "linear-gradient(135deg, #e0e7ff 0%, #eef2ff 100%)",
  },
};
