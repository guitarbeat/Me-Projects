import { Copy, Download, FileJson, FileSpreadsheet, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  buildCsv,
  buildEmotionSummary,
  buildExportData,
  copyTextToClipboard,
  downloadTextFile,
} from '@/features/journal/lib/export';
import { postJournalExport, postJournalSummary } from '@/features/journal/lib/n8n-client';
import type { JournalEntry } from '@/features/journal/types';

interface JournalExportMenuProps {
  entries: JournalEntry[];
}

function buildDateStamp() {
  return new Date().toISOString().split('T')[0];
}

export function JournalExportMenu({ entries }: JournalExportMenuProps) {
  const { toast } = useToast();
  const hasEntries = entries.length > 0;

  const handleDownloadJson = () => {
    const exportPayload = buildExportData(entries);

    downloadTextFile(
      JSON.stringify(exportPayload, null, 2),
      `journal-export-${buildDateStamp()}.json`,
      'application/json'
    );

    toast({
      title: 'JSON export ready',
      description: 'The full journal payload was downloaded to your device.',
    });
  };

  const handleDownloadCsv = () => {
    downloadTextFile(buildCsv(entries), `journal-export-${buildDateStamp()}.csv`, 'text/csv');

    toast({
      title: 'CSV export ready',
      description: 'A flat event list was downloaded for spreadsheet work.',
    });
  };

  const handleDownloadSummary = () => {
    const summaryPayload = buildEmotionSummary(entries);

    downloadTextFile(
      JSON.stringify(summaryPayload, null, 2),
      `journal-summary-${buildDateStamp()}.json`,
      'application/json'
    );

    toast({
      title: 'Summary export ready',
      description: 'The emotion breakdown and date range were downloaded.',
    });
  };

  const handleCopyJson = async () => {
    try {
      await copyTextToClipboard(JSON.stringify(buildExportData(entries), null, 2));
      toast({
        title: 'Copied to clipboard',
        description: 'The journal export payload is ready to paste elsewhere.',
      });
    } catch (error) {
      toast({
        title: 'Clipboard unavailable',
        description:
          error instanceof Error ? error.message : 'The browser blocked clipboard access.',
        variant: 'destructive',
      });
    }
  };

  const handleSendJson = async () => {
    const result = await postJournalExport(buildExportData(entries));

    if ('disabled' in result && result.disabled) {
      toast({
        title: 'n8n not configured',
        description: 'Set the journal webhook config before sending exports upstream.',
        variant: 'destructive',
      });
      return;
    }

    const queued = 'queued' in result ? result.queued : false;

    toast({
      title: queued ? 'Export queued' : 'Export sent',
      description: queued
        ? 'The request will retry automatically when connectivity returns.'
        : 'The journal export payload was delivered to n8n.',
    });
  };

  const handleSendSummary = async () => {
    const result = await postJournalSummary(buildEmotionSummary(entries));

    if ('disabled' in result && result.disabled) {
      toast({
        title: 'n8n not configured',
        description: 'Set the journal webhook config before sending summaries upstream.',
        variant: 'destructive',
      });
      return;
    }

    const queued = 'queued' in result ? result.queued : false;

    toast({
      title: queued ? 'Summary queued' : 'Summary sent',
      description: queued
        ? 'The request will retry automatically when connectivity returns.'
        : 'The journal summary payload was delivered to n8n.',
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Exports and automations</DropdownMenuLabel>
        <DropdownMenuItem disabled={!hasEntries} onSelect={handleDownloadJson}>
          <FileJson className="h-4 w-4" />
          Download JSON
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!hasEntries} onSelect={handleDownloadCsv}>
          <FileSpreadsheet className="h-4 w-4" />
          Download CSV
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!hasEntries} onSelect={handleDownloadSummary}>
          <Sparkles className="h-4 w-4" />
          Download summary
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled={!hasEntries} onSelect={() => void handleCopyJson()}>
          <Copy className="h-4 w-4" />
          Copy JSON payload
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!hasEntries} onSelect={() => void handleSendJson()}>
          <Send className="h-4 w-4" />
          Send export to n8n
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!hasEntries} onSelect={() => void handleSendSummary()}>
          <Send className="h-4 w-4" />
          Send summary to n8n
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
