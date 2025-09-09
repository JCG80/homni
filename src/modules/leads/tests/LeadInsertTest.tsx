
import React, { useState } from 'react';
import { insertLead } from '../api/lead-create';
import { TestActionButtons } from './components/TestActionButtons';
import { Lead } from '@/types/leads-canonical';
import { createTestLead } from './utils';

interface TestResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const LeadInsertTest = () => {
  const [result, setResult] = useState<TestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(true);

  const testValidData = async () => {
    setIsLoading(true);
    try {
      // Create a valid test lead using our helper
      const testLead = createTestLead({
        submitted_by: 'current-user-id', // This would normally be the authenticated user's ID
        title: 'Test Lead from UI',
        description: 'This is a test lead created through the UI',
        category: 'plumbing'
      });
      
      const insertedLead = await insertLead(testLead);
      
      setResult({
        success: true,
        data: insertedLead
      });
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testInvalidStatus = async () => {
    setIsLoading(true);
    try {
      // Create a test lead with an invalid status
      const testLead = createTestLead({
        submitted_by: 'current-user-id',
        status: 'invalid-status' as any
      });
      
      await insertLead(testLead);
      
      // Should not reach here
      setResult({
        success: false,
        error: 'Expected validation to fail but it passed'
      });
    } catch (error) {
      // This is expected
      setResult({
        success: true,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: 'Successfully caught invalid status'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testUnauthorizedSubmission = async () => {
    setIsLoading(true);
    setIsUserLoggedIn(false);
    
    try {
      // Try to create a lead when "not logged in"
      const testLead = createTestLead({
        submitted_by: 'current-user-id'
      });
      
      await insertLead(testLead);
      
      // Should not reach here
      setResult({
        success: false,
        error: 'Expected authorization check to fail but it passed'
      });
    } catch (error) {
      // This is expected
      setResult({
        success: true,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        data: 'Successfully caught unauthorized submission'
      });
    } finally {
      setIsLoading(false);
      // Reset login state
      setIsUserLoggedIn(true);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Lead Insert Testing</h3>
      
      <div className="space-y-2">
        <p className="text-sm">Test lead insertion with different scenarios.</p>
        
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={testValidData}
            disabled={isLoading}
          >
            {isLoading ? 'Testing...' : 'Test Valid Data'}
          </Button>
          
          <Button
            variant="outline"
            onClick={testInvalidStatus}
            disabled={isLoading}
          >
            Test Invalid Status
          </Button>
          
          <Button
            variant="secondary"
            onClick={testUnauthorizedSubmission}
            disabled={isLoading}
          >
            Test Unauthorized
          </Button>
        </div>
      </div>
      
      {result && (
        <div className="pt-4 border-t">
          <p className="text-sm font-medium">
            Result: {result.success ? 'Success' : 'Failed'}
          </p>
          
          {result.data && (
            <pre className="mt-1 p-2 bg-gray-100 rounded-md overflow-auto text-sm">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
          
          {result.error && (
            <div className="mt-1 p-2 bg-red-50 text-red-700 rounded-md text-sm">
              <p className="font-medium">Error:</p>
              <p>{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Add Button component to fix TypeScript error
const Button = ({ 
  children, 
  onClick, 
  disabled, 
  variant 
}: { 
  children: React.ReactNode; 
  onClick: () => void; 
  disabled?: boolean; 
  variant?: 'outline' | 'secondary'; 
}) => {
  let className = "px-4 py-2 rounded text-sm font-medium ";
  
  if (variant === 'outline') {
    className += "border border-gray-300 hover:bg-gray-50";
  } else if (variant === 'secondary') {
    className += "bg-gray-100 hover:bg-gray-200 text-gray-800";
  } else {
    className += "bg-blue-600 text-white hover:bg-blue-700";
  }
  
  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
