import { useState, useCallback, useMemo } from 'react';
import { startOfWeek, endOfWeek, format, subWeeks, addWeeks, isSameWeek } from 'date-fns';
import { useRetrospectivesQuery } from '@/hooks/queries';
import type { Retrospective } from '@/types';

interface WeeklyDigestData {
  weekStart: Date;
  weekEnd: Date;
  retrospectives: Retrospective[];
  totalReflections: number;
  themes: string[];
  highlights: string[];
  longestEntry: Retrospective | null;
}

/**
 * Hook for managing weekly digest data and navigation
 * Uses React Query for caching and automatic refetching
 */
export const useWeeklyDigest = () => {
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(() => 
    startOfWeek(new Date(), { weekStartsOn: 0 })
  );

  // Use React Query for data fetching with caching
  const { data: allRetrospectives = [], isLoading, refetch } = useRetrospectivesQuery();

  // Filter retrospectives for the selected week
  const weeklyData = useMemo<WeeklyDigestData>(() => {
    const weekStart = selectedWeekStart;
    const weekEnd = endOfWeek(selectedWeekStart, { weekStartsOn: 0 });

    const weekRetros = allRetrospectives.filter(retro => {
      const retroDate = new Date(retro.retrospective_date);
      return retroDate >= weekStart && retroDate <= weekEnd;
    });

    // Extract themes from titles
    const themes = weekRetros
      .map(r => r.title)
      .filter(Boolean)
      .slice(0, 5);

    // Extract highlights from content
    const highlights: string[] = [];
    weekRetros.forEach(retro => {
      if (retro.content?.messages) {
        const userMessages = retro.content.messages
          .filter((m: any) => m.isUser)
          .slice(0, 2);
        userMessages.forEach((m: any) => {
          if (m.text && m.text.length > 20) {
            highlights.push(m.text.substring(0, 150) + '...');
          }
        });
      }
    });

    // Find longest entry
    let longestEntry: Retrospective | null = null;
    let maxLength = 0;
    weekRetros.forEach(retro => {
      const length = JSON.stringify(retro.content).length;
      if (length > maxLength) {
        maxLength = length;
        longestEntry = retro;
      }
    });

    return {
      weekStart,
      weekEnd,
      retrospectives: weekRetros,
      totalReflections: weekRetros.length,
      themes,
      highlights: highlights.slice(0, 6),
      longestEntry,
    };
  }, [allRetrospectives, selectedWeekStart]);

  // Navigation
  const goToPreviousWeek = useCallback(() => {
    setSelectedWeekStart(prev => subWeeks(prev, 1));
  }, []);

  const goToNextWeek = useCallback(() => {
    setSelectedWeekStart(prev => addWeeks(prev, 1));
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setSelectedWeekStart(startOfWeek(new Date(), { weekStartsOn: 0 }));
  }, []);

  const isCurrentWeek = useMemo(() => 
    isSameWeek(selectedWeekStart, new Date(), { weekStartsOn: 0 }),
    [selectedWeekStart]
  );

  // Get week label
  const weekLabel = useMemo(() => {
    const start = format(selectedWeekStart, 'MMM d');
    const end = format(endOfWeek(selectedWeekStart, { weekStartsOn: 0 }), 'MMM d, yyyy');
    return `${start} - ${end}`;
  }, [selectedWeekStart]);

  // Get available weeks (weeks that have retrospectives)
  const availableWeeks = useMemo(() => {
    const weeks = new Set<string>();
    allRetrospectives.forEach(retro => {
      const weekStart = startOfWeek(new Date(retro.retrospective_date), { weekStartsOn: 0 });
      weeks.add(weekStart.toISOString());
    });
    
    return Array.from(weeks)
      .map(w => new Date(w))
      .sort((a, b) => b.getTime() - a.getTime());
  }, [allRetrospectives]);

  return {
    weeklyData,
    isLoading,
    refetch,
    selectedWeekStart,
    setSelectedWeekStart,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    isCurrentWeek,
    weekLabel,
    availableWeeks,
  };
};
