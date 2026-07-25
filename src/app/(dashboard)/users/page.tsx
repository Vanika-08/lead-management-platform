import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth/guards';
import { userService } from '@/lib/services/userService';
import { UsersManager } from '@/components/features/users/users-manager';

export default async function UsersPage() {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') redirect('/unauthorized');
  const users = await userService.listUsers();

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">Manage team members and their roles.</p>
      </div>
      <UsersManager users={users} currentUserId={user.id} />
    </div>
  );
}
