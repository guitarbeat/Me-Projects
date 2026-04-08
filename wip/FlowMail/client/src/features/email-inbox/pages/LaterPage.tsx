import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, Archive, Inbox, Trash2 } from 'lucide-react';
import type { Email } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatTimeAgo } from '@/lib/utils';

export default function LaterPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: emails = [], isLoading } = useQuery<Email[]>({
    queryKey: ['/api/emails/status/later'],
  });

  const updateEmailMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest('PATCH', `/api/emails/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails/status/later'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
  });

  const deleteEmailMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/emails/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/emails/status/later'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      toast({
        title: 'Email deleted',
        description: 'The email has been permanently deleted',
      });
    },
  });

  const handleAction = (id: number, status: string, message: string) => {
    updateEmailMutation.mutate({ id, status });
    toast({
      title: message,
    });
  };

  if (isLoading) {
    return (
      <div className="app-shell-panel flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-gray-600 dark:text-gray-400">Loading saved emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <motion.section
        className="app-shell-panel px-5 py-5 sm:px-7 sm:py-6"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-6 border-b border-[var(--app-panel-border)] pb-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-300">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="app-kicker">Saved for later</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                {emails.length} email{emails.length === 1 ? '' : 's'} waiting for review
              </h2>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--app-text-secondary)]">
            These emails need more time or attention. Move them back to inbox or archive when done.
          </p>
        </div>

        {emails.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <Clock className="h-8 w-8 text-emerald-600 dark:text-emerald-300" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-[var(--app-text)]">
                No saved emails
              </h3>
              <p className="text-[var(--app-text-secondary)]">
                Emails you save for later will appear here
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {emails.map((email, index) => (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="group rounded-2xl border border-[var(--app-panel-border)] bg-[var(--app-panel-bg)] transition-all hover:border-primary/30"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => setExpandedId(expandedId === email.id ? null : email.id)}
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[var(--app-text)]">{email.sender}</p>
                        <span className="text-xs text-[var(--app-text-secondary)]">
                          {formatTimeAgo(email.timestamp)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-[var(--app-text-secondary)]">
                        {email.senderEmail}
                      </p>
                      <p className="mt-3 font-medium text-[var(--app-text)]">{email.subject}</p>
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

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(email.id, 'inbox', 'Moved to inbox')}
                        disabled={updateEmailMutation.isPending}
                        title="Move to inbox"
                      >
                        <Inbox className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(email.id, 'archived', 'Archived')}
                        disabled={updateEmailMutation.isPending}
                        title="Archive"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteEmailMutation.mutate(email.id)}
                        disabled={deleteEmailMutation.isPending}
                        title="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
