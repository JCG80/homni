
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { UserLeadFilter } from '../../types/user-filters';

interface SaveFilterDialogProps {
  activeFilter: UserLeadFilter | null;
  isLoading: boolean;
  onSaveFilter: (name: string, asDefault: boolean) => Promise<void>;
}

export const SaveFilterDialog = ({ 
  activeFilter, 
  isLoading, 
  onSaveFilter 
}: SaveFilterDialogProps) => {
  const [filterName, setFilterName] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSaveFilter = async () => {
    await onSaveFilter(
      filterName || activeFilter?.filter_name || 'Mitt filter',
      saveAsDefault
    );
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Save size={16} />
          <span>Lagre filter</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Lagre filter</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="filter-name">Filternavn</Label>
            <Input
              id="filter-name"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder={activeFilter?.filter_name || 'Mitt filter'}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="default-filter"
              checked={saveAsDefault}
              onCheckedChange={(checked) => setSaveAsDefault(!!checked)}
            />
            <Label htmlFor="default-filter">Sett som standardfilter</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Avbryt
          </Button>
          <Button onClick={handleSaveFilter} disabled={isLoading}>
            Lagre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
