import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, formatDistanceToNow, isPast, isFuture, isWithinInterval } from 'date-fns';
import { Calendar, Clock, Wrench, Plus, X, Trash2, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CalendarClock className="h-4 w-4 text-primary" />
          </div>
          <h2 className="font-semibold text-foreground">Maintenance</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className={cn(
            'h-8 text-xs gap-1.5 rounded-lg',
            isAdding ? 'text-destructive hover:text-destructive' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {isAdding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {isAdding ? 'Cancel' : 'Schedule'}
        </Button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4 slide-up">
          <Input
            placeholder="Maintenance title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-10 bg-background border-border"
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-background border-border resize-none min-h-[70px]"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Start</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={cn(
                        'flex-1 justify-start text-left font-normal h-10',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'MMM d') : 'Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
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
                  className="w-24 h-10 bg-background"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">End</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline"
                      size="sm" 
                      className={cn(
                        'flex-1 justify-start text-left font-normal h-10',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'MMM d') : 'Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
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
                  className="w-24 h-10 bg-background"
                />
              </div>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={addMutation.isPending}
            className="w-full h-10 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            {addMutation.isPending ? 'Scheduling...' : 'Schedule Maintenance'}
          </Button>
        </div>
      )}

      {/* Upcoming Maintenance */}
      {upcomingWindows.length > 0 ? (
        <div className="space-y-3">
          {upcomingWindows.map((window) => {
            const status = getWindowStatus(window);
            const isActive = status === 'in_progress';

            return (
              <article
                key={window.id}
                className={cn(
                  'group relative flex items-start gap-4 p-4 rounded-xl border transition-all',
                  isActive
                    ? 'border-status-maintenance bg-status-maintenance-bg'
                    : 'border-border hover:border-primary/30 bg-card'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-lg shrink-0',
                    isActive 
                      ? 'bg-gradient-to-br from-status-maintenance to-primary' 
                      : 'bg-secondary'
                  )}
                >
                  <Wrench
                    className={cn(
                      'h-5 w-5',
                      isActive ? 'text-white animate-pulse' : 'text-muted-foreground'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground truncate">{window.title}</h4>
                    <span
                      className={cn(
                        'shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                        isActive
                          ? 'bg-status-maintenance/20 text-status-maintenance'
                          : 'bg-primary/10 text-primary'
                      )}
                    >
                      {isActive ? 'Active' : 'Upcoming'}
                    </span>
                  </div>
                  {window.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{window.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      {format(new Date(window.scheduled_start), 'MMM d, HH:mm')} – {format(new Date(window.scheduled_end), 'HH:mm')}
                    </span>
                    {!isActive && (
                      <span className="text-primary font-medium">
                        • {formatDistanceToNow(new Date(window.scheduled_start), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(window.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="py-10 text-center rounded-xl border border-dashed border-border bg-secondary/30">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary mb-3">
            <Wrench className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">No scheduled maintenance</p>
        </div>
      )}

      {/* Past Maintenance */}
      {pastWindows.length > 0 && (
        <div className="pt-4 border-t border-border/50 space-y-2">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recent</h3>
          {pastWindows.map((window) => (
            <div
              key={window.id}
              className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary/50 text-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                <span className="text-foreground/70 font-medium">{window.title}</span>
              </div>
              <span className="text-xs text-muted-foreground">{format(new Date(window.scheduled_start), 'MMM d')}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
