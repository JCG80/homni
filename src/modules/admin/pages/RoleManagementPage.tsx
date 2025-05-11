
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/modules/auth/utils/roles/types';
import { canAccessModule } from '@/modules/auth/utils/roles';

const RoleManagementPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Rolleadministrasjon</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Rolletilganger</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Her kan du senere konfigurere hvilke moduler hver rolle skal ha tilgang til.
          </p>
          
          {/* TODO: Sett inn modul-tilgangs-UI her */}
          {/* 
            Dette området vil inneholde et grensesnitt for å:
            1. Vise eksisterende roller (UserRole enum)
            2. Vise moduler hver rolle har tilgang til (getAllowedModulesForRole)
            3. Endre tilgangene per rolle (toggle/checkbox UI)
            4. Lagre endringene til databasen
          */}
          
          <div className="p-4 mt-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">Nåværende roller i systemet:</h3>
            <ul className="list-disc pl-6 space-y-1">
              {Object.values(UserRole).map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Moduler og tilganger</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Dette panelet vil vise hvilke moduler som finnes i systemet og hvilke roller som har tilgang til dem.
          </p>
          
          {/* Placeholder for future module access management UI */}
          <div className="p-4 bg-muted/50 rounded-md text-center">
            <p>Modultilgangsadministrasjon kommer snart</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleManagementPage;
