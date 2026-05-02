import { useState } from 'react';
import { motion } from 'framer-motion';
import { Archive, Clock, Mail, Paperclip, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Email } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatTimeAgo } from '@/lib/utils';

interface EmailListViewProps {
  emails: Email[];
  selectedIds: Set<number>;
  onSelectionChange: (ids: Set<number>) => void;
}

export function EmailListView({ emails, selectedIds, onSelectionChange }: EmailListViewProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateEmailMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PATCH', `/api/emails/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails/status/inbox'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });

  const deleteEmailMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/emails/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails/status/inbox'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: 'Email deleted',
        description: 'The email has been permanently deleted',
      });
    },
  });

  const handleToggleSelect = (id: number) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    onSelectionChange(newSelection);
  };

  const handleAction = (id: number, status: string, message: string) => {
    updateEmailMutation.mutate({ id, status });
    toast({
      title: message,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-500';
      case 'low':
        return 'text-gray-400';
      default:
        return 'text-blue-500';
    }
  };

  if (emails.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
            <span className="text-2xl">🎉</span>
          </div>
          <h3 className="mb-2 text-lg font-medium text-[var(--app-text)]">Inbox Zero!</h3>
          <p className="text-[var(--app-text-secondary)]">All emails have been processed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {emails.map((email, index) => (
        <motion.div
          key={email.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: index * 0.03 }}
          className={`group rounded-2xl border border-[var(--app-panel-border)] bg-[var(--app-panel-bg)] transition-all hover:border-primary/30 ${
            selectedIds.has(email.id) ? 'ring-2 ring-primary/20' : ''
          }`}
        >
          <div className="flex items-start gap-3 p-4">
            <Checkbox
              checked={selectedIds.has(email.id)}
              onCheckedChange={() => handleToggleSelect(email.id)}
              className="mt-1"
            />

            <div
              className="min-w-0 flex-1 cursor-pointer"
              onClick={() => setExpandedId(expandedId === email.id ? null : email.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[var(--app-text)]">{email.sender}</p>
                    {email.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                    {email.attachments && email.attachments > 0 && (
                      <Paperclip className="h-3.5 w-3.5 text-[var(--app-text-secondary)]" />
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-[var(--app-text-secondary)]">
                    {email.senderEmail}
                  </p>
                  <p className="mt-2 font-medium text-[var(--app-text)]">{email.subject}</p>
                  {expandedId === email.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 text-sm leading-6 text-[var(--app-text-secondary)]"
                    >
                      {email.body}
                    </motion.div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-[var(--app-text-secondary)]">
                    {formatTimeAgo(email.timestamp)}
                  </span>
                  <span
                    className={`text-xs font-medium uppercase ${getPriorityColor(email.priority)}`}
                  >
                    {email.priority}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAction(email.id, 'later', 'Saved for later')}
                disabled={updateEmailMutation.isPending}
                title="Save for later"
              >
                <Clock className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleAction(email.id, 'archived', 'Archived')}
                disabled={updateEmailMutation.isPending}
                title="Archive"
              >
                <Archive className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteEmailMutation.mutate(email.id)}
                disabled={deleteEmailMutation.isPending}
                title="Delete"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
