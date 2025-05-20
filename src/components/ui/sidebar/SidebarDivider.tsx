
import { cn } from '@/lib/utils';

interface SidebarDividerProps {
  className?: string;
  label?: string;
}

export const SidebarDivider = ({ className, label }: SidebarDividerProps) => {
  if (label) {
    return (
      <div className="relative my-4">
        <div className={cn("absolute inset-0 flex items-center", className)} aria-hidden="true">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-sidebar px-2 text-xs font-medium text-muted-foreground">
            {label}
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={cn("h-px bg-border my-2 mx-4", className)} 
      role="separator" 
      aria-orientation="horizontal" 
    />
  );
};
