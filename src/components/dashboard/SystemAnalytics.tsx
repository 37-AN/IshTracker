import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// Mock data (will eventually come from Zustand store)
const oeeData = [
  { time: '10:00', oee: 85, target: 90 },
  { time: '11:00', oee: 78, target: 90 },
  { time: '12:00', oee: 92, target: 90 },
  { time: '13:00', oee: 89, target: 90 },
  { time: '14:00', oee: 80, target: 90 },
  { time: '15:00', oee: 93, target: 90 },
  { time: '16:00', oee: 87, target: 90 },
];

export function SystemAnalytics() {
  return (
    <Card className="bg-slate-800 text-white border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <CardTitle className="text-sm font-medium">TrakSYS OEE Performance (Rate-Based)</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={oeeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOee" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" vertical={false} />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '0.5rem' }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Area type="monotone" dataKey="oee" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOee)" strokeWidth={2} />
            <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}