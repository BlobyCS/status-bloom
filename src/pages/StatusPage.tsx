import { useState, useMemo } from 'react';
import { StatusHeader } from '@/components/StatusHeader';
import { ServiceList } from '@/components/ServiceCard';
import { UptimeStats } from '@/components/UptimeStats';
import { IncidentHistory } from '@/components/IncidentHistory';
import { 
  mockServices, 
  mockIncidents, 
  generateUptimeData, 
  calculateSystemStatus 
} from '@/data/mockData';

const StatusPage = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date().toISOString());
  
  const systemStatus = useMemo(() => calculateSystemStatus(mockServices), []);
  const uptimeData = useMemo(() => generateUptimeData(90), []);
  
  const averageUptime30d = mockServices.reduce((sum, s) => sum + s.uptime30d, 0) / mockServices.length;
  const averageUptime90d = mockServices.reduce((sum, s) => sum + s.uptime90d, 0) / mockServices.length;

  const handleRefresh = () => {
    setLastUpdated(new Date().toISOString());
  };

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <StatusHeader 
        systemStatus={systemStatus}
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
      />
      
      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-10">
        <ServiceList services={mockServices} />
        
        <UptimeStats 
          uptime30d={averageUptime30d}
          uptime90d={averageUptime90d}
          uptimeData={uptimeData}
        />
        
        <IncidentHistory incidents={mockIncidents} />
        
        <footer className="pt-8 pb-4 border-t border-border/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              Powered by <span className="font-medium text-foreground">Bloby</span> Status Monitor
            </p>
            <p className="font-mono text-xs">
              status.bloby.eu
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default StatusPage;
