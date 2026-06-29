/** Shrink images in the browser so uploads stay under typical nginx limits (~1MB). */

const MAX_DIM = 1600;
const MAX_BYTES = 900_000;
const INITIAL_QUALITY = 0.82;

const outputMime = (file) => {
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  return "image/jpeg";
};

const canvasToBlob = (canvas, mime, quality) =>
  new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mime, quality);
  });

export async function compressImageFile(file, { force = false } = {}) {
  if (!file?.type?.startsWith("image/")) return file;
  if (!force && file.size <= MAX_BYTES) return file;

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  let w = bitmap.width;
  let h = bitmap.height;
  if (w > MAX_DIM || h > MAX_DIM) {
    const scale = Math.min(MAX_DIM / w, MAX_DIM / h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const mime = outputMime(file);
  let quality = INITIAL_QUALITY;
  let blob = await canvasToBlob(canvas, mime, quality);

  while (blob && blob.size > MAX_BYTES && quality > 0.45) {
    quality -= 0.07;
    blob = await canvasToBlob(canvas, mime, quality);
  }

  if (!blob) return file;

  const ext =
    mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const name = file.name.replace(/\.[^.]+$/, "") + `.${ext}`;
  return new File([blob], name, { type: mime, lastModified: Date.now() });
}

export async function compressImageFiles(files) {
  if (!files?.length) return [];
  return Promise.all(files.map(compressImageFile));
}
