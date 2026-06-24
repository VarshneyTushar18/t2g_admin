import { api, uploadWithProgress } from "@/lib/api";

const BASE_URL = "/api/life/admin/items";

/** Images per gallery upload request (keeps each request under typical nginx limits). */
const GALLERY_UPLOAD_BATCH_SIZE = 8;

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

/** Upload gallery files in chunks so one huge multipart body does not hit 413. */
export async function appendGalleryImagesInBatches(id, files, { onProgress } = {}) {
  if (!files?.length) return null;

  const batches = [];
  for (let i = 0; i < files.length; i += GALLERY_UPLOAD_BATCH_SIZE) {
    batches.push(files.slice(i, i + GALLERY_UPLOAD_BATCH_SIZE));
  }

  let lastResult = null;
  const total = files.length;
  let uploaded = 0;

  for (const batch of batches) {
    lastResult = await uploadWithProgress(
      `${BASE_URL}/${id}/gallery`,
      buildGalleryFormData(batch),
      "POST",
      (p) => {
        if (!onProgress) return;
        const done = uploaded + (batch.length * p) / 100;
        onProgress(Math.min(100, Math.round((done / total) * 100)));
      },
    );
    uploaded += batch.length;
    onProgress?.(Math.min(100, Math.round((uploaded / total) * 100)));
  }

  return lastResult;
}

export async function getAllLifeUploadedImages() {
  return api.get("/api/life/admin/images");
}

export async function getLifeItems() {
  return api.get(BASE_URL);
}

export async function getLifeItem(id) {
  return api.get(`${BASE_URL}/${id}`);
}

/** Create item: banner first, then gallery in batches (avoids 413 on large folders). */
export async function createLifeItem(form, { onProgress } = {}) {
  const galleryFiles = form.galleryFiles || [];
  const hasGallery = galleryFiles.length > 0;

  const res = await uploadWithProgress(
    BASE_URL,
    buildFormData({ ...form, galleryFiles: [] }, { includeGalleryFiles: false }),
    "POST",
    (p) => onProgress?.(hasGallery ? Math.round(p * 15) : p),
  );

  const id = res?.data?.id;
  if (id && hasGallery) {
    await appendGalleryImagesInBatches(id, galleryFiles, {
      onProgress: (p) => onProgress?.(15 + Math.round(p * 0.85)),
    });
  }

  return res;
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
  return appendGalleryImagesInBatches(id, files, { onProgress });
}

export async function removeGalleryImages(id, urls) {
  return api.delete(`${BASE_URL}/${id}/gallery`, { urls });
}

export async function deleteLifeItem(id) {
  return api.delete(`${BASE_URL}/${id}`);
}

export { parseGallery };
