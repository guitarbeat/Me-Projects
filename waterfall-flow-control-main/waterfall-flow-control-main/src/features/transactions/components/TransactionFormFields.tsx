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

export const TransactionFormFields = ({
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
