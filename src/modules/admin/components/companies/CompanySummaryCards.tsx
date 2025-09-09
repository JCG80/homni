import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CompanyProfile } from '../../types/types';
import { 
  Users, 
  ToggleRight, 
  ToggleLeft, 
  CreditCard,
  AlertCircle
} from 'lucide-react';

interface CompanySummaryCardsProps {
  companies: CompanyProfile[];
}

export function CompanySummaryCards({ companies }: CompanySummaryCardsProps) {
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const inactiveCompanies = companies.filter(c => c.status === 'inactive').length;
  const totalBudget = companies.reduce((sum, c) => sum + (c.current_budget || 0), 0);
  const lowBudgetCompanies = companies.filter(c => 
    (c.current_budget || 0) <= (c.low_budget_threshold || 0)
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <div>
              <div className="text-2xl font-bold">{companies.length}</div>
              <div className="text-xs text-muted-foreground">Total Companies</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <ToggleRight className="h-4 w-4 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {activeCompanies}
              </div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-2xl font-bold text-muted-foreground">
                {inactiveCompanies}
              </div>
              <div className="text-xs text-muted-foreground">Inactive</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <div>
              <div className="text-2xl font-bold">
                kr {totalBudget.toLocaleString('no-NO')}
              </div>
              <div className="text-xs text-muted-foreground">Total Budget</div>
            </div>
            {lowBudgetCompanies > 0 && (
              <div title={`${lowBudgetCompanies} companies with low budget`}>
                <AlertCircle className="h-4 w-4 text-destructive ml-auto" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}