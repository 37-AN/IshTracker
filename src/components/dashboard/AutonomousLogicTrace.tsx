import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu } from 'lucide-react';
import { useAutonomousStore } from '@/store/useAutonomousStore'; // Import the Zustand store
import { motion, AnimatePresence } from 'framer-motion';

export function AutonomousLogicTrace() {
  const { lastResolutions } = useAutonomousStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Combined log entries for display, including mock data for initial context
  const mockLogEntries = [
    { id: 'mock-1', timestamp: '[14:20:01]', domain: 'MES', message: 'Production rate within limits.', color: 'text-green-400' },
    { id: 'mock-2', timestamp: '[14:20:05]', domain: 'SQL', message: 'Slow query detected (12s).', color: 'text-blue-400' },
    { id: 'mock-3', timestamp: '[14:20:06]', domain: 'AI', message: 'Analyzing rate... 2/min. Threshold: 5.', color: 'text-yellow-400' },
    { id: 'mock-4', timestamp: '[14:20:10]', domain: 'NET', message: 'AP-Warehouse-04 Offline. Rate: 10/min.', color: 'text-red-400' },
  ];

  const logEntries = [
    ...mockLogEntries,
    // Add real resolutions from store
    ...lastResolutions.map((res: any, index: number) => ({
      id: `res-${index}-${res.timestamp}`, // Unique ID for each resolution
      timestamp: `[${new Date(res.timestamp).toLocaleTimeString()}]`,
      domain: res.domain.toUpperCase(),
      message: `${res.action}: ${res.outcome} - ${res.trigger}`,
      color: res.outcome === 'SUCCESS' ? 'text-green-400' : 'text-red-400'
    }))
  ].sort((a, b) => a.timestamp.localeCompare(b.timestamp)); // Sort by timestamp, rudimentary for now

  useEffect(() => {
    // Scroll to bottom on new log entries
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logEntries]); // Re-run effect when logEntries change

  return (
    <Card className="bg-slate-900 text-slate-100 border-slate-800">
      <CardHeader className="border-b border-slate-800">
        <CardTitle className="text-sm flex items-center gap-2">
          <Cpu className="w-4 h-4" /> Logic Trace
        </CardTitle>
      </CardHeader>
      <CardContent ref={scrollRef} className="p-4 font-mono text-xs space-y-2 overflow-y-auto max-h-[300px]">
        <AnimatePresence initial={false}>
          {logEntries.map(entry => (
            <motion.p 
              key={entry.id} 
              className={entry.color}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {entry.timestamp} {entry.domain}: {entry.message}
            </motion.p>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}