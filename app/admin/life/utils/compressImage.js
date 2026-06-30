/** Shrink images in the browser so uploads stay under typical nginx limits (~1MB). */

const MAX_DIM = 1600;
const FEATURED_MAX_DIM = 1400;
/** Stay under common nginx client_max_body_size (1MB) including multipart overhead. */
const MAX_BYTES = 750_000;
const INITIAL_QUALITY = 0.82;

const outputMime = (file, { force = false } = {}) => {
  if (force) return "image/jpeg";
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  return "image/jpeg";
};

const canvasToBlob = (canvas, mime, quality) =>
  new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mime, quality);
  });

const drawScaled = (bitmap, maxDim) => {
  let w = bitmap.width;
  let h = bitmap.height;
  if (w > maxDim || h > maxDim) {
    const scale = Math.min(maxDim / w, maxDim / h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
  return canvas;
};

const compressCanvas = async (canvas, mime, maxBytes) => {
  let quality = INITIAL_QUALITY;
  let blob = await canvasToBlob(canvas, mime, quality);

  while (blob && blob.size > maxBytes && quality > 0.4) {
    quality -= 0.07;
    blob = await canvasToBlob(canvas, mime, quality);
  }

  // PNG ignores quality — fall back to JPEG when still too large.
  if (blob && blob.size > maxBytes && mime !== "image/jpeg") {
    quality = INITIAL_QUALITY;
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
    while (blob && blob.size > maxBytes && quality > 0.4) {
      quality -= 0.07;
      blob = await canvasToBlob(canvas, "image/jpeg", quality);
    }
    mime = "image/jpeg";
  }

  return { blob, mime };
};

export async function compressImageFile(file, { force = false } = {}) {
  if (!file?.type?.startsWith("image/")) return file;
  if (!force && file.size <= MAX_BYTES) return file;

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const maxDim = force ? FEATURED_MAX_DIM : MAX_DIM;
  let canvas = drawScaled(bitmap, maxDim);
  bitmap.close();

  let mime = outputMime(file, { force });
  let { blob, mime: outMime } = await compressCanvas(canvas, mime, MAX_BYTES);
  mime = outMime;

  // Last resort for featured uploads: shrink dimensions until under limit.
  if (force && blob && blob.size > MAX_BYTES) {
    let dim = Math.min(canvas.width, canvas.height);
    while (blob && blob.size > MAX_BYTES && dim > 720) {
      dim = Math.round(dim * 0.85);
      const scale = dim / Math.max(canvas.width, canvas.height);
      const w = Math.max(1, Math.round(canvas.width * scale));
      const h = Math.max(1, Math.round(canvas.height * scale));
      const smaller = document.createElement("canvas");
      smaller.width = w;
      smaller.height = h;
      smaller.getContext("2d").drawImage(canvas, 0, 0, w, h);
      canvas = smaller;
      ({ blob, mime: outMime } = await compressCanvas(canvas, "image/jpeg", MAX_BYTES));
      mime = outMime;
    }
  }

  if (!blob) return file;

  const ext =
    mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const name = file.name.replace(/\.[^.]+$/, "") + `.${ext}`;
  return new File([blob], name, { type: mime, lastModified: Date.now() });
}

export async function compressImageFiles(files) {
  if (!files?.length) return [];
  return Promise.all(files.map((f) => compressImageFile(f)));
}
