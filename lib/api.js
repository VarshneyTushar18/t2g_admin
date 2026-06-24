/** Optional direct backend URL for uploads (bypasses Next.js/nginx proxy size limits). */
const uploadBaseUrl = () => {
  const direct = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return direct ? direct.replace(/\/$/, "") : "";
};

const resolveUploadUrl = (endpoint) => {
  const base = uploadBaseUrl();
  return base ? `${base}${endpoint}` : endpoint;
};

async function request(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;
  const res = await fetch(endpoint, {
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    ...options,
  });
  let data = null;
  let rawText = "";
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    rawText = await res.text();
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    if (res.status === 413) {
      throw new Error(
        data?.error ||
          data?.message ||
          "Upload too large. Try fewer or smaller images, or ask ops to raise the server upload limit.",
      );
    }
    const message =
      data?.message ||
      data?.error ||
      (rawText && !rawText.startsWith("<!DOCTYPE")
        ? rawText.slice(0, 200)
        : `Request failed: ${res.status}`);
    throw new Error(message);
  }
  return data ?? {};
}

/** Upload with real byte progress (XHR). onProgress(0–100). */
export function uploadWithProgress(endpoint, formData, method = "POST", onProgress) {
  const url = resolveUploadUrl(endpoint);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.withCredentials = true;

    xhr.upload.addEventListener("progress", (e) => {
      if (!e.lengthComputable || !onProgress) return;
      // Cap at 90% until server finishes (compress + Cloudinary)
      onProgress(Math.min(90, Math.round((e.loaded / e.total) * 90)));
    });

    xhr.upload.addEventListener("load", () => {
      onProgress?.(92);
    });

    xhr.addEventListener("load", () => {
      let data;
      try {
        data = JSON.parse(xhr.responseText || "{}");
      } catch {
        reject(new Error("Invalid server response"));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve(data);
      } else {
        if (xhr.status === 413) {
          reject(
            new Error(
              data.error ||
                data.message ||
                "Upload too large. Try fewer or smaller images, or ask ops to raise the server upload limit.",
            ),
          );
          return;
        }
        reject(
          new Error(data.message || data.error || `Request failed: ${xhr.status}`),
        );
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
    xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

    xhr.send(formData);
  });
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options = {}) =>
    request(endpoint, { method: "POST", body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options = {}) =>
    request(endpoint, { method: "PUT", body: JSON.stringify(body), ...options }),
  patch: (endpoint, body, options = {}) =>
    request(endpoint, { method: "PATCH", body: JSON.stringify(body), ...options }),
  delete: (endpoint, body) =>
    request(endpoint, {
      method: "DELETE",
      ...(body != null ? { body: JSON.stringify(body) } : {}),
    }),
  upload: (endpoint, formData, method = "POST") =>
    request(resolveUploadUrl(endpoint), { method, body: formData }),
  uploadWithProgress,
};
