// API URL Configuration
const API_URLS = {
  LOCAL: "http://localhost:3000",
  STAGING: "https://stage-api.daftarpro.com",
  PRODUCTION: "https://api.daftarpro.com",
};

const PRODUCTION_DOMAINS = [
  "https://www.daftarpro.com",
  "www.daftarpro.com",
  "https://daftarpro.com",
  "http://daftarpro.com",
  "http://daftarpro.com",
];

// Environment detection
const getBaseUrl = () => {
  const location = window.location.origin;

  // Check if running in production
  if (PRODUCTION_DOMAINS.includes(location)) {
    return API_URLS.PRODUCTION;
  }

  // Check if running on localhost
  if (location.includes("localhost") || location.includes("127.0.0.1")) {
    return API_URLS.LOCAL;
  }

  // Default to staging for all other domains
  return API_URLS.STAGING;
};

export const BASE_URL = getBaseUrl();
