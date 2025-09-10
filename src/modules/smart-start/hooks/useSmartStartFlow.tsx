import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/modules/auth/hooks';
import { createSmartStartSubmission, updateSubmissionStep } from '../api/smartStartApi';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  relevanceScore: number;
}

interface FlowData {
  service?: string;
  serviceName?: string;
  postalCode?: string;
  location?: string;
  contact?: {
    name: string;
    email: string;
    phone: string;
  };
}

export const useSmartStartFlow = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStep, setSearchStep] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [flowData, setFlowData] = useState<FlowData>({});
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  const handleSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    setSearchQuery(query);
    
    // Track search event
    console.log('SmartStart search:', { 
      query, 
      step: searchStep,
      timestamp: Date.now() 
    });

    try {
      // Simulate search API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock search results - in real implementation, this would call the search API
      const mockResults: SearchResult[] = [
        {
          id: '1',
          title: 'Strømpriser sammenligning',
          description: 'Finn billigste strømavtale',
          category: 'energi',
          relevanceScore: 0.95
        },
        {
          id: '2', 
          title: 'Forsikring for bolig',
          description: 'Sammenlign forsikringsselskap',
          category: 'forsikring',
          relevanceScore: 0.87
        }
      ].filter(result => 
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase())
      );

      setSearchResults(mockResults);
      
      // Track search completion
      console.log('SmartStart search complete:', {
        query,
        resultCount: mockResults.length,
        step: searchStep
      });
      
    } catch (error) {
      console.error('Search failed:', error);
      console.log('SmartStart search error:', { 
        query, 
        error: error instanceof Error ? error.message : 'Unknown error',
        step: searchStep 
      });
    } finally {
      setIsSearching(false);
    }
  }, [searchStep]);

  const handleStepComplete = useCallback(async (stepData: any) => {
    const updatedFlowData = { ...flowData, ...stepData };
    setFlowData(updatedFlowData);
    
    // Track step completion
    console.log('SmartStart step complete:', {
      step: searchStep,
      data: stepData,
      timestamp: Date.now()
    });

    // Save to database
    try {
      const nextStep = searchStep + 1;
      
      if (!submissionId) {
        // Create new submission
        const { data: newSubmissionId, error } = await createSmartStartSubmission({
          session_id: sessionIdRef.current,
          postcode: updatedFlowData.postalCode || stepData.postalCode || '',
          requested_services: updatedFlowData.service ? [updatedFlowData.service] : [],
          is_company: false, // Will be determined based on user role or selection
          search_query: searchQuery,
          selected_category: updatedFlowData.serviceName || stepData.serviceName,
          flow_data: updatedFlowData,
          step_completed: nextStep,
          email: updatedFlowData.contact?.email || stepData.email
        });

        if (error) {
          console.error('Error creating submission:', error);
        } else if (newSubmissionId) {
          setSubmissionId(newSubmissionId);
        }
      } else {
        // Update existing submission
        await updateSubmissionStep(submissionId, {
          flow_data: updatedFlowData,
          step_completed: nextStep,
          email: updatedFlowData.contact?.email || stepData.email,
          postcode: updatedFlowData.postalCode || stepData.postalCode
        });
      }
    } catch (error) {
      console.error('Error saving step data:', error);
      // Don't block the flow if database save fails
    }
    
    // Move to next step
    if (searchStep < 4) {
      setSearchStep(searchStep + 1);
    }
  }, [searchStep, flowData, submissionId, searchQuery]);

  const resetFlow = useCallback(() => {
    setSearchQuery('');
    setSearchStep(1);
    setSearchResults([]);
    setFlowData({});
    setIsSearching(false);
    setSubmissionId(null);
    sessionIdRef.current = crypto.randomUUID(); // Generate new session ID
    
    // Track flow reset
    console.log('SmartStart reset:', {
      previousStep: searchStep,
      timestamp: Date.now()
    });
  }, [searchStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 4) {
      setSearchStep(step);
      
      // Track step navigation
      console.log('SmartStart step navigation:', {
        from: searchStep,
        to: step,
        timestamp: Date.now()
      });
    }
  }, [searchStep]);

  return {
    // State
    searchQuery,
    searchStep,
    isSearching,
    searchResults,
    flowData,
    
    // Actions
    handleSearch,
    handleStepComplete,
    resetFlow,
    goToStep,
    
    // Computed values
    isCompleted: searchStep === 4,
    canGoNext: searchStep < 4,
    canGoPrevious: searchStep > 1,
    progress: ((searchStep - 1) / 3) * 100,
    
    // Session and submission info
    sessionId: sessionIdRef.current,
    submissionId
  };
};