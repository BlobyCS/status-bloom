import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Shield, Crown, Loader2 } from 'lucide-react';

export function AdminSetup() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const navigate = useNavigate();

  const handleSetupAdmin = async () => {
    if (!user) {
      toast.error('Musíte se nejprve přihlásit');
      navigate('/auth');
      return;
    }

    setIsSettingUp(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('setup-admin', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) {
        toast.error(error.message || 'Nepodařilo se nastavit admin roli');
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success(data.message || 'Nyní jste admin!');
      // Reload the page to refresh admin status
      window.location.reload();
    } catch (err) {
      console.error('Setup admin error:', err);
      toast.error('Došlo k chybě při nastavování admin role');
    } finally {
      setIsSettingUp(false);
    }
  };

  if (authLoading) {
    return null;
  }

  // If already admin, show badge
  if (isAdmin) {
    return (
      <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
        <Crown className="h-3 w-3" />
        Admin
      </span>
    );
  }

  // If logged in but not admin, show setup button
  if (user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleSetupAdmin}
        disabled={isSettingUp}
        className="h-8 text-xs gap-1.5"
      >
        {isSettingUp ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Shield className="h-3.5 w-3.5" />
        )}
        Stát se adminem
      </Button>
    );
  }

  return null;
}
