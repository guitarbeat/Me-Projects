import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Inbox, 
  BarChart, 
  NotebookPen, 
  ArrowRight, 
  Sparkles,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardActivityGrid } from '@/features/year-grid/components/DashboardActivityGrid';
import { loadJournalEvents } from '@/features/journal/lib/storage';
import { type Email } from '@shared/schema';

export default function DashboardPage() {
  // 1. Fetch Inbox Data
  const { data: emails = [] } = useQuery<Email[]>({
    queryKey: ['/api/emails/status/inbox'],
  });

  const { data: stats } = useQuery<{ total: number; unread: number; inbox: number }>({
    queryKey: ['/api/stats'],
  });

  // 2. Fetch Journal Data (Local)
  const journalEntries = useMemo(() => loadJournalEvents(), []);
  const todayEntry = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return journalEntries.find(e => e.start.toISOString().split('T')[0] === today);
  }, [journalEntries]);

  // 3. Derived Logic
  const highPriorityEmails = useMemo(() => 
    emails.filter(e => e.priority === 'high').slice(0, 3)
  , [emails]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-orange-500 mb-2"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold italic">Deepmind FlowMail</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-white"
          >
            {greeting}, <span className="text-white/40 italic">User</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 mt-2 text-sm"
          >
            You have {stats?.unread || 0} unread items in your focus flow today.
          </motion.p>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/5 border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 text-xs text-gray-400"
        >
          <Clock className="w-4 h-4 text-orange-500" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </motion.div>
      </header>

      {/* Main Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        
        {/* Inbox Widget */}
        <motion.div variants={item} className="lg:col-span-2 group">
          <div className="app-shell-panel h-full relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Inbox size={200} />
            </div>
            
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-500/10 p-2 rounded-xl">
                        <Inbox className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white tracking-wide">Inbox Focus</h3>
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Priority Triage</p>
                    </div>
                </div>
                <Link href="/inbox">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/5 gap-2">
                        View All <ArrowRight className="w-3 h-3" />
                    </Button>
                </Link>
            </div>

            <div className="flex-1 space-y-3">
                {highPriorityEmails.length > 0 ? (
                    highPriorityEmails.map(email => (
                        <div key={email.id} className="bg-white/5 border border-white/5 hover:border-white/10 p-4 rounded-2xl transition-all cursor-pointer group/item">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[10px] font-bold text-orange-500/80 uppercase tracking-widest leading-none">High Priority</span>
                                <span className="text-[10px] text-gray-600 font-mono">Real-time</span>
                            </div>
                            <h4 className="text-sm font-semibold text-white group-hover/item:text-orange-400 transition-colors">{email.subject}</h4>
                            <p className="text-xs text-gray-500 truncate mt-1">from {email.sender}</p>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500/20 mb-3" />
                        <p className="text-sm text-gray-500">Inbox Zero achieved for high priority.</p>
                        <p className="text-[10px] text-gray-600 uppercase mt-1 tracking-widest font-bold">Good work!</p>
                    </div>
                )}
            </div>
          </div>
        </motion.div>

        {/* Activity Mini-Grid */}
        <motion.div variants={item}>
          <div className="app-shell-panel h-full flex flex-col bg-gradient-to-b from-[#111] to-[#0a0a0a]">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/10 p-2 rounded-xl">
                    <BarChart className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                    <h3 className="font-bold text-white tracking-wide">Flow History</h3>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Consistency Log</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                <DashboardActivityGrid />
                <p className="text-[10px] text-gray-600 uppercase tracking-[0.2em] font-bold mt-4">Last 12 Weeks</p>
            </div>

            <Link href="/activity" className="mt-6">
                <Button className="w-full bg-white/5 hover:bg-orange-500 text-white border border-white/10 group transition-all duration-300">
                    Detailed Stats <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
            </Link>
          </div>
        </motion.div>

        {/* Journal Widget */}
        <motion.div variants={item} className="lg:col-span-3">
          <div className="app-shell-panel bg-[#161616] border-orange-500/10 border-t-2">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="bg-violet-500/10 p-3 rounded-2xl">
                        <NotebookPen className="w-6 h-6 text-violet-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-wide italic underline decoration-orange-500/30">Reflection Planner</h3>
                        <p className="text-sm text-gray-500 mt-1 max-w-md">Capture today's learnings and emotional peaks to close your daily loop.</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:block text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Entry Status</p>
                        <Badge variant={todayEntry ? "default" : "outline"} className={todayEntry ? "bg-emerald-500/20 text-emerald-400 mt-1" : "text-gray-600 mt-1"}>
                            {todayEntry ? 'Recorded Today' : 'Pending Entry'}
                        </Badge>
                    </div>
                    <Link href="/journal">
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 h-12 rounded-xl text-md font-bold shadow-lg shadow-orange-900/20">
                            {todayEntry ? 'View Entry' : 'Write Reflection'}
                        </Button>
                    </Link>
                </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
