export const APP_URL =
  process.env.NODE_ENV === "production"
    ? process.env.APP_URL
    : process.env.APP_DEV_URL;

export const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.API_URL
    : process.env.API_DEV_URL;

export const JWT_SECRET = process.env.JWT_SECRET || "";
