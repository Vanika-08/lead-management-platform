import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <ShieldAlert className="size-10 text-destructive" aria-hidden />
      <h1 className="font-display text-2xl font-semibold">Access restricted</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        You do not have permission to view this page. If you think this is a mistake, contact your
        workspace admin.
      </p>
      <Button asChild>
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
