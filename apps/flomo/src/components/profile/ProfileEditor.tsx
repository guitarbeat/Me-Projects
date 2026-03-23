import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  User,
  Upload,
  Check,
  Settings,
  RefreshCw,
  Calendar,
  Clock,
  Sun,
  Moon,
  X,
  ChevronDown,
  Loader2,
  Trash2,
  Shield,
} from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import type { LocalUser } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import {
  processImageToBase64,
  validateImageFile,
  getAvatarSource,
  optimizeImageStorage,
  isCatImageUrl,
} from '@/lib/imageUtils';
import { eventEmitter, PROFILE_UPDATED_EVENT } from '@/lib/events';
import { normalizeUsername } from '@/lib/profileUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { PrivacySettings } from '@/components/profile/PrivacySettings';
import { SecurityOverview } from '@/components/profile/SecurityOverview';
import { AccessControlSettings } from '@/components/profile/AccessControlSettings';
import { useAdminRole } from '@/hooks/useAdminRole';
import { AdminPanel } from '@/components/admin/AdminPanel';

// Cache for cat avatars (session storage for persistence across page navigations)
const CAT_AVATARS_CACHE_KEY = 'cat_avatars_cache';
const CAT_AVATARS_CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Function to fetch multiple random cat images from The Cat API
const fetchCatAvatars = async (count: number = 6): Promise<string[]> => {
  // Check cache first
  try {
    const cached = sessionStorage.getItem(CAT_AVATARS_CACHE_KEY);
    if (cached) {
      const { urls, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CAT_AVATARS_CACHE_DURATION) {
        return urls;
      }
    }
  } catch {
    // Cache read failed, continue to fetch
  }

  try {
    const response = await fetch(
      `https://api.thecatapi.com/v1/images/search?limit=${count}&size=thumb`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch cat images');
    }
    const cats = await response.json();
    const urls = cats.map((cat: CatImage) => cat.url);

    // Cache the results
    try {
      sessionStorage.setItem(
        CAT_AVATARS_CACHE_KEY,
        JSON.stringify({
          urls,
          timestamp: Date.now(),
        })
      );
    } catch {
      // Cache write failed, but we still have the URLs
    }

    return urls;
  } catch {
    return [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=150&h=150&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=150&h=150&fit=crop&crop=face',
    ];
  }
};

interface CatImage {
  url: string;
}

