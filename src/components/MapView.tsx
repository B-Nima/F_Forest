import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { fireBoundaries, forestPlots } from '../data/fireData';

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([56.22, 92.82], 11);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Слой лесного фонда
    const forestLayer = L.layerGroup();
    forestPlots.forEach((plot) => {
      const polygon = L.polygon(plot.coordinates, {
        color: '#166534',
        weight: 1.5,
        fillColor: getSpeciesColor(plot.species),
        fillOpacity: 0.35,
        dashArray: '5, 5',
      });
      polygon.bindTooltip(
        `<b>${plot.species}</b> | Возраст: ${plot.age} лет<br/>
         Группа: ${plot.age_group}<br/>
         Площадь: ${plot.area_ha} га | Бонитет: ${plot.bonitet}<br/>
         Квартал: ${plot.kvartal}, Выдел: ${plot.viel}`,
        { sticky: true }
      );
      polygon.addTo(forestLayer);
    });
    forestLayer.addTo(map);

    // Слой пожаров
    const fireLayer = L.layerGroup();
    fireBoundaries.forEach((fire) => {
      const color = fire.status === 'active' ? '#ef4444' :
                    fire.status === 'contained' ? '#f59e0b' : '#6b7280';
      const polygon = L.polygon(fire.coordinates, {
        color: color,
        weight: 2.5,
        fillColor: color,
        fillOpacity: 0.2,
      });
      polygon.bindTooltip(
        `<b>🔥 ${fire.name}</b><br/>
         Площадь: ${fire.area_ha} га<br/>
         Статус: ${getStatusLabel(fire.status)}<br/>
         Класс опасности: ${fire.danger_class}<br/>
         Дата: ${fire.start_date}`,
        { sticky: true }
      );
      polygon.addTo(fireLayer);

      // Иконка в центре пожара
      const fireIcon = L.divIcon({
        html: `<div style="font-size:20px;text-shadow:0 0 4px rgba(0,0,0,0.5)">🔥</div>`,
        className: 'fire-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      L.marker(fire.center, { icon: fireIcon }).addTo(fireLayer);
    });
    fireLayer.addTo(map);

    // Контроль слоёв
    L.control.layers(
      {},
      {
        '🌲 Лесной фонд': forestLayer,
        '🔥 Границы пожаров': fireLayer,
      },
      { collapsed: false }
    ).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
      <div className="absolute top-3 left-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg text-xs">
        <div className="font-bold text-sm mb-2">Легенда</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-4 h-3 bg-red-500/30 border-2 border-red-500 rounded-sm"></span>
            <span>Действующий пожар</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-3 bg-amber-500/30 border-2 border-amber-500 rounded-sm"></span>
            <span>Локализованный</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-3 bg-gray-500/30 border-2 border-gray-500 rounded-sm"></span>
            <span>Ликвидированный</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-3 bg-green-800/30 border border-green-800 border-dashed rounded-sm"></span>
            <span>Выдел лесного фонда</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getSpeciesColor(species: string): string {
  const colors: Record<string, string> = {
    'Сосна': '#22c55e',
    'Лиственница': '#84cc16',
    'Ель': '#059669',
    'Кедр': '#0d9488',
    'Берёза': '#86efac',
    'Пихта': '#15803d',
  };
  return colors[species] || '#6b7280';
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'active': return '🔴 Действующий';
    case 'contained': return '🟡 Локализованный';
    case 'extinguished': return '⚪ Ликвидированный';
    default: return status;
  }
}
