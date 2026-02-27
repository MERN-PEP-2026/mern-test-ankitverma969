import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
});

const getNetworkContext = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isCellular = connection?.type === "cellular";

  return {
    provider: isCellular
      ? "Mobile network (provider hidden by browser privacy)"
      : "private network",
    networkType: connection?.type || "unknown",
    effectiveType: connection?.effectiveType || "unknown",
    rtt: connection?.rtt ?? "",
    downlink: connection?.downlink ?? ""
  };
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const network = getNetworkContext();
  config.headers["X-Network-Provider"] = network.provider;
  config.headers["X-Network-Type"] = network.networkType;
  config.headers["X-Network-Effective-Type"] = network.effectiveType;
  config.headers["X-Network-RTT"] = String(network.rtt);
  config.headers["X-Network-Downlink"] = String(network.downlink);

  return config;
});

export const registerStudent = (payload) => api.post("/auth/register", payload);
export const loginStudent = (payload) => api.post("/auth/login", payload);
export const createCourse = (payload) => api.post("/courses", payload);
export const getCourses = (params = "") => {
  if (typeof params === "string") {
    return api.get(`/courses?search=${encodeURIComponent(params)}`);
  }

  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  return api.get(queryString ? `/courses?${queryString}` : "/courses");
};
export const updateCourse = (id, payload) => api.put(`/courses/${id}`, payload);
export const toggleCoursePin = (id) => api.patch(`/courses/${id}/pin`);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);
export const getMyActivityLogs = (limit = 20) => api.get(`/activity/me?limit=${limit}`);

export default api;
