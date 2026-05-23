/** Module catalog + permission helpers — keep in sync with backend ADMIN_MODULES */

/** UI columns — Add & Edit are one "write" permission (stored as add + edit in API) */
export const PERMISSION_ACTIONS = [
  { id: "view", label: "View" },
  { id: "write", label: "Add / Edit" },
  { id: "delete", label: "Delete" },
];

export function hasWrite(row) {
  return Boolean(row?.add && row?.edit);
}

export function withSyncedWrite(row) {
  const write = Boolean(row.add || row.edit);
  return { ...row, add: write, edit: write };
}

export const MODULE_CATALOG = [
  { key: "leads", label: "Leads", description: "Contact form submissions" },
  { key: "portfolio", label: "Portfolio", description: "Projects & categories" },
  { key: "career", label: "Career", description: "Jobs & applications" },
  { key: "life", label: "Life Gallery", description: "Culture & events photos" },
  { key: "testimonials", label: "Testimonials", description: "Client reviews" },
  { key: "case_studies", label: "Case Studies", description: "Case studies & categories" },
];

const FULL = { view: true, add: true, edit: true, delete: true };

export function defaultFullPermissions() {
  return { ...FULL };
}

export function defaultViewOnlyPermissions() {
  return { view: true, add: false, edit: false, delete: false };
}

export function emptyPermissions() {
  return { view: false, add: false, edit: false, delete: false };
}

export function normalizeModuleEntry(entry) {
  if (typeof entry === "string") {
    const mod = MODULE_CATALOG.find((m) => m.key === entry);
    if (!mod) return null;
    return { key: entry, ...defaultFullPermissions() };
  }
  if (!entry || typeof entry !== "object") return null;
  const key = entry.key || entry.module;
  if (!MODULE_CATALOG.some((m) => m.key === key)) return null;
  const view = Boolean(entry.view);
  const add = Boolean(entry.add);
  const edit = Boolean(entry.edit);
  const del = Boolean(entry.delete);
  if (!view && !add && !edit && !del) return null;
  const write = add || edit;
  return {
    key,
    view: view || write || del,
    add: write,
    edit: write,
    delete: del,
  };
}

export function normalizeModuleList(input) {
  if (!input) return [];
  const list = Array.isArray(input) ? input : [];
  const out = [];
  const seen = new Set();
  for (const item of list) {
    const row = normalizeModuleEntry(item);
    if (!row || seen.has(row.key)) continue;
    seen.add(row.key);
    out.push(row);
  }
  return out;
}

export function permissionsMapFromUser(user) {
  if (!user) return {};
  if (user.role === "super_admin") {
    const map = {};
    for (const m of MODULE_CATALOG) {
      map[m.key] = defaultFullPermissions();
    }
    return map;
  }
  if (user.permissions && typeof user.permissions === "object") {
    return user.permissions;
  }
  const keys = user.modules || [];
  const map = {};
  for (const key of keys) {
    map[key] = defaultFullPermissions();
  }
  return map;
}

export function canAccessModule(user, moduleKey) {
  if (!user || !moduleKey) return false;
  if (user.role === "super_admin") return true;
  const map = permissionsMapFromUser(user);
  const p = map[moduleKey];
  return Boolean(p?.view || p?.add || p?.edit || p?.delete);
}

export function canPerform(user, moduleKey, action) {
  if (!user || !moduleKey) return false;
  if (user.role === "super_admin") return true;
  const p = permissionsMapFromUser(user)[moduleKey];
  if (!p) return false;
  return Boolean(p[action]);
}

export function buildEmptyMatrix() {
  return MODULE_CATALOG.map((m) => ({
    key: m.key,
    label: m.label,
    enabled: false,
    view: false,
    add: false,
    edit: false,
    delete: false,
  }));
}

export function matrixFromModuleList(list) {
  const normalized = normalizeModuleList(list);
  return MODULE_CATALOG.map((m) => {
    const row = normalized.find((r) => r.key === m.key);
    if (!row) {
      return {
        key: m.key,
        label: m.label,
        enabled: false,
        ...emptyPermissions(),
      };
    }
    return withSyncedWrite({
      key: m.key,
      label: m.label,
      enabled: true,
      view: row.view,
      add: row.add,
      edit: row.edit,
      delete: row.delete,
    });
  });
}

export function moduleListFromMatrix(matrix) {
  return matrix
    .filter((row) => row.enabled)
    .map((row) => ({
      key: row.key,
      view: row.view,
      add: row.add,
      edit: row.edit,
      delete: row.delete,
    }));
}

export function setRowEnabled(row, enabled) {
  if (!enabled) {
    return { ...row, enabled: false, ...emptyPermissions() };
  }
  return {
    ...row,
    enabled: true,
    view: true,
    add: true,
    edit: true,
    delete: true,
  };
}

export function setRowViewOnly(row) {
  return {
    ...row,
    enabled: true,
    view: true,
    add: false,
    edit: false,
    delete: false,
  };
}

export function formatPermissionSummary(list) {
  const normalized = normalizeModuleList(list);
  if (!normalized.length) return "—";
  return normalized
    .map((r) => {
      const write = r.add && r.edit;
      const all = r.view && write && r.delete;
      const viewOnly = r.view && !write && !r.delete;
      if (all) return r.key;
      if (viewOnly) return `${r.key} (view)`;
      const parts = [];
      if (r.view) parts.push("V");
      if (write) parts.push("M");
      if (r.delete) parts.push("D");
      return `${r.key} (${parts.join("")})`;
    })
    .join(", ");
}
