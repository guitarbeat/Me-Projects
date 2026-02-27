import { memo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ArrowUpDown, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';
import type {
  SortBy,
  SortOrder,
} from '@/features/transactions/hooks/useTransactionFilters';

interface SearchAndSortProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortBy;
  onSortByChange: (value: SortBy) => void;
  sortOrder: SortOrder;
  onToggleSortOrder: () => void;
  resultCount: number;
}

export const SearchAndSort = memo(
  ({
    searchQuery,
    onSearchChange,
    sortBy,
    onSortByChange,
    sortOrder,
    onToggleSortOrder,
    resultCount,
  }: SearchAndSortProps) => {
    const isMobile = useIsMobile();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClearSearch = () => {
      onSearchChange('');
      inputRef.current?.focus();
    };

    return (
      <Card>
        <CardContent
          className={cn('space-y-3', isMobile ? 'p-3' : 'p-4 sm:p-6 space-y-4')}
        >
          {/* Mobile: Full-width stacked layout */}
          <div
            className={cn(
              'flex gap-3',
              isMobile ? 'flex-col' : 'flex-col sm:flex-row'
            )}
          >
            {/* Search input - always full width on mobile */}
            <div className="relative flex-1">
              <Search
                className={cn(
                  'absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none',
                  isMobile ? 'h-5 w-5' : 'h-4 w-4'
                )}
                aria-hidden="true"
              />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className={cn(
                  'pl-10 pr-10', // Added padding right for the clear button
                  // Mobile: Larger touch target
                  isMobile ? 'h-12 text-base' : 'min-h-[44px]'
                )}
                aria-label="Search transactions"
                aria-describedby="search-results"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className={cn(
                    'absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1',
                    isMobile ? 'h-8 w-8' : 'h-6 w-6'
                  )}
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 mx-auto" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Sort controls */}
            <div
              className={cn(
                'flex gap-2',
                // Mobile: Full width with equal distribution
                isMobile && 'w-full'
              )}
            >
              <Select value={sortBy} onValueChange={onSortByChange}>
                <SelectTrigger
                  className={cn(
                    isMobile
                      ? 'flex-1 h-12 text-base'
                      : 'flex-1 sm:w-[180px] min-h-[44px]'
                  )}
                >
                  <span className="sr-only">Sort by: </span>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date" className={cn(isMobile && 'py-3')}>
                    Date
                  </SelectItem>
                  <SelectItem value="amount" className={cn(isMobile && 'py-3')}>
                    Amount
                  </SelectItem>
                  <SelectItem value="name" className={cn(isMobile && 'py-3')}>
                    Name
                  </SelectItem>
                  <SelectItem value="person" className={cn(isMobile && 'py-3')}>
                    Person
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={onToggleSortOrder}
                aria-label={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}. Click to toggle.`}
                className={cn(
                  // Mobile: Larger touch target
                  isMobile ? 'h-12 w-12' : 'min-h-[44px] min-w-[44px]'
                )}
              >
                <ArrowUpDown
                  className={cn(
                    sortOrder === 'desc' ? 'rotate-180' : '',
                    'transition-transform',
                    isMobile ? 'h-5 w-5' : 'h-4 w-4'
                  )}
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>

          {/* ARIA live region for search results */}
          <div
            id="search-results"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              searchQuery ? 'text-muted-foreground' : 'sr-only',
              isMobile ? 'text-sm' : 'text-sm'
            )}
          >
            {searchQuery
              ? `Found ${resultCount} transaction${resultCount !== 1 ? 's' : ''}`
              : `Showing all ${resultCount} transactions`}
          </div>
        </CardContent>
      </Card>
    );
  }
);

SearchAndSort.displayName = 'SearchAndSort';
