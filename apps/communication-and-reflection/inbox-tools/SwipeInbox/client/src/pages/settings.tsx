import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Activity,
  Archive,
  BarChart3,
  CheckCircle,
  Clock,
  Inbox,
  Loader2,
  Mail,
  NotebookPen,
} from 'lucide-react';
import { type Activity as ActivityType, type Stats, emailCredentialsSchema } from '@shared/schema';
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
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { formatTimeAgo } from '@/lib/utils';

type EmailConnectionResult = {
  message?: string;
  success: boolean;
};

type FetchEmailsResult = {
  count: number;
};

const providerGuides: Record<
  string,
  { accentClass: string; note?: string; steps: string[]; title: string }
> = {
  yahoo: {
    title: 'Yahoo Mail',
    accentClass: 'border-yellow-500/40 bg-yellow-500/10',
    steps: [
      'Open Yahoo Account Security.',
      'Enable two-step verification first.',
      'Generate an app password for SwipeInbox.',
      'Use the generated password here instead of your main password.',
    ],
    note: 'Yahoo requires two-step verification before app passwords are available.',
  },
  gmail: {
    title: 'Gmail',
    accentClass: 'border-blue-500/40 bg-blue-500/10',
    steps: [
      'Enable 2-Factor Authentication in your Google account.',
      'Open App passwords in Google Account Security.',
      'Generate a Mail app password.',
      'Use the generated app password here.',
    ],
  },
  outlook: {
    title: 'Outlook',
    accentClass: 'border-violet-500/40 bg-violet-500/10',
    steps: [
      'Open Microsoft Account Security.',
      'Enable two-step verification.',
      'Create an app password for mail access.',
      'Use the app password here instead of your normal password.',
    ],
  },
};

