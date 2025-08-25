import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Crown, Shield, Edit3, Building2, User } from 'lucide-react';
import { UserRole, UserProfile, ALL_ROLES } from '@/types/auth';
import { useRoleGrants } from '@/hooks/useRoleGrants';
import { formatDistanceToNow } from 'date-fns';
import { nb } from 'date-fns/locale';

const roleIcons = {
  guest: User,
  user: User,
  company: Building2,
  content_editor: Edit3,
  admin: Shield,
  master_admin: Crown,
};

const roleLabels = {
  guest: 'Gjest',
  user: 'Bruker',
  company: 'Bedrift',
  content_editor: 'Innholdsredaktør',
  admin: 'Administrator',
  master_admin: 'Master Admin',
};

interface RoleManagementProps {
  userId: string;
  userName: string;
  currentRole?: UserRole;
}

export function RoleManagement({ userId, userName, currentRole }: RoleManagementProps) {
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [context, setContext] = useState('');
  
  const {
    roleGrants,
    effectiveRoles,
    isMasterAdmin,
    isLoading,
    grantRole,
    revokeRole,
    isGranting,
    isRevoking,
  } = useRoleGrants(userId);

  const handleGrantRole = () => {
    grantRole(selectedRole, context ? { context } : undefined);
    setIsGrantDialogOpen(false);
    setContext('');
    setSelectedRole('user');
  };

  const handleRevokeRole = (role: UserRole, grantContext?: string) => {
    revokeRole(role, grantContext ? { context: grantContext } : undefined);
  };

  const availableRoles = ALL_ROLES.filter(role => 
    role !== 'guest' && !effectiveRoles.includes(role)
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Rolleadministrasjon
        </CardTitle>
        <CardDescription>
          Administrer roller og tilganger for {userName}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Master Admin Status */}
        {isMasterAdmin && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-red-600" />
              <span className="font-semibold text-red-800">Master Administrator</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Denne brukeren har full systemtilgang
            </p>
          </div>
        )}

        {/* Current Base Role */}
        {currentRole && (
          <div>
            <Label className="text-sm font-medium">Grunnrolle</Label>
            <div className="mt-2">
              <Badge variant="secondary" className="flex items-center gap-2 w-fit">
                {React.createElement(roleIcons[currentRole], { className: "h-4 w-4" })}
                {roleLabels[currentRole]}
              </Badge>
            </div>
          </div>
        )}

        {/* Effective Roles */}
        <div>
          <Label className="text-sm font-medium">Effektive roller</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {effectiveRoles.length > 0 ? (
              effectiveRoles.map((role) => {
                const Icon = roleIcons[role];
                return (
                  <Badge key={role} variant="outline" className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {roleLabels[role]}
                  </Badge>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Ingen ekstra roller tildelt</p>
            )}
          </div>
        </div>

        {/* Role Grants */}
        <div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Tildelte roller</Label>
            {availableRoles.length > 0 && (
              <Dialog open={isGrantDialogOpen} onOpenChange={setIsGrantDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Tildel rolle
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tildel ny rolle</DialogTitle>
                    <DialogDescription>
                      Tildel en ny rolle til {userName}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="role">Rolle</Label>
                      <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => {
                            const Icon = roleIcons[role];
                            return (
                              <SelectItem key={role} value={role}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  {roleLabels[role]}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="context">Kontekst (valgfritt)</Label>
                      <Textarea
                        id="context"
                        placeholder="Begrunn hvorfor denne rollen tildeles..."
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button
                      onClick={handleGrantRole}
                      disabled={isGranting}
                    >
                      {isGranting ? 'Tildeler...' : 'Tildel rolle'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="mt-3 space-y-2">
            {roleGrants.length > 0 ? (
              roleGrants.map((grant) => {
                const Icon = roleIcons[grant.role];
                return (
                  <div
                    key={grant.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{roleLabels[grant.role]}</p>
                        <p className="text-xs text-muted-foreground">
                          Tildelt {formatDistanceToNow(new Date(grant.granted_at), { 
                            locale: nb, 
                            addSuffix: true 
                          })}
                        </p>
                        {grant.context && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {grant.context}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleRevokeRole(grant.role, grant.context)}
                      disabled={isRevoking}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Ingen rolletildelinger funnet</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}