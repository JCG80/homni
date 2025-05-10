
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface DistributionTogglesProps {
  pauseState: boolean;
  agentsPausedState: boolean;
  onPauseChange: () => void;
  onAgentsPausedChange: () => void;
}

export const DistributionToggles = ({
  pauseState,
  agentsPausedState,
  onPauseChange,
  onAgentsPausedChange
}: DistributionTogglesProps) => {
  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch
          id="pause-leads"
          checked={!pauseState}
          onCheckedChange={onPauseChange}
        />
        <Label htmlFor="pause-leads">{pauseState ? 'Resume' : 'Pause'} Lead Distribution</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="agents-paused"
          checked={!agentsPausedState}
          onCheckedChange={onAgentsPausedChange}
        />
        <Label htmlFor="agents-paused">{agentsPausedState ? 'Enable' : 'Disable'} Agent Lead Distribution</Label>
      </div>
    </>
  );
};
