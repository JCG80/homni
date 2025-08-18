import { Button } from '@/components/ui/button';
import { useRoleContext } from '@/contexts/RoleContext';

export default function RoleModeSwitcher() {
  const { roles, activeMode, setActiveMode, isSwitching, isLoading, error } = useRoleContext();
  if (isLoading) return null;

  const hasProfessional = roles.includes('company') || roles.includes('buyer');
  const modes: Array<'personal' | 'professional'> = ['personal'];
  if (hasProfessional) modes.push('professional');
  if (modes.length === 1) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">Modus:</span>
      {modes.map((m) => (
        <Button key={m} disabled={isSwitching} variant={activeMode === m ? 'default' : 'outline'} onClick={() => setActiveMode(m)}>
          {m === 'personal' ? 'Privat' : 'Arbeid'}
        </Button>
      ))}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}