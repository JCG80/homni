import { useState, useCallback } from 'react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchStep, setSearchStep] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [flowData, setFlowData] = useState<FlowData>({});

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

  const handleStepComplete = useCallback((stepData: any) => {
    setFlowData(prev => ({ ...prev, ...stepData }));
    
    // Track step completion
    console.log('SmartStart step complete:', {
      step: searchStep,
      data: stepData,
      timestamp: Date.now()
    });
    
    // Move to next step
    if (searchStep < 4) {
      setSearchStep(searchStep + 1);
    }
  }, [searchStep]);

  const resetFlow = useCallback(() => {
    setSearchQuery('');
    setSearchStep(1);
    setSearchResults([]);
    setFlowData({});
    setIsSearching(false);
    
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
    progress: ((searchStep - 1) / 3) * 100
  };
};