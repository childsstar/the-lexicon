"use client";

import { useEffect, useRef } from "react";

const MAPLIBRE_CSS_URL = "https://unpkg.com/maplibre-gl@5.9.0/dist/maplibre-gl.css";
const MAPLIBRE_JS_URL = "https://unpkg.com/maplibre-gl@5.9.0/dist/maplibre-gl.js";

type MapLibreMap = {
  isStyleLoaded: () => boolean;
  on: (type: "load" | "error", listener: (event?: unknown) => void) => void;
  remove: () => void;
};

type MapLibreModule = {
  Map: new (options: {
    container: HTMLDivElement;
    style: string;
    center: [number, number];
    zoom: number;
  }) => MapLibreMap;
};

let mapLibrePromise: Promise<MapLibreModule> | null = null;

function loadMapLibre() {
  const mapLibreWindow = window as Window & { maplibregl?: MapLibreModule };
  if (mapLibreWindow.maplibregl) return Promise.resolve(mapLibreWindow.maplibregl);

  if (!mapLibrePromise) {
    mapLibrePromise = new Promise<MapLibreModule>((resolve, reject) => {
      if (!document.querySelector(`link[href="${MAPLIBRE_CSS_URL}"]`)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = MAPLIBRE_CSS_URL;
        document.head.appendChild(link);
      }

      const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${MAPLIBRE_JS_URL}"]`);
      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () =>
            mapLibreWindow.maplibregl
              ? resolve(mapLibreWindow.maplibregl)
              : reject(new Error("MapLibre did not initialize.")),
          { once: true },
        );
        existingScript.addEventListener("error", () => reject(new Error("Unable to load MapLibre.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = MAPLIBRE_JS_URL;
      script.async = true;
      script.onload = () =>
        mapLibreWindow.maplibregl
          ? resolve(mapLibreWindow.maplibregl)
          : reject(new Error("MapLibre did not initialize."));
      script.onerror = () => reject(new Error("Unable to load MapLibre."));
      document.head.appendChild(script);
    });
  }

  return mapLibrePromise;
}

export default function DebugMapClient() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let map: MapLibreMap | null = null;
    let cancelled = false;

    loadMapLibre()
      .then((maplibregl) => {
        const container = containerRef.current;
        if (!container || cancelled) return;

        map = new maplibregl.Map({
          container,
          style: `https://api.maptiler.com/maps/019f2eed-09d5-7334-b22d-093217fa9d06/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`,
          center: [-73.9857, 40.7484],
          zoom: 11,
        });

        console.log(map);
        console.log("Map created");

        map.on("load", () => {
          console.log("Style loaded", map?.isStyleLoaded());
        });

        map.on("error", (event) => {
          console.log("Map error", event);
        });
      })
      .catch((error) => {
        console.log("Map error", error);
      });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return <div ref={containerRef} style={{ height: "100vh", width: "100vw" }} />;
}
