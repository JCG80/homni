
interface TestResultDisplayProps {
  result: string | null;
  processResult: number | null;
}

export const TestResultDisplay = ({ result, processResult }: TestResultDisplayProps) => {
  return (
    <>
      {result !== null && (
        <div className="pt-4 border-t">
          <p className="text-sm font-medium">Result:</p>
          <pre className="mt-1 p-2 bg-gray-100 rounded-md overflow-auto text-sm">
            {result || 'No provider found'}
          </pre>
        </div>
      )}

      {processResult !== null && (
        <div className="pt-4 border-t">
          <p className="text-sm font-medium">Processed Leads:</p>
          <pre className="mt-1 p-2 bg-gray-100 rounded-md overflow-auto text-sm">
            {processResult} leads assigned
          </pre>
        </div>
      )}
    </>
  );
};
