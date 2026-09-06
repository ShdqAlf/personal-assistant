import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store';
import { supabase } from '@/lib/supabase/client';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const { user, setSession } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate('/auth');
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold pt-4 mb-4">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Profile</CardTitle>
          <CardDescription>Manage your Supabase account.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-secondary rounded-md text-sm">
            Logged in as: <span className="font-semibold">{user?.email}</span>
          </div>

          <Button onClick={handleLogout} variant="destructive" className="w-full">
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
