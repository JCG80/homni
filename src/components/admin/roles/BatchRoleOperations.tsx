import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Users, Settings, AlertTriangle } from 'lucide-react';
import { ALL_ROLES } from '@/modules/auth/normalizeRole';
import type { UserRole } from '@/modules/auth/normalizeRole';

interface BatchUser {
  email: string;
  name?: string;
  role: UserRole;
}

export const BatchRoleOperations: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [userEmails, setUserEmails] = useState('');
  const [batchOperation, setBatchOperation] = useState<'grant' | 'revoke'>('grant');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Parse email list
  const parseEmails = (emailText: string): string[] => {
    return emailText
      .split(/[\n,;]/)
      .map(email => email.trim())
      .filter(email => email && /\S+@\S+\.\S+/.test(email));
  };

  // Batch role operation mutation
  const batchRoleMutation = useMutation({
    mutationFn: async ({
      emails,
      role,
      operation,
      justification
    }: {
      emails: string[];
      role: UserRole;
      operation: 'grant' | 'revoke';
      justification: string;
    }) => {
      const results = [];
      const total = emails.length;
      
      for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        setProgress((i / total) * 100);
        
        try {
          // Find user by email
          const { data: user, error: userError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('email', email)
            .single();

          if (userError || !user) {
            results.push({ email, success: false, error: 'User not found' });
            continue;
          }

          // Perform role operation
          const rpcFunction = operation === 'grant' ? 'grant_user_role' : 'revoke_user_role';
          const params = operation === 'grant' 
            ? { _user_id: user.id, _role: role, _justification: justification }
            : { _user_id: user.id, _role: role };

          const { error: roleError } = await supabase.rpc(rpcFunction, params);
          
          if (roleError) {
            results.push({ email, success: false, error: roleError.message });
          } else {
            results.push({ email, success: true });
          }
        } catch (error) {
          results.push({ 
            email, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      setProgress(100);
      return results;
    },
    onSuccess: (results) => {
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      toast({
        title: "Batch-operasjon fullført",
        description: `${successful} vellykkede, ${failed} feilet`,
        variant: failed > 0 ? "destructive" : "default",
      });

      // Reset form
      setUserEmails('');
      setReason('');
      setSelectedRole('');
      setProgress(0);
      setIsProcessing(false);
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
    },
    onError: (error) => {
      toast({
        title: "Feil ved batch-operasjon",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
      setProgress(0);
    }
  });

  const handleBatchOperation = async () => {
    const emails = parseEmails(userEmails);
    
    if (emails.length === 0) {
      toast({
        title: "Ingen gyldige e-postadresser",
        description: "Legg inn minst én gyldig e-postadresse",
        variant: "destructive",
      });
      return;
    }

    if (!selectedRole) {
      toast({
        title: "Ingen rolle valgt",
        description: "Velg en rolle for operasjonen",
        variant: "destructive",
      });
      return;
    }

    if (batchOperation === 'grant' && !reason.trim()) {
      toast({
        title: "Mangler begrunnelse",
        description: "Oppgi en begrunnelse for rolletildelingen",
        variant: "destructive",
      });
      return;
    }

    const confirmMessage = `Er du sikker på at du vil ${batchOperation === 'grant' ? 'tildele' : 'fjerne'} rollen "${selectedRole}" ${batchOperation === 'grant' ? 'til' : 'fra'} ${emails.length} brukere?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    batchRoleMutation.mutate({
      emails,
      role: selectedRole,
      operation: batchOperation,
      justification: reason
    });
  };

  // Generate CSV template
  const downloadTemplate = () => {
    const csvContent = `email,name\nexample1@company.com,John Doe\nexample2@company.com,Jane Smith`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_users_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const emailCount = parseEmails(userEmails).length;

  return (
    <div className="space-y-6">
      {/* Operation Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Velg operasjon
          </CardTitle>
          <CardDescription>
            Velg hvilken type batch-operasjon du vil utføre
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={batchOperation === 'grant' ? 'default' : 'outline'}
              onClick={() => setBatchOperation('grant')}
              className="h-20 flex-col"
            >
              <Users className="h-6 w-6 mb-2" />
              Tildel roller
            </Button>
            <Button
              variant={batchOperation === 'revoke' ? 'default' : 'outline'}
              onClick={() => setBatchOperation('revoke')}
              className="h-20 flex-col"
            >
              <AlertTriangle className="h-6 w-6 mb-2" />
              Fjern roller
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Batch Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Konfigurasjon</CardTitle>
          <CardDescription>
            Konfigurer batch-operasjonen med rolle og brukerliste
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Role Selection */}
          <div>
            <Label htmlFor="batch-role">Rolle</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Velg en rolle..." />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Emails */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="user-emails">
                Brukere (e-postadresser)
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
              >
                <Download className="h-4 w-4 mr-2" />
                Last ned mal
              </Button>
            </div>
            <Textarea
              id="user-emails"
              placeholder="Skriv inn e-postadresser, separert med linje, komma eller semikolon..."
              value={userEmails}
              onChange={(e) => setUserEmails(e.target.value)}
              rows={6}
            />
            {emailCount > 0 && (
              <div className="mt-2">
                <Badge variant="outline">
                  {emailCount} gyldige e-postadresser funnet
                </Badge>
              </div>
            )}
          </div>

          {/* Reason (required for grant operations) */}
          {batchOperation === 'grant' && (
            <div>
              <Label htmlFor="batch-reason">Begrunnelse *</Label>
              <Textarea
                id="batch-reason"
                placeholder="Oppgi begrunnelse for batch-rolletildelingen..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress and Execution */}
      <Card>
        <CardHeader>
          <CardTitle>Utførelse</CardTitle>
          <CardDescription>
            Start batch-operasjonen når konfigurasjon er klar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isProcessing && (
            <div>
              <Label>Fremdrift</Label>
              <Progress value={progress} className="mt-2" />
              <div className="text-sm text-muted-foreground mt-1">
                {progress.toFixed(0)}% fullført
              </div>
            </div>
          )}

          <Separator />

          <Button
            onClick={handleBatchOperation}
            disabled={
              !selectedRole || 
              emailCount === 0 || 
              (batchOperation === 'grant' && !reason.trim()) ||
              isProcessing
            }
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>Behandler {emailCount} brukere...</>
            ) : (
              <>
                {batchOperation === 'grant' ? 'Tildel' : 'Fjern'} rolle{emailCount > 1 ? 'r' : ''} 
                {emailCount > 0 && ` (${emailCount} brukere)`}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Brukerveiledning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><strong>E-postformat:</strong> Skriv en e-postadresse per linje, eller separer med komma/semikolon</p>
          <p><strong>CSV Import:</strong> Last ned malen for å importere fra spreadsheet</p>
          <p><strong>Sikkerhet:</strong> Alle operasjoner logges i audit-sporet</p>
          <p><strong>Feilhåndtering:</strong> Operasjonen fortsetter selv om noen brukere feiler</p>
        </CardContent>
      </Card>
    </div>
  );
};