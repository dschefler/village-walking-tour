'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, MapPin, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationStore } from '@/stores/notification-store';
import { useRequestNotificationPermission } from '@/hooks/use-proximity-notifications';

export function NotificationSettings() {
  const { enabled, radiusMeters, setEnabled, setRadiusMeters, clearAlerts } =
    useNotificationStore();
  const { requestPermission, permission } = useRequestNotificationPermission();
  const [permissionState, setPermissionState] = useState<string>('default');

  useEffect(() => {
    setPermissionState(permission);
  }, [permission]);

  const handleToggle = async (checked: boolean) => {
    if (checked && permissionState === 'default') {
      const result = await requestPermission();
      setPermissionState(result);
      if (result === 'denied') {
        return;
      }
    }
    setEnabled(checked);
  };

  const isBlocked = permissionState === 'denied';
  const isUnsupported = permissionState === 'unsupported';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {enabled ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          Proximity Notifications
        </CardTitle>
        <CardDescription>
          Get notified when you&apos;re near a point of interest
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Warning for blocked/unsupported */}
        {(isBlocked || isUnsupported) && (
          <div className="flex items-start gap-3 p-3 bg-destructive/10 rounded-lg text-sm">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            <div>
              {isBlocked ? (
                <>
                  <p className="font-medium text-destructive">
                    Notifications Blocked
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Please enable notifications in your browser settings to use
                    this feature.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-destructive">Not Supported</p>
                  <p className="text-muted-foreground mt-1">
                    Your browser doesn&apos;t support notifications.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications-enabled">Enable Notifications</Label>
            <p className="text-xs text-muted-foreground">
              Receive alerts when approaching locations
            </p>
          </div>
          <Switch
            id="notifications-enabled"
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={isBlocked || isUnsupported}
          />
        </div>

        {/* Radius Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Notification Radius</Label>
            <span className="text-sm font-medium">{radiusMeters}m</span>
          </div>
          <Slider
            value={[radiusMeters]}
            onValueChange={([value]) => setRadiusMeters(value)}
            min={10}
            max={500}
            step={10}
            disabled={!enabled}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10m</span>
            <span>500m</span>
          </div>
        </div>

        {/* Preview */}
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span>
              You&apos;ll be notified when within{' '}
              <strong>{radiusMeters} meters</strong> of a location
            </span>
          </div>
        </div>

        {/* Clear Alerts */}
        {enabled && (
          <Button variant="outline" size="sm" onClick={clearAlerts}>
            Clear All Alerts
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
