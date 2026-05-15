export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const ML_API_URL =
  process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8001";

export const INTERVIEW_API_URL =
  process.env.NEXT_PUBLIC_INTERVIEW_API_URL || "http://localhost:8000";

export const INTERVIEW_APP_URL =
  process.env.NEXT_PUBLIC_INTERVIEW_APP_URL || "http://localhost:5173";

/**
 * Default to mock data until explicitly disabled.
 * Set `NEXT_PUBLIC_USE_MOCK=false` to force real API calls.
 */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

// Fine-grained toggles (default to mock unless explicitly disabled)
export const USE_MOCK_FORMS =
  process.env.NEXT_PUBLIC_USE_MOCK_FORMS !== "false";
export const USE_MOCK_AGENTS =
  process.env.NEXT_PUBLIC_USE_MOCK_AGENTS !== "false";
export const USE_MOCK_USERS =
  process.env.NEXT_PUBLIC_USE_MOCK_USERS !== "false";
export const USE_MOCK_ML =
  process.env.NEXT_PUBLIC_USE_MOCK_ML !== "false";
export const USE_MOCK_INTERVIEW =
  process.env.NEXT_PUBLIC_USE_MOCK_INTERVIEW !== "false";

