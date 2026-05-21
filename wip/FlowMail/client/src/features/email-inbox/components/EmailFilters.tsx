import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface EmailFilterOptions {
  sender?: string;
  subject?: string;
  priority?: string;
}

interface EmailFiltersProps {
  onFilterChange: (filters: EmailFilterOptions) => void;
  activeFilters: EmailFilterOptions;
}

export function EmailFilters({ onFilterChange, activeFilters }: EmailFiltersProps) {
  const [localFilters, setLocalFilters] = useState<EmailFilterOptions>(activeFilters);
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = Object.values(activeFilters).some((value) => value);

  const handleApply = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const handleClear = () => {
    const emptyFilters = {};
    setLocalFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filter
          {hasActiveFilters && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {Object.values(activeFilters).filter(Boolean).length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Filter emails</h4>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="filter-sender" className="text-xs">
                Sender
              </Label>
              <Input
                id="filter-sender"
                placeholder="Filter by sender name or email"
                value={localFilters.sender || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, sender: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="filter-subject" className="text-xs">
                Subject
              </Label>
              <Input
                id="filter-subject"
                placeholder="Filter by subject"
                value={localFilters.subject || ''}
                onChange={(e) => setLocalFilters({ ...localFilters, subject: e.target.value })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="filter-priority" className="text-xs">
                Priority
              </Label>
              <Select
                value={localFilters.priority || 'all'}
                onValueChange={(value) =>
                  setLocalFilters({
                    ...localFilters,
                    priority: value === 'all' ? undefined : value,
                  })
                }
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleApply} className="w-full">
            Apply filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
