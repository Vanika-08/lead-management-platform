import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireAuth } from '@/lib/auth/guards';
import { userService } from '@/lib/services/userService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateLeadForm } from '@/components/features/leads/create-lead-form';

export default async function NewLeadPage() {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') redirect('/unauthorized');
  const users = await userService.listUsers();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6 lg:p-8">
      <Link
        href="/leads"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to leads
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Create lead</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateLeadForm users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
