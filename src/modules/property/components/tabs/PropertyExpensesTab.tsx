
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PropertyExpense } from '../../types/propertyTypes';
import { formatCurrency, formatDate } from '../../utils/propertyUtils';

interface PropertyExpensesTabProps {
  expenses: PropertyExpense[];
}

export const PropertyExpensesTab: React.FC<PropertyExpensesTabProps> = ({ expenses }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Utgifter</CardTitle>
        <CardDescription>
          Oversikt over utgifter knyttet til eiendommen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">Ingen utgifter registrert for denne eiendommen.</p>
            <Button className="mt-4">Legg til utgift</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground pb-2 border-b">
              <div>Beskrivelse</div>
              <div>Dato</div>
              <div className="text-right">Beløp</div>
            </div>
            
            {expenses.map((expense) => (
              <div key={expense.id} className="grid grid-cols-3 text-sm py-2">
                <div>{expense.name}</div>
                <div>{formatDate(expense.date)}</div>
                <div className="text-right font-medium">{formatCurrency(expense.amount)}</div>
              </div>
            ))}
            
            <div className="pt-4 border-t mt-6">
              <div className="flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold">
                  {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
