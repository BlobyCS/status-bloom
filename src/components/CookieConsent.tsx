import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Cookie, Settings, X } from 'lucide-react';
import { useCookieConsent, CookieConsent as CookieConsentType } from '@/hooks/useCookieConsent';

export function CookieConsent() {
  const { showBanner, acceptAll, acceptNecessary, savePreferences } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsentType>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t border-border shadow-lg">
      <div className="container mx-auto max-w-4xl">
        {!showSettings ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Používáme cookies</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Používáme cookies pro zlepšení vašeho zážitku, analýzu návštěvnosti a personalizaci obsahu.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Nastavení
              </Button>
              <Button variant="outline" size="sm" onClick={acceptNecessary}>
                Pouze nezbytné
              </Button>
              <Button size="sm" onClick={acceptAll}>
                Přijmout vše
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Cookie className="h-5 w-5 text-primary" />
                Nastavení cookies
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Nezbytné cookies</p>
                  <p className="text-sm text-muted-foreground">
                    Nutné pro základní funkčnost webu
                  </p>
                </div>
                <Switch checked disabled />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Analytické cookies</p>
                  <p className="text-sm text-muted-foreground">
                    Pomáhají nám porozumět návštěvnosti
                  </p>
                </div>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, analytics: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Marketingové cookies</p>
                  <p className="text-sm text-muted-foreground">
                    Používané pro personalizaci reklam
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
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={acceptNecessary}>
                Pouze nezbytné
              </Button>
              <Button onClick={() => savePreferences(preferences)}>
                Uložit nastavení
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
