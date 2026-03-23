// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};
