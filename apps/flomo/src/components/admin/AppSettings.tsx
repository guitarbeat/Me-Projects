import React, { useState, useEffect, useCallback } from 'react';
import { Settings2, Save, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface SiteSetting {
  id: string;
  key: string;
  value: unknown;
  updated_at: string | null;
  updated_by: string | null;
}

export const AppSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cat_site_settings')
        .select('*')
        .order('key');
      if (error) {
        throw error;
      }
      setSettings((data as SiteSetting[]) || []);
      setEditedValues({});
    } catch (err) {
      toast({
        title: 'Failed to load settings',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (setting: SiteSetting) => {
    const raw = editedValues[setting.key];
    if (raw === undefined) {
      return;
    }

    setSavingKey(setting.key);
    try {
      const parsed = JSON.parse(raw);
      const { error } = await supabase
        .from('cat_site_settings')
        .update({ value: parsed, updated_at: new Date().toISOString() })
        .eq('id', setting.id);
      if (error) {
        throw error;
      }
      toast({ title: 'Setting saved', description: `${setting.key} updated` });
      fetchSettings();
    } catch (err) {
      toast({
        title: 'Failed to save',
        description:
          err instanceof SyntaxError
            ? 'Invalid JSON format'
            : err instanceof Error
              ? err.message
              : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setSavingKey(null);
    }
  };

  const getDisplayValue = (setting: SiteSetting) => {
    if (editedValues[setting.key] !== undefined) {
      return editedValues[setting.key];
    }
    return JSON.stringify(setting.value, null, 2);
  };

  const hasChanges = (key: string) => editedValues[key] !== undefined;

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">App Settings</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSettings}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <CardDescription className="text-xs">
          Edit site configuration (JSON values)
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : settings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No settings configured
          </p>
        ) : (
          settings.map((setting) => (
            <div key={setting.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">{setting.key}</Label>
                {setting.updated_by && (
                  <span className="text-[10px] text-muted-foreground">
                    by {setting.updated_by} ·{' '}
                    {setting.updated_at
                      ? new Date(setting.updated_at).toLocaleDateString()
                      : ''}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <textarea
                  value={getDisplayValue(setting)}
                  onChange={(e) =>
                    setEditedValues((prev) => ({
                      ...prev,
                      [setting.key]: e.target.value,
                    }))
                  }
                  className="flex-1 min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-xs font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                  spellCheck={false}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 self-end shrink-0"
                  onClick={() => handleSave(setting)}
                  disabled={
                    !hasChanges(setting.key) || savingKey === setting.key
                  }
                >
                  {savingKey === setting.key ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
