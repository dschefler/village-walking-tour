'use client';

import { useState, useCallback } from 'react';
import { MapPin, Loader2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { geocodeAddress, type GeocodingResult } from '@/lib/mapbox/geocoding';

interface AddressInputProps {
  value: string;
  addressFormatted?: string;
  onChange: (address: string) => void;
  onGeocode: (result: GeocodingResult) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AddressInput({
  value,
  addressFormatted,
  onChange,
  onGeocode,
  placeholder = 'Enter street address...',
  disabled = false,
}: AddressInputProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [geocodeSuccess, setGeocodeSuccess] = useState(false);

  const handleGeocode = useCallback(async () => {
    if (!value.trim()) {
      setGeocodeError('Please enter an address');
      return;
    }

    setIsGeocoding(true);
    setGeocodeError(null);
    setGeocodeSuccess(false);

    try {
      const result = await geocodeAddress(value);

      if (result) {
        onGeocode(result);
        setGeocodeSuccess(true);
        setTimeout(() => setGeocodeSuccess(false), 2000);
      } else {
        setGeocodeError('Address not found. Try a more specific address.');
      }
    } catch {
      setGeocodeError('Failed to geocode address. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  }, [value, onGeocode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGeocode();
    }
  };

  const handleBlur = () => {
    if (value.trim() && !addressFormatted) {
      handleGeocode();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setGeocodeError(null);
              setGeocodeSuccess(false);
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled || isGeocoding}
            className="pr-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isGeocoding && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            {geocodeSuccess && <Check className="w-4 h-4 text-green-500" />}
            {geocodeError && <X className="w-4 h-4 text-red-500" />}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleGeocode}
          disabled={disabled || isGeocoding || !value.trim()}
          title="Geocode address"
        >
          <MapPin className="w-4 h-4" />
        </Button>
      </div>

      {geocodeError && (
        <p className="text-sm text-destructive">{geocodeError}</p>
      )}

      {addressFormatted && !geocodeError && (
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Check className="w-3 h-3 text-green-500" />
          {addressFormatted}
        </p>
      )}
    </div>
  );
}
