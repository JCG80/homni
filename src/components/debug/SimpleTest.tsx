import React from 'react';

export function SimpleTest() {
  return (
    <div className="p-4 bg-background text-foreground">
      <h1 className="text-2xl font-bold text-primary">Test Component</h1>
      <p className="text-muted-foreground">If you can see this, basic rendering is working.</p>
      <div className="mt-4 p-4 bg-card text-card-foreground rounded-lg border">
        <p>Card background test</p>
      </div>
    </div>
  );
}