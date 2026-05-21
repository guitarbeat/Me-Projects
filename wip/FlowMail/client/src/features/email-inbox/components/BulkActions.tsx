import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Archive, CheckSquare, Clock, Trash2 } from 'lucide-react';
import type { Email } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface BulkActionsProps {
  emails: Email[];
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
}

export function BulkActions({ emails, selectedIds, onSelectionChange }: BulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: number[]; status: string }) => {
      await Promise.all(
        ids.map((id) => apiRequest('PATCH', `/api/emails/${id}/status`, { status }))
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails/status/inbox'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      onSelectionChange(new Set());

      const action = variables.status === 'archived' ? 'archived' : 'moved to later';
      toast({
        title: 'Success',
        description: `${variables.ids.length} email${variables.ids.length === 1 ? '' : 's'} ${action}`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update emails',
        variant: 'destructive',
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map((id) => apiRequest('DELETE', `/api/emails/${id}`)));
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails/status/inbox'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      onSelectionChange(new Set());

      toast({
        title: 'Success',
        description: `${ids.length} email${ids.length === 1 ? '' : 's'} deleted`,
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete emails',
        variant: 'destructive',
      });
    },
  });

  const handleSelectAll = () => {
    if (selectedIds.size === emails.length) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(emails.map((e) => e.id)));
    }
  };

  const handleBulkAction = (status: string) => {
    bulkUpdateMutation.mutate({ ids: Array.from(selectedIds), status });
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate(Array.from(selectedIds));
    setShowDeleteDialog(false);
  };

  if (emails.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--app-panel-border)] bg-[var(--app-panel-bg)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedIds.size === emails.length && emails.length > 0}
            onCheckedChange={handleSelectAll}
            aria-label="Select all emails"
          />
          <span className="text-sm text-[var(--app-text-secondary)]">
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select all'}
          </span>
        </div>

        {selectedIds.size > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('later')}
              disabled={bulkUpdateMutation.isPending}
            >
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              Later
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('archived')}
              disabled={bulkUpdateMutation.isPending}
            >
              <Archive className="mr-1.5 h-3.5 w-3.5" />
              Archive
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDeleteDialog(true)}
              disabled={bulkDeleteMutation.isPending}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {selectedIds.size} email{selectedIds.size === 1 ? '' : 's'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected emails will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
