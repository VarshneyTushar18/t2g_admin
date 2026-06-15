import { emptyBlogSeo } from "../services/blogService";

export const emptyBlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  status: "publish",
  author_name: "",
  featured_image: "",
  featuredImageFile: null,
  categories: [],
  tags: [],
  seo: { ...emptyBlogSeo },
};

export function defaultAuthorName(user) {
  return user?.email?.split("@")[0]?.replace(/[._]/g, " ") || "";
}

export function postToForm(item) {
  return {
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt || "",
    content: item.content || "",
    status: item.status || "publish",
    author_name: item.author || item.author_name || "",
    featured_image: item.featured_image || "",
    featuredImageFile: null,
    categories: item.categories || [],
    tags: Array.isArray(item.tags) ? item.tags : [],
    seo: { ...emptyBlogSeo, ...(item.seo || {}) },
  };
}

export function createEmptyForm(user) {
  return {
    ...emptyBlogForm,
    seo: { ...emptyBlogSeo },
    author_name: defaultAuthorName(user),
  };
}
