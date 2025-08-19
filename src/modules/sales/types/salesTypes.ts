export interface SellingProcess {
  id: string;
  propertyId: string;
  status: 'initiated' | 'in_progress' | 'completed' | 'cancelled';
  currentStep: number;
  totalSteps: number;
  steps: SellingStep[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SellingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  estimatedDuration: string;
  completionPercentage: number;
}

export interface MarketAnalysis {
  propertyId: string;
  estimatedValue: number;
  averageTimeOnMarket: number;
  marketTrend: 'rising' | 'stable' | 'falling';
  comparableSales: ComparableSale[];
  pricePerSqm: number;
  marketConditions: string;
  recommendations: string[];
}

export interface ComparableSale {
  address: string;
  soldPrice: number;
  soldDate: Date;
  size: number;
  similarity: number;
}

export interface ValuationReport {
  propertyId: string;
  valuationMethod: 'comparative' | 'income' | 'cost';
  estimatedValue: number;
  confidence: number;
  factors: ValuationFactor[];
  generatedAt: Date;
}

export interface ValuationFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}