interface ProfileEditorProps {
  currentAvatarUrl?: string | undefined;
  displayName?: string | undefined;
  onProfileUpdate?: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  currentAvatarUrl,
  displayName,
  onProfileUpdate: _onProfileUpdate,
}) => {
  const { user, updateFromLocalUser, deleteAccount, profile } = useAuth();
  const { toast } = useToast();
  const { isAdmin } = useAdminRole();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    currentAvatarUrl || ''
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [catAvatars, setCatAvatars] = useState<string[]>([
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=150&h=150&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=150&h=150&fit=crop&crop=face',
  ]);
  const [isLoadingCats, setIsLoadingCats] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [name, setName] = useState<string>(
    profile?.display_name || profile?.first_name || profile?.username || ''
  );
  const [nameError, setNameError] = useState<string | null>(null);

  const [initialAvatar, setInitialAvatar] = useState<string>(
    currentAvatarUrl || ''
  );
  const [initialName, setInitialName] = useState<string>(
    profile?.display_name || profile?.first_name || profile?.username || ''
  );

  // Auto-save state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle'
  );
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hasUnsavedChanges =
    selectedAvatar !== initialAvatar || name !== initialName;

  useEffect(() => {
    setName(
      profile?.display_name || profile?.first_name || profile?.username || ''
    );
  }, [profile]);

  useEffect(() => {
    if (isOpen) {
      const avatar = profile?.avatar_url || currentAvatarUrl || '';
      const displayName =
        profile?.display_name || profile?.first_name || profile?.username || '';
      setSelectedAvatar(avatar);
      setInitialAvatar(avatar);
      setName(displayName);
      setInitialName(displayName);
      setSaveStatus('idle');
    }
  }, [
    isOpen,
    profile?.avatar_url,
    currentAvatarUrl,
    profile?.display_name,
    profile?.first_name,
    profile?.username,
  ]);

  useEffect(() => {
    const loadCatAvatars = async () => {
      setIsLoadingCats(true);
      try {
        const cats = await fetchCatAvatars(6);
        setCatAvatars(cats);
      } catch {
        // Failed silently
      } finally {
        setIsLoadingCats(false);
      }
    };
    loadCatAvatars();
  }, []);

  // Auto-save implementation
  const performSave = useCallback(async () => {
    if (!user) {
      return false;
    }
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setNameError('Name must be at least 2 characters');
      return false;
    }
    if (!/^[a-zA-Z0-9_\- ]+$/.test(trimmedName)) {
      setNameError(
        'Only letters, numbers, spaces, hyphens and underscores allowed'
      );
      return false;
    }

    const normalizedUsername = normalizeUsername(trimmedName);
    const allUsers: LocalUser[] = JSON.parse(
      localStorage.getItem('allUsers') || '[]'
    );
    const existingUser = allUsers.find(
      (u) =>
        u.username.toLowerCase() === normalizedUsername.toLowerCase() &&
        u.id !== user.id
    );
    if (existingUser) {
      setNameError('This name is already taken');
      return false;
    }

    try {
      const avatarToSave =
        selectedAvatar || profile?.avatar_url || currentAvatarUrl || '';
      let optimizedImage = avatarToSave;
      if (avatarToSave) {
        optimizedImage = await optimizeImageStorage(avatarToSave, {
          maxSize: 200,
          quality: 0.8,
          format: 'jpeg',
        });
      }
      const updatedAvatar = optimizedImage || selectedAvatar || null;
      const storedUser = localStorage.getItem('currentUser');
      const parsedUser: LocalUser | null = storedUser
        ? JSON.parse(storedUser)
        : null;
      const baseUser = parsedUser || user;

      if (baseUser) {
        const updatedUser: LocalUser = {
          ...baseUser,
          displayName: trimmedName,
          avatarUrl: updatedAvatar,
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        const existingUsers: LocalUser[] = JSON.parse(
          localStorage.getItem('allUsers') || '[]'
        );
        const updatedUsers = existingUsers.map((eu) =>
          eu.id === updatedUser.id
            ? { ...eu, displayName: trimmedName, avatarUrl: updatedAvatar }
            : { ...eu, avatarUrl: eu.avatarUrl ?? null }
        );
        localStorage.setItem('allUsers', JSON.stringify(updatedUsers));
        updateFromLocalUser(updatedUser);
        setInitialAvatar(updatedAvatar || '');
        setInitialName(trimmedName);
        eventEmitter.emit(PROFILE_UPDATED_EVENT, updatedUser);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [
    user,
    name,
    selectedAvatar,
    profile?.avatar_url,
    currentAvatarUrl,
    updateFromLocalUser,
  ]);

  // Trigger auto-save when changes are made
  useEffect(() => {
    if (!isOpen || !hasUnsavedChanges) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new auto-save timeout (800ms debounce)
    autoSaveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      const success = await performSave();
      if (success) {
        setSaveStatus('saved');
        // Hide "Saved" indicator after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('idle');
      }
    }, 800);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [isOpen, name, selectedAvatar, hasUnsavedChanges, performSave]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
  };

  const handleRefreshCats = async () => {
    setIsLoadingCats(true);
    try {
      const cats = await fetchCatAvatars(6);
      setCatAvatars(cats);
      toast({
        title: 'Avatars refreshed',
        description: 'New cat avatars loaded!',
      });
    } catch {
      toast({
        title: 'Failed to load new cats',
        description: 'Using the current cat avatars',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCats(false);
    }
  };

  const { containerRef, isPulling, pullDistance, isRefreshing, progress } =
    usePullToRefresh({
      onRefresh: handleRefreshCats,
      threshold: 80,
      enabled: true,
    });

  const handleClearAvatar = () => {
    setSelectedAvatar('');
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      return;
    }

    const validationError = validateImageFile(file, 1);
    if (validationError) {
      toast({
        title: 'Invalid file',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await processImageToBase64(file, {
        maxSize: 200,
        quality: 0.8,
        format: 'jpeg',
      });
      setSelectedAvatar(base64);
      toast({ title: 'Avatar processed', description: `Ready to save` });
    } catch {
      toast({
        title: 'Upload failed',
        description: 'Failed to process image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteAccount();

      if (result.error) {
        toast({
          title: 'Error',
          description:
            result.error.message ||
            'Failed to delete account. Please try again.',
          variant: 'destructive',
        });
        setIsDeleting(false);
        return;
      }

      const storageKey = `floEntries_${user.id}`;
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`privacy_${user.id}`);
      const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
      const updatedUsers = allUsers.filter((u: LocalUser) => u.id !== user.id);
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers));

      toast({
        title: 'Account deleted',
        description: 'Your account and all data have been permanently deleted.',
      });
      setIsOpen(false);
      setShowDeleteDialog(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Get save status display
  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <span
            role="status"
            aria-live="polite"
            className="flex items-center gap-1.5 text-xs text-muted-foreground animate-fade-in"
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </span>
        );
      case 'saved':
        return (
          <span
            role="status"
            aria-live="polite"
            className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 animate-fade-in"
          >
            <Check className="h-3 w-3" />
            Saved
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="font-quicksand font-medium rounded-full px-4 sm:px-6 py-2 text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-primary/20 dark:border-primary/40 touch-manipulation min-h-[44px]"
        >
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={getAvatarSource(currentAvatarUrl)} />
            <AvatarFallback>
              <User className="h-3 w-3" />
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{displayName || 'Account'}</span>
          {isAdmin && <Shield className="h-3.5 w-3.5 text-primary ml-1" />}
          <Settings className="h-4 w-4 sm:ml-2" />
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] sm:w-full max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="flex items-center justify-between text-xl sm:text-2xl">
            <span className="flex items-center gap-2">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
              Account Settings
            </span>
            {getSaveStatusDisplay()}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList
            className={`grid w-full ${isAdmin ? 'grid-cols-3' : 'grid-cols-2'} mb-2 sm:mb-4`}
          >
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 text-sm sm:text-base min-h-[44px]"
            >
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="flex items-center gap-2 text-sm sm:text-base min-h-[44px]"
            >
              <Settings className="h-4 w-4" />
              Account
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger
                value="admin"
                className="flex items-center gap-2 text-sm sm:text-base min-h-[44px]"
              >
                <Shield className="h-4 w-4" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent
            value="profile"
            className="space-y-4 sm:space-y-6 mt-3 sm:mt-6"
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <CardTitle className="text-base sm:text-lg">
                    Account Information
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm p-4 sm:p-6 pt-0">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Member since
                    </p>
                    <p className="font-medium text-sm">
                      {new Date(
                        user?.id
                          ? parseInt(user.id.slice(0, 8), 16) * 1000
                          : Date.now()
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Last updated
                    </p>
                    <p className="font-medium text-sm">Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <Card className="border-border/50">
                  <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                    <CardTitle className="text-sm sm:text-base flex items-center justify-between">
                      <span>Avatar Preview</span>
                      {selectedAvatar && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearAvatar}
                          className="h-8 px-2 text-xs min-h-[44px] sm:min-h-0 sm:h-7"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center p-4 sm:p-6 pt-0">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 mb-3 ring-4 ring-primary/10 transition-all duration-300 hover:ring-primary/30">
                      <AvatarImage src={getAvatarSource(selectedAvatar)} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                        <User className="h-10 w-10 sm:h-12 sm:w-12 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                    {selectedAvatar && (
                      <div className="text-xs text-muted-foreground text-center bg-muted/50 px-3 py-1.5 rounded-full">
                        {isCatImageUrl(selectedAvatar)
                          ? '🐱 Cat Avatar'
                          : selectedAvatar.startsWith('data:image/')
                            ? '📸 Custom Upload'
                            : '👤 Profile Avatar'}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm sm:text-base">
                        Cat Avatars
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefreshCats}
                        disabled={isRefreshing || isLoadingCats}
                        className="h-10 w-10 sm:h-7 sm:w-7 p-0 hover:rotate-180 transition-transform duration-500 min-h-[44px] sm:min-h-0"
                        aria-label="Refresh cat avatars"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${isRefreshing || isLoadingCats ? 'animate-spin' : ''}`}
                        />
                      </Button>
                    </div>
                    <CardDescription className="text-xs">
                      Tap to select • Pull down to refresh
                    </CardDescription>
                  </CardHeader>
                  <CardContent
                    ref={containerRef}
                    className="p-4 sm:p-6 pt-0 relative max-h-[400px] overflow-y-auto"
                    style={{
                      transform: isPulling
                        ? `translateY(${Math.min(pullDistance, 80)}px)`
                        : 'none',
                      transition: isPulling
                        ? 'none'
                        : 'transform 0.3s ease-out',
                    }}
                  >
                    {(isPulling || isRefreshing) && (
                      <div className="absolute top-0 left-0 right-0 flex items-center justify-center py-2 z-10">
                        <div className="flex items-center gap-2 text-sm text-primary font-quicksand">
                          {isRefreshing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Refreshing...</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown
                                className="w-4 h-4 transition-transform"
                                style={{
                                  transform:
                                    progress >= 100
                                      ? 'rotate(180deg)'
                                      : 'rotate(0deg)',
                                }}
                              />
                              <span>
                                {progress >= 100
                                  ? 'Release to refresh'
                                  : 'Pull to refresh'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {isLoadingCats
                        ? Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              className="w-full aspect-square bg-muted rounded-full animate-pulse"
                            />
                          ))
                        : catAvatars.map((avatar, i) => (
                            <button
                              key={i}
                              onClick={() => handleAvatarSelect(avatar)}
                              className={`relative rounded-full overflow-hidden border-2 sm:border-2 border-3 transition-all duration-300 active:scale-95 sm:hover:scale-110 group touch-manipulation min-h-[60px] sm:min-h-0 ${selectedAvatar === avatar ? 'border-primary ring-4 ring-primary/20 scale-105' : 'border-border active:border-primary/50 sm:hover:border-primary/50'}`}
                              aria-label={`Select cat avatar ${i + 1}`}
                              aria-pressed={selectedAvatar === avatar}
                            >
                              <img
                                src={avatar}
                                alt=""
                                className="w-full h-full object-cover aspect-square transition-all duration-300 group-hover:brightness-110"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&h=150&fit=crop&crop=face';
                                }}
                              />
                              {selectedAvatar === avatar && (
                                <div className="absolute inset-0 bg-primary/30 flex items-center justify-center backdrop-blur-[1px]">
                                  <div className="bg-primary rounded-full p-1">
                                    <Check className="h-4 w-4 text-primary-foreground" />
                                  </div>
                                </div>
                              )}
                            </button>
                          ))}
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={isUploading}
                    className="w-full min-h-[48px] sm:min-h-[40px] border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 active:bg-primary/10 transition-all duration-300 group touch-manipulation text-sm sm:text-base"
                  >
                    <Upload className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Upload Custom Image
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Max 1MB • Auto-saves when selected
                  </p>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Card>
                  <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                      {isDarkMode ? (
                        <Moon className="h-4 w-4" />
                      ) : (
                        <Sun className="h-4 w-4" />
                      )}
                      Theme
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Tap to switch instantly
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 p-4 sm:p-6 pt-0">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={!isDarkMode ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => !isDarkMode || toggleDarkMode()}
                        aria-pressed={!isDarkMode}
                        className="transition-all duration-300 min-h-[44px] sm:min-h-[36px] touch-manipulation text-sm"
                      >
                        <Sun className="h-4 w-4 mr-2" />
                        Light
                      </Button>
                      <Button
                        variant={isDarkMode ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => isDarkMode || toggleDarkMode()}
                        aria-pressed={isDarkMode}
                        className="transition-all duration-300 min-h-[44px] sm:min-h-[36px] touch-manipulation text-sm"
                      >
                        <Moon className="h-4 w-4 mr-2" />
                        Dark
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                    <CardTitle className="text-sm sm:text-base">
                      Display Name
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Auto-saves as you type
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <Input
                      type="text"
                      aria-label="Display Name"
                      aria-invalid={!!nameError}
                      aria-describedby={
                        nameError ? 'display-name-error' : 'display-name-helper'
                      }
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setNameError(null);
                      }}
                      maxLength={32}
                      minLength={2}
                      placeholder="Your name"
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 min-h-[44px] sm:min-h-[40px] text-base"
                      disabled={isUploading}
                    />
                    {nameError ? (
                      <p
                        id="display-name-error"
                        className="text-xs text-destructive mt-2 animate-fade-in"
                        role="alert"
                      >
                        {nameError}
                      </p>
                    ) : (
                      <p
                        id="display-name-helper"
                        className="text-xs text-muted-foreground mt-2"
                      >
                        2-32 characters, letters, numbers & spaces
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Simplified footer - no save button needed */}
            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="transition-all duration-300 min-h-[48px] sm:min-h-[40px] touch-manipulation text-sm sm:text-base"
              >
                Done
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-4 mt-3 sm:mt-6">
            {/* Security Overview Dashboard */}
            <SecurityOverview
              status={{
                isPrivate:
                  (profile as typeof profile & { is_private?: boolean })
                    ?.is_private ?? false,
                hasAccessCode:
                  !!(profile as typeof profile & { pin_hash?: string | null })
                    ?.pin_hash ||
                  (profile?.has_custom_password ?? false),
              }}
              onScrollTo={(section) => {
                const el = document.getElementById(`${section}-section`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            />

            {/* Privacy Settings */}
            <PrivacySettings />

            {/* Access Control (PIN + Password) */}
            <AccessControlSettings />

            {/* Danger Zone */}
            <Card className="border-destructive/30">
              <CardHeader className="pb-3 p-4 sm:p-6">
                <div className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  <CardTitle className="text-base sm:text-lg">
                    Danger Zone
                  </CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                  <p className="text-sm text-foreground mb-3">
                    <strong>Warning:</strong> This action cannot be undone. This
                    will permanently delete:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>All your period tracking data</li>
                    <li>Your profile information</li>
                    <li>Your account settings</li>
                  </ul>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full min-h-[48px] sm:min-h-[40px] touch-manipulation"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete My Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="w-[90vw] sm:w-full max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              This action cannot be undone. This will permanently delete your
              account and remove all your period tracking data from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px]"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="w-full sm:w-auto min-h-[44px] sm:min-h-[36px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete My Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
