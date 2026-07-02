"use client";

import { useEffect, useRef, useState } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
  }
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export default function LocationInput({ value, onChange, placeholder = "Williamstown, Melbourne", className = "", error = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) return; // No key — plain input fallback

    // Already loaded
    if (window.google?.maps?.places) {
      setMapsLoaded(true);
      return;
    }

    // Load script once
    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => setMapsLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapsLoaded(true);
    document.head.appendChild(script);
  }, [apiKey]);

  useEffect(() => {
    if (!mapsLoaded || !inputRef.current || autocompleteRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["geocode", "establishment"],
      componentRestrictions: { country: "au" }, // Restrict to Australia
      fields: ["formatted_address", "name", "geometry"],
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (place) {
        // Prefer a short suburb+city format
        const formatted = place.name && place.formatted_address
          ? `${place.name}, ${place.formatted_address.split(",").slice(-3, -1).join(",").trim()}`
          : place.formatted_address ?? place.name ?? "";
        onChange(formatted);
      }
    });
  }, [mapsLoaded, onChange]);

  const baseCls = "w-full border rounded-[6px] px-4 py-3 text-sm text-[#1a1a1a] placeholder-[#c8c0b4] focus:outline-none bg-white transition-colors";
  const borderCls = error
    ? "border-red-400 focus:border-red-500"
    : "border-[#e4dfd5] focus:border-[#006644]";

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${baseCls} ${borderCls} ${className}`}
        autoComplete="off"
      />
    </div>
  );
}
