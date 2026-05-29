import { useState } from 'react';
import { Transaction } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import {
  TransactionFormFields,
  TransactionFormData,
} from './TransactionFormFields';
import { useIsMobile } from '@/hooks/useMobile';
import { Plus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getLocalISODate } from '@/lib/utils';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const TransactionForm = ({
  onAdd,
  open,
  onOpenChange,
}: TransactionFormProps) => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState<TransactionFormData>({
    name: '',
    date: getLocalISODate(),
    person: '',
    inflow: '',
    outflow: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      date: getLocalISODate(),
      person: '',
      inflow: '',
      outflow: '',
    });
  };

  const hasAmount =
    (parseFloat(formData.inflow) || 0) !== 0 ||
    (parseFloat(formData.outflow) || 0) !== 0;
  const isValid = formData.name && formData.person && hasAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.person) {
      return;
    }

    const inflow = parseFloat(formData.inflow) || 0;
    const outflow = parseFloat(formData.outflow) || 0;

    if (inflow === 0 && outflow === 0) {
      return;
    }

    onAdd({
      name: formData.name,
      date: formData.date,
      person: formData.person,
      inflow,
      outflow,
      enabled: true,
    });

    resetForm();
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange?.(false);
  };

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <TransactionFormFields
        formData={formData}
        onChange={setFormData}
        isMobile={isMobile}
      />

      <div className="flex gap-2 pt-2">
        {isValid ? (
          <Button
            type="submit"
            className={`flex-1 transition-all hover:scale-[1.02] ${isMobile ? 'h-12 text-base' : ''}`}
          >
            {isMobile && <Plus className="h-4 w-4 mr-2" />}
            Add Transaction
          </Button>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div tabIndex={0} className="flex-1 cursor-not-allowed">
                <Button
                  type="submit"
                  className={`w-full transition-all hover:scale-[1.02] ${isMobile ? 'h-12 text-base' : ''}`}
                  disabled
                >
                  {isMobile && <Plus className="h-4 w-4 mr-2" />}
                  Add Transaction
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Please enter a name, person, and an amount</p>
            </TooltipContent>
          </Tooltip>
        )}
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          className={`transition-all hover:scale-[1.02] ${isMobile ? 'h-12 px-6 text-base' : ''}`}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add Transaction</DrawerTitle>
            <DrawerDescription className="sr-only">
              Enter transaction details below
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-8">{FormContent}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription className="sr-only">
            Enter transaction details below
          </DialogDescription>
        </DialogHeader>
        {FormContent}
      </DialogContent>
    </Dialog>
  );
};
