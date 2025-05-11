
import React from 'react';

export const TestInstructions = () => {
  return (
    <details className="text-xs cursor-pointer text-muted-foreground">
      <summary>Dev setup instructions</summary>
      <div className="mt-2 p-3 bg-muted rounded-md text-left">
        <p className="font-medium">To create test users:</p>
        <ol className="list-decimal pl-4 mt-1 space-y-1">
          <li>Use the "Setup Test Users" button above</li>
          <li>Or run <code>window.setupTestUsers()</code> in browser console</li>
        </ol>
        <p className="mt-2 font-medium">If login fails after setup:</p>
        <ul className="list-disc pl-4 mt-1 space-y-1">
          <li>Check if "Confirm Email" is disabled in Supabase Auth settings</li>
          <li>Verify Site URL and Redirect URLs in Supabase Auth settings</li>
        </ul>
      </div>
    </details>
  );
};
