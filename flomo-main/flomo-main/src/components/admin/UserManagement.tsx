import React, { useState, useEffect, useCallback } from 'react';
import { Users, Shield, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface AdminUser {
  user_id: string;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string;
  role: AppRole;
  created_at: string;
}

export const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_all_users_with_roles');
      if (error) {
        throw error;
      }
      setUsers((data as AdminUser[]) || []);
    } catch (err) {
      toast({
        title: 'Failed to load users',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (targetUserId: string, newRole: AppRole) => {
    setChangingRole(targetUserId);
    try {
      const { data, error } = await supabase.rpc('change_user_role', {
        target_user_id: targetUserId,
        new_role: newRole,
      });
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error('Role change failed');
      }
      toast({
        title: 'Role updated',
        description: `User role changed to ${newRole}`,
      });
      fetchUsers();
    } catch (err) {
      toast({
        title: 'Failed to change role',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setChangingRole(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) {
      return;
    }
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.rpc('delete_user_complete', {
        target_user_id: deleteTarget.user_id,
      });
      if (error) {
        throw error;
      }
      if (!data) {
        throw new Error('Delete failed');
      }
      toast({
        title: 'User deleted',
        description: `${deleteTarget.display_name || deleteTarget.username} has been removed`,
      });
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast({
        title: 'Failed to delete user',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isSelf = (userId: string) => user?.id === userId;

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">
              User Management
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription className="text-xs">
          {users.length} registered user{users.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No users found
          </p>
        ) : (
          users.map((u) => (
            <div
              key={u.user_id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={u.avatar_url} />
                <AvatarFallback className="text-xs">
                  {(u.display_name || u.username || '?')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {u.display_name || u.username}
                  </span>
                  {isSelf(u.user_id) && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                    >
                      You
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  @{u.username} · {new Date(u.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Select
                  value={u.role}
                  onValueChange={(val) =>
                    handleRoleChange(u.user_id, val as AppRole)
                  }
                  disabled={isSelf(u.user_id) || changingRole === u.user_id}
                >
                  <SelectTrigger className="w-[90px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <span className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    </SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteTarget(u)}
                  disabled={isSelf(u.user_id)}
                  title={
                    isSelf(u.user_id) ? "Can't delete yourself" : 'Delete user'
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="w-[90vw] sm:w-full max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete User?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <strong>
                {deleteTarget?.display_name || deleteTarget?.username}
              </strong>{' '}
              and all their data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="min-h-[44px] sm:min-h-[36px]"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="min-h-[44px] sm:min-h-[36px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
