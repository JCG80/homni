import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserPlus } from 'lucide-react';

export const MembersManagementPage: React.FC = () => {
  return (
    <PageLayout 
      title="Medlemsadministrasjon - Homni Admin"
      description="Administrer medlemmer og brukere i Homni-plattformen"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Medlemsadministrasjon</h1>
            <p className="text-muted-foreground mt-2">
              Oversikt og administrasjon av alle plattformens medlemmer
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Admin Panel
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Totalt Medlemmer
              </CardTitle>
              <CardDescription>
                Aktive brukere på plattformen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,234</div>
              <p className="text-sm text-muted-foreground">+12% fra forrige måned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Aktive Denne Uken
              </CardTitle>
              <CardDescription>
                Medlemmer som har vært pålogget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">856</div>
              <p className="text-sm text-muted-foreground">69% aktivitetsrate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Nye Registreringer
              </CardTitle>
              <CardDescription>
                Medlemmer registrert denne måneden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">89</div>
              <p className="text-sm text-muted-foreground">Stabil vekst</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Medlemsliste</CardTitle>
            <CardDescription>
              Detaljert medlemsadministrasjon kommer snart...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Avansert medlemsadministrasjon med søk, filtrering og rolletildeling blir tilgjengelig snart.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default MembersManagementPage;