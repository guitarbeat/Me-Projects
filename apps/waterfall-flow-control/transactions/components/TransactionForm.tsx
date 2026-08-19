import { useState } from 'react';
import { Transaction } from '../types';
import { getTodayDateString } from '../utils/transactionUtils';
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
import { useIsMobile } from '@/hooks/useMobile';
import { Plus } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { persons } from '../utils/transactionUtils';

export interface TransactionFormData {
  name: string;
  date: string;
  person: string;
  inflow: string;
  outflow: string;
}

interface TransactionFormFieldsProps {
  formData: TransactionFormData;
  onChange: (data: TransactionFormData) => void;
  isMobile?: boolean;
}

const TransactionFormFields = ({
  formData,
  onChange,
  isMobile = false,
}: TransactionFormFieldsProps) => {
  const inputSize = isMobile ? 'h-12 text-base' : 'text-sm';

  const updateField = (field: keyof TransactionFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Transaction Name
          <span className="text-destructive ml-1" aria-hidden="true">
            *
          </span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={e => updateField('name', e.target.value)}
          placeholder="e.g., Monthly Salary, Grocery Shopping"
          required
          maxLength={100}
          className={`${inputSize} transition-all focus:ring-2 focus:ring-primary/20`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium">
            Date
            <span className="text-destructive ml-1" aria-hidden="true">
              *
            </span>
          </Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={e => updateField('date', e.target.value)}
            required
            className={`${inputSize} transition-all focus:ring-2 focus:ring-primary/20`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="person" className="text-sm font-medium">
            Person
            <span className="text-destructive ml-1" aria-hidden="true">
              *
            </span>
          </Label>
          <Select
            value={formData.person}
            onValueChange={value => updateField('person', value)}
          >
            <SelectTrigger
              className={`${inputSize} transition-all focus:ring-2 focus:ring-primary/20`}
            >
              <SelectValue placeholder="Select person" />
            </SelectTrigger>
            <SelectContent>
              {persons.map(person => (
                <SelectItem
                  key={person}
                  value={person}
                  className={isMobile ? 'py-3 text-base' : 'text-sm'}
                >
                  {person}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label
            htmlFor="inflow"
            className="text-sm font-medium flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Inflow ($)
          </Label>
          <Input
            id="inflow"
            type="number"
            step="0.01"
            min="0"
            value={formData.inflow}
            onChange={e => updateField('inflow', e.target.value)}
            placeholder="0.00"
            className={`${inputSize} font-mono transition-all focus:ring-2 focus:ring-primary/20`}
            inputMode={isMobile ? 'decimal' : undefined}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="outflow"
            className="text-sm font-medium flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-destructive"></span>
            Outflow ($)
          </Label>
          <Input
            id="outflow"
            type="number"
            step="0.01"
            min="0"
            value={formData.outflow}
            onChange={e => updateField('outflow', e.target.value)}
            placeholder="0.00"
            className={`${inputSize} font-mono transition-all focus:ring-2 focus:ring-destructive/20`}
            inputMode={isMobile ? 'decimal' : undefined}
          />
        </div>
      </div>
    </div>
  );
};

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
    date: getTodayDateString(),
    person: '',
    inflow: '',
    outflow: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      date: getTodayDateString(),
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
