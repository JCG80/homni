
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader, PlayCircle } from 'lucide-react';

interface TransitionTestButtonProps {
  isDisabled: boolean;
  isLoading: boolean;
  onClick: () => Promise<void>;
}

export function TransitionTestButton({ 
  isDisabled, 
  isLoading, 
  onClick 
}: TransitionTestButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Testing Transition...
        </>
      ) : (
        <>
          <PlayCircle className="mr-2 h-4 w-4" />
          Test Status Transition
        </>
      )}
    </Button>
  );
}
