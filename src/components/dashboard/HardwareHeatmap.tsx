import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Network, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface APStatus {
  id: string;
  name: string;
  latency: number; // in ms
  signal: number; // in dBm
  status: 'Optimal' | 'Warning' | 'Critical';
}

// Mock data for Access Points
const mockAPs: APStatus[] = [
  { id: 'ap-001', name: 'AP-Warehouse-01', latency: 25, signal: -50, status: 'Optimal' },
  { id: 'ap-002', name: 'AP-Warehouse-02', latency: 30, signal: -55, status: 'Optimal' },
  { id: 'ap-003', name: 'AP-Office-01', latency: 45, signal: -60, status: 'Warning' },
  { id: 'ap-004', name: 'AP-Factory-LineA', latency: 150, signal: -70, status: 'Critical' },
  { id: 'ap-005', name: 'AP-Factory-LineB', latency: 35, signal: -58, status: 'Optimal' },
  { id: 'ap-006', name: 'AP-Office-02', latency: 28, signal: -52, status: 'Optimal' },
  { id: 'ap-007', name: 'AP-Warehouse-03', latency: 60, signal: -68, status: 'Warning' },
  { id: 'ap-008', name: 'AP-QA-Lab', latency: 22, signal: -48, status: 'Optimal' },
  { id: 'ap-009', name: 'AP-Server-Room', latency: 18, signal: -45, status: 'Optimal' },
  { id: 'ap-010', name: 'AP-Guest-Lobby', latency: 55, signal: -62, status: 'Warning' },
];

export function HardwareHeatmap() {
  const getAPColor = (status: APStatus['status']) => {
    switch (status) {
      case 'Critical': return 'bg-red-600';
      case 'Warning': return 'bg-yellow-500';
      case 'Optimal': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="bg-slate-800 text-white border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="text-sm flex items-center gap-2">
          <Network className="w-4 h-4" /> Hardware Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-5 gap-2">
          <TooltipProvider>
            {mockAPs.map(ap => (
              <Tooltip key={ap.id}>
                <TooltipTrigger asChild>
                  <motion.div 
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold relative cursor-pointer ${getAPColor(ap.status)}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {ap.id.split('-')[2] || 'AP'}
                    {ap.status === 'Critical' && (
                      <AlertTriangle className="absolute -top-1 -right-1 w-4 h-4 text-white fill-current" />
                    )}
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-700 text-white border-slate-600">
                  <p className="font-bold">{ap.name}</p>
                  <p>Latency: {ap.latency}ms</p>
                  <p>Signal: {ap.signal}dBm</p>
                  <p>Status: {ap.status}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
