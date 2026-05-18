import { api, uploadWithProgress } from "@/lib/api";

const BASE_URL = "/api/life/admin/items";

const parseGallery = (gallery) => {
  if (Array.isArray(gallery)) return gallery;
  if (typeof gallery === "string") {
    try {
      return JSON.parse(gallery);
    } catch {
      return [];
    }
  }
  return [];
};

const buildFormData = (form, { includeGalleryFiles = true } = {}) => {
  const data = new FormData();
  data.append("category", form.category);
  data.append("category_title", form.category_title);
  data.append("year", form.year);
  data.append("description", form.description || "");
  data.append("sort_order", form.sort_order || 0);
  data.append("is_active", form.is_active ? 1 : 0);

  if (form.banner) data.append("banner", form.banner);

  if (form.existingGallery?.length) {
    data.append("current_gallery", JSON.stringify(form.existingGallery));
  }

  if (includeGalleryFiles && form.galleryFiles?.length) {
    form.galleryFiles.forEach((file) => data.append("gallery", file));
  }

  return data;
};

const buildGalleryFormData = (files) => {
  const data = new FormData();
  files.forEach((file) => data.append("gallery", file));
  return data;
};

export async function getAllLifeUploadedImages() {
  return api.get("/api/life/admin/images");
}

export async function getLifeItems() {
  return api.get(BASE_URL);
}

export async function getLifeItem(id) {
  return api.get(`${BASE_URL}/${id}`);
}

export async function createLifeItem(form, { onProgress } = {}) {
  return uploadWithProgress(
    BASE_URL,
    buildFormData(form),
    "POST",
    onProgress,
  );
}

/** Update metadata / banner / kept gallery URLs — not new image files. */
export async function updateLifeItem(id, form, { onProgress } = {}) {
  return uploadWithProgress(
    `${BASE_URL}/${id}`,
    buildFormData(form, { includeGalleryFiles: false }),
    "PUT",
    onProgress,
  );
}

/** Add new photos only (does not re-upload existing). */
export async function appendGalleryImages(id, files, { onProgress } = {}) {
  if (!files?.length) return null;
  return uploadWithProgress(
    `${BASE_URL}/${id}/gallery`,
    buildGalleryFormData(files),
    "POST",
    onProgress,
  );
}

export async function removeGalleryImages(id, urls) {
  return api.delete(`${BASE_URL}/${id}/gallery`, { urls });
}

export async function deleteLifeItem(id) {
  return api.delete(`${BASE_URL}/${id}`);
}

export { parseGallery };
