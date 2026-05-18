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
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `Request failed: ${res.status}`);
  }
  return data;
}

/** Upload with real byte progress (XHR). onProgress(0–100). */
export function uploadWithProgress(endpoint, formData, method = "POST", onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, endpoint, true);
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
    request(endpoint, { method, body: formData }),
  uploadWithProgress,
};
