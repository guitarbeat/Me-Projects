import { useEffect, useState } from 'react';
import { addMinutes, format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import {
  emotionMeta,
  journalEmotions,
  isJournalEmotion,
  type JournalEntry,
  type JournalSettings,
} from '@/features/journal/types';

interface JournalEventDialogProps {
  entry: JournalEntry | null;
  open: boolean;
  selectedDate: Date;
  settings: JournalSettings;
  onDelete: (id: string) => void;
  onOpenChange: (open: boolean) => void;
  onSave: (entry: JournalEntry) => void;
}

interface EntryDraft {
  emotion: JournalEntry['emotion'];
  end: string;
  notes: string;
  start: string;
  title: string;
}

function toLocalDateTimeValue(date: Date) {
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

function buildDefaultStart(selectedDate: Date) {
  const start = new Date(selectedDate);
  start.setHours(9, 0, 0, 0);
  return start;
}

function buildDraft(
  entry: JournalEntry | null,
  selectedDate: Date,
  defaultEventDuration: number
): EntryDraft {
  if (entry) {
    return {
      title: entry.title,
      notes: entry.notes,
      emotion: entry.emotion,
      start: toLocalDateTimeValue(entry.start),
      end: toLocalDateTimeValue(entry.end),
    };
  }

  const defaultStart = buildDefaultStart(selectedDate);
  const defaultEnd = addMinutes(defaultStart, defaultEventDuration);

  return {
    title: '',
    notes: '',
    emotion: 'focused',
    start: toLocalDateTimeValue(defaultStart),
    end: toLocalDateTimeValue(defaultEnd),
  };
}

export function JournalEventDialog({
  entry,
  open,
  selectedDate,
  settings,
  onDelete,
  onOpenChange,
  onSave,
}: JournalEventDialogProps) {
  const [draft, setDraft] = useState<EntryDraft>(() =>
    buildDraft(entry, selectedDate, settings.defaultEventDuration)
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraft(buildDraft(entry, selectedDate, settings.defaultEventDuration));
    setErrorMessage('');
  }, [entry, open, selectedDate, settings.defaultEventDuration]);

  const handleSave = () => {
    if (!draft.title.trim()) {
      setErrorMessage('Add a short title so this block is easy to scan later.');
      return;
    }

    const start = new Date(draft.start);
    const end = new Date(draft.end);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setErrorMessage('Choose a valid start and end time.');
      return;
    }

    if (end.getTime() <= start.getTime()) {
      setErrorMessage('End time needs to be after the start time.');
      return;
    }

    const marker = emotionMeta[draft.emotion].marker;

    onSave({
      id: entry?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: draft.title.trim(),
      notes: draft.notes.trim(),
      emotion: draft.emotion,
      emoji: marker,
      start,
      end,
      allDay: false,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit journal block' : 'Add journal block'}</DialogTitle>
          <DialogDescription>
            Capture a reflection session, a recovery block, or a follow-up checkpoint inside the
            shared workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="journal-title">Title</Label>
            <Input
              id="journal-title"
              placeholder="Weekly reset, post-meeting decompression, focus block"
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="journal-start">Start</Label>
              <Input
                id="journal-start"
                type="datetime-local"
                value={draft.start}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, start: event.target.value }))
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="journal-end">End</Label>
              <Input
                id="journal-end"
                type="datetime-local"
                value={draft.end}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, end: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Energy</Label>
            <Select
              value={draft.emotion}
              onValueChange={(value) => {
                if (!isJournalEmotion(value)) {
                  return;
                }

                setDraft((current) => ({ ...current, emotion: value }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an energy label" />
              </SelectTrigger>
              <SelectContent>
                {journalEmotions.map((emotion) => (
                  <SelectItem key={emotion} value={emotion}>
                    {emotionMeta[emotion].marker} {emotionMeta[emotion].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="journal-notes">Notes</Label>
            <Textarea
              id="journal-notes"
              placeholder="What happened, what you want to remember, or how you want to reset."
              value={draft.notes}
              onChange={(event) =>
                setDraft((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </div>

          {errorMessage ? (
            <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2">
          {entry ? (
            <Button type="button" variant="outline" onClick={() => onDelete(entry.id)}>
              Delete block
            </Button>
          ) : null}
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            {entry ? 'Save changes' : 'Add block'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
