'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { profileUpdateSchema, type ProfileUpdateInput } from '@/lib/validations/user';
import { useUpdateProfile } from '@/hooks/use-user-mutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export function ProfileForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const { mutate, isPending } = useUpdateProfile();

  const form = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { name: defaultName, password: '' },
  });

  function onSubmit(values: ProfileUpdateInput) {
    mutate(
      { name: values.name, password: values.password || undefined },
      {
        onSuccess: () => {
          toast.success('Profile updated. Name changes appear after your next sign-in.');
          form.resetField('password');
          router.refresh();
        },
        onError: (e) => toast.error(e.message),
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password (optional)</FormLabel>
              <FormControl>
                <Input type="password" autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
