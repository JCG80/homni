import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/modules/auth/hooks';

export interface LeadBid {
  id: string;
  lead_id: string;
  company_id: string;
  bid_amount_cents: number;
  max_budget_cents: number;
  auto_bid: boolean;
  message?: string;
  bid_status: 'active' | 'won' | 'lost' | 'withdrawn';
  expires_at: string;
  created_at: string;
  company_name?: string;
}

export interface BidStatistics {
  total_bids: number;
  highest_bid: number;
  average_bid: number;
  my_bid_rank?: number;
}

export const useLeadBidding = (leadId?: string, companyId?: string) => {
  const [bids, setBids] = useState<LeadBid[]>([]);
  const [myBids, setMyBids] = useState<LeadBid[]>([]);
  const [statistics, setStatistics] = useState<BidStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBids = async () => {
    if (!leadId || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch bids visible to current user
      let query = supabase
        .from('lead_bids')
        .select('*')
        .eq('lead_id', leadId)
        .eq('bid_status', 'active')
        .order('bid_amount_cents', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      const transformedBids: LeadBid[] = (data || []).map(bid => ({
        ...bid,
        bid_status: bid.bid_status as 'active' | 'won' | 'lost' | 'withdrawn'
      }));

      setBids(transformedBids);

      // Calculate statistics
      if (data && data.length > 0) {
        const amounts = data.map(bid => bid.bid_amount_cents);
        const stats: BidStatistics = {
          total_bids: data.length,
          highest_bid: Math.max(...amounts),
          average_bid: amounts.reduce((a, b) => a + b, 0) / amounts.length
        };

        // Find user's bid rank if they have a company
        if (companyId) {
          const userBid = data.find(bid => bid.company_id === companyId);
          if (userBid) {
            const sortedBids = [...data].sort((a, b) => b.bid_amount_cents - a.bid_amount_cents);
            stats.my_bid_rank = sortedBids.findIndex(bid => bid.company_id === companyId) + 1;
          }
        }

        setStatistics(stats);
      } else {
        setStatistics({ total_bids: 0, highest_bid: 0, average_bid: 0 });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bids';
      setError(errorMessage);
      console.error('Error fetching bids:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyBids = async () => {
    if (!companyId || !user) return;

    try {
      const { data, error } = await supabase
        .from('lead_bids')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedMyBids: LeadBid[] = (data || []).map(bid => ({
        ...bid,
        bid_status: bid.bid_status as 'active' | 'won' | 'lost' | 'withdrawn'
      }));

      setMyBids(transformedMyBids);
    } catch (err) {
      console.error('Error fetching company bids:', err);
    }
  };

  const placeBid = async (
    bidAmountCents: number, 
    maxBudgetCents: number, 
    message?: string, 
    autoBid: boolean = false
  ): Promise<boolean> => {
    if (!leadId || !companyId || !user) return false;

    try {
      const { error } = await supabase
        .from('lead_bids')
        .insert({
          lead_id: leadId,
          company_id: companyId,
          bid_amount_cents: bidAmountCents,
          max_budget_cents: maxBudgetCents,
          auto_bid: autoBid,
          message: message || null,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        });

      if (error) throw error;

      // Refresh bids
      await fetchBids();
      await fetchMyBids();
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to place bid';
      setError(errorMessage);
      return false;
    }
  };

  const withdrawBid = async (bidId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('lead_bids')
        .update({ bid_status: 'withdrawn' })
        .eq('id', bidId);

      if (error) throw error;

      // Refresh bids
      await fetchBids();
      await fetchMyBids();
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw bid';
      setError(errorMessage);
      return false;
    }
  };

  const updateBid = async (
    bidId: string, 
    newAmountCents: number, 
    newMaxBudget?: number, 
    newMessage?: string
  ): Promise<boolean> => {
    try {
      const updateData: any = { bid_amount_cents: newAmountCents };
      if (newMaxBudget !== undefined) updateData.max_budget_cents = newMaxBudget;
      if (newMessage !== undefined) updateData.message = newMessage;

      const { error } = await supabase
        .from('lead_bids')
        .update(updateData)
        .eq('id', bidId);

      if (error) throw error;

      // Refresh bids
      await fetchBids();
      await fetchMyBids();
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update bid';
      setError(errorMessage);
      return false;
    }
  };

  // Helper functions
  const getMyActiveBid = (): LeadBid | undefined => {
    return myBids.find(bid => bid.lead_id === leadId && bid.bid_status === 'active');
  };

  const isHighestBidder = (): boolean => {
    const myBid = getMyActiveBid();
    if (!myBid || !statistics) return false;
    return myBid.bid_amount_cents === statistics.highest_bid;
  };

  const formatBidAmount = (cents: number): string => {
    return `${(cents / 100).toLocaleString('nb-NO')} kr`;
  };

  const getTimeUntilExpiry = (expiresAt: string): string => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Utløpt';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}t ${minutes}m`;
    }
    return `${minutes}m`;
  };

  useEffect(() => {
    if (leadId && user) {
      fetchBids();
    }
  }, [leadId, user]);

  useEffect(() => {
    if (companyId && user) {
      fetchMyBids();
    }
  }, [companyId, user]);

  return {
    bids,
    myBids,
    statistics,
    isLoading,
    error,
    placeBid,
    withdrawBid,
    updateBid,
    refreshBids: fetchBids,
    // Helper functions
    getMyActiveBid,
    isHighestBidder,
    formatBidAmount,
    getTimeUntilExpiry
  };
};