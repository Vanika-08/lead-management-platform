import { requireAuth } from '@/lib/auth/guards';
import { dashboardService } from '@/lib/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCards } from '@/components/features/dashboard/stat-cards';
import { StatusBarChart } from '@/components/features/dashboard/status-bar-chart';
import { TrendChart } from '@/components/features/dashboard/trend-chart';
import { RecentActivity } from '@/components/features/dashboard/recent-activity';

export default async function DashboardPage() {
  const user = await requireAuth();
  const actor = { id: user.id, role: user.role };

  const [stats, activities] = await Promise.all([
    dashboardService.getStats(actor),
    dashboardService.getRecentActivity(actor),
  ]);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">
          Welcome back{user.name ? `, ${user.name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-muted-foreground">
          {user.role === 'ADMIN' ? 'Team-wide pipeline overview.' : 'Your pipeline at a glance.'}
        </p>
      </div>

      <StatCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leads by status</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusBarChart data={stats.byStatus} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New leads (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={stats.trend} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivity activities={activities} />
        </CardContent>
      </Card>
    </div>
  );
}
