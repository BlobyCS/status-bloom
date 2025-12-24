import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'cookie-consent';

export type CookieConsent = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const defaultConsent: CookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored) {
      setConsent(JSON.parse(stored));
      setShowBanner(false);
    } else {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const fullConsent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(fullConsent));
    setConsent(fullConsent);
    setShowBanner(false);
  };

  const acceptNecessary = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(defaultConsent));
    setConsent(defaultConsent);
    setShowBanner(false);
  };

  const savePreferences = (preferences: CookieConsent) => {
    const finalConsent = { ...preferences, necessary: true };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(finalConsent));
    setConsent(finalConsent);
    setShowBanner(false);
  };

  return {
    consent,
    showBanner,
    acceptAll,
    acceptNecessary,
    savePreferences,
  };
}
