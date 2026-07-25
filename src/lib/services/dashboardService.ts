import 'server-only';
import { dashboardRepository } from '@/lib/repositories/dashboardRepository';
import { activityRepository } from '@/lib/repositories/activityRepository';
import { toActivityDTO } from '@/lib/mappers';
import { LEAD_STATUSES, type Actor } from '@/types';
import type { DashboardStatsDTO, ActivityDTO, TrendPoint } from '@/types/dto';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(): Date {
  const d = startOfToday();
  d.setDate(d.getDate() - 6); // rolling 7-day window including today
  return d;
}

/** Build a zero-filled 6-month window so the chart never has gaps. */
function buildTrend(rows: Array<{ year: number; month: number; count: number }>): TrendPoint[] {
  const now = new Date();
  const points: TrendPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1; // 1-indexed to match $month
    const hit = rows.find((r) => r.year === year && r.month === month);
    points.push({ month: `${MONTH_LABELS[d.getMonth()]} ${year}`, count: hit?.count ?? 0 });
  }
  return points;
}

export const dashboardService = {
  async getStats(actor: Actor): Promise<DashboardStatsDTO> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [total, today, thisWeek, statusRows, trendRows] = await Promise.all([
      dashboardRepository.count(actor),
      dashboardRepository.count(actor, { createdAt: { $gte: startOfToday() } }),
      dashboardRepository.count(actor, { createdAt: { $gte: startOfWeek() } }),
      dashboardRepository.statusCounts(actor),
      dashboardRepository.monthlyTrend(actor, sixMonthsAgo),
    ]);

    const countFor = (s: (typeof LEAD_STATUSES)[number]) =>
      statusRows.find((r) => r.status === s)?.count ?? 0;

    const byStatus = LEAD_STATUSES.map((status) => ({ status, count: countFor(status) }));
    const won = countFor('Won');
    const lost = countFor('Lost');
    const conversionRate = total > 0 ? Math.round((won / total) * 1000) / 10 : 0;

    return { total, today, thisWeek, won, lost, conversionRate, byStatus, trend: buildTrend(trendRows) };
  },

  async getRecentActivity(actor: Actor, limit = 12): Promise<ActivityDTO[]> {
    const rows = await activityRepository.listRecent(actor, limit);
    return rows.map(toActivityDTO);
  },
};
