import React, { useState, useEffect, useMemo } from 'react';
import { TimelineEntry } from './TimelineEntry';
import { 
  Input, Button, Badge, Tabs, TabsList, TabsTrigger, ScrollArea 
} from '@/components/ui';
import { Search, FileText, X } from '@/lib/icons/icon-imports';
import { newsprintTextStyles, newsprintInputStyles } from '@/lib';
import { LoadingSpinner } from '@/components/common';
import type { Retrospective } from '@/types';
import { useDebounce, useIsMobile } from '@/hooks';

interface TimelineViewProps {
  retrospectives: Retrospective[];
  selectedRetrospective: Retrospective | null;
  onSelectRetrospective: (retrospective: Retrospective) => void;
  onDeleteRetrospective?: (retrospective: Retrospective) => void;
  isLoading?: boolean;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  retrospectives,
  selectedRetrospective,
  onSelectRetrospective,
  onDeleteRetrospective,
  isLoading = false
}) => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  
  const entriesPerPage = 8;
  
  const filteredRetrospectives = useMemo(() => {
    return retrospectives.filter(retro => {
      const searchLower = debouncedSearchTerm.toLowerCase();
      const matchesSearch = retro.title?.toLowerCase().includes(searchLower) ||
                           retro.retrospective_date.includes(searchLower);
      const matchesType = selectedType === 'all' || retro.retrospective_type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [retrospectives, debouncedSearchTerm, selectedType]);

  const paginatedRetrospectives = useMemo(() => {
    return filteredRetrospectives.slice(
      currentPage * entriesPerPage,
      (currentPage + 1) * entriesPerPage
    );
  }, [filteredRetrospectives, currentPage]);

  const totalPages = Math.ceil(filteredRetrospectives.length / entriesPerPage);
  
  const availableTypes = useMemo(() => {
    return Array.from(new Set(retrospectives.map(r => r.retrospective_type)));
  }, [retrospectives]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchTerm, selectedType]);

  if (isLoading) {
    return (
      <div className="border border-newsprint-border sharp-corners p-6 bg-newsprint-bg flex items-center justify-center min-h-[200px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="border border-newsprint-border sharp-corners p-6 bg-newsprint-bg">
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-newsprint-foreground">
        <h2 className={`${newsprintTextStyles.h3} uppercase tracking-wider`}>
          Past Editions
        </h2>
        <Badge variant="outline" className="font-newsprint-mono">
          {retrospectives.length}
        </Badge>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-newsprint-neutral-500" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search entries..."
          className={`pl-10 ${newsprintInputStyles.default}`}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={() => setSearchTerm('')}
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <Tabs value={selectedType} onValueChange={setSelectedType} className="mb-4">
        <TabsList className="w-full sharp-corners bg-newsprint-neutral-100">
          <TabsTrigger value="all" className="flex-1 sharp-corners text-xs uppercase">
            All
          </TabsTrigger>
          {availableTypes.map(type => (
            <TabsTrigger 
              key={type} 
              value={type}
              className="flex-1 sharp-corners text-xs uppercase"
            >
              {type}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ScrollArea className="h-[400px]">
        {paginatedRetrospectives.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-newsprint-neutral-400" />
            <p className={newsprintTextStyles.body}>
              {searchTerm || selectedType !== 'all' 
                ? 'No entries match your filters'
                : 'No retrospectives yet'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {paginatedRetrospectives.map((retro, index) => (
              <TimelineEntry
                key={retro.id}
                id={retro.id}
                title={retro.title}
                date={retro.retrospective_date}
                type={retro.retrospective_type}
                isSelected={selectedRetrospective?.id === retro.id}
                onClick={() => onSelectRetrospective(retro)}
                index={index}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-newsprint-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <span className={newsprintTextStyles.metadata}>
            {currentPage + 1} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
