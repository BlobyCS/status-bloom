import { ShieldX } from 'lucide-react';

interface VpnBlockedProps {
  message?: string;
}

export function VpnBlocked({ message }: VpnBlockedProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-status-down-bg">
          <ShieldX className="h-10 w-10 text-status-down" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Přístup odepřen</h1>
          <p className="text-muted-foreground">
            {message || 'Byl detekován VPN nebo proxy. Pro přístup k této stránce vypněte VPN.'}
          </p>
        </div>
        <div className="pt-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-lg bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    </div>
  );
}
