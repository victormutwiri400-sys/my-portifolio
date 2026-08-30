// Axios already provides the browser-compatible build through its package
// exports. Importing its internal CommonJS bundle wrapped the value twice in
// webpack, leaving `axios.create` unavailable at runtime.
import axios from "axios";

// Override this at build time with REACT_APP_API_URL when needed.
// The default is the deployed Flask API. Keep the protocol so Axios treats it
// as an external API origin rather than a relative route on the frontend host.
const configuredOrigin =
  process.env.REACT_APP_API_URL || "https://portfolio-one-weld-84.vercel.app";

const withProtocol = (origin) =>
  /^https?:\/\//i.test(origin) ? origin : `https://${origin}`;

export const apiOrigin = withProtocol(configuredOrigin.trim()).replace(/\/$/, "");

const api = axios.create({
  baseURL: `${apiOrigin}/api`,
  timeout: 20000,
});

export const assetUrl = (path) => {
  if (!path || typeof path !== "string") return "";
  return /^https?:\/\//i.test(path) ? path : `${apiOrigin}${path.startsWith("/") ? path : `/${path}`}`;
};

export const getRequestError = (error, fallback) =>
  error.response?.data?.message ||
  (error.code === "ECONNABORTED" ? "The server took too long to respond. Please try again." : fallback);

export default api;
