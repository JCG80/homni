
import { Loader } from 'lucide-react';

export function CompaniesLoading() {
  return (
    <div className="flex justify-center my-12">
      <Loader className="h-8 w-8 animate-spin" />
      <span className="ml-2">Laster bedrifter...</span>
    </div>
  );
}
