import { requireAuth } from '@/lib/auth/guards';
import { AppSidebar } from '@/components/shared/app-sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[240px_1fr]">
      <AppSidebar user={user} />
      <main className="min-w-0">{children}</main>
    </div>
  );
}
