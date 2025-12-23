import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AdminSetup } from './AdminSetup';

export function AdminHeader() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out');
    } else {
      toast.success('Signed out');
    }
  };

  if (loading) return null;

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <div className="flex items-center gap-2">
          <AdminSetup />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            Odhlásit
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/auth')}
          className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <LogIn className="h-3.5 w-3.5" />
          Admin přihlášení
        </Button>
      )}
    </div>
  );
}
