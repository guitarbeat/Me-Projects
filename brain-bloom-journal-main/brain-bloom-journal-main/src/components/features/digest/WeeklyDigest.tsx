import { memo } from 'react';
import { format } from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Newspaper,
  FileText,
  Zap 
} from '@/lib/icons/icon-imports';
import {
  Button,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui';
import { newsprintTextStyles } from '@/lib';
import { useWeeklyDigest } from '@/hooks/use-weekly-digest';

interface WeeklyDigestProps {
  isMobile?: boolean;
}

export const WeeklyDigest = memo<WeeklyDigestProps>(({ isMobile = false }) => {
  const {
    weeklyData,
    isLoading,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    isCurrentWeek,
    weekLabel,
  } = useWeeklyDigest();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const { retrospectives, totalReflections, themes, highlights, weekStart, weekEnd } = weeklyData;

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between border border-newsprint-border p-2 sharp-corners">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="newsprint-ghost"
              size="sm"
              onClick={goToPreviousWeek}
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Previous week</p>
          </TooltipContent>
        </Tooltip>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-newsprint-accent" />
          <span className={`${newsprintTextStyles.label} text-xs`}>{weekLabel}</span>
          {!isCurrentWeek && (
            <Button variant="newsprint-outline" size="sm" onClick={goToCurrentWeek} className="h-6 text-xs px-2">
              Today
            </Button>
          )}
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="newsprint-ghost"
              size="sm"
              onClick={goToNextWeek}
              disabled={isCurrentWeek}
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Next week</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {totalReflections === 0 ? (
        <div className="py-8 text-center">
          <Newspaper className="h-12 w-12 mx-auto mb-3 text-newsprint-neutral-400" />
          <h3 className={`${newsprintTextStyles.h3} text-lg mb-1`}>No Entries This Week</h3>
          <p className={`${newsprintTextStyles.muted} text-sm`}>
            Navigate to a different week or start a new reflection.
          </p>
        </div>
      ) : (
        <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-3 gap-4'}`}>
          {/* Stats */}
          <div className="bg-newsprint-foreground text-newsprint-bg p-4 sharp-corners">
            <div className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-1'} gap-3 text-center`}>
              <div>
                <div className="text-2xl font-newsprint-serif font-bold">{totalReflections}</div>
                <div className="text-xs uppercase tracking-wider opacity-70">Entries</div>
              </div>
              <div>
                <div className="text-2xl font-newsprint-serif font-bold">
                  {retrospectives.reduce((acc, r) => 
                    acc + (r.content?.messages?.filter((m: any) => m.isUser)?.length || 0), 0
                  )}
                </div>
                <div className="text-xs uppercase tracking-wider opacity-70">Reflections</div>
              </div>
              <div>
                <div className="text-lg font-newsprint-serif font-bold">
                  {format(weekStart, 'EEE')}-{format(weekEnd, 'EEE')}
                </div>
                <div className="text-xs uppercase tracking-wider opacity-70">Coverage</div>
              </div>
            </div>
          </div>

          {/* Entries List */}
          <div className={isMobile ? '' : 'col-span-2'}>
            <h3 className={`${newsprintTextStyles.metadata} mb-2 flex items-center gap-1`}>
              <FileText className="h-3 w-3" />
              EDITIONS
            </h3>
            <div className="space-y-2">
              {retrospectives.map((retro, index) => (
                <div key={retro.id} className="border-b border-newsprint-muted pb-2 last:border-0">
                  <div className={`${newsprintTextStyles.metadata} text-newsprint-accent text-xs`}>
                    {format(new Date(retro.retrospective_date), 'EEE, MMM d')}
                  </div>
                  <h4 className={`${newsprintTextStyles.body} text-sm font-medium truncate`}>
                    {retro.title || `Edition ${index + 1}`}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* Themes */}
          {themes.length > 0 && (
            <div className={isMobile ? '' : 'col-span-3'}>
              <h4 className={`${newsprintTextStyles.metadata} mb-2 flex items-center gap-1`}>
                <Zap className="h-3 w-3 text-newsprint-accent" />
                THEMES
              </h4>
              <div className="flex flex-wrap gap-2">
                {themes.slice(0, 4).map((theme, i) => (
                  <span key={i} className="text-xs border border-newsprint-border px-2 py-1 sharp-corners">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className={isMobile ? '' : 'col-span-3'}>
              <h4 className={`${newsprintTextStyles.metadata} mb-2`}>EXCERPTS</h4>
              <div className="space-y-2">
                {highlights.slice(0, 2).map((highlight, i) => (
                  <blockquote key={i} className="text-sm italic text-newsprint-neutral-600 border-l-2 border-newsprint-accent pl-3">
                    "{highlight.slice(0, 100)}..."
                  </blockquote>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

WeeklyDigest.displayName = 'WeeklyDigest';
