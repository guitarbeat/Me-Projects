import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Inbox, BarChart, NotebookPen, X, CornerDownLeft, Command } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Email, Activity } from '@shared/schema';
import { loadJournalEvents } from '../features/journal/lib/storage';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  type: 'email' | 'activity' | 'journal';
  title: string;
  subtitle: string;
  date: string;
  original: any;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  // 1. Data Fetching
  const { data: emails = [] } = useQuery<Email[]>({
    queryKey: ['/api/emails'],
    enabled: isOpen,
  });

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
    enabled: isOpen,
  });

  const journalEntries = useMemo(() => (isOpen ? loadJournalEvents() : []), [isOpen]);

  // 2. Unified Search Logic
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const matches: SearchResult[] = [];

    // Search Emails
    emails.forEach((email) => {
      if (email.subject.toLowerCase().includes(q) || email.sender.toLowerCase().includes(q)) {
        matches.push({
          id: `email-${email.id}`,
          type: 'email',
          title: email.subject,
          subtitle: `from ${email.sender}`,
          date: new Date(email.timestamp || '').toLocaleDateString(),
          original: email,
        });
      }
    });

    // Search Journal
    journalEntries.forEach((entry) => {
      if (entry.title.toLowerCase().includes(q) || entry.notes?.toLowerCase().includes(q)) {
        matches.push({
          id: `journal-${entry.id}`,
          type: 'journal',
          title: entry.title,
          subtitle: entry.notes || 'No notes',
          date: entry.start.toLocaleDateString(),
          original: entry,
        });
      }
    });

    // Search Activities
    activities.forEach((activity) => {
      if (
        activity.emailSubject?.toLowerCase().includes(q) ||
        activity.action.toLowerCase().includes(q)
      ) {
        matches.push({
          id: `activity-${activity.id}`,
          type: 'activity',
          title: `${activity.action.toUpperCase()}: ${activity.emailSubject}`,
          subtitle: `Activity log entry`,
          date: new Date(activity.timestamp || '').toLocaleDateString(),
          original: activity,
        });
      }
    });

    return matches.slice(0, 8); // Limit to top 8 overall
  }, [query, emails, activities, journalEntries]);

  // Handle keys
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const handleSelect = (result: SearchResult) => {
    onClose();
    if (result.type === 'email') navigate('/inbox');
    if (result.type === 'journal')
      navigate(`/journal?date=${result.original.start.toISOString().split('T')[0]}`);
    if (result.type === 'activity') navigate('/activity');
  };

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Search Input */}
            <div className="relative flex items-center p-4 border-b border-white/5">
              <Search className="absolute left-6 w-5 h-5 text-gray-500" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search emails, journal, or activity..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent pl-12 pr-4 py-2 text-lg text-white outline-none placeholder:text-gray-600"
              />
              <div className="absolute right-6 flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-gray-500 font-mono">
                ESC
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((result, idx) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        'w-full flex items-center gap-4 p-3 rounded-xl transition-all text-left group',
                        idx === selectedIndex
                          ? 'bg-orange-500 text-white'
                          : 'hover:bg-white/5 text-gray-400'
                      )}
                    >
                      <div
                        className={cn(
                          'p-2 rounded-lg shrink-0',
                          idx === selectedIndex ? 'bg-white/20' : 'bg-white/5'
                        )}
                      >
                        {result.type === 'email' && <Inbox className="w-4 h-4" />}
                        {result.type === 'activity' && <BarChart className="w-4 h-4" />}
                        {result.type === 'journal' && <NotebookPen className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={cn(
                              'text-sm font-bold truncate',
                              idx === selectedIndex ? 'text-white' : 'text-gray-200'
                            )}
                          >
                            {result.title}
                          </p>
                          <span
                            className={cn(
                              'text-[9px] uppercase tracking-widest font-black shrink-0',
                              idx === selectedIndex ? 'text-white/60' : 'text-gray-600'
                            )}
                          >
                            {result.type}
                          </span>
                        </div>
                        <p
                          className={cn(
                            'text-xs truncate',
                            idx === selectedIndex ? 'text-white/80' : 'text-gray-500'
                          )}
                        >
                          {result.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] font-mono opacity-60">{result.date}</span>
                        {idx === selectedIndex && (
                          <CornerDownLeft className="w-3.5 h-3.5 opacity-80" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : query ? (
                <div className="py-12 text-center text-gray-500 space-y-2">
                  <Command className="w-8 h-8 mx-auto opacity-20 mb-4" />
                  <p className="text-sm font-medium">No results found for "{query}"</p>
                  <p className="text-xs opacity-60">
                    Try searching for a different keyword or date.
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-600 mb-2 px-2">
                      Quick Commands
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Go to Dashboard', icon: LayoutDashboard, path: '/' },
                        { label: 'Triage Inbox', icon: Inbox, path: '/inbox' },
                        { label: 'Write Journal', icon: NotebookPen, path: '/journal' },
                        { label: 'View History', icon: BarChart, path: '/activity' },
                      ].map((cmd) => (
                        <button
                          key={cmd.path}
                          onClick={() => {
                            navigate(cmd.path);
                            onClose();
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-left transition-all"
                        >
                          <cmd.icon className="w-4 h-4 text-orange-500" />
                          <span className="text-xs font-medium text-gray-300">{cmd.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-white/5 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-600 font-medium">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Command className="w-3 h-3" /> Search
                </span>
                <span className="flex items-center gap-1">↑↓ Navigate</span>
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="w-3 h-3" /> Select
                </span>
              </div>
              <div>FlowMail Unified Search v1.0</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Icon for command
function LayoutDashboard(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="15" rx="1" />
    </svg>
  );
}
