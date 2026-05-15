import type { CommunityPost } from "@/types";

const STORAGE_KEY = "fs_tester_community_extra_v1";

export function loadTesterCommunityExtraPosts(): CommunityPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CommunityPost[]) : [];
  } catch {
    return [];
  }
}

export function prependTesterCommunityExtraPost(post: CommunityPost): void {
  const next = [post, ...loadTesterCommunityExtraPosts()];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
