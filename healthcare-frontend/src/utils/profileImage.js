import { DEFAULT_AVATAR } from "./constants";

const INTERNAL_BACKEND_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "api-gateway",
  "host.docker.internal",
]);

export const appendCacheBust = (url, token = Date.now()) => {
  if (!url) return "";
  if (url.includes("t=")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}t=${token}`;
};

const withApiPrefix = (rawPath) => {
  if (!rawPath) return "";
  const normalized = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  if (normalized.startsWith("/api/")) return normalized;
  if (normalized.startsWith("/uploads/")) return `/api${normalized}`;
  return normalized;
};

export const resolveProfileImageUrl = (value, timestamp = Date.now()) => {
  if (!value) return DEFAULT_AVATAR;

  const normalized = String(value).trim();
  if (!normalized) return DEFAULT_AVATAR;
  if (normalized.startsWith("data:")) return normalized;

  if (/^https?:\/\//i.test(normalized)) {
    try {
      const parsed = new URL(normalized);
      if (INTERNAL_BACKEND_HOSTS.has(parsed.hostname)) {
        const mappedPath = withApiPrefix(parsed.pathname);
        return appendCacheBust(
          `${mappedPath}${parsed.search || ""}`,
          timestamp,
        );
      }
      return appendCacheBust(normalized, timestamp);
    } catch (_) {
      return appendCacheBust(normalized, timestamp);
    }
  }

  if (normalized.startsWith("/")) {
    return appendCacheBust(withApiPrefix(normalized), timestamp);
  }

  if (normalized.startsWith("uploads/")) {
    return appendCacheBust(`/api/${normalized}`, timestamp);
  }

  if (normalized.startsWith("api/")) {
    return appendCacheBust(`/${normalized}`, timestamp);
  }

  return appendCacheBust(normalized, timestamp);
};
