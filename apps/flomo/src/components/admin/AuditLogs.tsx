import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Loader2, RefreshCw } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

interface SecurityMetric {
  metric: string;
  count: number;
  details: Record<string, unknown> | null;
}

const TIME_OPTIONS = [
  { label: '24h', hours: 24 },
  { label: '48h', hours: 48 },
  { label: '7d', hours: 168 },
] as const;

export const AuditLogs: React.FC = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoursBack, setHoursBack] = useState(24);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_security_summary', {
        hours_back: hoursBack,
      });
      if (error) {
        throw error;
      }
      setMetrics((data as SecurityMetric[]) || []);
    } catch (err) {
      toast({
        title: 'Failed to load audit logs',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [hoursBack, toast]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Audit Logs</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSummary}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <CardDescription className="text-xs">
            Security summary
          </CardDescription>
          <div className="flex gap-1 ml-auto">
            {TIME_OPTIONS.map((opt) => (
              <Button
                key={opt.hours}
                variant={hoursBack === opt.hours ? 'default' : 'outline'}
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => setHoursBack(opt.hours)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : metrics.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No activity in the selected time window
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {metrics.map((m, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium capitalize truncate">
                    {m.metric.replace(/_/g, ' ')}
                  </p>
                  {m.details && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {Object.entries(m.details)
                        .slice(0, 2)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    </p>
                  )}
                </div>
                <Badge
                  variant={m.count > 0 ? 'default' : 'secondary'}
                  className="ml-2 shrink-0 text-xs tabular-nums"
                >
                  {m.count}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
