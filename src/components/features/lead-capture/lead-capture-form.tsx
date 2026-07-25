'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { leadCaptureSchema, type LeadCaptureInput } from '@/lib/validations/lead';
import { useCreateLead } from '@/hooks/use-create-lead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const DEFAULTS: LeadCaptureInput = {
  name: '',
  email: '',
  phone: '',
  company: '',
  message: '',
};

export function LeadCaptureForm() {
  const form = useForm<LeadCaptureInput>({
    resolver: zodResolver(leadCaptureSchema),
    defaultValues: DEFAULTS,
    mode: 'onBlur',
  });

  const { mutate, isPending, isSuccess } = useCreateLead();

  function onSubmit(values: LeadCaptureInput) {
    mutate(values, {
      onSuccess: () => {
        toast.success('Request received. Our team will reach out shortly.');
        form.reset(DEFAULTS);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  // Success state — replaces the form with a confirmation.
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <CheckCircle2 className="size-10 text-primary" aria-hidden />
        <h3 className="font-display text-xl font-semibold">You are on the list</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Thanks for reaching out. A member of the sales team will get in touch within one business
          day.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      {/* No native <form> submit needed; RHF handleSubmit wires the click. */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Jordan Rivera" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="jordan@company.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (optional)</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+1 555 000 1234" autoComplete="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Inc." autoComplete="organization" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>What are you looking to solve? (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little about your team and goals."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Submitting
            </>
          ) : (
            'Request a demo'
          )}
        </Button>
      </form>
    </Form>
  );
}
