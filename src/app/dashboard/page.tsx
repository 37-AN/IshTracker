import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Activity, Database, Network, Cpu, AlertTriangle } from 'lucide-react';
import { MetricCard } from "@/components/dashboard/MetricCard";

// Mock data for the Heuristic Engine's state
const oeeData = [
  { time: '10:00', oee: 85, target: 90 },
  { time: '11:00', oee: 78, target: 90 },
  { time: '12:00', oee: 92, target: 90 },
];

export default function AutonomousDashboard() {
  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      {/* Header: System Health Summary */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">System Sovereignty</h1>
        <div className="flex gap-4">
          <Badge variant="outline" className="bg-green-100 text-green-800">Coded AI: Active</Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800">Mode: Autonomous</Badge>
        </div>
      </div>

      {/* Row 1: Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          title="MES (TrakSYS)" 
          icon={<Activity className="w-5 h-5" />} 
          score={88} 
          rate="1.2 events/m"
          status="Optimal"
        />
        <MetricCard 
          title="SQL Database" 
          icon={<Database className="w-5 h-5" />} 
          score={94} 
          rate="0.4 events/m"
          status="Optimal"
        />
        <MetricCard 
          title="Network (APs)" 
          icon={<Network className="w-5 h-5" />} 
          score={42} 
          rate="8.5 events/m"
          status="Critical"
        />
      </div>

      {/* Row 2: Charts & Logic Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TrakSYS OEE Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">TrakSYS OEE Performance (Rate-Based)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={oeeData}>
                <defs>
                  <linearGradient id="colorOee" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="oee" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOee)" />
                <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Live Logic Trace (Terminal View) */}
        <Card className="bg-slate-900 text-slate-100">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Logic Trace
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 font-mono text-xs space-y-2 overflow-y-auto max-h-[300px]">
            <p className="text-green-400">[14:20:01] MES: Production rate within limits.</p>
            <p className="text-blue-400">[14:20:05] SQL: Slow query detected (12s).</p>
            <p className="text-yellow-400">[14:20:06] AI: Analyzing rate... 2/min. Threshold: 5.</p>
            <p className="text-red-400">[14:20:10] NET: AP-Warehouse-04 Offline. Rate: 10/min.</p>
            <p className="text-white font-bold bg-red-900/50 px-1">[14:20:11] ACTION: Triggering Port Reset on SW-01.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
