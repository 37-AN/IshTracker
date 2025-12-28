import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';

interface HealthCardProps {
  title: string;
  score: number;
  rate: string;
  status: 'Optimal' | 'Warning' | 'Critical';
  icon: React.ReactNode;
  data: { time: string; value: number }[];
}

export function HealthCard({ title, score, rate, status, icon, data }: HealthCardProps) {
  const getStatusClasses = () => {
    switch (status) {
      case 'Critical':
        return {
          badge: 'bg-red-500 text-white',
          progress: 'bg-red-500',
          chartStroke: '#ef4444',
          chartFill: 'url(#colorRed)'
        };
      case 'Warning':
        return {
          badge: 'bg-yellow-500 text-white',
          progress: 'bg-yellow-500',
          chartStroke: '#f59e0b',
          chartFill: 'url(#colorYellow)'
        };
      case 'Optimal':
      default:
        return {
          badge: 'bg-green-500 text-white',
          progress: 'bg-green-500',
          chartStroke: '#22c55e',
          chartFill: 'url(#colorGreen)'
        };
    }
  };

  const { badge, progress, chartStroke, chartFill } = getStatusClasses();

  return (
    <Card className="bg-slate-800 text-white border-slate-700">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-700 rounded-lg">
              {icon}
            </div>
            <p className="text-sm text-slate-400 uppercase font-semibold">{title}</p>
          </div>
          <Badge className={badge}>{status}</Badge>
        </div>
        
        <div className="flex justify-between items-end mb-2">
          <span className="text-3xl font-bold">{score}%</span>
          <span className="text-sm text-slate-400">{rate}</span>
        </div>

        <Progress value={score} className="h-2 bg-slate-700" indicatorClassName={progress} />
        
        <div className="h-16 mt-4 -mx-4 -mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorYellow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={chartStroke} 
                fillOpacity={1} 
                fill={chartFill} 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}