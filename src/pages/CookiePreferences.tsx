import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';
import { Cookie, ArrowLeft, CheckCircle2, XCircle, Shield, BarChart3, Megaphone } from 'lucide-react';
import { useCookieConsent, CookieConsent } from '@/hooks/useCookieConsent';
import { toast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

export default function CookiePreferences() {
  const { consent, savePreferences, acceptAll, acceptNecessary } = useCookieConsent();
  const [preferences, setPreferences] = useState<CookieConsent>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (consent) {
      setPreferences(consent);
    }
  }, [consent]);

  const handleSave = () => {
    savePreferences(preferences);
    toast({
      title: "Nastavení uloženo",
      description: "Vaše cookie preference byly aktualizovány.",
    });
  };

  const handleAcceptAll = () => {
    acceptAll();
    setPreferences({ necessary: true, analytics: true, marketing: true });
    toast({
      title: "Nastavení uloženo",
      description: "Všechny cookies byly povoleny.",
    });
  };

  const handleAcceptNecessary = () => {
    acceptNecessary();
    setPreferences({ necessary: true, analytics: false, marketing: false });
    toast({
      title: "Nastavení uloženo",
      description: "Pouze nezbytné cookies jsou povoleny.",
    });
  };

  const activeCount = [preferences.necessary, preferences.analytics, preferences.marketing].filter(Boolean).length;
  const allActive = activeCount === 3;

  return (
    <div className="min-h-screen ambient-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/40">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-foreground">
                <Cookie className="h-4 w-4 text-background" />
              </div>
              <span className="font-semibold text-foreground tracking-tight">Cookie Monitor</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Status
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-6 stagger-children">
          {/* Status Banner */}
          <div
            className={cn(
              'relative p-6 sm:p-8 rounded-2xl card-elevated overflow-hidden transition-all duration-500',
              allActive ? 'glow-up' : 'glow-degraded'
            )}
          >
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative shrink-0">
                <div
                  className={cn(
                    'flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl transition-colors',
                    allActive ? 'bg-status-up-bg' : 'bg-status-degraded-bg'
                  )}
                >
                  {allActive ? (
                    <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-status-up" />
                  ) : (
                    <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-status-degraded" />
                  )}
                </div>
                {allActive && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-up opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-status-up" />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h1
                  className={cn(
                    'text-xl sm:text-2xl font-semibold tracking-tight truncate',
                    allActive ? 'text-status-up' : 'text-status-degraded'
                  )}
                >
                  {allActive ? 'Všechny Cookies Aktivní' : 'Omezený Režim'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeCount} z 3 kategorií aktivních
                </p>
              </div>
            </div>
          </div>

          {/* Cookie Categories Grid */}
          <div className="grid gap-3">
            <CookieCard
              icon={Shield}
              name="Nezbytné"
              description="Nutné pro základní funkčnost webu"
              active={preferences.necessary}
              locked
            />
            <CookieCard
              icon={BarChart3}
              name="Analytické"
              description="Pomáhají porozumět návštěvnosti"
              active={preferences.analytics}
              onToggle={(checked) => setPreferences((prev) => ({ ...prev, analytics: checked }))}
            />
            <CookieCard
              icon={Megaphone}
              name="Marketingové"
              description="Používané pro personalizaci reklam"
              active={preferences.marketing}
              onToggle={(checked) => setPreferences((prev) => ({ ...prev, marketing: checked }))}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleAcceptNecessary} className="flex-1">
              Pouze nezbytné
            </Button>
            <Button variant="outline" onClick={handleAcceptAll} className="flex-1">
              Přijmout vše
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Uložit nastavení
            </Button>
          </div>

          {/* Back Link */}
          <Link
            to="/"
            className="flex items-center justify-center gap-2 py-4 rounded-xl border border-border/60 hover:border-border hover:bg-secondary/50 transition-all group"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Zpět na Status Monitor
            </span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 mt-auto">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs text-muted-foreground text-center">
            Cookie Monitor • bloby.eu
          </p>
        </div>
      </footer>
    </div>
  );
}

interface CookieCardProps {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
  description: string;
  active: boolean;
  locked?: boolean;
  onToggle?: (checked: boolean) => void;
}

function CookieCard({ icon: Icon, name, description, active, locked, onToggle }: CookieCardProps) {
  return (
    <div className="flex items-center justify-between p-4 sm:p-5 rounded-xl card-elevated hover-lift">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition-colors',
            active ? 'bg-status-up-bg' : 'bg-muted'
          )}
        >
          <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6', active ? 'text-status-up' : 'text-muted-foreground')} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{name}</p>
            {locked && (
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider font-medium">
                Vždy aktivní
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {active ? (
          <CheckCircle2 className="h-5 w-5 text-status-up" />
        ) : (
          <XCircle className="h-5 w-5 text-muted-foreground" />
        )}
        <Switch checked={active} disabled={locked} onCheckedChange={onToggle} />
      </div>
    </div>
  );
}
