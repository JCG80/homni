
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BudgetInputsProps {
  dailyBudget: string;
  monthlyBudget: string;
  onDailyBudgetChange: (value: string) => void;
  onMonthlyBudgetChange: (value: string) => void;
}

export const BudgetInputs = ({
  dailyBudget,
  monthlyBudget,
  onDailyBudgetChange,
  onMonthlyBudgetChange
}: BudgetInputsProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="daily-budget">Daily Budget</Label>
        <Input
          id="daily-budget"
          type="number"
          placeholder="Daily budget amount"
          value={dailyBudget}
          onChange={(e) => onDailyBudgetChange(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="monthly-budget">Monthly Budget</Label>
        <Input
          id="monthly-budget"
          type="number"
          placeholder="Monthly budget amount"
          value={monthlyBudget}
          onChange={(e) => onMonthlyBudgetChange(e.target.value)}
        />
      </div>
    </>
  );
};
