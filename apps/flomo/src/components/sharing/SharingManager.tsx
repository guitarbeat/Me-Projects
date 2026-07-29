import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Users, UserPlus, Search, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollAreaAware } from '@/components/ui/scroll-area-aware';
import { useFloSharing } from '@/hooks/useFloSharing';
import { useToast } from '@/hooks/useToast';
import { getAvatarSource } from '@/lib/imageUtils';
import type { SharedUser } from '@/types/sharing';

export const SharingManager: React.FC = () => {
  const {
    sharedWith,
    sharedWithMe,
    availableUsers,
    loading,
    addShare,
    removeShare,
    loadAvailableUsers,
  } = useFloSharing();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  // Lazy-load available users when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableUsers();
    }
  }, [isOpen, loadAvailableUsers]);

  const filteredAvailableUsers = useMemo(
    () =>
      availableUsers.filter((user) => {
        const isAlreadyShared = sharedWith.some((s) => s.id === user.id);
        if (isAlreadyShared) {
          return false;
        }

        if (!searchQuery) {
          return true;
        }

        const query = searchQuery.toLowerCase();
        return (
          user.username?.toLowerCase().includes(query) ||
          user.display_name?.toLowerCase().includes(query)
        );
      }),
    [availableUsers, sharedWith, searchQuery]
  );

  // Combined users for unified list - available users NOT shared with yet
  const allUsersWithShareStatus = useMemo(
    () => [
      ...sharedWith.map((u) => ({ ...u, isShared: true })),
      ...filteredAvailableUsers.map((u) => ({ ...u, isShared: false })),
    ],
    [sharedWith, filteredAvailableUsers]
  );

  // Handle toggle share - single tap to toggle
  const handleToggleShare = useCallback(
    async (user: SharedUser, isCurrentlyShared: boolean) => {
      setPendingAction(user.id);

      if (isCurrentlyShared) {
        const success = await removeShare(user.id);
        if (success) {
          toast({
            title: 'Removed',
            description: `${user.display_name || user.username} removed`,
          });
        }
      } else {
        const success = await addShare(user.id);
        if (success) {
          toast({
            title: 'Sharing!',
            description: `Now sharing with ${user.display_name || user.username}`,
          });
        }
      }

      setPendingAction(null);
    },
    [addShare, removeShare, toast]
  );

  // Rotating empty state messages for personality
  const emptyStateMessages = [
    'No one is sharing their calendar with you yet',
    'Your shared calendars will appear here',
    'Ask a friend to share their calendar with you! 💜',
  ];
  const [emptyMessageIndex] = useState(() =>
    Math.floor(Math.random() * emptyStateMessages.length)
  );

  // Tappable user row with inline toggle
  const UserRow: React.FC<{
    user: SharedUser & { isShared?: boolean };
    index?: number;
  }> = ({ user, index = 0 }) => {
    const isShared = user.isShared ?? false;
    const isPending = pendingAction === user.id;

    return (
      <button
        onClick={() => handleToggleShare(user, isShared)}
        disabled={isPending}
        className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all stagger-item interactive-element group"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getAvatarSource(user.avatar_url)} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {(user.display_name || user.username || '?')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="font-medium text-sm">
              {user.display_name || user.username}
            </p>
            {user.display_name && user.username && (
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            )}
          </div>
        </div>

        {/* Inline toggle indicator */}
        <div
          className={`
          flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200
          ${isPending ? 'bg-muted' : isShared ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'}
        `}
        >
          {isPending ? (
            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          ) : isShared ? (
            <Check className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
        </div>
      </button>
    );
  };

  // Read-only row for "Shared With Me"
  const SharedWithMeRow: React.FC<{ user: SharedUser; index: number }> = ({
    user,
    index,
  }) => (
    <div
      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 stagger-item"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={getAvatarSource(user.avatar_url)} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {(user.display_name || user.username || '?')[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-sm">
          {user.display_name || user.username}
        </p>
        {user.display_name && user.username && (
          <p className="text-xs text-muted-foreground">@{user.username}</p>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground gap-2"
        >
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Sharing</span>
          {sharedWith.length > 0 && (
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
              {sharedWith.length}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] sm:w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Sharing
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="sharing" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sharing" className="text-sm">
              I'm Sharing ({sharedWith.length})
            </TabsTrigger>
            <TabsTrigger value="shared-with-me" className="text-sm">
              Shared With Me ({sharedWithMe.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sharing" className="flex-1 mt-4">
            <ScrollAreaAware className="max-h-[50vh]" fadeSize="md">
              <div className="space-y-4">
                {/* Search - always visible for quick access */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search people to share with..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Unified user list - tap to toggle */}
                {loading ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Loading users...
                  </div>
                ) : allUsersWithShareStatus.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-3 opacity-50 gentle-breathe" />
                      <p className="animate-fade-in">
                        {searchQuery
                          ? 'No users found'
                          : 'No users available yet'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {/* Currently sharing section */}
                    {sharedWith.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium px-1">
                          Currently sharing with
                        </p>
                        {sharedWith.map((user, index) => (
                          <UserRow
                            key={user.id}
                            user={{ ...user, isShared: true }}
                            index={index}
                          />
                        ))}
                      </div>
                    )}

                    {/* Available to share section */}
                    {filteredAvailableUsers.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <p className="text-xs text-muted-foreground font-medium px-1">
                          Tap to share
                        </p>
                        {filteredAvailableUsers
                          .slice(0, 10)
                          .map((user, index) => (
                            <UserRow
                              key={user.id}
                              user={{ ...user, isShared: false }}
                              index={index}
                            />
                          ))}
                        {filteredAvailableUsers.length > 10 && (
                          <p className="text-xs text-center text-muted-foreground py-2">
                            Type to search for more...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollAreaAware>
          </TabsContent>

          <TabsContent value="shared-with-me" className="flex-1 mt-4">
            <ScrollAreaAware className="max-h-[50vh]" fadeSize="md">
              {sharedWithMe.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50 gentle-breathe" />
                    <p className="animate-fade-in">
                      {emptyStateMessages[emptyMessageIndex]}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      People Sharing With You
                    </CardTitle>
                    <CardDescription>
                      Tap their bubble on the calendar to view
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {sharedWithMe.map((user, index) => (
                        <SharedWithMeRow
                          key={user.id}
                          user={user}
                          index={index}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </ScrollAreaAware>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
