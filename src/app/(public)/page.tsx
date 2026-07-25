import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LEAD_STATUSES } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LeadCaptureForm } from '@/components/features/lead-capture/lead-capture-form';

/**
 * Public landing page (route: /). Server Component — no client JS beyond the
 * form island. The lifecycle strip is the signature element: it shows the real
 * product's lead stages, so the marketing and the app speak the same language.
 */
export default function LandingPage() {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* Ambient background wash, kept subtle. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_-10%,hsl(var(--accent))_0%,transparent_60%)]"
      />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-semibold tracking-tight">Relay</span>
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Sign in</Link>
        </Button>
      </header>

      <main className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-6 lg:grid-cols-2 lg:gap-16 lg:pt-14">
        <section>
          <span className="inline-flex items-center rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Lead management for growing sales teams
          </span>

          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Every lead, from first hello to closed won.
          </h1>

          <p className="mt-5 max-w-md text-base text-muted-foreground">
            Relay captures inbound interest, routes it to the right rep, and keeps the whole team
            moving deals through a shared pipeline. Tell us about your team and we will show you how.
          </p>

          {/* Signature: the actual lead lifecycle as a horizontal stepper. */}
          <ol className="mt-9 flex flex-wrap items-center gap-y-3 text-sm">
            {LEAD_STATUSES.filter((s) => s !== 'Lost').map((status, i, arr) => (
              <li key={status} className="flex items-center">
                <span
                  className={
                    status === 'Won'
                      ? 'rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground'
                      : 'rounded-full border bg-card px-3 py-1 font-medium'
                  }
                >
                  {status}
                </span>
                {i < arr.length - 1 && (
                  <ArrowRight className="mx-1.5 size-4 text-muted-foreground/60" aria-hidden />
                )}
              </li>
            ))}
          </ol>
        </section>

        <section>
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Book a demo</CardTitle>
              <CardDescription>
                Share a few details and a rep will reach out within one business day.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeadCaptureForm />
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Relay. Built for the Digital Heroes assignment.
      </footer>
    </div>
  );
}