export default function Settings() {
  const [emailProvider, setEmailProvider] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery<Stats>({
    queryKey: ['/api/stats'],
  });

  const { data: activities = [] } = useQuery<ActivityType[]>({
    queryKey: ['/api/activities'],
  });

  const { data: providers = {} } = useQuery<Record<string, unknown>>({
    queryKey: ['/api/email/providers'],
  });

  const selectedGuide = emailProvider ? providerGuides[emailProvider] : undefined;

  const testConnectionMutation = useMutation({
    mutationFn: async (credentials: { provider: string; user: string; password: string }) => {
      const response = await apiRequest('POST', '/api/email/test', credentials);
      return (await response.json()) as EmailConnectionResult;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: 'Connection successful',
          description: 'Your email credentials are working correctly.',
        });
        return;
      }

      toast({
        title: 'Connection failed',
        description: data.message || 'Please verify the provider settings and app password.',
        variant: 'destructive',
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Connection failed',
        description:
          error instanceof Error
            ? error.message
            : 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    },
  });

  const fetchEmailsMutation = useMutation({
    mutationFn: async (credentials: {
      provider: string;
      user: string;
      password: string;
      limit?: number;
    }) => {
      const response = await apiRequest('POST', '/api/email/fetch', credentials);
      return (await response.json()) as FetchEmailsResult;
    },
    onSuccess: (data) => {
      toast({
        title: 'Emails fetched successfully',
        description: `Imported ${data.count} new emails from your inbox.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emails/status/inbox'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Failed to fetch emails',
        description:
          error instanceof Error ? error.message : 'Please check your connection and try again.',
        variant: 'destructive',
      });
    },
  });

  const handleTestConnection = () => {
    const result = emailCredentialsSchema.safeParse({
      provider: emailProvider,
      user: emailAddress,
      password,
    });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const errorMessages = Object.values(errors).flat().join(', ');
      toast({
        title: 'Invalid information',
        description: errorMessages,
        variant: 'destructive',
      });
      return;
    }

    testConnectionMutation.mutate(result.data);
  };

  const handleFetchEmails = () => {
    const result = emailCredentialsSchema.safeParse({
      provider: emailProvider,
      user: emailAddress,
      password,
    });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      const errorMessages = Object.values(errors).flat().join(', ');
      toast({
        title: 'Invalid information',
        description: errorMessages,
        variant: 'destructive',
      });
      return;
    }

    fetchEmailsMutation.mutate({
      ...result.data,
      limit: 20,
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_340px]">
      <div className="grid gap-6">
        <motion.section
          className="app-shell-panel px-5 py-5 sm:px-7 sm:py-6"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="app-kicker">Settings</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Connections and defaults</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--app-text-secondary)]">
            Keep inbox triage and journal reflection aligned in the same workspace. Email setup
            lives here, while journal defaults travel with the merged host app.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="app-shell-panel-soft px-4 py-4">
              <div className="flex items-center gap-3">
                <Inbox className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-[var(--app-text)]">Inbox pipeline</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--app-text-secondary)]">
                Connect a provider, test access, and pull fresh emails into the swipe queue.
              </p>
            </div>

            <div className="app-shell-panel-soft px-4 py-4">
              <div className="flex items-center gap-3">
                <NotebookPen className="h-4 w-4 text-violet-500" />
                <p className="text-sm font-medium text-[var(--app-text)]">Journal route</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--app-text-secondary)]">
                Reflection preferences now persist directly inside SwipeInbox with no separate
                journal codepath to maintain.
              </p>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="app-shell-panel px-5 py-5 sm:px-7 sm:py-6"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--app-text)]">Connect your email</h3>
              <p className="text-sm text-[var(--app-text-secondary)]">
                Test credentials first, then pull in fresh inbox items.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="provider">Email provider</Label>
              <Select value={emailProvider} onValueChange={setEmailProvider}>
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder="Select your email provider" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(providers || {}).map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your-email@example.com"
                value={emailAddress}
                onChange={(event) => setEmailAddress(event.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="password">Password or app password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Use an app password when your provider supports it"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2"
              />
              <p className="mt-2 text-xs text-[var(--app-text-secondary)]">
                Gmail, Outlook, and Yahoo should use app-specific passwords instead of your primary
                login password.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={handleTestConnection}
                disabled={testConnectionMutation.isPending}
                variant="outline"
                className="flex-1"
              >
                {testConnectionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing
                  </>
                ) : (
                  'Test connection'
                )}
              </Button>

              <Button
                onClick={handleFetchEmails}
                disabled={fetchEmailsMutation.isPending || !emailProvider}
                className="flex-1"
              >
                {fetchEmailsMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching
                  </>
                ) : (
                  'Fetch emails'
                )}
              </Button>
            </div>

            {!emailProvider ? (
              <div className="app-shell-panel-soft px-4 py-4">
                <p className="text-sm leading-6 text-[var(--app-text-secondary)]">
                  Want a dry run before connecting a real mailbox? Seed the inbox with demo emails
                  and test the swipe flow first.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    void fetch('/api/seed', { method: 'POST' })
                      .then(async (response) => {
                        if (!response.ok) {
                          const errorMessage = (await response.text()) || 'Failed to seed demo emails.';
                          throw new Error(errorMessage);
                        }

                        queryClient.invalidateQueries({ queryKey: ['/api/emails/status/inbox'] });
                        queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
                        toast({
                          title: 'Demo emails added',
                          description: 'The inbox now has sample data for swipe testing.',
                        });
                      })
                      .catch((error: unknown) => {
                        toast({
                          title: 'Unable to add demo emails',
                          description:
                            error instanceof Error ? error.message : 'Please try again.',
                          variant: 'destructive',
                        });
                      });
                  }}
                >
                  Add demo emails
                </Button>
              </div>
            ) : null}
          </div>
        </motion.section>

        <motion.section
          className="app-shell-panel px-5 py-5 sm:px-7 sm:py-6"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <h3 className="text-base font-semibold text-[var(--app-text)]">Provider checklist</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--app-text-secondary)]">
            App passwords are the safest route for providers that support them.
          </p>

          {selectedGuide ? (
            <div className={`mt-4 rounded-3xl border px-5 py-5 ${selectedGuide.accentClass}`}>
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--app-text)]">
                {selectedGuide.title}
              </h4>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[var(--app-text-secondary)]">
                {selectedGuide.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              {selectedGuide.note ? (
                <p className="mt-3 text-xs text-[var(--app-text-secondary)]">{selectedGuide.note}</p>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 rounded-3xl border border-dashed border-[var(--app-panel-border)] px-5 py-5 text-sm leading-6 text-[var(--app-text-secondary)]">
              Choose a provider above to see a setup checklist tailored to that mailbox.
            </div>
          )}

          <div className="mt-4 space-y-2 text-sm text-[var(--app-text-secondary)]">
            <p>Always use app passwords when possible.</p>
            <p>Most providers require two-factor authentication before app passwords unlock.</p>
            <p>Generated passwords are often 16 characters without spaces.</p>
          </div>
        </motion.section>
      </div>

      <div className="grid gap-6">
        <motion.section
          className="app-shell-panel px-5 py-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--app-text)]">Statistics</h3>
              <p className="text-sm text-[var(--app-text-secondary)]">
                A quick snapshot of the inbox workflow.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="app-shell-panel-soft flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm text-[var(--app-text)]">Processed today</span>
              </div>
              <span className="text-lg font-semibold">{stats?.processedToday || 0}</span>
            </div>
            <div className="app-shell-panel-soft flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-[var(--app-text)]">Saved for later</span>
              </div>
              <span className="text-lg font-semibold">{stats?.forLater || 0}</span>
            </div>
            <div className="app-shell-panel-soft flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-3">
                <Archive className="h-4 w-4 text-rose-500" />
                <span className="text-sm text-[var(--app-text)]">Archived</span>
              </div>
              <span className="text-lg font-semibold">{stats?.archived || 0}</span>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="app-shell-panel px-5 py-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-300">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--app-text)]">Recent activity</h3>
              <p className="text-sm text-[var(--app-text-secondary)]">
                The latest movement across the inbox queue.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.slice(0, 6).map((activity) => (
                <div
                  key={activity.id}
                  className="app-shell-panel-soft flex items-start gap-3 px-4 py-4"
                >
                  <div
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${
                      activity.action === 'archived'
                        ? 'bg-rose-500'
                        : activity.action === 'later'
                          ? 'bg-emerald-500'
                          : 'bg-primary'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-6 text-[var(--app-text)]">
                      <span className="capitalize">{activity.action}</span> "{activity.emailSubject}
                      " from {activity.emailSender}
                    </p>
                    <p className="text-xs text-[var(--app-text-secondary)]">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="app-shell-panel-soft px-4 py-4 text-sm text-[var(--app-text-secondary)]">
                No activity yet. Fetch a mailbox or add demo emails to start.
              </div>
            )}
          </div>
        </motion.section>

        <motion.section
          className="app-shell-panel px-5 py-5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
        >
          <h3 className="text-base font-semibold text-[var(--app-text)]">Shared workflow</h3>
          <div className="mt-4 space-y-3">
            <div className="app-shell-panel-soft px-4 py-4 text-sm leading-6 text-[var(--app-text-secondary)]">
              Inbox is for fast action decisions. Journal is for context, energy, and follow-up
              planning.
            </div>
            <div className="app-shell-panel-soft px-4 py-4 text-sm leading-6 text-[var(--app-text-secondary)]">
              Use the same theme, shell, and routing model across both surfaces now that the apps
              are merged.
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
