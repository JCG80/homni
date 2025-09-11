import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { CreateLeadModal } from './CreateLeadModal';

interface SimpleCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadCreated: () => void;
}

const SimpleCreateModal: React.FC<SimpleCreateModalProps> = ({
  open,
  onOpenChange,
  onLeadCreated
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Opprett ny lead
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <CreateLeadModal onLeadCreated={() => {
          onLeadCreated();
          onOpenChange(false);
        }} />
      </DialogContent>
    </Dialog>
  );
};

export default SimpleCreateModal;