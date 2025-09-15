import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Calendar, MessageSquare } from 'lucide-react';
import { ALL_ROLES } from '@/modules/auth/normalizeRole';
import type { UserRole } from '@/modules/auth/normalizeRole';

interface RoleAssignmentFormProps {
  userId: string;
  currentRoles: UserRole[];
  onSuccess: () => void;
}

export const RoleAssignmentForm: React.FC<RoleAssignmentFormProps> = ({
  userId,
  currentRoles,
  onSuccess
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [expiresAt, setExpiresAt] = useState('');
  const [reason, setReason] = useState('');
  const { toast } = useToast();

  // Grant role mutation
  const grantRoleMutation = useMutation({
    mutationFn: async ({ role, expires, justification }: { 
      role: UserRole; 
      expires?: string; 
      justification: string 
    }) => {
      const { error } = await supabase.rpc('grant_user_role', {
        _user_id: userId,
        _role: role,
        _expires_at: expires || null,
        _justification: justification
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Rolle tildelt",
        description: "Brukerrollen har blitt tildelt",
      });
      setSelectedRole('');
      setExpiresAt('');
      setReason('');
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Feil ved tildeling av rolle",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Revoke role mutation
  const revokeRoleMutation = useMutation({
    mutationFn: async ({ role }: { role: UserRole }) => {
      const { error } = await supabase.rpc('revoke_user_role', {
        _user_id: userId,
        _role: role
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Rolle fjernet",
        description: "Brukerrollen har blitt fjernet",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Feil ved fjerning av rolle",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleGrantRole = () => {
    if (!selectedRole || !reason.trim()) {
      toast({
        title: "Manglende informasjon",
        description: "Velg en rolle og oppgi en begrunnelse",
        variant: "destructive",
      });
      return;
    }

    if (currentRoles.includes(selectedRole)) {
      toast({
        title: "Rolle eksisterer allerede",
        description: "Brukeren har allerede denne rollen",
        variant: "destructive",
      });
      return;
    }

    grantRoleMutation.mutate({
      role: selectedRole,
      expires: expiresAt || undefined,
      justification: reason
    });
  };

  const handleRevokeRole = (role: UserRole) => {
    if (confirm(`Er du sikker på at du vil fjerne rollen "${role}"?`)) {
      revokeRoleMutation.mutate({ role });
    }
  };

  const availableRoles = ALL_ROLES.filter(role => !currentRoles.includes(role));

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'master_admin': return 'destructive';
      case 'admin': return 'secondary';
      case 'content_editor': return 'outline';
      case 'company': return 'default';
      case 'user': return 'outline';
      case 'guest': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleDescription = (role: UserRole) => {
    const descriptions: Record<UserRole, string> = {
      'master_admin': 'Full systemtilgang og administrasjon',
      'admin': 'Administrativ tilgang til systemfunksjoner',
      'content_editor': 'Kan redigere og publisere innhold',
      'company': 'Bedriftsbruker med utvidede funksjoner',
      'user': 'Standard bruker med grunnleggende tilgang',
      'guest': 'Begrenset tilgang, ingen autentisering'
    };
    return descriptions[role];
  };

  return (
    <div className="space-y-6">
      {/* Current Roles */}
      <div>
        <Label className="text-base font-semibold">Nåværende roller</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {currentRoles.length > 0 ? (
            currentRoles.map((role) => (
              <div key={role} className="flex items-center gap-1">
                <Badge variant={getRoleBadgeVariant(role)}>
                  {role}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRevokeRole(role)}
                  disabled={revokeRoleMutation.isPending}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))
          ) : (
            <Badge variant="outline">Ingen roller tildelt</Badge>
          )}
        </div>
      </div>

      {/* Add New Role */}
      <div className="space-y-4 border-t pt-4">
        <Label className="text-base font-semibold">Legg til ny rolle</Label>
        
        {/* Role Selection */}
        <div>
          <Label htmlFor="role-select">Velg rolle</Label>
          <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
            <SelectTrigger>
              <SelectValue placeholder="Velg en rolle..." />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  <div>
                    <div className="font-medium">{role}</div>
                    <div className="text-sm text-muted-foreground">
                      {getRoleDescription(role)}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Expiration Date (Optional) */}
        <div>
          <Label htmlFor="expires-at" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Utløpsdato (valgfri)
          </Label>
          <Input
            id="expires-at"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>

        {/* Reason */}
        <div>
          <Label htmlFor="reason" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Begrunnelse *
          </Label>
          <Textarea
            id="reason"
            placeholder="Skriv en begrunnelse for rolletildelingen..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        {/* Grant Button */}
        <Button
          onClick={handleGrantRole}
          disabled={!selectedRole || !reason.trim() || grantRoleMutation.isPending}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {grantRoleMutation.isPending ? 'Tildeler rolle...' : 'Tildel rolle'}
        </Button>
      </div>

      {availableRoles.length === 0 && (
        <div className="text-center text-muted-foreground py-4">
          Brukeren har alle tilgjengelige roller
        </div>
      )}
    </div>
  );
};