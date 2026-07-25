import { requireAuth } from '@/lib/auth/guards';
import { userService } from '@/lib/services/userService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileForm } from '@/components/features/users/profile-form';

export default async function ProfilePage() {
  const session = await requireAuth();
  const user = await userService.getUser(session.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">Update your account details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span>{user.email}</span>
            <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm defaultName={user.name} />
        </CardContent>
      </Card>
    </div>
  );
}
