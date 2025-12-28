import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  score: number;
  rate: string;
  status: 'Optimal' | 'Warning' | 'Critical';
}

export function MetricCard({ title, icon, score, rate, status }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-slate-100 rounded-lg">{icon}</div>
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase font-semibold">{title}</p>
            <p className={`text-sm font-bold ${status === 'Critical' ? 'text-red-600' : 'text-green-600'}`}>{status}</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Health Score</span>
            <span className="font-bold">{score}%</span>
          </div>
          <Progress value={score} className={status === 'Critical' ? 'bg-red-100' : ''} />
          <p className="text-[10px] text-slate-400">Event Rate: {rate}</p>
        </div>
      </CardContent>
    </Card>
  );
}
