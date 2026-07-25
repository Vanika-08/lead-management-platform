import { Users, CalendarDays, CalendarRange, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardStatsDTO } from '@/types/dto';

function Stat({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCards({ stats }: { stats: DashboardStatsDTO }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Total leads" value={String(stats.total)} icon={Users} />
      <Stat label="New today" value={String(stats.today)} icon={CalendarDays} />
      <Stat label="Last 7 days" value={String(stats.thisWeek)} icon={CalendarRange} />
      <Stat
        label="Conversion rate"
        value={`${stats.conversionRate}%`}
        icon={TrendingUp}
        hint={`${stats.won} won · ${stats.lost} lost`}
      />
    </div>
  );
}
