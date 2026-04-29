const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const safeArray = (r) =>
    r.json().then((d) => (Array.isArray(d) ? d : [])).catch(() => []);

// ── Categories ─────────────────────────────────────────────────
export const getCategories = () =>
    fetch(`${API}/api/portfolio/categories`).then(safeArray).catch(() => []);

export const createCategory = (name) =>
    fetch(`${API}/api/portfolio/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
    });

export const updateCategory = (id, name) =>
    fetch(`${API}/api/portfolio/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
    });

export const deleteCategory = (id) =>
    fetch(`${API}/api/portfolio/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

// ── Subcategories ──────────────────────────────────────────────
export const getSubcategories = (categoryId) =>
    fetch(`${API}/api/portfolio/subcategories/${categoryId}`)
        .then(safeArray)
        .catch(() => []);

export const createSubcategory = (name, category_id) =>
    fetch(`${API}/api/portfolio/subcategories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, category_id }),
    });

export const updateSubcategory = (id, name, category_id) =>
    fetch(`${API}/api/portfolio/subcategories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, category_id }),
    });

export const deleteSubcategory = (id) =>
    fetch(`${API}/api/portfolio/subcategories/${id}`, {
        method: "DELETE",
        credentials: "include",
    });

// ── Projects ───────────────────────────────────────────────────
export const getProjects = (subcategoryId) =>
    fetch(`${API}/api/portfolio/projects/${subcategoryId}`)
        .then(safeArray)
        .catch(() => []);

export const createProject = (fd) =>
    fetch(`${API}/api/portfolio/projects`, {
        method: "POST",
        credentials: "include",
        body: fd,
    });

export const updateProject = (id, fd) =>
    fetch(`${API}/api/portfolio/projects/${id}`, {
        method: "PUT",
        credentials: "include",
        body: fd,
    });

export const deleteProject = (id) =>
    fetch(`${API}/api/portfolio/projects/${id}`, {
        method: "DELETE",
        credentials: "include",
    });