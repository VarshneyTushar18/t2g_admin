import { emptyBlogSeo, emptyBlogSocialShare } from "../services/blogService";

export const emptyBlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  status: "publish",
  author_name: "",
  featured_image: "",
  featured_image_title: "",
  featured_image_alt: "",
  featuredImageFile: null,
  categories: [],
  tags: [],
  seo: { ...emptyBlogSeo },
  social_share: Object.fromEntries(
    Object.keys(emptyBlogSocialShare).map((platform) => [
      platform,
      { ...emptyBlogSocialShare[platform] },
    ]),
  ),
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
    featured_image_title: item.featured_image_title || "",
    featured_image_alt: item.featured_image_alt || "",
    featuredImageFile: null,
    categories: item.categories || [],
    tags: Array.isArray(item.tags) ? item.tags : [],
    seo: { ...emptyBlogSeo, ...(item.seo || {}) },
    social_share: Object.fromEntries(
      Object.keys(emptyBlogSocialShare).map((platform) => [
        platform,
        {
          ...emptyBlogSocialShare[platform],
          ...(item.social_share?.[platform] || {}),
        },
      ]),
    ),
  };
}

export function createEmptyForm(user) {
  return {
    ...emptyBlogForm,
    seo: { ...emptyBlogSeo },
    author_name: defaultAuthorName(user),
  };
}
