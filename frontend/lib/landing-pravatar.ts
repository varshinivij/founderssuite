/**
 * Pravatar image ids used on the landing page world map (`CommunityStats`).
 * Keep in sync with pin coordinates when adding or reordering pins.
 */
export const LANDING_MAP_AVATAR_PINS = [
  { lon: -122.4, lat: 37.8, imgId: 12 },
  { lon: -74.0, lat: 40.7, imgId: 32 },
  { lon: -46.6, lat: -23.5, imgId: 45 },
  { lon: 2.35, lat: 48.86, imgId: 16 },
  { lon: -0.13, lat: 51.5, imgId: 27 },
  { lon: 3.4, lat: 6.5, imgId: 68 },
  { lon: 139.65, lat: 35.68, imgId: 11 },
  { lon: 103.82, lat: 1.35, imgId: 59 },
  { lon: 151.2, lat: -33.87, imgId: 33 },
] as const;

/** Default headshot for primary demo tester — London pin on landing map (`imgId` 27). */
export const DEFAULT_TESTER_HEADSHOT_IMG_ID = 27;

export function pravatarUrl(imgId: number, size = 128): string {
  return `https://i.pravatar.cc/${size}?img=${imgId}`;
}
