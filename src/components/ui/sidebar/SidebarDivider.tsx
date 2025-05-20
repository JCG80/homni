
import { cn } from '@/lib/utils';

interface SidebarDividerProps {
  className?: string;
}

export const SidebarDivider = ({ className }: SidebarDividerProps) => {
  return (
    <div className={cn("h-px bg-border my-2 mx-4", className)} 
         role="separator" 
         aria-orientation="horizontal" />
  );
};
