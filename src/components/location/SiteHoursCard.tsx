'use client';

import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SiteHours } from '@/types';

const DAYS = [
  { key: 'monday',    label: 'Monday' },
  { key: 'tuesday',   label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday',  label: 'Thursday' },
  { key: 'friday',    label: 'Friday' },
  { key: 'saturday',  label: 'Saturday' },
  { key: 'sunday',    label: 'Sunday' },
] as const;

// JS getDay() returns 0=Sun, 1=Mon ... 6=Sat
const JS_DAY_TO_KEY = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'] as const;

function formatTime(time: string): string {
  const [hStr, mStr] = time.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

function isOpenNow(hours: SiteHours): boolean {
  const now = new Date();
  const todayKey = JS_DAY_TO_KEY[now.getDay()];
  const todayHours = hours[todayKey];
  if (!todayHours) return false;
  const nowTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  return nowTime >= todayHours.open && nowTime <= todayHours.close;
}

interface Props {
  hours: SiteHours;
}

export function SiteHoursCard({ hours }: Props) {
  const now = new Date();
  const todayKey = JS_DAY_TO_KEY[now.getDay()];
  const openNow = isOpenNow(hours);

  // Check if any day has hours set
  const hasAnyHours = DAYS.some(({ key }) => hours[key] != null);
  if (!hasAnyHours) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Hours
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              openNow
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {openNow ? 'Open now' : 'Closed now'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-1.5 text-sm">
          {DAYS.map(({ key, label }) => {
            const dayHours = hours[key];
            const isToday = key === todayKey;
            return (
              <div
                key={key}
                className={`flex justify-between gap-4 ${
                  isToday ? 'font-semibold text-foreground' : 'text-muted-foreground'
                }`}
              >
                <dt className="w-28 flex-shrink-0 flex items-center gap-1.5">
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  )}
                  {!isToday && <span className="w-1.5 flex-shrink-0" />}
                  {label}
                </dt>
                <dd>
                  {dayHours
                    ? `${formatTime(dayHours.open)} – ${formatTime(dayHours.close)}`
                    : 'Closed'}
                </dd>
              </div>
            );
          })}
        </dl>
        {hours.notes && (
          <p className="mt-3 pt-3 border-t text-xs text-muted-foreground italic">
            {hours.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
