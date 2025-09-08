import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Crown, Building2, Edit3, User } from 'lucide-react';
import { useAuth } from '@/modules/auth/hooks';
import { RoleManagement } from '@/modules/admin/components/RoleManagement';
import { UserRole } from '@/modules/auth/normalizeRole';
import { roleIcons, roleLabels } from '@/modules/auth/utils/shared/roleDisplay';

export function RoleManagementPage() {
  const { user, profile, role, isAdmin, isMasterAdmin } = useAuth();

  if (!isAdmin && !isMasterAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ingen tilgang</h3>
            <p className="text-muted-foreground">
              Du har ikke tilgang til rolleadministrasjon
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = role ? roleIcons[role as UserRole] : User;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Rolleadministrasjon</h1>
        <p className="text-muted-foreground">
          Administrer roller og tilganger for brukere i systemet
        </p>
      </div>

      {/* Current User Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Din konto
          </CardTitle>
          <CardDescription>
            Oversikt over dine roller og tilganger
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon className="h-8 w-8" />
              <div>
                <p className="font-semibold">{profile.full_name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {role ? roleLabels[role as UserRole] : 'Ukjent'}
            </Badge>
            {isMasterAdmin && (
              <Badge variant="destructive">
                Master Admin
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Management Section */}
      {isMasterAdmin && (
        <RoleManagement
          userId={user.id}
          userName={profile.full_name || user.email || 'Ukjent bruker'}
          currentRole={role as UserRole}
        />
      )}

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>Om rollesystemet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Grunnroller</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(roleLabels).map(([key, label]) => {
                const Icon = roleIcons[key as UserRole];
                return (
                  <div key={key} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Rolletildelinger</h4>
            <p className="text-sm text-muted-foreground">
              Master administratorer kan tildele og fjerne roller fra brukere. 
              Alle endringer blir logget og sporet i systemet.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RoleManagementPage;
