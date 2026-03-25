/**
 * In-memory store — swap out for a real DB (Postgres, Supabase, etc.) in prod.
 * All collections are plain Maps keyed by ID.
 */
import type { User, UserStory, Agent, ValidationForm, Match, PaymentRecord } from "./types/index.js";

export const db = {
  users: new Map<string, User>(),
  stories: new Map<string, UserStory>(),
  agents: new Map<string, Agent>(),
  forms: new Map<string, ValidationForm>(),
  matches: new Map<string, Match>(),
  payments: new Map<string, PaymentRecord>(),
};
