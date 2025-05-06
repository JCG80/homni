
import { Lead } from '../../types/types';
import { Card } from '@/components/ui/card';

interface TestResultProps {
  error: string | null;
  statusCode: number | null;
  result: Lead | null;
}

export const TestResultDisplay = ({ error, statusCode, result }: TestResultProps) => {
  return (
    <>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p className="font-medium">Error occurred:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {statusCode && !error && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="font-medium">Status Code: {statusCode}</p>
          <p className="text-sm">
            {statusCode === 201 ? "✅ Success: Lead was inserted successfully" : "Status code received"}
          </p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="font-medium">Success! Lead inserted:</p>
          <pre className="text-xs mt-2 overflow-auto p-2 bg-black/5 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
};
