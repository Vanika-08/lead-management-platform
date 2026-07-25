'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListChecks, Settings, UserCheck, UserCircle, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { initials } from '@/lib/utils/format';
import { SignOutButton } from '@/components/features/auth/sign-out-button';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import type { UserRole } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/leads', label: 'Leads', icon: ListChecks },
  { href: '/assigned', label: 'Assigned to me', icon: UserCheck },
  { href: '/users', label: 'Users', icon: Users, adminOnly: true },
  { href: '/profile', label: 'Profile', icon: UserCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function NavLinks({ role, onNavigate }: { role: UserRole; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 md:flex-col">
      {ITEMS.filter((i) => !i.adminOnly || role === 'ADMIN').map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <Icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppSidebar({
  user,
}: {
  user: { name?: string | null; email?: string | null; role: UserRole };
}) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r bg-card px-3 py-4 md:flex">
        <Link href="/dashboard" className="px-3 font-display text-lg font-semibold tracking-tight">
          Relay
        </Link>
        <div className="mt-6 flex-1">
          <NavLinks role={user.role} />
        </div>
        <div className="border-t pt-3">
          <div className="flex items-center gap-2 px-2 pb-3">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {initials(user.name ?? 'U')}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.role}</p>
            </div>
          </div>
          <div className="space-y-2">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b bg-card px-4 py-3 md:hidden">
        <Link href="/dashboard" className="font-display text-base font-semibold">
          Relay
        </Link>
        <div className="flex items-center gap-2 overflow-x-auto">
          <NavLinks role={user.role} />
        </div>
      </header>
    </>
  );
}
