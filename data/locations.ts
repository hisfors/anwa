/** Reference coordinates. Al Qua'a is the home site; the cities are darkness comparisons. */

export interface GeoPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

/**
 * Al Qua'a, a rural camel-farming district south of Al Ain, Abu Dhabi emirate.
 * The Tropic of Cancer (23.4368 N) runs through the area, so the Galactic Centre
 * climbs unusually high here in season. Coordinates are approximate to the district.
 */
export const AL_QUAA: GeoPoint = {
  id: "alquaa",
  name: "Al Qua'a",
  latitude: 23.52,
  longitude: 55.49,
};

export const REFERENCE_CITIES: GeoPoint[] = [
  { id: "alain", name: "Al Ain", latitude: 24.2075, longitude: 55.7447 },
  { id: "abudhabi", name: "Abu Dhabi", latitude: 24.4539, longitude: 54.3773 },
  { id: "dubai", name: "Dubai", latitude: 25.2048, longitude: 55.2708 },
];

export const TROPIC_OF_CANCER = 23.4368;
