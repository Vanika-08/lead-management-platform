'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PageMeta } from '@/types/dto';

export function LeadsPagination({ meta }: { meta: PageMeta }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function go(page: number) {
    const next = new URLSearchParams(params.toString());
    next.set('page', String(page));
    router.push(`${pathname}?${next.toString()}`);
  }

  const start = (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {meta.total === 0 ? '0' : `${start}-${end}`} of {meta.total}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => go(meta.page - 1)}
        >
          <ChevronLeft aria-hidden /> Prev
        </Button>
        <span className="tabular-nums">
          Page {meta.page} of {meta.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => go(meta.page + 1)}
        >
          Next <ChevronRight aria-hidden />
        </Button>
      </div>
    </div>
  );
}
