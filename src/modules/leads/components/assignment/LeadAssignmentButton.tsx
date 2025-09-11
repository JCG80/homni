import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { UserPlus, Zap, Users, Target } from 'lucide-react';
import { assignLeadToProvider } from '../../utils/leadAssignment';
import { DistributionStrategy } from '../../strategies/strategyFactory';

interface LeadAssignmentButtonProps {
  leadId: string;
  leadData: any;
  onAssignmentComplete?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export const LeadAssignmentButton: React.FC<LeadAssignmentButtonProps> = ({
  leadId,
  leadData,
  onAssignmentComplete,
  disabled = false,
  size = 'sm'
}) => {
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignment = async (strategy: DistributionStrategy) => {
    if (!leadData || isAssigning) return;

    setIsAssigning(true);
    try {
      const success = await assignLeadToProvider(leadData, strategy);
      
      if (success) {
        toast({
          title: "Lead tildelt",
          description: `Lead "${leadData.title}" ble tildelt med ${strategy === 'category_match' ? 'kategorimatching' : 'round-robin'} strategi`,
        });
        onAssignmentComplete?.();
      } else {
        toast({
          title: "Tildeling feilet",
          description: "Ingen tilgjengelige bedrifter funnet for denne lead-en",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Assignment error:', error);
      toast({
        title: "Feil ved tildeling",
        description: "En feil oppsto under tildeling av lead",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  if (!leadData || leadData.company_id) {
    // Lead is already assigned
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={size}
          disabled={disabled || isAssigning}
          className="gap-2"
        >
          <UserPlus className="h-4 w-4" />
          {isAssigning ? 'Tildeler...' : 'Tildel'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Tildelingsstrategier</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleAssignment('category_match')}
          disabled={isAssigning}
          className="cursor-pointer"
        >
          <Target className="h-4 w-4 mr-2" />
          Kategorimatching
          <span className="ml-auto text-xs text-muted-foreground">
            Beste match
          </span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleAssignment('roundRobin')}
          disabled={isAssigning}
          className="cursor-pointer"
        >
          <Users className="h-4 w-4 mr-2" />
          Round-robin
          <span className="ml-auto text-xs text-muted-foreground">
            Rettferdig fordeling
          </span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => handleAssignment('category_match')}
          disabled={isAssigning}
          className="cursor-pointer text-primary"
        >
          <Zap className="h-4 w-4 mr-2" />
          Auto-tildel
          <span className="ml-auto text-xs text-muted-foreground">
            Rask tildeling
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};