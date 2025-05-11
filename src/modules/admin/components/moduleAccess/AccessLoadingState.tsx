
import React from 'react';
import { Loader2 } from 'lucide-react';

export function AccessLoadingState() {
  return (
    <div className="flex justify-center items-center p-8">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2">Loading access settings...</span>
    </div>
  );
}
