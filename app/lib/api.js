// lib/api.js
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
    throw new Error(data.message || `Request failed: ${res.status}`);
  }

  return data;
}

export const api = {
  get:    (endpoint, options = {}) => request(endpoint, { method: "GET", ...options }),
  post:   (endpoint, body, options = {}) => request(endpoint, { method: "POST",   body: JSON.stringify(body), ...options }),
  put:    (endpoint, body, options = {}) => request(endpoint, { method: "PUT",    body: JSON.stringify(body), ...options }),
  patch:  (endpoint, body, options = {}) => request(endpoint, { method: "PATCH",  body: JSON.stringify(body), ...options }),
  delete: (endpoint, options = {})       => request(endpoint, { method: "DELETE", ...options }),

  // ✅ For file uploads — browser sets Content-Type with boundary automatically
  upload: (endpoint, formData, method = "POST") =>
    request(endpoint, { method, body: formData }),
};