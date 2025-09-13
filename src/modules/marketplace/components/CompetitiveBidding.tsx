import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Gavel, 
  TrendingUp, 
  Users, 
  Timer, 
  DollarSign, 
  Crown,
  AlertCircle,
  Send,
  Eye
} from 'lucide-react';
import { useLeadBidding } from '@/hooks/useLeadBidding';
import { useAuth } from '@/modules/auth/hooks';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CompetitiveBiddingProps {
  leadId: string;
  leadTitle: string;
  companyId?: string;
  initialPrice: number; // in cents
  canPlaceBids?: boolean;
}

export const CompetitiveBidding: React.FC<CompetitiveBiddingProps> = ({
  leadId,
  leadTitle,
  companyId,
  initialPrice,
  canPlaceBids = false
}) => {
  const { user } = useAuth();
  const {
    bids,
    statistics,
    isLoading,
    error,
    placeBid,
    withdrawBid,
    getMyActiveBid,
    isHighestBidder,
    formatBidAmount,
    getTimeUntilExpiry
  } = useLeadBidding(leadId, companyId);

  const [bidAmount, setBidAmount] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);

  const myBid = getMyActiveBid();
  const hasActiveBid = !!myBid;
  const amIWinning = isHighestBidder();

  const handlePlaceBid = async () => {
    if (!bidAmount || !maxBudget) return;

    setIsPlacingBid(true);
    const success = await placeBid(
      parseInt(bidAmount) * 100, // Convert to cents
      parseInt(maxBudget) * 100,  // Convert to cents
      bidMessage || undefined,
      false // Not auto-bid for manual placement
    );

    if (success) {
      setBidAmount('');
      setMaxBudget('');
      setBidMessage('');
    }
    setIsPlacingBid(false);
  };

  const handleWithdrawBid = async () => {
    if (!myBid) return;
    await withdrawBid(myBid.id);
  };

  const getBidStatusColor = (rank: number): string => {
    if (rank === 1) return 'hsl(var(--success))';
    if (rank <= 3) return 'hsl(var(--warning))';
    return 'hsl(var(--muted-foreground))';
  };

  const getCompetitionLevel = (): { level: string; color: string; description: string } => {
    const totalBids = statistics?.total_bids || 0;
    if (totalBids >= 10) {
      return { 
        level: 'Høy', 
        color: 'hsl(var(--destructive))', 
        description: 'Mange interesserte bedrifter' 
      };
    }
    if (totalBids >= 5) {
      return { 
        level: 'Moderat', 
        color: 'hsl(var(--warning))', 
        description: 'Flere bedrifter konkurrerer' 
      };
    }
    if (totalBids >= 2) {
      return { 
        level: 'Lav', 
        color: 'hsl(var(--primary))', 
        description: 'Noen interesserte bedrifter' 
      };
    }
    return { 
      level: 'Ingen', 
      color: 'hsl(var(--muted-foreground))', 
      description: 'Første til å by' 
    };
  };

  const competition = getCompetitionLevel();

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Kunne ikke laste budgivning: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gavel className="h-5 w-5" />
          <span>Konkurransedyktig budgivning</span>
          <Badge 
            variant="outline"
            style={{ borderColor: competition.color, color: competition.color }}
          >
            {competition.level} konkurranse
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          For: {leadTitle}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Competition Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{statistics?.total_bids || 0}</div>
            <div className="text-xs text-muted-foreground">Bud</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">
              {statistics ? formatBidAmount(statistics.highest_bid) : formatBidAmount(initialPrice)}
            </div>
            <div className="text-xs text-muted-foreground">Høyeste bud</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <DollarSign className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">
              {statistics ? formatBidAmount(statistics.average_bid) : formatBidAmount(initialPrice)}
            </div>
            <div className="text-xs text-muted-foreground">Snitt bud</div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Timer className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">24t</div>
            <div className="text-xs text-muted-foreground">Tid igjen</div>
          </div>
        </div>

        {/* My Bid Status */}
        {hasActiveBid && (
          <div className={`p-4 rounded-lg border ${amIWinning ? 'bg-success/10 border-success' : 'bg-warning/10 border-warning'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {amIWinning ? (
                  <Crown className="h-5 w-5 text-success" />
                ) : (
                  <Eye className="h-5 w-5 text-warning" />
                )}
                <div>
                  <div className="font-medium">
                    {amIWinning ? 'Du leder!' : 'Du har et aktivt bud'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ditt bud: {formatBidAmount(myBid.bid_amount_cents)}
                    {statistics?.my_bid_rank && (
                      <span> (#{statistics.my_bid_rank})</span>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleWithdrawBid}
              >
                Trekk tilbake
              </Button>
            </div>
          </div>
        )}

        {/* Competition Heat */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Konkurransenivå</span>
            <span style={{ color: competition.color }}>{competition.level}</span>
          </div>
          <Progress 
            value={Math.min(100, (statistics?.total_bids || 0) * 10)} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {competition.description}
          </p>
        </div>

        <Separator />

        {/* Bidding Form */}
        {canPlaceBids ? (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">
              {hasActiveBid ? 'Oppdater ditt bud' : 'Legg inn bud'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">
                  Ditt bud (NOK)
                </label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground">
                  Maks budsjett (NOK)
                </label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">
                Melding til kunden (valgfri)
              </label>
              <Textarea
                placeholder="Kort beskrivelse av hva du kan tilby..."
                value={bidMessage}
                onChange={(e) => setBidMessage(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handlePlaceBid}
                disabled={!bidAmount || !maxBudget || isPlacingBid}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                {isPlacingBid ? 'Legger inn bud...' : (hasActiveBid ? 'Oppdater bud' : 'Legg inn bud')}
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Bud er bindende i 24 timer. Du vil kun betale om du vinner.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <Gavel className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Kun for bedrifter</p>
            <p className="text-xs text-muted-foreground">
              Du må være registrert som bedrift for å delta i budgivning
            </p>
          </div>
        )}

        {/* Public Bid History (anonymized) */}
        {statistics && statistics.total_bids > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Siste aktivitet</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              {bids.slice(0, 3).map((bid, index) => (
                <div key={bid.id} className="flex justify-between">
                  <span>Bedrift #{index + 1}</span>
                  <span className="font-mono">
                    {formatBidAmount(bid.bid_amount_cents)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};