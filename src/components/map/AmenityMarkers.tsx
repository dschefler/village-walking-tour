'use client';

import { useState } from 'react';
import { Marker, Popup } from 'react-map-gl';
import { Bike, ExternalLink, SquareParking, Zap, type LucideIcon } from 'lucide-react';
import { AMENITY_STYLES, type AmenityKind, type MapAmenity } from '@/lib/map-amenities';

const ICONS: Record<AmenityKind, LucideIcon> = {
  parking: SquareParking,
  ev: Zap,
  bike: Bike,
};

const KINDS: AmenityKind[] = ['parking', 'ev', 'bike'];

/**
 * Parking / EV / bike markers with a toggleable legend. Rendered inside a
 * react-map-gl <Map>; markers are square so they read as distinct from the
 * round tour-site pins.
 */
export function AmenityMarkers({ amenities }: { amenities: MapAmenity[] }) {
  const [enabled, setEnabled] = useState<Set<AmenityKind>>(() => new Set(KINDS));
  const [open, setOpen] = useState<MapAmenity | null>(null);

  if (amenities.length === 0) return null;

  const presentKinds = KINDS.filter((k) => amenities.some((a) => a.kinds.includes(k)));

  const toggle = (kind: AmenityKind) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
    setOpen(null);
  };

  return (
    <>
      {amenities.map((amenity) => {
        // Icon follows the first kind that's switched on, so a lot with
        // chargers still shows (as EV) when Parking is hidden.
        const shownKind = amenity.kinds.find((k) => enabled.has(k));
        if (!shownKind) return null;
        const Icon = ICONS[shownKind];
        const hasEvBadge = shownKind !== 'ev' && amenity.kinds.includes('ev') && enabled.has('ev');

        return (
          <Marker
            key={amenity.id}
            longitude={amenity.longitude}
            latitude={amenity.latitude}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setOpen(amenity);
            }}
          >
            <button
              type="button"
              aria-label={amenity.name}
              className="relative flex items-center justify-center w-4 h-4 rounded border border-white shadow cursor-pointer opacity-90 hover:opacity-100"
              style={{ backgroundColor: AMENITY_STYLES[shownKind].color }}
            >
              <Icon className="w-2.5 h-2.5 text-white" />
              {hasEvBadge && (
                <span
                  className="absolute -top-1 -right-1 flex items-center justify-center w-2.5 h-2.5 rounded-full border border-white"
                  style={{ backgroundColor: AMENITY_STYLES.ev.color }}
                >
                  <Zap className="w-1.5 h-1.5 text-white" />
                </span>
              )}
            </button>
          </Marker>
        );
      })}

      {open && (
        <Popup
          longitude={open.longitude}
          latitude={open.latitude}
          anchor="bottom"
          offset={10}
          closeOnClick={false}
          onClose={() => setOpen(null)}
          maxWidth="260px"
        >
          <div className="pr-3 text-gray-900">
            <h4 className="font-semibold text-sm">{open.name}</h4>
            {open.address && <p className="text-xs text-gray-600">{open.address}</p>}
            {open.details.length > 0 && (
              <ul className="mt-1 space-y-0.5 text-xs text-gray-700">
                {open.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
            <div className="mt-2 flex flex-col gap-1">
              {open.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
                >
                  {link.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        </Popup>
      )}

      {/* Legend doubles as show/hide toggles */}
      <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1.5 max-w-[calc(100%-1rem)]">
        {presentKinds.map((kind) => {
          const Icon = ICONS[kind];
          const on = enabled.has(kind);
          return (
            <button
              key={kind}
              type="button"
              onClick={() => toggle(kind)}
              aria-pressed={on}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium shadow bg-white/95 border transition-opacity ${
                on ? 'opacity-100' : 'opacity-50'
              }`}
              style={{ borderColor: AMENITY_STYLES[kind].color }}
            >
              <span
                className="flex items-center justify-center w-4 h-4 rounded"
                style={{ backgroundColor: AMENITY_STYLES[kind].color }}
              >
                <Icon className="w-3 h-3 text-white" />
              </span>
              {AMENITY_STYLES[kind].label}
            </button>
          );
        })}
      </div>
    </>
  );
}
