'use client';

import React, { useEffect, useRef } from 'react';
import { useLanguage, translateCrop } from '@/context/LanguageContext';

interface Coordinate {
  lat: number;
  lng: number;
}

interface InteractiveFarmMapProps {
  coordinates: Coordinate[];
  centroid: [number, number];
  meanNdvi: number;
  plotName: string;
  cropName: string;
  areaAcres?: number;
}

export const InteractiveFarmMap: React.FC<InteractiveFarmMapProps> = ({
  coordinates,
  centroid,
  meanNdvi,
  plotName,
  cropName,
  areaAcres,
}) => {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polygonLayerRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  // 1. Initialize Map ONCE on mount
  useEffect(() => {
    let isMounted = true;

    const setupLeaflet = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return; // already initialized

      const L = (await import('leaflet')).default;
      leafletRef.current = L;

      // Fix default marker icon assets
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!isMounted || !mapContainerRef.current) return;

      const safeCentroid: [number, number] =
        Array.isArray(centroid) && !isNaN(centroid[0]) && !isNaN(centroid[1])
          ? centroid
          : [16.2435, 80.6402];

      const map = L.map(mapContainerRef.current, {
        center: safeCentroid,
        zoom: 16,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Initial layer render
      updateMapLayers(L, map, coordinates, safeCentroid, meanNdvi, plotName, cropName, areaAcres);
    };

    setupLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        polygonLayerRef.current = null;
        markerLayerRef.current = null;
      }
    };
  }, []);

  // 2. Update layers, re-center, and animate whenever selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    const safeCentroid: [number, number] =
      Array.isArray(centroid) && !isNaN(centroid[0]) && !isNaN(centroid[1])
        ? centroid
        : [16.2435, 80.6402];

    updateMapLayers(L, map, coordinates, safeCentroid, meanNdvi, plotName, cropName, areaAcres);
  }, [centroid, coordinates, meanNdvi, plotName, cropName, areaAcres]);

  const updateMapLayers = (
    L: any,
    map: any,
    coords: Coordinate[],
    cent: [number, number],
    ndvi: number,
    pName: string,
    cName: string,
    acres?: number
  ) => {
    // Determine NDVI color
    let fillColor = '#10B981'; // Green (>= 0.60)
    let strokeColor = '#065F46';
    if (ndvi < 0.30) {
      fillColor = '#EF4444'; // Red
      strokeColor = '#991B1B';
    } else if (ndvi < 0.60) {
      fillColor = '#F59E0B'; // Amber
      strokeColor = '#B45309';
    }

    // Close a map-level popup before removing its owning feature layer; Leaflet
    // keeps opened popups on the map after their polygon is removed.
    map.closePopup();

    // Smoothly flyTo / re-center the map to the selected parcel
    map.flyTo(cent, 16, {
      duration: 0.9,
      easeLinearity: 0.25,
    });

    // Remove previous polygon
    if (polygonLayerRef.current) {
      polygonLayerRef.current.remove();
      polygonLayerRef.current = null;
    }

    // Remove previous marker
    if (markerLayerRef.current) {
      markerLayerRef.current.remove();
      markerLayerRef.current = null;
    }

    const latLngs = (coords || [])
      .filter((c) => !isNaN(c.lat) && !isNaN(c.lng))
      .map((c) => [c.lat, c.lng] as [number, number]);

    const popupHtml = `
      <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; color: #1e293b; min-width: 160px;">
        <strong style="color: #174C32; font-size: 13px; display: block; margin-bottom: 2px;">${pName}</strong>
        <div><strong>${t('fieldMonitor.cropLabel', 'Crop:')}</strong> ${translateCrop(cName, t)}</div>
        ${acres ? `<div><strong>${t('fieldMonitor.areaLabel', 'Area:')}</strong> ${acres} ${t('dashboard.acres', 'Acres')}</div>` : ''}
        <div><strong>${t('fieldMonitor.meanNdviLabel', 'Mean NDVI:')}</strong> <span style="font-weight: bold; color: ${strokeColor};">${ndvi.toFixed(2)}</span></div>
        <div style="font-size: 10px; color: #64748b; margin-top: 4px;">${t('fieldMonitor.sentinelPass', 'Copernicus Sentinel-2 pass')}</div>
      </div>
    `;

    if (latLngs.length >= 3) {
      const polygon = L.polygon(latLngs, {
        color: strokeColor,
        weight: 3,
        fillColor: fillColor,
        fillOpacity: 0.55,
        dashArray: '4, 4',
      }).addTo(map);

      polygon.bindPopup(popupHtml);
      polygonLayerRef.current = polygon;

      const centerMarker = L.circleMarker(cent, {
        radius: 5,
        color: strokeColor,
        weight: 2,
        fillColor,
        fillOpacity: 1,
      }).addTo(map);
      centerMarker.bindPopup(popupHtml);
      markerLayerRef.current = centerMarker;

      // Fit bounds to polygon boundary with padding
      map.fitBounds(polygon.getBounds(), { padding: [35, 35], maxZoom: 17 });
      requestAnimationFrame(() => map.invalidateSize());
    } else {
      // Add a center marker if no polygon coordinates
      const marker = L.marker(cent).addTo(map);
      marker.bindPopup(popupHtml);
      markerLayerRef.current = marker;
      map.setView(cent, 16);
    }
  };

  return (
    <div className="relative w-full h-[320px] sm:h-[420px] rounded-3xl overflow-hidden border border-nutri-cardBorder shadow-inner bg-slate-100 z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Floating map info badge */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-nutri-cardBorder text-xs font-bold text-nutri-primary shadow-sm z-[400] flex items-center gap-2 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>{t('fieldMonitor.mapAttribution', 'OpenStreetMap • Sentinel-2 Overlay')}</span>
      </div>

      {/* Floating Plot Name Pill */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-nutri-cardBorder text-[11px] font-bold text-nutri-dark shadow-sm z-[400] flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meanNdvi >= 0.6 ? '#10B981' : meanNdvi >= 0.3 ? '#F59E0B' : '#EF4444' }} />
        <span className="truncate max-w-[240px]">{plotName} ({translateCrop(cropName, t)}) · {areaAcres?.toFixed(2) ?? '—'} {t('dashboard.acres', 'acres')}</span>
      </div>
    </div>
  );
};
