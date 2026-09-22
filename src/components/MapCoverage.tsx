'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Provider } from '@/types';
import { BALCARCE_CENTER } from '@/lib/store';

interface MapCoverageProps {
  providers: Provider[];
  selectedProviderId?: string;
  onSelectProvider?: (provider: Provider) => void;
  height?: string;
}

export default function MapCoverage({
  providers,
  selectedProviderId,
  onSelectProvider,
  height = '420px'
}: MapCoverageProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not yet created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [BALCARCE_CENTER.lat, BALCARCE_CENTER.lng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      // Standard OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright' })
        .addAttribution('&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>')
        .addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!layerGroup || !map) return;

    // Clear previous markers and circles
    layerGroup.clearLayers();

    // Add Plaza Libertad center reference point
    const centerIcon = L.divIcon({
      className: 'bg-transparent',
      html: `
        <div class="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 text-white shadow-md border-2 border-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    L.marker([BALCARCE_CENTER.lat, BALCARCE_CENTER.lng], { icon: centerIcon })
      .bindPopup('<b>Plaza Libertad</b><br>Centro de Balcarce')
      .addTo(layerGroup);

    // Plot each provider
    providers.forEach(provider => {
      const isSelected = selectedProviderId === provider.id;

      // Draw coverage radius circle
      const circle = L.circle([provider.location.lat, provider.location.lng], {
        radius: provider.coverageRadiusKm * 1000,
        color: isSelected ? '#ea580c' : provider.isPremium ? '#f59e0b' : '#3b82f6',
        fillColor: isSelected ? '#f97316' : provider.isPremium ? '#fbbf24' : '#60a5fa',
        fillOpacity: isSelected ? 0.22 : 0.08,
        weight: isSelected ? 2.5 : 1.5,
        dashArray: isSelected ? undefined : '4, 6'
      }).addTo(layerGroup);

      // Custom icon for provider base
      const markerHtml = `
        <div class="relative group cursor-pointer transition-transform ${isSelected ? 'scale-125 z-30' : 'hover:scale-110'}">
          <div class="w-10 h-10 rounded-2xl overflow-hidden shadow-lg border-2 ${
            isSelected 
              ? 'border-orange-600 ring-4 ring-orange-500/30' 
              : provider.isPremium 
                ? 'border-amber-400 ring-2 ring-amber-400/40' 
                : 'border-white'
          } bg-white flex items-center justify-center">
            <img src="${provider.avatar}" alt="${provider.name}" class="w-full h-full object-cover" />
          </div>
          ${provider.isPremium ? `
            <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px] font-bold shadow-xs">
              👑
            </div>
          ` : ''}
        </div>
      `;

      const providerIcon = L.divIcon({
        className: 'bg-transparent',
        html: markerHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
      });

      const marker = L.marker([provider.location.lat, provider.location.lng], {
        icon: providerIcon,
        zIndexOffset: isSelected ? 1000 : provider.isPremium ? 500 : 100
      }).addTo(layerGroup);

      // Popup with quick details
      marker.bindPopup(`
        <div class="p-1 text-slate-900 font-sans min-w-[180px]">
          <div class="flex items-center gap-1.5 font-bold text-sm">
            <span>${provider.name}</span>
            ${provider.isPremium ? '<span class="text-amber-500 text-xs">👑</span>' : ''}
          </div>
          <div class="text-xs text-orange-600 font-semibold uppercase">${provider.category}</div>
          <div class="text-xs text-slate-500 mt-0.5">${provider.zoneName}</div>
          <div class="text-xs font-medium text-emerald-700 mt-1">Cobertura: Radio ${provider.coverageRadiusKm} km</div>
        </div>
      `);

      marker.on('click', () => {
        if (onSelectProvider) onSelectProvider(provider);
      });
    });

    // If a specific provider is selected, focus on their area
    if (selectedProviderId) {
      const selected = providers.find(p => p.id === selectedProviderId);
      if (selected) {
        map.flyTo([selected.location.lat, selected.location.lng], 14, { duration: 1 });
      }
    }

  }, [providers, selectedProviderId, onSelectProvider]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapContainerRef} style={{ height }} className="w-full" />
      
      {/* Legend Overlay */}
      <div className="absolute top-3 right-3 z-30 bg-white/90 backdrop-blur px-3 py-2 rounded-xl shadow-md border border-slate-200/80 text-[11px] font-medium text-slate-700 flex flex-col gap-1.5 pointer-events-auto">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500"></span>
          <span>Prestador Premium (👑)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-400 border border-blue-500"></span>
          <span>Prestador Verificado</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-[10px]">
          <span className="w-3 h-0.5 border-b-2 border-dashed border-slate-400"></span>
          <span>Círculo: Radio de cobertura</span>
        </div>
      </div>
    </div>
  );
}
