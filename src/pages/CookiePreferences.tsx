import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, ArrowLeft, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCookieConsent, CookieConsent } from '@/hooks/useCookieConsent';
import { toast } from '@/hooks/use-toast';

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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl py-8 px-4">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Zpět na hlavní stránku
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Cookie className="h-6 w-6 text-primary" />
              Nastavení cookies
            </CardTitle>
            <CardDescription>
              Zde můžete upravit své preference ohledně používání cookies na našem webu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">Nezbytné cookies</p>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Vždy aktivní
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tyto cookies jsou nutné pro základní funkčnost webu. Bez nich by web nefungoval správně.
                  </p>
                </div>
                <Switch checked disabled />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Analytické cookies</p>
                  <p className="text-sm text-muted-foreground">
                    Pomáhají nám porozumět, jak návštěvníci používají náš web. Data jsou anonymizována.
                  </p>
                </div>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, analytics: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Marketingové cookies</p>
                  <p className="text-sm text-muted-foreground">
                    Používané pro sledování návštěvníků napříč weby a zobrazování relevantních reklam.
                  </p>
                </div>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, marketing: checked }))
                  }
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button variant="outline" onClick={handleAcceptNecessary} className="flex-1">
                Pouze nezbytné
              </Button>
              <Button variant="outline" onClick={handleAcceptAll} className="flex-1">
                Přijmout vše
              </Button>
              <Button onClick={handleSave} className="flex-1 gap-2">
                <Check className="h-4 w-4" />
                Uložit nastavení
              </Button>
            </div>

            {consent && (
              <p className="text-xs text-muted-foreground text-center pt-2">
                Aktuální nastavení: Analytické {consent.analytics ? '✓' : '✗'} | Marketingové {consent.marketing ? '✓' : '✗'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
