// Marketplace module exports
export { MarketplacePage } from './pages/MarketplacePage';
export { CompetitiveBidding } from './components/CompetitiveBidding';

// Re-export hooks for easy access
export { useLeadBidding } from '@/hooks/useLeadBidding';
export type { LeadBid, BidStatistics } from '@/hooks/useLeadBidding';