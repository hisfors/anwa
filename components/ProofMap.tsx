"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { DARKNESS_POINTS, type DarknessPoint } from "@/data/darkness";

function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function markerColor(bortle: number): string {
  if (bortle <= 2) return "#7FA98F"; // dark, brand green
  if (bortle <= 4) return "#D9A864"; // brass
  if (bortle <= 6) return "#E8B873";
  return "#C2603A"; // bright city, the encroaching orange
}

interface PinInfo {
  lat: number;
  lon: number;
  nearest: DarknessPoint;
  distanceKm: number;
}

export default function ProofMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const [pin, setPin] = useState<PinInfo | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pinMarker: { remove: () => void } | null = null;

    (async () => {
      const maplibre = (await import("maplibre-gl")).default;
      if (cancelled || !containerRef.current) return;

      const map = new maplibre.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            carto: {
              type: "raster",
              tiles: [
                "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
                "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
                "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
            },
          },
          layers: [
            {
              id: "carto",
              type: "raster",
              source: "carto",
              paint: { "raster-hue-rotate": 70, "raster-saturation": -0.25, "raster-brightness-max": 0.9 },
            },
          ],
        },
        center: [55.0, 24.0],
        zoom: 7.2,
        attributionControl: { compact: true },
      });
      mapRef.current = map;
      map.addControl(new maplibre.NavigationControl({ showCompass: false }), "top-right");

      for (const p of DARKNESS_POINTS) {
        const el = document.createElement("div");
        el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${markerColor(p.bortle)};border:2px solid #0B0F0D;box-shadow:0 0 0 1px ${markerColor(p.bortle)};cursor:pointer`;
        const popup = new maplibre.Popup({ offset: 14, closeButton: false }).setHTML(
          `<div style="font-size:12px;line-height:1.5"><b style="color:#E8B873">${p.name}</b><br/>Sky darkness ${p.sqm.toFixed(1)} · Bortle ${p.bortle} of 9</div>`,
        );
        new maplibre.Marker({ element: el }).setLngLat([p.longitude, p.latitude]).setPopup(popup).addTo(map);
      }

      map.on("click", (e: { lngLat: { lat: number; lng: number } }) => {
        const { lat, lng } = e.lngLat;
        let nearest = DARKNESS_POINTS[0];
        let best = Infinity;
        for (const p of DARKNESS_POINTS) {
          const d = haversineKm(lat, lng, p.latitude, p.longitude);
          if (d < best) {
            best = d;
            nearest = p;
          }
        }
        setPin({ lat, lon: lng, nearest, distanceKm: best });
        if (pinMarker) pinMarker.remove();
        const el = document.createElement("div");
        el.style.cssText =
          "width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:14px solid #E8E6DC";
        pinMarker = new maplibre.Marker({ element: el, anchor: "bottom" }).setLngLat([lng, lat]).addTo(map);
      });
    })();

    return () => {
      cancelled = true;
      const m = mapRef.current as { remove?: () => void } | null;
      if (m?.remove) m.remove();
    };
  }, []);

  return (
    <div className="panel overflow-hidden">
      <div ref={containerRef} className="h-[560px] w-full" />
      <div className="border-t border-sage/15 px-4 py-3">
        {pin ? (
          <div className="flex flex-col gap-1.5">
            <p className="font-body text-sm text-sage">
              Pinned at {pin.lat.toFixed(3)}N {pin.lon.toFixed(3)}E. Nearest reference point: {pin.nearest.name}, about {pin.distanceKm.toFixed(0)} km away.
            </p>
            <p className="font-body text-sm text-bone">
              Around here the sky darkness is roughly{" "}
              <span className="figure text-brass">{pin.nearest.sqm.toFixed(1)}</span>
              <span className="text-sage"> (a higher number means a darker sky)</span>, which is
              Bortle {pin.nearest.bortle} of 9 (1 is the darkest).{" "}
              <span className="text-sage-light">
                This is an estimate based on the nearest reference point.
              </span>
            </p>
          </div>
        ) : (
          <p className="font-body text-sm text-sage-light">
            Tap anywhere on the map to drop a pin and see how dark that spot is.
          </p>
        )}
      </div>
    </div>
  );
}
