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
  }).slice(0, 5);

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          Scheduled Maintenance
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="gap-2 hover-lift"
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAdding ? 'Cancel' : 'Schedule'}
        </Button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <div className="p-5 rounded-2xl border bg-card/50 backdrop-blur-sm space-y-4 animate-slide-up">
          <Input
            placeholder="Maintenance title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-background/50"
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-background/50 resize-none"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Start</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('flex-1 justify-start text-left font-normal', !startDate && 'text-muted-foreground')}>
                      <Calendar className="mr-2 h-4 w-4" />
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
                  className="w-24 bg-background/50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">End</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('flex-1 justify-start text-left font-normal', !endDate && 'text-muted-foreground')}>
                      <Calendar className="mr-2 h-4 w-4" />
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
                  className="w-24 bg-background/50"
                />
              </div>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={addMutation.isPending}
            className="w-full"
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
                  'group relative p-4 rounded-xl border transition-all duration-300 hover-lift',
                  isActive
                    ? 'border-l-4 border-l-status-maintenance bg-status-maintenance-bg'
                    : 'border-l-4 border-l-primary/30 bg-card/50'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'p-2 rounded-lg shrink-0',
                        isActive ? 'bg-status-maintenance/10' : 'bg-primary/10'
                      )}
                    >
                      <Wrench
                        className={cn(
                          'h-4 w-4',
                          isActive ? 'text-status-maintenance animate-spin-slow' : 'text-primary'
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{window.title}</h4>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-medium',
                            isActive
                              ? 'bg-status-maintenance/20 text-status-maintenance'
                              : 'bg-primary/10 text-primary'
                          )}
                        >
                          {isActive ? 'In Progress' : 'Scheduled'}
                        </span>
                      </div>
                      {window.description && (
                        <p className="text-sm text-muted-foreground">{window.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(new Date(window.scheduled_start), 'MMM d, HH:mm')} -{' '}
                            {format(new Date(window.scheduled_end), 'HH:mm')}
                          </span>
                        </div>
                        {!isActive && (
                          <span className="text-primary font-medium">
                            Starts {formatDistanceToNow(new Date(window.scheduled_start), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(window.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-xl border border-dashed bg-card/30 text-center">
          <Wrench className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">No upcoming maintenance scheduled</p>
        </div>
      )}

      {/* Past Maintenance */}
      {pastWindows.length > 0 && (
        <div className="space-y-3 opacity-60">
          <h3 className="text-sm font-medium text-muted-foreground">Past Maintenance</h3>
          {pastWindows.map((window) => (
            <article
              key={window.id}
              className="p-3 rounded-lg border bg-card/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-foreground">{window.title}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(window.scheduled_start), 'MMM d, yyyy')}
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Completed
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}