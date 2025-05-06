
import React from 'react';

interface TransitionTestResultProps {
  result: any;
  error: string | null;
  statusCode: number | null;
}

export function TransitionTestResult({ result, error, statusCode }: TransitionTestResultProps) {
  if (!result && !error) return null;
  
  return (
    <div className="space-y-2 mt-4 border-t pt-4">
      <h3 className="font-medium">Test Results</h3>
      
      {statusCode && (
        <div className="flex items-center gap-2">
          <div className={`text-sm font-medium ${statusCode >= 400 ? 'text-red-500' : 'text-green-600'}`}>
            Status: {statusCode}
          </div>
          <div className={`px-2 py-0.5 rounded text-xs ${statusCode >= 400 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {statusCode >= 400 ? 'Error' : 'Success'}
          </div>
        </div>
      )}
      
      {error && (
        <div className="text-sm bg-red-50 text-red-700 p-3 rounded border border-red-200 overflow-auto">
          <div className="font-semibold mb-1">Error:</div>
          <div className="font-mono text-xs">{error}</div>
        </div>
      )}
      
      {result && (
        <div className="mt-2">
          <div className="text-sm font-medium mb-1">Response:</div>
          <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-48">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
