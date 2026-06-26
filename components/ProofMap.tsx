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
          `<div style="font-size:11px;line-height:1.5"><b style="color:#E8B873">${p.name}</b><br/>${p.sqm.toFixed(1)} mag/arcsec&sup2; · Bortle ${p.bortle}</div>`,
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
      <div ref={containerRef} className="h-[420px] w-full" />
      <div className="border-t border-sage/15 px-4 py-3">
        {pin ? (
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-sage">
              Pinned {pin.lat.toFixed(3)}N {pin.lon.toFixed(3)}E · nearest reference {pin.nearest.name} ({pin.distanceKm.toFixed(0)} km)
            </p>
            <p className="font-body text-sm text-bone">
              Bortle {pin.nearest.bortle} from the nearest published reference point.{" "}
              Estimated sky brightness{" "}
              <span className="figure text-brass">{pin.nearest.sqm.toFixed(1)}</span>
              <span className="text-sage"> mag/arcsec&sup2;</span>.{" "}
              <span className="text-sage-light">
                This figure is the midpoint of that class&apos;s standard range (
                {pin.nearest.sqmRange[0].toFixed(1)} to {pin.nearest.sqmRange[1].toFixed(1)}), not a
                measured value. Method on the Methods page.
              </span>
            </p>
          </div>
        ) : (
          <p className="font-body text-sm text-sage-light">
            Click anywhere on the map to drop a pin. Anwa returns the darkness of the
            nearest published reference point, labelled as derived. Markers: green is
            dark, orange is a bright city.
          </p>
        )}
      </div>
    </div>
  );
}
