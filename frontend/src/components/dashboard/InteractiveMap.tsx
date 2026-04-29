"use client";

import React, { useState } from "react";
import { Map, MapMarker, MarkerContent, MarkerPopup } from "../ui/map";
import { MapPin, ShieldAlert } from "lucide-react";
import { ThemeProvider } from "next-themes";

interface InteractiveMapProps {
  emergencies?: any[];
}

export default function InteractiveMap({ emergencies = [] }: InteractiveMapProps) {
  // College Campus default center (e.g. MIT Campus)
  const defaultCenter = { lng: -71.0942, lat: 42.3601 };
  
  // Map string locations to very tight campus coordinates (within a few hundred feet)
  const getCoordinatesForLocation = (locationName: string) => {
    let hash = 0;
    for (let i = 0; i < locationName.length; i++) {
      hash = locationName.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Very small offset to keep it within the same college campus
    const offsetLng = (hash % 100) / 40000;
    const offsetLat = ((hash >> 2) % 100) / 40000;
    
    return {
      lng: defaultCenter.lng + offsetLng,
      lat: defaultCenter.lat + offsetLat
    };
  };

  return (
    // Wrap in ThemeProvider so useTheme() hook inside Map doesn't error out
    <ThemeProvider defaultTheme="dark" attribute="class">
      <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-red-900/30 relative">
        <Map center={[defaultCenter.lng, defaultCenter.lat]} zoom={16.8} pitch={55}>
          {emergencies.map((alert) => {
            const coords = getCoordinatesForLocation(alert.location);
            return (
              <MapMarker
                key={alert.id}
                longitude={coords.lng}
                latitude={coords.lat}
              >
                <MarkerContent>
                  <div className="relative cursor-pointer">
                    <div className="absolute -inset-2 bg-red-500/20 rounded-full animate-ping" />
                    <div className="bg-red-500 p-2 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                      <ShieldAlert className="text-white w-4 h-4" />
                    </div>
                  </div>
                </MarkerContent>
                <MarkerPopup className="bg-red-950/90 border border-red-900 min-w-[200px]">
                  <div className="space-y-1">
                    <p className="font-bold text-red-200">{alert.type} Emergency</p>
                    <p className="text-sm text-red-100/70">{alert.location}</p>
                    <p className="text-xs text-red-500/50 mt-2 flex justify-between">
                      <span>Reported: {alert.time}</span>
                    </p>
                  </div>
                </MarkerPopup>
              </MapMarker>
            );
          })}
          
          {/* Main Venue Marker */}
          <MapMarker longitude={defaultCenter.lng} latitude={defaultCenter.lat}>
            <MarkerContent>
              <div className="text-blue-500">
                <MapPin className="fill-blue-600 stroke-white w-8 h-8" />
              </div>
            </MarkerContent>
            <MarkerPopup>
              <p className="font-bold text-white">Main Admin Center</p>
              <p className="text-xs text-gray-400">Campus HQ</p>
            </MarkerPopup>
          </MapMarker>
          
        </Map>
      </div>
    </ThemeProvider>
  );
}
