import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow, isPast, isFuture, isWithinInterval } from 'date-fns';
import { Calendar, Clock, Wrench, Plus, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface MaintenanceWindow {
  id: string;
  title: string;
  description: string | null;
  scheduled_start: string;
  scheduled_end: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

const fetchMaintenanceWindows = async (): Promise<MaintenanceWindow[]> => {
  const { data, error } = await supabase
    .from('maintenance_windows')
    .select('*')
    .order('scheduled_start', { ascending: false });

  if (error) throw error;
  return (data || []).map(item => ({
    ...item,
    status: item.status as MaintenanceWindow['status']
  }));
};

export function MaintenanceSchedule() {
  const { isAdmin } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const queryClient = useQueryClient();

  const { data: windows = [], isLoading } = useQuery({
    queryKey: ['maintenance-windows'],
    queryFn: fetchMaintenanceWindows,
  });

  const addMutation = useMutation({
    mutationFn: async (newWindow: Omit<MaintenanceWindow, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('maintenance_windows').insert(newWindow);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-windows'] });
      setIsAdding(false);
      resetForm();
      toast.success('Maintenance window scheduled');
    },
    onError: () => {
      toast.error('Failed to schedule maintenance');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('maintenance_windows').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-windows'] });
      toast.success('Maintenance window deleted');
    },
    onError: () => {
      toast.error('Failed to delete maintenance');
    },
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate(undefined);
    setEndDate(undefined);
    setStartTime('09:00');
    setEndTime('10:00');
  };

  const handleSubmit = () => {
    if (!title || !startDate || !endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const [startHours, startMins] = startTime.split(':').map(Number);
    const [endHours, endMins] = endTime.split(':').map(Number);

    const scheduledStart = new Date(startDate);
    scheduledStart.setHours(startHours, startMins, 0, 0);

    const scheduledEnd = new Date(endDate);
    scheduledEnd.setHours(endHours, endMins, 0, 0);

    if (scheduledEnd <= scheduledStart) {
      toast.error('End time must be after start time');
      return;
    }

    addMutation.mutate({
      title,
      description: description || null,
      scheduled_start: scheduledStart.toISOString(),
      scheduled_end: scheduledEnd.toISOString(),
      status: 'scheduled',
    });
  };

  const getWindowStatus = (window: MaintenanceWindow) => {
    const now = new Date();
    const start = new Date(window.scheduled_start);
    const end = new Date(window.scheduled_end);

    if (window.status === 'cancelled') return 'cancelled';
    if (window.status === 'completed' || isPast(end)) return 'completed';
    if (isWithinInterval(now, { start, end })) return 'in_progress';
    if (isFuture(start)) return 'scheduled';
    return 'completed';
  };

  const upcomingWindows = windows.filter(w => {
    const status = getWindowStatus(w);
    return status === 'scheduled' || status === 'in_progress';
  });

  const pastWindows = windows.filter(w => {
    const status = getWindowStatus(w);
    return status === 'completed' || status === 'cancelled';
  }).slice(0, 3);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          Scheduled Maintenance
        </h2>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            {isAdding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {isAdding ? 'Cancel' : 'Schedule'}
          </Button>
        )}
      </div>

      {/* Add Form - Only for admins */}
      {isAdmin && isAdding && (
        <div className="p-4 rounded-lg border border-border bg-secondary/30 space-y-3 slide-up">
          <Input
            placeholder="Maintenance title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 text-sm bg-background"
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-sm bg-background resize-none min-h-[60px]"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Start</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn(
                        'flex-1 justify-start text-left font-normal h-9 text-xs',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <Calendar className="mr-1.5 h-3.5 w-3.5" />
                      {startDate ? format(startDate, 'MMM d') : 'Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-20 h-9 text-xs bg-background"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">End</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline"
                      size="sm" 
                      className={cn(
                        'flex-1 justify-start text-left font-normal h-9 text-xs',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <Calendar className="mr-1.5 h-3.5 w-3.5" />
                      {endDate ? format(endDate, 'MMM d') : 'Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date < (startDate || new Date())}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-20 h-9 text-xs bg-background"
                />
              </div>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={addMutation.isPending}
            size="sm"
            className="w-full h-9"
          >
            {addMutation.isPending ? 'Scheduling...' : 'Schedule Maintenance'}
          </Button>
        </div>
      )}

      {/* Upcoming Maintenance */}
      {upcomingWindows.length > 0 ? (
        <div className="space-y-2">
          {upcomingWindows.map((window) => {
            const status = getWindowStatus(window);
            const isActive = status === 'in_progress';

            return (
              <article
                key={window.id}
                className={cn(
                  'group flex items-start gap-3 p-3 rounded-lg border transition-all',
                  isActive
                    ? 'border-status-maintenance bg-status-maintenance-bg'
                    : 'border-border bg-secondary/20 hover:bg-secondary/40'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-md shrink-0',
                    isActive ? 'bg-status-maintenance/10' : 'bg-secondary'
                  )}
                >
                  <Wrench
                    className={cn(
                      'h-4 w-4',
                      isActive ? 'text-status-maintenance' : 'text-muted-foreground'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-foreground truncate">{window.title}</h4>
                    <span
                      className={cn(
                        'shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium',
                        isActive
                          ? 'bg-status-maintenance/20 text-status-maintenance'
                          : 'bg-secondary text-muted-foreground'
                      )}
                    >
                      {isActive ? 'Active' : 'Scheduled'}
                    </span>
                  </div>
                  {window.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{window.description}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(new Date(window.scheduled_start), 'MMM d, HH:mm')} – {format(new Date(window.scheduled_end), 'HH:mm')}
                    </span>
                    {!isActive && (
                      <>
                        <span className="text-border">•</span>
                        <span className="text-foreground/70">
                          {formatDistanceToNow(new Date(window.scheduled_start), { addSuffix: true })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(window.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center border border-dashed border-border rounded-lg">
          <Wrench className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No upcoming maintenance</p>
        </div>
      )}

      {/* Past Maintenance */}
      {pastWindows.length > 0 && (
        <div className="pt-3 border-t border-border/50 space-y-2">
          <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Recent</h3>
          {pastWindows.map((window) => (
            <div
              key={window.id}
              className="flex items-center justify-between py-2 text-xs text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Wrench className="h-3 w-3" />
                <span className="text-foreground/70">{window.title}</span>
              </div>
              <span>{format(new Date(window.scheduled_start), 'MMM d')}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
