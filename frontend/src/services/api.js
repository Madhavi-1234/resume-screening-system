import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ars_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  signup: (payload) => api.post("/auth/signup", payload),
  login: (payload) => api.post("/auth/login", payload),
};

export const screeningApi = {
  analyze: ({ jobDescription, resumes, jdFile }) => {
    const formData = new FormData();
    formData.append("job_description", jobDescription);
    resumes.forEach((file) => formData.append("files", file));
    if (jdFile) {
      formData.append("job_description_file", jdFile);
    }
    return api.post("/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getResults: (params) => api.get("/results", { params }),
  getCandidate: (id) => api.get(`/candidate/${id}`),
  exportResults: () =>
    api.get("/results/export", {
      responseType: "blob",
    }),
};

export default api;
