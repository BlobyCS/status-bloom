import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className={cn(
        'relative p-2.5 rounded-xl transition-all duration-300 focus-ring',
        'bg-secondary hover:bg-secondary/80',
        'group'
      )}
      aria-label="Toggle theme"
    >
      <div className="relative w-4 h-4">
        <Sun className={cn(
          'absolute inset-0 h-4 w-4 transition-all duration-300',
          isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100 text-amber-500'
        )} />
        <Moon className={cn(
          'absolute inset-0 h-4 w-4 transition-all duration-300',
          isDark ? 'rotate-0 scale-100 opacity-100 text-primary' : '-rotate-90 scale-0 opacity-0'
        )} />
      </div>
    </button>
  );
}
