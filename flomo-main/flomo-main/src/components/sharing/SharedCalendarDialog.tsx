import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserCalendar } from '@/components/calendar/UserCalendar';
import { LoadingSpinner } from '@/components/feedback/LoadingSpinner';
import { useCalendarNavigation } from '@/hooks/useCalendarNavigation';
import { RefreshCw } from 'lucide-react';
import type { SharedCalendarData } from '@/hooks/useSharedCalendar';

interface SharedCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendarData: SharedCalendarData | null;
  loading: boolean;
  updateCount?: number;
  onClearUpdateCount?: () => void;
}

export const SharedCalendarDialog = ({
  open,
  onOpenChange,
  calendarData,
  loading,
  updateCount = 0,
  onClearUpdateCount,
}: SharedCalendarDialogProps) => {
  const { currentDate, navigateMonth } = useCalendarNavigation();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && onClearUpdateCount) {
      onClearUpdateCount();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {calendarData && (
              <>
                <Avatar className="h-8 w-8">
                  {calendarData.avatarUrl ? (
                    <AvatarImage
                      src={calendarData.avatarUrl}
                      alt={calendarData.displayName}
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {calendarData.displayName[0]?.toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="flex-1">
                  {calendarData.displayName}'s Calendar
                </span>
                {updateCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-primary/10 text-primary animate-fade-in"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {updateCount} update{updateCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </>
            )}
            {!calendarData && !loading && <span>Shared Calendar</span>}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
            <span className="ml-3 text-muted-foreground">
              Loading calendar...
            </span>
          </div>
        )}

        {!loading && !calendarData && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Unable to load calendar. You may not have access.</p>
          </div>
        )}

        {!loading && calendarData && (
          <UserCalendar
            currentDate={currentDate}
            floEntries={calendarData.entries}
            onNavigate={navigateMonth}
            readOnly
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
