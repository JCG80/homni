import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, DollarSign } from 'lucide-react';

export const CompaniesManagementPage: React.FC = () => {
  return (
    <PageLayout 
      title="Bedriftsadministrasjon - Homni Admin"
      description="Administrer bedrifter og selskaper i Homni-plattformen"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Bedriftsadministrasjon</h1>
            <p className="text-muted-foreground mt-2">
              Oversikt og administrasjon av alle registrerte bedrifter
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Admin Panel
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Aktive Bedrifter
              </CardTitle>
              <CardDescription>
                Registrerte bedrifter på plattformen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">456</div>
              <p className="text-sm text-muted-foreground">+8% fra forrige måned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Kjøper-bedrifter
              </CardTitle>
              <CardDescription>
                Bedrifter med aktive kjøpspakker
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">123</div>
              <p className="text-sm text-muted-foreground">27% av alle bedrifter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Månedlig Omsetning
              </CardTitle>
              <CardDescription>
                Total omsetning fra bedriftskunder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">₦2.4M</div>
              <p className="text-sm text-muted-foreground">+15% fra forrige måned</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bedriftsoversikt</CardTitle>
            <CardDescription>
              Detaljert bedriftsadministrasjon kommer snart...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Avansert bedriftsadministrasjon med økonomioversikt, pakkeadministrasjon og detaljerte analyser blir tilgjengelig snart.
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default CompaniesManagementPage;